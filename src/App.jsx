import React, { useState, useEffect, useRef } from 'react';
import { Brain } from './Brain';

function App() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('a5_chats') || '[]');
    setMsgs(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('a5_chats', JSON.stringify(msgs));
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs(m => [...m, { who: 'user', text: q }]);
    setInput('');

    setTimeout(() => {
      // البحث في الدماغ (Brain) عن إجابة
      const ans = Brain.kb[q] || "أنا نسخة React من أثير. أتعلم الآن!";
      setMsgs(m => [...m, { who: 'bot', text: ans }]);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', direction: 'rtl', background: 'var(--bg)', color: 'var(--text)' }}>
      
      {/* القائمة الجانبية */}
      <div style={{ 
        position: 'fixed', top: 0, bottom: 0, right: 0, width: '250px', 
        background: 'var(--bg2)', borderLeft: '1px solid var(--border)', zIndex: 100,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s',
        padding: '20px'
      }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '20px' }}>✦ أثير React</h3>
        <p style={{ color: 'var(--dim)', fontSize: '13px', marginBottom: '20px' }}>هنا ستضيف الصفحات لاحقاً (المهام، الملفات...)</p>
        <button className="btn" onClick={() => setIsSidebarOpen(false)} style={{ width: '100%' }}>إغلاق</button>
      </div>

      {/* الطبقة المعتمة خلف القائمة */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90
        }} />
      )}

      {/* المحتوى الرئيسي */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* الشريط العلوي */}
        <header style={{ padding: '15px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '24px', cursor: 'pointer' }}>☰</button>
          <h2 style={{ margin: 0, color: 'var(--accent)' }}>أثير React</h2>
        </header>

        {/* الرسائل */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {msgs.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.who === 'user' ? 'flex-start' : 'flex-end',
              background: m.who === 'user' ? 'var(--accent)' : 'var(--card)',
              color: m.who === 'user' ? '#fff' : 'var(--text)',
              padding: '10px 15px', borderRadius: '15px', maxWidth: '80%'
            }}>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* مربع الإدخال */}
        <div style={{ padding: '10px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
          <input 
            value={input} onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="اكتب رسالتك..."
            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', outline: 'none' }} 
          />
          <button onClick={send} style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>➤</button>
        </div>

      </div>
    </div>
  );
}

export default App;