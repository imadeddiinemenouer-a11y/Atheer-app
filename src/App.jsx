import React, { useState, useEffect, useRef } from 'react';
import { Brain } from './Brain';
import { checkForUpdates, applyUpdate } from './UpdateChecker';

// 1. صفحة المحادثة
function ChatPage() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  
  useEffect(() => { const saved = JSON.parse(localStorage.getItem('a5_chats') || '[]'); setMsgs(saved); }, []);
  useEffect(() => { localStorage.setItem('a5_chats', JSON.stringify(msgs)); endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs(m => [...m, { who: 'user', text: q }]); setInput('');
    setTimeout(() => {
      const ans = Brain.kb[q] || "أنا نسخة React من أثير. أتعلم الآن!";
      setMsgs(m => [...m, { who: 'bot', text: ans }]);
    }, 500);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.who === 'user' ? 'flex-start' : 'flex-end', background: m.who === 'user' ? 'var(--accent)' : 'var(--card)', color: m.who === 'user' ? '#fff' : 'var(--text)', padding: '10px 15px', borderRadius: '15px', maxWidth: '80%' }}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ padding: '10px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="اكتب رسالتك..." style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', outline: 'none' }} />
        <button onClick={send} style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>➤</button>
      </div>
    </div>
  );
}

// 2. صفحة المهام
function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  
  useEffect(() => { const saved = JSON.parse(localStorage.getItem('a5_tasks') || '[]'); setTasks(saved); }, []);
  const saveTasks = (newTasks) => { setTasks(newTasks); localStorage.setItem('a5_tasks', JSON.stringify(newTasks)); };
  const addTask = () => { if (!newTask.trim()) return; saveTasks([{ id: Date.now(), text: newTask, done: false }, ...tasks]); setNewTask(''); };
  const toggleTask = (id) => saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => saveTasks(tasks.filter(t => t.id !== id));

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="أضف مهمة جديدة..." style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', outline: 'none' }} />
        <button onClick={addTask} className="btn" style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0 20px' }}>إضافة</button>
      </div>
      {tasks.map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--card)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '10px' }}>
          <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ width: '20px', height: '20px' }} />
          <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--dim)' : 'var(--text)' }}>{t.text}</span>
          <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: 'var(--err)', cursor: 'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// 3. نافذة التحديث
function UpdateModal({ version, onUpdate, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ background: 'var(--card)', padding: '25px', borderRadius: '15px', maxWidth: '90%', width: '350px', textAlign: 'center', border: '1px solid var(--accent)' }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '10px' }}>🚀 تحديث جديد متوفر!</h2>
        <p style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '14px' }}>تم إصدار نسخة جديدة (تحديث {version}). هل تريد التحديث الآن؟</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onUpdate} style={{ background: 'var(--ok)', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>تحديث الآن</button>
          <button onClick={onCancel} style={{ background: 'transparent', color: 'var(--dim)', padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>لاحقاً</button>
        </div>
      </div>
    </div>
  );
}

// 4. التطبيق الرئيسي
export default function App() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updateVersion, setUpdateVersion] = useState(null);

  useEffect(() => { checkForUpdates().then(v => { if (v) setUpdateVersion(v); }); }, []);

  const menuItems = [
    { id: 'chat', title: 'المحادثة', icon: '💬' },
    { id: 'tasks', title: 'المهام', icon: '✅' },
  ];

  const renderPage = () => {
    switch(currentPage) {
      case 'chat': return <ChatPage />;
      case 'tasks': return <TasksPage />;
      default: return <ChatPage />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', direction: 'rtl', background: 'var(--bg)', color: 'var(--text)' }}>
      {updateVersion && <UpdateModal version={updateVersion} onUpdate={() => applyUpdate(updateVersion)} onCancel={() => setUpdateVersion(null)} />}
      
      <div style={{ position: 'fixed', top: 0, bottom: 0, right: 0, width: '260px', background: 'var(--bg2)', borderLeft: '1px solid var(--border)', zIndex: 100, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '30px', fontSize: '22px' }}>✦ أثير React</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setIsSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: currentPage === item.id ? 'var(--card)' : 'transparent', color: currentPage === item.id ? 'var(--accent)' : 'var(--text)', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', textAlign: 'right' }}>
              <span>{item.icon}</span><span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <header style={{ padding: '15px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '24px', cursor: 'pointer' }}>☰</button>
          <h2 style={{ margin: 0, color: 'var(--accent)' }}>{menuItems.find(i => i.id === currentPage)?.title || 'أثير'}</h2>
        </header>
        <div style={{ flex: 1, overflow: 'hidden' }}>{renderPage()}</div>
      </div>
    </div>
  );
}