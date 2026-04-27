import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import 'reactflow/dist/style.css';

// تأكد أن هذه الروابط صحيحة 100%
const SUPABASE_URL = 'https://gcafstpgbfamszspdezd.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_gdhRA9J_VG22F7CXQg7v9A_OxfQsG0i'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function FamilyTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const { data, error: supabaseError } = await supabase.from('members').select('*');
      
      if (supabaseError) throw supabaseError;

      if (data && data.length > 0) {
        setNodes(data.map((m, i) => ({
          id: m.id.toString(),
          data: { ...m, label: m.first_name },
          position: { x: 250, y: i * 150 },
          style: { 
            background: !m.is_alive ? '#F2F4F4' : (m.gender === 'female' ? '#F9EBEA' : '#EBF5FB'),
            border: `1px solid ${!m.is_alive ? '#95A5A6' : (m.gender === 'female' ? '#E6B0AA' : '#AED6F1')}`,
            borderRadius: '8px', padding: '10px', width: 140, textAlign: 'center'
          }
        })));

        setEdges(data.filter(m => m.father_id).map(m => ({
          id: `e${m.father_id}-${m.id}`,
          source: m.father_id.toString(),
          target: m.id.toString(),
          animated: true
        })));
      } else {
        // إذا لم يجد بيانات، نضع رسالة تنبيه
        setError("لا توجد بيانات في الجدول، يرجى إضافة 'عامر' من Supabase أولاً");
      }
    } catch (err) {
      setError("خطأ في الاتصال بقاعدة البيانات: " + err.message);
    }
  };

  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#FBFCFC' }}>
      <div style={{ flex: 1 }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodeClick={(e, node) => { setSelectedMember(node.data); setIsSidebarOpen(true); }}
          fitView
        >
          <Background color="#F4F6F7" />
          <Controls />
        </ReactFlow>
      </div>

      {isSidebarOpen && selectedMember && (
        <div style={{ width: '350px', background: '#fff', borderLeft: '1px solid #ddd', padding: '20px', zIndex: 1000 }}>
          <button onClick={() => setIsSidebarOpen(false)} style={{ float: 'left' }}>✕</button>
          <h3>تعديل: {selectedMember.first_name}</h3>
          <hr />
          <button onClick={async () => {
             const name = prompt("اسم الابن:");
             if(name) {
               await supabase.from('members').insert([{ id: Date.now().toString(), first_name: name, father_id: selectedMember.id, gender: 'male', is_alive: true }]);
               fetchFamilyData();
             }
          }} style={{ width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: '#2E4053', color: '#fff', border: 'none', borderRadius: '5px' }}>
            + إضافة ابن
          </button>
          {/* زر إضافة أخ */}
          <button onClick={async () => {
             if(!selectedMember.father_id) return alert("لا يمكن إضافة أخ لرأس الشجرة");
             const name = prompt("اسم الأخ:");
             if(name) {
               await supabase.from('members').insert([{ id: Date.now().toString(), first_name: name, father_id: selectedMember.father_id, gender: 'male', is_alive: true }]);
               fetchFamilyData();
             }
          }} style={{ width: '100%', padding: '10px', backgroundColor: '#AED6F1', border: 'none', borderRadius: '5px' }}>
            + إضافة أخ
          </button>
        </div>
      )}
    </div>
  );
}
