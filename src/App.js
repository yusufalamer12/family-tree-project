import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
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
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newNode, setNewNode] = useState({ first_name: '', gender: 'male', is_alive: true, father_id: null });

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

  const startAdding = (type) => {
    setNewNode({ 
      first_name: '', 
      gender: 'male', 
      is_alive: true, 
      father_id: type === 'son' ? selectedMember.id : selectedMember.father_id,
      country: 'المملكة العربية السعودية',
      city: 'الخبر'
    });
    setIsAddingMode(true);
  };

  const saveNewMember = async () => {
    if (!newNode.first_name) return alert("يرجى كتابة الاسم");
    const { error } = await supabase.from('members').insert([{ ...newNode, id: Date.now().toString() }]);
    if (!error) {
      setIsAddingMode(false);
      fetchData();
    }
  };

  const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' };
  const labelStyle = { fontSize: '11px', color: '#7F8C8D', display: 'block', marginTop: '12px', fontWeight: 'bold' };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', direction: 'rtl', backgroundColor: '#FBFCFC' }}>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={(e, n) => { setSelectedMember(n.data); setIsSidebarOpen(true); setIsAddingMode(false); }} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {isSidebarOpen && selectedMember && (
        <div style={{ width: '380px', background: '#fff', borderRight: '1px solid #ddd', padding: '20px', zIndex: 100, overflowY: 'auto' }}>
          
          {!isAddingMode ? (
            /* لير التعديل */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>تعديل: {selectedMember.first_name}</h3>
                <button onClick={() => setIsSidebarOpen(false)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>

              <label style={labelStyle}>الاسم الأول</label>
              <input style={inputStyle} value={selectedMember.first_name || ''} onChange={(e) => handleUpdate('first_name', e.target.value)} />

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

              <label style={labelStyle}>رقم الجوال</label>
              <input style={inputStyle} value={selectedMember.phone_number || ''} onChange={(e) => handleUpdate('phone_number', e.target.value)} />

              <hr style={{ margin: '25px 0' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => startAdding('son')} style={{ padding: '12px', backgroundColor: '#2E4053', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ إضافة ابن</button>
                <button onClick={() => startAdding('brother')} style={{ padding: '12px', backgroundColor: '#AED6F1', color: '#2E4053', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ إضافة أخ</button>
              </div>
            </>
          ) : (
            /* لير الإضافة */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>إضافة فرد جديد</h3>
                <button onClick={() => setIsAddingMode(false)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>رجوع</button>
              </div>
              
              <label style={labelStyle}>الاسم الأول</label>
              <input style={inputStyle} placeholder="أدخل الاسم" onChange={(e) => setNewNode({...newNode, first_name: e.target.value})} />

              <label style={labelStyle}>الجنس</label>
              <select style={inputStyle} onChange={(e) => setNewNode({...newNode, gender: e.target.value})}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>

              <button onClick={saveNewMember} style={{ width: '100%', marginTop: '25px', padding: '12px', backgroundColor: '#28B463', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ البيانات</button>
              <button onClick={() => setIsAddingMode(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>إلغاء</button>
            </>
          )}

          <button onClick={async () => { if(window.confirm("حذف؟")) { await supabase.from('members').delete().eq('id', selectedMember.id); setIsSidebarOpen(false); fetchData(); } }}
            style={{ width: '100%', marginTop: '40px', color: '#C0392B', border: '1px solid #C0392B', padding: '10px', borderRadius: '6px', background: 'none' }}>
            حذف نهائي
          </button>
        </div>
      )}
    </div>
  );
}
