'use client';

import { useState, useMemo } from 'react';

interface Post {
  id: number;
  avatar: string;
  name: string;
  time: string;
  text: string;
  tags: string[];
  comments: number;
  likes: number;
}

const POSTS: Post[] = [
  { id: 1, avatar: 'ca1', name: 'Martina R.', time: 'Hace 2h', text: '¿Alguien compró en el edificio nuevo de Palermo Hollywood sobre Fitz Roy? ¿Qué tal las expensas?', tags: ['Palermo', 'Expensas'], comments: 12, likes: 34 },
  { id: 2, avatar: 'ca2', name: 'Lucas F.', time: 'Hace 5h', text: 'Me mudé hace 3 meses a Villa Urquiza. El barrio creció muchísimo, super recomendable para familias.', tags: ['Villa Urquiza', 'Review'], comments: 8, likes: 56 },
  { id: 3, avatar: 'ca3', name: 'Sofía G.', time: 'Hace 1d', text: 'Tip: los deptos sobre Av. Cabildo bajan en invierno. Mejor momento para negociar, sobre todo pisos altos.', tags: ['Tips', 'Belgrano'], comments: 23, likes: 89 },
  { id: 4, avatar: 'ca4', name: 'Tomás B.', time: 'Hace 2d', text: '¿Conviene más alquilar en Núñez o comprar un monoambiente en Villa Crespo con esa misma plata?', tags: ['Consulta', 'Inversión'], comments: 31, likes: 42 },
  { id: 5, avatar: 'ca5', name: 'Valentina M.', time: 'Hace 3d', text: 'Ojo con los edificios de Av. Córdoba entre Scalabrini y Dorrego. Lindos por fuera pero expensas altísimas.', tags: ['Alerta', 'Palermo'], comments: 45, likes: 112 },
  { id: 6, avatar: 'ca1', name: 'Ramiro P.', time: 'Hace 4d', text: 'Recoleta sigue siendo la zona más estable en precio. Si tenés para invertir, no falla nunca.', tags: ['Inversión', 'Recoleta'], comments: 18, likes: 74 },
  { id: 7, avatar: 'ca3', name: 'Camila D.', time: 'Hace 5d', text: 'Caballito está subiendo mucho. Lo que hace 2 años costaba 80k USD ahora ronda los 95k. Buena zona para PH.', tags: ['Caballito', 'PH', 'Precios'], comments: 29, likes: 93 },
];

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'rgba(26,86,219,.15)', color: 'var(--accent)', borderRadius: 3, padding: '0 2px' }}>{p}</mark>
      : p
  );
}

export default function CommunityView() {
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [posts, setPosts] = useState<Post[]>(POSTS);

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(p =>
      p.text.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.name.toLowerCase().includes(q)
    );
  }, [query, posts]);

  function addLike(id: number, base: number) {
    setLikes(prev => ({ ...prev, [id]: (prev[id] ?? base) + 1 }));
  }

  function submitPost() {
    if (!newPost.trim()) return;
    const p: Post = {
      id: Date.now(),
      avatar: 'ca2',
      name: 'Yo',
      time: 'ahora',
      text: newPost,
      tags: [],
      comments: 0,
      likes: 0,
    };
    setPosts(prev => [p, ...prev]);
    setNewPost('');
    setShowCompose(false);
  }

  return (
    <div className="cv">
      <div className="chd">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>🏘 Comunidad</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="comm-icon-btn"
              onClick={() => { setShowSearch(v => !v); setQuery(''); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button className="comm-icon-btn accent" onClick={() => setShowCompose(v => !v)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="comm-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              autoFocus
              className="comm-search-input"
              placeholder="Buscar en la comunidad..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery('')} style={{ color: '#aaa', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}
          </div>
        )}

        {query && (
          <div className="comm-results-info">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Compose */}
        {showCompose && (
          <div className="comm-compose">
            <textarea
              autoFocus
              className="comm-compose-input"
              placeholder="Compartí tu experiencia, consulta o tip sobre propiedades..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              rows={3}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn-p" style={{ padding: '8px 20px', fontSize: '.85rem' }} onClick={submitPost}>Publicar</button>
              <button onClick={() => setShowCompose(false)} style={{ padding: '8px 16px', fontSize: '.85rem', color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div className="cposts">
        {filtered.length === 0 ? (
          <div className="xempty">
            <div className="ico">🔍</div>
            <div>No hay publicaciones con &ldquo;{query}&rdquo;</div>
          </div>
        ) : (
          filtered.map(post => (
            <div key={post.id} className="cpost">
              <div className="ctop">
                <div className={`cav ${post.avatar}`} />
                <div>
                  <div className="cnm">{post.name}</div>
                  <div className="ctm">{post.time}</div>
                </div>
              </div>
              <p>{query ? highlight(post.text, query) : post.text}</p>
              <div className="ctgr">
                {post.tags.map(t => <span key={t} className="ctg">{t}</span>)}
              </div>
              <div className="cacts">
                <button className="cact">💬 {post.comments}</button>
                <button className="cact" onClick={() => addLike(post.id, post.likes)}>
                  👍 {likes[post.id] ?? post.likes}
                </button>
                <button className="cact">↗ Compartir</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
