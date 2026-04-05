'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Detect if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
    setIsIOS(!!ios);

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (isIOS) { setShowIOSHint(true); return; }
    if (!deferredPrompt) { router.push('/auth'); return; }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  }

  return (
    <>
      <nav className="lnav">
        <div className="logo-t"><span className="logo-d" />InstaProp</div>
        <div className="lnav-r">
          <a className="lnav-a" href="#como">Cómo funciona</a>
          <button className="btn-p" style={{ padding: '10px 22px', fontSize: '.85rem' }} onClick={() => router.push('/auth')}>
            Ingresar
          </button>
        </div>
      </nav>

      {/* iOS install hint */}
      {showIOSHint && (
        <div className="ios-hint-backdrop" onClick={() => setShowIOSHint(false)}>
          <div className="ios-hint" onClick={e => e.stopPropagation()}>
            <div className="ios-hint-arrow" />
            <div className="ios-hint-title">Instalá InstaProp</div>
            <div className="ios-hint-steps">
              <div className="ios-hint-step">
                <span className="ios-hint-num">1</span>
                Tocá el botón compartir
                <span className="ios-hint-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </span>
              </div>
              <div className="ios-hint-step">
                <span className="ios-hint-num">2</span>
                Tocá "Añadir a pantalla de inicio"
              </div>
              <div className="ios-hint-step">
                <span className="ios-hint-num">3</span>
                ¡Listo! Abrí InstaProp desde tu home
              </div>
            </div>
            <button className="ios-hint-close" onClick={() => setShowIOSHint(false)}>Entendido</button>
          </div>
        </div>
      )}

      <section className="hero">
        <div className="hero-in">
          <div className="hero-chip"><span className="dot" />Lanzamiento Q2 2026 — Buenos Aires</div>
          <h1>Tu próxima casa<br />está a un <em>scroll</em></h1>
          <p>Descubrí propiedades como scrolleás en tu red social favorita. Un algoritmo que aprende de vos y te muestra exactamente lo que buscás.</p>
          <div className="hero-btns">
            <button className="btn-p" onClick={() => router.push('/auth')}>Empezar ahora</button>
            <button className="btn-g" onClick={() => document.getElementById('como')?.scrollIntoView({ behavior: 'smooth' })}>
              Cómo funciona →
            </button>
          </div>

          {/* PWA Install banner */}
          {!installed && (
            <div className="pwa-banner" onClick={handleInstall}>
              <div className="pwa-banner-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div className="pwa-banner-text">
                <div className="pwa-banner-title">Instalá la app gratis</div>
                <div className="pwa-banner-sub">
                  {isIOS ? 'Safari → Compartir → Añadir a inicio' : 'Sin App Store · Funciona offline'}
                </div>
              </div>
              <div className="pwa-banner-btn">
                {isIOS ? 'Ver cómo' : 'Instalar'}
              </div>
            </div>
          )}
          {installed && (
            <div className="pwa-banner pwa-installed">
              <span>✓</span>
              <div className="pwa-banner-text">
                <div className="pwa-banner-title">¡App instalada!</div>
                <div className="pwa-banner-sub">Abrila desde tu pantalla de inicio</div>
              </div>
            </div>
          )}

          <div className="phones">
            <div className="ph">
              <div className="ph-t" />
              <div className="ph-b">
                <div className="pc g1"><div className="pc-g" /><div className="pc-i"><div className="pc-p">USD 185.000</div><div className="pc-l">📍 Palermo</div></div></div>
                <div className="pc-a"><div className="pc-ac">✕</div><div className="pc-ac" style={{ color: 'var(--accent)' }}>♥</div><div className="pc-ac">💬</div></div>
                <div className="pc g4" style={{ height: 130 }}><div className="pc-g" /><div className="pc-i"><div className="pc-p">USD 92.000</div><div className="pc-l">📍 V. Crespo</div></div></div>
              </div>
            </div>
            <div className="ph">
              <div className="ph-t" />
              <div className="ph-b">
                <div className="pc g2"><div className="pc-g" /><div className="pc-i"><div className="pc-p">USD 245.000</div><div className="pc-l">📍 Belgrano</div></div></div>
                <div className="pc-a"><div className="pc-ac">✕</div><div className="pc-ac" style={{ color: 'var(--accent)' }}>♥</div><div className="pc-ac">💬</div></div>
                <div className="pc g5" style={{ height: 130 }}><div className="pc-g" /><div className="pc-i"><div className="pc-p">USD 320.000</div><div className="pc-l">📍 Núñez</div></div></div>
              </div>
            </div>
            <div className="ph">
              <div className="ph-t" />
              <div className="ph-b">
                <div className="pc g3"><div className="pc-g" /><div className="pc-i"><div className="pc-p">USD 158.000</div><div className="pc-l">📍 Recoleta</div></div></div>
                <div className="pc-a"><div className="pc-ac">✕</div><div className="pc-ac" style={{ color: 'var(--accent)' }}>♥</div><div className="pc-ac">💬</div></div>
                <div className="pc g6" style={{ height: 130 }}><div className="pc-g" /><div className="pc-i"><div className="pc-p">USD 210.000</div><div className="pc-l">📍 Caballito</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats">
        <div style={{ textAlign: 'center' }}><div className="stn">2,847</div><div className="stl">En la waitlist</div></div>
        <div style={{ textAlign: 'center' }}><div className="stn">340+</div><div className="stl">Inmobiliarias</div></div>
        <div style={{ textAlign: 'center' }}><div className="stn">12</div><div className="stl">Barrios al launch</div></div>
        <div style={{ textAlign: 'center' }}><div className="stn">3x</div><div className="stl">Más rápido</div></div>
      </div>

      <section className="sec" id="como">
        <div className="stag">Cómo funciona</div>
        <h2 className="sh">Encontrar tu propiedad ideal nunca fue tan simple</h2>
        <div className="steps">
          <div className="stp"><div className="stp-n">01</div><div className="stp-i">📱</div><h3>Abrí y scrolleá</h3><p>Sin filtros ni formularios. Entrás y ves propiedades en video. Intuitivo desde el primer segundo.</p></div>
          <div className="stp"><div className="stp-n">02</div><div className="stp-i">🧠</div><h3>El algoritmo aprende</h3><p>Cada like y skip le enseña al algoritmo qué te gusta. En minutos tu feed se personaliza.</p></div>
          <div className="stp"><div className="stp-n">03</div><div className="stp-i">🎯</div><h3>Descubrí tu match</h3><p>Te muestra propiedades que no sabías que existían pero encajan perfecto con lo que buscás.</p></div>
          <div className="stp"><div className="stp-n">04</div><div className="stp-i">💬</div><h3>Contactá al instante</h3><p>¿Te gustó? Un tap y hablás con la inmobiliaria. Sin intermediarios.</p></div>
        </div>

        {/* Download section */}
        <div className="pwa-section">
          <div className="pwa-section-icon">
            <img src="/icons/icon-192.png" alt="InstaProp" width="72" height="72" style={{ borderRadius: 18 }} />
          </div>
          <h3 className="pwa-section-title">Instalá InstaProp en tu celu</h3>
          <p className="pwa-section-sub">Gratis, sin App Store, en segundos.</p>
          <div className="pwa-install-row">
            <button className="pwa-install-btn android" onClick={handleInstall}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341 14 12l3.523-3.341A1 1 0 0 0 17 8H7a1 1 0 0 0-.523 1.659L10 13l-3.523 3.341A1 1 0 0 0 7 18h10a1 1 0 0 0 .523-1.659z"/>
              </svg>
              {installed ? '✓ Instalada' : 'Instalar en Android'}
            </button>
            <button className="pwa-install-btn ios" onClick={() => setShowIOSHint(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Instalar en iPhone
            </button>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>¿Listo para cambiar<br />la forma de buscar?</h2>
        <p>Sumate y sé de los primeros en probar InstaProp.</p>
        <button className="btn-p" onClick={() => router.push('/auth')} style={{ fontSize: '1.05rem', padding: '16px 40px' }}>
          Crear mi cuenta →
        </button>
      </section>

      <div className="ft">
        <div className="ft-b">
          <div className="logo-t"><span className="logo-d" />InstaProp</div>
          <p>Transformando la búsqueda de propiedades en una experiencia que disfrutás.</p>
        </div>
        <div className="ft-cs">
          <div className="ft-c"><h4>Producto</h4><a href="#como">Cómo funciona</a><a href="#">Features</a></div>
          <div className="ft-c"><h4>Empresa</h4><a href="#">Sobre nosotros</a><a href="#">Contacto</a></div>
          <div className="ft-c"><h4>Legal</h4><a href="#">Términos</a><a href="#">Privacidad</a></div>
        </div>
      </div>
      <div className="ft-bt">© 2026 InstaProp. Hecho con ♥ en Buenos Aires.</div>
    </>
  );
}
