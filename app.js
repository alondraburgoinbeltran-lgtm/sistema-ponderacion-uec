/* =========================================================
   1. UTILIDADES GENERALES
   Atajos para seleccionar elementos y clonar objetos.
   ========================================================= */
const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [...document.querySelectorAll(selector)];

const dbCache = { catalogs: {}, programs: [], exercises: [] };

const clone = (value) => JSON.parse(JSON.stringify(value));


/* =========================================================
   2. ALMACENAMIENTO EN CLOUDFLARE D1
   La app mantiene una copia temporal en memoria y sincroniza
   los cambios con /api/state (Pages Function + D1).
   ========================================================= */
const store={
  get:(k,d)=>dbCache[k]===undefined?clone(d):dbCache[k],
  set:async(k,v)=>{
    dbCache[k]=clone(v);

    const r=await fetch('/api/state',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:k,value:v})});

    const data=await r.json().catch(()=>({}));

    if(!r.ok||!data.ok)throw new Error(data.error||'No se pudo guardar en D1.');

    return data;

  }
};


/* =========================================================
   3. ESTADO GENERAL Y MENÚ
   Aquí puedes cambiar el módulo inicial, años disponibles
   y nombres que aparecen en el menú lateral.
   ========================================================= */
let state = { page: 'project', year: 2024, step: 1, current: null };

const menu = [
  ['project', '▣', 'Proyecto de Ponderación'],
  ['summary', '⌂', 'Resumen'],
  ['results', '▤', 'Resultados'],
  ['new', '＋', 'Nuevo ejercicio'],
  ['catalog', '▦', 'Catálogo']
];

function years() {
  return [2024,2025,2026,2027,2028,2029]}

/* =========================================================
   4. ESTRUCTURA VISUAL / NAVEGACIÓN
   ========================================================= */
function layout(
  content,
  title,
  sub,
  showYear = true
) {
  const navButtons = menu
    .map((item) => {
      const activeClass =
        state.page === item[0]
          ? 'active'
          : '';

      return `
        <button
          data-page="${item[0]}"
          class="${activeClass}"
          type="button"
        >
          ${item[1]}
          <span>${item[2]}</span>
        </button>
      `;
    })
    .join('');

  const yearOptions = years()
    .map((year) => {
      const selected =
        year === state.year
          ? 'selected'
          : '';

      return `
        <option ${selected}>
          ${year}
        </option>
      `;
    })
    .join('');

  const yearBox = showYear
    ? `
      <div class="yearbox">
        Ejercicio fiscal:
        <select id="yearSel">
          ${yearOptions}
        </select>
      </div>
    `
    : '';

  return `
    <div class="shell">

      <aside class="sidebar">

        <div class="brand">
          <img
            src="assets/logo-uec.png"
            alt="UEC"
          >
        </div>

        <div class="nav">
          ${navButtons}
        </div>

        <div class="sidebar-bottom">

          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
            title="Cerrar y volver al inicio"
          >
            <span class="logout-icon">↪</span>
            <span>Cerrar</span>
          </button>

          <div class="sidefoot">
            Unidad de Evaluación y Control
            <br>
            CVASEBCS
          </div>

        </div>

      </aside>

      <main class="main">

        <div class="topbar">

          <div class="title">
            <h1>${title}</h1>

            <div class="subtitle">
              ${sub}
            </div>
          </div>

          ${yearBox}

        </div>

        ${content}

      </main>

    </div>
  `;
}

function bindNav() {
  $$('.nav button').forEach((button) => {
    button.onclick = () => {
      state.page = button.dataset.page;
      state.step = 1;
      render();
    };
  });

  const yearSelect = $('#yearSel');

  if (yearSelect) {
    yearSelect.onchange = (event) => {
      state.year = +event.target.value;
      render();
    };
  }

  const logoutButton = $('#logoutBtn');

  if (logoutButton) {
    logoutButton.onclick = () => {
      sessionStorage.removeItem('in');

      state.page = 'project';
      state.step = 1;
      state.current = null;

      render();
    };
  }
}

/* =========================================================
   5. PANTALLA DE INICIO
   Sin contraseña. Conserva el diseño institucional aprobado.
   ========================================================= */
function login() {
  document.querySelector('#app').innerHTML = `
    <div class="login">
      <div class="login-overlay">
</div>

      <main class="login-content">
        <div class="login-panel">

          <img
            class="login-logo"
            src="assets/logo-uec.png"
            alt="Unidad de Evaluación y Control"
          >

          <div class="login-title">
            <div class="login-title-small">
              SISTEMA DE
            </div>

            <div class="login-title-main">
              PONDERACIÓN
            </div>

            <div class="login-title-small">
              DE CUENTAS PÚBLICAS
            </div>
          </div>

          <p class="login-subtitle">
            Unidad de Evaluación y Control
            <br>
            de la Comisión de Vigilancia de la ASEBCS
          </p>

          <button
            class="enter"
            id="enter"
            type="button"
          >
            <span class="enter-arrow">→</span>
            <span>INGRESAR</span>
          </button>

          <p class="login-access">
            Acceso institucional · Sin contraseña
          </p>

        </div>
      </main>
    </div>
  `;

  $('#enter').onclick = () => {
    sessionStorage.setItem('in', '1');
    render();
  };
}
/* =========================================================
   6. MÓDULO: PROYECTO DE PONDERACIÓN
   Contenido informativo/metodológico del proyecto.
   ========================================================= */
function project(){let c=`<div class="project-grid">
<div class="card">
<div class="section-title">¿Qué es el proyecto?</div>
<p>El modelo traduce el cumplimiento normativo de cada ente fiscalizado en una calificación única, objetiva y trazable, que sirve como base técnica para determinar la aprobación de la Cuenta Pública.</p>
<div class="intro-icons">
<div class="mini">
<b>◎ Objetividad</b>
<small>
<br>Reglas explícitas de puntuación.</small>
</div>
<div class="mini">
<b>≋ Comparabilidad</b>
<small>
<br>Escala común de 100 puntos.</small>
</div>
<div class="mini">
<b>⌘ Trazabilidad</b>
<small>
<br>Cada resultado se vincula con evidencia.</small>
</div>
<div class="mini">
<b>△ Alerta temprana</b>
<small>
<br>Criterios mayores independientes del puntaje.</small>
</div>
</div>
</div>
<div class="card">
<div class="section-title">Arquitectura del modelo</div>
<div class="architecture">
<div class="score100">100<br>
<span style="font-size:13px">puntos</span>
</div>
<div class="scorebox">
<b>85</b>
<br>Variables de Riesgo</div>
<div class="scorebox">
<b>6</b>
<br>Control y Transparencia</div>
<div class="scorebox">
<b>9</b>
<br>Rendición de Cuentas</div>
</div>
</div>
<div class="card">
<div class="section-title">Distribución de Variables de Riesgo · 85 puntos</div>
<div class="risklist">
<div>% Importe de observaciones solventadas <b>35 pts</b>
</div>
<div>Cuenta Pública conforme a LFyRC <b>6 pts</b>
</div>
<div>% Cantidad de observaciones solventadas <b>15 pts</b>
</div>
<div>Obra Pública <b>6 pts</b>
</div>
<div>Reincidencia <b>10 pts</b>
</div>
<div>Ley de Adquisiciones y Servicios <b>5 pts</b>
</div>
<div>Sistema Contable – SEvAC <b>7 pts</b>
</div>
<div>Informe de Avance de Gestión Financiera <b>1 pt</b>
</div>
</div>
</div>
<div class="grid2">
<div class="card">
<div class="section-title">Criterios mayores</div>
<p>
<b>1.</b> Entrega de Cuenta Pública en tiempo</p>
<p>
<b>2.</b> Sistema Contable Armonizado</p>
<div class="insight">
<b>Regla de aprobación:</b> si cualquiera obtiene “NO”, la clasificación final es NO APROBADA por criterio mayor, independientemente del puntaje.</div>
</div>
<div class="card">
<div class="section-title">Metodología de ajuste</div>
<p>
<b>Ente con obra pública:</b> base de 100 puntos.</p>
<p>
<b>Ente sin obra pública:</b> base de 94 puntos.</p>
<div class="insight">Puntaje final = (Puntos obtenidos × 100) ÷ Base aplicable</div>
</div>
</div>
</div>`;
 $('#app').innerHTML=layout(c,'Proyecto de Ponderación','Modelo técnico para la evaluación y clasificación de las Cuentas Públicas fiscalizadas.',false);
bindNav()}

