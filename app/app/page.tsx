'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProperties, getSession, signOut } from '../../lib/supabase';
import Feed from '../../components/Feed';
import SearchView from '../../components/SearchView';
import SavedView from '../../components/SavedView';
import CommunityView from '../../components/CommunityView';
import ProfileView from '../../components/ProfileView';
import type { Property, User, Tab } from '../../types';

export default function AppPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [feedIndex, setFeedIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [viewed, setViewed] = useState(0);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load session + Supabase
  useEffect(() => {
    async function init() {
      // Try real session first, fall back to localStorage cache
      const session = await getSession();
      if (session) {
        const u = { id: session.id, name: session.name, email: session.email, role: session.role };
        setUser(u);
        localStorage.setItem('ip_u', JSON.stringify(u));
      } else {
        const raw = localStorage.getItem('ip_u');
        if (!raw) { router.push('/auth'); return; }
        setUser(JSON.parse(raw));
      }
      setLiked(JSON.parse(localStorage.getItem('ip_l') ?? '[]'));
      setSaved(JSON.parse(localStorage.getItem('ip_s') ?? '[]'));
      setViewed(+(localStorage.getItem('ip_v') ?? '0'));
      getProperties().then(setProperties);
    }
    init();
  }, [router]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }, []);

  const next = useCallback(() => {
    setFeedIndex(i => {
      const n = i < properties.length - 1 ? i + 1 : 0;
      const v = viewed + 1;
      setViewed(v);
      localStorage.setItem('ip_v', String(v));
      return n;
    });
  }, [properties.length, viewed]);

  const prev = useCallback(() => setFeedIndex(i => Math.max(0, i - 1)), []);

  const handleLike = useCallback(() => {
    const p = properties[feedIndex];
    if (!p) return;
    setLiked(prev => {
      const next = prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id];
      localStorage.setItem('ip_l', JSON.stringify(next));
      showToast(next.includes(p.id) ? '❤️ ¡Te gustó esta propiedad!' : '');
      return next;
    });
  }, [feedIndex, properties, showToast]);

  const handleSave = useCallback(() => {
    const p = properties[feedIndex];
    if (!p) return;
    setSaved(prev => {
      const wasSaved = prev.includes(p.id);
      const next = wasSaved ? prev.filter(x => x !== p.id) : [...prev, p.id];
      localStorage.setItem('ip_s', JSON.stringify(next));
      showToast(wasSaved ? '🗑 Eliminado de guardados' : '🔖 Guardado');
      return next;
    });
  }, [feedIndex, properties, showToast]);

  const handleContact = useCallback(() => {
    const p = properties[feedIndex];
    if (p) showToast(`💬 Contactando sobre ${p.address.split(',')[0]}...`);
  }, [feedIndex, properties, showToast]);

  const handleShare = useCallback(() => {
    const p = properties[feedIndex];
    if (!p) return;
    if (navigator.share) {
      navigator.share({ title: 'InstaProp — ' + p.address, text: p.price_display + ' en ' + p.address, url: location.href });
    } else {
      navigator.clipboard?.writeText(p.price_display + ' en ' + p.address);
      showToast('📋 Link copiado');
    }
  }, [feedIndex, properties, showToast]);

  const handleSelectProperty = useCallback((id: number) => {
    const idx = properties.findIndex(p => p.id === id);
    if (idx >= 0) { setFeedIndex(idx); setActiveTab('feed'); }
  }, [properties]);

  const handleLogout = useCallback(async () => {
    await signOut();
    localStorage.removeItem('ip_u');
    router.push('/');
  }, [router]);

  const ini = user?.name.substring(0, 2).toUpperCase() ?? '';

  if (!user) return null;

  return (
    <div className="app-shell">
      {/* Top bar */}
      <div className="atop">
        <div className="logo-t" style={{ fontSize: '1.15rem' }}>
          <span className="logo-d" />InstaProp
        </div>
        <div className="atop-r">
          <button className="atop-btn" title="Notificaciones">🔔</button>
          <div className="atop-av" onClick={() => setActiveTab('profile')}>{ini}</div>
        </div>
      </div>

      {/* Content */}
      <div className="acontent">
        {activeTab === 'feed' && properties.length > 0 && (
          <Feed
            properties={properties}
            currentIndex={feedIndex}
            liked={liked}
            saved={saved}
            onNext={next}
            onPrev={prev}
            onLike={handleLike}
            onSave={handleSave}
            onContact={handleContact}
            onShare={handleShare}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            properties={properties}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            properties={properties}
            savedIds={saved}
            onRemove={id => {
              setSaved(prev => {
                const next = prev.filter(x => x !== id);
                localStorage.setItem('ip_s', JSON.stringify(next));
                return next;
              });
            }}
            onSelect={handleSelectProperty}
          />
        )}

        {activeTab === 'community' && <CommunityView />}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            viewed={viewed}
            likedCount={liked.length}
            savedCount={saved.length}
            onLogout={handleLogout}
            onSavePrefs={prefs => {
              localStorage.setItem('ip_p', JSON.stringify(prefs));
              showToast('✓ Preferencias guardadas');
            }}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div className="anav">
        {([
          { key: 'feed', icon: '🏠', label: 'Inicio' },
          { key: 'search', icon: '🔍', label: 'Buscar' },
          { key: 'saved', icon: '🔖', label: 'Guardados' },
          { key: 'community', icon: '💬', label: 'Comunidad' },
          { key: 'profile', icon: '👤', label: 'Perfil' },
        ] as { key: Tab; icon: string; label: string }[]).map(({ key, icon, label }) => (
          <button
            key={key}
            className={`ni ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="ni-i">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
