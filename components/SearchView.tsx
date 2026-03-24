'use client';

import { useState } from 'react';
import type { Property, FilterType } from '../types';

interface Props {
  properties: Property[];
  onSelectProperty: (id: number) => void;
}

export default function SearchView({ properties, onSelectProperty }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = properties.filter(p => {
    if (filter === 'mono' && p.type !== 'monoambiente') return false;
    if (filter === '2amb' && p.type !== '2amb') return false;
    if (filter === '3amb' && !['3amb', 'casa', 'ph'].includes(p.type)) return false;
    if (filter === 'casa' && !['casa', 'ph'].includes(p.type)) return false;
    if (filter === 'lujo' && p.price_usd < 300000) return false;
    if (query) {
      const q = query.toLowerCase();
      return p.address.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        (p.tags ?? []).join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'mono', label: 'Monoamb' },
    { key: '2amb', label: '2 amb' },
    { key: '3amb', label: '3+ amb' },
    { key: 'casa', label: 'Casa/PH' },
    { key: 'lujo', label: '+USD 300K' },
  ];

  return (
    <div className="sv">
      <div className="sbar">
        <input
          className="inp"
          type="text"
          placeholder="🔍 Buscar barrio, zona, tipo..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ borderRadius: 50 }}
        />
      </div>

      <div className="sfilts">
        {filters.map(f => (
          <button
            key={f.key}
            className={`sflt ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="sres">
        {filtered.length > 0 ? filtered.map(p => (
          <div key={p.id} className="sc" onClick={() => onSelectProperty(p.id)}>
            <div
              className="sc-img"
              style={p.image_url
                ? { backgroundImage: `url('${p.image_url}')` }
                : { background: p.gradient }
              }
            >
              <div className="sc-badge">{p.badge}</div>
            </div>
            <div className="sc-bd">
              <div className="sc-pr">{p.price_display}</div>
              <div className="sc-ad">📍 {p.address}</div>
              <div className="sc-ts">
                {(p.tags ?? []).slice(0, 3).map(t => <span key={t} className="sc-tg">{t}</span>)}
              </div>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
            Sin resultados para ese criterio.
          </div>
        )}
      </div>
    </div>
  );
}
