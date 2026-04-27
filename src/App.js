import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import 'reactflow/dist/style.css';

const SUPABASE_URL = 'https://gcafstpgbfamszspdezd.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_gdhRA9J_VG22F7CXQg7v9A_OxfQsG0i'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function FamilyTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { fetchFamilyData(); }, []);

  const fetchFamilyData = async () => {
    const { data } = await supabase.from('members').select('*');
    if (data) {
      setNodes(data.map((m, i) => ({
        id: m.id.toString(),
        data: { ...m, label: m.first_name },
        position: { x: 250, y: i * 100 },
        style: { 
          background: !m.is_alive ? '#F2F4F4' : (m.gender === 'female' ? '#F9EBEA' : '#EBF5FB'),
          border: `1px solid ${!m.is_alive ? '#95A5A6' : (m.gender === 'female' ? '#E6B0AA' : '#AED6F1')}`,
          borderRadius: '8px', padding: '10px', width: 140, textAlign: 'center'
        }
      })));
      setEdges(data.filter(m => m.father_id).map(m => ({
        id: `e${m.father_id}-${m.id}`, source: m.father_id.toString(), target: m.id.toString(), animated: true
      })));
    }
  };

  const onNodeClick = (event, node) => {
    setSelectedMember(node.data);
    setIsSidebarOpen(true);
  };

  const handleUpdate = async (field, value) => {
    const { error } = await supabase.from('members').update({ [field]: value }).eq('id', selectedMember.id);
    if (!error) {
      setSelectedMember({ ...selectedMember, [field]: value });
      fetchFamilyData();
    }
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      await supabase.from('members').delete().eq('id', selectedMember.id);
      setIsSidebarOpen(false);
      fetchFamilyData();
    }
  };

  const handleAdd = async (type) => {
    const name = prompt(`أدخل اسم ال${type === 'son' ? 'ابن' : 'أخ'}:`);
    if (name) {
      const fatherId = type === 'son' ? selectedMember.id : selectedMember.father_id;
      const { error } = await supabase.from('members').insert([{
        id: Date.now().toString(),
        first_name: name,
        father_id: fatherId,
        gender: 'male',
        is_alive: true
      }]);
      if (!error) fetchFamilyData();
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', backgroundColor: '#FBFCFC' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView>
          <Background color="#F4F6F7" />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {isSidebarOpen && selectedMember && (
        <div style={{ width: '350px', backgroundColor: '#fff', borderLeft: '1px solid #ddd', padding: '25px', boxShadow: '-2px 0 10px rgba(0,0,0,0.05)', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>تعديل البيانات</h3>
            <button onClick={() => setIsSidebarOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>الاسم الأول</label>
            <input 
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
              value={selectedMember.first_name} 
              onChange={(e) => handleUpdate('first_name', e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>الجنس</label>
            <select 
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
              value={selectedMember.gender} 
              onChange={(e) => handleUpdate('gender', e.target.value)}
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>الحالة</label>
            <select 
              style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
              value={selectedMember.is_alive} 
              onChange={(e) => handleUpdate('is_alive', e.target.value === 'true')}
            >
              <option value="true">حي</option>
              <option value="false">متوفى</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => handleAdd('son')} style={{ padding: '10px', backgroundColor: '#2E4053', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ إضافة ابن</button>
            <button onClick={() => handleAdd('brother')} style={{ padding: '10px', backgroundColor: '#AED6F1', color: '#2E4053', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ إضافة أخ</button>
          </div>

          <button onClick={handleDelete} style={{ marginTop: 'auto', padding: '10px', backgroundColor: '#FADBD8', color: '#C0392B', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>حذف السجل</button>
        </div>
      )}
    </div>
  );
}
