import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import 'reactflow/dist/style.css';

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
          position: { x: 250, y: i * 150 },
          style: { 
            background: !m.is_alive ? '#F2F4F4' : (m.gender === 'female' ? '#F9EBEA' : '#EBF5FB'),
            border: `2px solid ${!m.is_alive ? '#95A5A6' : (m.gender === 'female' ? '#E6B0AA' : '#AED6F1')}`,
            borderRadius: '10px', padding: '12px', width: 160, textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }
        })));
        setEdges(data.filter(m => m.father_id).map(m => ({
          id: `e${m.father_id}-${m.id}`,
          source: m.father_id.toString(),
          target: m.id.toString(),
          animated: true,
          style: { stroke: '#BDC3C7', strokeWidth: 2 }
        })));
      }
    } catch (err) { setError(`خطأ: ${err.message}`); }
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
        last_name: 'العامر', // قيمة افتراضية
        father_id: fatherId,
        gender: 'male',
        is_alive: true
      }]);
      if (!error) fetchData();
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' };
  const labelStyle = { fontSize: '12px', color: '#7F8C8D', fontWeight: 'bold', display: 'block', marginTop: '15px' };

  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#FBFCFC', direction: 'rtl' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={(e, n) => { setSelectedMember(n.data); setIsSidebarOpen(true); }} fitView>
          <Background color="#F4F6F7" />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {isSidebarOpen && selectedMember && (
        <div style={{ width: '380px', background: '#fff', borderRight: '1px solid #ddd', padding: '25px', zLayer: 1000, overflowY: 'auto', boxShadow: '2px 0 15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#2E4053' }}>تفاصيل العضو</h2>
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
          </div>

          <label style={labelStyle}>الاسم الأول</label>
          <input style={inputStyle} value={selectedMember.first_name || ''} onChange={(e) => handleUpdate('first_name', e.target.value)} />

          <label style={labelStyle}>اسم العائلة</label>
          <input style={inputStyle} value={selectedMember.last_name || ''} onChange={(e) => handleUpdate('last_name', e.target.value)} />

          <label style={labelStyle}>الجنس</label>
          <select style={inputStyle} value={selectedMember.gender || 'male'} onChange={(e) => handleUpdate('gender', e.target.value)}>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>

          <label style={labelStyle}>الحالة</label>
          <select style={inputStyle} value={selectedMember.is_alive} onChange={(e) => handleUpdate('is_alive', e.target.value === 'true')}>
            <option value="true">حي</option>
            <option value="false">متوفى</option>
          </select>

          <label style={labelStyle}>تاريخ الميلاد</label>
          <input type="date" style={inputStyle} value={selectedMember.birth_date || ''} onChange={(e) => handleUpdate('birth_date', e.target.value)} />

          <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => handleAdd('son')} style={{ padding: '12px', backgroundColor: '#2E4053', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ إضافة ابن</button>
            <button onClick={() => handleAdd('brother')} style={{ padding: '12px', backgroundColor: '#AED6F1', color: '#2E4053', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ إضافة أخ</button>
          </div>

          <button onClick={async () => { if(window.confirm("هل أنت متأكد من الحذف؟")) { await supabase.from('members').delete().eq('id', selectedMember.id); setIsSidebarOpen(false); fetchData(); } }} 
                  style={{ width: '100%', marginTop: '40px', backgroundColor: '#FADBD8', color: '#C0392B', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            حذف السجل نهائياً
          </button>
        </div>
      )}
    </div>
  );
}
