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
  const [isAddingMode, setIsAddingMode] = useState(false);
  
  // حالة العضو الجديد (تشمل كل الخانات)
  const [formData, setFormData] = useState({});

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
          border: `2px solid ${!m.is_alive ? '#95A5A6' : (m.gender === 'female' ? '#E6B0AA' : '#AED6F1')}`,
          borderRadius: '10px', padding: '10px', width: 150, textAlign: 'center'
        }
      })));
      setEdges(data.filter(m => m.father_id).map(m => ({
        id: `e${m.father_id}-${m.id}`, source: m.father_id.toString(), target: m.id.toString(), animated: true
      })));
    }
  };

  const openEdit = (member) => {
    setFormData(member);
    setSelectedMember(member);
    setIsAddingMode(false);
    setIsSidebarOpen(true);
  };

  const startAdding = (type) => {
    const freshData = {
      id: Date.now().toString(),
      first_name: '',
      father_id: type === 'son' ? selectedMember.id : selectedMember.father_id,
      gender: 'male',
      is_alive: true,
      country: 'المملكة العربية السعودية',
      city: 'الخبر',
      national_id: '',
      national_address_short: '',
      phone_number: '',
      photo_url: '',
      spouse_id: null
    };
    setFormData(freshData);
    setIsAddingMode(true);
    setIsSidebarOpen(true);
  };

  const handleSave = async () => {
    if (!formData.first_name) return alert("يرجى كتابة الاسم الأول");
    
    let result;
    if (isAddingMode) {
      result = await supabase.from('members').insert([formData]);
    } else {
      result = await supabase.from('members').update(formData).eq('id', formData.id);
    }

    if (!result.error) {
      setIsSidebarOpen(false);
      fetchData();
    } else {
      alert("خطأ أثناء الحفظ: " + result.error.message);
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '11px', color: '#7F8C8D', display: 'block', marginTop: '15px', fontWeight: 'bold' };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', direction: 'rtl', backgroundColor: '#FBFCFC', fontFamily: 'sans-serif' }}>
      <div style={{ flex: 1 }}>
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={(e, n) => openEdit(n.data)} fitView>
          <Background color="#F4F6F7" />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {isSidebarOpen && (
        <div style={{ width: '400px', background: '#fff', borderRight: '1px solid #ddd', padding: '25px', zIndex: 1000, overflowY: 'auto', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{isAddingMode ? 'إضافة فرد جديد' : 'تعديل البيانات'}</h2>
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          </div>

          {/* جميع الخانات المطلوبة */}
          <label style={labelStyle}>الاسم الأول *</label>
          <input style={inputStyle} value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />

          <label style={labelStyle}>الدولة</label>
          <input style={inputStyle} value={formData.country || ''} onChange={(e) => setFormData({...formData, country: e.target.value})} />

          <label style={labelStyle}>المدينة</label>
          <input style={inputStyle} value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} />

          <label style={labelStyle}>الجنس</label>
          <select style={inputStyle} value={formData.gender || 'male'} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>

          <label style={labelStyle}>على قيد الحياة</label>
          <select style={inputStyle} value={formData.is_alive} onChange={(e) => setFormData({...formData, is_alive: e.target.value === 'true'})}>
            <option value="true">نعم</option>
            <option value="false">لا (متوفى)</option>
          </select>

          <label style={labelStyle}>رقم الهوية الوطنية</label>
          <input style={inputStyle} value={formData.national_id || ''} onChange={(e) => setFormData({...formData, national_id: e.target.value})} />

          <label style={labelStyle}>العنوان الوطني المختصر</label>
          <input style={inputStyle} value={formData.national_address_short || ''} onChange={(e) => setFormData({...formData, national_address_short: e.target.value})} />

          <label style={labelStyle}>رقم الجوال</label>
          <input style={inputStyle} value={formData.phone_number || ''} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />

          <label style={labelStyle}>رابط الصورة الشخصية</label>
          <input style={inputStyle} value={formData.photo_url || ''} onChange={(e) => setFormData({...formData, photo_url: e.target.value})} />

          <div style={{ marginTop: '30px', sticky: 'bottom', background: '#fff', paddingBottom: '20px' }}>
            <button onClick={handleSave} style={{ width: '100%', padding: '14px', backgroundColor: '#28B463', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              {isAddingMode ? 'إضافة العضو الآن' : 'حفظ التعديلات'}
            </button>

            {!isAddingMode && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                  <button onClick={() => startAdding('son')} style={{ padding: '10px', backgroundColor: '#2E4053', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ إضافة ابن</button>
                  <button onClick={() => startAdding('brother')} style={{ padding: '10px', backgroundColor: '#AED6F1', color: '#2E4053', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ إضافة أخ</button>
                </div>
                
                <button onClick={async () => { if(window.confirm("حذف؟")) { await supabase.from('members').delete().eq('id', formData.id); setIsSidebarOpen(false); fetchData(); } }}
                  style={{ width: '100%', marginTop: '20px', color: '#C0392B', border: '1px solid #C0392B', padding: '10px', borderRadius: '8px', background: 'none', cursor: 'pointer' }}>
                  حذف نهائي
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
