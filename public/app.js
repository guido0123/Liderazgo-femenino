/* Workbook Liderazgo Femenino v2 — JS sin dependencias de build. Datos en data.js */
(function () {
'use strict';
const L = window.LF, COACH_URL = '/.netlify/functions/coach', VERSION = 2;
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SW = {  // opciones de contexto
  identidad: [['mujer','Mujer'],['hombre','Hombre'],['otra','Otra identidad'],['nd','Prefiero no responder']],
  contexto: [['emprendimiento','Emprendimiento o negocio propio'],['direccion','Dirección empresarial o gerencia'],['empleo','Empleo o colaboración profesional'],['estudios','Estudios o formación académica'],['comunidad','Comunidad, ámbito social u otro']],
  proposito: [['propio','Desarrollar mi propio liderazgo'],['promover','Promover el liderazgo femenino'],['comprender','Comprender el liderazgo femenino'],['ambos','Desarrollar mi liderazgo y promover el de otras personas']],
  influencia: [['formal','Tengo autoridad formal o personas a cargo'],['informal','Ejerzo influencia sin autoridad formal'],['inicio','Estoy comenzando a aprender o participar']]
};
const label = (k, v) => ((SW[k].find(o => o[0] === v)) || [0, ''])[1];
const STEPS = [
  {id:'ctx',st:0,t:'Mi contexto'},{id:'dxa',st:1,t:'Diagnóstico A'},{id:'dxb',st:1,t:'Diagnóstico B'},
  {id:'a1',st:2,t:'Aprendiendo de mujeres líderes'},{id:'a2',st:2,t:'Análisis PESTEL'},{id:'a3',st:2,t:'Negociación estratégica'},
  {id:'a4',st:2,t:'Mi estrategia de influencia'},{id:'a5',st:2,t:'Métodos y recursos'},{id:'a6',st:2,t:'Mis compromisos'},
  {id:'plan',st:3,t:'Plan SMART dual'},{id:'seg',st:4,t:'Seguimiento'},{id:'fin',st:5,t:'Evaluación final'}];
const STAGES = ['Mi contexto','Diagnósticos','Actividades','Plan SMART','Seguimiento','Evaluación'];
const MOD = {a1:'Módulos 1 a 3 · referentes',a2:'Módulo 2 · contexto',a3:'Módulo 4 · negociación',a4:'Módulo 3 · influencia',a5:'Módulo 5 · métodos y recursos',a6:'Módulo 6 · plan de desarrollo'};

/* ---------- Estado y guardado ---------- */
const fresh = () => ({v:VERSION, step:0, started:false, profile:{}, dxa:{ans:{},page:0,done:false}, dxb:{ans:{},page:0,done:false,open:['','','']}, act:{1:{},2:{},3:{turns:[]},4:{},5:{r1:{},r2:{}},6:{}}, plan:{draft:null,approved:null,ver:0}, seg:[], log:[], fin:{}});
const jget = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
let profiles = jget('lf_v2_profiles', null) || ['Perfil 1'];
let cur = (function () { try { return localStorage.getItem('lf_v2_current'); } catch (e) { return null; } })() || profiles[0];
if (profiles.indexOf(cur) < 0) profiles.push(cur);
const key = () => 'lf_v2:' + cur;
let S = merge(fresh(), jget(key(), {}));
function merge(base, o) { for (const k in o) { base[k] = (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], o[k]) : o[k]; } return base; }
// Migración prudente: la versión anterior se copia como referencia, nunca se borra ni se modifica.
if (!S.legacy) { try { const old = localStorage.getItem('liderazgo_femenino_v1'); if (old) S.legacy = JSON.parse(old); } catch (e) {} }
let saveTimer = null, status = '';
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(key(), JSON.stringify(S)); localStorage.setItem('lf_v2_profiles', JSON.stringify(profiles)); localStorage.setItem('lf_v2_current', cur); status = 'ok'; }
    catch (e) { status = 'err'; }
    paintStatus();
  }, 250);
}
function paintStatus() {
  const el = $('#lf-save'); if (!el) return;
  el.className = 'lf-save ' + status;
  el.textContent = status === 'ok' ? 'Guardado en este navegador ✓ ' + new Date().toLocaleTimeString('es-MX', {hour:'2-digit',minute:'2-digit'}) : status === 'err' ? 'No se pudo guardar: exporta tu respaldo JSON' : '';
}
const get = p => p.split('.').reduce((o, k) => (o == null ? o : o[k]), S);
function setp(p, v) { const ks = p.split('.'); let o = S; for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = v; save(); }
const logEv = t => { S.log.push({f:new Date().toISOString(), t}); save(); };

