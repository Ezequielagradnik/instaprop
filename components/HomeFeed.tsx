'use client';

import { useState, useRef, useMemo } from 'react';
import type { Property, OperationType } from '../types';
import AgentProfileModal, { type AgentInfo } from './AgentProfileModal';

const STORIES = [
  { id: 1, name: 'Palermo Prop.', grad: 'linear-gradient(135deg,#FF3322,#FF6B5B)', ini: 'PP', seen: false },
  { id: 2, name: 'Belgrano R.', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', ini: 'BR', seen: false },
  { id: 3, name: 'Núñez Homes', grad: 'linear-gradient(135deg,#00B09B,#96C93D)', ini: 'NH', seen: true },
  { id: 4, name: 'Recoleta+', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', ini: 'R+', seen: false },
  { id: 5, name: 'VCrespo360', grad: 'linear-gradient(135deg,#2979FF,#00B0FF)', ini: 'VC', seen: true },
  { id: 6, name: 'Caballito+', grad: 'linear-gradient(135deg,#EB4D4B,#6C5CE7)', ini: 'C+', seen: false },
  { id: 7, name: 'Saavedra Br.', grad: 'linear-gradient(135deg,#11998e,#38ef7d)', ini: 'SB', seen: true },
];

export const AGENT_GRADS = [
  'linear-gradient(135deg,#FF3322,#FF6B5B)',
  'linear-gradient(135deg,#6C5CE7,#A29BFE)',
  'linear-gradient(135deg,#00B09B,#96C93D)',
  'linear-gradient(135deg,#2979FF,#00B0FF)',
  'linear-gradient(135deg,#F9CA24,#F0932B)',
  'linear-gradient(135deg,#EB4D4B,#6C5CE7)',
];

const ZONES = ['Todo', 'Palermo', 'Belgrano', 'Recoleta', 'Núñez', 'Villa Crespo', 'Caballito', 'Villa Urquiza', 'Almagro'];
const TYPE_FILTERS = ['Todos', 'Monoamb.', '2 amb', '3 amb', 'Casa', 'PH'];
const FEATURES_FILTER = ['Cochera', 'Balcón', 'Terraza', 'Pileta', 'Amoblado', 'Mascotas', 'Apto cred.', 'Apto prof.'];

const RESPONSE_TIMES = ['Responde en 1h', 'Responde rápido', 'Activo hoy', 'Activo esta semana'];

interface PostProps {
  property: Property;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onContact: () => void;
  onAgentClick: (agent: AgentInfo) => void;
  allProperties: Property[];
}

function Post({ property: p, liked, saved, onLike, onSave, onContact, onAgentClick, allProperties }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'martina_r', text: '¡Se ve increíble! ¿Tiene balcón? 😍' },
    { id: 2, user: 'lucas.felitti', text: 'Zona top, lo recomiendo 100%' },
  ]);
  const [following, setFollowing] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [localLikes, setLocalLikes] = useState(p.likes);
  const touchX = useRef(0);

  const images = [
    p.image_url || `https://picsum.photos/id/${1029 + p.id}/1080/1080`,
    `https://picsum.photos/id/${1040 + (p.id * 3) % 80}/1080/1080`,
    `https://picsum.photos/id/${1060 + (p.id * 2) % 60}/1080/1080`,
  ];

  const agentName = p.neighborhood + ' Propiedades';
  const grad = AGENT_GRADS[p.id % AGENT_GRADS.length];
  const ini = p.neighborhood.substring(0, 2).toUpperCase();
  const agent: AgentInfo = { name: agentName, ini, grad, neighborhood: p.neighborhood };

  // Mock trust data
  const responseTime = RESPONSE_TIMES[p.id % RESPONSE_TIMES.length];
  const isVerified = p.verified ?? (p.id % 3 !== 0); // most are verified in mock
  const opLabel = p.operation_type === 'alquiler' ? 'Alquiler' : p.operation_type === 'temporario' ? 'Temporario' : 'Venta';
  const opColor = p.operation_type === 'alquiler' ? '#2979FF' : p.operation_type === 'temporario' ? '#FF9500' : '#00C853';

  function handleLike() {
    setLocalLikes(n => liked ? n - 1 : n + 1);
    onLike();
  }

  function addComment() {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: 'yo', text: comment }]);
    setComment('');
  }

  return (
    <article className="hpost">
      {/* Header */}
      <div className="hpost-hdr">
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => onAgentClick(agent)}
        >
          <div className="hpost-av" style={{ background: grad }}>{ini}</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="hpost-nm">{agentName}</div>
              {isVerified && <span className="trust-verified-sm">✓</span>}
            </div>
            <div className="hpost-loc">📍 {p.neighborhood} · {p.badge}</div>
            <div className="trust-response-sm">⚡ {responseTime}</div>
          </div>
        </button>
        <button className={`hpost-follow ${following ? 'ing' : ''}`} onClick={() => setFollowing(v => !v)}>
          {following ? 'Siguiendo ✓' : '+ Seguir'}
        </button>
      </div>

      {/* Carousel with swipe */}
      <div
        className="hpost-car"
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const d = touchX.current - e.changedTouches[0].clientX;
          if (d > 40 && imgIdx < images.length - 1) setImgIdx(i => i + 1);
          if (d < -40 && imgIdx > 0) setImgIdx(i => i - 1);
        }}
      >
        <div className="hpost-imgs" style={{ transform: `translateX(-${imgIdx * 100}%)` }}>
          {images.map((img, i) => (
            <div key={i} className="hpost-img" style={{ backgroundImage: `url('${img}')` }} />
          ))}
        </div>
        {imgIdx > 0 && (
          <button className="hpost-arr left" onClick={() => setImgIdx(i => i - 1)}>‹</button>
        )}
        {imgIdx < images.length - 1 && (
          <button className="hpost-arr right" onClick={() => setImgIdx(i => i + 1)}>›</button>
        )}
        <div className="hpost-dots">
          {images.map((_, i) => <div key={i} className={`hpost-dot ${i === imgIdx ? 'act' : ''}`} />)}
        </div>
        <div className="hpost-match">⚡ {p.match_score}% match</div>
        {/* Operation type badge */}
        <div className="hpost-op-badge" style={{ background: opColor + '22', color: opColor, borderColor: opColor + '55' }}>{opLabel}</div>
      </div>

      {/* Actions */}
      <div className="hpost-acts">
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <button className={`hact ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#FF3322' : 'none'} stroke={liked ? '#FF3322' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button className="hact" onClick={() => setShowComments(v => !v)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          {/* Phone → opens chat directly */}
          <button className="hact hact-contact" onClick={onContact}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>
        </div>
        <button className={`hact ${saved ? 'saved' : ''}`} onClick={onSave}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? '#2979FF' : 'none'} stroke={saved ? '#2979FF' : 'currentColor'} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="hpost-info">
        <div className="hpost-likes">{localLikes.toLocaleString()} me gusta</div>
        <div className="hpost-price">{p.price_display}</div>
        <div className="hpost-addr"><strong>{agentName}</strong> 📍 {p.address}</div>
        {(p.bedrooms || p.area_m2) && (
          <div className="hpost-meta">
            {p.bedrooms && <span>🛏 {p.bedrooms} ambientes</span>}
            {p.area_m2 && <span>📐 {p.area_m2} m²</span>}
          </div>
        )}
        <div className="hpost-tags">
          {p.tags.slice(0, 4).map(t => <span key={t} className="hpost-tag">{t}</span>)}
        </div>
        <button className="hpost-more" onClick={() => setShowComments(v => !v)}>
          {showComments ? 'Ocultar comentarios' : `Ver ${comments.length} comentarios`}
        </button>
      </div>

      {/* Inline comments */}
      {showComments && (
        <div className="hpost-cmts">
          {comments.map(c => (
            <div key={c.id} className="hcmt">
              <span className="hcmt-user">{c.user}</span>
              <span className="hcmt-text"> {c.text}</span>
            </div>
          ))}
          <div className="hcmt-inp">
            <input
              className="hcmt-input"
              placeholder="Agregar comentario..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()}
            />
            <button onClick={addComment} style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '.85rem' }}>
              Publicar
            </button>
          </div>
        </div>
      )}

      {/* Always-visible contact CTA */}
      <div className="hpost-contact-bar">
        <button className="hpost-contact-btn" onClick={onContact}>
          💬 Contactar al vendedor
        </button>
      </div>
    </article>
  );
}

interface Props {
  properties: Property[];
  liked: number[];
  saved: number[];
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  onContactChat: (id: number) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
  operationType: OperationType;
  onOperationChange: (op: OperationType) => void;
}

export default function HomeFeed({ properties, liked, saved, onLike, onSave, onContactChat, scrollRef, operationType, onOperationChange }: Props) {
  const [seenStories, setSeenStories] = useState<number[]>([3, 5, 7]);
  const [openStory, setOpenStory] = useState<typeof STORIES[0] | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [agentModal, setAgentModal] = useState<AgentInfo | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZone, setActiveZone] = useState('Todo');
  const [activeType, setActiveType] = useState('Todos');
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function toggleFeature(f: string) {
    setActiveFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  const hasActiveFilters = activeZone !== 'Todo' || activeType !== 'Todos' || activeFeatures.length > 0 || searchQuery || priceMin > 0 || priceMax < 500000;

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchZone = activeZone === 'Todo' || p.neighborhood === activeZone;
      const matchType = activeType === 'Todos' ||
        (activeType === 'Monoamb.' && p.type === 'monoambiente') ||
        (activeType === '2 amb' && p.type === '2amb') ||
        (activeType === '3 amb' && p.type === '3amb') ||
        (activeType === 'Casa' && p.type === 'casa') ||
        (activeType === 'PH' && p.type === 'ph');
      const matchSearch = !searchQuery || p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = p.price_usd >= priceMin && p.price_usd <= priceMax;
      const matchFeatures = activeFeatures.length === 0 || activeFeatures.every(f =>
        p.tags.some(t => t.toLowerCase().includes(f.toLowerCase()))
      );
      return matchZone && matchType && matchSearch && matchPrice && matchFeatures;
    });
  }, [properties, activeZone, activeType, searchQuery, priceMin, priceMax, activeFeatures]);

  function handleStory(s: typeof STORIES[0]) {
    setOpenStory(s);
    setStoryProgress(0);
    setSeenStories(prev => prev.includes(s.id) ? prev : [...prev, s.id]);
    const start = Date.now();
    const iv = setInterval(() => {
      const prog = (Date.now() - start) / 5000;
      setStoryProgress(Math.min(prog, 1));
      if (prog >= 1) { clearInterval(iv); setOpenStory(null); }
    }, 50);
  }

  function clearFilters() {
    setSearchQuery('');
    setActiveZone('Todo');
    setActiveType('Todos');
    setActiveFeatures([]);
    setPriceMin(0);
    setPriceMax(500000);
  }

  return (
    <div className="hv" ref={scrollRef}>
      {/* Search header */}
      <div className="home-search-bar">
        <div className="home-search-inner" onClick={() => setShowFilters(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span style={{ color: searchQuery ? '#111' : '#aaa', fontSize: '.9rem', flex: 1 }}>
            {searchQuery || 'Buscar propiedades...'}
          </span>
          {hasActiveFilters && <span className="filter-active-dot" />}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="home-filters">
          <input
            autoFocus
            className="home-filter-input"
            placeholder="Buscar por barrio, dirección..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          {/* Quick zone chips */}
          <div className="home-filter-row">
            <span className="home-filter-label">Zona</span>
            <div className="home-filter-chips">
              {ZONES.map(f => (
                <button key={f} className={`hfilt ${activeZone === f ? 'act' : ''}`} onClick={() => setActiveZone(f)}>{f}</button>
              ))}
            </div>
          </div>

          {/* Type chips */}
          <div className="home-filter-row">
            <span className="home-filter-label">Tipo</span>
            <div className="home-filter-chips">
              {TYPE_FILTERS.map(f => (
                <button key={f} className={`hfilt ${activeType === f ? 'act' : ''}`} onClick={() => setActiveType(f)}>{f}</button>
              ))}
            </div>
          </div>

          {/* Advanced toggle */}
          <button className="home-filter-advanced-toggle" onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? '▲ Menos filtros' : '▼ Más filtros'}
          </button>

          {showAdvanced && (
            <>
              {/* Price range */}
              <div className="home-filter-row">
                <span className="home-filter-label">💰 Precio (USD)</span>
                <div className="hfilt-price-row">
                  <input className="hfilt-price-inp" type="number" placeholder="Mín" value={priceMin || ''} onChange={e => setPriceMin(+e.target.value || 0)} />
                  <span style={{ color: '#aaa' }}>—</span>
                  <input className="hfilt-price-inp" type="number" placeholder="Máx" value={priceMax >= 500000 ? '' : priceMax} onChange={e => setPriceMax(+e.target.value || 500000)} />
                </div>
              </div>

              {/* Features */}
              <div className="home-filter-row">
                <span className="home-filter-label">✨ Características</span>
                <div className="home-filter-chips">
                  {FEATURES_FILTER.map(f => (
                    <button key={f} className={`hfilt ${activeFeatures.includes(f) ? 'act' : ''}`} onClick={() => toggleFeature(f)}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Temp-specific */}
              {operationType === 'temporario' && (
                <div className="home-filter-row">
                  <span className="home-filter-label">📅 Alquiler temporario</span>
                  <div className="home-filter-chips">
                    {['Por noche', 'Por semana', 'Por mes', 'WiFi incluido', 'Cocina', 'Ropa de cama'].map(f => (
                      <button key={f} className={`hfilt ${activeFeatures.includes(f) ? 'act' : ''}`} onClick={() => toggleFeature(f)}>{f}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {hasActiveFilters && (
            <button className="home-filter-clear" onClick={clearFilters}>
              Limpiar filtros · {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Stories strip */}
      <div className="stories-strip">
        {STORIES.map(s => (
          <button key={s.id} className="story-btn" onClick={() => handleStory(s)}>
            <div className={`story-ring ${seenStories.includes(s.id) ? 'seen' : ''}`}>
              <div className="story-av" style={{ background: s.grad }}>{s.ini}</div>
            </div>
            <span className="story-nm">{s.name}</span>
          </button>
        ))}
      </div>
      <div className="stories-divider" />

      {/* Results count when filtering */}
      {hasActiveFilters && (
        <div className="home-results-bar">
          <span>{filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} · {operationType === 'venta' ? 'Venta' : operationType === 'alquiler' ? 'Alquiler' : 'Temporario'}</span>
          <button onClick={clearFilters} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Limpiar</button>
        </div>
      )}

      {/* Posts */}
      <div className="hposts">
        {filtered.length === 0 ? (
          <div className="xempty" style={{ marginTop: 40 }}>
            <div className="ico">🏘</div>
            <div>No hay propiedades con esos filtros</div>
            <button className="home-filter-clear" style={{ margin: '12px auto 0', display: 'block' }} onClick={clearFilters}>Ver todas</button>
          </div>
        ) : (
          filtered.map(p => (
            <Post
              key={p.id}
              property={p}
              liked={liked.includes(p.id)}
              saved={saved.includes(p.id)}
              onLike={() => onLike(p.id)}
              onSave={() => onSave(p.id)}
              onContact={() => onContactChat(p.id)}
              onAgentClick={setAgentModal}
              allProperties={properties}
            />
          ))
        )}
      </div>

      {/* Story viewer */}
      {openStory && (
        <div className="story-viewer" onClick={() => setOpenStory(null)}>
          <div className="sv-progress-bar">
            <div className="sv-progress-fill" style={{ width: `${storyProgress * 100}%` }} />
          </div>
          <div className="sv-header">
            <div className="sv-av" style={{ background: openStory.grad }}>{openStory.ini}</div>
            <span className="sv-nm">{openStory.name}</span>
            <button className="sv-close" onClick={() => setOpenStory(null)}>✕</button>
          </div>
          <div className="sv-content" onClick={e => e.stopPropagation()}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: openStory.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {openStory.ini}
            </div>
            <div className="sv-title">{openStory.name}</div>
            <div className="sv-sub">🏡 Inmobiliaria · Buenos Aires</div>
          </div>
        </div>
      )}

      {/* Agent modal */}
      {agentModal && (
        <AgentProfileModal
          agent={agentModal}
          properties={properties}
          onClose={() => setAgentModal(null)}
          onContact={() => {
            const p = properties.find(x => x.neighborhood === agentModal.neighborhood);
            if (p) onContactChat(p.id);
            setAgentModal(null);
          }}
        />
      )}
    </div>
  );
}
