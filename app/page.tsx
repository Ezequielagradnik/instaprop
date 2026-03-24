'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

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
