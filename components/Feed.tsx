'use client';

import { useEffect, useRef } from 'react';
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

export default function Feed({ properties, currentIndex, liked, saved, onNext, onPrev, onLike, onSave, onContact, onShare }: Props) {
  const touchY = useRef(0);
  const wheelLocked = useRef(false);
  const p = properties[currentIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrev]);

  const onWheel = (e: React.WheelEvent) => {
    if (wheelLocked.current) return;
    if (e.deltaY > 30) onNext();
    if (e.deltaY < -30) onPrev();
    wheelLocked.current = true;
    setTimeout(() => { wheelLocked.current = false; }, 600);
  };

  const total = Math.min(properties.length, 10);

  return (
    <div className="fv" onWheel={onWheel}>
      {/* Progress bar */}
      <div className="fprog">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`fprog-seg ${i < currentIndex ? 'done' : i === currentIndex ? 'cur' : ''}`} />
        ))}
      </div>

      {/* Cards stack */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onTouchStart={e => { touchY.current = e.touches[0].clientY; }}
        onTouchEnd={e => {
          const d = touchY.current - e.changedTouches[0].clientY;
          if (d > 40) onNext();
          if (d < -40) onPrev();
        }}
        onClick={e => { if (!(e.target as Element).closest('.sbtn')) onNext(); }}
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
        <button className={`sbtn ${p && saved.includes(p.id) ? 'saved' : ''}`} onClick={onSave}>
          🔖<span>Guardar</span>
        </button>
        <button className="sbtn sbtn-contact" onClick={onContact}>
          💬<span>Contactar</span>
        </button>
        <button className="sbtn" onClick={onShare}>
          ↗<span>Compartir</span>
        </button>
      </div>

      <div className="swh">↑ swipe o flechas para navegar</div>
    </div>
  );
}
