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

interface Comment { id: number; user: string; text: string; time: string }

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: 'martina_r', text: '¡Se ve increíble! ¿Tiene balcón? 😍', time: '2h' },
  { id: 2, user: 'lucas.felitti', text: 'Zona top, lo recomiendo 100%', time: '5h' },
  { id: 3, user: 'sofi.gomez', text: '¿Aceptan mascotas?', time: '1d' },
  { id: 4, user: 'tomas.b', text: 'El precio está muy bien para esa zona', time: '2d' },
];

// Swipeable comments sheet
function CommentsSheet({ onClose }: { onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [text, setText] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef(0);
  const [dragY, setDragY] = useState(0);
  const isDragging = useRef(false);

  function send() {
    if (!text.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: 'yo', text, time: 'ahora' }]);
    setText('');
    setTimeout(() => bodyRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  }

  function onHandleTouchStart(e: React.TouchEvent) {
    dragStart.current = e.touches[0].clientY;
    isDragging.current = true;
  }
  function onHandleTouchMove(e: React.TouchEvent) {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - dragStart.current;
    if (dy > 0) setDragY(dy);
  }
  function onHandleTouchEnd() {
    isDragging.current = false;
    if (dragY > 80) onClose();
    else setDragY(0);
  }

  return (
    <div className="comments-sheet-backdrop" onClick={onClose}>
      <div
        ref={sheetRef}
        className="comments-sheet"
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : undefined, transition: dragY === 0 ? 'transform .3s' : 'none' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Draggable handle */}
        <div
          className="comments-sheet-handle"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
        />
        <div className="comments-sheet-hdr">
          <span className="comments-sheet-title">Comentarios</span>
          <button className="comments-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="comments-body" ref={bodyRef}>
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
          <input className="comments-input" placeholder="Agregar comentario..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
          <button className="comments-send" onClick={send}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Share sheet with WhatsApp
function ShareSheet({ property, onClose }: { property: Property; onClose: () => void }) {
  const [sent, setSent] = useState<number[]>([]);
  const contacts = [
    { id: 1, name: 'Martina R.', ini: 'MR', grad: 'linear-gradient(135deg,#FF6B6B,#EE5A24)' },
    { id: 2, name: 'Lucas F.', ini: 'LF', grad: 'linear-gradient(135deg,#4ECDC4,#44BD32)' },
    { id: 3, name: 'Sofía G.', ini: 'SG', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)' },
    { id: 4, name: 'Tomás B.', ini: 'TB', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)' },
  ];
  const waText = encodeURIComponent(`🏡 Mirá esta propiedad en InstaProp: ${property.price_display} — ${property.address}`);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef(0);
  const [dragY, setDragY] = useState(0);

  return (
    <div className="comments-sheet-backdrop" onClick={onClose}>
      <div
        ref={sheetRef}
        className="comments-sheet"
        style={{ height: '55%', transform: dragY > 0 ? `translateY(${dragY}px)` : undefined, transition: dragY === 0 ? 'transform .3s' : 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="comments-sheet-handle"
          onTouchStart={e => { dragStart.current = e.touches[0].clientY; }}
          onTouchMove={e => { const dy = e.touches[0].clientY - dragStart.current; if (dy > 0) setDragY(dy); }}
          onTouchEnd={() => { if (dragY > 80) onClose(); else setDragY(0); }}
        />
        <div className="comments-sheet-hdr">
          <span className="comments-sheet-title">Compartir</span>
          <button className="comments-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="comments-body" style={{ gap: 4 }}>
          {/* WhatsApp external share */}
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-wa-btn"
          >
            <span className="share-wa-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </span>
            Compartir en WhatsApp
          </a>
          <div className="share-section-label">Enviar a contactos</div>
          {contacts.map(c => (
            <div key={c.id} className="share-contact-row">
              <div className="share-contact-av" style={{ background: c.grad }}>{c.ini}</div>
              <span className="share-contact-name">{c.name}</span>
              <button
                className={`share-send-btn ${sent.includes(c.id) ? 'sent' : ''}`}
                onClick={() => setSent(p => [...p, c.id])}
              >
                {sent.includes(c.id) ? '✓ Enviado' : 'Enviar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Feed({ properties, currentIndex, liked, saved, onNext, onPrev, onLike, onSave, onContact, onShare }: Props) {
  const touchY = useRef(0);
  const wheelLocked = useRef(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();
  const [paused, setPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const p = properties[currentIndex];

  // Reset expanded desc on property change
  useEffect(() => { setDescExpanded(false); }, [currentIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showComments || showShare) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrev, showComments, showShare]);

  const onWheel = (e: React.WheelEvent) => {
    if (showComments || showShare) return;
    if (wheelLocked.current) return;
    if (e.deltaY > 30) onNext();
    if (e.deltaY < -30) onPrev();
    wheelLocked.current = true;
    setTimeout(() => { wheelLocked.current = false; }, 600);
  };

  const opColor = (p?.operation_type === 'alquiler') ? '#2979FF' : (p?.operation_type === 'temporario') ? '#FF9500' : '#00E676';
  const opLabel = (p?.operation_type === 'alquiler') ? 'Alquiler' : (p?.operation_type === 'temporario') ? 'Temporario' : 'Venta';

  const DESC_LIMIT = 80;
  const longDesc = (p?.description?.length ?? 0) > DESC_LIMIT;
  const descText = descExpanded || !longDesc
    ? p?.description ?? ''
    : (p?.description ?? '').slice(0, DESC_LIMIT) + '...';

  return (
    <div className="fv" onWheel={onWheel}>
      {/* NO progress bar — removed for immersive infinite scroll feel */}

      <div
        className="fv-cards"
        onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          if (showComments || showShare) return;
          const d = touchY.current - e.changedTouches[0].clientY;
          if (d > 40) onNext();
          if (d < -40) onPrev();
        }}
        onClick={e => {
          if ((e.target as Element).closest('.sbtn') || (e.target as Element).closest('.fside') || (e.target as Element).closest('.fdesc-wrap')) return;
          clearTimeout(tapTimer.current);
          tapTimer.current = setTimeout(() => setPaused(v => !v), 180);
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

          return (
            <div key={prop.id} className={`fc ${cls}`}>
              <div className="fvis">
                <div className="fbg" style={{ backgroundImage: `url('${imgUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="fov" />
                <div className="ftop">
                  <div className="fbdg">{prop.badge}</div>
                  <div className="fmtch">⚡ {prop.match_score}% match</div>
                </div>
                <div className="fbot">
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
                  {/* Expandable description */}
                  {prop.description && i === currentIndex && (
                    <div className="fdesc-wrap" onClick={e => { e.stopPropagation(); setDescExpanded(v => !v); }}>
                      <span className="fdesc">{descText}</span>
                      {longDesc && (
                        <span className="fdesc-toggle">{descExpanded ? ' ver menos' : ' ver más'}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side actions — stopPropagation prevents feed swipe/navigate */}
      <div className="fside">
        <button className={`sbtn ${p && liked.includes(p.id) ? 'liked' : ''}`} onClick={e => { e.stopPropagation(); onLike(); }}>
          ❤️<span>{p ? (p.likes ?? 0) + (liked.includes(p.id) ? 1 : 0) : 0}</span>
        </button>
        <button className="sbtn" onClick={e => { e.stopPropagation(); setShowComments(true); }}>
          💬<span>Comen.</span>
        </button>
        <button className={`sbtn ${p && saved.includes(p.id) ? 'saved' : ''}`} onClick={e => { e.stopPropagation(); onSave(); }}>
          🔖<span>Guardar</span>
        </button>
        <button className="sbtn sbtn-contact" onClick={e => { e.stopPropagation(); onContact(); }}>
          📱<span>Contactar</span>
        </button>
        <button className="sbtn" onClick={e => { e.stopPropagation(); setShowShare(true); }}>
          ↗<span>Compartir</span>
        </button>
      </div>

      {paused && (
        <div className="feed-pause-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </div>
      )}

      <div className="swh">↑ swipe · toca para pausar</div>

      {showComments && <CommentsSheet onClose={() => setShowComments(false)} />}
      {showShare && p && <ShareSheet property={p} onClose={() => setShowShare(false)} />}
    </div>
  );
}
