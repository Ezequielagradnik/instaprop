'use client';

import type { Property } from '../types';

interface Props {
  properties: Property[];
  savedIds: number[];
  onRemove: (id: number) => void;
  onSelect: (id: number) => void;
}

export default function SavedView({ properties, savedIds, onRemove, onSelect }: Props) {
  const items = savedIds.map(id => properties.find(p => p.id === id)).filter(Boolean) as Property[];

  return (
    <div className="xv">
      <div className="xhd">
        <h2>♥ Guardados</h2>
        <p>Propiedades que te gustaron</p>
      </div>

      {items.length === 0 ? (
        <div className="xempty">
          <div className="ico">🔖</div>
          <p>Todavía no guardaste propiedades.<br />¡Empezá a explorar!</p>
        </div>
      ) : (
        <div className="xlist">
          {items.map(p => (
            <div key={p.id} className="xi" onClick={() => onSelect(p.id)}>
              <div
                className="xi-th"
                style={p.image_url
                  ? { backgroundImage: `url('${p.image_url}')` }
                  : { background: p.gradient }
                }
              />
              <div className="xi-info">
                <div className="xi-pr">{p.price_display}</div>
                <div className="xi-ad">📍 {p.address}</div>
                <div className="xi-mt">
                  {(p.tags ?? []).slice(0, 3).map(t => <span key={t} className="xi-tg">{t}</span>)}
                </div>
              </div>
              <button
                className="xi-rm"
                onClick={e => { e.stopPropagation(); onRemove(p.id); }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