/* ---------- Cálculos locales ---------- */
const ruta = () => ({promover:'B', comprender:'C'})[S.profile.proposito] || 'A';
const RUTAS = {A:'Ruta A · desarrollar mi liderazgo', B:'Ruta B · promover el liderazgo femenino', C:'Ruta C · comprender el liderazgo femenino'};
const dxaItems = () => L.DX_A.map(d => d[ruta()]);
function scores(kind) {
  const ans = S[kind].ans, dims = kind === 'dxa' ? L.DX_A : L.DX_B;
  return dims.map((d, i) => { const v = [0, 1, 2].map(j => ans[i + '.' + j]).filter(x => typeof x === 'number'); const n = v.length;
    return {n:d.n, avg: n >= 2 ? v.reduce((a, b) => a + b, 0) / n : null, valid:n}; });
}
function interpret(sc, kind) {
  const ok = sc.filter(s => s.avg != null).sort((a, b) => b.avg - a.avg);
  const fort = ok.filter(s => s.avg >= 4), prio = ok.filter(s => s.avg < (kind === 'dxa' ? 3.5 : 3)).slice(-2).reverse();
  return {fort, prio, sin: sc.filter(s => s.avg == null)};
}
const fmt = x => (x == null ? '—' : x.toFixed(1));
function radar(sc) {
  const N = sc.length, C = 170, R = 120, pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  let g = [1, 2, 3, 4, 5].map(k => '<polygon points="' + sc.map((_, i) => pt(i, R * k / 5).join(',')).join(' ') + '" fill="none" stroke="#d3c4b1" stroke-width="1"/>').join('');
  g += sc.map((s, i) => { const [x, y] = pt(i, R + 22), p = pt(i, R); return '<line x1="' + C + '" y1="' + C + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="#d3c4b1"/><text x="' + x + '" y="' + y + '" font-size="11" fill="#4D270F" text-anchor="' + (x < C - 5 ? 'end' : x > C + 5 ? 'start' : 'middle') + '">' + (i + 1) + '</text>'; }).join('');
  g += '<polygon points="' + sc.map((s, i) => pt(i, R * (s.avg || 0) / 5).join(',')).join(' ') + '" fill="rgba(248,127,87,.35)" stroke="#F87F57" stroke-width="2.5"/>';
  return '<svg viewBox="0 0 340 340" class="radar" role="img" aria-label="Gráfico radar de resultados por dimensión">' + g + '</svg>';
}
function resultBlock(kind) {
  const sc = scores(kind), it = interpret(sc, kind), B = kind === 'dxb';
  const li = (a, empty) => a.length ? '<ul>' + a.map(s => '<li>' + esc(s.n) + ' (' + fmt(s.avg) + ')</li>').join('') + '</ul>' : '<p class="lf-mut">' + empty + '</p>';
  return radar(sc) + '<div class="lf-tbl"><table><thead><tr><th>#</th><th>Dimensión</th><th>Promedio</th><th>Respuestas válidas</th></tr></thead><tbody>' +
    sc.map((s, i) => '<tr><td>' + (i + 1) + '</td><td>' + esc(s.n) + '</td><td>' + (s.avg == null ? 'Sin datos suficientes' : fmt(s.avg) + ' / 5') + '</td><td>' + s.valid + ' de 3</td></tr>').join('') + '</tbody></table></div>' +
    '<div class="lf-cols"><div class="lf-card"><h4>' + (B ? 'Fortalezas del entorno' : 'Fortalezas percibidas') + '</h4>' + li(it.fort, 'Aún no hay dimensiones con promedio de 4 o más.') + '</div>' +
    '<div class="lf-card"><h4>' + (B ? 'Barreras u oportunidades de mejora' : 'Prioridades de desarrollo') + '</h4>' + li(it.prio, 'No se identificaron prioridades con las respuestas válidas.') + '</div></div>' +
    (it.sin.length ? '<p class="lf-mut">Sin datos suficientes (menos de 2 respuestas válidas): ' + it.sin.map(s => esc(s.n)).join(', ') + '. Las respuestas «no aplica» no entran en los promedios.</p>' : '') +
    '<p class="lf-note">Estos resultados son una autopercepción para orientar tus actividades. No son un diagnóstico psicológico ni una calificación de capacidad' + (B ? '' : '; las rutas A, B y C miden cosas distintas y no son equivalentes entre sí') + '.</p>';
}
const topDim = (kind, hi) => { const o = interpret(scores(kind), kind); return (hi ? o.fort[0] : o.prio[0]) || null; };

/* ---------- Plantillas de campos ---------- */
const V = p => esc(get(p) || '');
const ta = (p, lab, help, rows) => '<label class="lf-f"><span>' + lab + '</span>' + (help ? '<small>' + help + '</small>' : '') + '<textarea data-p="' + p + '" rows="' + (rows || 3) + '">' + V(p) + '</textarea></label>';
const inp = (p, lab, ph) => '<label class="lf-f"><span>' + lab + '</span><input type="text" data-p="' + p + '" value="' + V(p) + '" placeholder="' + esc(ph || '') + '"></label>';
const sel = (p, lab, opts, ph) => '<label class="lf-f"><span>' + lab + '</span><select data-p="' + p + '"><option value="">' + (ph || 'Selecciona…') + '</option>' + opts.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return '<option value="' + esc(v) + '"' + (get(p) === v ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>';
const recall = html => '<div class="lf-recall"><b>Lo que ya sabes de tu proceso</b>' + html + '</div>';
const btn = (a, t, cls, extra) => '<button type="button" class="btn ' + (cls || '') + '" data-a="' + a + '" ' + (extra || '') + '>' + t + '</button>';
const head = (t, obj, intro) => '<h2>' + t + '</h2>' + (obj ? '<p class="lf-obj"><b>Objetivo:</b> ' + obj + '</p>' : '') + (intro ? '<p class="lead lf-intro">' + intro + '</p>' : '');
const DXSUM = (kind, hi) => { const d = topDim(kind, hi); return d ? esc(d.n) + ' (' + fmt(d.avg) + ')' : null; };

/* ---------- Vistas ---------- */
const filled = o => o && Object.keys(o).some(k => String(o[k] || '').trim());
function isDone(id) {
  const A = S.act;
  switch (id) {
    case 'ctx': return !!(S.profile.contexto && S.profile.proposito && S.profile.influencia);
    case 'dxa': return !!S.dxa.done; case 'dxb': return !!S.dxb.done;
    case 'a1': return !!(A[1].estrategia || '').trim(); case 'a2': return !!(A[2].accion || '').trim();
    case 'a3': return !!(A[3].final || '').trim(); case 'a4': return !!(A[4].accion || '').trim();
    case 'a5': return !!(A[5].uso || '').trim(); case 'a6': return !!((A[6].c1 || '').trim() && (A[6].c2 || '').trim());
    case 'plan': return !!S.plan.approved; case 'seg': return S.seg.some(r => r.estado && r.estado !== 'Pendiente');
    case 'fin': return !!((S.fin.r1 || '').trim() && (S.fin.r2 || '').trim() && (S.fin.r3 || '').trim());
  } return false;
}
function nav() {
  const pct = Math.round(STEPS.filter(s => isDone(s.id)).length / STEPS.length * 100), st = STEPS[S.step].st;
  const first = i => STEPS.findIndex(s => s.st === i);
  let h = '<header class="top"><div class="wrap lf-bar"><span class="brand">Liderazgo Femenino</span><nav class="links" aria-label="Etapas">' +
    STAGES.map((t, i) => '<a href="#" role="button" data-a="go" data-i="' + first(i) + '" class="' + (st === i ? 'on ' : '') + (STEPS.filter(s => s.st === i).every(s => isDone(s.id)) ? 'ok' : '') + '">' + (i === 0 ? '' : i + '. ') + t + '</a>').join('') +
    '</nav><span id="lf-save" class="lf-save"></span><button type="button" class="btn ghost" data-a="home">Inicio</button></div><div class="prog" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct + '%"></i></div></header>';
  if (st === 2) h += '<div class="lf-sub wrap">' + STEPS.map((s, i) => s.st === 2 ? '<a href="#" role="button" data-a="go" data-i="' + i + '" class="' + (S.step === i ? 'on ' : '') + (isDone(s.id) ? 'ok' : '') + '">' + (isDone(s.id) ? '✓ ' : '') + 'Actividad ' + s.id.slice(1) + '</a>' : '').join('') + '</div>';
  return h;
}
const foot = (extra) => '<div class="lf-foot">' + (S.step > 0 ? btn('prev', '← Anterior', 'ghost') : '<span></span>') + (extra || '') + (S.step < STEPS.length - 1 ? btn('next', 'Continuar →') : '') + '</div>';

function vCtx() {
  const grp = (k, t) => '<fieldset class="lf-card"><legend>' + t + '</legend>' + SW[k].map(o => '<label class="lf-r"><input type="radio" name="' + k + '" data-p="profile.' + k + '" value="' + o[0] + '"' + (S.profile[k] === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>').join('') + '</fieldset>';
  return head('Etapa 0 · Mi contexto', 'Adaptar las actividades a tu situación.', 'Estas respuestas personalizan tu experiencia. No asignan capacidades por género y puedes cambiarlas cuando quieras.') +
    '<p class="lf-note">Tu progreso se guarda solo en este navegador; no hay cuenta ni inicio de sesión. Usa «Respaldo» para llevarlo a otro dispositivo.</p>' +
    grp('identidad', 'Identidad (opcional)') + grp('contexto', 'Contexto principal') + grp('proposito', 'Propósito de aprendizaje') + grp('influencia', 'Experiencia o capacidad de influencia') +
    '<div class="lf-card"><h4>Perfil de sesión y respaldo</h4><p class="lf-mut">Perfil activo: <b>' + esc(cur) + '</b>. Cada perfil guarda sus datos por separado.</p><div class="lf-row">' +
    '<select id="lf-prof" aria-label="Cambiar de perfil">' + profiles.map(p => '<option' + (p === cur ? ' selected' : '') + '>' + esc(p) + '</option>').join('') + '</select>' +
    btn('newprof', 'Nuevo perfil', 'ghost') + btn('export', 'Exportar respaldo JSON', 'ghost') + '<label class="btn ghost lf-file">Importar respaldo<input type="file" accept="application/json" id="lf-imp" hidden></label></div>' +
    (S.legacy ? '<p class="lf-mut">Se encontraron respuestas de la versión anterior del workbook. Se conservan intactas en este navegador y en tu respaldo.</p>' : '') + '</div>' +
    (S.profile.proposito ? '<p class="lf-note">Tu ruta de diagnóstico: <b>' + RUTAS[ruta()] + '</b>' + (S.profile.proposito === 'ambos' ? '. Como elegiste desarrollar y promover, usamos la Ruta A y tu Diagnóstico B cubre la mirada hacia otras personas.' : '.') + '</p>' : '') + foot();
}
function vDx(kind) {
  const D = S[kind], B = kind === 'dxb', dims = B ? L.DX_B : L.DX_A, pages = dims.length + (B ? 1 : 0), scale = B ? L.AGREE : L.FREQ;
  const ttl = B ? 'Etapa 1 · Diagnóstico B: Mi entorno y las oportunidades de liderazgo femenino' : 'Etapa 1 · Diagnóstico A: Mi desarrollo en liderazgo';
  if (D.done) return head(ttl) + resultBlock(kind) + (B ? '<div class="lf-card"><h4>Tus reflexiones</h4>' + L.DX_B_OPEN.map((q, i) => '<p><b>' + q + '</b><br>' + esc(D.open[i] || '—') + '</p>').join('') + '</div>' : '') +
    foot('<button type="button" class="btn ghost" data-a="redo" data-k="' + kind + '">Repetir diagnóstico</button>');
  const p = D.page;
  let body;
  if (B && p === 6) body = '<div class="lf-card"><h4>Preguntas abiertas</h4>' + L.DX_B_OPEN.map((q, i) => ta('dxb.open.' + i, q, '', 3)).join('') + '</div>';
  else {
    const its = B ? dims[p].it : dxaItems()[p];
    body = '<div class="lf-card"><h4>' + (p + 1) + '. ' + esc(dims[p].n) + '</h4>' + its.map((t, j) => {
      const k = p + '.' + j, v = D.ans[k];
      return '<fieldset class="lf-item"><legend>' + esc(t) + '</legend><div class="lf-scale">' + scale.map((s, n) => '<label class="lf-chip"><input type="radio" name="' + kind + k + '" data-dx="' + kind + '" data-k="' + k + '" value="' + (n + 1) + '"' + (v === n + 1 ? ' checked' : '') + '><span>' + (n + 1) + ' · ' + s + '</span></label>').join('') +
        '<label class="lf-chip na"><input type="radio" name="' + kind + k + '" data-dx="' + kind + '" data-k="' + k + '" value="na"' + (v === 'na' ? ' checked' : '') + '><span>' + (B ? 'No tengo información suficiente' : 'No he tenido oportunidad de aplicarlo') + '</span></label></div></fieldset>';
    }).join('') + '</div>';
  }
  const ready = (B && p === 6) || [0, 1, 2].every(j => D.ans[p + '.' + j] != null);
  return head(ttl, null, (B ? 'Indica qué tan de acuerdo estás con cada afirmación sobre tu entorno.' : RUTAS[ruta()] + '. Indica con qué frecuencia ocurre cada afirmación.')) +
    '<p class="lf-mut" aria-live="polite">Bloque ' + (p + 1) + ' de ' + pages + '</p><div class="prog lf-bp"><i style="width:' + Math.round(p / pages * 100) + '%"></i></div>' + body +
    '<div class="lf-foot">' + (p > 0 || S.step > 0 ? btn('dxprev', '← Anterior', 'ghost', 'data-k="' + kind + '"') : '') + btn('dxnext', p === pages - 1 ? 'Ver mis resultados' : 'Siguiente bloque →', '', 'id="lf-next" data-k="' + kind + '"' + (ready ? '' : ' disabled')) + '</div>';
}
function casos() { return L.REFERENTES.map(r => r.orig ? Object.assign({}, r, window.CASOS_ORIGINALES.find(c => c.id === r.id)) : r); }
function vA1() {
  const A = S.act[1], pref = S.profile.contexto, list = casos().sort((a, b) => (b.pref === pref) - (a.pref === pref)), sel1 = A.caso;
  const leg = S.legacy && S.legacy.casos && Object.keys(S.legacy.casos).filter(k => String(S.legacy.casos[k]).trim());
  const c = list.find(x => x.id === sel1);
  return head('Actividad 1 · Aprendiendo de mujeres líderes', 'Extraer una estrategia transferible de una líder referente.', 'Elige un caso (no necesitas analizar todos) o investiga a otra líder. Los casos de Merkel y Ardern provienen del libro; los demás, de la versión original del workbook.') + MOD_TAG('a1') +
    recall('<p>' + (DXSUM('dxa', false) ? 'Prioridad de desarrollo: ' + DXSUM('dxa', false) + '.' : 'Completa el Diagnóstico A para ver tus prioridades.') + '</p>') +
    '<div class="lf-cards">' + list.map(x => '<button type="button" class="lf-case' + (sel1 === x.id ? ' on' : '') + '" data-a="caso" data-id="' + x.id + '">' + (x.pref === pref ? '<em>Sugerido para tu contexto</em>' : '') + '<b>' + esc(x.titulo) + '</b><span>' + esc(x.descripcion.slice(0, 150)) + '…</span></button>').join('') +
    '<button type="button" class="lf-case' + (sel1 === 'otra' ? ' on' : '') + '" data-a="caso" data-id="otra"><b>Otra líder de mi elección</b><span>Investiga a una líder y registra tu fuente.</span></button></div>' +
    (c ? '<div class="lf-card"><h4>' + esc(c.titulo) + '</h4><p>' + esc(c.descripcion) + '</p></div>' : '') +
    (sel1 === 'otra' ? '<div class="lf-card">' + inp('act.1.nombre', 'Nombre de la líder') + inp('act.1.fuente', 'Fuente o enlace de tu investigación', 'https://…') + '</div>' : '') +
    (sel1 ? '<div class="lf-card">' + ta('act.1.q1', '1. ¿Qué desafío enfrentó la líder?') + ta('act.1.q2', '2. ¿Qué decisión o estrategia utilizó?') + ta('act.1.q3', '3. ¿Qué aprendizaje podrías transferir a tu contexto?') + ta('act.1.estrategia', 'Mi estrategia transferible (evidencia para tu plan)', 'Una acción concreta que podrías adaptar.') + '</div>' : '') +
    (leg && leg.length ? '<details class="lf-card"><summary>Tus respuestas a casos en la versión anterior</summary>' + leg.map(k => '<p><b>' + esc(k) + '</b><br>' + esc(S.legacy.casos[k]) + '</p>').join('') + '</details>' : '') + foot();
}
const MOD_TAG = id => '<p class="lf-tag">' + MOD[id] + '</p>';
function vA2() {
  const B = S.dxb.open[0], dim = topDim('dxb', false);
  return head('Actividad 2 · Análisis PESTEL contextualizado', 'Entender qué factores externos influyen en una situación de tu entorno.', 'PESTEL es una herramienta complementaria de este workbook; no es contenido textual de los videos. Completa solo los factores sobre los que tengas información.') + MOD_TAG('a2') +
    recall('<p>' + (B ? 'Situación que describiste: «' + esc(B) + '»' : 'Aún no describiste una situación en el Diagnóstico B.') + '</p>' + (dim ? '<p>Dimensión del entorno con mayor oportunidad de mejora: ' + esc(dim.n) + '.</p>' : '')) +
    ta('act.2.sit', 'Situación que analizarás', 'Puedes tomar la del diagnóstico o elegir otra.') +
    '<div class="lf-cols">' + L.PESTEL.map(f => '<div class="lf-card">' + ta('act.2.f_' + f[0], f[1], f[2] + ' (opcional)', 3) + '</div>').join('') + '</div>' +
    '<div class="lf-card">' + sel('act.2.prio', '1. ¿Qué factor influye más en la situación?', L.PESTEL.map(f => [f[1], f[1]])) + ta('act.2.ctrl', '2. ¿Qué depende de ti y qué está fuera de tu control?') + ta('act.2.op', '3. ¿Qué oportunidad de acción identificas?') + ta('act.2.accion', 'Posible acción (evidencia para tu plan)') + '</div>' + foot();
}
async function coach(mode, payload) {
  try {
    const r = await fetch(COACH_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mode, payload}), signal:AbortSignal.timeout(28000)});
    if (!r.ok) return null; const j = await r.json(); return j && j.ok ? j.data : null;
  } catch (e) { return null; }
}
let busy = '';
function vA3() {
  const A = S.act[3], T = A.turns || [], done = T.length && T.length >= 3 && T[2].r;
  const intro = head('Actividad 3 · Negociación estratégica con IA', 'Preparar una negociación con preguntas guiadas y una síntesis.', 'Describe una negociación real o elige un escenario. La IA te hará hasta tres preguntas, una a la vez. Si la IA no está disponible, usaremos preguntas predefinidas y podrás continuar igual.') + MOD_TAG('a3');
  let h = intro + '<div class="lf-card">' + sel('act.3.esc', 'Escenario simulado', L.ESC_NEG) + ta('act.3.real', 'O describe una negociación real', 'Evita datos sensibles de terceras personas.') + '</div>';
  if (!T.length) h += '<div class="lf-foot">' + btn('neg0', busy ? 'Pensando…' : 'Comenzar con las preguntas', '', busy ? 'disabled' : '') + '</div>';
  else {
    h += '<div class="lf-card">' + T.map((t, i) => '<p class="lf-q"><b>Pregunta ' + (i + 1) + ':</b> ' + esc(t.q) + '</p>' + ta('act.3.turns.' + i + '.r', 'Tu respuesta', '', 3)).join('') + '</div>';
    if (!done) h += '<div class="lf-foot">' + btn('negN', busy ? 'Pensando…' : (T.length < 3 ? 'Enviar y recibir la siguiente pregunta' : 'Enviar y ver síntesis'), '', busy ? 'disabled' : '') + '</div>';
  }
  if (A.sinIA) h += '<p class="lf-note">La IA no respondió, así que usamos preguntas predefinidas. Redacta tu síntesis abajo.</p>';
  if (A.sintesis) h += '<div class="lf-card lf-ai"><h4>Síntesis de la IA (una interpretación, no una calificación)</h4>' + [['fortalezas','Fortalezas de la estrategia'],['revisar','Aspectos que conviene revisar'],['alternativas','Alternativas posibles'],['siguiente','Siguiente paso recomendado']].map(k => '<p><b>' + k[1] + ':</b> ' + esc(A.sintesis[k[0]]) + '</p>').join('') + '</div>';
  if (done || A.sintesis || A.sinIA) h += '<div class="lf-card">' + ta('act.3.final', 'Mi estrategia final de negociación (evidencia para tu plan)', 'Incluye intereses, tu alternativa, opciones de beneficio mutuo y tus límites.', 5) + '</div>';
  return h + foot();
}
function vA4() {
  const fort = DXSUM('dxa', true), esc4 = L.ESC_INF[S.profile.contexto], extra = (S.profile.proposito === 'promover' || S.profile.proposito === 'ambos') ? 'Impulsar que más mujeres accedan a espacios de decisión en mi entorno' : null;
  return head('Actividad 4 · Mi estrategia de influencia', 'Diseñar una acción de influencia viable usando una fortaleza.', 'Piensa en una situación real donde quieras lograr apoyo o visibilidad.') + MOD_TAG('a4') +
    recall('<p>' + (fort ? 'Fortaleza percibida: ' + fort + '.' : 'Aún no hay una fortaleza con promedio de 4 o más; puedes nombrar una por tu cuenta.') + '</p>' + (esc4 ? '<p>Escenario sugerido para tu contexto: ' + esc(esc4) + '.</p>' : '') + (extra ? '<p>También puedes elegir: ' + extra + '.</p>' : '')) +
    '<div class="lf-card">' + ta('act.4.sit', '1. ¿Sobre qué situación deseas influir?') + ta('act.4.fort', '2. ¿Qué fortaleza puedes aprovechar?') + ta('act.4.arg', '3. ¿Qué argumento, mensaje o alianza utilizarías?') + ta('act.4.accion', 'Acción de influencia viable (evidencia para tu plan)') + '</div>' + foot();
}
function vA5() {
  const A = S.act[5], enf = L.ENFOQUES.find(e => e[0] === A.enfoque), cr = [['rel','Relevancia'],['apl','Aplicabilidad'],['tie','Tiempo necesario'],['cos','Costo'],['dis','Disponibilidad']];
  const rec = n => '<div class="lf-card"><h4>Recurso ' + n + (n === 2 ? ' (opcional)' : '') + '</h4>' + inp('act.5.r' + n + '.nom', 'Nombre del recurso (curso, libro, mentoría, herramienta…)') + '<div class="lf-cols3">' + cr.map(c => sel('act.5.r' + n + '.' + c[0], c[1], [['Alta','Alta'],['Media','Media'],['Baja','Baja']], '—')).join('') + '</div></div>';
  return head('Actividad 5 · Evaluación de métodos y recursos', 'Elegir un enfoque y auditar recursos para tu desarrollo.', 'Selecciona un enfoque y evalúa uno o dos recursos con los cinco criterios. Para tiempo y costo, «Alta» significa que exige mucho.') + MOD_TAG('a5') +
    sel('act.5.enfoque', 'Enfoque de liderazgo que quieres explorar', L.ENFOQUES.map(e => e[0])) + (enf ? '<p class="lf-note">Referencia breve (resumen general, no la transcripción del video): ' + esc(enf[1]) + '</p>' : '') +
    rec(1) + rec(2) + ta('act.5.uso', 'Mi decisión: ¿qué recurso usarás y cómo comprobarás su utilidad? (evidencia para tu plan)', 'Define cómo sabrás si te sirvió.', 4) + foot();
}
function evSummary() {
  const A = S.act, row = (t, v) => '<li><b>' + t + ':</b> ' + (v && String(v).trim() ? esc(v) : '<span class="lf-mut">pendiente</span>') + '</li>';
  return '<ul class="lf-ev">' + row('Prioridad de desarrollo', DXSUM('dxa', false) && DXSUM('dxa', false).replace(/&amp;/g, '&')) + row('Barrera u oportunidad del entorno', S.dxb.open[0]) + row('Estrategia transferible (Act. 1)', A[1].estrategia) + row('Acción desde PESTEL (Act. 2)', A[2].accion) + row('Estrategia de negociación (Act. 3)', A[3].final) + row('Acción de influencia (Act. 4)', A[4].accion) + row('Recurso y comprobación (Act. 5)', A[5].uso) + '</ul>';
}
function localCheck() {
  const A = S.act[6], m = []; ['c1','c2','q1','q2','t','r','a'].forEach(k => { if (!(A[k] || '').trim()) m.push(k); });
  const nm = {c1:'el compromiso 1', c2:'el compromiso 2', q1:'el aprendizaje que convertirás en acción', q2:'tu contribución al entorno', t:'tu tiempo disponible', r:'tus recursos', a:'tus apoyos'};
  return m.length ? 'Falta información: ' + m.map(k => nm[k]).join(', ') + '.' : 'Tus compromisos tienen la información básica. Revisa que cada uno sea concreto y que quepa en cuatro semanas.';
}
function vA6() {
  const A = S.act[6];
  return head('Actividad 6 · Mis compromisos de desarrollo', 'Elegir dos compromisos preliminares viables.', 'No necesitas redactar tu Plan SMART: lo generaremos con tus evidencias. Aquí defines qué quieres hacer y con qué condiciones.') + MOD_TAG('a6') +
    recall(evSummary()) +
    '<div class="lf-card">' + ta('act.6.q1', '1. ¿Qué aprendizaje deseas convertir en acción?') + ta('act.6.q2', '2. ¿Qué contribución deseas realizar en tu entorno?') + '<h4>3. ¿Con qué tiempo, recursos y apoyos cuentas?</h4>' + ta('act.6.t', 'Tiempo disponible por semana', '', 2) + ta('act.6.r', 'Recursos', '', 2) + ta('act.6.a', 'Apoyos (personas o grupos)', '', 2) + '</div>' +
    '<div class="lf-card">' + ta('act.6.c1', 'Compromiso 1: mi aprendizaje o desarrollo', 'Ej.: lo que practicarás o fortalecerás en cuatro semanas.') + ta('act.6.c2', 'Compromiso 2: mi contribución al entorno', 'Una acción viable que dependa de ti.') + '</div>' +
    '<div class="lf-foot">' + btn('cohere', busy ? 'Revisando…' : 'Revisar coherencia (opcional, con IA)', 'ghost', busy ? 'disabled' : '') + '</div>' +
    (A.rev ? '<div class="lf-card lf-ai"><h4>Revisión</h4><p>' + esc(A.rev) + '</p></div>' : '') + foot();
}
/* ---------- Plan SMART ---------- */
const META_F = [['smart','Formulación SMART'],['just','Justificación basada en tus evidencias'],['ind','Indicador medible'],['crit','Criterio de éxito'],['rec','Recursos necesarios'],['plazo','Plazo']];
function ctxData() {
  const sc = k => scores(k).map(s => ({dimension:s.n, promedio:s.avg, respuestasValidas:s.valid})), A = S.act;
  return {perfil:{contexto:label('contexto', S.profile.contexto), proposito:label('proposito', S.profile.proposito), influencia:label('influencia', S.profile.influencia), ruta:ruta()},
    diagnosticoPersonal:sc('dxa'), diagnosticoEntorno:sc('dxb'), reflexionesEntorno:S.dxb.open,
    actividades:{referente:{caso:A[1].caso === 'otra' ? A[1].nombre : A[1].caso, estrategia:A[1].estrategia}, pestel:{factorPrioritario:A[2].prio, depende:A[2].ctrl, oportunidad:A[2].op, accion:A[2].accion}, negociacion:{escenario:A[3].esc || A[3].real, estrategia:A[3].final}, influencia:{situacion:A[4].sit, fortaleza:A[4].fort, argumento:A[4].arg, accion:A[4].accion}, metodos:{enfoque:A[5].enfoque, recurso1:A[5].r1 && A[5].r1.nom, recurso2:A[5].r2 && A[5].r2.nom, comprobacion:A[5].uso}},
    compromisos:{aprendizaje:A[6].q1, contribucion:A[6].q2, tiempo:A[6].t, recursos:A[6].r, apoyos:A[6].a, c1:A[6].c1, c2:A[6].c2}};
}
function localPlan() {
  const A = S.act, c = A[6], ev = [DXSUM('dxa', false) && 'prioridad de desarrollo ' + DXSUM('dxa', false).replace(/&amp;/g, '&'), A[1].estrategia && 'estrategia transferible: ' + A[1].estrategia, A[4].accion && 'acción de influencia: ' + A[4].accion].filter(Boolean).join('; ');
  return {metaA:{smart:c.c1 || '', just:ev, ind:'', crit:'', rec:c.r || '', plazo:'4 semanas'}, metaB:{smart:c.c2 || '', just:S.dxb.open[0] ? 'Situación del entorno: ' + S.dxb.open[0] : '', ind:'', crit:'', rec:c.a || '', plazo:'4 semanas'},
    acciones:[{semana:1, accion:'Preparar: ' + (A[5].uso || 'reunir recursos y apoyos necesarios'), meta:'A'}, {semana:2, accion:'Practicar: ' + (A[4].accion || A[3].final || 'ensayar la acción elegida'), meta:'A y B'}, {semana:3, accion:'Aplicar: ' + (c.c2 || c.c1 || 'aplicar el compromiso en una situación real'), meta:'B'}, {semana:4, accion:'Evaluar: revisar indicadores y registrar aprendizajes', meta:'A y B'}], local:true};
}
function vPlan() {
  const P = S.plan, d = P.draft;
  let h = head('Etapa 3 · Plan SMART dual a cuatro semanas', 'Convertir tus evidencias en un plan que puedas editar y aprobar.', 'La IA propone un borrador con tus evidencias. Si no está disponible, armamos uno local con tus propias respuestas. Nada se activa hasta que lo apruebes.') +
    recall(evSummary()) + '<div class="lf-foot">' + btn('genplan', busy ? 'Generando…' : (d ? 'Generar de nuevo con IA' : 'Generar mi Plan SMART con IA'), '', busy ? 'disabled' : '') + btn('localplan', 'Armar borrador local', 'ghost') + '</div>';
  if (!d) return h + foot();
  const meta = (k, t) => '<div class="lf-card"><h3>' + t + '</h3>' + META_F.map(f => ta('plan.draft.' + k + '.' + f[0], f[1], '', f[0] === 'smart' || f[0] === 'just' ? 3 : 2)).join('') + '</div>';
  h += (d.local ? '<p class="lf-note">Borrador local: usa tus respuestas tal cual. Completa el indicador y el criterio de éxito antes de aprobar.</p>' : '<p class="lf-note">Borrador generado por IA a partir de tus evidencias. Es una propuesta: revísala y corrígela.</p>') +
    '<div class="lf-cols">' + meta('metaA', 'Meta A: mi aprendizaje o desarrollo') + meta('metaB', 'Meta B: mi contribución al entorno') + '</div><div class="lf-card"><h3>Acciones principales</h3>' +
    d.acciones.map((a, i) => '<div class="lf-act"><b>Semana ' + a.semana + ' · ' + ['preparar', 'practicar', 'aplicar', 'evaluar'][a.semana - 1] + '</b>' + ta('plan.draft.acciones.' + i + '.accion', 'Acción', '', 2) + sel('plan.draft.acciones.' + i + '.meta', 'Meta relacionada', ['A', 'B', 'A y B']) + '</div>').join('') + '</div>' +
    '<div class="lf-foot">' + btn('approve', P.approved ? 'Aprobar nueva versión (v' + (P.ver + 1) + ')' : 'Aprobar y activar mi plan') + '</div>' +
    (P.approved ? '<p class="lf-note">Versión aprobada: v' + P.approved.v + ' · ' + new Date(P.approved.fecha).toLocaleString('es-MX') + '. Se conserva una copia de cada versión aprobada.</p>' : '');
  return h + foot();
}
/* ---------- Seguimiento ---------- */
const ESTADOS = ['Pendiente', 'En proceso', 'Completada', 'Reprogramada'];
function vSeg() {
  if (!S.seg.length) return head('Etapa 4 · Seguimiento integrado', null, 'Aún no hay un plan aprobado. Cuando apruebes tu Plan SMART, tus acciones aparecerán aquí.') + foot();
  const pct = Math.round(S.seg.filter(r => r.estado === 'Completada').length / S.seg.length * 100);
  return head('Etapa 4 · Seguimiento integrado', 'Registrar tu avance sin depender de la IA.', 'El porcentaje mide acciones completadas, no el logro de tus metas SMART: eso lo evalúas con tus indicadores.') +
    '<div class="lf-card"><b>Acciones completadas: ' + pct + '%</b><div class="prog lf-bp"><i style="width:' + pct + '%"></i></div></div>' +
    S.seg.map((r, i) => '<div class="lf-card"><h4>Semana ' + r.semana + ' · Meta ' + esc(r.meta) + '</h4><p>' + esc(r.accion) + '</p><div class="lf-cols3">' +
      '<label class="lf-f"><span>Fecha</span><input type="date" data-p="seg.' + i + '.fecha" value="' + V('seg.' + i + '.fecha') + '"></label>' + sel('seg.' + i + '.estado', 'Estado', ESTADOS) + inp('seg.' + i + '.ind', 'Indicador o evidencia') + '</div>' +
      ta('seg.' + i + '.res', 'Resultado registrado', '', 2) + ta('seg.' + i + '.obs', 'Obstáculos', '', 2) + ta('seg.' + i + '.adj', 'Ajustes', '', 2) + '</div>').join('') +
    '<details class="lf-card"><summary>Historial de cambios importantes</summary>' + (S.log.length ? '<ul>' + S.log.slice().reverse().map(e => '<li>' + new Date(e.f).toLocaleString('es-MX') + ' · ' + esc(e.t) + '</li>').join('') + '</ul>' : '<p class="lf-mut">Sin cambios registrados.</p>') + '</details>' + foot();
}
function vFin() {
  const done = S.seg.filter(r => r.estado === 'Completada'), pend = S.seg.filter(r => r.estado !== 'Completada');
  return head('Etapa 5 · Evaluación final y exportación', 'Reflexionar sobre tus resultados y descargar tu PDF.', 'Tu PDF siempre refleja los datos guardados más recientes.') +
    '<div class="lf-card"><h4>Resumen de tu seguimiento</h4><p><b>Acciones realizadas:</b> ' + (done.length ? done.map(r => esc(r.accion)).join('; ') : '—') + '</p><p><b>Indicadores y resultados registrados:</b> ' + (S.seg.filter(r => r.res || r.ind).map(r => 'Sem. ' + r.semana + ': ' + esc(r.ind || '') + ' ' + esc(r.res || '')).join('; ') || '—') + '</p><p><b>Resultados pendientes:</b> ' + (pend.length ? pend.length + ' acción(es)' : 'ninguno') + '</p></div>' +
    '<div class="lf-card">' + ta('fin.r1', '1. ¿Qué resultado importante conseguiste?') + ta('fin.r2', '2. ¿Qué aprendiste o qué obstáculo encontraste?') + ta('fin.r3', '3. ¿Qué acción deseas mantener o mejorar?') + ta('fin.next', 'Posibles siguientes pasos (opcional)', '', 2) + '</div>' +
    '<div class="lf-foot">' + btn('prev', '← Anterior', 'ghost') + btn('pdf', 'Descargar PDF actualizado') + btn('export', 'Exportar respaldo JSON', 'ghost') + '</div><p class="lf-note" id="lf-msg" aria-live="polite"></p>';
}
const VIEWS = {ctx:vCtx, dxa:() => vDx('dxa'), dxb:() => vDx('dxb'), a1:vA1, a2:vA2, a3:vA3, a4:vA4, a5:vA5, a6:vA6, plan:vPlan, seg:vSeg, fin:vFin};
function render(keepScroll) {
  const y = window.scrollY;
  $('#lf-app').innerHTML = nav() + '<main class="wrap lf-main" id="main" tabindex="-1">' + VIEWS[STEPS[S.step].id]() + '</main>';
  paintStatus();
  if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); }
}
function go(i) { S.step = Math.max(0, Math.min(STEPS.length - 1, i)); save(); render(); const m = $('#main'); if (m) m.focus({preventScroll:true}); }

