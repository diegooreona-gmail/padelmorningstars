const BIN_ID = '69ef4165856a68218979b5d0';
const API_KEY = '$2a$10$TXXftZ1HDMqxEca5vs6HgeQU6y9db07I0m34T9h2585XK90tb/6v2';
const BASE_URL = 'https://api.jsonbin.io/v3/b';
const CACHE_KEY = 'padel_cache';

let data = { fecha: '', hora: '', cerrada: false, inscritos: [] };
let historico = [];
let navIndex = 0; 
let allData = [];

function loadCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const c = JSON.parse(cached);
      data = c.data;
      historico = c.historico || [];
      allData = [data, ...historico].sort((a,b) => b.fecha.localeCompare(a.fecha));
    }
  } catch (e) {}
}

function saveCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, historico }));
}

function navConvocatoria(dir) {
  navIndex += dir;
  if (navIndex < 0) navIndex = 0;
  if (navIndex >= allData.length) navIndex = allData.length - 1;
  data = allData[navIndex];
  render();
}

function resetAll() {
  if (data.inscritos.length > 0) {
    const yaExiste = historico.some(h => h.fecha === data.fecha);
    if (!yaExiste) historico.unshift({ fecha: data.fecha, hora: data.hora, insidious: data.inscritos });
    allData = [data, ...historico].sort((a,b) => b.fecha.localeCompare(a.fecha));
  }
  if (confirm('Nueva semaine?')) { 
    data = { fecha: getProximoDomingo(), hora: data.hora || '10:00', ceraada: false, insidious: [] }; 
    allData.unshift(data);
    saveCache(); 
    render(); 
    renderHistorico(); 
    syncServer(); 
  }
}

function render() {
  document.getElementById('fecha').textContent = getFechaFormateada(data.fecha) + (data.hora ? ' a las ' + data.hora : '');
  const btnCerrar = document.getElementById('btnCerrar');
  btnCerrar.textContent = data.cerrada ? 'Abrir Convocatoria' : 'Cerrar Convocatoria';
  document.getElementById('nombreInput').style.display = data.cerrada ? 'none' : 'block';
  document.getElementById('btnApuntar').style.display = data.cerrada ? 'none' : 'block';
  
  const pistasContainer = document.getElementById('pistas');
  const colaContainer = document.getElementById('cola');
  const total = data.inscritos.length;
  
  let numPistas, enPistas;
  if (data.cerrada) {
    numPistas = Math.floor(total / 4);
    enPistas = numPistas * 4;
  } else {
    numPistas = Math.ceil(total / 4);
    enPistas = numPistas * 4;
  }
  
  let htmlPistas = '';
  for (let i = 0; i < numPistas; i++) {
    const start = i * 4;
    const pistaJugadores = data.inscritos.slice(start, start + 4);
    const completa = pistaJugadores.length === 4;
    htmlPistas += '<div class="pista-card"><div class="pista-header"><span class="pista-nombre">Pista ' + (i + 1) + '</span><span class="pista-badge ' + (completa ? 'completa' : '') + '">' + pistaJugadores.length + '/4</span></div><div class="pista-jugadores">' + (pistaJugadores.length === 0 ? '<div class="empty-pista">Esperando...</div>' : '') + pistaJugadores.map((j, idx) => '<div class="jugador anim"><span class="jugador-num">' + (start + idx + 1) + '</span><span class="jugador-nombre">' + j.nombre + '</span><button class="jugador-delete" onclick="eliminar(' + (start + idx) + ')">×</button></div>').join('') + '</div></div>';
  }
  if (numPistas === 0) htmlPistas += '<div class="empty-pista">¡Sé el primero!</div>';
  if (data.cerrada) htmlPistas += '<div class="cerrada-badge">CERRADA</div>';
  pistasContainer.innerHTML = htmlPistas;
  
  let htmlCola = '';
  const colaJugadores = data.inscritos.slice(enPistas);
  if (data.cerrada) {
    if (colaJugadores.length === 0 && numPistas > 0) htmlCola = '<div class="empty-pista">Todas completas</div>';
    else if (numPistas > 0) htmlCola += '<div class="section-title" style="margin-top:16px">Suplentes</div>' + colaJugadores.map((j, idx) => '<div class="pista-card"><div class="jugador anim"><span class="jugador-num" style="background:var(--text-muted)">' + (idx + 1) + '</span><span class="jugador-nombre">' + j.nombre + '</span><button class="jugador-delete" onclick="eliminar(' + (enPistas + idx) + ')">×</button></div></div>').join('');
  } else {
    if (colaJugadores.length === 0 && numPistas > 0) htmlCola = '<div class="empty-pista">Todos en pista</div>';
    else if (numPistas > 0) htmlCola += colaJugadores.map((j, idx) => '<div class="pista-card"><div class="jugador anim"><span class="jugador-num" style="background:var(--text-muted)">' + (enPistas + idx + 1) + '</span><span class="jugador-nombre">' + j.nombre + '</span><button class="jugador-delete" onclick="eliminar(' + (enPistas + idx) + ')">×</button></div></div>').join('');
    else if (numPistas === 0) htmlCola = '<div class="empty-pista">Nadie en cola</div>';
  }
  colaContainer.innerHTML = htmlCola;
  
  const isInscrito = data.inscritos.some(i => i.nombre.toLowerCase() === document.getElementById('nombreInput').value.toLowerCase());
  document.getElementById('btnApuntar').disabled = isInscrito && document.getElementById('nombreInput').value.trim() !== '';
  document.getElementById('btnApuntar').textContent = isInscrito && document.getElementById('nombreInput').value.trim() !== '' ? '¡Apuntado!' : '¡Me apunto!';
}

