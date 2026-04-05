'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import type { Property, OperationType } from '../types';
import AgentProfileModal, { type AgentInfo } from './AgentProfileModal';

const STORIES = [
  { id: 1, name: 'Palermo Prop.', grad: 'linear-gradient(135deg,#FF3322,#FF6B5B)', ini: 'PP' },
  { id: 2, name: 'Belgrano R.', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', ini: 'BR' },
  { id: 3, name: 'Núñez Homes', grad: 'linear-gradient(135deg,#00B09B,#96C93D)', ini: 'NH' },
  { id: 4, name: 'Recoleta+', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', ini: 'R+' },
  { id: 5, name: 'VCrespo360', grad: 'linear-gradient(135deg,#2979FF,#00B0FF)', ini: 'VC' },
  { id: 6, name: 'Caballito+', grad: 'linear-gradient(135deg,#EB4D4B,#6C5CE7)', ini: 'C+' },
  { id: 7, name: 'Saavedra Br.', grad: 'linear-gradient(135deg,#11998e,#38ef7d)', ini: 'SB' },
];

export const AGENT_GRADS = [
  'linear-gradient(135deg,#FF3322,#FF6B5B)',
  'linear-gradient(135deg,#6C5CE7,#A29BFE)',
  'linear-gradient(135deg,#00B09B,#96C93D)',
  'linear-gradient(135deg,#2979FF,#00B0FF)',
  'linear-gradient(135deg,#F9CA24,#F0932B)',
  'linear-gradient(135deg,#EB4D4B,#6C5CE7)',
];

// Individual agents linked to agencies
export const MOCK_AGENTS = [
  { name: 'Juan Martínez', ini: 'JM', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { name: 'Sofía Herrera', ini: 'SH', grad: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { name: 'Carlos Vega', ini: 'CV', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { name: 'Valentina Cruz', ini: 'VC', grad: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { name: 'Pablo Ríos', ini: 'PR', grad: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { name: 'Ana Gómez', ini: 'AG', grad: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
];

const ZONES = ['Todo', 'Palermo', 'Belgrano', 'Recoleta', 'Núñez', 'Villa Crespo', 'Caballito', 'Villa Urquiza', 'Almagro'];
const TYPE_FILTERS = ['Todos', 'Monoamb.', '2 amb', '3 amb', 'Casa', 'PH'];
const FEATURES_FILTER = ['Cochera', 'Balcón', 'Terraza', 'Pileta', 'Amoblado', 'Mascotas', 'Apto cred.', 'Apto prof.'];
const RESPONSE_TIMES = ['Responde en 1h', 'Responde rápido', 'Activo hoy', 'Activo esta semana'];

const RECOMMENDED_PROFILES = [
  { id: 1, name: 'Palermo Prop.', grad: 'linear-gradient(135deg,#FF3322,#FF6B5B)', ini: 'PP', props: 24, followers: '1.2K' },
  { id: 2, name: 'Recoleta+', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', ini: 'R+', props: 18, followers: '980' },
  { id: 3, name: 'NúñezHomes', grad: 'linear-gradient(135deg,#00B09B,#96C93D)', ini: 'NH', props: 31, followers: '2.1K' },
  { id: 4, name: 'VCrespo360', grad: 'linear-gradient(135deg,#2979FF,#00B0FF)', ini: 'VC', props: 12, followers: '654' },
  { id: 5, name: 'BelgranoR.', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', ini: 'BR', props: 45, followers: '3.4K' },
];

// ── Comments bottom sheet ────────────────────────────────────────────────────
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

// ── Share sheet ──────────────────────────────────────────────────────────────
const MOCK_CONTACTS = [
  { id: 1, name: 'Martina R.', ini: 'MR', grad: 'linear-gradient(135deg,#FF6B6B,#EE5A24)' },
  { id: 2, name: 'Lucas F.', ini: 'LF', grad: 'linear-gradient(135deg,#4ECDC4,#44BD32)' },
  { id: 3, name: 'Sofía G.', ini: 'SG', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)' },
  { id: 4, name: 'Tomás B.', ini: 'TB', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)' },
  { id: 5, name: 'Valentina M.', ini: 'VM', grad: 'linear-gradient(135deg,#EB4D4B,#6C5CE7)' },
];

function ShareSheet({ address, onClose }: { address: string; onClose: () => void }) {
  const [sent, setSent] = useState<number[]>([]);
  return (
    <div className="comments-sheet-backdrop" onClick={onClose}>
      <div className="comments-sheet" style={{ height: '55%' }} onClick={e => e.stopPropagation()}>
        <div className="comments-sheet-handle" />
        <div className="comments-sheet-hdr">
          <span className="comments-sheet-title">Enviar a...</span>
          <button className="comments-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="comments-body" style={{ gap: 4 }}>
          {MOCK_CONTACTS.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', color: '#fff', flexShrink: 0 }}>{c.ini}</div>
                <span style={{ fontWeight: 600, fontSize: '.9rem', color: '#111' }}>{c.name}</span>
              </div>
              <button
                onClick={() => setSent(p => [...p, c.id])}
                style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: '.8rem', background: sent.includes(c.id) ? '#f0f0f0' : 'var(--accent)', color: sent.includes(c.id) ? '#888' : '#fff', border: 'none', cursor: 'pointer', transition: 'all .2s' }}
              >
                {sent.includes(c.id) ? 'Enviado ✓' : 'Enviar'}
              </button>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, fontSize: '.8rem', color: '#aaa', textAlign: 'center' }}>
            {address}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recommended profiles row ─────────────────────────────────────────────────
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
            <div className="rec-profile-meta">{p.props} props · {p.followers}</div>
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

// ── Post ─────────────────────────────────────────────────────────────────────
interface PostProps {
  property: Property;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onContact: () => void;
  onAgentClick: (agent: AgentInfo) => void;
  operationType: OperationType;
}

function Post({ property: p, liked, saved, onLike, onSave, onContact, onAgentClick, operationType }: PostProps) {
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

  // Agency (inmobiliaria)
  const agencyName = p.neighborhood + ' Propiedades';
  const agencyGrad = AGENT_GRADS[p.id % AGENT_GRADS.length];
  const agencyIni = p.neighborhood.substring(0, 2).toUpperCase();

  // Individual agent
  const agent = MOCK_AGENTS[p.id % MOCK_AGENTS.length];

  const agentInfo: AgentInfo = { name: agencyName, ini: agencyIni, grad: agencyGrad, neighborhood: p.neighborhood };

  const responseTime = RESPONSE_TIMES[p.id % RESPONSE_TIMES.length];
  const isVerified = p.verified ?? (p.id % 3 !== 0);

  // Price adapted to operation type
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

      {/* Header — agency + individual agent */}
      <div className="hpost-hdr">
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}
          onClick={() => onAgentClick(agentInfo)}
        >
          <div className="hpost-av" style={{ background: agencyGrad }}>{agencyIni}</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="hpost-nm">{agencyName}</div>
              {isVerified && <span className="trust-verified-sm">✓</span>}
            </div>
            <div className="hpost-loc">📍 {p.neighborhood} · {p.badge}</div>
            {/* Individual agent linked to agency */}
            <div className="hpost-agent-row">
              <div className="hpost-agent-av" style={{ background: agent.grad }}>{agent.ini}</div>
              <span className="hpost-agent-name">{agent.name}</span>
              <span className="hpost-agent-role">· Agente</span>
            </div>
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

      {/* Actions — stopPropagation on all to prevent scroll jumps */}
      <div className="hpost-acts">
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <button className={`hact ${liked ? 'liked' : ''}`} onClick={e => { e.stopPropagation(); handleLike(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? '#1A56DB' : 'none'} stroke={liked ? '#1A56DB' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button className="hact" onClick={e => { e.stopPropagation(); setShowComments(true); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button className="hact" onClick={e => { e.stopPropagation(); setShowShare(true); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <button className={`hact ${saved ? 'saved' : ''}`} onClick={e => { e.stopPropagation(); onSave(); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? '#2979FF' : 'none'} stroke={saved ? '#2979FF' : 'currentColor'} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="hpost-info">
        <div className="hpost-likes">{localLikes.toLocaleString()} me gusta</div>
        <div className="hpost-price">{priceLabel}</div>
        {operationType === 'temporario' && (
          <div style={{ fontSize: '.72rem', color: '#888', marginTop: 2 }}>Precio total: {p.price_display} · Mín. 2 noches</div>
        )}
        {operationType === 'alquiler' && (
          <div style={{ fontSize: '.72rem', color: '#888', marginTop: 2 }}>Expensas aprox. USD {Math.round(p.price_usd * 0.08).toLocaleString()}/mes</div>
        )}
        <div className="hpost-addr"><strong>{agencyName}</strong> 📍 {p.address}</div>
        {(p.bedrooms || p.area_m2) && (
          <div className="hpost-meta">
            {p.bedrooms && <span>🛏 {p.bedrooms} amb.</span>}
            {p.area_m2 && <span>📐 {p.area_m2} m²</span>}
          </div>
        )}
        <div className="hpost-tags">
          {p.tags.slice(0, 4).map(t => <span key={t} className="hpost-tag">{t}</span>)}
        </div>
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
        <button className="hpost-more" onClick={() => setShowComments(true)}>Ver comentarios</button>
      </div>

      {/* Contact CTA — references individual agent directly */}
      <div className="hpost-contact-bar">
        <div className="hpost-agent-preview">
          <div className="hpost-agent-av" style={{ background: agent.grad, width: 28, height: 28, fontSize: '.65rem' }}>{agent.ini}</div>
          <span style={{ fontSize: '.78rem', color: '#555' }}>Agente: <strong>{agent.name}</strong></span>
        </div>
        <button className="hpost-contact-btn" onClick={onContact}>
          💬 Contactar
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
  userIni?: string;
  userGrad?: string;
}

export default function HomeFeed({ properties, liked, saved, onLike, onSave, onContactChat, scrollRef, operationType, userIni = 'YO', userGrad = 'linear-gradient(135deg,var(--accent),#aa00ff)' }: Props) {
  const [seenStories, setSeenStories] = useState<number[]>([]);
  const [storyIdx, setStoryIdx] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const storyActiveRef = useRef(false);
  const [svDragY, setSvDragY] = useState(0);
  const svTouchStartY = useRef(0);
  const [storyReplyText, setStoryReplyText] = useState('');
  const [agentModal, setAgentModal] = useState<AgentInfo | null>(null);

  // Filter state: "pending" (being configured) vs "applied" (active on feed)
  const [showFilters, setShowFilters] = useState(false);
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingZone, setPendingZone] = useState('Todo');
  const [pendingType, setPendingType] = useState('Todos');
  const [pendingFeatures, setPendingFeatures] = useState<string[]>([]);
  const [pendingPriceMin, setPendingPriceMin] = useState(0);
  const [pendingPriceMax, setPendingPriceMax] = useState(500000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Applied filters (what actually filters the feed)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedZone, setAppliedZone] = useState('Todo');
  const [appliedType, setAppliedType] = useState('Todos');
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([]);
  const [appliedPriceMin, setAppliedPriceMin] = useState(0);
  const [appliedPriceMax, setAppliedPriceMax] = useState(500000);

  const hasApplied = appliedZone !== 'Todo' || appliedType !== 'Todos' || appliedFeatures.length > 0 || !!appliedSearch || appliedPriceMin > 0 || appliedPriceMax < 500000;

  function togglePendingFeature(f: string) {
    setPendingFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  function applyFilters() {
    setAppliedSearch(pendingSearch);
    setAppliedZone(pendingZone);
    setAppliedType(pendingType);
    setAppliedFeatures(pendingFeatures);
    setAppliedPriceMin(pendingPriceMin);
    setAppliedPriceMax(pendingPriceMax);
    setShowFilters(false);
  }

  function clearFilters() {
    setAppliedSearch(''); setAppliedZone('Todo'); setAppliedType('Todos');
    setAppliedFeatures([]); setAppliedPriceMin(0); setAppliedPriceMax(500000);
    setPendingSearch(''); setPendingZone('Todo'); setPendingType('Todos');
    setPendingFeatures([]); setPendingPriceMin(0); setPendingPriceMax(500000);
    setShowFilters(false);
  }

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchZone = appliedZone === 'Todo' || p.neighborhood === appliedZone;
      const matchType = appliedType === 'Todos' ||
        (appliedType === 'Monoamb.' && p.type === 'monoambiente') ||
        (appliedType === '2 amb' && p.type === '2amb') ||
        (appliedType === '3 amb' && p.type === '3amb') ||
        (appliedType === 'Casa' && p.type === 'casa') ||
        (appliedType === 'PH' && p.type === 'ph');
      const matchSearch = !appliedSearch ||
        p.address.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(appliedSearch.toLowerCase());
      const matchPrice = p.price_usd >= appliedPriceMin && p.price_usd <= appliedPriceMax;
      const matchFeatures = appliedFeatures.length === 0 ||
        appliedFeatures.every(f => p.tags.some(t => t.toLowerCase().includes(f.toLowerCase())));
      return matchZone && matchType && matchSearch && matchPrice && matchFeatures;
    });
  }, [properties, appliedZone, appliedType, appliedSearch, appliedPriceMin, appliedPriceMax, appliedFeatures]);

  // Story navigation with left/right tap
  const startStory = useCallback((idx: number) => {
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    storyActiveRef.current = true;
    setStoryIdx(idx);
    setStoryProgress(0);
    setSeenStories(prev => prev.includes(STORIES[idx].id) ? prev : [...prev, STORIES[idx].id]);
    const start = Date.now();
    storyTimerRef.current = setInterval(() => {
      if (!storyActiveRef.current) { clearInterval(storyTimerRef.current!); return; }
      const prog = (Date.now() - start) / 5000;
      setStoryProgress(Math.min(prog, 1));
      if (prog >= 1) {
        clearInterval(storyTimerRef.current!);
        const next = idx + 1;
        if (next < STORIES.length && storyActiveRef.current) {
          startStory(next);
        } else {
          storyActiveRef.current = false;
          setStoryIdx(null);
        }
      }
    }, 50);
  }, []); // eslint-disable-line

  function handleStoryTap(e: React.MouseEvent) {
    if (storyIdx === null || svDragY > 5) return;
    const x = e.clientX;
    const half = window.innerWidth / 2;
    if (x < half) {
      if (storyIdx > 0) startStory(storyIdx - 1);
      else closeStory();
    } else {
      if (storyIdx < STORIES.length - 1) startStory(storyIdx + 1);
      else closeStory();
    }
  }

  function closeStory() {
    storyActiveRef.current = false;
    if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    setStoryIdx(null);
    setSvDragY(0);
    setStoryReplyText('');
  }

  function onSvTouchStart(e: React.TouchEvent) {
    svTouchStartY.current = e.touches[0].clientY;
  }
  function onSvTouchMove(e: React.TouchEvent) {
    const dy = e.touches[0].clientY - svTouchStartY.current;
    if (dy > 0) {
      e.stopPropagation();
      setSvDragY(dy);
    }
  }
  function onSvTouchEnd() {
    if (svDragY > 80) closeStory();
    else setSvDragY(0);
  }

  // Feed: insert RecommendedRow every 8 posts
  const feedItems = useMemo(() => {
    const items: Array<{ type: 'post'; prop: Property } | { type: 'rec'; key: string }> = [];
    filtered.forEach((prop, i) => {
      items.push({ type: 'post', prop });
      if ((i + 1) % 8 === 0) items.push({ type: 'rec', key: `rec-${i}` });
    });
    return items;
  }, [filtered]);

  const openStory = storyIdx !== null ? STORIES[storyIdx] : null;

  return (
    <div className="hv" ref={scrollRef}>
      {/* Stories — user's own "+" first, then agency stories */}
      <div className="stories-strip">
        {/* User add-story button */}
        <button className="story-btn" onClick={() => alert('Próximamente: subir historia')}>
          <div className="story-ring-add">
            <div className="story-av" style={{ background: userGrad }}>{userIni}</div>
            <div className="story-add-plus">+</div>
          </div>
          <span className="story-nm">Tu historia</span>
        </button>
        {STORIES.map((s, i) => (
          <button key={s.id} className="story-btn" onClick={() => startStory(i)}>
            <div className={`story-ring ${seenStories.includes(s.id) ? 'seen' : ''}`}>
              <div className="story-av" style={{ background: s.grad }}>{s.ini}</div>
            </div>
            <span className="story-nm">{s.name}</span>
          </button>
        ))}
      </div>
      <div className="stories-divider" />

      {/* Feed */}
      <div className="hposts">
        {filtered.length === 0 ? (
          <div className="xempty" style={{ marginTop: 40 }}>
            <div className="ico">🏘</div>
            <div>No hay propiedades con esos filtros</div>
            <button className="filter-clear-btn" style={{ margin: '12px auto 0', display: 'block' }} onClick={clearFilters}>Ver todas</button>
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
                  operationType={operationType}
                />
          )
        )}
      </div>

      {/* Story viewer — tap left/right, swipe down to close */}
      {openStory && (
        <div
          className="story-viewer"
          onClick={handleStoryTap}
          onTouchStart={onSvTouchStart}
          onTouchMove={onSvTouchMove}
          onTouchEnd={onSvTouchEnd}
          style={svDragY > 0 ? { transform: `translateY(${svDragY}px)`, transition: 'none', borderRadius: `${Math.min(svDragY / 3, 20)}px` } : undefined}
        >
          <div className="sv-progress-bar">
            <div className="sv-progress-fill" style={{ width: `${storyProgress * 100}%` }} />
          </div>
          <div className="sv-tap-hint sv-tap-left">‹</div>
          <div className="sv-tap-hint sv-tap-right">›</div>
          <div className="sv-header" onClick={e => e.stopPropagation()}>
            <div className="sv-av" style={{ background: openStory.grad }}>{openStory.ini}</div>
            <span className="sv-nm">{openStory.name}</span>
            <button className="sv-close" onClick={closeStory}>✕</button>
          </div>
          <div className="sv-content" onClick={e => e.stopPropagation()}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: openStory.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {openStory.ini}
            </div>
            <div className="sv-title">{openStory.name}</div>
            <div className="sv-sub">🏡 Inmobiliaria · Buenos Aires</div>
            <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.6)', marginTop: 8 }}>
              {storyIdx !== null ? `${storyIdx + 1} / ${STORIES.length}` : ''}
            </div>
          </div>
          {/* Reply bar */}
          <div className="sv-reply-bar" onClick={e => e.stopPropagation()}>
            <input
              className="sv-reply-inp"
              placeholder={`Responder a ${openStory.name}...`}
              value={storyReplyText}
              onChange={e => setStoryReplyText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && storyReplyText.trim()) {
                  const prop = properties[(storyIdx ?? 0) % Math.max(properties.length, 1)];
                  if (prop) onContactChat(prop.id);
                  setStoryReplyText('');
                }
              }}
            />
            <button
              className="sv-reply-send"
              onClick={() => {
                if (!storyReplyText.trim()) return;
                const prop = properties[(storyIdx ?? 0) % Math.max(properties.length, 1)];
                if (prop) onContactChat(prop.id);
                setStoryReplyText('');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
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