/* =========================================================
   7. MÓDULO: RESUMEN EJECUTIVO
   Solo usa ejercicios con estado "Finalizado".
   ========================================================= */
function finalized() {
  return store.get('exercises',[]).filter(x=>x.year===state.year&&x.status==='Finalizado')}
function summary(){
  let a=finalized(), approved=a.filter(x=>x.result==='APROBADA'), bad=a.length-approved.length;

  let avg=a.length?a.reduce((s,x)=>s+x.score,0)/a.length:0;

  let pctOk=a.length?(approved.length/a.length*100).toFixed(1):'0.0';

  let pctBad=a.length?(bad/a.length*100).toFixed(1):'0.0';

  let c='<div class="grid4">'+
    '<div class="card kpi"><div class="ico">👥</div><div><b>Entes evaluados</b><div class="num">'+a.length+'</div><small>Total del ejercicio</small></div></div>'+
    '<div class="card kpi"><div class="ico">✓</div><div><b>Aprobados</b><div class="num">'+approved.length+'</div><small>'+pctOk+'% del total</small></div></div>'+
    '<div class="card kpi"><div class="ico" style="color:var(--red)">×</div><div><b>No aprobados</b><div class="num">'+bad+'</div><small>'+pctBad+'% del total</small></div></div>'+
    '<div class="card kpi"><div class="ico">★</div><div><b>Promedio general</b><div class="num">'+(a.length?avg.toFixed(1):'—')+' / 100</div><small>Puntaje promedio</small></div></div></div>';

  if(a.length){
    let deg=(approved.length/a.length*360).toFixed(1);

    c+='<div class="grid2"><div class="card"><div class="section-title">Clasificación de cuentas públicas</div><div style="display:flex;gap:25px;align-items:center;justify-content:center;padding:30px"><div style="width:180px;height:180px;border-radius:50%;background:conic-gradient(var(--ok) 0 '+deg+'deg,var(--red) '+deg+'deg 360deg);position:relative"><div style="position:absolute;inset:45px;background:white;border-radius:50%"></div></div><div><p><span class="status-ok">■</span> Aprobadas: '+approved.length+'</p><p><span class="status-bad">■</span> No aprobadas: '+bad+'</p></div></div></div>'+
    '<div class="card"><div class="section-title">Promedio por componente</div><div class="bars">'+
    '<div class="barrow"><b>Variables de Riesgo</b><div class="track"><div class="fill" style="width:'+Math.min(100,avg)+'%"></div></div><b>'+(avg*.85).toFixed(1)+' / 85</b></div>'+
    '<div class="barrow"><b>Control y Transparencia</b><div class="track"><div class="fill" style="width:'+Math.min(100,avg)+'%"></div></div><b>'+(avg*.06).toFixed(1)+' / 6</b></div>'+
    '<div class="barrow"><b>Rendición de Cuentas</b><div class="track"><div class="fill" style="width:'+Math.min(100,avg)+'%"></div></div><b>'+(avg*.09).toFixed(1)+' / 9</b></div></div></div></div>';

  }else{
    c+='<div class="empty" style="margin-top:14px"><b>Aún no existen ejercicios de ponderación finalizados para '+state.year+'.</b><br><br>Los indicadores aparecerán automáticamente conforme se guarden ejercicios.</div>';

  }
  $('#app').innerHTML=layout(c,'Resumen Ejecutivo','Panorama general del ejercicio seleccionado');
bindNav();

}

/* =========================================================
   8. MÓDULO: CATÁLOGO DE ENTES
   - Importa el PAA desde PDF.
   - Si el PDF es una imagen, detecta las páginas tabulares y
     usa OCR en el navegador.
   - Permite revisar, editar y eliminar entes guardados.
   ========================================================= */
const CATALOG_TYPES = [
  'Poder Ejecutivo',
  'Poder Legislativo',
  'Poder Judicial',
  'Municipal',
  'Organismo Operador Municipal',
  'Descentralizado Estatal',
  'Descentralizado Municipal',
  'Desconcentrado',
  'Autónomo',
  'Otro'
];

