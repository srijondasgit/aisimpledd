import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { 
  getComponentDependencies, 
  isComponentRequired, 
  mustBeFirst,
  getComponentOrder,
  allowMultiple,
  getComponentDefaultValues
} from './nodes';

const START_NODE_ID = 'start-node';

// Custom node component to display parameters
const CustomNode = ({ data, id }) => {
  const [parameters, setParameters] = useState(data.parameters || {});

  const handleParameterChange = (key, value) => {
    // Convert to number and ensure it's not NaN
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      const newParameters = { ...parameters, [key]: numValue };
      setParameters(newParameters);
      data.parameters = newParameters; // Update the node data directly
    }
  };

  return (
    <div style={{ 
      padding: '8px 12px', 
      background: 'white', 
      border: '1px solid #ddd', 
      borderRadius: 5,
      width: '200px',
      boxSizing: 'border-box',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <Handle type="target" position="top" />
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '4px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px',
        width: '100%',
        color: '#333'
      }}>
        {data.label}
      </div>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        fontSize: '11px', 
        color: '#666',
        maxHeight: '80px',
        overflowY: 'auto',
        paddingRight: '2px',
        width: '100%'
      }}>
        {parameters && Object.entries(parameters).map(([key, value]) => (
          <div key={key} style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '4px',
            width: '100%',
            minWidth: 0
          }}>
            <span style={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: '1 1 0%',
              minWidth: 0
            }}>
              {key}:
            </span>
            <input
              type="number"
              value={value}
              onChange={(e) => handleParameterChange(key, e.target.value)}
              onKeyDown={(e) => {
                // Prevent non-numeric input
                if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                  e.preventDefault();
                }
              }}
              min="0"
              step="1"
              style={{ 
                width: '60px',
                padding: '2px 4px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '11px',
                textAlign: 'right'
              }}
            />
          </div>
        ))}
      </div>
      <Handle type="source" position="bottom" />
    </div>
  );
};

const nodeTypes = {
  default: CustomNode,
};

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const { project, setViewport } = useReactFlow();
  const [modelType, setModelType] = useState('Transformer');

  // Initialize with Start node
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: START_NODE_ID,
      type: 'input',
      data: { label: 'Start' },
      position: { x: 100, y: 100 },
      deletable: false,
      draggable: false,
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Expose globally for CodePanel
  window.__flow_nodes = nodes;
  window.__flow_edges = edges;
  window.__model_type = modelType;

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      // Special case: allow connection from Start node to Tokenization
      if (sourceNode.id === START_NODE_ID && mustBeFirst(modelType, targetNode.data.label)) {
        setEdges((eds) => addEdge(params, eds));
        return;
      }

      // Check if the connection is valid based on dependencies
      const dependencies = getComponentDependencies(modelType, targetNode.data.label);
      if (!dependencies.includes(sourceNode.data.label)) {
        alert(`Invalid connection: ${targetNode.data.label} requires ${dependencies.join(' or ')}`);
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, nodes, modelType]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Check if component must be first and if there are already nodes
      if (mustBeFirst(modelType, type) && nodes.length > 1) {
        alert(`${type} must be the first component after the Start node`);
        return;
      }

      // Check if component is required and already exists, but only if it doesn't allow multiple instances
      if (isComponentRequired(modelType, type) && 
          !allowMultiple(modelType, type) &&
          nodes.some(n => n.data.label === type)) {
        alert(`${type} is already added and is required only once`);
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: uuidv4(),
        type: 'default',
        position,
        data: { 
          label: type,
          parameters: getComponentDefaultValues(modelType, type)
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes, nodes, modelType]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Validate the graph structure
  const validateGraph = useCallback(() => {
    const errors = [];
    const componentOrder = getComponentOrder(modelType);
    const nodeLabels = nodes.map(n => n.data.label).filter(l => l !== 'Start');
    
    // Check if all required components are present
    componentOrder.forEach(component => {
      if (isComponentRequired(modelType, component) && !nodeLabels.includes(component)) {
        errors.push(`Missing required component: ${component}`);
      }
    });

    // Check if components are in correct order
    const nodeOrder = nodeLabels.map(label => componentOrder.indexOf(label));
    if (nodeOrder.some((order, i) => i > 0 && order < nodeOrder[i - 1])) {
      errors.push('Components are not in the correct order');
    }

    return errors;
  }, [nodes, modelType]);

  useEffect(() => {
    const handleDelete = (e) => {
      // Ignore if the event target is an input field
      if (e.target.tagName === 'INPUT') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only prevent deletion of the Start node
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0) {
          e.preventDefault(); // Prevent default backspace behavior
          setNodes((nds) => nds.filter((n) => !n.selected || n.id === START_NODE_ID));
          setEdges((eds) => eds.filter((e) => !e.selected));
        }
      }
    };
    document.addEventListener('keydown', handleDelete);
    return () => document.removeEventListener('keydown', handleDelete);
  }, [setNodes, setEdges, nodes]);

  // Validate graph periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const errors = validateGraph();
      if (errors.length > 0) {
        console.warn('Graph validation errors:', errors);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [validateGraph]);

  return (
    <div className="reactflow-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default FlowCanvas;
