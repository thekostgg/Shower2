(() => {
  const M = window.MANIFEST, C = window.CONFIG;
  const $ = s => document.querySelector(s);
  const px = v => v + 'px';
  const ORDEN = [1, 2, 3, 4, 5]; // páginas de la invitación (la 0 es el sobre)

  // ---------- Tamaño del escenario 9:16 ----------
  function medir() {
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    let w = Math.min(vw, vh * 9 / 16);
    if (vw < 700) w = vw; // en el celular ocupa todo el ancho
    const r = document.documentElement.style;
    r.setProperty('--pw', px(w)); r.setProperty('--ph', px(w * 16 / 9)); r.setProperty('--k', w / 1080);
  }
  window.addEventListener('resize', medir); medir();

  // ---------- Construir páginas ----------
  const acciones = { abrir: abrirSobre, mapa: () => window.open(C.MAPA_URL, '_blank', 'noopener'), confirmar: abrirModal, regalos: verRegalos };
  const etiquetas = { abrir: 'Abrir invitación', mapa: 'Ver ubicación', confirmar: 'Confirmar asistencia', regalos: 'Ver lista de deseos' };
  const imgs = [];

  function pagina(n) {
    const pg = document.createElement('div'); pg.className = 'pagina'; pg.dataset.p = n;
    const es = document.createElement('div'); es.className = 'escena'; pg.appendChild(es);
    for (const L of M.pages[n].layers) {
      const im = new Image(); im.src = L.src; im.alt = ''; im.decoding = 'async'; imgs.push(im);
      Object.assign(im.style, { left: px(L.x), top: px(L.y), width: px(L.w), height: px(L.h) });
      if (L.kind) im.className = 'k-' + L.kind;
      if (L.id) im.dataset.id = L.id;
      if (L.action) {
        im.classList.add('accion'); im.alt = etiquetas[L.action]; im.setAttribute('role', 'button'); im.tabIndex = 0;
        const go = e => { e.preventDefault(); acciones[L.action](); };
        im.addEventListener('click', go); im.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(e); });
      }
      es.appendChild(im);
    }
    if (n === 3) cuentaRegresiva(es);
    return pg;
  }

  const intro = $('#intro'); intro.appendChild(pagina(0));
  // en el sobre también se puede tocar el sobre y el sello
  for (const id of ['sobre', 'sello']) { const el = intro.querySelector('[data-id="' + id + '"]'); if (el) { el.classList.add('accion'); el.addEventListener('click', abrirSobre); } }
  intro.querySelector('.pagina').classList.add('visible');
  const inv = $('#inv'); for (const n of ORDEN) inv.appendChild(pagina(n));

  // pantalla de carga hasta que estén las imágenes del sobre
  const primeras = imgs.slice(0, M.pages[0].layers.length);
  Promise.race([Promise.all(primeras.map(i => i.decode ? i.decode().catch(() => { }) : null)), new Promise(r => setTimeout(r, 6000))])
    .then(() => $('#cargando').classList.add('fuera'));

  // ---------- Abrir el sobre ----------
  let abierto = false;
  function abrirSobre() {
    if (abierto) return; abierto = true;
    intro.classList.add('abriendo');
    setTimeout(() => { document.body.classList.remove('cerrado'); document.body.classList.add('abierto'); window.scrollTo(0, 0); observar(); }, 750);
  }

  if (location.hash === '#abierta') { abierto = true; document.body.classList.remove('cerrado'); document.body.classList.add('abierto'); observar(); }

  // ---------- Animar solo lo que se ve ----------
  function observar() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      e.target.classList.toggle('visible', e.isIntersecting);
      if (e.isIntersecting) e.target.classList.add('visto');
    }), { threshold: 0.12 });
    inv.querySelectorAll('.pagina').forEach(p => io.observe(p));
  }

  // ---------- Cuenta regresiva (en el lugar de la fecha) ----------
  function cuentaRegresiva(es) {
    const K = M.cuenta, meta = new Date(C.EVENTO).getTime();
    const slot = (b, cls) => {
      const d = document.createElement('div'); d.className = 'cuenta txt ' + (cls || '');
      const cx = b.x + b.w / 2;
      Object.assign(d.style, { left: px(cx - 300), top: px(b.y), width: '600px', height: px(b.h), lineHeight: px(b.h), fontSize: px(b.fs), letterSpacing: px(b.ls), paddingLeft: px(b.ls), color: b.color });
      es.appendChild(d); return d;
    };
    const numero = (cls) => {
      const b = K.grande, d = document.createElement('div'); d.className = 'cuenta num ' + (cls || '');
      const cx = b.x + b.w / 2; Object.assign(d.style, { left: px(cx - 300), top: px(b.y), width: '600px', height: px(b.h) });
      es.appendChild(d); return d;
    };
    const pon = (d, txt) => { if (d.textContent !== txt) d.textContent = txt; };
    const ponNum = (d, n) => {
      const s = String(n); if (d.dataset.v === s) return; d.dataset.v = s; d.innerHTML = '';
      for (const ch of s) { const g = K.digitos[ch]; const im = new Image(); im.src = 'assets/gen/num_' + ch + '.webp'; im.alt = '';
        Object.assign(im.style, { width: px(g.w), height: px(g.h), margin: '0 ' + px(-g.pad) }); d.appendChild(im); }
      d.setAttribute('aria-label', s);
    };
    // Estado A: la fecha tal cual el diseño. Estado B: lo que falta.
    const A = { i: slot(K.izq), d: slot(K.der), n: numero(), a: slot(K.abajo) };
    const B = { i: slot(K.izq, 'oculta'), d: slot(K.der, 'oculta'), n: numero('oculta'), a: slot(K.abajo, 'oculta') };
    pon(A.i, 'DICIEMBRE'); pon(A.d, '2026'); ponNum(A.n, 12); pon(A.a, '17:00');
    pon(B.i, 'FALTAN'); pon(B.d, 'DÍAS');
    const z = n => String(n).padStart(2, '0');
    let verB = false, t0 = Date.now();
    function tic() {
      const ms = meta - Date.now();
      if (ms <= 0) { // ya llegó el día: se queda la fecha
        verB = false; [B.i, B.d, B.n, B.a].forEach(e => e.classList.add('oculta')); [A.i, A.d, A.n, A.a].forEach(e => e.classList.remove('oculta')); return;
      }
      const s = Math.floor(ms / 1000), dias = Math.floor(s / 86400);
      ponNum(B.n, dias); pon(B.d, dias === 1 ? 'DÍA' : 'DÍAS'); pon(B.a, z(Math.floor(s % 86400 / 3600)) + ':' + z(Math.floor(s % 3600 / 60)) + ':' + z(s % 60));
      const quiero = Math.floor((Date.now() - t0) / 5000) % 2 === 1; // cambia cada 5 segundos
      if (quiero !== verB) { verB = quiero; [A.i, A.d, A.n, A.a].forEach(e => e.classList.toggle('oculta', verB)); [B.i, B.d, B.n, B.a].forEach(e => e.classList.toggle('oculta', !verB)); }
    }
    tic(); setInterval(tic, 1000);
  }

  // ---------- Lista de deseos ----------
  function verRegalos() {
    if (C.REGALOS_URL) window.open(C.REGALOS_URL, '_blank', 'noopener');
    else aviso('Muy pronto estará disponible la lista de deseos 🍯');
  }

  // ---------- Aviso breve ----------
  let tAviso;
  function aviso(t) { const a = $('#aviso'); a.textContent = t; a.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(() => a.hidden = true, 3500); }

  // ---------- Confirmar asistencia ----------
  const modal = $('#modal'), form = $('#f-confirmar'), estado = form.querySelector('.m-estado'), btn = form.querySelector('.m-enviar');
  function abrirModal() {
    modal.hidden = false; estado.textContent = ''; estado.className = 'm-estado';
    try { const ya = localStorage.getItem('bs-confirmado'); if (ya) { estado.textContent = 'Ya enviaste una respuesta como ' + ya + '. Puedes enviar otra si cambió algo.'; } } catch (e) { }
    setTimeout(() => form.nombre.focus(), 100);
  }
  function cerrarModal() { modal.hidden = true; }
  modal.querySelector('.m-cerrar').addEventListener('click', cerrarModal);
  modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) cerrarModal(); });
  form.addEventListener('change', () => { form.querySelector('.personas').style.display = form.asiste.value === 'No' ? 'none' : ''; });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (nombre.length < 2) { estado.className = 'm-estado error'; estado.textContent = 'Escribe tu nombre, por favor.'; form.nombre.focus(); return; }
    if (form.web.value) return; // bot
    if (!C.CONFIRMAR_URL) { estado.className = 'm-estado error'; estado.textContent = 'La confirmación aún no está conectada.'; return; }
    const datos = new URLSearchParams({
      nombre, asiste: form.asiste.value,
      personas: form.asiste.value === 'No' ? '0' : String(Math.max(1, Math.min(15, +form.personas.value || 1))),
      mensaje: form.mensaje.value.trim(),
    });
    btn.disabled = true; estado.className = 'm-estado'; estado.textContent = 'Enviando…';
    try {
      await fetch(C.CONFIRMAR_URL, { method: 'POST', body: datos, mode: 'no-cors' });
      try { localStorage.setItem('bs-confirmado', nombre); } catch (e) { }
      estado.className = 'm-estado ok';
      estado.textContent = form.asiste.value === 'Sí' ? '¡Gracias, ' + nombre.split(' ')[0] + '! Te esperamos con mucho cariño 🐝' : 'Gracias por avisarnos, ' + nombre.split(' ')[0] + '. ¡Te vamos a extrañar!';
      form.reset(); form.querySelector('.personas').style.display = '';
      setTimeout(cerrarModal, 3500);
    } catch (err) {
      estado.className = 'm-estado error'; estado.textContent = 'No se pudo enviar. Revisa tu conexión e intenta de nuevo.';
    } finally { btn.disabled = false; }
  });
})();
