import React, { useState } from 'react';
import './App.css';
import { MODEL_TYPES, getModelComponents } from './nodes';

function Sidebar() {
  const [modelType, setModelType] = useState(MODEL_TYPES.TRANSFORMER);
  const components = getModelComponents(modelType);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
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
      <div className="components">
        <h3>Components</h3>
        {Object.entries(components).map(([name, { description }]) => (
          <div
            key={name}
            className="component"
            draggable
            onDragStart={(event) => onDragStart(event, name)}
          >
            <div className="component-name">{name}</div>
            <div className="component-description">{description}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
