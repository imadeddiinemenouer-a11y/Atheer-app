import React, { useState, useEffect, useRef } from 'react';
import { Brain } from './Brain';

function App() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
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
      const ans = Brain.kb[q] || "أنا نسخة React من أثير. أتعلم الآن!";
      setMsgs(m => [...m, { who: 'bot', text: ans }]);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '15px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ margin: 0, color: 'var(--accent)' }}>✦ أثير React</h2>
      </header>

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
  );
}

export default App;