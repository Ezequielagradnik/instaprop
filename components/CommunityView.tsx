'use client';

import { useState } from 'react';

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
];

export default function CommunityView() {
  const [likes, setLikes] = useState<Record<number, number>>({});

  const addLike = (id: number, base: number) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] ?? base) + 1 }));
  };

  return (
    <div className="cv">
      <div className="chd"><h2>🏘 Comunidad</h2></div>
      <div className="cposts">
        {POSTS.map(post => (
          <div key={post.id} className="cpost">
            <div className="ctop">
              <div className={`cav ${post.avatar}`} />
              <div>
                <div className="cnm">{post.name}</div>
                <div className="ctm">{post.time}</div>
              </div>
            </div>
            <p>{post.text}</p>
            <div className="ctgr">
              {post.tags.map(t => <span key={t} className="ctg">{t}</span>)}
            </div>
            <div className="cacts">
              <button className="cact">💬 {post.comments}</button>
              <button className="cact" onClick={() => addLike(post.id, post.likes)}>
                👍 {likes[post.id] ?? post.likes}
              </button>
              <button className="cact">↗</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
