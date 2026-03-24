'use client';

import { useState } from 'react';
import type { Property } from '../types';

export interface AgentInfo {
  name: string;
  ini: string;
  grad: string;
  neighborhood: string;
}

interface Props {
  agent: AgentInfo;
  properties: Property[];
  onClose: () => void;
  onContact: () => void;
}

const MOCK_VIEWS = [4200, 1830, 7600, 2100, 950, 3400];

export default function AgentProfileModal({ agent, properties, onClose, onContact }: Props) {
  const [view, setView] = useState<'photos' | 'videos'>('photos');
  const [following, setFollowing] = useState(false);
  const [videoIdx, setVideoIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // Filter props for this agent's neighborhood
  const agentProps = properties.filter(p => p.neighborhood === agent.neighborhood);
  const allProps = agentProps.length > 0 ? agentProps : properties.slice(0, 6);

  const totalLikes = allProps.reduce((s, p) => s + p.likes, 0);

  function handleVideoTap() {
    setPaused(v => !v);
  }

  const currentVideo = allProps[videoIdx];

  return (
    <div className="agent-modal">
      <div className="agent-modal-inner">
        {/* Header */}
        <div className="agent-modal-hdr">
          <button className="agent-back" onClick={onClose}>‹</button>
          <span className="agent-modal-title">{agent.name}</span>
          <button className="agent-menu-btn">⋯</button>
        </div>

        {/* Profile info */}
        <div className="agent-profile-top">
          <div className="agent-big-av" style={{ background: agent.grad }}>{agent.ini}</div>
          <div className="agent-profile-stats">
            <div className="agent-stat"><div className="agent-stat-n">{allProps.length}</div><div className="agent-stat-l">Propiedades</div></div>
            <div className="agent-stat"><div className="agent-stat-n">{(1200 + allProps.length * 80).toLocaleString()}</div><div className="agent-stat-l">Seguidores</div></div>
            <div className="agent-stat"><div className="agent-stat-n">{totalLikes}</div><div className="agent-stat-l">Likes</div></div>
          </div>
        </div>

        <div className="agent-profile-name">{agent.name}</div>
        <div className="agent-profile-sub">🏡 Inmobiliaria · 📍 {agent.neighborhood}, Buenos Aires</div>

        <div className="agent-profile-actions">
          <button className={`agent-follow-btn ${following ? 'ing' : ''}`} onClick={() => setFollowing(v => !v)}>
            {following ? 'Siguiendo ✓' : '+ Seguir'}
          </button>
          <button className="agent-contact-btn" onClick={onContact}>
            Contactar
          </button>
        </div>

        {/* View tabs */}
        <div className="agent-view-tabs">
          <button className={`agent-view-tab ${view === 'photos' ? 'active' : ''}`} onClick={() => setView('photos')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={view === 'photos' ? '#111' : '#aaa'} stroke="none">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button className={`agent-view-tab ${view === 'videos' ? 'active' : ''}`} onClick={() => setView('videos')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={view === 'videos' ? '#111' : '#aaa'} strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </button>
        </div>

        {/* Photos grid */}
        {view === 'photos' && (
          <div className="agent-photos-grid">
            {allProps.map((p, i) => (
              <div key={p.id} className="agent-photo-cell">
                <div className="agent-photo-img" style={{
                  backgroundImage: `url('${p.image_url || `https://picsum.photos/id/${1029 + p.id}/400/400`}')`,
                }} />
                <div className="agent-photo-overlay">
                  <span>❤️ {p.likes}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos reel */}
        {view === 'videos' && currentVideo && (
          <div className="agent-videos">
            <div
              className="agent-video-card"
              onClick={handleVideoTap}
              onTouchStart={e => {
                const startY = e.touches[0].clientY;
                const el = e.currentTarget;
                const onEnd = (ev: TouchEvent) => {
                  const d = startY - ev.changedTouches[0].clientY;
                  if (d > 50 && videoIdx < allProps.length - 1) setVideoIdx(i => i + 1);
                  if (d < -50 && videoIdx > 0) setVideoIdx(i => i - 1);
                  el.removeEventListener('touchend', onEnd);
                };
                el.addEventListener('touchend', onEnd);
              }}
            >
              <div className="agent-video-bg" style={{
                backgroundImage: `url('${currentVideo.image_url || `https://picsum.photos/id/${1029 + currentVideo.id}/1080/1920`}')`,
              }} />
              <div className="agent-video-overlay" />

              {paused && (
                <div className="agent-video-pause-icon">▶</div>
              )}

              <div className="agent-video-top">
                <div className="agent-video-prog">
                  {allProps.map((_, i) => (
                    <div key={i} className={`agent-vprog-seg ${i < videoIdx ? 'done' : i === videoIdx ? 'cur' : ''}`} />
                  ))}
                </div>
              </div>

              <div className="agent-video-info">
                <div className="agent-video-price">{currentVideo.price_display}</div>
                <div className="agent-video-addr">📍 {currentVideo.address}</div>
                <div className="agent-video-views">
                  👁 {MOCK_VIEWS[videoIdx % MOCK_VIEWS.length].toLocaleString()} visualizaciones
                </div>
                <div className="agent-video-tags">
                  {currentVideo.tags.slice(0, 3).map(t => (
                    <span key={t} className="agent-video-tag">{t}</span>
                  ))}
                </div>
              </div>

              <div className="agent-video-side">
                <button className="agent-vbtn">❤️<span>{currentVideo.likes}</span></button>
                <button className="agent-vbtn">💬<span>Ver</span></button>
                <button className="agent-vbtn" onClick={e => { e.stopPropagation(); onContact(); }}>📱<span>Info</span></button>
              </div>

              <div className="agent-swipe-hint">↑ deslizá para ver más</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
