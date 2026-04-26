import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

// البداية من "عامر" كأصل للشجرة
const initialNodes = [
  { 
    id: '1', 
    data: { label: 'عامر' }, 
    position: { x: 250, y: 5 }, 
    style: { background: '#fff', color: '#333', border: '2px solid #222', borderRadius: '8px', width: 150, fontWeight: 'bold' }
  },
];

const initialEdges = [];

export default function FamilyTree() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodeClick = (event, node) => {
    const childName = prompt(`أدخل اسم ابن لـ ${node.data.label}:`);
    
    if (childName) {
      const newNodeId = (nodes.length + 1).toString();
      const newNode = {
        id: newNodeId,
        data: { label: childName },
        position: { x: node.position.x, y: node.position.y + 100 },
        style: { background: '#fff', color: '#333', border: '1px solid #222', borderRadius: '5px', width: 150 }
      };

      const newEdge = {
        id: `e${node.id}-${newNodeId}`,
        source: node.id,
        target: newNodeId,
        animated: true,
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) => eds.concat(newEdge));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#f9f9f9' }}>
      <header style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontWeight: '300' }}>شجرة عائلة العامر</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>اضغط على الاسم لإضافة الأبناء</p>
      </header>
      <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
