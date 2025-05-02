import React from 'react';
import './App.css';
import Sidebar from './Sidebar';
import FlowCanvas from './FlowCanvas';
import CodePanel from './CodePanel';
import { ReactFlowProvider } from 'reactflow';

function App() {
  return (
    <ReactFlowProvider>
      <div className="app">
        <Sidebar />
        <FlowCanvas />
        <CodePanel />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
