// InstaProp — App Logic
let PROPS = [];
let U = JSON.parse(localStorage.getItem('ip_u') || 'null');
let saved = JSON.parse(localStorage.getItem('ip_s') || '[]');
let liked = JSON.parse(localStorage.getItem('ip_l') || '[]');
let viewed = +(localStorage.getItem('ip_v') || 0);
let prefs = JSON.parse(localStorage.getItem('ip_p') || '{}');
let fi = 0;
let cf = 'all';
let touchStartY = 0;

// ── BOOT ──────────────────────────────────────────────────
async function boot() {
  PROPS = await DB.getProperties();
  if (U) showPage('app');
}

// ── PAGE NAV ──────────────────────────────────────────────
function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById(p + '-page').classList.add('active');
  if (p === 'app') initApp();
}

// ── AUTH ──────────────────────────────────────────────────
function swTab(t, b) {
  document.querySelectorAll('.auth-tab').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  document.getElementById('login-form').style.display = t === 'login' ? 'flex' : 'none';
  document.getElementById('register-form').style.display = t === 'register' ? 'flex' : 'none';
}

function doLogin() {
  const e = document.getElementById('le').value || 'usuario@instaprop.com';
  U = { name: e.split('@')[0], email: e };
  localStorage.setItem('ip_u', JSON.stringify(U));
  showPage('app');
}

function doReg() {
  const n = document.getElementById('rn').value || 'Usuario';
  const e = document.getElementById('re').value || 'usuario@instaprop.com';
  U = { name: n, email: e };
  localStorage.setItem('ip_u', JSON.stringify(U));
  showPage('app');
}

function doOut() {
  U = null;
  localStorage.removeItem('ip_u');
  showPage('landing');
}

// ── APP INIT ──────────────────────────────────────────────
function initApp() {
  if (!U) return;
  const ini = U.name.substring(0, 2).toUpperCase();
  document.getElementById('avBtn').textContent = ini;
  document.getElementById('pAv').textContent = ini;
  document.getElementById('pNm').textContent = U.name;
  document.getElementById('pEm').textContent = U.email;
  rFeed();
  rSearch();
  rSaved();
  uStats();
  ldPr();
  initGestures();
}

// ── FEED ──────────────────────────────────────────────────
function rFeed() {
  const s = document.getElementById('fStack');
  if (!PROPS.length) return;

  // Progress bar
  const progEl = document.querySelector('.fprog');
  if (progEl) {
    const total = Math.min(PROPS.length, 10);
    progEl.innerHTML = Array.from({ length: total }, (_, i) =>
      `<div class="fprog-seg ${i < fi ? 'done' : i === fi ? 'cur' : ''}"></div>`
    ).join('');
  }

  s.innerHTML = '';
  PROPS.forEach((p, i) => {
    const c = document.createElement('div');
    c.className = 'fc ' + (i === fi ? 'cur' : i > fi ? 'blw' : 'abv');
    const bg = p.image_url
      ? `background-image:url('${p.image_url}');background-size:cover;background-position:center`
      : `background:${p.gradient}`;

    c.innerHTML = `
      <div class="fvis">
        <div class="fbg" style="${bg}"></div>
        <div class="fov"></div>
        <div class="ftop">
          <div class="fbdg">${p.badge || 'Nuevo'}</div>
          <div class="fmtch">⚡ ${p.match_score}% match</div>
        </div>
        <div class="fbot">
          <div class="fprice">${p.price_display}</div>
          <div class="faddr">📍 ${p.address}</div>
          ${(p.bedrooms || p.area_m2) ? `<div class="farea">${p.bedrooms ? `<span>🛏 ${p.bedrooms} amb</span>` : ''}${p.area_m2 ? `<span>📐 ${p.area_m2} m²</span>` : ''}</div>` : ''}
          <div class="ftags">${(p.tags || []).slice(0, 4).map(t => `<span class="ftag">${t}</span>`).join('')}</div>
          <div class="fdesc">${p.description || ''}</div>
        </div>
      </div>`;
    s.appendChild(c);
  });

  uSide();
  viewed++;
  localStorage.setItem('ip_v', viewed);
  uStats();
}

function nxt() { fi = fi < PROPS.length - 1 ? fi + 1 : 0; rFeed(); }
function prv() { if (fi > 0) fi--; rFeed(); }