function makeEntityId(){
  if(globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'ent-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
}

function normalizeCatalogRecord(record={}){
  return {
    id: record.id || makeEntityId(),
    name: String(record.name || '').trim(),
    type: String(record.type || '').trim(),
    compliance: record.compliance === true,
    work: record.work === true,
    performance: record.performance === true
  };
}

function typeOptions(selected=''){
  const options = selected && !CATALOG_TYPES.includes(selected)
    ? [selected, ...CATALOG_TYPES]
    : CATALOG_TYPES;

  return '<option value="">Seleccionar…</option>' + options.map(type =>
    `<option value="${escapeHtmlAttr(type)}" ${type===selected?'selected':''}>${escapeHtml(type)}</option>`
  ).join('');
}

function yesNoBadge(value){
  return value === true
    ? '<span class="audit-yes">Sí</span>'
    : '<span class="audit-no">No</span>';
}

function catalog(){
  const catalogs = store.get('catalogs',{});
  const arr = (catalogs[state.year] || []).map(normalizeCatalogRecord);
  const exercises = store.get('exercises',[]).filter(x=>x.year===state.year);
  const finalizedExercises = exercises.filter(x=>x.status==='Finalizado');

  let c = `
    <div class="toolbar catalog-toolbar">
      <div class="catalog-toolbar-actions">
        <button class="btn primary" id="uploadBtn">＋ Cargar Programa Anual de Auditorías</button>
        <button class="btn" id="manualEntityBtn">＋ Agregar ente manualmente</button>
      </div>
    </div>

    <div class="catalog-kpis">
      <div class="card smallk">
<b>${arr.length}</b>Entes en catálogo</div>
      <div class="card smallk">
<b>${finalizedExercises.length}</b>Ejercicios realizados</div>
      <div class="card smallk">
<b>${Math.max(0,arr.length-finalizedExercises.length)}</b>Pendientes de evaluar</div>
      <div class="card smallk">
<b>${store.get('programs',[]).filter(p=>p.year===state.year).length}</b>Programas cargados</div>
    </div>`;

  if(arr.length){
    const rows = arr.map((entity,index)=>{
      const done = exercises.some(x=>x.entity===entity.name&&x.status==='Finalizado')
        ? '<span class="status-ok">● Realizado</span>'
        : 'Pendiente';

      return `
        <tr>
          <td class="catalog-entity-cell">${escapeHtml(entity.name)}</td>
          <td>${escapeHtml(entity.type || '—')}</td>
          <td>${yesNoBadge(entity.compliance)}</td>
          <td>${yesNoBadge(entity.work)}</td>
          <td>${yesNoBadge(entity.performance)}</td>
          <td>${done}</td>
          <td class="catalog-row-actions">
            <button class="btn mini-btn edit-catalog-entity" data-index="${index}">Editar</button>
            <button class="btn mini-btn danger-btn delete-catalog-entity" data-index="${index}">Eliminar</button>
          </td>
        </tr>`;
    }).join('');

    c += `
      <div class="tablewrap">
        <table class="table catalog-main-table">
          <thead>
            <tr>
              <th>Ente fiscalizado</th>
              <th>Tipo de ente</th>
              <th>Cumplimiento</th>
              <th>Obra pública</th>
              <th>Desempeño</th>
              <th>Ejercicio de ponderación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }else{
    c += `<div class="empty">No hay entes cargados para ${state.year}.<br>
<br>Carga el PDF del Programa Anual de Auditorías o agrega un ente manualmente.</div>`;
  }

  $('#app').innerHTML = layout(
    c,
    'Catálogo de Entes Fiscalizados',
    'Administra los entes incluidos en el Programa Anual de Auditorías de cada ejercicio.'
  );

  bindNav();
  $('#uploadBtn').onclick = uploadModal;
  $('#manualEntityBtn').onclick = () => entityEditorModal();

  $$('.edit-catalog-entity').forEach(btn=>{
    btn.onclick = () => entityEditorModal(+btn.dataset.index);
  });

  $$('.delete-catalog-entity').forEach(btn=>{
    btn.onclick = () => deleteCatalogEntity(+btn.dataset.index);
  });
}

async function deleteCatalogEntity(index){
  const catalogs = clone(store.get('catalogs',{}));
  const arr = (catalogs[state.year] || []).map(normalizeCatalogRecord);
  const entity = arr[index];
  if(!entity) return;

  const linked = store.get('exercises',[]).filter(x=>x.year===state.year && x.entity===entity.name);
  if(linked.length){
    alert(`No se puede eliminar “${entity.name}” porque tiene ${linked.length} ejercicio(s) relacionado(s). Puedes editar el ente sin perder esa información.`);
    return;
  }

  if(!confirm(`¿Eliminar del catálogo a “${entity.name}”?`)) return;

  arr.splice(index,1);
  catalogs[state.year] = arr;

  try{
    await store.set('catalogs',catalogs);
    catalog();
  }catch(error){
    alert('No se pudo eliminar el ente: '+error.message);
  }
}

function entityEditorModal(index=null){
  const catalogs = clone(store.get('catalogs',{}));
  const arr = (catalogs[state.year] || []).map(normalizeCatalogRecord);
  const original = index===null ? null : arr[index];
  const entity = original || normalizeCatalogRecord({});

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modalbox catalog-editor-modal">
      <div class="modal-head">
        <div>
          <div class="section-title">${original?'Editar ente fiscalizado':'Agregar ente fiscalizado'}</div>
          <p class="subtitle">Los cambios se guardan en el catálogo del ejercicio ${state.year}.</p>
        </div>
        <button class="modal-close" id="entityClose" aria-label="Cerrar">×</button>
      </div>

      <div class="entity-editor-grid">
        <div class="field entity-name-field">
          <label>Nombre del ente fiscalizado</label>
          <input id="entityEditName" value="${escapeHtmlAttr(entity.name)}" placeholder="Nombre oficial del ente">
        </div>
        <div class="field">
          <label>Tipo de ente</label>
          <select id="entityEditType">${typeOptions(entity.type)}</select>
        </div>
      </div>

      <div class="audit-flags editor-audit-flags">
        <label>
<input type="checkbox" id="entityCompliance" ${entity.compliance?'checked':''}> Cumplimiento y Gestión Financiera</label>
        <label>
<input type="checkbox" id="entityWork" ${entity.work?'checked':''}> Obra Pública</label>
        <label>
<input type="checkbox" id="entityPerformance" ${entity.performance?'checked':''}> Desempeño</label>
      </div>

      <div id="entityEditorMessage" class="catalog-message info">
        Verifica el nombre oficial y las auditorías aplicables antes de guardar.
      </div>

      <div class="modal-actions">
        <button class="btn" id="entityCancel">Cancelar</button>
        <button class="btn primary" id="entitySave">Guardar cambios</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  const close = () => modal.remove();
  $('#entityClose').onclick = close;
  $('#entityCancel').onclick = close;

  $('#entitySave').onclick = async ()=>{
    const name = $('#entityEditName').value.trim();
    const message = $('#entityEditorMessage');

    if(!name){
      message.className='catalog-message warning';
      message.textContent='Escribe el nombre del ente fiscalizado.';
      return;
    }

    const key = normalizeEntityKey(name);
    const duplicateIndex = arr.findIndex((item,i)=>i!==index && normalizeEntityKey(item.name)===key);
    if(duplicateIndex>=0){
      message.className='catalog-message warning';
      message.textContent='Ya existe un ente con ese nombre en el catálogo.';
      return;
    }

    const updated = {
      id: entity.id,
      name,
      type: $('#entityEditType').value,
      compliance: $('#entityCompliance').checked,
      work: $('#entityWork').checked,
      performance: $('#entityPerformance').checked
    };

    if(index===null) arr.push(updated);
    else arr[index]=updated;

    catalogs[state.year]=arr;

    const exercises = clone(store.get('exercises',[]));
    if(original && original.name!==updated.name){
      exercises.forEach(ex=>{
        if(ex.year===state.year && ex.entity===original.name) ex.entity=updated.name;
      });
    }

    const btn = $('#entitySave');
    btn.disabled=true;
    btn.textContent='Guardando…';

    try{
      await store.set('catalogs',catalogs);
      if(original && original.name!==updated.name) await store.set('exercises',exercises);
      close();
      catalog();
    }catch(error){
      btn.disabled=false;
      btn.textContent='Guardar cambios';
      message.className='catalog-message error';
      message.textContent='No se pudo guardar en D1: '+error.message;
    }
  };
}

function uploadModal(){
  const modal = document.createElement('div');
  modal.className = 'modal';

  modal.innerHTML = `
    <div class="modalbox catalog-upload-modal">
      <div class="modal-head">
        <div>
          <div class="section-title">Incorporar Programa Anual de Auditorías</div>
          <p class="subtitle">Carga el PDF, revisa la información detectada y confirma únicamente los entes que deban incorporarse.</p>
        </div>
        <button class="modal-close" id="closeM" aria-label="Cerrar">×</button>
      </div>

      <div class="fields catalog-upload-fields">
        <div class="field">
          <label>Ejercicio al que corresponde</label>
          <select id="upYear">
            ${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}
          </select>
        </div>

        <div class="field">
          <label>Programa Anual de Auditorías · PDF</label>
          <input type="file" id="pdfFile" accept="application/pdf">
        </div>
      </div>

      <div class="pdf-process-box">
        <div>
          <b>Extracción automática de la tabla</b>
          <p>Primero se intenta leer el texto del PDF. Si la tabla está escaneada, el sistema detecta las páginas tabulares y aplica OCR en tu navegador.</p>
        </div>
        <button class="btn gold" id="extract">Analizar PDF</button>
      </div>

      <div id="pdfStatus" class="catalog-message info">
        Selecciona el Programa Anual de Auditorías y presiona <b>Analizar PDF</b>.
      </div>

      <div id="ocrProgressWrap" class="ocr-progress-wrap" hidden>
        <div class="ocr-progress-track">
<div id="ocrProgressBar">
</div>
</div>
        <small id="ocrProgressText">Preparando análisis…</small>
      </div>

      <section id="previewSection" class="catalog-preview" hidden>
        <div class="catalog-preview-head">
          <div>
            <div class="section-title">Vista previa del catálogo</div>
            <div class="subtitle">
<span id="candidateCount">0</span> entes seleccionados · revisa los datos antes de guardar.</div>
          </div>
          <div class="preview-actions">
            <button class="btn" id="selectAll">Seleccionar todos</button>
            <button class="btn" id="selectNone">Deseleccionar todos</button>
            <button class="btn" id="addEntity">＋ Agregar ente</button>
          </div>
        </div>

        <div class="catalog-preview-table">
          <table class="table">
            <thead>
              <tr>
                <th class="catalog-check-col">Incluir</th>
                <th>Ente fiscalizado</th>
                <th>Tipo de ente</th>
                <th>Cumplimiento</th>
                <th>Obra pública</th>
                <th>Desempeño</th>
                <th class="catalog-action-col">Acción</th>
              </tr>
            </thead>
            <tbody id="candidateBody">
</tbody>
          </table>
        </div>
      </section>

      <div class="modal-actions">
        <button class="btn" id="cancelM">Cancelar</button>
        <button class="btn primary" id="saveCat" disabled>Guardar seleccionados</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const status = $('#pdfStatus');
  const preview = $('#previewSection');
  const tbody = $('#candidateBody');
  const saveBtn = $('#saveCat');
  const progressWrap = $('#ocrProgressWrap');
  const progressBar = $('#ocrProgressBar');
  const progressText = $('#ocrProgressText');

  const setMessage = (type, html) => {
    status.className = `catalog-message ${type}`;
    status.innerHTML = html;
  };

  const setProgress = (value,text='')=>{
    progressWrap.hidden=false;
    const pct=Math.max(0,Math.min(100,Math.round(value)));
    progressBar.style.width=pct+'%';
    progressText.textContent=text || `${pct}%`;
  };

  const closeModal = () => modal.remove();
  $('#closeM').onclick = closeModal;
  $('#cancelM').onclick = closeModal;

  function refreshCandidateCount(){
    const rows = [...tbody.querySelectorAll('tr')];
    const selected = rows.filter(row => row.querySelector('.candidate-include')?.checked);
    $('#candidateCount').textContent = selected.length;
    saveBtn.disabled = selected.length === 0;
  }

  function appendCandidate(data={}){
    const candidate = normalizeCatalogRecord(data);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="catalog-check-col">
        <input class="candidate-include" type="checkbox" ${data.include===false?'':'checked'} aria-label="Incluir ente">
      </td>
      <td>
        <input class="candidate-name" type="text" value="${escapeHtmlAttr(candidate.name)}" placeholder="Nombre del ente fiscalizado">
      </td>
      <td>
        <select class="candidate-type">${typeOptions(candidate.type)}</select>
      </td>
      <td class="candidate-flag">
<input class="candidate-compliance" type="checkbox" ${candidate.compliance?'checked':''}>
</td>
      <td class="candidate-flag">
<input class="candidate-work" type="checkbox" ${candidate.work?'checked':''}>
</td>
      <td class="candidate-flag">
<input class="candidate-performance" type="checkbox" ${candidate.performance?'checked':''}>
</td>
      <td class="catalog-action-col">
        <button class="icon-btn danger candidate-delete" title="Eliminar" aria-label="Eliminar">×</button>
      </td>`;

    tbody.appendChild(tr);
    tr.querySelector('.candidate-include').onchange = refreshCandidateCount;
    tr.querySelector('.candidate-name').oninput = refreshCandidateCount;
    tr.querySelector('.candidate-delete').onclick = () => {
      tr.remove();
      refreshCandidateCount();
    };
  }

  function renderCandidates(items){
    tbody.innerHTML = '';
    items.forEach(item => appendCandidate(item));
    preview.hidden = false;
    refreshCandidateCount();
  }

  $('#addEntity').onclick = () => {
    appendCandidate({});
    preview.hidden = false;
    const last = tbody.querySelector('tr:last-child .candidate-name');
    if(last) last.focus();
  };

  $('#selectAll').onclick=()=>{
    $$('#candidateBody .candidate-include').forEach(cb=>cb.checked=true);
    refreshCandidateCount();
  };

  $('#selectNone').onclick=()=>{
    $$('#candidateBody .candidate-include').forEach(cb=>cb.checked=false);
    refreshCandidateCount();
  };

  $('#extract').onclick = async () => {
    const file = $('#pdfFile').files[0];

    if(!file){
      setMessage('warning','Selecciona primero un archivo PDF del Programa Anual de Auditorías.');
      return;
    }

    if(file.type && file.type !== 'application/pdf'){
      setMessage('warning','El archivo seleccionado no parece ser un PDF.');
      return;
    }

    const extractBtn = $('#extract');
    extractBtn.disabled = true;
    extractBtn.textContent = 'Analizando…';
    saveBtn.disabled = true;
    preview.hidden = true;
    progressWrap.hidden=false;
    setProgress(3,'Leyendo PDF…');

    setMessage('loading',`Procesando <b>${escapeHtml(file.name)}</b>… El OCR puede tardar un poco si el documento está escaneado.`);

    try{
      const result = await extractPaaEntities(file,(pct,msg)=>setProgress(pct,msg));
      const candidates = result.entities;

      if(!candidates.length){
        renderCandidates([]);
        setMessage(
          'warning',
          'El PDF se pudo analizar, pero no fue posible identificar entes con suficiente seguridad. Puedes usar <b>＋ Agregar ente</b> y capturarlos manualmente sin volver a cargar el archivo.'
        );
      }else{
        renderCandidates(candidates);
        const method = result.usedOcr ? ' mediante OCR' : '';
        setMessage(
          'success',
          `Se identificaron <b>${candidates.length} entes${method}</b>. Revisa nombres, tipo de ente y auditorías antes de guardar.`
        );
      }
      setProgress(100,'Análisis finalizado');
    }catch(error){
      console.error('Error al analizar PDF:', error);
      renderCandidates([]);
      setMessage(
        'error',
        `No fue posible completar el análisis automático: ${escapeHtml(error.message || 'error desconocido')}. Puedes agregar los entes manualmente.`
      );
      setProgress(100,'El análisis terminó con error');
    }finally{
      extractBtn.disabled = false;
      extractBtn.textContent = 'Analizar PDF';
    }
  };

  saveBtn.onclick = async () => {
    const year = +$('#upYear').value;
    const rows = [...tbody.querySelectorAll('tr')];

    const selected = rows
      .filter(row => row.querySelector('.candidate-include')?.checked)
      .map(row => normalizeCatalogRecord({
        name: row.querySelector('.candidate-name')?.value.trim(),
        type: row.querySelector('.candidate-type')?.value || '',
        compliance: row.querySelector('.candidate-compliance')?.checked,
        work: row.querySelector('.candidate-work')?.checked,
        performance: row.querySelector('.candidate-performance')?.checked
      }))
      .filter(item=>item.name);

    const uniqueMap = new Map();
    selected.forEach(item=>uniqueMap.set(normalizeEntityKey(item.name),item));
    const unique = [...uniqueMap.values()];

    if(!unique.length){
      setMessage('warning','Selecciona o agrega al menos un ente antes de guardar.');
      return;
    }

    const catalogs = clone(store.get('catalogs',{}));
    const existing = (catalogs[year] || []).map(normalizeCatalogRecord);
    const existingByKey = new Map(existing.map((item,index)=>[normalizeEntityKey(item.name),{item,index}]));
    let added=0, updated=0;

    unique.forEach(item=>{
      const key=normalizeEntityKey(item.name);
      const hit=existingByKey.get(key);
      if(hit){
        existing[hit.index]={...hit.item,...item,id:hit.item.id};
        updated++;
      }else{
        existing.push(item);
        existingByKey.set(key,{item,index:existing.length-1});
        added++;
      }
    });

    catalogs[year] = existing;

    const file = $('#pdfFile').files[0];
    const programs = clone(store.get('programs',[]));

    if(file){
      const alreadyExists = programs.some(p => p.year===year && p.name===file.name);
      if(!alreadyExists) programs.push({year, name:file.name, date:new Date().toISOString()});
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando…';
    setMessage('loading',`Guardando catálogo en Cloudflare D1… ${added} nuevos y ${updated} existentes por actualizar.`);

    try{
      await store.set('catalogs', catalogs);
      await store.set('programs', programs);
      state.year = year;
      closeModal();
      catalog();
    }catch(error){
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar seleccionados';
      setMessage('error',`No se pudo guardar en D1: ${escapeHtml(error.message)}`);
    }
  };
}

/* =========================================================
   8.1 LECTURA DEL PDF + OCR DE TABLAS
   El PDF real de la ASEBCS puede contener páginas escaneadas.
   Se detectan visualmente las tablas antes de invocar OCR.
   ========================================================= */
async function getPdfDocument(file){
  const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
  return pdfjs.getDocument({data: await file.arrayBuffer()}).promise;
}

async function extractPdfPageLines(page){
  const content = await page.getTextContent();
  const rows = [];

  for(const item of content.items){
    const text = (item.str || '').replace(/\s+/g,' ').trim();
    if(!text) continue;
    const x = item.transform?.[4] ?? 0;
    const y = item.transform?.[5] ?? 0;
    let row = rows.find(r => Math.abs(r.y-y) <= 2.6);
    if(!row){
      row={y,items:[]};
      rows.push(row);
    }
    row.items.push({x,text});
  }

  return rows.sort((a,b)=>b.y-a.y).map(row=>
    row.items.sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ').replace(/\s+/g,' ').trim()
  ).filter(Boolean);
}

async function renderPdfPage(page,scale=1.55){
  const viewport=page.getViewport({scale});
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);
  canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  await page.render({canvasContext:ctx,viewport}).promise;
  return canvas;
}

function detectTableGrid(canvas){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const w=canvas.width, h=canvas.height;
  const image=ctx.getImageData(0,0,w,h).data;
  const scanLeft=Math.floor(w*.10), scanRight=Math.floor(w*.90);
  const ys=[];

  const darkAt=(x,y)=>{
    const i=(y*w+x)*4;
    return (image[i]+image[i+1]+image[i+2])/3 < 135;
  };

  for(let y=Math.floor(h*.10); y<Math.floor(h*.94); y++){
    let dark=0, samples=0;
    for(let x=scanLeft; x<scanRight; x+=2){
      samples++;
      if(darkAt(x,y)) dark++;
    }
    if(dark/samples>.34) ys.push(y);
  }

  if(!ys.length) return null;

  const lines=[];
  let group=[ys[0]];
  for(let i=1;i<ys.length;i++){
    if(ys[i]-ys[i-1]<=2) group.push(ys[i]);
    else{
      lines.push(Math.round(group.reduce((a,b)=>a+b,0)/group.length));
      group=[ys[i]];
    }
  }
  lines.push(Math.round(group.reduce((a,b)=>a+b,0)/group.length));

  const clusters=[];
  let cluster=[lines[0]];
  for(let i=1;i<lines.length;i++){
    if(lines[i]-lines[i-1] <= h*.065) cluster.push(lines[i]);
    else{
      clusters.push(cluster);
      cluster=[lines[i]];
    }
  }
  clusters.push(cluster);

  const best=clusters.sort((a,b)=>b.length-a.length)[0];
  if(!best || best.length<9) return null;

  const extents=[];
  for(const y of best){
    let min=null,max=null;
    for(let x=scanLeft;x<scanRight;x++){
      if(darkAt(x,y)){
        if(min===null) min=x;
        max=x;
      }
    }
    if(min!==null && max-min>w*.40) extents.push([min,max]);
  }

  if(extents.length<5) return null;
  const median = values => {
    const a=[...values].sort((x,y)=>x-y);
    return a[Math.floor(a.length/2)];
  };

  const left=median(extents.map(v=>v[0]));
  const right=median(extents.map(v=>v[1]));
  if(right-left<w*.42) return null;

  return {lines:best,left,right,top:best[0],bottom:best[best.length-1]};
}

function loadTesseract(){
  if(globalThis.Tesseract) return Promise.resolve(globalThis.Tesseract);
  return new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-tesseract-loader]');
    if(existing){
      existing.addEventListener('load',()=>resolve(globalThis.Tesseract),{once:true});
      existing.addEventListener('error',()=>reject(new Error('No se pudo cargar el motor OCR.')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    script.async=true;
    script.dataset.tesseractLoader='1';
    script.onload=()=>resolve(globalThis.Tesseract);
    script.onerror=()=>reject(new Error('No se pudo cargar Tesseract.js. Revisa la conexión a Internet.'));
    document.head.appendChild(script);
  });
}

function flattenOcrWords(data){
  if(Array.isArray(data?.words)) return data.words;
  const words=[];
  const blocks=data?.blocks || [];
  for(const block of blocks){
    for(const paragraph of block.paragraphs || []){
      for(const line of paragraph.lines || []){
        for(const word of line.words || []) words.push(word);
      }
    }
  }
  return words;
}

function mapCategory(text){
  const key=normalizeEntityKey(text);
  if(key.includes('poder ejecutivo')) return 'Poder Ejecutivo';
  if(key.includes('poder legislativo')) return 'Poder Legislativo';
  if(key.includes('poder judicial')) return 'Poder Judicial';
  if(key.includes('organismo operador municipal')) return 'Organismo Operador Municipal';
  if(key.includes('descentralizados estatales') || key.includes('descentralizado estatal')) return 'Descentralizado Estatal';
  if(key.includes('descentralizados municipales') || key.includes('descentralizado municipal')) return 'Descentralizado Municipal';
  if(key.includes('desconcentrado')) return 'Desconcentrado';
  if(key.includes('autonomos') || key.includes('autonomo')) return 'Autónomo';
  if(key.includes('municipales') || key==='municipal') return 'Municipal';
  return '';
}

function cleanOcrEntityName(value){
  return String(value||'')
    .replace(/^[\s|[\]{}()]+/g,'')
    .replace(/[|]+/g,' ')
    .replace(/\s+/g,' ')
    .replace(/^\d+\s+/,'')
    .replace(/[.;,:-]+$/,'')
    .trim();
}

function parseOcrTable(words,grid){
  const width=grid.right-grid.left;
  const xNumberEnd=grid.left+width*.115;
  const xEntityEnd=grid.left+width*.645;
  const xComplianceEnd=grid.left+width*.77;
  const xWorkEnd=grid.left+width*.88;
  const entities=[];
  let currentType='';

  for(let i=0;i<grid.lines.length-1;i++){
    const top=grid.lines[i], bottom=grid.lines[i+1];
    if(bottom-top<7) continue;

    const bandWords=words.filter(word=>{
      const box=word.bbox || word.boundingBox;
      if(!box) return false;
      const cx=(box.x0+box.x1)/2;
      const cy=(box.y0+box.y1)/2;
      return cy>top+1 && cy<bottom-1 && cx>grid.left-8 && cx<grid.right+8;
    });

    if(!bandWords.length) continue;
    bandWords.sort((a,b)=>{
      const ay=(a.bbox?.y0 ?? 0), by=(b.bbox?.y0 ?? 0);
      if(Math.abs(ay-by)>5) return ay-by;
      return (a.bbox?.x0 ?? 0)-(b.bbox?.x0 ?? 0);
    });

    const byColumn={number:[],entity:[],compliance:[],work:[],performance:[]};
    for(const word of bandWords){
      const box=word.bbox;
      if(!box) continue;
      const cx=(box.x0+box.x1)/2;
      const token=String(word.text||'').trim();
      if(!token) continue;
      if(cx<xNumberEnd) byColumn.number.push(word);
      else if(cx<xEntityEnd) byColumn.entity.push(word);
      else if(cx<xComplianceEnd) byColumn.compliance.push(word);
      else if(cx<xWorkEnd) byColumn.work.push(word);
      else byColumn.performance.push(word);
    }

    const join = list => list.map(w=>w.text).join(' ').replace(/\s+/g,' ').trim();
    const entityText=cleanOcrEntityName(join(byColumn.entity));
    const wholeText=cleanOcrEntityName(join(bandWords));
    const category=mapCategory(entityText) || mapCategory(wholeText);

    if(category && !/\d/.test(join(byColumn.number))){
      currentType=category;
      continue;
    }

    const normalized=normalizeEntityKey(entityText);
    if(!entityText || entityText.length<5) continue;
    if(/entidades fiscalizadas|tipo de auditoria|numero de auditoria|totales/.test(normalized)) continue;
    if(mapCategory(entityText)){
      currentType=mapCategory(entityText);
      continue;
    }

    const numberText=join(byColumn.number).replace(/[^0-9]/g,'');
    const looksLikeEntity = /\b(estado|municipio|ayuntamiento|instituto|secretaria|congreso|tribunal|consejo|organismo|sistema|junta|patronato|fideicomiso|servicios|universidad|comision|banco|administracion)\b/.test(normalized);
    if(!numberText && !looksLikeEntity) continue;

    const complianceText=normalizeEntityKey(join(byColumn.compliance));
    const workText=normalizeEntityKey(join(byColumn.work));
    const performanceText=normalizeEntityKey(join(byColumn.performance));
    const allAudit=normalizeEntityKey(join([...byColumn.compliance,...byColumn.work,...byColumn.performance]));

    entities.push({
      id: makeEntityId(),
      name: entityText,
      type: currentType,
      compliance: /cumpli|gestion|financiera/.test(complianceText) || (/cumpli|gestion financiera/.test(allAudit) && !/obra/.test(complianceText)),
      work: /obra|publica/.test(workText),
      performance: /desempe/.test(performanceText)
    });
  }

  return entities;
}

function identifyEntitiesFromText(lines){
  const institutionWords = /\b(ayuntamiento|municipio|congreso|tribunal|instituto|secretar[ií]a|organismo|sistema\s+(?:estatal|municipal)?\s*dif|comisi[oó]n|universidad|fideicomiso|colegio|consejo|junta|centro|procuradur[ií]a|contralor[ií]a|instituci[oó]n|hospital|servicios de salud|patronato|banco|administraci[oó]n portuaria)\b/i;
  const rejectWords = /\b(programa anual|programa de auditor[ií]as|cuenta p[uú]blica|ejercicio fiscal|tipo de auditor[ií]a|n[uú]mero de auditor[ií]a|objetivo|alcance|fundamento|marco legal|p[aá]gina|total de auditor[ií]as|calendario|cronograma)\b/i;
  const result=[];
  let currentType='';

  for(const raw of lines){
    const category=mapCategory(raw);
    if(category && raw.length<80){
      currentType=category;
      continue;
    }

    let line=cleanEntityCandidate(raw);
    if(line.length<5 || line.length>190) continue;
    if(rejectWords.test(line)) continue;
    if(!institutionWords.test(line)) continue;

    const auditPart=normalizeEntityKey(line);
    const compliance=/cumplimiento|gestion financiera/.test(auditPart);
    const work=/obra publica/.test(auditPart);
    const performance=/desempeno/.test(auditPart);

    line=line
      .replace(/\bCUMPLIMIENTO\s+Y\s+GESTI[ÓO]N\s+FINANCIERA\b/ig,' ')
      .replace(/\bOBRA\s+P[ÚU]BLICA\b/ig,' ')
      .replace(/\bDESEMPE[ÑN]O\b/ig,' ')
      .replace(/\s+/g,' ')
      .trim();

    if(!line) continue;
    result.push({id:makeEntityId(),name:line,type:currentType,compliance,work,performance});
  }

  return dedupeCatalogCandidates(result);
}

function dedupeCatalogCandidates(items){
  const map=new Map();
  for(const raw of items){
    const item=normalizeCatalogRecord(raw);
    const key=normalizeEntityKey(item.name);
    if(!key) continue;
    const previous=map.get(key);
    if(previous){
      previous.type=previous.type || item.type;
      previous.compliance=previous.compliance || item.compliance;
      previous.work=previous.work || item.work;
      previous.performance=previous.performance || item.performance;
    }else map.set(key,item);
  }
  return [...map.values()];
}

async function extractPaaEntities(file,onProgress=()=>{}){
  const pdf=await getPdfDocument(file);
  const textLines=[];
  const tablePages=[];
  onProgress(8,`PDF abierto: ${pdf.numPages} páginas. Buscando la tabla…`);

  for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
    const page=await pdf.getPage(pageNumber);
    const lines=await extractPdfPageLines(page);
    textLines.push(...lines);

    const canvas=await renderPdfPage(page,1.35);
    const grid=detectTableGrid(canvas);
    if(grid) tablePages.push({pageNumber,page,canvas,grid});

    onProgress(8+(pageNumber/pdf.numPages)*28,`Analizando estructura de página ${pageNumber} de ${pdf.numPages}…`);
  }

  const fromText=identifyEntitiesFromText(textLines);
  if(fromText.length>=10){
    return {entities:fromText,usedOcr:false};
  }

  if(!tablePages.length){
    return {entities:fromText,usedOcr:false};
  }

  onProgress(40,`Se detectaron ${tablePages.length} página(s) con tabla. Preparando OCR…`);
  const Tesseract=await loadTesseract();
  let activeOcrProgress=0;
  const worker=await Tesseract.createWorker('spa',1,{
    logger: message=>{
      if(message.status==='recognizing text'){
        activeOcrProgress=message.progress || 0;
      }
    }
  });

  const ocrEntities=[];
  try{
    for(let i=0;i<tablePages.length;i++){
      const item=tablePages[i];
      const base=45+(i/tablePages.length)*50;
      onProgress(base,`Aplicando OCR a la página ${item.pageNumber}…`);

      const result=await worker.recognize(
        item.canvas,
        {preserve_interword_spaces:'1'},
        {text:true,blocks:true}
      );
      const words=flattenOcrWords(result.data);
      const parsed=parseOcrTable(words,item.grid);
      ocrEntities.push(...parsed);
      onProgress(45+((i+1)/tablePages.length)*50,`Página ${item.pageNumber} procesada · ${ocrEntities.length} entes detectados…`);
    }
  }finally{
    await worker.terminate();
  }

  const merged=dedupeCatalogCandidates([...fromText,...ocrEntities]);
  return {entities:merged,usedOcr:true};
}

function cleanEntityCandidate(value){
  return String(value||'')
    .replace(/^\s*(?:no\.?|n[uú]m\.?|n[oº°]\.?|\d+)\s*[:.)-]?\s*/i,'')
    .replace(/\s+/g,' ')
    .replace(/^[•·▪■–—-]+\s*/,'')
    .replace(/\s*[|]+\s*/g,' ')
    .trim()
    .replace(/[.;,:-]+$/,'')
    .trim();
}

function normalizeEntityKey(value){
  return String(value||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function escapeHtml(value=''){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function escapeHtmlAttr(value=''){
  return escapeHtml(value);
}

/* =========================================================
   9. MÓDULO: RESULTADOS
   Se alimenta automáticamente de ejercicios finalizados.
   ========================================================= */
function results(){let a=finalized();
let c=a.length?`<div class="toolbar">
<input id="searchRes" placeholder="Buscar ente…" style="padding:10px;border:1px solid var(--border);border-radius:7px">
<button class="btn" id="exportCsv">⇩ Exportar CSV</button>
</div>
<div class="tablewrap">
<table class="table">
<thead>
<tr>
<th>Ente fiscalizado</th>
<th>Tipo de ente</th>
<th>Obra pública</th>
<th>Base aplicable</th>
<th>Puntaje</th>
<th>Criterios mayores</th>
<th>Resultado</th>
</tr>
</thead>
<tbody id="resBody">${resultRows(a)}</tbody>
</table>
</div>`:`<div class="empty">No existen ejercicios finalizados para ${state.year}.</div>`;
$('#app').innerHTML=layout(c,'Resultados de Ponderación','Consulta y compara los resultados de los ejercicios finalizados.');
bindNav();
let s=$('#searchRes');
if(s)s.oninput=()=>{$('#resBody').innerHTML=resultRows(a.filter(x=>x.entity.toLowerCase().includes(s.value.toLowerCase())))};
let ex=$('#exportCsv');
if(ex)ex.onclick=()=>{let rows=[['Ente','Año','Puntaje','Resultado'],...a.map(x=>[x.entity,x.year,x.score.toFixed(2),x.result])];
let blob=new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}),u=URL.createObjectURL(blob),a1=document.createElement('a');
a1.href=u;
a1.download=`resultados_${state.year}.csv`;
a1.click();
URL.revokeObjectURL(u)}}
function resultRows(a){return a.map(x=>`<tr>
<td>${x.entity}</td>
<td>${x.type||'—'}</td>
<td>${x.work?'Sí':'No'}</td>
<td>${x.base}</td>
<td>
<b>${x.score.toFixed(2)}</b>
</td>
<td>${x.majorOk?'<span class="status-ok">Cumple</span>':'<span class="status-bad">Incumple</span>'}</td>
<td class="${x.result==='APROBADA'?'status-ok':'status-bad'}">${x.result}</td>
</tr>`).join('')}

/* =========================================================
   10. MODELO DE DATOS Y CÁLCULO DE PONDERACIÓN
   Si cambian los puntajes/metodología, esta es una de las
   secciones principales que se debe revisar.
   ========================================================= */
function blankExercise(){return {year:state.year,entity:'',type:'',work:true,major1:true,major2:true,risk:{doc:false,elements:false,inventory:false,budget:false,manual:false,banks:false,suppliers:false,report:false,sevac:false,proc:false,annual:false,worksprogram:false,worksfiles:false,paidnot:false,reinc:[false,false,false,false,false]},solv:{countF:0,countS:0,inF:0,inS:0,outF:0,outS:0},ctrl:{ldf:[false,false,false,false],portal:[false,false,false,false]},months:Array(12).fill(false),status:'Borrador'}}
function calc(x){let r=0;
r+=(x.risk.doc?1:0)+(x.risk.elements?1:0)+(x.risk.inventory?.2:0)+(x.risk.budget?.4:0)+(x.risk.manual?1.6:0)+(x.risk.banks?1.6:0)+(x.risk.suppliers?.2:0)+(x.risk.report?1:0)+(x.risk.sevac?7:0)+(x.risk.proc?1:0)+(x.risk.annual?4:0);
if(x.work)r+=(x.risk.worksprogram?2.5:0)+(x.risk.worksfiles?1:0)+(x.risk.paidnot?2.5:0);
let rw=[1,2,3,1,3];
r+=x.risk.reinc.reduce((s,v,i)=>s+(v?rw[i]:0),0);
r+=x.solv.countF?15*Math.min(1,x.solv.countS/x.solv.countF):0;
r+=x.solv.inF?5*Math.min(1,x.solv.inS/x.solv.inF):0;
r+=x.solv.outF?30*Math.min(1,x.solv.outS/x.solv.outF):0;
r+=.75*x.ctrl.ldf.filter(Boolean).length+.75*x.ctrl.portal.filter(Boolean).length+.75*x.months.filter(Boolean).length;
let base=x.work?100:94,score=r*100/base,majorOk=x.major1&&x.major2,result=!majorOk?'NO APROBADA · Criterio mayor':score>=70?'APROBADA':'NO APROBADA · Por puntaje';
return {raw:r,base,score,majorOk,result}}

/* =========================================================
   11. MÓDULO: NUEVO EJERCICIO
   Wizard de captura en 6 pasos.
   ========================================================= */
function newExercise(){let cats=store.get('catalogs',{}), ents=cats[state.year]||[];
if(!state.current||state.current.year!==state.year)state.current=blankExercise();
let x=state.current,c=calc(x);
let content=`<div class="wizard">${['Criterios mayores','Variables de Riesgo','Solventación','Control y Transparencia','Rendición de Cuentas','Resultado'].map((s,i)=>`<div class="step ${state.step===i+1?'active':''}" data-n="${i+1}">${s}</div>`).join('')}</div>
<div class="card" style="margin-bottom:14px">
<div class="fields">
<div class="field">
<label>Ejercicio fiscal</label>
<select id="newYear">${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}</select>
</div>
<div class="field">
<label>Ente fiscalizado</label>
<select id="entity">
<option value="">Seleccionar ente…</option>${ents.map(e=>`<option ${e.name===x.entity?'selected':''}>${e.name}</option>`).join('')}</select>
</div>
</div>
</div>${!ents.length?`<div class="empty">Primero carga el catálogo de entes para ${state.year} desde el módulo Catálogo.</div>`:`<div class="formgrid"><div class="form-main">${stepHtml(x)}</div><aside class="card resultcard"><div class="section-title">Resultado actual</div><div class="bigscore">${c.score.toFixed(2)}</div><div>/ 100</div><hr style="border:0;border-top:1px solid var(--border);margin:18px 0"><small>Base aplicable</small><h3>${c.base} pts</h3><p class="${c.majorOk?'status-ok':'status-bad'}">${c.result}</p><div class="progress"><div style="width:${Math.min(100,c.score)}%"></div></div></aside></div><div style="display:flex;justify-content:space-between;margin-top:14px"><button class="btn" id="prev">Anterior</button><div><button class="btn" id="draft">Guardar borrador</button> <button class="btn primary" id="next">${state.step===6?'Finalizar ejercicio':'Siguiente →'}</button></div></div>`}`;
$('#app').innerHTML=layout(content,'Nuevo ejercicio de ponderación','Capture las variables para calcular la ponderación.');
bindNav();
bindNew(ents)}
function chk(id,label,v){return `<label>
<input type="checkbox" id="${id}" ${v?'checked':''}> ${label}</label>`}
function stepHtml(x){if(state.step===1)return `<div class="card">
<div class="section-title">Paso 1 de 6 · Criterios mayores</div>
<div class="fields">
<div class="toggle">
<h4>Entrega de Cuenta Pública en tiempo</h4>${chk('major1','Sí, cumple',x.major1)}</div>
<div class="toggle">
<h4>Sistema Contable Armonizado</h4>${chk('major2','Sí, cumple',x.major2)}</div>
</div>
</div>`;
if(state.step===2)return `<div class="card">
<div class="section-title">Paso 2 de 6 · Variables de Riesgo</div>
<div class="fields">${[['doc','Documentación cumple transparencia y veracidad · 1 pt'],['elements','Incluye todos los elementos requeridos · 1 pt'],['inventory','Conciliación de inventarios · 0.2 pts'],['budget','Modificaciones presupuestales · 0.4 pts'],['manual','Manual de remuneraciones · 1.6 pts'],['banks','Conciliaciones bancarias · 1.6 pts'],['suppliers','Relación de proveedores · 0.2 pts'],['report','Informe de Avance de Gestión Financiera · 1 pt'],['sevac','SEvAC anual · 7 pts'],['proc','Procedimiento de adquisición con evidencias · 1 pt'],['annual','Programa anual de adquisiciones · 4 pts'],['worksprogram','Programa Anual de Obras Públicas · 2.5 pts'],['worksfiles','Expedientes unitarios de obra · 1 pt'],['paidnot','Obras pagadas NO ejecutadas · 2.5 pts']].map(([k,l])=>`<div class="toggle">${chk('r_'+k,l,x.risk[k])}</div>`).join('')}</div>
<div class="section-title" style="margin-top:18px">Reincidencia · 10 pts</div>
<div class="fields">${['Sistema contable armonizado · 1 pt','Programa anual de adquisiciones · 2 pts','Manual de remuneraciones y tabulador · 3 pts','Excepción a licitación pública · 1 pt','Inventario de bienes muebles e inmuebles · 3 pts'].map((l,i)=>`<div class="toggle">${chk('re_'+i,l,x.risk.reinc[i])}</div>`).join('')}</div>
</div>`;
if(state.step===3)return `<div class="card">
<div class="section-title">Paso 3 de 6 · Solventación</div>
<div class="fields">${numfield('countF','Observaciones fincadas',x.solv.countF)}${numfield('countS','Observaciones solventadas',x.solv.countS)}${numfield('inF','Importe fincado · Ingreso',x.solv.inF)}${numfield('inS','Importe solventado · Ingreso',x.solv.inS)}${numfield('outF','Importe fincado · Egreso',x.solv.outF)}${numfield('outS','Importe solventado · Egreso',x.solv.outS)}</div>
</div>`;
if(state.step===4)return `<div class="card">
<div class="section-title">Paso 4 de 6 · Control y Transparencia</div>
<p>
<b>Ley de Disciplina Financiera · 3 pts</b>
</p>
<div class="choice">${x.ctrl.ldf.map((v,i)=>chk('ldf_'+i,`T${i+1}`,v)).join('')}</div>
<p>
<b>Cuenta Pública en portales · 3 pts</b>
</p>
<div class="choice">${x.ctrl.portal.map((v,i)=>chk('po_'+i,`T${i+1}`,v)).join('')}</div>
</div>`;
if(state.step===5)return `<div class="card">
<div class="section-title">Paso 5 de 6 · Rendición de Cuentas</div>
<div class="fields">${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m,i)=>`<div class="toggle">${chk('mo_'+i,`${m} · 0.75 pts`,x.months[i])}</div>`).join('')}</div>
</div>`;
let c=calc(x);
return `<div class="card">
<div class="section-title">Paso 6 de 6 · Resultado</div>
<div class="grid2">
<div>
<p>
<b>Ente:</b> ${x.entity||'—'}</p>
<p>
<b>Base aplicable:</b> ${c.base} puntos</p>
<p>
<b>Puntaje bruto:</b> ${c.raw.toFixed(2)}</p>
<p>
<b>Puntaje final:</b> ${c.score.toFixed(2)} / 100</p>
</div>
<div>
<div class="bigscore">${c.score.toFixed(2)}</div>
<div class="${c.result==='APROBADA'?'status-ok':'status-bad'}">${c.result}</div>
</div>
</div>
</div>`}
function numfield(id,label,v){return `<div class="field">
<label>${label}</label>
<input type="number" min="0" step="0.01" id="${id}" value="${v||0}">
</div>`}
function bindNew(ents){let x=state.current;
$('#newYear').onchange=e=>{state.year=+e.target.value;
state.current=blankExercise();
render()};
$('#entity').onchange=e=>{x.entity=e.target.value;
let ent=ents.find(z=>z.name===x.entity);
if(ent&&ent.work!==null)x.work=ent.work;
newExercise()};
if(!ents.length)return;
['major1','major2'].forEach(k=>{let el=$('#'+k);
if(el)el.onchange=()=>{x[k]=el.checked;
newExercise()}});
Object.keys(x.risk).filter(k=>k!=='reinc').forEach(k=>{let el=$('#r_'+k);
if(el)el.onchange=()=>{x.risk[k]=el.checked;
newExercise()}});
x.risk.reinc.forEach((_,i)=>{let el=$('#re_'+i);
if(el)el.onchange=()=>{x.risk.reinc[i]=el.checked;
newExercise()}});
Object.keys(x.solv).forEach(k=>{let el=$('#'+k);
if(el)el.oninput=()=>{x.solv[k]=+el.value||0}});
x.ctrl.ldf.forEach((_,i)=>{let el=$('#ldf_'+i);
if(el)el.onchange=()=>{x.ctrl.ldf[i]=el.checked;
newExercise()}});
x.ctrl.portal.forEach((_,i)=>{let el=$('#po_'+i);
if(el)el.onchange=()=>{x.ctrl.portal[i]=el.checked;
newExercise()}});
x.months.forEach((_,i)=>{let el=$('#mo_'+i);
if(el)el.onchange=()=>{x.months[i]=el.checked;
newExercise()}});
$('#prev').onclick=()=>{state.step=Math.max(1,state.step-1);
newExercise()};
$('#draft').onclick=()=>saveExercise(false);
$('#next').onclick=()=>{Object.keys(x.solv).forEach(k=>{let el=$('#'+k);
if(el)x.solv[k]=+el.value||0});
if(state.step<6){state.step++;
newExercise()}else saveExercise(true)}}

/* =========================================================
   12. GUARDADO DE BORRADORES Y EJERCICIOS FINALIZADOS
   ========================================================= */
async function saveExercise(final){let x=state.current;
if(!x.entity)return alert('Selecciona un ente del catálogo.');
let all=clone(store.get('exercises',[])),idx=all.findIndex(z=>z.year===x.year&&z.entity===x.entity),c=calc(x),saved={...clone(x),...c,status:final?'Finalizado':'Borrador',updatedAt:new Date().toISOString()};
if(idx>=0)all[idx]=saved;
else all.push(saved);
try{await store.set('exercises',all);
if(final){alert('Ejercicio finalizado y guardado en Cloudflare D1.');
state.page='results';
state.current=null;
state.step=1;
render()}else alert('Borrador guardado en Cloudflare D1.')}catch(e){alert('No se pudo guardar en D1: '+e.message)}}

/* =========================================================
   13. CIERRE DE SESIÓN
   El botón Cerrar se enlaza desde bindNav() y elimina
   únicamente la sesión visual del navegador.
   ========================================================= */

/* =========================================================
   14. RENDERIZADO E INICIALIZACIÓN
   ========================================================= */
function render(){if(!sessionStorage.getItem('in'))return login();
if(state.page==='project')project();
if(state.page==='summary')summary();
if(state.page==='catalog')catalog();
if(state.page==='results')results();
if(state.page==='new')newExercise()}
async function init(){
  try{
    const r=await fetch('/api/state',{headers:{'cache-control':'no-cache'}});

    const payload=await r.json().catch(()=>({}));

    if(!r.ok||!payload.ok)throw new Error(payload.error||'No fue posible consultar la base D1.');

    Object.assign(dbCache,payload.data||{});

    render();

  }catch(e){
    document.querySelector('#app').innerHTML=`<div class="login">
<section class="login-card">
<div class="login-panel">
<img src="assets/logo-uec.png">
<h1>SISTEMA DE<br>
<span>PONDERACIÓN</span>
<br>DE CUENTAS PÚBLICAS</h1>
<p>No fue posible conectar con la base institucional.</p>
<div class="insight" style="max-width:430px;margin:22px auto;text-align:left">
<b>Revisa el binding D1:</b> debe llamarse <b>DB</b> y apuntar a <b>ponderacion-uec-db</b>.<br>
<small>${e.message}</small>
</div>
<button class="enter" onclick="location.reload()">REINTENTAR</button>
</div>
</section>
<section class="login-empty">
</section>
</div>`;

  }
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
init();
