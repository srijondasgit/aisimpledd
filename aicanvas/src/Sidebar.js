import React from 'react';
import './App.css';
import { nodeTypes } from './nodes';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h3>AI Node Types</h3>
      {nodeTypes.map((type) => (
        <div
          key={type}
          className="dndnode"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('application/reactflow', type);
            event.dataTransfer.effectAllowed = 'move';
          }}
        >
          {type}
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
