'use client';

import { useState } from 'react';
import type { User, Property } from '../types';
import { insertProperty, upgradeToSeller } from '../lib/supabase';

interface Props {
  user: User;
  viewed: number;
  likedCount: number;
  savedCount: number;
  savedProperties: Property[];
  onLogout: () => void;
  onSavePrefs: (prefs: Record<string, unknown>) => void;
  onSelectProperty: (id: number) => void;
  onUserUpgrade: (user: User) => void;
}

const ZONES = ['Palermo', 'Belgrano', 'Recoleta', 'Núñez', 'Villa Crespo', 'Caballito', 'Villa Urquiza', 'Colegiales', 'Saavedra', 'Almagro'];
const TYPES = ['Departamento', 'Casa', 'PH', 'Loft', 'Monoambiente'];
const ROOMS = ['1', '2', '3', '4+'];
const FEATURES = ['Balcón', 'Terraza', 'Cochera', 'Pileta', 'Luminoso', 'A estrenar', 'Reciclado', 'Vista panorámica', 'SUM'];
const PROP_TYPES = [
  { val: 'monoambiente', label: 'Monoambiente' },
  { val: '2amb', label: '2 Ambientes' },
  { val: '3amb', label: '3 Ambientes' },
  { val: 'casa', label: 'Casa' },
  { val: 'ph', label: 'PH' },
  { val: 'loft', label: 'Loft' },
];

const MOCK_POSTS = [
  { id: 1, img: 'https://picsum.photos/id/1029/400/400', price: 'USD 185.000', addr: 'Thames 1842', views: 4230, likes: 89 },
  { id: 2, img: 'https://picsum.photos/id/1048/400/400', price: 'USD 245.000', addr: 'Libertador 3200', views: 1820, likes: 45 },
  { id: 3, img: 'https://picsum.photos/id/1047/400/400', price: 'USD 92.000', addr: 'Malabia 654', views: 3100, likes: 67 },
  { id: 4, img: 'https://picsum.photos/id/1076/400/400', price: 'USD 320.000', addr: 'Olazábal 4500', views: 2750, likes: 112 },
  { id: 5, img: 'https://picsum.photos/id/1080/400/400', price: 'USD 158.000', addr: 'Quintana 580', views: 5400, likes: 203 },
  { id: 6, img: 'https://picsum.photos/id/1082/400/400', price: 'USD 195.000', addr: 'Triunvirato 4200', views: 980, likes: 31 },
];

