import React, { useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { createClient } from '@supabase/supabase-js';
import 'reactflow/dist/style.css';

const SUPABASE_URL = 'https://gcafstpgbfamszspdezd.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_gdhRA9J_VG22F7CXQg7v9A_OxfQsG0i'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function FamilyTree() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error: apiError } = await supabase.from('members').select('*');
      
      if (apiError) {
        setError(`خطأ من Supabase: ${apiError.message} (كود: ${apiError.code})`);
        return;
      }

      if (data && data.length > 0) {
        setNodes(data.map((m, i) => ({
          id: m.id.toString(),
          data: { label: m.first_name },
          position: { x: 250, y: i * 100 },
          style: { background: m.is_alive ? '#EBF5FB' : '#F2F4F4', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: 150, textAlign: 'center' }
        })));
        
        setEdges(data.filter(m => m.father_id).map(m => ({
          id: `e${m.father_id}-${m.id}`,
          source: m.father_id.toString(),
          target: m.id.toString(),
          animated: true
        })));
      } else {
        setError("تم الاتصال بنجاح، لكن الجدول 'members' فارغ. أضف 'عامر' أولاً.");
      }
    } catch (err) {
      setError("فشل الاتصال بالإنترنت أو الـ API");
    }
  };

  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h3 style={{ color: 'red' }}>⚠️ تنبيه</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', cursor: 'pointer' }}>إعادة محاولة</button>
    </div>
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
