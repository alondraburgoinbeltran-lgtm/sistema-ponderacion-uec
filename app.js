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
function layout(content,title,sub,showYear=true){return `<div class="shell"><aside class="sidebar"><div class="brand"><img src="assets/logo-uec.png"></div><div class="nav">${menu.map(m=>`<button data-page="${m[0]}" class="${state.page===m[0]?'active':''}">${m[1]} <span>${m[2]}</span></button>`).join('')}</div><div class="sidefoot">Unidad de Evaluación y Control<br>CVASEBCS</div></aside><main class="main"><div class="topbar"><div class="title"><h1>${title}</h1><div class="subtitle">${sub}</div></div>${showYear?`<div class="yearbox">Ejercicio fiscal: <select id="yearSel">${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}</select></div>`:''}</div>${content}</main></div>`}
function bindNav(){ $$('.nav button').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;
state.step=1;
render()});
 const y=$('#yearSel');
 if(y)y.onchange=e=>{state.year=+e.target.value;
render()}}

/* =========================================================
   5. PANTALLA DE INICIO
   Sin contraseña. Conserva el diseño institucional aprobado.
   ========================================================= */
function login(){document.querySelector('#app').innerHTML=`<div class="login"><section class="login-card"><div class="login-panel"><img src="assets/logo-uec.png"><h1>SISTEMA DE<br><span>PONDERACIÓN</span><br>DE CUENTAS PÚBLICAS</h1><p>Unidad de Evaluación y Control<br>de la Comisión de Vigilancia de la ASEBCS</p><div class="goldline"></div><button class="enter" id="enter">↪ &nbsp; INGRESAR</button><p style="font-size:12px">Acceso institucional · Sin contraseña</p></div></section><section class="login-empty"></section></div>`;
$('#enter').onclick=()=>{sessionStorage.setItem('in','1');
render()}}

/* =========================================================
   6. MÓDULO: PROYECTO DE PONDERACIÓN
   Contenido informativo/metodológico del proyecto.
   ========================================================= */
