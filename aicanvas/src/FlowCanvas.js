import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

const START_NODE_ID = 'start-node';

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const { project, setViewport } = useReactFlow();

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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: uuidv4(),
        type: 'default',
        position,
        data: { label: type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  useEffect(() => {
    const handleDelete = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes((nds) => nds.filter((n) => !n.selected || n.id === START_NODE_ID));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    };
    document.addEventListener('keydown', handleDelete);
    return () => document.removeEventListener('keydown', handleDelete);
  }, [setNodes, setEdges]);

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
        fitView
      />
    </div>
  );
}

export default FlowCanvas;