function likeC() {
  const p = PROPS[fi];
  if (!p) return;
  liked.includes(p.id) ? liked = liked.filter(x => x !== p.id) : liked.push(p.id);
  localStorage.setItem('ip_l', JSON.stringify(liked));
  uSide();
  uStats();
  if (liked.includes(p.id)) showToast('❤️ ¡Te gustó esta propiedad!');
}

function saveC() {
  const p = PROPS[fi];
  if (!p) return;
  const wasSaved = saved.includes(p.id);
  wasSaved ? saved = saved.filter(x => x !== p.id) : saved.push(p.id);
  localStorage.setItem('ip_s', JSON.stringify(saved));
  uSide();
  rSaved();
  uStats();
  showToast(wasSaved ? '🗑 Eliminado de guardados' : '🔖 Guardado');
}

function shareC() {
  const p = PROPS[fi];
  if (navigator.share) {
    navigator.share({ title: 'InstaProp — ' + p.address, text: p.price_display + ' en ' + p.address, url: location.href });
  } else {
    navigator.clipboard?.writeText(p.price_display + ' en ' + p.address + ' — InstaProp');
    showToast('📋 Link copiado');
  }
}

function uSide() {
  const p = PROPS[fi];
  if (!p) return;
  document.getElementById('likeB')?.classList.toggle('liked', liked.includes(p.id));
  document.getElementById('saveB')?.classList.toggle('saved', saved.includes(p.id));
  const ln = document.getElementById('likeN');
  if (ln) ln.textContent = (p.likes || 0) + (liked.includes(p.id) ? 1 : 0);
}

// ── GESTURES ─────────────────────────────────────────────
function initGestures() {
  const stack = document.getElementById('fStack');
  if (!stack) return;

  document.addEventListener('keydown', e => {
    if (document.getElementById('feedV')?.style.display === 'none') return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nxt();
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prv();
  });

  stack.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  stack.addEventListener('touchend', e => {
    const d = touchStartY - e.changedTouches[0].clientY;
    if (d > 40) nxt();
    if (d < -40) prv();
  });

  let wt;
  document.getElementById('feedV')?.addEventListener('wheel', e => {
    if (wt) return;
    if (e.deltaY > 30) nxt();
    if (e.deltaY < -30) prv();
    wt = setTimeout(() => { wt = null; }, 600);
  }, { passive: true });

  stack.addEventListener('click', e => { if (!e.target.closest('.sbtn')) nxt(); });
}

// ── SEARCH ───────────────────────────────────────────────
function rSearch() {
  const c = document.getElementById('sRes');
  if (!c) return;
  const q = (document.getElementById('sInp')?.value || '').toLowerCase();
  const f = PROPS.filter(p => {
    if (cf !== 'all') {
      if (cf === 'mono' && p.type !== 'monoambiente') return false;
      if (cf === '2amb' && p.type !== '2amb') return false;
      if (cf === '3amb' && !['3amb', 'casa', 'ph'].includes(p.type)) return false;
      if (cf === 'casa' && !['casa', 'ph'].includes(p.type)) return false;
      if (cf === 'lujo' && (p.price_usd || 0) < 300000) return false;
    }
    if (q && !p.address.toLowerCase().includes(q) &&
        !(p.tags || []).join(' ').toLowerCase().includes(q) &&
        !(p.neighborhood || '').toLowerCase().includes(q)) return false;
    return true;
  });

  c.innerHTML = f.length
    ? f.map(p => `
      <div class="sc" onclick="goP(${p.id})">
        <div class="sc-img" style="${p.image_url ? `background-image:url('${p.image_url}')` : `background:${p.gradient}`}">
          <div class="sc-badge">${p.badge || 'Nuevo'}</div>
        </div>
        <div class="sc-bd">
          <div class="sc-pr">${p.price_display}</div>
          <div class="sc-ad">📍 ${p.address}</div>
          <div class="sc-ts">${(p.tags || []).slice(0, 3).map(t => `<span class="sc-tg">${t}</span>`).join('')}</div>
        </div>
      </div>`).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text2)">Sin resultados para ese criterio.</div>`;
}

function tFlt(b, t) {
  document.querySelectorAll('.sflt').forEach(c => c.classList.remove('active'));
  b.classList.add('active');
  cf = t;
  rSearch();
}

