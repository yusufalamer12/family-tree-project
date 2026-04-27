import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import 'reactflow/dist/style.css';

// الروابط الصحيحة من صورك
const SUPABASE_URL = 'https://gcafstpgbfamszspdezd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gdhRA9J_VG22F7CXQg7v9A_OxfQsG0i'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function FamilyTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data, error: apiError } = await supabase.from('members').select('*');
      if (apiError) throw apiError;

      if (data) {
        setNodes(data.map((m, i) => ({
          id: m.id.toString(),
          data: { ...m, label: m.first_name },
          position: { x: 250, y: i * 120 },
          style: { 
            background: !m.is_alive ? '#F2F4F4' : (m.gender === 'female' ? '#F9EBEA' : '#EBF5FB'),
            border: `1px solid ${!m.is_alive ? '#95A5A6' : (m.gender === 'female' ? '#E6B0AA' : '#AED6F1')}`,
            borderRadius: '8px', padding: '10px', width: 150, textAlign: 'center'
          }
        })));
        setEdges(data.filter(m => m.father_id).map(m => ({
          id: `e${m.father_id}-${m.id}`,
          source: m.father_id.toString(),
          target: m.id.toString(),
          animated: true
        })));
        setError(null);
      }
    } catch (err) {
      setError(`خطأ: ${err.message}`);
    }
  };

  const handleUpdate = async (field, value) => {
    const { error } = await supabase.from('members').update({ [field]: value }).eq('id', selectedMember.id);
    if (!error) {
      setSelectedMember({ ...selectedMember, [field]: value });
      fetchData();
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
      if (!error) fetchData();
    }
  };

  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#FBFCFC' }}>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={(e, n) => { setSelectedMember(n.data); setIsSidebarOpen(true); }} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {isSidebarOpen && selectedMember && (
        <div style={{ width: '300px', background: '#fff', borderLeft: '1px solid #ddd', padding: '20px', zIndex: 100 }}>
          <button onClick={() => setIsSidebarOpen(false)} style={{ float: 'right' }}>✕</button>
          <h3>{selectedMember.first_name}</h3>
          <hr />
          <div style={{ marginBottom: '15px' }}>
            <label>الاسم: </label>
            <input value={selectedMember.first_name} onChange={(e) => handleUpdate('first_name', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>الحالة: </label>
            <select value={selectedMember.is_alive} onChange={(e) => handleUpdate('is_alive', e.target.value === 'true')}>
              <option value="true">حي</option>
              <option value="false">متوفى</option>
            </select>
          </div>
          <button onClick={() => handleAdd('son')} style={{ width: '100%', marginBottom: '5px', backgroundColor: '#2E4053', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px' }}>+ إضافة ابن</button>
          <button onClick={() => handleAdd('brother')} style={{ width: '100%', backgroundColor: '#AED6F1', border: 'none', padding: '10px', borderRadius: '5px' }}>+ إضافة أخ</button>
          <button onClick={async () => { if(window.confirm("حذف؟")) { await supabase.from('members').delete().eq('id', selectedMember.id); setIsSidebarOpen(false); fetchData(); } }} style={{ width: '100%', marginTop: '20px', backgroundColor: '#FADBD8', color: '#C0392B', border: 'none', padding: '5px' }}>حذف</button>
        </div>
      )}
    </div>
  );
}
