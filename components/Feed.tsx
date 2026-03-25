'use client';

import { useEffect, useRef, useState } from 'react';
import type { Property } from '../types';

interface Props {
  properties: Property[];
  currentIndex: number;
  liked: number[];
  saved: number[];
  onNext: () => void;
  onPrev: () => void;
  onLike: () => void;
  onSave: () => void;
  onContact: () => void;
  onShare: () => void;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  time: string;
}

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: 'martina_r', text: '¡Se ve increíble! ¿Tiene balcón? 😍', time: '2h' },
  { id: 2, user: 'lucas.felitti', text: 'Zona top, lo recomiendo 100%', time: '5h' },
  { id: 3, user: 'sofi.gomez', text: '¿Aceptan mascotas?', time: '1d' },
  { id: 4, user: 'tomas.b', text: 'El precio está muy bien para esa zona', time: '2d' },
];

export default function Feed({ properties, currentIndex, liked, saved, onNext, onPrev, onLike, onSave, onContact, onShare }: Props) {
  const touchY = useRef(0);
  const wheelLocked = useRef(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();
  const [paused, setPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const commentBodyRef = useRef<HTMLDivElement>(null);
  const p = properties[currentIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showComments) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrev, showComments]);

  const onWheel = (e: React.WheelEvent) => {
    if (showComments) return;
    if (wheelLocked.current) return;
    if (e.deltaY > 30) onNext();
    if (e.deltaY < -30) onPrev();
    wheelLocked.current = true;
    setTimeout(() => { wheelLocked.current = false; }, 600);
  };

  function sendComment() {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: 'yo', text: commentText, time: 'ahora' }]);
    setCommentText('');
    setTimeout(() => {
      commentBodyRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
    }, 50);
  }

  const total = Math.min(properties.length, 10);

  // Operation type badge color
  const opColor = (p?.operation_type === 'alquiler') ? '#2979FF' : (p?.operation_type === 'temporario') ? '#FF9500' : '#00E676';
  const opLabel = (p?.operation_type === 'alquiler') ? 'Alquiler' : (p?.operation_type === 'temporario') ? 'Temporario' : 'Venta';

  return (
    <div className="fv" onWheel={onWheel}>
      {/* Progress bar */}
      <div className="fprog">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`fprog-seg ${i < currentIndex ? 'done' : i === currentIndex ? 'cur' : ''}`} />
        ))}
      </div>

      {/* Cards stack — contained scroll */}
      <div
        className="fv-cards"
        onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          if (showComments) return;
          const d = touchY.current - e.changedTouches[0].clientY;
          if (d > 40) onNext();
          if (d < -40) onPrev();
        }}
        onClick={e => {
          if ((e.target as Element).closest('.sbtn') || (e.target as Element).closest('.fside')) return;
          clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => {
            setPaused(v => !v);
          }, 180);
        }}
        onDoubleClick={e => {
          if ((e.target as Element).closest('.sbtn') || (e.target as Element).closest('.fside')) return;
          clearTimeout(tapTimer.current);
          onNext();
        }}
      >
        {properties.map((prop, i) => {
          const cls = i === currentIndex ? 'cur' : i > currentIndex ? 'blw' : 'abv';
          const imgUrl = prop.image_url || `https://picsum.photos/seed/prop${prop.id}/800/1200`;
          const bgStyle = { backgroundImage: `url('${imgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' };

          return (
            <div key={prop.id} className={`fc ${cls}`}>
              <div className="fvis">
                <div className="fbg" style={bgStyle} />
                <div className="fov" />
                <div className="ftop">
                  <div className="fbdg">{prop.badge}</div>
                  <div className="fmtch">⚡ {prop.match_score}% match</div>
                </div>
                <div className="fbot">
                  {/* Operation + trust row */}
                  <div className="fop-row">
                    <span className="fop-tag" style={{ background: opColor + '22', color: opColor, borderColor: opColor + '44' }}>{opLabel}</span>
                    {prop.verified && <span className="fverified">✓ Verificado</span>}
                    {prop.response_time && <span className="fresponse">⚡ {prop.response_time}</span>}
                  </div>
                  <div className="fprice">{prop.price_display}</div>
                  <div className="faddr">📍 {prop.address}</div>
                  {(prop.bedrooms || prop.area_m2) && (
                    <div className="farea">
                      {prop.bedrooms && <span>🛏 {prop.bedrooms} amb</span>}
                      {prop.area_m2 && <span>📐 {prop.area_m2} m²</span>}
                    </div>
                  )}
                  <div className="ftags">
                    {(prop.tags ?? []).slice(0, 4).map(t => <span key={t} className="ftag">{t}</span>)}
                  </div>
                  <div className="fdesc">{prop.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side actions */}
      <div className="fside">
        <button className={`sbtn ${p && liked.includes(p.id) ? 'liked' : ''}`} onClick={onLike}>
          ❤️<span>{p ? (p.likes ?? 0) + (liked.includes(p.id) ? 1 : 0) : 0}</span>
        </button>
        <button className="sbtn" onClick={() => setShowComments(true)}>
          💬<span>Comen.</span>
        </button>
        <button className={`sbtn ${p && saved.includes(p.id) ? 'saved' : ''}`} onClick={onSave}>
          🔖<span>Guardar</span>
        </button>
        <button className="sbtn sbtn-contact" onClick={onContact}>
          📱<span>Contactar</span>
        </button>
        <button className="sbtn" onClick={onShare}>
          ↗<span>Compartir</span>
        </button>
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="feed-pause-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </div>
      )}

      <div className="swh">↑ swipe · toca para pausar</div>

      {/* Comments bottom sheet */}
      {showComments && (
        <div className="comments-sheet-backdrop" onClick={() => setShowComments(false)}>
          <div className="comments-sheet" onClick={e => e.stopPropagation()}>
            <div className="comments-sheet-handle" />
            <div className="comments-sheet-hdr">
              <span className="comments-sheet-title">Comentarios</span>
              <button className="comments-sheet-close" onClick={() => setShowComments(false)}>✕</button>
            </div>
            <div className="comments-body" ref={commentBodyRef}>
              {comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-av">{c.user.substring(0, 2).toUpperCase()}</div>
                  <div className="comment-content">
                    <span className="comment-user">{c.user}</span>
                    <span className="comment-text"> {c.text}</span>
                    <div className="comment-time">{c.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="comments-footer">
              <input
                className="comments-input"
                placeholder="Agregar comentario..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendComment()}
              />
              <button className="comments-send" onClick={sendComment}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
