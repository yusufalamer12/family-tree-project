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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('members').select('*');
    if (data) {
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
        id: `e${m.father_id}-${m.id}`, source: m.father_id.toString(), target: m.id.toString(), animated: true
      })));
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
    const name = prompt(`أدخل الاسم الأول:`);
    if (name) {
      const fatherId = type === 'son' ? selectedMember.id : selectedMember.father_id;
      const { error } = await supabase.from('members').insert([{
        id: Date.now().toString(),
        first_name: name,
        father_id: fatherId,
        gender: 'male',
        is_alive: true,
        country: 'المملكة العربية السعودية',
        city: 'الخبر'
      }]);
      if (!error) fetchData();
    }
  };

  const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' };
  const labelStyle = { fontSize: '11px', color: '#7F8C8D', display: 'block', marginTop: '12px', fontWeight: 'bold' };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', direction: 'rtl', backgroundColor: '#FBFCFC' }}>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={(e, n) => { setSelectedMember(n.data); setIsSidebarOpen(true); }} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {isSidebarOpen && selectedMember && (
        <div style={{ width: '380px', background: '#fff', borderRight: '1px solid #ddd', padding: '20px', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{selectedMember.first_name}</h3>
            <button onClick={() => setIsSidebarOpen(false)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
          </div>

          <label style={labelStyle}>الاسم الأول</label>
          <input style={inputStyle} value={selectedMember.first_name || ''} onChange={(e) => handleUpdate('first_name', e.target.value)} />

          <label style={labelStyle}>الدولة (country)</label>
          <input style={inputStyle} value={selectedMember.country || ''} onChange={(e) => handleUpdate('country', e.target.value)} />

          <label style={labelStyle}>المدينة (city)</label>
          <input style={inputStyle} value={selectedMember.city || ''} onChange={(e) => handleUpdate('city', e.target.value)} />

          <label style={labelStyle}>الجنس</label>
          <select style={inputStyle} value={selectedMember.gender || 'male'} onChange={(e) => handleUpdate('gender', e.target.value)}>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>

          <label style={labelStyle}>على قيد الحياة</label>
          <select style={inputStyle} value={selectedMember.is_alive} onChange={(e) => handleUpdate('is_alive', e.target.value === 'true')}>
            <option value="true">نعم</option>
            <option value="false">لا (متوفى)</option>
          </select>

          <label style={labelStyle}>رقم الهوية الوطنية</label>
          <input style={inputStyle} value={selectedMember.national_id || ''} onChange={(e) => handleUpdate('national_id', e.target.value)} />

          <label style={labelStyle}>العنوان الوطني المختصر</label>
          <input style={inputStyle} value={selectedMember.national_address_short || ''} onChange={(e) => handleUpdate('national_address_short', e.target.value)} />

          <label style={labelStyle}>رقم الجوال</label>
          <input style={inputStyle} value={selectedMember.phone_number || ''} onChange={(e) => handleUpdate('phone_number', e.target.value)} />

          <label style={labelStyle}>رابط الصورة (photo_url)</label>
          <input style={inputStyle} value={selectedMember.photo_url || ''} onChange={(e) => handleUpdate('photo_url', e.target.value)} />

          <hr style={{ margin: '25px 0' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => handleAdd('son')} style={{ padding: '12px', backgroundColor: '#2E4053', color: '#fff', border: 'none', borderRadius: '6px' }}>+ إضافة ابن</button>
            <button onClick={() => handleAdd('brother')} style={{ padding: '12px', backgroundColor: '#AED6F1', border: 'none', borderRadius: '6px' }}>+ إضافة أخ</button>
          </div>

          <button onClick={async () => { if(window.confirm("حذف؟")) { await supabase.from('members').delete().eq('id', selectedMember.id); setIsSidebarOpen(false); fetchData(); } }}
            style={{ width: '100%', marginTop: '30px', color: '#C0392B', border: '1px solid #C0392B', padding: '10px', borderRadius: '6px' }}>
            حذف نهائي
          </button>
        </div>
      )}
    </div>
  );
}