function project(){let c=`<div class="project-grid"><div class="card"><div class="section-title">¿Qué es el proyecto?</div><p>El modelo traduce el cumplimiento normativo de cada ente fiscalizado en una calificación única, objetiva y trazable, que sirve como base técnica para determinar la aprobación de la Cuenta Pública.</p><div class="intro-icons"><div class="mini"><b>◎ Objetividad</b><small><br>Reglas explícitas de puntuación.</small></div><div class="mini"><b>≋ Comparabilidad</b><small><br>Escala común de 100 puntos.</small></div><div class="mini"><b>⌘ Trazabilidad</b><small><br>Cada resultado se vincula con evidencia.</small></div><div class="mini"><b>△ Alerta temprana</b><small><br>Criterios mayores independientes del puntaje.</small></div></div></div><div class="card"><div class="section-title">Arquitectura del modelo</div><div class="architecture"><div class="score100">100<br><span style="font-size:13px">puntos</span></div><div class="scorebox"><b>85</b><br>Variables de Riesgo</div><div class="scorebox"><b>6</b><br>Control y Transparencia</div><div class="scorebox"><b>9</b><br>Rendición de Cuentas</div></div></div><div class="card"><div class="section-title">Distribución de Variables de Riesgo · 85 puntos</div><div class="risklist"><div>% Importe de observaciones solventadas <b>35 pts</b></div><div>Cuenta Pública conforme a LFyRC <b>6 pts</b></div><div>% Cantidad de observaciones solventadas <b>15 pts</b></div><div>Obra Pública <b>6 pts</b></div><div>Reincidencia <b>10 pts</b></div><div>Ley de Adquisiciones y Servicios <b>5 pts</b></div><div>Sistema Contable – SEvAC <b>7 pts</b></div><div>Informe de Avance de Gestión Financiera <b>1 pt</b></div></div></div><div class="grid2"><div class="card"><div class="section-title">Criterios mayores</div><p><b>1.</b> Entrega de Cuenta Pública en tiempo</p><p><b>2.</b> Sistema Contable Armonizado</p><div class="insight"><b>Regla de aprobación:</b> si cualquiera obtiene “NO”, la clasificación final es NO APROBADA por criterio mayor, independientemente del puntaje.</div></div><div class="card"><div class="section-title">Metodología de ajuste</div><p><b>Ente con obra pública:</b> base de 100 puntos.</p><p><b>Ente sin obra pública:</b> base de 94 puntos.</p><div class="insight">Puntaje final = (Puntos obtenidos × 100) ÷ Base aplicable</div></div></div></div>`;
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
   Permite cargar el Programa Anual de Auditorías por año.
   ========================================================= */
function catalog(){
  let cats=store.get('catalogs',{}), arr=cats[state.year]||[];

  let ex=store.get('exercises',[]).filter(x=>x.year===state.year);

  let done=ex.filter(x=>x.status==='Finalizado').length;

  let c='<div class="toolbar"><button class="btn primary" id="uploadBtn">＋ Cargar Programa Anual de Auditorías</button></div>'+
    '<div class="catalog-kpis"><div class="card smallk"><b>'+arr.length+'</b>Entes en catálogo</div>'+
    '<div class="card smallk"><b>'+done+'</b>Ejercicios realizados</div>'+
    '<div class="card smallk"><b>'+Math.max(0,arr.length-done)+'</b>Pendientes de evaluar</div>'+
    '<div class="card smallk"><b>'+store.get('programs',[]).filter(p=>p.year===state.year).length+'</b>Programas cargados</div></div>';

  if(arr.length){
    let rows=arr.map(e=>{
      let work=e.work===true?'Sí':e.work===false?'No':'—';

      let doneRow=ex.some(x=>x.entity===e.name&&x.status==='Finalizado')?'<span class="status-ok">● Realizado</span>':'Pendiente';

      return '<tr><td>'+e.name+'</td><td>'+(e.type||'—')+'</td><td>'+work+'</td><td>Activo</td><td>'+doneRow+'</td></tr>';

    }).join('');

    c+='<div class="tablewrap"><table class="table"><thead><tr><th>Ente fiscalizado</th><th>Tipo de ente</th><th>Obra pública</th><th>Estado</th><th>Ejercicio de ponderación</th></tr></thead><tbody>'+rows+'</tbody></table></div>';

  }else c+='<div class="empty">No hay entes cargados para '+state.year+'.<br><br>Carga el PDF del Programa Anual de Auditorías para construir el catálogo.</div>';

  $('#app').innerHTML=layout(c,'Catálogo de Entes Fiscalizados','Administra los entes incluidos en el Programa Anual de Auditorías de cada ejercicio.');
bindNav();
$('#uploadBtn').onclick=uploadModal;

}
function uploadModal(){let m=document.createElement('div');
m.className='modal';
m.innerHTML=`<div class="modalbox"><div class="section-title">Incorporar Programa Anual de Auditorías</div><div class="fields"><div class="field"><label>Ejercicio al que corresponde</label><select id="upYear">${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}</select></div><div class="field"><label>Archivo PDF</label><input type="file" id="pdfFile" accept="application/pdf"></div></div><p class="subtitle">La app intentará extraer texto del PDF en el navegador. Podrás revisar y corregir el catálogo antes de guardarlo.</p><div class="field"><label>Entes identificados o captura manual (uno por línea)</label><textarea id="entitiesText" style="min-height:240px;padding:12px;border:1px solid var(--border);border-radius:8px"></textarea></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px"><button class="btn" id="closeM">Cancelar</button><button class="btn gold" id="extract">Extraer del PDF</button><button class="btn primary" id="saveCat">Guardar catálogo</button></div></div>`;
document.body.appendChild(m);
$('#closeM').onclick=()=>m.remove();
$('#extract').onclick=async()=>{let f=$('#pdfFile').files[0];
if(!f)return alert('Selecciona un PDF.');
$('#entitiesText').value='Procesando PDF…';
try{let pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
let pdf=await pdfjs.getDocument({data:await f.arrayBuffer()}).promise, text='';
for(let i=1;
i<=pdf.numPages;
i++){let p=await pdf.getPage(i),tc=await p.getTextContent();
text+='\n'+tc.items.map(x=>x.str).join(' ')}let candidates=[...new Set(text.split(/\n|\s{3,}/).map(s=>s.trim()).filter(s=>s.length>12&&s.length<140&&/(ayuntamiento|instituto|secretar|sistema|organismo|tribunal|congreso|comisión|universidad|fideicomiso|colegio|dirección|centro|consejo)/i.test(s)))];
$('#entitiesText').value=candidates.join('\n')}catch(e){$('#entitiesText').value='';
alert('No se pudo extraer automáticamente. Puedes capturar o pegar los entes manualmente.') }};
$('#saveCat').onclick=async()=>{let y=+$('#upYear').value,lines=$('#entitiesText').value.split('\n').map(s=>s.trim()).filter(Boolean);
if(!lines.length)return alert('Agrega al menos un ente.');
let cats=clone(store.get('catalogs',{}));
cats[y]=[...new Map(lines.map(n=>[n.toLowerCase(),{name:n,type:'',work:null}])).values()];
let f=$('#pdfFile').files[0],p=clone(store.get('programs',[]));
if(f)p.push({year:y,name:f.name,date:new Date().toISOString()});
let btn=$('#saveCat');
btn.disabled=true;
btn.textContent='Guardando…';
try{await store.set('catalogs',cats);
await store.set('programs',p);
state.year=y;
m.remove();
catalog();
alert('Catálogo guardado correctamente en Cloudflare D1.')}catch(e){btn.disabled=false;
btn.textContent='Guardar catálogo';
alert('No se pudo guardar en D1: '+e.message)}}}

/* =========================================================
   9. MÓDULO: RESULTADOS
   Se alimenta automáticamente de ejercicios finalizados.
   ========================================================= */
function results(){let a=finalized();
let c=a.length?`<div class="toolbar"><input id="searchRes" placeholder="Buscar ente…" style="padding:10px;border:1px solid var(--border);border-radius:7px"><button class="btn" id="exportCsv">⇩ Exportar CSV</button></div><div class="tablewrap"><table class="table"><thead><tr><th>Ente fiscalizado</th><th>Tipo de ente</th><th>Obra pública</th><th>Base aplicable</th><th>Puntaje</th><th>Criterios mayores</th><th>Resultado</th></tr></thead><tbody id="resBody">${resultRows(a)}</tbody></table></div>`:`<div class="empty">No existen ejercicios finalizados para ${state.year}.</div>`;
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
function resultRows(a){return a.map(x=>`<tr><td>${x.entity}</td><td>${x.type||'—'}</td><td>${x.work?'Sí':'No'}</td><td>${x.base}</td><td><b>${x.score.toFixed(2)}</b></td><td>${x.majorOk?'<span class="status-ok">Cumple</span>':'<span class="status-bad">Incumple</span>'}</td><td class="${x.result==='APROBADA'?'status-ok':'status-bad'}">${x.result}</td></tr>`).join('')}

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
let content=`<div class="wizard">${['Criterios mayores','Variables de Riesgo','Solventación','Control y Transparencia','Rendición de Cuentas','Resultado'].map((s,i)=>`<div class="step ${state.step===i+1?'active':''}" data-n="${i+1}">${s}</div>`).join('')}</div><div class="card" style="margin-bottom:14px"><div class="fields"><div class="field"><label>Ejercicio fiscal</label><select id="newYear">${years().map(y=>`<option ${y===state.year?'selected':''}>${y}</option>`).join('')}</select></div><div class="field"><label>Ente fiscalizado</label><select id="entity"><option value="">Seleccionar ente…</option>${ents.map(e=>`<option ${e.name===x.entity?'selected':''}>${e.name}</option>`).join('')}</select></div></div></div>${!ents.length?`<div class="empty">Primero carga el catálogo de entes para ${state.year} desde el módulo Catálogo.</div>`:`<div class="formgrid"><div class="form-main">${stepHtml(x)}</div><aside class="card resultcard"><div class="section-title">Resultado actual</div><div class="bigscore">${c.score.toFixed(2)}</div><div>/ 100</div><hr style="border:0;border-top:1px solid var(--border);margin:18px 0"><small>Base aplicable</small><h3>${c.base} pts</h3><p class="${c.majorOk?'status-ok':'status-bad'}">${c.result}</p><div class="progress"><div style="width:${Math.min(100,c.score)}%"></div></div></aside></div><div style="display:flex;justify-content:space-between;margin-top:14px"><button class="btn" id="prev">Anterior</button><div><button class="btn" id="draft">Guardar borrador</button> <button class="btn primary" id="next">${state.step===6?'Finalizar ejercicio':'Siguiente →'}</button></div></div>`}`;
$('#app').innerHTML=layout(content,'Nuevo ejercicio de ponderación','Capture las variables para calcular la ponderación.');
bindNav();
bindNew(ents)}
function chk(id,label,v){return `<label><input type="checkbox" id="${id}" ${v?'checked':''}> ${label}</label>`}
function stepHtml(x){if(state.step===1)return `<div class="card"><div class="section-title">Paso 1 de 6 · Criterios mayores</div><div class="fields"><div class="toggle"><h4>Entrega de Cuenta Pública en tiempo</h4>${chk('major1','Sí, cumple',x.major1)}</div><div class="toggle"><h4>Sistema Contable Armonizado</h4>${chk('major2','Sí, cumple',x.major2)}</div></div></div>`;
if(state.step===2)return `<div class="card"><div class="section-title">Paso 2 de 6 · Variables de Riesgo</div><div class="fields">${[['doc','Documentación cumple transparencia y veracidad · 1 pt'],['elements','Incluye todos los elementos requeridos · 1 pt'],['inventory','Conciliación de inventarios · 0.2 pts'],['budget','Modificaciones presupuestales · 0.4 pts'],['manual','Manual de remuneraciones · 1.6 pts'],['banks','Conciliaciones bancarias · 1.6 pts'],['suppliers','Relación de proveedores · 0.2 pts'],['report','Informe de Avance de Gestión Financiera · 1 pt'],['sevac','SEvAC anual · 7 pts'],['proc','Procedimiento de adquisición con evidencias · 1 pt'],['annual','Programa anual de adquisiciones · 4 pts'],['worksprogram','Programa Anual de Obras Públicas · 2.5 pts'],['worksfiles','Expedientes unitarios de obra · 1 pt'],['paidnot','Obras pagadas NO ejecutadas · 2.5 pts']].map(([k,l])=>`<div class="toggle">${chk('r_'+k,l,x.risk[k])}</div>`).join('')}</div><div class="section-title" style="margin-top:18px">Reincidencia · 10 pts</div><div class="fields">${['Sistema contable armonizado · 1 pt','Programa anual de adquisiciones · 2 pts','Manual de remuneraciones y tabulador · 3 pts','Excepción a licitación pública · 1 pt','Inventario de bienes muebles e inmuebles · 3 pts'].map((l,i)=>`<div class="toggle">${chk('re_'+i,l,x.risk.reinc[i])}</div>`).join('')}</div></div>`;
if(state.step===3)return `<div class="card"><div class="section-title">Paso 3 de 6 · Solventación</div><div class="fields">${numfield('countF','Observaciones fincadas',x.solv.countF)}${numfield('countS','Observaciones solventadas',x.solv.countS)}${numfield('inF','Importe fincado · Ingreso',x.solv.inF)}${numfield('inS','Importe solventado · Ingreso',x.solv.inS)}${numfield('outF','Importe fincado · Egreso',x.solv.outF)}${numfield('outS','Importe solventado · Egreso',x.solv.outS)}</div></div>`;
if(state.step===4)return `<div class="card"><div class="section-title">Paso 4 de 6 · Control y Transparencia</div><p><b>Ley de Disciplina Financiera · 3 pts</b></p><div class="choice">${x.ctrl.ldf.map((v,i)=>chk('ldf_'+i,`T${i+1}`,v)).join('')}</div><p><b>Cuenta Pública en portales · 3 pts</b></p><div class="choice">${x.ctrl.portal.map((v,i)=>chk('po_'+i,`T${i+1}`,v)).join('')}</div></div>`;
if(state.step===5)return `<div class="card"><div class="section-title">Paso 5 de 6 · Rendición de Cuentas</div><div class="fields">${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m,i)=>`<div class="toggle">${chk('mo_'+i,`${m} · 0.75 pts`,x.months[i])}</div>`).join('')}</div></div>`;
let c=calc(x);
return `<div class="card"><div class="section-title">Paso 6 de 6 · Resultado</div><div class="grid2"><div><p><b>Ente:</b> ${x.entity||'—'}</p><p><b>Base aplicable:</b> ${c.base} puntos</p><p><b>Puntaje bruto:</b> ${c.raw.toFixed(2)}</p><p><b>Puntaje final:</b> ${c.score.toFixed(2)} / 100</p></div><div><div class="bigscore">${c.score.toFixed(2)}</div><div class="${c.result==='APROBADA'?'status-ok':'status-bad'}">${c.result}</div></div></div></div>`}
function numfield(id,label,v){return `<div class="field"><label>${label}</label><input type="number" min="0" step="0.01" id="${id}" value="${v||0}"></div>`}
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
   13. RENDERIZADO E INICIALIZACIÓN
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
    document.querySelector('#app').innerHTML=`<div class="login"><section class="login-card"><div class="login-panel"><img src="assets/logo-uec.png"><h1>SISTEMA DE<br><span>PONDERACIÓN</span><br>DE CUENTAS PÚBLICAS</h1><p>No fue posible conectar con la base institucional.</p><div class="insight" style="max-width:430px;margin:22px auto;text-align:left"><b>Revisa el binding D1:</b> debe llamarse <b>DB</b> y apuntar a <b>ponderacion-uec-db</b>.<br><small>${e.message}</small></div><button class="enter" onclick="location.reload()">REINTENTAR</button></div></section><section class="login-empty"></section></div>`;

  }
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
init();