/* ---------- PDF ---------- */
function pdf() {
  const msg = $('#lf-msg');
  if (!window.jspdf) { if (msg) msg.textContent = 'No se pudo cargar la librería de PDF. Se abrirá la impresión del navegador para guardar como PDF.'; window.print(); return; }
  const doc = new window.jspdf.jsPDF({unit:'pt', format:'a4'}), W = 595 - 100; let y = 56;
  const clean = s => String(s == null ? '' : s).replace(/[^\x09\x0A\x20-\xFF]/g, '');
  const w = (t, sz, bold, gap) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(sz); doc.splitTextToSize(clean(t) || '-', W).forEach(l => { if (y > 780) { doc.addPage(); y = 56; } doc.text(l, 50, y); y += sz * 1.35; }); y += gap || 4; };
  const sec = t => { doc.addPage(); y = 56; w(t, 18, true, 8); };
  const dims = (k, nm) => { scores(k).forEach(s => w('- ' + s.n + ': ' + (s.avg == null ? 'sin datos suficientes' : fmt(s.avg) + ' / 5') + ' (' + s.valid + ' respuestas validas)', 10, false, 1)); };
  w('Workbook de Liderazgo Femenino', 20, true, 2); w('Programa de Guido Cattaneo · Generado el ' + new Date().toLocaleDateString('es-MX') + ' · Perfil: ' + cur, 10, false, 10);
  w('1. Perfil y punto de partida', 16, true, 6);
  w('Contexto: ' + label('contexto', S.profile.contexto) + '\nPropósito: ' + label('proposito', S.profile.proposito) + '\nInfluencia: ' + label('influencia', S.profile.influencia) + '\nRuta de diagnóstico: ' + RUTAS[ruta()], 11, false, 6);
  w('Diagnóstico A (autopercepción, no es una calificación de capacidad)', 12, true, 2); dims('dxa');
  w('Diagnóstico B (entorno)', 12, true, 2); dims('dxb');
  L.DX_B_OPEN.forEach((q, i) => { w(q, 10, true, 1); w(S.dxb.open[i], 10, false, 4); });
  sec('2. Plan SMART dual'); const ap = S.plan.approved;
  if (!ap) w('El plan aún no ha sido aprobado. Se muestra el borrador actual.', 10, false, 6);
  else w('Versión aprobada v' + ap.v + ' · ' + new Date(ap.fecha).toLocaleString('es-MX'), 10, false, 6);
  const P = ap ? ap.plan : S.plan.draft;
  if (P) { [['metaA', 'Meta A: mi aprendizaje o desarrollo'], ['metaB', 'Meta B: mi contribución al entorno']].forEach(m => { w(m[1], 13, true, 3); META_F.forEach(f => { w(f[1] + ':', 10, true, 0); w(P[m[0]][f[0]], 10, false, 3); }); });
    w('Acciones principales', 13, true, 3); P.acciones.forEach(a => w('Semana ' + a.semana + ' (meta ' + a.meta + '): ' + a.accion, 10, false, 3)); }
  sec('3. Seguimiento, resultados y reflexión final');
  const pc = S.seg.length ? Math.round(S.seg.filter(r => r.estado === 'Completada').length / S.seg.length * 100) : 0;
  w('Acciones completadas: ' + pc + '% (no equivale al logro de las metas)', 11, true, 6);
  S.seg.forEach(r => w('Semana ' + r.semana + ' · ' + r.estado + (r.fecha ? ' · ' + r.fecha : '') + '\nAcción: ' + r.accion + '\nIndicador: ' + (r.ind || '-') + '\nResultado: ' + (r.res || '-') + '\nObstáculos: ' + (r.obs || '-') + '\nAjustes: ' + (r.adj || '-'), 10, false, 8));
  [['fin.r1', '¿Qué resultado importante conseguiste?'], ['fin.r2', '¿Qué aprendiste o qué obstáculo encontraste?'], ['fin.r3', '¿Qué acción deseas mantener o mejorar?'], ['fin.next', 'Siguientes pasos']].forEach(q => { w(q[1], 11, true, 1); w(get(q[0]), 10, false, 6); });
  doc.save('workbook-liderazgo-femenino.pdf'); if (msg) msg.textContent = 'PDF generado con tus datos más recientes.';
}

