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

// Recommended profiles to show every ~8 posts
const RECOMMENDED_PROFILES = [
  { id: 1, name: 'Palermo Prop.', grad: 'linear-gradient(135deg,#FF3322,#FF6B5B)', ini: 'PP', props: 24, followers: '1.2K' },
  { id: 2, name: 'Recoleta+', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', ini: 'R+', props: 18, followers: '980' },
  { id: 3, name: 'NúñezHomes', grad: 'linear-gradient(135deg,#00B09B,#96C93D)', ini: 'NH', props: 31, followers: '2.1K' },
  { id: 4, name: 'VCrespo360', grad: 'linear-gradient(135deg,#2979FF,#00B0FF)', ini: 'VC', props: 12, followers: '654' },
  { id: 5, name: 'BelgranoR.', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', ini: 'BR', props: 45, followers: '3.4K' },
];

// ── Comments bottom sheet (shared) ────────────────────────────────────────────
interface Comment { id: number; user: string; text: string; time?: string }

function CommentsSheet({ onClose }: { onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: 'martina_r', text: '¡Se ve increíble! ¿Tiene balcón? 😍', time: '2h' },
    { id: 2, user: 'lucas.felitti', text: 'Zona top, lo recomiendo 100%', time: '5h' },
    { id: 3, user: 'sofi.gomez', text: '¿Aceptan mascotas?', time: '1d' },
    { id: 4, user: 'tomas.b', text: 'El precio está muy bien para esa zona', time: '2d' },
  ]);
  const [text, setText] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  function send() {
    if (!text.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: 'yo', text, time: 'ahora' }]);
    setText('');
    setTimeout(() => bodyRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  }

  return (
    <div className="comments-sheet-backdrop" onClick={onClose}>
      <div className="comments-sheet" onClick={e => e.stopPropagation()}>
        <div className="comments-sheet-handle" />
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
                {c.time && <div className="comment-time">{c.time}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="comments-footer">
          <input
            className="comments-input"
            placeholder="Agregar comentario..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="comments-send" onClick={send}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Share sheet ───────────────────────────────────────────────────────────────
const MOCK_CONTACTS = [
  { id: 1, name: 'Martina R.', ini: 'MR', grad: 'linear-gradient(135deg,#FF6B6B,#EE5A24)' },
  { id: 2, name: 'Lucas F.', ini: 'LF', grad: 'linear-gradient(135deg,#4ECDC4,#44BD32)' },
  { id: 3, name: 'Sofía G.', ini: 'SG', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)' },
  { id: 4, name: 'Tomás B.', ini: 'TB', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)' },
  { id: 5, name: 'Valentina M.', ini: 'VM', grad: 'linear-gradient(135deg,#EB4D4B,#6C5CE7)' },
];

function ShareSheet({ address, onClose }: { address: string; onClose: () => void }) {
  const [sent, setSent] = useState<number[]>([]);
  function sendTo(id: number) {
    setSent(prev => [...prev, id]);
  }
  return (
    <div className="comments-sheet-backdrop" onClick={onClose}>
      <div className="comments-sheet" style={{ height: '50%' }} onClick={e => e.stopPropagation()}>
        <div className="comments-sheet-handle" />
        <div className="comments-sheet-hdr">
          <span className="comments-sheet-title">Enviar a...</span>
          <button className="comments-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="comments-body" style={{ gap: 8 }}>
          {MOCK_CONTACTS.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', color: '#fff', flexShrink: 0 }}>{c.ini}</div>
                <span style={{ fontWeight: 600, fontSize: '.9rem', color: '#111' }}>{c.name}</span>
              </div>
              <button
                onClick={() => sendTo(c.id)}
                style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: '.8rem', background: sent.includes(c.id) ? '#f0f0f0' : 'var(--accent)', color: sent.includes(c.id) ? '#888' : '#fff', border: 'none', cursor: 'pointer', transition: 'all .2s' }}
              >
                {sent.includes(c.id) ? 'Enviado ✓' : 'Enviar'}
              </button>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, fontSize: '.82rem', color: '#888', textAlign: 'center' }}>
            Compartiendo: {address}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recommended profiles row ──────────────────────────────────────────────────
function RecommendedRow() {
  const [following, setFollowing] = useState<number[]>([]);
  return (
    <div className="rec-profiles-section">
      <div className="rec-profiles-hdr">
        <span className="rec-profiles-title">Perfiles recomendados</span>
        <button className="rec-profiles-see-all">Ver todos</button>
      </div>
      <div className="rec-profiles-list">
        {RECOMMENDED_PROFILES.map(p => (
          <div key={p.id} className="rec-profile-card">
            <div className="rec-profile-av" style={{ background: p.grad }}>{p.ini}</div>
            <div className="rec-profile-name">{p.name}</div>
            <div className="rec-profile-meta">{p.props} propiedades · {p.followers} seg.</div>
            <button
              className={`rec-follow-btn ${following.includes(p.id) ? 'ing' : ''}`}
              onClick={() => setFollowing(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
            >
              {following.includes(p.id) ? 'Siguiendo ✓' : '+ Seguir'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Post ──────────────────────────────────────────────────────────────────────
interface PostProps {
  property: Property;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onContact: () => void;
  onAgentClick: (agent: AgentInfo) => void;
  allProperties: Property[];
  operationType: OperationType;
}

function Post({ property: p, liked, saved, onLike, onSave, onContact, onAgentClick, allProperties, operationType }: PostProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [following, setFollowing] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [localLikes, setLocalLikes] = useState(p.likes);
  const [descExpanded, setDescExpanded] = useState(false);
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

  const responseTime = RESPONSE_TIMES[p.id % RESPONSE_TIMES.length];
  const isVerified = p.verified ?? (p.id % 3 !== 0);

  // Operation-type adapted price label
  const opLabel = operationType === 'alquiler' ? 'Alquiler' : operationType === 'temporario' ? 'Temporario' : 'Venta';
  const opColor = operationType === 'alquiler' ? '#2979FF' : operationType === 'temporario' ? '#FF9500' : '#00C853';
  const priceLabel = operationType === 'alquiler'
    ? p.price_display + '/mes'
    : operationType === 'temporario'
    ? 'USD ' + Math.round(p.price_usd / 30) + '/noche'
    : p.price_display;

  const DESC_LIMIT = 90;
  const longDesc = p.description.length > DESC_LIMIT;
  const descToShow = descExpanded || !longDesc ? p.description : p.description.slice(0, DESC_LIMIT) + '...';

  function handleLike() {
    setLocalLikes(n => liked ? n - 1 : n + 1);
    onLike();
  }

  return (
    <article className="hpost">
      {showComments && <CommentsSheet onClose={() => setShowComments(false)} />}
      {showShare && <ShareSheet address={p.address} onClose={() => setShowShare(false)} />}

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

      {/* Carousel */}
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
        {imgIdx > 0 && <button className="hpost-arr left" onClick={() => setImgIdx(i => i - 1)}>‹</button>}
        {imgIdx < images.length - 1 && <button className="hpost-arr right" onClick={() => setImgIdx(i => i + 1)}>›</button>}
        <div className="hpost-dots">
          {images.map((_, i) => <div key={i} className={`hpost-dot ${i === imgIdx ? 'act' : ''}`} />)}
        </div>
        <div className="hpost-match">⚡ {p.match_score}% match</div>
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
          <button className="hact" onClick={() => setShowComments(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          {/* Share/send icon (replaces phone) */}
          <button className="hact" onClick={() => setShowShare(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
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
        {/* Operation-adapted price */}
        <div className="hpost-price">{priceLabel}</div>
        {operationType === 'temporario' && (
          <div style={{ fontSize: '.72rem', color: '#888', marginTop: 2 }}>
            Precio total: {p.price_display} · Mín. 2 noches
          </div>
        )}
        {operationType === 'alquiler' && (
          <div style={{ fontSize: '.72rem', color: '#888', marginTop: 2 }}>
            Expensas aprox. USD {Math.round(p.price_usd * 0.08).toLocaleString()}/mes
          </div>
        )}
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
        {/* Expandable description */}
        {p.description && (
          <div className="hpost-desc-wrap">
            <span className="hpost-desc-text">{descToShow}</span>
            {longDesc && (
              <button className="hpost-desc-toggle" onClick={() => setDescExpanded(v => !v)}>
                {descExpanded ? ' ver menos' : ' ver más'}
              </button>
            )}
          </div>
        )}
        <button className="hpost-more" onClick={() => setShowComments(true)}>
          Ver comentarios
        </button>
      </div>

      {/* Always-visible contact CTA */}
      <div className="hpost-contact-bar">
        <button className="hpost-contact-btn" onClick={onContact}>
          💬 Contactar al vendedor
        </button>
      </div>
    </article>
  );
}

// ── Main HomeFeed ─────────────────────────────────────────────────────────────
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

  const hasActiveFilters = activeZone !== 'Todo' || activeType !== 'Todos' || activeFeatures.length > 0 || !!searchQuery || priceMin > 0 || priceMax < 500000;

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
    setSearchQuery(''); setActiveZone('Todo'); setActiveType('Todos');
    setActiveFeatures([]); setPriceMin(0); setPriceMax(500000);
  }

  // Build feed items: insert RecommendedRow every 8 posts
  const feedItems = useMemo(() => {
    const items: Array<{ type: 'post'; prop: Property } | { type: 'rec'; key: string }> = [];
    filtered.forEach((prop, i) => {
      items.push({ type: 'post', prop });
      if ((i + 1) % 8 === 0) items.push({ type: 'rec', key: `rec-${i}` });
    });
    return items;
  }, [filtered]);

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
          <input autoFocus className="home-filter-input" placeholder="Buscar por barrio, dirección..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <div className="home-filter-row">
            <span className="home-filter-label">Zona</span>
            <div className="home-filter-chips">
              {ZONES.map(f => <button key={f} className={`hfilt ${activeZone === f ? 'act' : ''}`} onClick={() => setActiveZone(f)}>{f}</button>)}
            </div>
          </div>
          <div className="home-filter-row">
            <span className="home-filter-label">Tipo</span>
            <div className="home-filter-chips">
              {TYPE_FILTERS.map(f => <button key={f} className={`hfilt ${activeType === f ? 'act' : ''}`} onClick={() => setActiveType(f)}>{f}</button>)}
            </div>
          </div>
          <button className="home-filter-advanced-toggle" onClick={() => setShowAdvanced(v => !v)}>
            {showAdvanced ? '▲ Menos filtros' : '▼ Más filtros'}
          </button>
          {showAdvanced && (
            <>
              <div className="home-filter-row">
                <span className="home-filter-label">💰 Precio (USD)</span>
                <div className="hfilt-price-row">
                  <input className="hfilt-price-inp" type="number" placeholder="Mín" value={priceMin || ''} onChange={e => setPriceMin(+e.target.value || 0)} />
                  <span style={{ color: '#aaa' }}>—</span>
                  <input className="hfilt-price-inp" type="number" placeholder="Máx" value={priceMax >= 500000 ? '' : priceMax} onChange={e => setPriceMax(+e.target.value || 500000)} />
                </div>
              </div>
              <div className="home-filter-row">
                <span className="home-filter-label">✨ Características</span>
                <div className="home-filter-chips">
                  {FEATURES_FILTER.map(f => <button key={f} className={`hfilt ${activeFeatures.includes(f) ? 'act' : ''}`} onClick={() => toggleFeature(f)}>{f}</button>)}
                </div>
              </div>
              {operationType === 'temporario' && (
                <div className="home-filter-row">
                  <span className="home-filter-label">📅 Temporario</span>
                  <div className="home-filter-chips">
                    {['Por noche', 'Por semana', 'WiFi', 'Cocina', 'Ropa de cama', 'Mascotas'].map(f => (
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

      {/* Stories */}
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

      {hasActiveFilters && (
        <div className="home-results-bar">
          <span>{filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} · {operationType === 'venta' ? 'Venta' : operationType === 'alquiler' ? 'Alquiler' : 'Temporario'}</span>
          <button onClick={clearFilters} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Limpiar</button>
        </div>
      )}

      {/* Feed with recommended profiles every 8 posts */}
      <div className="hposts">
        {filtered.length === 0 ? (
          <div className="xempty" style={{ marginTop: 40 }}>
            <div className="ico">🏘</div>
            <div>No hay propiedades con esos filtros</div>
            <button className="home-filter-clear" style={{ margin: '12px auto 0', display: 'block' }} onClick={clearFilters}>Ver todas</button>
          </div>
        ) : (
          feedItems.map(item =>
            item.type === 'rec'
              ? <RecommendedRow key={item.key} />
              : <Post
                  key={item.prop.id}
                  property={item.prop}
                  liked={liked.includes(item.prop.id)}
                  saved={saved.includes(item.prop.id)}
                  onLike={() => onLike(item.prop.id)}
                  onSave={() => onSave(item.prop.id)}
                  onContact={() => onContactChat(item.prop.id)}
                  onAgentClick={setAgentModal}
                  allProperties={properties}
                  operationType={operationType}
                />
          )
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
            const prop = properties.find(x => x.neighborhood === agentModal.neighborhood);
            if (prop) onContactChat(prop.id);
            setAgentModal(null);
          }}
        />
      )}
    </div>
  );
}
