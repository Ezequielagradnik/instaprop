'use client';

import { useState } from 'react';

interface Chat {
  id: number;
  name: string;
  ini: string;
  grad: string;
  lastMsg: string;
  time: string;
  unread: number;
  property: string;
}

const CHATS: Chat[] = [
  { id: 1, name: 'Palermo Propiedades', ini: 'PP', grad: 'linear-gradient(135deg,#FF3322,#FF6B5B)', lastMsg: 'Hola! Quisiera más info sobre Thames 1842 😊', time: '10:32', unread: 2, property: 'Thames 1842, Palermo' },
  { id: 2, name: 'Belgrano R. Inmobiliaria', ini: 'BI', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', lastMsg: 'Le puedo coordinar una visita el miércoles a las 15hs', time: 'Ayer', unread: 0, property: 'Av. Libertador 3200' },
  { id: 3, name: 'Núñez Homes', ini: 'NH', grad: 'linear-gradient(135deg,#00B09B,#96C93D)', lastMsg: 'La propiedad sigue disponible ✅', time: 'Lun', unread: 1, property: 'Olazábal 4500, Núñez' },
  { id: 4, name: 'Recoleta Premium', ini: 'RP', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', lastMsg: 'Enviamos la documentación por email', time: '12/03', unread: 0, property: 'Av. Quintana 580' },
];

interface MsgLine { id: number; me: boolean; text: string; time: string; }

function ChatScreen({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<MsgLine[]>([
    { id: 1, me: false, text: `¡Hola! Vi la propiedad en ${chat.property} y me interesa.`, time: '10:28' },
    { id: 2, me: true, text: '¡Buenas! Con gusto te asesoramos. ¿Tenés alguna pregunta específica?', time: '10:30' },
    { id: 3, me: false, text: chat.lastMsg, time: chat.time },
  ]);

  function send() {
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    setMsgs(prev => [...prev, { id: Date.now(), me: false, text: txt, time: 'ahora' }]);
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        id: Date.now() + 1,
        me: true,
        text: '¡Gracias! Revisamos tu consulta y te respondemos en minutos 🙌',
        time: 'ahora',
      }]);
    }, 900);
  }

  return (
    <div className="chat-screen">
      <div className="chat-hdr">
        <button className="chat-back" onClick={onBack}>‹</button>
        <div className="chat-hdr-av" style={{ background: chat.grad }}>{chat.ini}</div>
        <div style={{ flex: 1 }}>
          <div className="chat-hdr-nm">{chat.name}</div>
          <div className="chat-hdr-prop">📍 {chat.property}</div>
        </div>
        <button className="hact" style={{ color: '#555' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
      </div>

      <div className="chat-body">
        {msgs.map(m => (
          <div key={m.id} className={`cmsg ${m.me ? 'me' : 'them'}`}>
            <div className="cmsg-bubble">{m.text}</div>
            <div className="cmsg-time">{m.time}</div>
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <input
          className="chat-input"
          placeholder="Escribir mensaje..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="chat-send" onClick={send}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function MessagesView() {
  const [open, setOpen] = useState<Chat | null>(null);

  if (open) return <ChatScreen chat={open} onBack={() => setOpen(null)} />;

  return (
    <div className="mv">
      <div className="mv-hdr">
        <h2>Mensajes</h2>
        <span className="mv-count">{CHATS.reduce((s, c) => s + c.unread, 0)} sin leer</span>
      </div>

      <div className="mv-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input placeholder="Buscar conversación..." style={{ border: 'none', outline: 'none', background: 'none', flex: 1, fontSize: '.9rem', color: '#333' }} />
      </div>

      <div className="mv-list">
        {CHATS.map(c => (
          <button key={c.id} className="mv-item" onClick={() => setOpen(c)}>
            <div className="mv-av-wrap">
              <div className="mv-av" style={{ background: c.grad }}>{c.ini}</div>
              {c.unread > 0 && <div className="mv-dot" />}
            </div>
            <div className="mv-info">
              <div className="mv-top">
                <span className="mv-nm">{c.name}</span>
                <span className="mv-time">{c.time}</span>
              </div>
              <div className="mv-prop">📍 {c.property}</div>
              <div className={`mv-last ${c.unread > 0 ? 'bold' : ''}`}>{c.lastMsg}</div>
            </div>
            {c.unread > 0 && <div className="mv-badge">{c.unread}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
