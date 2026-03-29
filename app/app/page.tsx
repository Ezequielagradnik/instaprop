'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProperties, getSession, signOut } from '../../lib/supabase';
import HomeFeed, { AGENT_GRADS } from '../../components/HomeFeed';
import Feed from '../../components/Feed';
import MessagesView, { type OpenChatData } from '../../components/MessagesView';
import CommunityView from '../../components/CommunityView';
import ProfileView from '../../components/ProfileView';
import type { Property, User, Tab, OperationType } from '../../types';

export default function AppPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [feedIndex, setFeedIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [viewed, setViewed] = useState(0);
  const [toast, setToast] = useState('');
  const [openChatWith, setOpenChatWith] = useState<OpenChatData | null>(null);
  const [operationType, setOperationType] = useState<OperationType>('venta');
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastTabTap = useRef<{ tab: Tab; time: number }>({ tab: 'home', time: 0 });
  const homeScrollRef = useRef<HTMLDivElement>(null);

  // Recommendation: weight properties by viewed/liked/saved interaction
  const scoredProperties = useCallback((props: Property[]) => {
    const likedSet = new Set(liked);
    const savedSet = new Set(saved);
    const likedNeighborhoods = new Set(
      props.filter(p => likedSet.has(p.id)).map(p => p.neighborhood)
    );
    const savedNeighborhoods = new Set(
      props.filter(p => savedSet.has(p.id)).map(p => p.neighborhood)
    );
    return [...props].sort((a, b) => {
      let sa = a.match_score;
      let sb = b.match_score;
      if (likedNeighborhoods.has(a.neighborhood)) sa += 20;
      if (likedNeighborhoods.has(b.neighborhood)) sb += 20;
      if (savedNeighborhoods.has(a.neighborhood)) sa += 15;
      if (savedNeighborhoods.has(b.neighborhood)) sb += 15;
      if (likedSet.has(a.id)) sa -= 10; // already seen
      if (likedSet.has(b.id)) sb -= 10;
      return sb - sa;
    });
  }, [liked, saved]);

  // Filter by operation type
  const filteredByOperation = useCallback((props: Property[]) => {
    // Assign mock operation_type if missing (distribute evenly)
    const ops: OperationType[] = ['venta', 'alquiler', 'temporario'];
    const withOp = props.map((p, i) => ({
      ...p,
      operation_type: p.operation_type ?? ops[i % 3],
    }));
    return withOp.filter(p => p.operation_type === operationType);
  }, [operationType]);

  const visibleProperties = useCallback(() => {
    const filtered = filteredByOperation(scoredProperties(properties));
    return filtered.length > 0 ? filtered : properties; // fallback to all
  }, [properties, filteredByOperation, scoredProperties]);

  useEffect(() => {
    async function init() {
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

  const handleNavTap = useCallback((tab: Tab) => {
    const now = Date.now();
    if (activeTab === tab && now - lastTabTap.current.time < 350) {
      if (tab === 'home') {
        homeScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        getProperties().then(setProperties);
        showToast('🔄 Feed actualizado');
      } else if (tab === 'video') {
        setFeedIndex(0);
        showToast('⬆️ Volviste al inicio');
      }
    }
    lastTabTap.current = { tab, time: now };
    setActiveTab(tab);
  }, [activeTab, showToast]);

  const props = visibleProperties();

  const next = useCallback(() => {
    setFeedIndex(i => {
      const n = i < props.length - 1 ? i + 1 : 0;
      const v = viewed + 1;
      setViewed(v);
      localStorage.setItem('ip_v', String(v));
      return n;
    });
  }, [props.length, viewed]);

  const prev = useCallback(() => setFeedIndex(i => Math.max(0, i - 1)), []);

  const handleVideoLike = useCallback(() => {
    const p = props[feedIndex];
    if (!p) return;
    setLiked(prev => {
      const next = prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id];
      localStorage.setItem('ip_l', JSON.stringify(next));
      showToast(next.includes(p.id) ? '❤️ ¡Te gustó!' : '');
      return next;
    });
  }, [feedIndex, props, showToast]);

  const handleVideoSave = useCallback(() => {
    const p = props[feedIndex];
    if (!p) return;
    setSaved(prev => {
      const wasSaved = prev.includes(p.id);
      const next = wasSaved ? prev.filter(x => x !== p.id) : [...prev, p.id];
      localStorage.setItem('ip_s', JSON.stringify(next));
      showToast(wasSaved ? '🗑 Eliminado' : '🔖 Guardado');
      return next;
    });
  }, [feedIndex, props, showToast]);

  const handleLikeById = useCallback((id: number) => {
    setLiked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('ip_l', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSaveById = useCallback((id: number) => {
    setSaved(prev => {
      const wasSaved = prev.includes(id);
      const next = wasSaved ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('ip_s', JSON.stringify(next));
      showToast(wasSaved ? '🗑 Eliminado de guardados' : '🔖 Guardado');
      return next;
    });
  }, [showToast]);

  const handleContactChat = useCallback((id: number) => {
    const p = properties.find(x => x.id === id);
    if (!p) return;
    setOpenChatWith({
      agentName: p.neighborhood + ' Propiedades',
      agentIni: p.neighborhood.substring(0, 2).toUpperCase(),
      agentGrad: AGENT_GRADS[p.id % AGENT_GRADS.length],
      propertyAddress: p.address,
    });
    setActiveTab('messages');
  }, [properties]);

  const handleVideoContact = useCallback(() => {
    const p = props[feedIndex];
    if (!p) return;
    handleContactChat(p.id);
  }, [feedIndex, props, handleContactChat]);

  const handleVideoShare = useCallback(() => {
    const p = props[feedIndex];
    if (!p) return;
    if (navigator.share) {
      navigator.share({ title: 'InstaProp — ' + p.address, text: p.price_display, url: location.href });
    } else {
      navigator.clipboard?.writeText(p.price_display + ' en ' + p.address);
      showToast('📋 Link copiado');
    }
  }, [feedIndex, props, showToast]);

  const handleSelectProperty = useCallback((id: number) => {
    const idx = props.findIndex(p => p.id === id);
    if (idx >= 0) { setFeedIndex(idx); setActiveTab('video'); }
  }, [props]);

  const handleLogout = useCallback(async () => {
    await signOut();
    localStorage.removeItem('ip_u');
    router.push('/');
  }, [router]);

  const handleUserUpgrade = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem('ip_u', JSON.stringify(newUser));
    showToast('🎉 ¡Ahora sos vendedor!');
  }, [showToast]);

  const ini = user?.name.substring(0, 2).toUpperCase() ?? '';
  const savedProperties = properties.filter(p => saved.includes(p.id));

  if (!user) return null;

  return (
    <div className="app-shell">
      {/* Top bar */}
      <div className="atop">
        <div className="logo-t" style={{ fontSize: '1.15rem' }}>
          <span className="logo-d" />InstaProp
        </div>
        <div className="atop-r">
          {/* Operation type selector */}
          <div className="op-selector">
            {(['venta', 'alquiler', 'temporario'] as OperationType[]).map(op => (
              <button
                key={op}
                className={`op-btn ${operationType === op ? 'active' : ''}`}
                onClick={() => { setOperationType(op); setFeedIndex(0); }}
              >
                {op === 'venta' ? 'Venta' : op === 'alquiler' ? 'Alquiler' : 'Temp.'}
              </button>
            ))}
          </div>
          <div className="atop-av" onClick={() => handleNavTap('profile')}>{ini}</div>
        </div>
      </div>

      {/* Content */}
      <div className="acontent">
        {activeTab === 'home' && (
          <HomeFeed
            properties={props}
            liked={liked}
            saved={saved}
            onLike={handleLikeById}
            onSave={handleSaveById}
            onContactChat={handleContactChat}
            scrollRef={homeScrollRef}
            operationType={operationType}
            onOperationChange={(op) => { setOperationType(op); setFeedIndex(0); }}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            openChat={openChatWith}
            onChatOpened={() => setOpenChatWith(null)}
          />
        )}

        {activeTab === 'video' && (
          <Feed
            properties={props.length > 0 ? props : properties}
            currentIndex={feedIndex}
            liked={liked}
            saved={saved}
            onNext={next}
            onPrev={prev}
            onLike={handleVideoLike}
            onSave={handleVideoSave}
            onContact={handleVideoContact}
            onShare={handleVideoShare}
          />
        )}

        {activeTab === 'community' && <CommunityView />}


        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            viewed={viewed}
            likedCount={liked.length}
            savedCount={saved.length}
            savedProperties={savedProperties}
            onLogout={handleLogout}
            onSelectProperty={handleSelectProperty}
            onUserUpgrade={handleUserUpgrade}
            onSavePrefs={prefs => {
              localStorage.setItem('ip_p', JSON.stringify(prefs));
              showToast('✓ Preferencias guardadas');
            }}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div className="anav">
        <button className={`ni ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavTap('home')}>
          <span className="ni-i">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          Inicio
        </button>
        <button className={`ni ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => handleNavTap('messages')}>
          <span className="ni-i">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'messages' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          Mensajes
        </button>

        {/* CENTER KEY BUTTON */}
        <button className="ni-center" onClick={() => handleNavTap('video')}>
          <div className={`ni-center-btn ${activeTab === 'video' ? 'active' : ''}`}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
        </button>

        <button className={`ni ${activeTab === 'community' ? 'active' : ''}`} onClick={() => handleNavTap('community')}>
          <span className="ni-i">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'community' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          Comunidad
        </button>
        <button className={`ni ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleNavTap('profile')}>
          <span className="ni-i">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          Perfil
        </button>
      </div>

      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