/* ---------- Eventos ---------- */
const A = {
  home() { S.started = false; save(); showLanding(); },
  go(e, t) { go(+t.dataset.i); }, prev() { go(S.step - 1); }, next() { go(S.step + 1); },
  caso(e, t) { setp('act.1.caso', t.dataset.id); render(true); },
  redo(e, t) { if (confirm('Repetir el diagnóstico borra sus respuestas actuales. Se guarda una nota en el historial. ¿Continuar?')) { const k = t.dataset.k; logEv('Se reinició ' + (k === 'dxa' ? 'el Diagnóstico A' : 'el Diagnóstico B')); const o = S[k].open; S[k] = {ans:{}, page:0, done:false}; if (k === 'dxb') S[k].open = o; save(); render(); } },
  dxprev(e, t) { const D = S[t.dataset.k]; if (D.page > 0) { D.page--; save(); render(); } else go(S.step - 1); },
  dxnext(e, t) { const k = t.dataset.k, D = S[k], pages = k === 'dxb' ? 7 : 8; if (D.page < pages - 1) D.page++; else D.done = true; save(); render(); },
  newprof() { const n = (prompt('Nombre del nuevo perfil (por ejemplo, una persona o un grupo):') || '').trim(); if (!n) return; if (profiles.indexOf(n) < 0) profiles.push(n); switchProfile(n); },
  export() { exportJSON(); },
  async neg0() { busy = 1; render(true); const q = await coach('socratic', {...ctxData(), escenario:S.act[3].esc || S.act[3].real, historial:[]}); busy = ''; S.act[3].turns = [{q:(q && q.pregunta) || L.FALLBACK_Q[0], r:''}]; if (!q) S.act[3].sinIA = true; save(); render(true); },
  async negN() {
    const T = S.act[3].turns; if (!(T[T.length - 1].r || '').trim()) { alert('Escribe tu respuesta para continuar.'); return; }
    busy = 1; render(true);
    if (T.length < 3) { const q = S.act[3].sinIA ? null : await coach('socratic', {...ctxData(), escenario:S.act[3].esc || S.act[3].real, historial:T}); if (!q) S.act[3].sinIA = true; T.push({q:(q && q.pregunta) || L.FALLBACK_Q[T.length], r:''}); }
    else { const s = S.act[3].sinIA ? null : await coach('synthesis', {escenario:S.act[3].esc || S.act[3].real, historial:T}); if (s) S.act[3].sintesis = s; else S.act[3].sinIA = true; }
    busy = ''; save(); render(true);
  },
  async cohere() { busy = 1; render(true); const r = await coach('coherence', {compromisos:ctxData().compromisos, evidencias:ctxData().actividades}); busy = ''; S.act[6].rev = r ? [].concat(r.observaciones || [], (r.faltantes || []).map(x => 'Falta: ' + x)).join(' ') : localCheck() + ' (Revisión local: la IA no respondió).'; save(); render(true); },
  async genplan() { busy = 1; render(true); const p = await coach('plan', ctxData()); busy = ''; S.plan.draft = p || localPlan(); if (!p) alert('La IA no respondió. Armamos un borrador local con tus respuestas; puedes editarlo y aprobarlo igual.'); save(); render(true); },
  localplan() { S.plan.draft = localPlan(); save(); render(true); },
  approve() {
    const d = S.plan.draft, bad = !(d.metaA.smart || '').trim() || !(d.metaB.smart || '').trim();
    if (bad) { alert('Completa la formulación SMART de ambas metas antes de aprobar.'); return; }
    S.plan.ver++; S.plan.approved = {v:S.plan.ver, fecha:new Date().toISOString(), plan:JSON.parse(JSON.stringify(d))};
    S.plan.historial = (S.plan.historial || []).concat([S.plan.approved]);
    d.acciones.forEach((a, i) => { const r = S.seg.find(x => x.semana === a.semana); if (r) { if (r.accion !== a.accion) logEv('Acción de la semana ' + a.semana + ' modificada en el plan v' + S.plan.ver); r.accion = a.accion; r.meta = a.meta; } else S.seg.push({semana:a.semana, accion:a.accion, meta:a.meta, estado:'Pendiente'}); });
    logEv('Plan SMART aprobado: versión ' + S.plan.ver); alert('Plan aprobado (v' + S.plan.ver + '). Ya puedes darle seguimiento.'); go(S.step + 1);
  },
  pdf() { pdf(); }
};
function switchProfile(n) { cur = n; try { localStorage.setItem('lf_v2_current', n); localStorage.setItem('lf_v2_profiles', JSON.stringify(profiles)); } catch (e) {} S = merge(fresh(), jget(key(), {})); S.started = true; save(); render(); }
function exportJSON() {
  const blob = new Blob([JSON.stringify({app:'lf-workbook', version:VERSION, exportado:new Date().toISOString(), perfil:cur, estado:S}, null, 1)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'respaldo-liderazgo-femenino-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
document.addEventListener('click', ev => { const t = ev.target.closest('[data-a]'); if (!t || !A[t.dataset.a]) return; ev.preventDefault(); A[t.dataset.a](ev, t); });
document.addEventListener('input', ev => { const t = ev.target; if (t.dataset && t.dataset.p && t.type !== 'radio' && t.tagName !== 'SELECT') setp(t.dataset.p, t.value); });
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'lf-prof') { switchProfile(t.value); return; }
  if (t.id === 'lf-imp') { const f = t.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { const j = JSON.parse(rd.result); if (j.app !== 'lf-workbook' || !j.estado) throw 0; let n = (j.perfil || 'Importado') + ' (importado)'; while (profiles.indexOf(n) >= 0) n += '*'; profiles.push(n); cur = n; S = merge(fresh(), j.estado); S.started = true; save(); alert('Respaldo importado como un perfil nuevo: ' + n + '. No se sobrescribió ningún dato existente.'); render(); } catch (e) { alert('El archivo no es un respaldo válido de este workbook.'); } }; rd.readAsText(f); return; }
  if (t.dataset.dx) { const D = S[t.dataset.dx]; D.ans[t.dataset.k] = t.value === 'na' ? 'na' : +t.value; save(); const n = $('#lf-next'); if (n) { const p = D.page; n.disabled = ![0, 1, 2].every(j => D.ans[p + '.' + j] != null); } return; }
  if (t.dataset.p && (t.type === 'radio' || t.tagName === 'SELECT')) { setp(t.dataset.p, t.value); if (t.type === 'radio') render(true); }
});
function showLanding() { $('#lf-landing').hidden = false; $('#lf-app').hidden = true; window.scrollTo(0, 0); }
function start() { S.started = true; save(); $('#lf-landing').hidden = true; $('#lf-app').hidden = false; render(); }
document.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', start));
if (S.started) { $('#lf-landing').hidden = true; $('#lf-app').hidden = false; render(); }
window.__lf = {scores, interpret, ruta, go, localPlan, get state() { return S; }};
})();
