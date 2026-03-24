'use client';

import { useState } from 'react';
import type { User } from '../types';

interface Props {
  user: User;
  viewed: number;
  likedCount: number;
  savedCount: number;
  onLogout: () => void;
  onSavePrefs: (prefs: Record<string, unknown>) => void;
}

const ZONES = ['Palermo', 'Belgrano', 'Recoleta', 'Núñez', 'Villa Crespo', 'Caballito', 'Villa Urquiza', 'Colegiales', 'Saavedra', 'Almagro'];
const TYPES = ['Departamento', 'Casa', 'PH', 'Loft', 'Monoambiente'];
const ROOMS = ['1', '2', '3', '4+'];
const FEATURES = ['Balcón', 'Terraza', 'Cochera', 'Pileta', 'Luminoso', 'A estrenar', 'Reciclado', 'Vista panorámica', 'SUM'];

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <div className={`tgl ${on ? 'on' : ''}`} onClick={() => setOn(v => !v)} />;
}

export default function ProfileView({ user, viewed, likedCount, savedCount, onLogout, onSavePrefs }: Props) {
  const ini = user.name.substring(0, 2).toUpperCase();
  const [sel, setSel] = useState<Record<string, string[]>>({ zones: [], types: [], rooms: [], features: [] });
  const [budget, setBudget] = useState(200000);

  const toggle = (group: string, val: string) => {
    setSel(prev => ({
      ...prev,
      [group]: prev[group].includes(val) ? prev[group].filter(x => x !== val) : [...prev[group], val],
    }));
  };

  const isOn = (group: string, val: string) => sel[group].includes(val);

  const save = () => {
    onSavePrefs({ ...sel, budget });
  };

  return (
    <div className="pv">
      <div className="phdr">
        <div className="pav">{ini}</div>
        <div className="pnm">{user.name}</div>
        <div className="pem">{user.email}</div>
      </div>

      <div className="ss">
        <div className="ss-t">🎯 Preferencias de búsqueda</div>
        <div className="pp">
          <div className="pg">
            <div className="pgl">📍 Zonas de interés</div>
            <div className="pos">
              {ZONES.map(z => <button key={z} className={`pch ${isOn('zones', z) ? 'sel' : ''}`} onClick={() => toggle('zones', z)}>{z}</button>)}
            </div>
          </div>
          <div className="pg">
            <div className="pgl">🏠 Tipo de propiedad</div>
            <div className="pos">
              {TYPES.map(t => <button key={t} className={`pch ${isOn('types', t) ? 'sel' : ''}`} onClick={() => toggle('types', t)}>{t}</button>)}
            </div>
          </div>
          <div className="pg">
            <div className="pgl">🛏 Ambientes</div>
            <div className="pos">
              {ROOMS.map(r => <button key={r} className={`pch ${isOn('rooms', r) ? 'sel' : ''}`} onClick={() => toggle('rooms', r)}>{r}</button>)}
            </div>
          </div>
          <div className="pg">
            <div className="pgl">💰 Presupuesto máximo (USD)</div>
            <div className="rg">
              <input type="range" min={30000} max={500000} step={10000} value={budget} onChange={e => setBudget(+e.target.value)} />
              <div className="rgl">
                <span>USD 30K</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  USD {budget >= 1000 ? Math.round(budget / 1000) + 'K' : budget}
                </span>
                <span>USD 500K</span>
              </div>
            </div>
          </div>
          <div className="pg">
            <div className="pgl">✨ Características</div>
            <div className="pos">
              {FEATURES.map(f => <button key={f} className={`pch ${isOn('features', f) ? 'sel' : ''}`} onClick={() => toggle('features', f)}>{f}</button>)}
            </div>
          </div>
          <button className="btn-p" style={{ width: '100%', marginTop: 12 }} onClick={save}>
            Guardar preferencias
          </button>
        </div>
      </div>

      <div className="ss">
        <div className="ss-t">⚙️ Configuración</div>
        <div className="ss-c">
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🔔</div><div><div className="ss-rla">Notificaciones push</div><div className="ss-rs">Nuevas propiedades que matchean</div></div></div><Toggle /></div>
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">📧</div><div><div className="ss-rla">Resumen semanal</div><div className="ss-rs">Email con las mejores propiedades</div></div></div><Toggle /></div>
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🌙</div><div><div className="ss-rla">Modo oscuro</div><div className="ss-rs">Siempre activado</div></div></div><Toggle /></div>
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">📍</div><div><div className="ss-rla">Ubicación</div><div className="ss-rs">Para mejores recomendaciones</div></div></div><div className="ss-rr">Buenos Aires ›</div></div>
        </div>
      </div>

      <div className="ss">
        <div className="ss-t">📊 Mi actividad</div>
        <div className="ss-c">
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">👁</div><div><div className="ss-rla">Propiedades vistas</div></div></div><div className="ss-rr">{viewed}</div></div>
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">♥</div><div><div className="ss-rla">Likes dados</div></div></div><div className="ss-rr">{likedCount}</div></div>
          <div className="ss-r"><div className="ss-rl"><div className="ss-ri">🔖</div><div><div className="ss-rla">Guardados</div></div></div><div className="ss-rr">{savedCount}</div></div>
        </div>
      </div>

      <button className="btn-lo" onClick={onLogout}>Cerrar sesión</button>
    </div>
  );
}
