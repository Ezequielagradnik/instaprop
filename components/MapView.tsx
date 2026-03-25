'use client';

import { useState, useMemo } from 'react';
import type { Property, OperationType } from '../types';

interface Props {
  properties: Property[];
  liked: number[];
  saved: number[];
  operationType: OperationType;
  onContact: (id: number) => void;
  onSelectProperty: (id: number) => void;
}

// Buenos Aires mock lat/lng bounding box approx: lat -34.53 to -34.68, lng -58.32 to -58.51
const MOCK_COORDS: Record<number, { x: number; y: number }> = {};

function getCoords(id: number) {
  if (!MOCK_COORDS[id]) {
    // Deterministic random spread across map
    const hash = (id * 2654435761) >>> 0;
    MOCK_COORDS[id] = {
      x: 5 + (hash % 900) / 10,
      y: 5 + ((hash >> 8) % 800) / 10,
    };
  }
  return MOCK_COORDS[id];
}

const OP_COLORS = {
  venta: '#00C853',
  alquiler: '#2979FF',
  temporario: '#FF9500',
};

const ZONE_FILTERS = ['Todo', 'Palermo', 'Belgrano', 'Recoleta', 'Núñez', 'Villa Crespo', 'Caballito'];
const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: 9999999 },
  { label: '< $80K', min: 0, max: 80000 },
  { label: '$80K–150K', min: 80000, max: 150000 },
  { label: '$150K–250K', min: 150000, max: 250000 },
  { label: '> $250K', min: 250000, max: 9999999 },
];

export default function MapView({ properties, liked, saved, operationType, onContact, onSelectProperty }: Props) {
  const [selected, setSelected] = useState<Property | null>(null);
  const [activeZone, setActiveZone] = useState('Todo');
  const [activePriceRange, setActivePriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const priceRange = PRICE_RANGES[activePriceRange];

  const filtered = useMemo(() => {
    const ops: OperationType[] = ['venta', 'alquiler', 'temporario'];
    return properties
      .map((p, i) => ({ ...p, operation_type: p.operation_type ?? ops[i % 3] }))
      .filter(p =>
        p.operation_type === operationType &&
        (activeZone === 'Todo' || p.neighborhood === activeZone) &&
        p.price_usd >= priceRange.min && p.price_usd <= priceRange.max
      );
  }, [properties, operationType, activeZone, priceRange]);

  const opColor = OP_COLORS[operationType];
  const opLabel = operationType === 'venta' ? 'Venta' : operationType === 'alquiler' ? 'Alquiler' : 'Temporario';

  return (
    <div className="mapv">
      {/* Header */}
      <div className="map-hdr">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>
              🗺 Mapa — {opLabel}
            </div>
            <div style={{ fontSize: '.75rem', color: '#888', marginTop: 1 }}>{filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} en mapa</div>
          </div>
          <button className="map-filter-btn" onClick={() => setShowFilters(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filtros
          </button>
        </div>

        {showFilters && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div className="home-filter-label">Zona</div>
              <div className="home-filter-chips" style={{ marginTop: 6 }}>
                {ZONE_FILTERS.map(z => (
                  <button key={z} className={`hfilt ${activeZone === z ? 'act' : ''}`} onClick={() => setActiveZone(z)}>{z}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="home-filter-label">Precio</div>
              <div className="home-filter-chips" style={{ marginTop: 6 }}>
                {PRICE_RANGES.map((r, i) => (
                  <button key={r.label} className={`hfilt ${activePriceRange === i ? 'act' : ''}`} onClick={() => setActivePriceRange(i)}>{r.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map canvas */}
      <div className="map-canvas" onClick={() => setSelected(null)}>
        {/* OSM tiles via iframe — Buenos Aires */}
        <iframe
          className="map-tiles"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-58.5100%2C-34.6900%2C-58.3200%2C-34.5200&layer=mapnik"
          title="Mapa Buenos Aires"
        />

        {/* Property pins overlay */}
        <div className="map-pins-overlay">
          {filtered.map(p => {
            const { x, y } = getCoords(p.id);
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                className={`map-pin ${isSelected ? 'active' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  background: opColor,
                  borderColor: isSelected ? '#fff' : 'transparent',
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : p); }}
              >
                <span className="map-pin-price">{p.price_usd >= 1000 ? Math.round(p.price_usd / 1000) + 'K' : p.price_usd}</span>
              </button>
            );
          })}
        </div>

        {/* Selected property card */}
        {selected && (
          <div className="map-preview-card" onClick={e => e.stopPropagation()}>
            <button className="map-preview-close" onClick={() => setSelected(null)}>✕</button>
            <div className="map-preview-img" style={{
              backgroundImage: `url('${selected.image_url || `https://picsum.photos/id/${1029 + selected.id}/400/300`}')`,
            }} />
            <div className="map-preview-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span className="fop-tag" style={{ background: opColor + '22', color: opColor, borderColor: opColor + '44', fontSize: '.65rem', padding: '2px 8px' }}>{opLabel}</span>
                {selected.verified && <span className="trust-verified-sm" style={{ fontSize: '.8rem' }}>✓ Verificado</span>}
              </div>
              <div className="map-preview-price">{selected.price_display}</div>
              <div className="map-preview-addr">📍 {selected.address}</div>
              {(selected.bedrooms || selected.area_m2) && (
                <div style={{ fontSize: '.72rem', color: '#888', marginTop: 4, display: 'flex', gap: 10 }}>
                  {selected.bedrooms && <span>🛏 {selected.bedrooms} amb</span>}
                  {selected.area_m2 && <span>📐 {selected.area_m2} m²</span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn-p"
                  style={{ flex: 1, padding: '9px 12px', fontSize: '.82rem' }}
                  onClick={() => { onContact(selected.id); setSelected(null); }}
                >
                  💬 Contactar
                </button>
                <button
                  style={{ flex: 1, padding: '9px 12px', fontSize: '.82rem', border: '1.5px solid rgba(0,0,0,.12)', borderRadius: 50, background: 'none', fontWeight: 600, cursor: 'pointer', color: '#333' }}
                  onClick={() => { onSelectProperty(selected.id); setSelected(null); }}
                >
                  Ver video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-item" style={{ background: OP_COLORS.venta + '22', color: OP_COLORS.venta, borderColor: OP_COLORS.venta + '44' }}>● Venta</div>
        <div className="map-legend-item" style={{ background: OP_COLORS.alquiler + '22', color: OP_COLORS.alquiler, borderColor: OP_COLORS.alquiler + '44' }}>● Alquiler</div>
        <div className="map-legend-item" style={{ background: OP_COLORS.temporario + '22', color: OP_COLORS.temporario, borderColor: OP_COLORS.temporario + '44' }}>● Temporario</div>
      </div>
    </div>
  );
}