const FEATURED_STORIES = [
  { id: 1, label: 'Palermo', img: 'https://picsum.photos/id/1029/200/200' },
  { id: 2, label: 'Belgrano', img: 'https://picsum.photos/id/1048/200/200' },
  { id: 3, label: 'Recoleta', img: 'https://picsum.photos/id/1080/200/200' },
];

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <div className={`tgl ${on ? 'on' : ''}`} onClick={() => setOn(v => !v)} />;
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Palermo');
  const [propType, setPropType] = useState('2amb');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contentType, setContentType] = useState<'photo' | 'video'>('photo');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit() {
    if (!address || !price) { setMsg('❌ Dirección y precio son obligatorios'); return; }
    const priceNum = parseInt(price.replace(/\D/g, ''));
    if (isNaN(priceNum)) { setMsg('❌ Precio inválido'); return; }
    setLoading(true); setMsg('');
    const result = await insertProperty({
      address, neighborhood,
      type: propType as 'monoambiente' | '2amb' | '3amb' | 'casa' | 'ph' | 'loft',
      price_usd: priceNum,
      price_display: 'USD ' + priceNum.toLocaleString('es-AR'),
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      area_m2: area ? parseInt(area) : null,
      description,
      image_url: imageUrl || null,
      gradient: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',
      badge: 'Nuevo', match_score: 80,
      tags: [propType, area ? area + ' m²' : '', neighborhood].filter(Boolean),
      featured: false,
    });
    setLoading(false);
    if ('error' in result && result.error) setMsg('❌ ' + result.error);
    else { setMsg('✅ Propiedad publicada'); setTimeout(onDone, 1500); }
  }

  return (
    <div className="upload-modal">
      <div className="upload-modal-inner">
        <div className="upload-modal-hdr">
          <button className="agent-back" onClick={onDone}>✕</button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem' }}>Subir contenido</span>
          <div style={{ width: 32 }} />
        </div>

        <div className="upload-tabs">
          <button className={`upload-tab ${contentType === 'photo' ? 'active' : ''}`} onClick={() => setContentType('photo')}>
            📸 Carrusel de fotos
          </button>
          <button className={`upload-tab ${contentType === 'video' ? 'active' : ''}`} onClick={() => setContentType('video')}>
            🎬 Video / Reel
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>
          {msg && <div className={`up-msg ${msg.startsWith('✅') ? 'ok' : 'err'}`}>{msg}</div>}

          <div className="upload-img-placeholder">
            {contentType === 'photo' ? (
              <>
                <div style={{ fontSize: '2.5rem' }}>📸</div>
                <div style={{ marginTop: 8, fontSize: '.85rem', color: '#888' }}>Tocá para subir fotos (hasta 10)</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2.5rem' }}>🎬</div>
                <div style={{ marginTop: 8, fontSize: '.85rem', color: '#888' }}>Tocá para subir video (máx. 60s)</div>
              </>
            )}
          </div>

          <input className="inp" placeholder="URL de imagen" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <input className="inp" placeholder="Dirección (ej: Thames 1842, Palermo)" value={address} onChange={e => setAddress(e.target.value)} />
          <div className="up-row">
            <select className="inp" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <select className="inp" value={propType} onChange={e => setPropType(e.target.value)}>
              {PROP_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
            </select>
          </div>
          <div className="up-row">
            <input className="inp" placeholder="Precio USD" value={price} onChange={e => setPrice(e.target.value)} />
            <input className="inp" placeholder="m²" value={area} onChange={e => setArea(e.target.value)} type="number" />
          </div>
          <input className="inp" placeholder="Ambientes" value={bedrooms} onChange={e => setBedrooms(e.target.value)} type="number" />
          <textarea className="inp up-desc" placeholder="Descripción de la propiedad..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <button className="btn-p" style={{ width: '100%' }} onClick={submit} disabled={loading}>
            {loading ? 'Publicando...' : '🚀 Publicar propiedad'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsMenu({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  return (
    <div className="settings-menu" onClick={onClose}>
      <div className="settings-menu-box" onClick={e => e.stopPropagation()}>
        <div className="settings-menu-item">⚙️ Editar perfil</div>
        <div className="settings-menu-item">🔖 Contenido guardado</div>
        <div className="settings-menu-item">❤️ Publicaciones con likes</div>
        <div className="settings-menu-item">📊 Estadísticas</div>
        <div className="settings-menu-item">🔒 Privacidad</div>
        <div className="settings-menu-item">🔔 Notificaciones</div>
        <div className="settings-menu-item" style={{ color: 'var(--accent)' }} onClick={onLogout}>🚪 Cerrar sesión</div>
      </div>
    </div>
  );
}

// ── Full seller upgrade flow ──────────────────────────────────────────────────
interface UpgradeFormData {
  businessName: string;
  sellerType: 'inmobiliaria' | 'particular' | 'desarrollador';
  zone: string;
  phone: string;
  professionalEmail: string;
  bio: string;
  profileImg: string;
  coverImg: string;
}

type UpgradeStep = 'form' | 'preview' | 'done';

function SellerUpgradeFlow({ user, onClose, onConfirm }: {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [step, setStep] = useState<UpgradeStep>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<UpgradeFormData>({
    businessName: user.name,
    sellerType: 'inmobiliaria',
    zone: 'Palermo',
    phone: '',
    professionalEmail: user.email,
    bio: '',
    profileImg: '',
    coverImg: '',
  });

  function set(k: keyof UpgradeFormData, v: string) {
    setData(prev => ({ ...prev, [k]: v }));
  }

  function validateForm() {
    if (!data.businessName.trim()) return 'El nombre o razón social es obligatorio';
    if (!data.phone.trim()) return 'El teléfono de contacto es obligatorio';
    if (!data.professionalEmail.trim()) return 'El email profesional es obligatorio';
    return '';
  }

  async function handleConfirm() {
    setLoading(true);
    const { error: err } = await upgradeToSeller(user.id) as { error?: string; success?: boolean };
    setLoading(false);
    if (err) { setError(err); return; }
    setStep('done');
    setTimeout(onConfirm, 1500);
  }

  if (step === 'done') {
    return (
      <div className="upgrade-flow">
        <div className="upgrade-flow-inner" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', marginBottom: 8 }}>¡Bienvenido como vendedor!</div>
          <div style={{ color: '#666', fontSize: '.9rem' }}>Tu perfil profesional está activo.</div>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="upgrade-flow">
        <div className="upgrade-flow-inner">
          <div className="upgrade-flow-hdr">
            <button className="agent-back" onClick={() => setStep('form')}>‹</button>
            <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>Vista previa del perfil</span>
            <div style={{ width: 36 }} />
          </div>

          {/* Cover */}
          <div className="seller-preview-cover" style={{
            backgroundImage: data.coverImg ? `url('${data.coverImg}')` : 'linear-gradient(135deg,var(--accent),#aa00ff)',
          }} />

          {/* Avatar */}
          <div className="seller-preview-av-wrap">
            <div className="seller-preview-av" style={{
              backgroundImage: data.profileImg ? `url('${data.profileImg}')` : undefined,
              background: data.profileImg ? undefined : 'linear-gradient(135deg,var(--accent),var(--purple))',
            }}>
              {!data.profileImg && user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>{data.businessName}</span>
                <span className="trust-verified-sm" style={{ fontSize: '1rem' }}>✓</span>
              </div>
              <div style={{ fontSize: '.8rem', color: '#888' }}>
                {data.sellerType === 'inmobiliaria' ? '🏢 Inmobiliaria' : data.sellerType === 'desarrollador' ? '🏗 Desarrollador' : '👤 Particular'} · 📍 {data.zone}
              </div>
            </div>
          </div>

          {data.bio && <div style={{ padding: '0 20px 16px', fontSize: '.88rem', color: '#555', lineHeight: 1.5 }}>{data.bio}</div>}

          <div className="seller-preview-contact">
            <div style={{ fontSize: '.82rem', color: '#555' }}>📱 {data.phone}</div>
            <div style={{ fontSize: '.82rem', color: '#555' }}>✉️ {data.professionalEmail}</div>
          </div>

          {error && <div className="up-msg err" style={{ margin: '0 16px 8px' }}>{error}</div>}

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <button className="btn-p" style={{ width: '100%' }} onClick={handleConfirm} disabled={loading}>
              {loading ? 'Activando...' : '✅ Confirmar y activar perfil'}
            </button>
            <button onClick={() => setStep('form')} style={{ width: '100%', padding: 14, background: 'none', border: '1.5px solid rgba(0,0,0,.12)', borderRadius: 50, fontWeight: 600, cursor: 'pointer', color: '#333' }}>
              Editar datos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // step === 'form'
  return (
    <div className="upgrade-flow">
      <div className="upgrade-flow-inner">
        <div className="upgrade-flow-hdr">
          <button className="agent-back" onClick={onClose}>✕</button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>Cambiar a vendedor</span>
          <div style={{ width: 36 }} />
        </div>

        <div className="upgrade-flow-body">
          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Tipo de cuenta</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['inmobiliaria', 'particular', 'desarrollador'] as const).map(t => (
                <button
                  key={t}
                  className={`upgrade-type-btn ${data.sellerType === t ? 'active' : ''}`}
                  onClick={() => set('sellerType', t)}
                >
                  {t === 'inmobiliaria' ? '🏢 Inmobiliaria' : t === 'desarrollador' ? '🏗 Desarrollador' : '👤 Particular'}
                </button>
              ))}
            </div>
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Nombre o razón social *</div>
            <input className="inp" placeholder="Ej: García Propiedades" value={data.businessName} onChange={e => set('businessName', e.target.value)} />
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Zona de trabajo *</div>
            <select className="inp" value={data.zone} onChange={e => set('zone', e.target.value)}>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Teléfono de contacto *</div>
            <input className="inp" placeholder="+54 11 1234-5678" value={data.phone} onChange={e => set('phone', e.target.value)} type="tel" />
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Email profesional *</div>
            <input className="inp" placeholder="info@tupropiedades.com" value={data.professionalEmail} onChange={e => set('professionalEmail', e.target.value)} type="email" />
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Descripción del perfil</div>
            <textarea className="inp up-desc" placeholder="Contá brevemente quién sos y en qué zonas trabajás..." value={data.bio} onChange={e => set('bio', e.target.value)} rows={3} />
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Foto de perfil (URL, opcional)</div>
            <input className="inp" placeholder="https://..." value={data.profileImg} onChange={e => set('profileImg', e.target.value)} />
          </div>

          <div className="upgrade-flow-section">
            <div className="upgrade-section-label">Imagen de portada (URL, opcional)</div>
            <input className="inp" placeholder="https://..." value={data.coverImg} onChange={e => set('coverImg', e.target.value)} />
          </div>

          {error && <div className="up-msg err">{error}</div>}

          <button
            className="btn-p"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => {
              const err = validateForm();
              if (err) { setError(err); return; }
              setError('');
              setStep('preview');
            }}
          >
            Vista previa del perfil →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Followers / Following list modal ─────────────────────────────────────────
const MOCK_FOLLOWERS = [
  { id: 1, name: 'Martina Rodríguez', ini: 'MR', grad: 'linear-gradient(135deg,#FF6B6B,#EE5A24)', mutual: true },
  { id: 2, name: 'Lucas Felitti', ini: 'LF', grad: 'linear-gradient(135deg,#4ECDC4,#44BD32)', mutual: false },
  { id: 3, name: 'Sofía González', ini: 'SG', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', mutual: true },
  { id: 4, name: 'Tomás Bello', ini: 'TB', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', mutual: false },
  { id: 5, name: 'Valentina Mora', ini: 'VM', grad: 'linear-gradient(135deg,#EB4D4B,#6C5CE7)', mutual: true },
  { id: 6, name: 'Ramiro Pérez', ini: 'RP', grad: 'linear-gradient(135deg,#2979FF,#00B0FF)', mutual: false },
];
const MOCK_FOLLOWING = [
  { id: 1, name: 'Palermo Prop.', ini: 'PP', grad: 'linear-gradient(135deg,#FF3322,#FF6B5B)', mutual: false },
  { id: 2, name: 'Recoleta+', ini: 'R+', grad: 'linear-gradient(135deg,#F9CA24,#F0932B)', mutual: false },
  { id: 3, name: 'NúñezHomes', ini: 'NH', grad: 'linear-gradient(135deg,#00B09B,#96C93D)', mutual: false },
  { id: 4, name: 'Sofía González', ini: 'SG', grad: 'linear-gradient(135deg,#6C5CE7,#A29BFE)', mutual: true },
];

function FollowListModal({ title, list, onClose }: {
  title: string;
  list: typeof MOCK_FOLLOWERS;
  onClose: () => void;
}) {
  const [following, setFollowing] = useState<number[]>([]);
  return (
    <div className="follow-modal-backdrop" onClick={onClose}>
      <div className="follow-modal" onClick={e => e.stopPropagation()}>
        <div className="follow-modal-hdr">
          <button className="agent-back" onClick={onClose}>✕</button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>{title}</span>
          <div style={{ width: 36 }} />
        </div>
        <div className="follow-modal-list">
          {list.map(u => (
            <div key={u.id} className="follow-modal-item">
              <div className="follow-modal-av" style={{ background: u.grad }}>{u.ini}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#111' }}>{u.name}</div>
                {u.mutual && <div style={{ fontSize: '.72rem', color: '#888', marginTop: 1 }}>Seguidor en común</div>}
              </div>
              <button
                className={`rec-follow-btn ${following.includes(u.id) ? 'ing' : ''}`}
                onClick={() => setFollowing(prev => prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id])}
              >
                {following.includes(u.id) ? 'Siguiendo ✓' : '+ Seguir'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type ProfileTab = 'posts' | 'saved' | 'prefs' | 'activity';

export default function ProfileView({ user, likedCount, savedProperties, onLogout, onSavePrefs, onSelectProperty, onUserUpgrade }: Props) {
  const ini = user.name.substring(0, 2).toUpperCase();
  const isSeller = user.role === 'seller';
  const [activeTab, setActiveTab] = useState<ProfileTab>(isSeller ? 'posts' : 'activity');
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);
  const [sel, setSel] = useState<Record<string, string[]>>({ zones: [], types: [], rooms: [], features: [] });
  const [budget, setBudget] = useState(200000);

  const toggle = (group: string, val: string) => {
    setSel(prev => ({
      ...prev,
      [group]: prev[group].includes(val) ? prev[group].filter(x => x !== val) : [...prev[group], val],
    }));
  };
  const isOn = (group: string, val: string) => sel[group].includes(val);

  const sellerTabs: { key: ProfileTab; label: string }[] = [
    { key: 'posts', label: 'Publicaciones' },
    { key: 'saved', label: 'Guardados' },
    { key: 'prefs', label: 'Preferencias' },
  ];
  const buyerTabs: { key: ProfileTab; label: string }[] = [
    { key: 'activity', label: 'Actividad' },
    { key: 'saved', label: 'Guardados' },
    { key: 'prefs', label: 'Búsqueda' },
  ];
  const tabs = isSeller ? sellerTabs : buyerTabs;

  return (
    <div className="pv">
      {showUpload && <UploadForm onDone={() => setShowUpload(false)} />}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} onLogout={onLogout} />}
      {followModal === 'followers' && (
        <FollowListModal title={`${MOCK_FOLLOWERS.length} seguidores`} list={MOCK_FOLLOWERS} onClose={() => setFollowModal(null)} />
      )}
      {followModal === 'following' && (
        <FollowListModal title={`${MOCK_FOLLOWING.length} seguidos`} list={MOCK_FOLLOWING} onClose={() => setFollowModal(null)} />
      )}
      {showUpgrade && (
        <SellerUpgradeFlow
          user={user}
          onClose={() => setShowUpgrade(false)}
          onConfirm={() => {
            setShowUpgrade(false);
            onUserUpgrade({ ...user, role: 'seller' });
          }}
        />
      )}

      {/* Header */}
      <div className="phdr">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0 8px' }}>
          <button className="profile-settings-btn" onClick={() => setShowSettings(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 4px 16px' }}>
          <div className="pav">{ini}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="pnm">{user.name}</div>
              {isSeller && <span className="trust-verified-sm" style={{ fontSize: '1rem' }}>✓</span>}
            </div>
            <div className="pem">{user.email}</div>
            {isSeller && <div className="prole">🏢 Vendedor / Inmobiliaria</div>}
          </div>
        </div>

        {/* Stats — always: publicaciones / seguidores / seguidos */}
        <div className="pstats">
          <div className="pstat">
            <div className="pstat-n">{isSeller ? MOCK_POSTS.length : likedCount}</div>
            <div className="pstat-l">Publicaciones</div>
          </div>
          <div className="pstat-div" />
          <button className="pstat pstat-tap" onClick={() => setFollowModal('followers')}>
            <div className="pstat-n">{MOCK_FOLLOWERS.length}</div>
            <div className="pstat-l">Seguidores</div>
          </button>
          <div className="pstat-div" />
          <button className="pstat pstat-tap" onClick={() => setFollowModal('following')}>
            <div className="pstat-n">{MOCK_FOLLOWING.length}</div>
            <div className="pstat-l">Seguidos</div>
          </button>
        </div>
        {/* Seguidores en común (shown when visiting others — mock) */}
        {isSeller && (
          <div className="mutual-followers">
            {MOCK_FOLLOWERS.filter(f => f.mutual).slice(0, 2).map(f => (
              <div key={f.id} className="mutual-av" style={{ background: f.grad }}>{f.ini}</div>
            ))}
            <span className="mutual-text">
              Seguido por {MOCK_FOLLOWERS.filter(f => f.mutual).map(f => f.name.split(' ')[0]).slice(0, 2).join(', ')} y {MOCK_FOLLOWERS.filter(f => f.mutual).length - 2} más
            </span>
          </div>
        )}

        {/* Seller CTA or upgrade */}
        {isSeller ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-p" style={{ flex: 1, padding: '11px 16px', fontSize: '.88rem' }} onClick={() => setShowUpload(true)}>
              + Subir contenido
            </button>
            <button style={{ flex: 1, padding: '11px 16px', fontSize: '.88rem', border: '1.5px solid rgba(0,0,0,.15)', borderRadius: 50, background: 'none', fontWeight: 600, cursor: 'pointer', color: '#333' }}>
              Editar perfil
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <button className="upgrade-btn" onClick={() => setShowUpgrade(true)}>
              🏢 Cambiar a cuenta vendedor
            </button>
          </div>
        )}

        {/* Featured stories (sellers only) */}
        {isSeller && (
          <div className="featured-stories">
            {FEATURED_STORIES.map(s => (
              <div key={s.id} className="feat-story">
                <div className="feat-story-img" style={{ backgroundImage: `url('${s.img}')` }} />
                <div className="feat-story-label">{s.label}</div>
              </div>
            ))}
            <div className="feat-story add">
              <div className="feat-story-add">+</div>
              <div className="feat-story-label">Agregar</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="ptabs">
        {tabs.map(t => (
          <button key={t.key} className={`ptab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Seller: Posts with metrics */}
      {activeTab === 'posts' && isSeller && (
        <div className="seller-posts-grid">
          {MOCK_POSTS.map(p => (
            <div key={p.id} className="seller-post">
              <div className="seller-post-img" style={{ backgroundImage: `url('${p.img}')` }} />
              <div className="seller-post-overlay">
                <span>👁 {(p.views / 1000).toFixed(1)}K</span>
                <span>❤️ {p.likes}</span>
              </div>
              <div className="seller-post-info">
                <div className="seller-post-price">{p.price}</div>
                <div className="seller-post-addr">{p.addr}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved */}
      {activeTab === 'saved' && (
        <div>
          {savedProperties.length === 0 ? (
            <div className="xempty">
              <div className="ico">🔖</div>
              <div>No guardaste propiedades todavía</div>
            </div>
          ) : (
            <div className="saved-grid">
              {savedProperties.map(p => (
                <div key={p.id} className="saved-card" onClick={() => onSelectProperty(p.id)}>
                  <div className="saved-card-img" style={{
                    backgroundImage: `url('${p.image_url || `https://picsum.photos/id/${1029 + p.id}/400/400`}')`,
                  }} />
                  <div className="saved-card-info">
                    <div className="saved-card-price">{p.price_display}</div>
                    <div className="saved-card-addr">{p.address}</div>
                    <div className="saved-card-tags">
                      {p.tags.slice(0, 2).map(t => <span key={t}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'prefs' && (
        <div className="ss">
          <div className="pp">
            {[
              { key: 'zones', label: '📍 Zonas', items: ZONES },
              { key: 'types', label: '🏠 Tipo', items: TYPES },
              { key: 'rooms', label: '🛏 Ambientes', items: ROOMS },
              { key: 'features', label: '✨ Características', items: FEATURES },
            ].map(g => (
              <div key={g.key} className="pg">
                <div className="pgl">{g.label}</div>
                <div className="pos">
                  {g.items.map(v => (
                    <button key={v} className={`pch ${isOn(g.key, v) ? 'sel' : ''}`} onClick={() => toggle(g.key, v)}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className="pg">
              <div className="pgl">💰 Presupuesto máximo (USD)</div>
              <div className="rg">
                <input type="range" min={30000} max={500000} step={10000} value={budget} onChange={e => setBudget(+e.target.value)} />
                <div className="rgl">
                  <span>USD 30K</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>USD {budget >= 1000 ? Math.round(budget / 1000) + 'K' : budget}</span>
                  <span>USD 500K</span>
                </div>
              </div>
            </div>
            <button className="btn-p" style={{ width: '100%', marginTop: 12 }} onClick={() => onSavePrefs({ ...sel, budget })}>
              Guardar preferencias
            </button>
          </div>
        </div>
      )}

      {/* Activity (buyers) */}
      {activeTab === 'activity' && (
        <div>
          <div className="ss">
            <div className="ss-t" style={{ padding: '16px 16px 8px' }}>⚙️ Configuración</div>
            <div className="ss-c">
              <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🔔</div><div><div className="ss-rla">Notificaciones push</div><div className="ss-rs">Nuevas propiedades que matchean</div></div></div><Toggle /></div>
              <div className="ss-r"><div className="ss-rl"><div className="ss-ri">📧</div><div><div className="ss-rla">Resumen semanal</div><div className="ss-rs">Email con las mejores propiedades</div></div></div><Toggle /></div>
              <div className="ss-r"><div className="ss-rl"><div className="ss-ri">📍</div><div><div className="ss-rla">Ubicación</div><div className="ss-rs">Para mejores recomendaciones</div></div></div><div className="ss-rr">Buenos Aires ›</div></div>
            </div>
          </div>
          <button className="btn-lo" onClick={onLogout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