function goP(id) {
  const i = PROPS.findIndex(p => p.id === id);
  if (i >= 0) { fi = i; sw('feed'); rFeed(); }
}

// ── SAVED ────────────────────────────────────────────────
function rSaved() {
  const c = document.getElementById('xList');
  if (!c) return;
  if (!saved.length) {
    c.innerHTML = '<div class="xempty"><div class="ico">🔖</div><p>Todavía no guardaste propiedades.<br>¡Empezá a explorar!</p></div>';
    return;
  }
  const items = saved.map(id => PROPS.find(p => p.id === id)).filter(Boolean);
  c.innerHTML = '<div class="xlist">' + items.map(p => `
    <div class="xi" onclick="goP(${p.id})">
      <div class="xi-th" style="${p.image_url ? `background-image:url('${p.image_url}')` : `background:${p.gradient}`}"></div>
      <div class="xi-info">
        <div class="xi-pr">${p.price_display}</div>
        <div class="xi-ad">📍 ${p.address}</div>
        <div class="xi-mt">${(p.tags || []).slice(0, 3).map(t => `<span class="xi-tg">${t}</span>`).join('')}</div>
      </div>
      <button class="xi-rm" onclick="event.stopPropagation();rmS(${p.id})">✕</button>
    </div>`).join('') + '</div>';
}

function rmS(id) {
  saved = saved.filter(i => i !== id);
  localStorage.setItem('ip_s', JSON.stringify(saved));
  rSaved();
  uStats();
}

// ── NAV SWITCH ───────────────────────────────────────────
function sw(v, nb) {
  const views = { feed: 'feedV', search: 'searchV', saved: 'savedV', community: 'commV', profile: 'profV' };
  Object.entries(views).forEach(([key, elId]) => {
    const el = document.getElementById(elId);
    if (el) el.style.display = key === v ? 'block' : 'none';
  });
  const side = document.getElementById('fSide');
  const prog = document.querySelector('.fprog');
  if (side) side.style.display = v === 'feed' ? 'flex' : 'none';
  if (prog) prog.style.display = v === 'feed' ? 'flex' : 'none';

  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  if (nb) nb.classList.add('active');
  else {
    const idx = ['feed', 'search', 'saved', 'community', 'profile'].indexOf(v);
    document.querySelectorAll('.ni')[idx]?.classList.add('active');
  }
  if (v === 'search') rSearch();
  if (v === 'saved') rSaved();
  uStats();
}

// ── PROFILE ──────────────────────────────────────────────
function tP(b) { b.classList.toggle('sel'); }

function savePr() {
  prefs = {
    z: [...document.querySelectorAll('#prZ .sel')].map(b => b.textContent),
    t: [...document.querySelectorAll('#prT .sel')].map(b => b.textContent),
    a: [...document.querySelectorAll('#prA .sel')].map(b => b.textContent),
    f: [...document.querySelectorAll('#prF .sel')].map(b => b.textContent),
    b: document.getElementById('bR').value
  };
  localStorage.setItem('ip_p', JSON.stringify(prefs));
  showToast('✓ Preferencias guardadas');
}

function ldPr() {
  if (!prefs.z) return;
  document.querySelectorAll('#prZ .pch').forEach(b => { if (prefs.z?.includes(b.textContent)) b.classList.add('sel'); });
  document.querySelectorAll('#prT .pch').forEach(b => { if (prefs.t?.includes(b.textContent)) b.classList.add('sel'); });
  document.querySelectorAll('#prA .pch').forEach(b => { if (prefs.a?.includes(b.textContent)) b.classList.add('sel'); });
  document.querySelectorAll('#prF .pch').forEach(b => { if (prefs.f?.includes(b.textContent)) b.classList.add('sel'); });
  if (prefs.b) { document.getElementById('bR').value = prefs.b; uB(); }
}

function uB() {
  const v = +document.getElementById('bR').value;
  document.getElementById('bV').textContent = 'USD ' + (v >= 1000 ? Math.round(v / 1000) + 'K' : v);
}

function uStats() {
  const el = id => document.getElementById(id);
  if (el('stV')) el('stV').textContent = viewed;
  if (el('stL')) el('stL').textContent = liked.length;
  if (el('stS')) el('stS').textContent = saved.length;
}

// ── TOAST ────────────────────────────────────────────────
let _tt;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── START ────────────────────────────────────────────────
boot();
