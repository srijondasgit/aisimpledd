import React, { useEffect, useState } from 'react';
import './App.css';
import { MODEL_TYPES, getModelComponents, getComponentCode } from './nodes';

const START_NODE_ID = 'start-node';

// ✅ Traverse only nodes connected from the Start node
function getReachableSortedNodes(nodes, edges, startId) {
  const graph = {};
  const inDegree = {};

  nodes.forEach((n) => {
    graph[n.id] = [];
    inDegree[n.id] = 0;
  });

  edges.forEach(({ source, target }) => {
    graph[source].push(target);
    inDegree[target]++;
  });

  // Step 1: Get reachable nodes via BFS
  const visited = new Set();
  const queue = [startId];
  while (queue.length) {
    const current = queue.shift();
    visited.add(current);
    for (const neighbor of graph[current]) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  // Step 2: Topological sort on reachable nodes
  const reachableInDegree = {};
  const reachableGraph = {};

  for (const nodeId of visited) {
    reachableGraph[nodeId] = graph[nodeId].filter((t) => visited.has(t));
    reachableInDegree[nodeId] = 0;
  }

  for (const [source, targets] of Object.entries(reachableGraph)) {
    for (const target of targets) {
      reachableInDegree[target]++;
    }
  }

  const queue2 = Object.keys(reachableInDegree).filter((id) => reachableInDegree[id] === 0);
  const sorted = [];

  while (queue2.length) {
    const current = queue2.shift();
    sorted.push(current);
    for (const neighbor of reachableGraph[current]) {
      reachableInDegree[neighbor]--;
      if (reachableInDegree[neighbor] === 0) {
        queue2.push(neighbor);
      }
    }
  }

  return sorted
    .filter((id) => id !== startId) // Exclude start node
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean);
}

function CodePanel() {
  const [code, setCode] = useState('');
  const [modelType, setModelType] = useState(MODEL_TYPES.TRANSFORMER);

  useEffect(() => {
    const interval = setInterval(() => {
      const nodes = window.__flow_nodes || [];
      const edges = window.__flow_edges || [];

      const sortedNodes = getReachableSortedNodes(nodes, edges, START_NODE_ID);

      const codeLines = sortedNodes.map((n) => {
        return getComponentCode(modelType, n.data.label);
      });

      // Generate model-specific code template
      let codeTemplate = '';
      switch (modelType) {
        case MODEL_TYPES.TRANSFORMER:
          codeTemplate = 
`import torch.nn as nn
from transformers import AutoTokenizer

class TransformerModel(nn.Module):
    def __init__(self, vocab_size, embed_dim, num_heads, hidden_dim):
        super().__init__()
${codeLines.map((line) => '        ' + line).join('\n')}

    def forward(self, x):
        # Implement transformer forward pass
        pass
`;
          break;
        case MODEL_TYPES.PERFORMER:
          codeTemplate = 
`import torch.nn as nn
from performer_pytorch import PerformerAttention

class PerformerModel(nn.Module):
    def __init__(self, vocab_size, embed_dim, num_heads, hidden_dim):
        super().__init__()
${codeLines.map((line) => '        ' + line).join('\n')}

    def forward(self, x):
        # Implement performer forward pass
        pass
`;
          break;
        case MODEL_TYPES.BERT:
          codeTemplate = 
`from transformers import BertModel, BertConfig
import torch.nn as nn

class CustomBertModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
${codeLines.map((line) => '        ' + line).join('\n')}

    def forward(self, input_ids, attention_mask=None, token_type_ids=None):
        # Implement BERT forward pass
        pass
`;
          break;
        case MODEL_TYPES.GPT:
          codeTemplate = 
`import torch.nn as nn
from transformers import GPT2Config

class CustomGPTModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
${codeLines.map((line) => '        ' + line).join('\n')}

    def forward(self, input_ids, attention_mask=None):
        # Implement GPT forward pass
        pass
`;
          break;
        default:
          codeTemplate = 
`import torch.nn as nn

class CustomModel(nn.Module):
    def __init__(self):
        super().__init__()
${codeLines.map((line) => '        ' + line).join('\n')}

    def forward(self, x):
        # Implement custom forward pass
        pass
`;
      }

      setCode(codeTemplate);
    }, 500); // Regenerate code every 500ms

    return () => clearInterval(interval);
  }, [modelType]);

  return (
    <aside className="code-panel">
      <div className="model-type-selector">
        <h3>Model Type</h3>
        <select 
          value={modelType} 
          onChange={(e) => setModelType(e.target.value)}
        >
          {Object.values(MODEL_TYPES).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <h3>Generated Code</h3>
      <pre>{code}</pre>
    </aside>
  );
}

export default CodePanel;