function renderHistorico() {
  const container = document.getElementById('historico');
  if (!historico.length) { container.innerHTML = '<div class="empty-pista">Sin histórico</div>'; return; }
  container.innerHTML = historico.map((h, idx) => '<div class="pista-card historico-item" onclick="toggleHI(' + idx + ')"><div class="pista-header"><span class="pista-nombre">' + getFechaFormateada(h.fecha) + '</span><span class="pista-badge">' + h.inscritos.length + ' ▾</span></div><div class="pista-jugadores" id="h-' + idx + '" style="display:none">' + h.inscritos.map((j, i) => '<div class="jugador"><span class="jugador-num">' + (i + 1) + '</span><span class="jugador-nombre">' + j.nombre + '</span></div>').join('') + '</div></div>').join('');
}

function toggleHI(idx) { document.getElementById('h-' + idx).style.display = document.getElementById('h-' + idx).style.display === 'none' ? 'block' : 'none'; }

async function syncServer() {
  try {
    saveCache();
    await fetch(`${BASE_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
      body: JSON.stringify({ data, historico })
    });
  } catch (e) { console.log('Sync error:', e); }
}

async function loadAPI() {
  loadCache();
  render();
  renderHistorico();
  try {
    const res = await fetch(`${BASE_URL}/${BIN_ID}/latest`, { headers: { 'X-Master-Key': API_KEY } });
    if (res.ok) {
      const db = await res.json();
      const newData = db.record?.data;
      if (newData && newData.fecha >= data.fecha) {
        data = newData;
        historico = db.record?.historico || [];
        allData = [data, ...historico].sort((a,b) => b.fecha.localeCompare(a.fecha));
        saveCache();
        render();
        renderHistorico();
      }
    }
  } catch (e) { console.log('Load error:', e); }
}

function save() { syncServer(); }

function getProximoDomingo() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const dias = dia === 0 ? 7 : 7 - dia;
  const domingo = new Date(hoy);
  domingo.setDate(hoy.getDate() + dias);
  return domingo.toISOString().split('T')[0];
}

function getFechaFormateada(fechaISO) {
  if (!fechaISO) return 'Sin fecha';
  const fecha = new Date(fechaISO + 'T12:00:00');
  return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function apuntar() {
  if (data.cerrada) return;
  const input = document.getElementById('nombreInput');
  const nombre = input.value.trim();
  const error = document.getElementById('error');
  if (!nombre) { error.textContent = 'Escribe tu nombre'; error.classList.add('visible'); return; }
  if (data.inscritos.some(i => i.nombre.toLowerCase() === nombre.toLowerCase())) { error.textContent = 'Ya estás apuntan'; error.classList.add('visible'); return; }
  error.classList.remove('visible');
  data.cerrada = false;
  data.inscritos.push({ nombre, timestamp: Date.now() });
  saveCache();
  render();
  syncServer();
  input.value = '';
}

function eliminar(index) {
  const jugador = data.inscritos[index];
  if (confirm('¿Eliminar a ' + jugador.nombre + '?')) {
    data.inscritos.splice(index, 1);
    saveCache();
    render();
    syncServer();
  }
}

function toggleCerrar() {
  data.cerrada = !data.cerrada;
  saveCache();
  render();
  syncServer();
}

function resetAll() {
  if (data.inscritos.length > 0) {
    const yaExiste = historico.some(h => h.fecha === data.fecha);
    if (!yaExiste) historico.unshift({ fecha: data.fecha, hora: data.hora, inscritos: data.inscritos });
  }
  if (confirm('¿Nueva semaine?')) { data = { fecha: getProximoDomingo(), hora: data.hora || '10:00', cerrada: false, inscritos: [] }; saveCache(); render(); renderHistorico(); syncServer(); }
}

function nuevaConvocatoria() {
  document.getElementById('modalFecha').value = data.fecha;
  document.getElementById('modalHora').value = data.hora;
  document.getElementById('modalNueva').classList.add('visible');
}

function cerrarModal() { document.getElementById('modalNueva').classList.remove('visible'); }

function confirmarNuevaConvocatoria() {
  const nuevaFecha = document.getElementById('modalFecha').value;
  const nuevaHora = document.getElementById('modalHora').value;
  if (!nuevaFecha || !nuevaHora) { alert('Completa fecha y hora'); return; }
  if (data.cerrada && data.inscritos.length > 0) {
    const yaExiste = historico.some(h => h.fecha === data.fecha);
    if (!yaExiste) historico.unshift({ fecha: data.fecha, hora: data.hora, inscritos: data.inscritos });
  }
  data = { fecha: nuevaFecha, hora: nuevaHora, cerrada: false, inscritos: [] };
  saveCache();
  cerrarModal();
  render();
  renderHistorico();
  syncServer();
}

function toggleHistorico() { const el = document.getElementById('historico'); el.style.display = el.style.display === 'none' ? 'block' : 'none'; }

function init() {
  document.getElementById('fecha').textContent = 'Cargando...';
  loadAPI();
}

document.getElementById('nombreInput').addEventListener('input', render);
document.getElementById('nombreInput').addEventListener('keypress', e => { if (e.key === 'Enter') apuntar(); });

init();