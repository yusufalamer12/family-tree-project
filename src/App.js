import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import 'reactflow/dist/style.css';

// بيانات الربط الخاصة بك
const SUPABASE_URL = 'https://gcafstpgbfamszspdezd.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_gdhRA9J_VG22F7CXQg7v9A_OxfQsG0i'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function FamilyTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // جلب البيانات من Supabase عند تشغيل الموقع
  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    const { data, error } = await supabase.from('family_members').select('*');
    if (error) {
      console.error('Error fetching:', error);
      return;
    }

    if (data) {
      const newNodes = data.map((member, index) => ({
        id: member.id.toString(),
        data: { label: member.name },
        // توزيع بسيط للعقد، يمكن تحسينه لاحقاً
        position: { x: 250, y: index * 100 + 50 }, 
        style: { background: '#fff', border: '1px solid #222', borderRadius: '5px', width: 150 }
      }));

      const newEdges = data
        .filter(member => member.parent_id)
        .map(member => ({
          id: `e${member.parent_id}-${member.id}`,
          source: member.parent_id.toString(),
          target: member.id.toString(),
          animated: true,
          style: { stroke: '#222' }
        }));

      setNodes(newNodes);
      setEdges(newEdges);
    }
  };

  const onNodeClick = async (event, node) => {
    const childName = prompt(`أدخل اسم ابن لـ ${node.data.label}:`);
    if (childName) {
      const { data, error } = await supabase
        .from('family_members')
        .insert([{ name: childName, parent_id: node.id }])
        .select();

      if (error) {
        alert('حدث خطأ أثناء الحفظ، تأكد من إعدادات الجدول في Supabase');
      } else {
        fetchFamilyData(); // تحديث الشجرة فوراً
      }
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#f9f9f9' }}>
      <header style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>شجرة عائلة العامر</h1>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>اضغط على أي اسم لإضافة فرع جديد</p>
      </header>
      <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
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
