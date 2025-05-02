import React, { useEffect, useState } from 'react';
import './App.css';
import { NODE_CODE_MAP } from './nodes';

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

  useEffect(() => {
    const interval = setInterval(() => {
      const nodes = window.__flow_nodes || [];
      const edges = window.__flow_edges || [];

      const sortedNodes = getReachableSortedNodes(nodes, edges, START_NODE_ID);

      const codeLines = sortedNodes.map((n) => {
        return NODE_CODE_MAP[n.data.label] || `# Unknown: ${n.data.label}`;
      });

      const codeString = 
`import torch.nn as nn

class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
${codeLines.map((line) => '        ' + line).join('\n')}

    def forward(self, x):
        # Implement forward pass
        pass
`;

      setCode(codeString);
    }, 500); // Regenerate code every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="code-panel">
      <h3>Generated Code</h3>
      <pre>{code}</pre>
    </aside>
  );
}

export default CodePanel;
