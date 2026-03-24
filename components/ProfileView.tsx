'use client';

import { useState } from 'react';
import type { User, Property } from '../types';
import { insertProperty } from '../lib/supabase';

interface Props {
  user: User;
  viewed: number;
  likedCount: number;
  savedCount: number;
  savedProperties: Property[];
  onLogout: () => void;
  onSavePrefs: (prefs: Record<string, unknown>) => void;
  onSelectProperty: (id: number) => void;
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

type ProfileTab = 'activity' | 'saved' | 'prefs' | 'config';

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <div className={`tgl ${on ? 'on' : ''}`} onClick={() => setOn(v => !v)} />;
}

function UploadPropertyForm() {
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Palermo');
  const [propType, setPropType] = useState('2amb');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit() {
    if (!address || !price) { setMsg('❌ Dirección y precio son obligatorios'); return; }
    const priceNum = parseInt(price.replace(/\D/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) { setMsg('❌ Precio inválido'); return; }
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
    else { setMsg('✅ Propiedad publicada'); setAddress(''); setPrice(''); setBedrooms(''); setArea(''); setDescription(''); setImageUrl(''); }
  }

  return (
    <div className="ss">
      <div className="ss-t">🏠 Publicar propiedad</div>
      <div className="up-form">
        {msg && <div className={`up-msg ${msg.startsWith('✅') ? 'ok' : 'err'}`}>{msg}</div>}
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
          <input className="inp" placeholder="Ambientes" value={bedrooms} onChange={e => setBedrooms(e.target.value)} type="number" />
        </div>
        <div className="up-row">
          <input className="inp" placeholder="m²" value={area} onChange={e => setArea(e.target.value)} type="number" />
          <input className="inp" placeholder="URL imagen (opcional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>
        <textarea className="inp up-desc" placeholder="Descripción..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        <button className="btn-p" style={{ width: '100%' }} onClick={submit} disabled={loading}>
          {loading ? 'Publicando...' : '🚀 Publicar propiedad'}
        </button>
      </div>
    </div>
  );
}

export default function ProfileView({ user, viewed, likedCount, savedCount, savedProperties, onLogout, onSavePrefs, onSelectProperty }: Props) {
  const ini = user.name.substring(0, 2).toUpperCase();
  const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
  const [sel, setSel] = useState<Record<string, string[]>>({ zones: [], types: [], rooms: [], features: [] });
  const [budget, setBudget] = useState(200000);

  const toggle = (group: string, val: string) => {
    setSel(prev => ({
      ...prev,
      [group]: prev[group].includes(val) ? prev[group].filter(x => x !== val) : [...prev[group], val],
    }));
  };

  const isOn = (group: string, val: string) => sel[group].includes(val);

  return (
    <div className="pv">
      {/* Header */}
      <div className="phdr">
        <div className="pav">{ini}</div>
        <div className="pnm">{user.name}</div>
        <div className="pem">{user.email}</div>
        {user.role === 'seller' && <div className="prole">🏢 Vendedor / Inmobiliaria</div>}
        <div className="pstats">
          <div className="pstat"><div className="pstat-n">{viewed}</div><div className="pstat-l">Vistos</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-n">{likedCount}</div><div className="pstat-l">Likes</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-n">{savedCount}</div><div className="pstat-l">Guardados</div></div>
        </div>
      </div>

      {/* Profile tabs */}
      <div className="ptabs">
        {([
          { key: 'activity', label: 'Actividad' },
          { key: 'saved', label: 'Guardados' },
          { key: 'prefs', label: 'Búsqueda' },
          { key: 'config', label: 'Config' },
        ] as { key: ProfileTab; label: string }[]).map(t => (
          <button key={t.key} className={`ptab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Activity */}
      {activeTab === 'activity' && (
        <div>
          {user.role === 'seller' && <UploadPropertyForm />}
          <div className="ss">
            <div className="ss-t">📊 Mi actividad</div>
            <div className="ss-c">
              <div className="ss-r"><div className="ss-rl"><div className="ss-ri">👁</div><div><div className="ss-rla">Propiedades vistas</div></div></div><div className="ss-rr">{viewed}</div></div>
              <div className="ss-r"><div className="ss-rl"><div className="ss-ri">❤️</div><div><div className="ss-rla">Likes dados</div></div></div><div className="ss-rr">{likedCount}</div></div>
              <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🔖</div><div><div className="ss-rla">Guardados</div></div></div><div className="ss-rr">{savedCount}</div></div>
            </div>
          </div>
          <button className="btn-lo" onClick={onLogout}>Cerrar sesión</button>
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

      {/* Config */}
      {activeTab === 'config' && (
        <div className="ss">
          <div className="ss-c">
            <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🔔</div><div><div className="ss-rla">Notificaciones push</div><div className="ss-rs">Nuevas propiedades que matchean</div></div></div><Toggle /></div>
            <div className="ss-r"><div className="ss-rl"><div className="ss-ri">📧</div><div><div className="ss-rla">Resumen semanal</div><div className="ss-rs">Email con las mejores propiedades</div></div></div><Toggle /></div>
            <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🌙</div><div><div className="ss-rla">Modo oscuro</div><div className="ss-rs">Solo para el feed de videos</div></div></div><Toggle defaultOn={false} /></div>
            <div className="ss-r"><div className="ss-rl"><div className="ss-ri">📍</div><div><div className="ss-rla">Ubicación</div><div className="ss-rs">Para mejores recomendaciones</div></div></div><div className="ss-rr">Buenos Aires ›</div></div>
          </div>
          <button className="btn-lo" onClick={onLogout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
