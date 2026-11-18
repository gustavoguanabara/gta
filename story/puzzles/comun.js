/* Expedición CC · motor común de los puzzles por isla.
   Portado de la app de una sola página "Expedición CC" (Ceibal): mismas mecánicas, metas,
   pistas y explicaciones. Sin XP, sin reloj y sin equipos.
   Formato horizontal: cada puzzle es una diapositiva que entra en la pantalla; se navega
   con Anterior/Siguiente, deslizando el dedo o con las flechas del teclado.
   Cada página llama a CC.iniciar({...}) con los datos de su isla.
   Guarda en localStorage (clave cc_expedicion_intereses) el interés por isla y los
   aciertos al primer intento, para que cierre.html arme la ruta sugerida. */
(function(){
'use strict';

/* ---------- Utilidades ---------- */
const $ = (s, r) => (r || document).querySelector(s);
function el(tag, attrs, ...hijos){
  const n = document.createElement(tag);
  if(attrs) for(const k in attrs){
    if(attrs[k] == null || attrs[k] === false) continue;
    if(k === 'html') n.innerHTML = attrs[k];
    else if(k === 'class') n.className = attrs[k];
    else if(k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  for(const h of hijos){ if(h == null || h === false) continue; n.append(h.nodeType ? h : document.createTextNode(h)); }
  return n;
}
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const REGLAS = {
  py:/("[^"\n]*"|'[^'\n]*')|(\b\d+\b)|(\b(?:for|in|if|else|while|or|and|not|True|False)\b)|(\b(?:print|range|input|len)\b)/g,
  sql:/('[^'\n]*')|(\b\d+\b)|(\b(?:SELECT|FROM|WHERE)\b)|(\*)/g,
  /* t0 cadena · t1 número · t2 palabra clave/etiqueta · t3 función · t4 atributo/propiedad · t5 comentario · t6 selector */
  html:/("[^"\n]*")|(\b\d+\b)|(<\/?[a-z0-9]+|\/?>)|(\b\B)|(\b[a-z-]+(?==))|(<!--[\s\S]*?-->)/g,
  css:/("[^"\n]*")|(\b\d+(?:px|%)?)|(\b\B)|(\b\B)|(\b[a-z-]+(?=\s*:))|(\/\*[\s\S]*?\*\/)|(^[^\s{][^{\n]*(?=\s*\{))/gm,
  js:/('[^'\n]*'|"[^"\n]*")|(\b\d+\b)|(\b(?:const|let|if|else|function|return)\b)|(\b(?:addEventListener|querySelector|querySelectorAll|textContent)\b)|(\b\B)|(\/\/[^\n]*)|(=>)/g
};
function hl(code, lang){
  const re = REGLAS[lang]; if(!re) return esc(code);
  let out = '', ult = 0, m; re.lastIndex = 0;
  while((m = re.exec(code))){
    if(m[0] === ''){ re.lastIndex++; continue; }
    out += esc(code.slice(ult, m.index));
    const k = [1,2,3,4,5,6,7].find(i => m[i] !== undefined) - 1;
    out += '<span class="t'+k+'">'+esc(m[0])+'</span>';
    ult = m.index + m[0].length;
  }
  return out + esc(code.slice(ult));
}
function mezclar(arr, semilla){
  const a = arr.slice(); let s = semilla || 7;
  for(let i=a.length-1;i>0;i--){ s = (s*9301+49297)%233280; const j = Math.floor(s/233280*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  if(a.every((x,i)=>x===arr[i])) a.push(a.shift());
  return a;
}
const reducido = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r=>setTimeout(r, reducido() ? 0 : ms));
const coma = n => String(n).replace('.',',');

const ICONO_LAPIZ = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.2V21h3.8l11-11-3.8-3.8-11 11zM20.7 7a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.8 3.8L20.7 7z"/></svg>';
const ICONO_SIM = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16v12H4zM2 18h20v2H2z"/><path d="M8 8l3 2-3 2zM12 12h4v1h-4z" fill="#fff"/></svg>';
const ICONO_CANDADO = '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4V7zm3 9.7V18h-2v-1.3a1.5 1.5 0 1 1 2 0z"/></svg>';
const ICONO_EJECUTAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const ICONO_HUMANO = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex:none;color:var(--humano)"><circle cx="12" cy="7" r="4.5" fill="currentColor"/><path d="M3.5 22c0-5 3.8-8.5 8.5-8.5s8.5 3.5 8.5 8.5z" fill="currentColor"/></svg>';
const ICONO_BOT = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex:none;color:var(--bot)"><rect x="11" y="1" width="2" height="4" fill="currentColor"/><rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor"/><rect x="7" y="9" width="3.5" height="3.5" fill="#fff"/><rect x="13.5" y="9" width="3.5" height="3.5" fill="#fff"/><rect x="8" y="15" width="8" height="1.8" fill="#fff"/><rect x="5" y="19" width="14" height="3" fill="currentColor"/></svg>';

/* ---------- Guardado del interés (cierre.html arma la ruta con esto) ---------- */
const CLAVE_INT = 'cc_expedicion_intereses';
function leerIntereses(){
  try{ const o = JSON.parse(localStorage.getItem(CLAVE_INT) || '{}'); return (o && typeof o === 'object') ? o : {}; }
  catch(e){ return {}; }
}
function guardarIntereses(fn){
  try{ const o = leerIntereses(); fn(o); localStorage.setItem(CLAVE_INT, JSON.stringify(o)); }catch(e){}
}

/* ---------- Mazo de diapositivas (navegación horizontal) ---------- */
function crearMazo(raiz, slides, opts){
  opts = opts || {};
  raiz.classList.add('mazo');
  const vista = el('div',{class:'mazo-vista'});
  const pista = el('div',{class:'mazo-pista'});
  slides.forEach(s=>{ s.classList.add('slide'); pista.append(s); });
  vista.append(pista);
  const ant = el('button',{type:'button',class:'nav-btn ant','aria-label':'Anterior',html:'<span aria-hidden="true">◀</span><span class="txt">Anterior</span>'});
  const sig = el('button',{type:'button',class:'nav-btn sig','aria-label':'Siguiente',html:'<span class="txt">Siguiente</span><span aria-hidden="true">▶</span>'});
  const txt = el('div',{class:'nav-txt','aria-live':'polite','aria-atomic':'true'});
  const puntos = el('div',{class:'puntos','aria-hidden':'true'}, ...slides.map(()=>el('i')));
  const nav = el('nav',{class:'mazo-nav','aria-label':'Navegación entre pantallas'}, ant, el('div',{class:'nav-centro'}, txt, puntos), sig);
  raiz.append(vista, nav);

  const m = {i:0, slides, raiz};
  m.ir = (i, foco)=>{
    i = Math.max(0, Math.min(slides.length-1, i));
    const cambio = i !== m.i;
    m.i = i;
    pista.style.transform = 'translateX('+(-100*i)+'%)';
    slides.forEach((s,k)=>{ if(k===i){ s.removeAttribute('inert'); s.removeAttribute('aria-hidden'); } else { s.setAttribute('inert',''); s.setAttribute('aria-hidden','true'); } });
    m.refrescar();
    if(foco){ const h = slides[i].querySelector('h1,h2'); if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); } }
    vista.scrollLeft = 0;
    if(cambio && opts.alCambiar) opts.alCambiar(i);
  };
  m.refrescar = ()=>{
    const i = m.i;
    ant.disabled = i === 0; sig.disabled = i === slides.length-1;
    txt.innerHTML = opts.etiqueta ? opts.etiqueta(i) : esc((i+1)+' de '+slides.length);
    [...puntos.children].forEach((p,k)=>{ p.className = (opts.punto ? opts.punto(k) : '') + (k===i ? ' actual' : ''); });
  };
  ant.onclick = ()=>m.ir(m.i-1);
  sig.onclick = ()=>m.ir(m.i+1);
  vista.addEventListener('scroll', ()=>{ if(vista.scrollLeft) vista.scrollLeft = 0; });

  // Teclado: flechas izquierda/derecha (salvo cuando se escribe o se mueve un control)
  document.addEventListener('keydown', ev=>{
    if(ev.defaultPrevented || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if(ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    const t = ev.target;
    if(t && t.closest && t.closest('input, select, textarea, [contenteditable], [role=slider], [role=tab], .no-swipe')) return;
    ev.preventDefault();
    m.ir(m.i + (ev.key === 'ArrowRight' ? 1 : -1));
  });
  // Deslizar con el dedo
  let ini = null;
  const desplazableX = n => { for(let x=n; x && x !== vista; x = x.parentElement){ if(x.scrollWidth > x.clientWidth + 2 && getComputedStyle(x).overflowX !== 'hidden') return true; } return false; };
  vista.addEventListener('touchstart', ev=>{
    const t = ev.target;
    if(ev.touches.length !== 1 || t.closest('input, select, textarea, .no-swipe, .fb-panel') || desplazableX(t)){ ini = null; return; }
    ini = {x:ev.touches[0].clientX, y:ev.touches[0].clientY, t:Date.now()};
  }, {passive:true});
  vista.addEventListener('touchend', ev=>{
    if(!ini) return;
    const p = ev.changedTouches[0], dx = p.clientX - ini.x, dy = p.clientY - ini.y;
    if(Math.abs(dx) > 50 && Math.abs(dx) > 1.5*Math.abs(dy) && Date.now() - ini.t < 900) m.ir(m.i + (dx < 0 ? 1 : -1));
    ini = null;
  }, {passive:true});
  m.ir(0);
  return m;
}

/* ---------- Tablas de la Mina de Datos ---------- */
const T_EST = {nombre:'estudiantes', cols:['id','nombre','curso_id'], filas:[[1,'Ana',2],[2,'Bruno',1],[3,'Caro',2],[4,'Dani',3]]};
const T_CUR = {nombre:'cursos', cols:['id','nombre'], filas:[[1,'Programación 1'],[2,'Desarrollo web'],[3,'Micro:bit']]};
/* Oferta del programa (ceibal.edu.uy, octubre 2026) para la consola hacker */
const T_CC = [
  {curso:'Introducción a las CC', fase:1, area:'Computación', modalidad:'Autoasistido'},
  {curso:'IA desde cero', fase:1, area:'IA', modalidad:'Autoasistido'},
  {curso:'Desarrollo web', fase:2, area:'Web', modalidad:'Con tutoría'},
  {curso:'Programación 1', fase:2, area:'Programación', modalidad:'Con tutoría'},
  {curso:'Programación 2', fase:2, area:'Programación', modalidad:'Con tutoría'},
  {curso:'Programación 3', fase:2, area:'Programación', modalidad:'Con tutoría'},
  {curso:'Micro:bit', fase:2, area:'Hardware', modalidad:'Con tutoría'},
  {curso:'Profundización en IA', fase:2, area:'IA', modalidad:'Con tutoría'},
  {curso:'Datos para la acción', fase:2, area:'Datos', modalidad:'Con tutoría'}
];
const T_INS = [['Lucía','Salto','Programación 1'],['Mateo','Rivera','Micro:bit'],['Sofía','Florida','Desarrollo web']];

/* ---------- Piezas de interfaz ---------- */
function marcoSim(titulo){
  const cuerpo = el('div',{class:'sim-cuerpo'});
  const pie = el('div',{class:'sim-pie'});
  const caja = el('div',{class:'sim'}, el('div',{class:'sim-cab',html:ICONO_SIM+'<span>'+esc(titulo)+'</span>'}), cuerpo, pie);
  return {caja, cuerpo, pie};
}
function consola(){ const c = el('div',{class:'consola','aria-live':'polite'}); c.innerHTML = '<span class="vacia">Consola: toquen Ejecutar</span>'; return c; }
function btnEjecutar(fn){ return el('button',{type:'button',class:'btn osc',onclick:fn,html:ICONO_EJECUTAR+' Ejecutar'}); }
function btnComprobar(fn, txt){ return el('button',{type:'button',class:'btn',onclick:fn}, txt || 'Comprobar meta'); }
function tabla(t){
  const tb = el('table',{class:'datos'});
  tb.append(el('caption',null,t.nombre));
  tb.append(el('thead',null, el('tr',null, ...t.cols.map(c=>el('th',{scope:'col'},c)))));
  tb.append(el('tbody',null, ...t.filas.map(f=>el('tr',null, ...f.map(v=>el('td',null,String(v)))))));
  return el('div',{class:'tabla-wrap'}, tb);
}
function tablasDatos(){ return el('div',{class:'tablas'}, tabla(T_EST), tabla(T_CUR)); }
function anota(html){ return el('div',{class:'anota',html:ICONO_LAPIZ+'<span>'+html+'</span>'}); }

/* ---------- Simuladores ---------- */
const SIMS = {
  comillas(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Laboratorio de comillas');
    const est = {a:false, b:false}; // true = texto con comillas
    const linea = el('div',{class:'sql-linea',role:'group','aria-label':'Programa a probar'});
    const fA = el('button',{type:'button',class:'ficha'}), fB = el('button',{type:'button',class:'ficha'});
    const pintar = ()=>{
      fA.textContent = est.a ? '"1"' : '1'; fB.textContent = est.b ? '"1"' : '1';
      fA.setAttribute('aria-label','Primer valor: '+(est.a ? 'texto "1"' : 'número 1')+'. Tocar para cambiar');
      fB.setAttribute('aria-label','Segundo valor: '+(est.b ? 'texto "1"' : 'número 1')+'. Tocar para cambiar');
    };
    fA.onclick = ()=>{ est.a = !est.a; pintar(); }; fB.onclick = ()=>{ est.b = !est.b; pintar(); };
    pintar();
    linea.append(el('span',{class:'t3'},'print('), fA, el('span',null,' + '), fB, el('span',{class:'t3'},')'));
    const con = consola();
    cuerpo.append(el('p',{style:'font-size:.88rem;color:var(--gris)'},'Toquen cada 1 para ponerle o sacarle las comillas y ejecuten.'), linea,
      el('div',{class:'fila'}, btnEjecutar(()=>{
        if(est.a && est.b) con.textContent = '11';
        else if(!est.a && !est.b) con.textContent = '2';
        else con.innerHTML = '<span class="err">TypeError: no se puede sumar texto (str) y número (int)</span>';
      })), con);
    const id = ctx.uid+'resp';
    const inp = el('input',{type:'text',id,autocomplete:'off',autocapitalize:'off',spellcheck:'false',placeholder:'Escriban la salida'});
    const enviar = ()=>{
      const v = inp.value.trim().replace(/^["']|["']$/g,'').replace(/\s+/g,'');
      if(!v){ inp.focus(); return; }
      ctx.intento(q.respuestas.includes(v), v==='2' ? 'Ojo: en el programa original los dos 1 llevan comillas. Pruébenlo así en el simulador.' : 'Armen print("1" + "1") en el simulador y miren la consola.');
    };
    inp.addEventListener('keydown', ev=>{ if(ev.key==='Enter') enviar(); });
    pie.append(el('div',{class:'control',style:'flex:1 1 100%'}, el('label',{for:id},'¿Qué muestra print("1" + "1")?'),
      el('div',{class:'respuesta'}, inp, el('button',{type:'button',class:'btn',onclick:enviar},'Responder'))));
    return caja;
  },

  bucle(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Simulador de bucle');
    const est = {n:2, corrida:null};
    const id = ctx.uid+'rango';
    const rango = el('input',{type:'range',min:1,max:6,value:2,id});
    const cod = el('pre',{class:'codigo'});
    const lbl = el('label',{for:id});
    const pintar = ()=>{ lbl.textContent = 'Número dentro de range( ): '+est.n; cod.innerHTML = hl('for vuelta in range('+est.n+'):\n    print("Hola Ana")\nprint("Listo")','py'); };
    rango.oninput = ()=>{ est.n = Number(rango.value); pintar(); };
    pintar();
    const con = consola();
    cuerpo.append(el('div',{class:'control'}, lbl, rango), cod, con);
    let corriendo = false;
    pie.append(btnEjecutar(async()=>{
      if(corriendo) return; corriendo = true;
      con.textContent = ''; const n = est.n;
      for(let i=0;i<n;i++){ con.textContent += 'Hola Ana\n'; await sleep(250); }
      con.textContent += 'Listo'; est.corrida = n; corriendo = false;
    }), btnComprobar(()=>{
      if(corriendo) return;
      if(est.corrida == null) return ctx.intento(false,'Primero ejecuten el programa y cuenten los saludos.');
      ctx.intento(est.corrida === 4, 'Salió '+est.corrida+' veces. ¿Qué número tiene que ir dentro de range( )?');
    }));
    return caja;
  },

  logica(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Interruptores lógicos');
    const est = {edad:17, permiso:true};
    const idR = ctx.uid+'edad', idC = ctx.uid+'permiso';
    const rango = el('input',{type:'range',min:12,max:20,value:17,id:idR});
    const lbl = el('label',{for:idR});
    const chk = el('input',{type:'checkbox',id:idC,checked:''});
    const cod = el('pre',{class:'codigo'});
    const con = consola();
    const evalua = ()=> (est.edad >= 18) || est.permiso;
    const pintar = ()=>{
      lbl.textContent = 'edad = '+est.edad;
      cod.innerHTML = hl('edad = '+est.edad+'\ntiene_permiso = '+(est.permiso?'True':'False')+'\nprint(edad >= 18 or tiene_permiso)','py');
    };
    rango.oninput = ()=>{ est.edad = Number(rango.value); pintar(); };
    chk.onchange = ()=>{ est.permiso = chk.checked; pintar(); };
    pintar();
    cuerpo.append(el('div',{class:'control'}, lbl, rango),
      el('label',{class:'interruptor',for:idC}, chk, el('span',null,'tiene_permiso')), cod, con);
    let ultima = null;
    pie.append(btnEjecutar(()=>{
      const r = evalua(); ultima = r;
      const py = v => v ? 'True' : 'False';
      con.innerHTML = '<b>'+py(r)+'</b>   <span class="vacia">('+py(est.edad>=18)+' or '+py(est.permiso)+')</span>';
    }), btnComprobar(()=>{
      if(ultima === null) return ctx.intento(false,'Ejecuten el programa para ver qué reporta.');
      ctx.intento(evalua() === false && ultima === false, 'Todavía da True. Con or, ¿cuántas partes tienen que ser False para que todo sea False?');
    }));
    return caja;
  },

  hacker(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Consola de datos');
    const COLS = ['curso','fase','area','modalidad'];
    const CONDS = {
      none:{nl:'sin condición', sql:'', f:()=>true, usa:null},
      f1:{nl:'la fase es 1', sql:'fase = 1', f:r=>r.fase===1, usa:'fase'},
      f2:{nl:'la fase es 2', sql:'fase = 2', f:r=>r.fase===2, usa:'fase'},
      ia:{nl:'el área es IA', sql:"area = 'IA'", f:r=>r.area==='IA', usa:'area'},
      prog:{nl:'el área es Programación', sql:"area = 'Programación'", f:r=>r.area==='Programación', usa:'area'}
    };
    const est = {cols:[], tabla:null, cond:null, corrida:null};

    // Tablas de referencia: van a la columna izquierda de la diapositiva
    const tablaCursos = tabla({nombre:'cursos_cc', cols:COLS, filas:T_CC.map(r=>COLS.map(c=>r[c]))});
    const filasHTML = [...tablaCursos.querySelectorAll('tbody tr')];
    ctx.izq.append(el('p',{style:'font-weight:700;font-size:.85rem'},'Base de datos: ceibal_cc'), tablaCursos,
      el('details',{class:'extra'}, el('summary',null,'Ver la otra tabla: inscriptos'), tabla({nombre:'inscriptos', cols:['nombre','departamento','curso'], filas:T_INS})));

    const traduccion = el('div',{class:'traduccion','aria-live':'polite'});
    const slot = (rotulo, sql, chips) => el('div',{class:'slot'},
      el('div',{class:'slot-rot'}, el('span',{class:'capsula hk'},rotulo), el('small',null,'= '+sql)),
      el('div',{class:'tags',role:'group','aria-label':rotulo+' ('+sql+')'}, ...chips));
    const chip = (txt, onclick, attrs) => el('button',Object.assign({type:'button',class:'tag','aria-pressed':'false',onclick},attrs||{}),txt);
    const chipsCol = [chip('todo (*)',()=>{ est.cols = est.cols[0]==='*' ? [] : ['*']; pintar(); },{'data-col':'*'})]
      .concat(COLS.map(c=>chip(c,()=>{ est.cols = est.cols.filter(x=>x!=='*'); est.cols = est.cols.includes(c) ? est.cols.filter(x=>x!==c) : est.cols.concat(c); pintar(); },{'data-col':c})));
    const chipsTab = ['cursos_cc','inscriptos'].map(t=>chip(t,()=>{ est.tabla = t; pintar(); },{'data-tab':t}));
    const chipsCond = Object.keys(CONDS).map(k=>chip(CONDS[k].nl,()=>{ est.cond = k; pintar(); },{'data-cond':k}));
    const term = el('div',{class:'term','aria-live':'polite'});
    term.innerHTML = '<span class="dim">ceibal_cc&gt; esperando consulta…</span><span class="cursor" aria-hidden="true">▍</span>';
    cuerpo.append(el('p',{style:'font-weight:800;font-size:.9rem'},'Armen la consulta tocando etiquetas'),
      slot('MOSTRAME','SELECT',chipsCol), slot('DE DÓNDE','FROM',chipsTab), slot('DÓNDE','WHERE',chipsCond), traduccion, term);

    const ejecutar = btnEjecutar(correr);
    const comprobar = btnComprobar(()=>{
      if(!est.corrida) return ctx.intento(false,'Primero ejecuten la consulta y miren qué devuelve.');
      const m = q.mision, c = est.corrida;
      if(c.tabla !== m.tabla) return ctx.intento(false,'Esa tabla no tiene la información de los cursos. ¿De dónde la sacan?');
      if(c.cond !== m.cond) return ctx.intento(false,'Las filas no son las que pide la meta. Revisen la etiqueta DÓNDE.');
      const mismo = c.cols.length === m.cols.length && m.cols.every(x=>c.cols.includes(x));
      if(!mismo) return ctx.intento(false, c.cols[0]==='*' ? 'Trae todas las columnas. La meta pide solo algunas: elíjanlas en MOSTRAME.' : 'Las columnas no coinciden con la meta. Revisen la etiqueta MOSTRAME.');
      ctx.intento(true);
    });
    pie.append(ejecutar, comprobar);

    function sqlTexto(){
      const cols = est.cols.length ? est.cols.join(', ') : '…';
      const c = est.cond ? CONDS[est.cond] : null;
      return 'SELECT '+cols+' FROM '+(est.tabla||'…')+(c ? (c.sql ? ' WHERE '+c.sql : '') : ' WHERE …')+';';
    }
    function pintar(){
      chipsCol.forEach(b=>b.setAttribute('aria-pressed', String(est.cols.includes(b.dataset.col))));
      chipsTab.forEach(b=>b.setAttribute('aria-pressed', String(est.tabla===b.dataset.tab)));
      chipsCond.forEach(b=>b.setAttribute('aria-pressed', String(est.cond===b.dataset.cond)));
      const nl = 'Mostrame <b>'+(est.cols.length ? esc(est.cols.join(', ').replace('*','todo')) : '…')+'</b> de <b>'+(est.tabla||'…')+'</b> donde <b>'+(est.cond ? esc(CONDS[est.cond].nl) : '…')+'</b>';
      traduccion.innerHTML = '<div class="nl">'+nl+'</div><div class="sqlt">'+hl(sqlTexto(),'sql')+'</div>';
      if(!ctx.resuelto) ejecutar.disabled = !(est.cols.length && est.tabla && est.cond);
    }
    async function correr(){
      if(ejecutar.disabled) return;
      ejecutar.disabled = true; comprobar.disabled = true;
      const snap = {cols:est.cols.slice(), tabla:est.tabla, cond:est.cond};
      const c = CONDS[snap.cond];
      filasHTML.forEach(f=>f.classList.remove('scan','match'));
      term.innerHTML = '';
      const linea = (html, cls) => { const d = el('div',{class:cls||''}); d.innerHTML = html; term.append(d); term.scrollIntoView && (cuerpo.scrollTop = cuerpo.scrollHeight); return d; };
      const tipear = async (d, txt, v) => { for(const ch of txt){ d.textContent += ch; await sleep(v||18); } };
      await tipear(linea('', 'dim'), '$ conectando a ceibal_cc.db ...');
      await sleep(250); term.lastChild.textContent += ' OK';
      const barra = linea('', 'dim');
      for(let i=1;i<=12;i++){ barra.textContent = '$ cargando '+snap.tabla+' ['+'█'.repeat(i)+'░'.repeat(12-i)+']'; await sleep(45); }
      const q1 = linea('', 'cmd'); await tipear(q1, '> '+sqlTexto(), 28);
      if(snap.tabla === 'inscriptos'){
        const faltan = snap.cols.filter(x=>x!=='*' && x!=='curso').concat(c.usa ? [c.usa] : []);
        if(faltan.length){
          await sleep(200);
          linea('ERROR 1054: la columna \''+esc(faltan[0])+'\' no existe en la tabla inscriptos', 'err');
          linea('<span class="dim">pista: miren qué tabla tiene esa columna</span>');
          fin(snap); return;
        }
      }
      linea('$ escaneando filas ▸▸▸', 'dim');
      let filas;
      if(snap.tabla === 'cursos_cc'){
        filas = [];
        for(let i=0;i<T_CC.length;i++){
          const tr = filasHTML[i]; tr.classList.add('scan'); await sleep(110);
          tr.classList.remove('scan');
          if(c.f(T_CC[i])){ tr.classList.add('match'); filas.push(T_CC[i]); }
        }
      } else {
        filas = T_INS.map(r=>({nombre:r[0], departamento:r[1], curso:r[2]}));
      }
      const cols = snap.cols[0]==='*' ? (snap.tabla==='cursos_cc' ? COLS : ['nombre','departamento','curso']) : snap.cols;
      await sleep(150);
      linea('+ '+cols.join(' | '), 'cab');
      for(const r of filas){ linea('  '+cols.map(k=>esc(r[k])).join(' | ')); await sleep(130); }
      linea('✔ '+filas.length+' fila'+(filas.length===1?'':'s')+' encontrada'+(filas.length===1?'':'s')+' en 0.0'+(3+filas.length)+' s', 'ok');
      fin(snap);
    }
    function fin(snap){
      est.corrida = snap;
      term.append(el('span',{class:'cursor','aria-hidden':'true'},'▍'));
      cuerpo.scrollTop = cuerpo.scrollHeight;
      if(!ctx.resuelto){ ejecutar.disabled = false; comprobar.disabled = false; }
    }
    pintar();
    return caja;
  },

  /* Mini editor web por bloques: HTML, CSS y JS sin tipear código */
  web(q, ctx){
    ctx.noBloquear = true;
    ctx.grid.classList.add('ancho-der');
    const {caja, cuerpo, pie} = marcoSim('Mini editor web');
    const IMGS = [['../logos-cursos/web.svg','Logo de Desarrollo web'],['../assets/ceibal-hoja.svg','Hoja de Ceibal'],['../assets/personajes/camila.svg','Camila'],['../assets/item-cooler-rgb.svg','Cooler RGB']];
    const VIDEO = '../videos/02-isla-web-fin-1.mp4';
    const HREFS = ['https://ceibal.edu.uy','https://www.anep.edu.uy','#inicio'];
    const CLASES = ['','destacado','tarjeta'];
    const IDS = ['','titulo','principal','contador','saludo'];
    const TIPOS = {h1:'Título grande',h2:'Subtítulo',p:'Párrafo',a:'Enlace',img:'Imagen',video:'Video',ul:'Lista',button:'Botón',div:'Caja (div)'};
    const PROPS = {
      'color':['black','white','orange','blue','green','red','purple','#00A096'],
      'background-color':['white','lightyellow','orange','lightblue','#E0F4F2','black','pink'],
      'font-size':['12px','16px','24px','32px','48px'],
      'text-align':['left','center','right'],
      'border':['none','2px solid black','3px dashed orange','4px dotted blue'],
      'border-radius':['0','8px','16px','50%'],
      'padding':['0','8px','16px','24px']
    };
    const ACCIONES = {ninguna:'(sin JS: no hace nada)', contar:'contar «me gusta»', color:'cambiar el color de fondo', ocultar:'mostrar/ocultar el primer párrafo'};
    const est = {
      els:[{tipo:'h1',texto:'Mi página',clase:'',id:''},{tipo:'p',texto:'Bienvenidos a mi primera página.',clase:'',id:''},{tipo:'button',texto:'♥ Me gusta',clase:'',id:'',accion:'ninguna'}],
      reglas:[{sel:'h1',prop:'color',val:'black'}],
      probado:false, tab:'editar'
    };
    let nId = 0; est.els.forEach(e=>e.k = ++nId);
    const nuevo = tipo => {
      const e = {tipo, clase:'', id:'', k:++nId};
      if(tipo==='h1') e.texto = 'Título';
      else if(tipo==='h2') e.texto = 'Subtítulo';
      else if(tipo==='p') e.texto = 'Un párrafo de texto.';
      else if(tipo==='a'){ e.texto = 'Visiten Ceibal'; e.href = HREFS[0]; }
      else if(tipo==='img'){ e.src = IMGS[0][0]; e.alt = ''; }
      else if(tipo==='ul') e.texto = 'HTML, CSS, JS';
      else if(tipo==='button'){ e.texto = 'Botón'; e.accion = 'ninguna'; }
      else if(tipo==='div') e.texto = 'Una caja';
      return e;
    };

    /* --- Generar código --- */
    const atr = e => (e.id ? ' id="'+e.id+'"' : '') + (e.clase ? ' class="'+e.clase+'"' : '');
    function genHTML(){
      const L = ['<body>'];
      for(const e of est.els){
        const a = atr(e), t = esc(e.texto || '');
        if(e.tipo==='img') L.push('  <img src="'+esc(e.src)+'" alt="'+esc(e.alt||'')+'"'+a+'>');
        else if(e.tipo==='video') L.push('  <video src="'+VIDEO+'" controls muted'+a+'></video>');
        else if(e.tipo==='a') L.push('  <a href="'+esc(e.href)+'"'+a+'>'+t+'</a>');
        else if(e.tipo==='ul'){ L.push('  <ul'+a+'>'); (e.texto||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>L.push('    <li>'+esc(s)+'</li>')); L.push('  </ul>'); }
        else L.push('  <'+e.tipo+a+'>'+t+'</'+e.tipo+'>');
      }
      L.push('</body>');
      return L.join('\n');
    }
    function genCSS(){
      if(!est.reglas.length) return '/* Sin reglas todavía */';
      const orden = [], grupos = {};
      est.reglas.forEach(r=>{ if(!grupos[r.sel]){ grupos[r.sel] = []; orden.push(r.sel); } grupos[r.sel].push(r); });
      return orden.map(s=>s+' {\n'+grupos[s].map(r=>'  '+r.prop+': '+r.val+';').join('\n')+'\n}').join('\n\n');
    }
    const strJS = s => "'" + String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/</g,'\\u003c') + "'";
    function genJS(){
      const L = []; let n = 0;
      est.els.forEach(e=>{
        if(e.tipo !== 'button') return;
        const idx = n++, v = 'boton'+(idx+1);
        if(!e.accion || e.accion === 'ninguna') return;
        L.push('// Botón «'+e.texto+'»: '+ACCIONES[e.accion]);
        L.push('const '+v+" = document.querySelectorAll('button')["+idx+'];');
        if(e.accion === 'contar'){
          L.push('let meGusta'+(idx+1)+' = 0;');
          L.push(v+".addEventListener('click', () => {");
          L.push('  meGusta'+(idx+1)+' = meGusta'+(idx+1)+' + 1;');
          L.push('  '+v+'.textContent = '+strJS(e.texto+': ')+' + meGusta'+(idx+1)+';');
          L.push('});');
        } else if(e.accion === 'color'){
          L.push("const colores"+(idx+1)+" = ['lightyellow', 'lightblue', 'pink', 'white'];");
          L.push('let vuelta'+(idx+1)+' = 0;');
          L.push(v+".addEventListener('click', () => {");
          L.push('  document.body.style.backgroundColor = colores'+(idx+1)+'[vuelta'+(idx+1)+' % 4];');
          L.push('  vuelta'+(idx+1)+' = vuelta'+(idx+1)+' + 1;');
          L.push('});');
        } else if(e.accion === 'ocultar'){
          L.push(v+".addEventListener('click', () => {");
          L.push("  const parrafo = document.querySelector('p');");
          L.push('  if (parrafo) parrafo.hidden = !parrafo.hidden;');
          L.push('});');
        }
        L.push('');
      });
      return L.length ? L.join('\n').trim() : '// Sin comportamiento todavía';
    }
    const INSTR = "document.addEventListener('click',function(e){var a=e.target.closest('a');if(a){e.preventDefault();parent.postMessage({ccWeb:1,tipo:'enlace'},'*');return;}var b=e.target.closest('button');if(b){var bs=[].slice.call(document.querySelectorAll('button'));parent.postMessage({ccWeb:1,tipo:'clic',i:bs.indexOf(b),texto:b.textContent},'*');}});";
    function documento(){
      const html = genHTML(), css = genCSS(), js = genJS();
      return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>body{font-family:Arial,Helvetica,sans-serif;margin:12px;color:#1D1D1B;background:#fff;line-height:1.35}img{max-width:100%;max-height:110px;height:auto;display:block}video{max-width:100%;max-height:130px;display:block}h1,h2,p,ul{margin:.3em 0}button{font:inherit;padding:6px 14px;min-height:40px;cursor:pointer}</style><style>'+css+'</style></head>'
        + html.replace('</body>','<script>'+js.replace(/<\/script/gi,'<\\/script')+'<\/script><script>'+INSTR+'<\/script></body>') + '</html>';
    }

    /* --- Cascada simple para comprobar la meta sin depender del iframe --- */
    const espec = s => s[0]==='#' ? 100 : s[0]==='.' ? 10 : 1;
    function valorCSS(e, prop){
      let mejor = null, sp = -1;
      est.reglas.forEach(r=>{
        const coincide = r.sel === e.tipo || (e.clase && r.sel === '.'+e.clase) || (e.id && r.sel === '#'+e.id);
        if(coincide && r.prop === prop && espec(r.sel) >= sp){ mejor = r.val; sp = espec(r.sel); }
      });
      if(mejor == null && prop === 'color') est.reglas.forEach(r=>{ if(r.sel==='body' && r.prop==='color') mejor = r.val; });
      return mejor;
    }

    /* --- Interfaz: pestañas --- */
    const TABS = [['editar','Editar'],['vista','Vista'],['html','HTML'],['css','CSS'],['js','JS']];
    const tabsBox = el('div',{class:'ed-tabs',role:'tablist','aria-label':'Editor web'});
    const panels = {}, tabBtns = {};
    TABS.forEach(([k,t])=>{
      const b = el('button',{type:'button',class:'ed-tab'+(k==='editar'?' solo-angosto':''),role:'tab',id:ctx.uid+'tab-'+k,'aria-controls':ctx.uid+'pan-'+k,'aria-selected':'false',onclick:()=>{ elegirTab(k); }}, t);
      b.addEventListener('keydown', ev=>{
        if(ev.key!=='ArrowRight' && ev.key!=='ArrowLeft') return;
        const vis = TABS.map(x=>x[0]).filter(x=>tabBtns[x].offsetParent !== null);
        const j = vis.indexOf(k); const nk = vis[(j + (ev.key==='ArrowRight'?1:-1) + vis.length) % vis.length];
        elegirTab(nk); tabBtns[nk].focus(); ev.preventDefault();
      });
      tabBtns[k] = b; tabsBox.append(b);
      panels[k] = el('div',{class:'ed-panel p-'+k,role:'tabpanel',id:ctx.uid+'pan-'+k,'aria-labelledby':ctx.uid+'tab-'+k});
    });
    const ancho = window.matchMedia('(min-width:720px)');
    function elegirTab(k){
      if(ancho.matches && k==='editar') k = 'vista';
      est.tab = k;
      TABS.forEach(([x])=>{ tabBtns[x].setAttribute('aria-selected', String(x===k)); tabBtns[x].tabIndex = x===k ? 0 : -1; panels[x].hidden = x!==k; });
      if(k==='vista') refrescarVista(true);
    }
    ancho.addEventListener && ancho.addEventListener('change', ()=>elegirTab(est.tab));

    // Vista previa (iframe aislado con srcdoc)
    const iframe = el('iframe',{title:'Vista previa de mi-pagina.html',sandbox:'allow-scripts'});
    panels.vista.append(el('div',{class:'ed-vista'}, el('div',{class:'barra-nav','aria-hidden':'true'},'mi-pagina.html'), iframe));
    const codeH = el('pre',{class:'ed-code',tabindex:'0','aria-label':'Código HTML'}), codeC = el('pre',{class:'ed-code',tabindex:'0','aria-label':'Código CSS'}), codeJ = el('pre',{class:'ed-code',tabindex:'0','aria-label':'Código JS'});
    panels.html.append(codeH); panels.css.append(codeC); panels.js.append(codeJ);
    let ultimoDoc = '', tVista = 0;
    function refrescarVista(ya){
      clearTimeout(tVista);
      const hacer = ()=>{ const d = documento(); if(d !== ultimoDoc){ ultimoDoc = d; iframe.srcdoc = d; } };
      if(ya) hacer(); else tVista = setTimeout(hacer, 350);
    }
    const aviso = el('p',{class:'ed-aviso','aria-live':'polite'});
    window.addEventListener('message', ev=>{
      if(ev.source !== iframe.contentWindow || !ev.data || !ev.data.ccWeb) return;
      if(ev.data.tipo === 'enlace'){ aviso.textContent = 'El enlace funciona: en una página real abriría esa dirección. Aquí no salimos de la vista previa.'; return; }
      const botones = est.els.filter(e=>e.tipo==='button');
      const b = botones[ev.data.i];
      if(!b) return;
      if(b.accion === 'contar' && /\d/.test(ev.data.texto)){ est.probado = true; aviso.textContent = '¡El botón cuenta! Dice: '+ev.data.texto; }
      else if(!b.accion || b.accion === 'ninguna') aviso.textContent = 'Sin JS el botón existe, pero no hace nada.';
      else aviso.textContent = 'El botón hace: '+ACCIONES[b.accion]+'.';
      pintarDesafios();
    });

    // Panel Editar: tres secciones
    const secHTML = el('div',{class:'lista'}), secCSS = el('div',{class:'lista'}), secJS = el('div',{class:'lista'});
    const selTipo = el('select',{'aria-label':'Elemento HTML para agregar'}, ...Object.keys(TIPOS).map(t=>el('option',{value:t},'<'+t+'> '+TIPOS[t])));
    const btnAddEl = el('button',{type:'button',class:'btn',onclick:()=>{ est.els.push(nuevo(selTipo.value)); abierto = est.els[est.els.length-1].k; cambio('html'); }},'+ Agregar');
    const btnAddRegla = el('button',{type:'button',class:'btn',onclick:()=>{ est.reglas.push({sel:'h1',prop:'color',val:'orange'}); cambio('css'); }},'+ Agregar regla');
    panels.editar.append(
      el('section',{class:'ed-sec','aria-label':'HTML: elementos'}, el('h3',null, el('span',null,'HTML · elementos'), el('span',{class:'pista-ed',style:'font-family:var(--f-disp);text-transform:none;font-weight:600;color:var(--gris)'},'toquen uno para editarlo')), secHTML, el('div',{class:'ed-agregar'}, selTipo, btnAddEl)),
      el('section',{class:'ed-sec','aria-label':'CSS: reglas de estilo'}, el('h3',null,'CSS · reglas  selector { propiedad: valor }'), secCSS, el('div',{class:'ed-agregar'}, btnAddRegla)),
      el('section',{class:'ed-sec','aria-label':'JS: comportamiento'}, el('h3',null,'JS · al tocar un botón…'), secJS));
    let abierto = null;

    const opt = (v, t, sel) => el('option',{value:v, selected: sel ? '' : null}, t);
    const uid = s => ctx.uid+s+'-'+(++nId);
    function campo(lbl, ctrl){ const id = uid('c'); ctrl.id = id; return [el('label',{for:id},lbl), ctrl]; }
    function pintarHTML(){
      secHTML.innerHTML = '';
      est.els.forEach((e,i)=>{
        const resumen = e.tipo==='img' ? (e.alt ? 'alt="'+e.alt+'"' : 'sin texto alternativo') : e.tipo==='video' ? 'video del puerto' : (e.texto||'');
        const d = el('details',{class:'ed-el',open: abierto===e.k ? '' : null},
          el('summary',null, el('span',{class:'tagn'},'<'+e.tipo+'>'), el('span',{class:'txt'},resumen)));
        d.addEventListener('toggle', ()=>{ if(d.open) abierto = e.k; else if(abierto===e.k) abierto = null; });
        const c = el('div',{class:'ed-campos'});
        if(['h1','h2','p','button','div','a'].includes(e.tipo)){
          const inp = el('input',{type:'text',value:e.texto,maxlength:40,autocomplete:'off'});
          inp.oninput = ()=>{ e.texto = inp.value; d.querySelector('.txt').textContent = inp.value; cambio('texto'); };
          c.append(...campo('Texto', inp));
        }
        if(e.tipo==='ul'){
          const inp = el('input',{type:'text',value:e.texto,maxlength:60,autocomplete:'off'});
          inp.oninput = ()=>{ e.texto = inp.value; d.querySelector('.txt').textContent = inp.value; cambio('texto'); };
          c.append(...campo('Ítems (con comas)', inp));
        }
        if(e.tipo==='a'){
          const s = el('select',null, ...HREFS.map(h=>opt(h,h,h===e.href)));
          s.onchange = ()=>{ e.href = s.value; cambio('html'); };
          c.append(...campo('href', s));
        }
        if(e.tipo==='img'){
          const s = el('select',null, ...IMGS.map(([src,t])=>opt(src,t,src===e.src)));
          s.onchange = ()=>{ e.src = s.value; cambio('html'); };
          const alt = el('input',{type:'text',value:e.alt||'',maxlength:50,autocomplete:'off',placeholder:'Describan la imagen'});
          alt.oninput = ()=>{ e.alt = alt.value; d.querySelector('.txt').textContent = alt.value ? 'alt="'+alt.value+'"' : 'sin texto alternativo'; cambio('texto'); };
          c.append(...campo('Imagen (src)', s), ...campo('alt', alt));
        }
        if(e.tipo==='button'){
          const s = el('select',null, ...Object.keys(ACCIONES).map(a=>opt(a,ACCIONES[a],a===e.accion)));
          s.onchange = ()=>{ e.accion = s.value; est.probado = false; cambio('js'); };
          c.append(...campo('JS al tocar', s));
        }
        const sCl = el('select',null, ...CLASES.map(x=>opt(x, x ? '.'+x : '(ninguna)', x===e.clase)));
        sCl.onchange = ()=>{ e.clase = sCl.value; cambio('html'); };
        const sId = el('select',null, ...IDS.map(x=>opt(x, x ? '#'+x : '(ninguno)', x===e.id)));
        sId.onchange = ()=>{ e.id = sId.value; cambio('html'); };
        c.append(...campo('class', sCl), ...campo('id', sId));
        c.append(el('div',{class:'acc'},
          el('button',{type:'button',class:'ed-x','aria-label':'Subir <'+e.tipo+'>',disabled: i===0 ? '' : null,onclick:()=>{ est.els.splice(i-1,0,est.els.splice(i,1)[0]); cambio('html'); }},'↑'),
          el('button',{type:'button',class:'ed-x','aria-label':'Bajar <'+e.tipo+'>',disabled: i===est.els.length-1 ? '' : null,onclick:()=>{ est.els.splice(i+1,0,est.els.splice(i,1)[0]); cambio('html'); }},'↓'),
          el('button',{type:'button',class:'ed-x','aria-label':'Borrar <'+e.tipo+'>',onclick:()=>{ est.els.splice(i,1); est.probado = false; cambio('html'); }},'✕')));
        d.append(c);
        secHTML.append(d);
      });
      if(!est.els.length) secHTML.append(el('p',{style:'padding:8px;font-size:.82rem;color:var(--gris)'},'La página está vacía. Agreguen un elemento.'));
    }
    function selectores(){
      const s = ['body','h1','h2','p','a','img','video','ul','li','button','div'];
      return s.concat(CLASES.filter(Boolean).map(c=>'.'+c), IDS.filter(Boolean).map(c=>'#'+c));
    }
    function pintarCSS(){
      secCSS.innerHTML = '';
      est.reglas.forEach((r,i)=>{
        const sSel = el('select',{'aria-label':'Selector de la regla '+(i+1)}, ...selectores().map(x=>opt(x,x,x===r.sel)));
        const sProp = el('select',{'aria-label':'Propiedad de la regla '+(i+1)}, ...Object.keys(PROPS).map(x=>opt(x,x,x===r.prop)));
        const sVal = el('select',{'aria-label':'Valor de la regla '+(i+1)}, ...PROPS[r.prop].map(x=>opt(x,x,x===r.val)));
        sSel.onchange = ()=>{ r.sel = sSel.value; cambio('css-ligero'); };
        sProp.onchange = ()=>{ r.prop = sProp.value; r.val = PROPS[r.prop][0]; cambio('css'); };
        sVal.onchange = ()=>{ r.val = sVal.value; cambio('css-ligero'); };
        secCSS.append(el('div',{class:'ed-fila'}, sSel, sProp, sVal,
          el('button',{type:'button',class:'ed-x','aria-label':'Borrar la regla '+(i+1),onclick:()=>{ est.reglas.splice(i,1); cambio('css'); }},'✕')));
      });
      if(!est.reglas.length) secCSS.append(el('p',{style:'padding:8px;font-size:.82rem;color:var(--gris)'},'Sin reglas: la página usa los estilos del navegador.'));
    }
    function pintarJS(){
      secJS.innerHTML = '';
      const botones = est.els.filter(e=>e.tipo==='button');
      if(!botones.length){ secJS.append(el('p',{style:'padding:8px;font-size:.82rem;color:var(--gris)'},'No hay botones. Agreguen un <button> en HTML.')); return; }
      botones.forEach((e,i)=>{
        const s = el('select',{'aria-label':'Qué hace el botón «'+e.texto+'»'}, ...Object.keys(ACCIONES).map(a=>opt(a,ACCIONES[a],a===e.accion)));
        s.onchange = ()=>{ e.accion = s.value; est.probado = false; cambio('js'); };
        secJS.append(el('div',{class:'ed-fila js'}, el('span',{class:'lbl'},'Botón '+(i+1)+' «'+e.texto+'»'), s));
      });
    }
    function pintarCodigo(){
      codeH.innerHTML = hl(genHTML(),'html');
      codeC.innerHTML = hl(genCSS(),'css');
      codeJ.innerHTML = hl(genJS(),'js');
    }
    function cambio(tipo){
      if(tipo === 'html' || tipo === 'js'){ pintarHTML(); pintarJS(); }
      if(tipo === 'css'){ pintarCSS(); }
      if(tipo === 'texto') pintarJS();
      pintarCodigo();
      refrescarVista(tipo !== 'texto');
      pintarDesafios();
    }

    // Desafíos extra (opcionales) en la columna izquierda
    const DESAFIOS = [
      {t:'Agreguen una imagen con texto alternativo (alt) que la describa.', ok:()=>est.els.some(e=>e.tipo==='img' && (e.alt||'').trim().length >= 3)},
      {t:'Agreguen un enlace <a> con su dirección (href).', ok:()=>est.els.some(e=>e.tipo==='a' && e.href && (e.texto||'').trim())},
      {t:'Usen una clase: denle class a un elemento y una regla CSS con ese .selector.', ok:()=>est.reglas.some(r=>r.sel[0]==='.' && est.els.some(e=>e.clase && '.'+e.clase===r.sel))}
    ];
    const listaD = el('ul');
    ctx.izq.append(el('div',{class:'desafios'}, el('h3',null,'Desafíos extra (opcionales)'), listaD));
    function pintarDesafios(){
      listaD.innerHTML = '';
      DESAFIOS.forEach(d=>{ const ok = d.ok(); listaD.append(el('li',{class:ok?'hecho':''}, el('span',{class:'chk','aria-hidden':'true'}, ok?'✔':''), el('span',null, d.t, ok ? el('span',{class:'sr'},' (cumplido)') : null))); });
    }

    cuerpo.append(el('div',{class:'ed'}, tabsBox, el('div',{class:'ed-cuerpo'}, ...TABS.map(([k])=>panels[k]))));
    cuerpo.style.overflow = 'hidden';
    pie.append(btnComprobar(()=>{
      const h1 = est.els.find(e=>e.tipo==='h1');
      if(!h1) return ctx.intento(false,'Falta el título: agreguen un elemento <h1> en HTML.');
      const t = (h1.texto||'').trim().toLowerCase().replace(/\s+/g,' ');
      if(t !== 'hola utu') return ctx.intento(false,'El título <h1> tiene que decir «Hola UTU». Eso se cambia en el HTML (toquen el <h1> para editar el texto).');
      if(valorCSS(h1,'color') !== 'orange') return ctx.intento(false,'El título todavía no está en naranja. El color es cosa del CSS: una regla h1 { color: orange }.');
      const btn = est.els.find(e=>e.tipo==='button' && e.accion==='contar');
      if(!btn) return ctx.intento(false,'El botón no cuenta. ¿Qué capa le da comportamiento a la página? Elijan «contar me gusta» en JS.');
      if(!est.probado) return ctx.intento(false,'El botón ya tiene JS, pero no lo probaron: vayan a la Vista y toquen el botón.');
      ctx.intento(true);
    }), aviso);
    pintarHTML(); pintarCSS(); pintarJS(); pintarCodigo(); pintarDesafios();
    elegirTab(ancho.matches ? 'vista' : 'editar');
    return caja;
  },

  /* Anti-cheat: una regla de umbral decide quién es bot */
  ia(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Anti-cheat con IA');
    // [CPS, tipo, apodo]  H = humano, B = bot. El «pro» es humano pero clickea como bot.
    const datos = [[4,'H','lucia_09'],[6,'H','mate_uy'],[7.5,'H','sofi.gg'],[9,'H','tomi_rv'],[10.5,'H','cami77'],[15,'H','PRO_xNico'],
                   [13,'B','b0t_3412'],[17,'B','xX_aim_Xx'],[20,'B','autoclick'],[24,'B','farm_bot']].sort((a,b)=>a[0]-b[0]);
    const MAX = 25;
    const est = {u:2};
    const clasifica = cps => cps > est.u ? 'B' : 'H';
    const aciertos = ()=>datos.filter(([c,t])=>clasifica(c) === t).length;
    const pct = v => (v/MAX*100)+'%';

    const umbralTxt = el('span',{class:'ac-umbral'});
    const marcador = el('div',{class:'ac-marcador'});
    const vivo = el('p',{class:'sr','aria-live':'polite'});
    const top = el('div',{class:'ac-top'},
      el('p',{class:'ac-regla'}, 'Regla de la IA: si hace más de ', umbralTxt, ' → es bot 🚫'),
      marcador);
    const leyenda = el('div',{class:'ac-leyenda'},
      el('span',{html:ICONO_HUMANO+' humano'}), el('span',{html:ICONO_BOT+' bot'}),
      el('span',null, el('i',{style:'display:inline-block;width:14px;height:10px;background:rgba(226,32,63,.25);border-left:3px solid #9225A5'}), ' la IA dice «bot»'),
      el('span',null, el('i',{style:'display:inline-block;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 3px var(--err)'}), ' error de la IA'));

    const graf = el('div',{class:'ac-graf ac-tirar no-swipe',role:'list','aria-label':'Jugadores ordenados por clics por segundo'});
    const filas = datos.map(([c,t,n])=>{
      const dot = el('span',{class:'ac-dot '+t,'aria-hidden':'true',style:'left:'+pct(c)}, t==='H' ? '' : '');
      const ver = el('span',{class:'ac-ver'});
      const sr = el('span',{class:'sr'});
      const f = el('div',{class:'ac-fila',role:'listitem'},
        el('span',{class:'ac-quien',html:(t==='H'?ICONO_HUMANO:ICONO_BOT)+'<span>'+esc(n)+'</span>'}),
        el('span',{class:'ac-pista'}, dot, el('span',{class:'sr'}, coma(c)+' clics por segundo, es '+(t==='H'?'humano':'bot')+'.')),
        ver, sr);
      return {c,t,n,f,dot,ver};
    });
    const zona = el('div',{class:'ac-zona'}, el('span',{class:'r'},'la IA dice BOT'));
    const hueco = el('div',{class:'ac-hueco',hidden:'',style:'left:'+pct(10.5)+';width:'+pct(13-10.5)});
    const tirador = el('div',{class:'ac-tirador'});
    const capa = el('div',{class:'ac-capa','aria-hidden':'true'}, hueco, zona, tirador);
    graf.append(...filas.map(x=>x.f), capa);
    const eje = el('div',{class:'ac-eje','aria-hidden':'true'}, el('span',null,'jugador'),
      el('div',{class:'marcas'}, ...[0,5,10,15,20,25].map(k=>el('span',{style:'left:'+pct(k)},String(k)))), el('span',null,'CPS ▸'));

    const id = ctx.uid+'umbral';
    const rango = el('input',{type:'range',min:0,max:MAX,step:0.5,value:est.u,id});
    const rangoTxt = el('span',{style:'font-weight:800;font-size:.8rem;font-family:var(--f-mono)'});
    const slider = el('div',{class:'ac-slider'}, el('label',{for:id},'Umbral (muevan)'), rango, rangoTxt);
    const guia = el('p',{class:'ac-pista-guia',hidden:''},
      'Pista: miren el hueco verde entre ', el('b',null,'cami77'), ' (humana, 10,5 CPS) y ', el('b',null,'b0t_3412'), ' (bot, 13 CPS). Pongan la línea violeta ahí: todo lo de la derecha queda baneado.');

    function pintar(){
      const u = coma(est.u), a = aciertos();
      umbralTxt.textContent = 'Umbral: '+u+' CPS';
      rangoTxt.textContent = u+' CPS';
      rango.value = est.u;
      rango.setAttribute('aria-valuetext', u+' clics por segundo. Aciertos: '+a+' de 10');
      zona.style.left = pct(est.u); tirador.style.left = pct(est.u);
      marcador.className = 'ac-marcador'+(a>=9?' meta-ok':'');
      marcador.innerHTML = '<span>Aciertos: '+a+' de 10</span><span class="barra" aria-hidden="true"><i style="width:'+(a*10)+'%"></i></span><span style="font-size:.75rem;color:var(--gris)">meta: 9</span>';
      filas.forEach(x=>{
        const pred = clasifica(x.c), bien = pred === x.t;
        x.dot.classList.toggle('error', !bien);
        x.ver.className = 'ac-ver '+(bien?'ok':'mal');
        x.ver.textContent = bien ? (pred==='B' ? '✔ baneado' : '✔ juega') : (x.t==='H' ? '✘ falso positivo' : '✘ bot se escapa');
        x.f.lastChild.textContent = 'La IA dice '+(pred==='B'?'bot':'humano')+': '+(bien?'acierto.':'error.');
      });
      vivo.textContent = 'Umbral '+u+' CPS. Aciertos: '+a+' de 10.';
    }
    rango.oninput = ()=>{ est.u = Number(rango.value); pintar(); };
    // Arrastrar la línea directamente sobre el gráfico
    const desdeX = clientX => {
      const r = filas[0].f.children[1].getBoundingClientRect();
      const v = Math.round(Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * MAX * 2) / 2;
      if(v !== est.u){ est.u = v; pintar(); }
    };
    let arrastrando = false;
    graf.addEventListener('pointerdown', ev=>{ if(ctx.resuelto) return; arrastrando = true; try{ graf.setPointerCapture(ev.pointerId); }catch(e){} desdeX(ev.clientX); ev.preventDefault(); });
    graf.addEventListener('pointermove', ev=>{ if(arrastrando) desdeX(ev.clientX); });
    const soltar = ()=>{ arrastrando = false; };
    graf.addEventListener('pointerup', soltar); graf.addEventListener('pointercancel', soltar);

    ctx.alFallar = ()=>{ if(ctx.fallos >= 2){ guia.hidden = false; hueco.hidden = false; } };
    pintar();
    cuerpo.append(top, leyenda, graf, eje, slider, guia, vivo);
    pie.append(btnComprobar(()=>{
      const a = aciertos();
      ctx.intento(a >= 9, 'Van '+a+' de 10 aciertos. Muevan la línea violeta hasta que casi todos los humanos queden a la izquierda y los bots a la derecha.');
    }));
    return caja;
  },

  micro(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Simulador micro:bit');
    const est = {x:0};
    const IZQ = ['..#..','.#...','#####','.#...','..#..'], DER = ['..#..','...#.','#####','...#.','..#..'], PUNTO = ['.....','.....','..#..','.....','.....'];
    const leds = el('div',{class:'leds',role:'img'});
    for(let i=0;i<25;i++) leds.append(el('i'));
    const placa = el('div',{class:'placa'}, leds);
    const id = ctx.uid+'incl';
    const rango = el('input',{type:'range',min:-1000,max:1000,step:50,value:0,id});
    const lbl = el('label',{for:id});
    const cod = el('pre',{class:'codigo',html:esc('para siempre:\n  si acelerómetro x > 300:\n      mostrar flecha →\n  si no, si acelerómetro x < -300:\n      mostrar flecha ←\n  si no:\n      mostrar punto')});
    const patron = ()=> est.x > 300 ? DER : (est.x < -300 ? IZQ : PUNTO);
    const pintar = ()=>{
      const p = patron().join('');
      [...leds.children].forEach((d,i)=>d.classList.toggle('on', p[i]==='#'));
      leds.setAttribute('aria-label', 'Pantalla de LEDs: '+(est.x > 300 ? 'flecha a la derecha' : est.x < -300 ? 'flecha a la izquierda' : 'un punto en el centro'));
      placa.style.transform = 'rotate('+(est.x/1000*20)+'deg)';
      lbl.textContent = 'Inclinación · acelerómetro x = '+est.x;
    };
    rango.oninput = ()=>{ est.x = Number(rango.value); pintar(); };
    pintar();
    ctx.izq.append(cod);
    cuerpo.append(el('div',{class:'zona-placa'}, placa), el('div',{class:'control'}, lbl, rango));
    pie.append(btnComprobar(()=>{
      ctx.intento(est.x < -300, est.x > 300 ? 'Esa es la flecha hacia la derecha. Inclinen para el otro lado.' : 'Muestra un punto: falta inclinar más. Lean la condición del programa.');
    }));
    return caja;
  },

  /* Puzzle de clasificación: cada tarjeta va a una de dos columnas */
  clasificar(q, ctx){
    const {caja, cuerpo, pie} = marcoSim(q.titulo || 'Clasificador');
    const asign = {};
    const filas = q.items.map((it,i)=>{
      const fila = el('div',{class:'clasif-fila'}, el('p',null,it.txt));
      const grupo = el('div',{class:'clasif-bins',role:'group','aria-label':'Clasificar: '+it.txt});
      q.bins.forEach(b=>grupo.append(el('button',{type:'button',class:'bin','aria-pressed':'false','data-bin':b.id,onclick:()=>{
        asign[i] = b.id;
        grupo.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed', String(x.dataset.bin===b.id)));
        fila.classList.remove('bien','mal');
      }}, b.label)));
      fila.append(grupo);
      return fila;
    });
    cuerpo.append(el('div',{class:'clasif'}, ...filas));
    pie.append(btnComprobar(()=>{
      const faltan = q.items.length - Object.keys(asign).length;
      if(faltan) return ctx.avisar('Les falta ubicar '+faltan+(faltan===1?' tarjeta.':' tarjetas.'));
      let bien = 0;
      q.items.forEach((it,i)=>{ const ok = asign[i] === it.bin; if(ok) bien++; filas[i].classList.toggle('bien', ok); filas[i].classList.toggle('mal', !ok); });
      ctx.intento(bien === q.items.length, bien+' de '+q.items.length+' bien ubicadas. Revisen las de borde rojo.');
    }));
    return caja;
  },

  /* Puzzle relacional: unir cada estudiante con su curso usando curso_id */
  unir(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Detective de tablas');
    ctx.izq.append(tablasDatos());
    const sels = T_EST.filas.map(([id,nombre,cid])=>{
      const s = el('select',{id:ctx.uid+'u'+id,'aria-label':'Curso de '+nombre}, el('option',{value:''},'¿Qué curso?'), ...T_CUR.filas.map(([cid2,n])=>el('option',{value:cid2},n)));
      s.addEventListener('change', ()=>s.parentElement.classList.remove('bien','mal'));
      return {s, nombre, cid};
    });
    cuerpo.append(el('div',{class:'clasif'}, ...sels.map(x=>el('div',{class:'clasif-fila'}, el('p',null, el('b',null,x.nombre), ' · curso_id = '+x.cid), x.s))));
    pie.append(btnComprobar(()=>{
      const faltan = sels.filter(x=>!x.s.value).length;
      if(faltan) return ctx.avisar('Les falta elegir el curso de '+faltan+(faltan===1?' persona.':' personas.'));
      let bien = 0;
      sels.forEach(x=>{ const ok = Number(x.s.value) === x.cid; if(ok) bien++; x.s.parentElement.classList.toggle('bien', ok); x.s.parentElement.classList.toggle('mal', !ok); });
      ctx.intento(bien === sels.length, bien+' de '+sels.length+' bien. Busquen el curso_id de cada persona en la columna id de la tabla cursos.');
    }));
    return caja;
  },

  /* Puzzle de IA: armar las reglas de un filtro antispam */
  spam(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Filtro antispam');
    const MSJ = [['¡Ganaste un celular! Haz clic aquí para reclamarlo', true],['Mañana hay prueba de matemática, no se olviden', false],
                 ['Recargas GRATIS: haz clic ya', true],['¿Vamos al cumple de Sofi el sábado?', false],
                 ['Tu cuenta será bloqueada: escribe tu clave aquí', true],['El profe subió la tarea a CREA', false]];
    const PAL = ['gratis','clic','clave','ganaste','tarea','prueba','cumple'];
    const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
    const elegidas = new Set();
    const chips = PAL.map(p=>el('button',{type:'button',class:'bin','aria-pressed':'false','data-pal':p,onclick:ev=>{
      if(elegidas.has(p)) elegidas.delete(p); else elegidas.add(p);
      ev.currentTarget.setAttribute('aria-pressed', String(elegidas.has(p))); pintar();
    }}, '«'+p+'»'));
    const bandeja = el('div',{class:'clasif'});
    const marcador = el('div',{class:'marcador','aria-live':'polite'});
    const esSpam = t => [...elegidas].some(p=>norm(t).includes(p));
    const aciertos = ()=>MSJ.filter(([t,s])=>esSpam(t)===s).length;
    function pintar(){
      bandeja.innerHTML = '';
      MSJ.forEach(([t,s])=>{
        const pred = esSpam(t), ok = pred === s;
        bandeja.append(el('div',{class:'clasif-fila '+(ok?'bien':'mal')}, el('p',null,t),
          el('span',{class:'veredicto-spam '+(pred?'si':'no')}, pred ? '✘ va a Spam' : '✔ Bandeja de entrada'),
          el('span',{class:'sr'}, ok ? ' (bien)' : ' (mal)')));
      });
      const a = aciertos();
      marcador.innerHTML = '<span>Bien clasificados: '+a+' de 6</span><span style="font-size:.75rem;color:var(--gris);font-weight:600">borde verde = bien · borde rojo = mal</span>';
    }
    pintar();
    cuerpo.append(el('p',{style:'font-weight:800;font-size:.9rem'},'1. Marquen las palabras del filtro (toquen para marcar o desmarcar):'),
      el('div',{class:'tags',role:'group','aria-label':'Palabras del filtro'}, ...chips),
      el('p',{style:'font-weight:800;font-size:.9rem'},'2. Miren dónde cae cada mensaje:'), marcador, bandeja);
    pie.append(btnComprobar(()=>{
      const a = aciertos();
      ctx.intento(a === 6, 'Van '+a+' de 6. Elijan palabras que aparezcan solo en los mensajes tramposos y nunca en los de la clase.');
    }));
    return caja;
  },

  /* Puzzle micro:bit: programar dos eventos y probarlos */
  eventos(q, ctx){
    const {caja, cuerpo, pie} = marcoSim('Programa la micro:bit');
    const EVENTOS = [['agitar','al agitar la placa'],['A','al presionar el botón A'],['B','al presionar el botón B']];
    const ACCIONES = [['corazon','mostrar corazón'],['flecha','mostrar flecha'],['sonrisa','mostrar sonrisa']];
    const DIBUJOS = {corazon:['.#.#.','#####','#####','.###.','..#..'].join(''), flecha:['..#..','.###.','#.#.#','..#..','..#..'].join(''), sonrisa:['.....','.#.#.','.....','#...#','.###.'].join('')};
    const reglas = [{ev:'B', ac:'sonrisa'}, {ev:'A', ac:'corazon'}];
    let probados = new Set();
    const leds = el('div',{class:'leds',role:'img','aria-label':'Pantalla apagada'});
    for(let i=0;i<25;i++) leds.append(el('i'));
    const salida = el('p',{class:'meta','aria-live':'polite'},'Prueben la placa con los botones de abajo.');
    const bloque = (r,i)=>{
      const sEv = el('select',{id:ctx.uid+'ev'+i,'aria-label':'Evento del bloque '+(i+1)}, ...EVENTOS.map(([v,t])=>el('option',{value:v},t)));
      const sAc = el('select',{id:ctx.uid+'ac'+i,'aria-label':'Acción del bloque '+(i+1)}, ...ACCIONES.map(([v,t])=>el('option',{value:v},t)));
      sEv.value = r.ev; sAc.value = r.ac;
      sEv.onchange = ()=>{ r.ev = sEv.value; probados = new Set(); };
      sAc.onchange = ()=>{ r.ac = sAc.value; probados = new Set(); };
      return el('div',{class:'bloque-mb'}, el('span',{class:'kw-mb'},'cuando'), sEv, el('span',{class:'kw-mb','aria-hidden':'true'},'→'), sAc);
    };
    const mostrar = d => { [...leds.children].forEach((x,i)=>x.classList.toggle('on', !!d && d[i]==='#')); };
    const probar = ev => {
      probados.add(ev);
      const r = reglas.find(x=>x.ev===ev);
      if(r){ mostrar(DIBUJOS[r.ac]); leds.setAttribute('aria-label', ACCIONES.find(a=>a[0]===r.ac)[1]); salida.textContent = 'Evento «'+EVENTOS.find(e=>e[0]===ev)[1]+'» → '+ACCIONES.find(a=>a[0]===r.ac)[1]+'.'; }
      else { mostrar(null); leds.setAttribute('aria-label','Pantalla apagada'); salida.textContent = 'Ningún bloque responde a ese evento: la placa no hace nada.'; }
    };
    cuerpo.append(el('div',{class:'bloques-mb'}, ...reglas.map(bloque)),
      el('div',{class:'mb-grid'}, el('div',{class:'placa'}, leds),
        el('div',{class:'pila'}, el('div',{class:'fila'}, ...EVENTOS.map(([v])=>el('button',{type:'button',class:'btn osc','data-ev':v,onclick:()=>probar(v)}, v==='agitar' ? 'Agitar' : 'Botón '+v))), salida)));
    pie.append(btnComprobar(()=>{
      const tiene = (ev,ac)=>reglas.some(r=>r.ev===ev && r.ac===ac);
      if(!tiene('agitar','corazon')) return ctx.intento(false,'Al agitar todavía no aparece el corazón. ¿Qué bloque tiene que escuchar ese evento?');
      if(!tiene('A','flecha')) return ctx.intento(false,'El botón A todavía no muestra la flecha. Revisen el otro bloque.');
      if(!probados.has('agitar') || !probados.has('A')) return ctx.avisar('El programa parece correcto: pruébenlo con «Agitar» y «Botón A» antes de comprobar.');
      ctx.intento(true);
    }));
    return caja;
  }
};

/* ---------- Ordenar pasos (tocar para ordenar) ---------- */
function simOrden(q, ctx){
  const {caja, cuerpo, pie} = marcoSim(q.titulo || 'Ordenar pasos');
  const puestos = [];
  const pool = mezclar(q.pasos.map((_,i)=>i), q.pasos.length*13 + ctx.semilla.length);
  const zonaR = el('div',{class:'orden-zona',role:'group','aria-label':'Su orden'});
  const zonaP = el('div',{class:'orden-zona',role:'group','aria-label':'Pasos disponibles'});
  const comprobar = el('button',{type:'button',class:'btn',disabled:''},'Comprobar orden');
  const clsTxt = q.mono ? 'mono-paso' : '';
  const pintar = ()=>{
    zonaR.innerHTML = ''; zonaP.innerHTML = '';
    if(!puestos.length) zonaR.append(el('div',{class:'vacio'},'Toquen los pasos disponibles en orden'));
    puestos.forEach((idx,pos)=>zonaR.append(el('button',{type:'button',class:'paso puesto','data-idx':idx,'aria-label':'Paso '+(pos+1)+': '+q.pasos[idx]+'. Tocar para quitar',onclick:()=>{ puestos.splice(pos,1); pintar(); }},
      el('span',{class:'n'},String(pos+1)), el('span',{class:clsTxt},q.pasos[idx]))));
    pool.filter(i=>!puestos.includes(i)).forEach(idx=>zonaP.append(el('button',{type:'button',class:'paso','data-idx':idx,'aria-label':'Agregar: '+q.pasos[idx],onclick:()=>{ puestos.push(idx); pintar(); }},
      el('span',{class:'n mas','aria-hidden':'true'},'+'), el('span',{class:clsTxt},q.pasos[idx]))));
    if(!zonaP.children.length) zonaP.append(el('div',{class:'vacio'},'Ya usaron todos los pasos'));
    comprobar.disabled = puestos.length !== q.pasos.length;
  };
  comprobar.onclick = ()=>{
    const bien = puestos.filter((idx,pos)=>idx===pos).length;
    const ok = bien === q.pasos.length;
    if(!ok) [...zonaR.children].forEach((b,pos)=>b.classList.add(puestos[pos]===pos ? 'bien' : 'mal'));
    else [...zonaR.children].forEach(b=>b.classList.add('bien'));
    ctx.intento(ok, bien+' de '+q.pasos.length+' pasos están en su lugar (borde verde). Toquen los de borde rojo para quitarlos y vuelvan a ordenar.');
  };
  pintar();
  cuerpo.append(el('div',{class:'orden-cols'},
    el('div',null, el('p',{class:'sub-t'},'Pasos disponibles'), zonaP),
    el('div',null, el('p',{class:'sub-t'},'Su orden'), zonaR)));
  pie.append(comprobar);
  return caja;
}

/* ---------- Tocar la línea de código ---------- */
function simLinea(q, ctx){
  const {caja, cuerpo} = marcoSim('Programa');
  const box = el('div',{class:'lineas',role:'group','aria-label':'Líneas del programa'});
  q.codigo.split('\n').forEach((ln,i)=>{
    const b = el('button',{type:'button','data-i':i,'aria-label':'Línea '+(i+1)+': '+ln.trim()});
    b.innerHTML = '<span class="num" aria-hidden="true">'+(i+1)+'</span><span>'+hl(ln, q.lang)+'</span>';
    b.addEventListener('click', ()=>{
      if(ctx.resuelto) return;
      box.querySelectorAll('button').forEach(x=>x.classList.remove('mal'));
      if(i === q.ok){ b.classList.add('bien'); ctx.intento(true); }
      else { b.classList.add('mal'); ctx.intento(false, q.pista || 'Esa línea no repite nada. Busquen la que hace que el bloque de abajo se repita.'); }
    });
    box.append(b);
  });
  cuerpo.append(box);
  return caja;
}

/* ---------- Página de isla ---------- */
let ISLA = null, CTXS = [], UI = {}, MAZO = null, INTERES = null, AVISADO = false;
const OPC_INTERES = [[1,'Poco'],[2,'Bastante'],[3,'¡Mucho!']];

function iniciar(isla){
  ISLA = isla;
  const app = document.getElementById('app');
  document.documentElement.style.setProperty('--c', isla.color);
  document.documentElement.style.setProperty('--ct', isla.ct);
  const N = isla.preguntas.length;
  const slides = [];

  // 1) Portada: cabecera del curso + instrucciones
  const intro = el('section',{class:'slide-intro','aria-labelledby':'t-isla'});
  intro.append(el('div',{class:'intro-grid'},
    el('header',{class:'cab-est'},
      el('div',{class:'cab-fila'},
        el('div',{class:'cab-img'}, el('img',{src:'../logos-cursos/'+isla.logo, alt:'Ícono del curso '+isla.mapaCurso, width:'270', height:'259'})),
        el('div',{class:'cab-txt'},
          el('span',{class:'kick'}, isla.kick),
          el('h1',{id:'t-isla'}, isla.nombre),
          el('span',{class:'sub'}, isla.curso))),
      el('div',{class:'info-curso'},
        el('p',null,isla.info),
        el('ul',{class:'chips','aria-label':'Modalidad'}, ...isla.modalidad.map(m=>el('li',null,m))))),
    el('div',{class:'intro-ins'},
      el('h2',null,'Cómo funciona'),
      el('ol',{class:'pasos-ins'},
        el('li',null, el('b',{class:'n'},'1'), el('span',null,'Hay '+N+' puzzles, uno por pantalla. Pueden reintentar todas las veces que necesiten.')),
        el('li',null, el('b',{class:'n'},'2'), el('span',null,'Avancen con «Siguiente», deslizando el dedo o con las flechas ← → del teclado.')),
        el('li',null, el('b',{class:'n'},'3'), el('span',null,'Al final respondan una pregunta corta y aparece el código de desbloqueo.'))),
      el('div',null, el('button',{type:'button',class:'btn',onclick:()=>MAZO.ir(1, true)},'Empezar ▶')))));
  slides.push(intro);

  // 2) Una diapositiva por puzzle
  isla.preguntas.forEach((q,i)=>{
    const ctx = {i, q, uid:'pz'+(i+1)+'-', fallos:0, resuelto:false, semilla:isla.semilla || isla.id};
    const tituloId = ctx.uid+'tit';
    ctx.estado = el('span',{class:'pz-estado'},'Pendiente');
    ctx.verExp = el('button',{type:'button',class:'btn-mini',hidden:'',onclick:()=>mostrarExplicacion(ctx)},'Ver explicación');
    ctx.vivo = el('p',{class:'sr','aria-live':'polite'});
    ctx.izq = el('div',{class:'pz-izq'});
    ctx.zona = el('div',{class:'pz-der'});
    ctx.plegar = el('button',{type:'button',class:'izq-toggle','aria-expanded':'true','aria-controls':ctx.uid+'izq',onclick:()=>plegar(ctx, !ctx.grid.classList.contains('plegado'))});
    ctx.izq.id = ctx.uid+'izq';
    ctx.grid = el('div',{class:'pz-grid'}, ctx.plegar, ctx.izq, ctx.zona);
    plegar(ctx, false);
    // En pantallas angostas, al empezar a usar el simulador la consigna se pliega sola (una vez)
    ctx.zona.addEventListener('pointerdown', ()=>{ if(!ctx.autoPlegado && !ANCHO.matches){ ctx.autoPlegado = true; plegar(ctx, true); } }, true);
    ctx.sec = el('section',{class:'slide-pz',id:'puzzle-'+(i+1),'aria-labelledby':tituloId},
      el('div',{class:'pz-cab'},
        el('h2',{id:tituloId}, el('span',{class:'capsula isla'}, q.etiqueta), el('span',{class:'pz-num'},'Puzzle '+(i+1)+' de '+N)),
        el('div',{class:'der'}, ctx.verExp, ctx.estado)),
      ctx.grid, ctx.vivo);
    if(q.como) ctx.izq.append(el('div',{class:'como'}, el('h3',null,'¿Cómo se juega?'),
      el('ol',null, ...q.como.map((t,k)=>el('li',null, el('b',{class:'n'},String(k+1)), el('span',{html:t}))))));
    ctx.izq.append(el('p',{class:'enunciado'}, q.texto));
    if(q.meta) ctx.izq.append(el('div',{class:'meta'}, el('b',null,'Meta'), el('span',null,q.meta)));
    if(q.codigo && q.tipo !== 'linea') ctx.izq.append(el('pre',{class:'codigo','aria-label':'Código del programa',html:hl(q.codigo, q.lang)}));
    if(q.pred) ctx.izq.append(anota('<b>Bitácora:</b> anoten su predicción en la bitácora antes de probar.'));
    ctx.intento = (ok, pista) => intento(ctx, ok, pista);
    ctx.avisar = msg => avisar(ctx, msg);
    if(q.tipo === 'orden') ctx.zona.append(simOrden(q, ctx));
    else if(q.tipo === 'linea') ctx.zona.append(simLinea(q, ctx));
    else if(q.tipo === 'sim') ctx.zona.append(SIMS[q.sim](q, ctx));
    CTXS.push(ctx);
    slides.push(ctx.sec);
  });

  // 3) Pregunta de interés
  UI.interes = el('section',{class:'slide-interes','aria-labelledby':'t-interes'});
  slides.push(UI.interes);
  // 4) Código de desbloqueo
  UI.caja = el('section',{class:'slide-codigo','aria-labelledby':'t-codigo'});
  slides.push(UI.caja);

  const iInteres = N + 1, iCodigo = N + 2;
  MAZO = crearMazo(app, slides, {
    etiqueta: i => {
      const isl = '<small>'+esc(isla.nombre)+' · </small>';
      if(i === 0) return isl+'Inicio';
      if(i <= N) return isl+'Puzzle '+i+' de '+N+(CTXS[i-1].resuelto ? ' ✔' : '');
      if(i === iInteres) return isl+'Pregunta final';
      return isl+'Código';
    },
    punto: k => {
      if(k >= 1 && k <= N) return CTXS[k-1].resuelto ? 'hecho' : '';
      if(k === iInteres) return INTERES != null ? 'hecho' : '';
      if(k === iCodigo) return codigoAbierto() ? 'oro' : '';
      return '';
    },
    alCambiar: ()=>{ CTXS.forEach(c=>cerrarPanel(c, true)); }
  });
  MAZO.iInteres = iInteres; MAZO.iCodigo = iCodigo;
  pintarInteres();
  pintarCodigo();

  document.addEventListener('keydown', ev=>{
    if(ev.key !== 'Escape') return;
    const c = CTXS.find(x=>x.panel); if(c) cerrarPanel(c);
  });
}

const ANCHO = window.matchMedia('(min-width:720px)');
function plegar(ctx, si){
  ctx.grid.classList.toggle('plegado', si);
  ctx.plegar.setAttribute('aria-expanded', String(!si));
  ctx.plegar.innerHTML = si ? '<span>📋 Consigna y meta</span><span aria-hidden="true">▾ ver</span>' : '<span>📋 Consigna y meta</span><span aria-hidden="true">▴ ocultar</span>';
}
function resueltos(){ return CTXS.filter(c=>c.resuelto).length; }
function codigoAbierto(){ return resueltos() === CTXS.length && INTERES != null; }
function irPuzzle(ctx){ MAZO.ir(ctx.i + 1, true); }

function pintarInteres(){
  const s = UI.interes; s.innerHTML = '';
  const N = CTXS.length, n = resueltos();
  const grupo = el('div',{class:'interes',role:'group','aria-label':'Cuánto les gustaría profundizar en este tema'});
  OPC_INTERES.forEach(([v,t])=>grupo.append(el('button',{type:'button','aria-pressed':String(INTERES===v),'data-interes':v,onclick:()=>elegirInteres(v)}, t)));
  const pend = CTXS.filter(c=>!c.resuelto);
  const verCod = el('button',{type:'button',class:'btn osc',disabled: INTERES == null ? '' : null,onclick:()=>MAZO.ir(MAZO.iCodigo, true)}, 'Ver el código ▶');
  s.append(el('div',{class:'centro'},
    el('span',{class:'kick'},'Antes del código · '+ISLA.nombre),
    el('h2',{id:'t-interes'},'¿Cuánto les gustaría profundizar en este tema?'),
    el('p',{style:'color:var(--gris);font-size:.9rem'},'Su respuesta arma la ruta sugerida del cierre. No hay respuestas incorrectas.'),
    grupo,
    el('p',{style:'font-weight:700;font-size:.9rem'}, n === N ? '✔ Resolvieron los '+N+' puzzles.' : 'Resolvieron '+n+' de '+N+' puzzles. Les falta:'),
    pend.length ? el('ul',{class:'estado-lista'}, ...pend.map(c=>el('li',null, el('button',{type:'button',onclick:()=>irPuzzle(c)}, 'Puzzle '+(c.i+1)+' · '+c.q.etiqueta)))) : null,
    el('div',null, verCod)));
}
function elegirInteres(v){
  INTERES = v;
  UI.interes.querySelectorAll('[data-interes]').forEach(b=>b.setAttribute('aria-pressed', String(Number(b.dataset.interes)===v)));
  const b = UI.interes.querySelector('.btn.osc'); if(b) b.disabled = false;
  guardarIntereses(o=>{ o[ISLA.id] = v; });
  revisarCompleto();
  pintarCodigo();
  MAZO.refrescar();
}

function pintarCodigo(){
  const c = UI.caja; c.innerHTML = '';
  const N = CTXS.length, n = resueltos();
  if(codigoAbierto()){
    c.append(el('div',{class:'centro'}, el('div',{class:'desbloqueo abierto aparece',tabindex:'-1'},
      el('h2',{id:'t-codigo',class:'kick'},'¡Isla completa! · Código de desbloqueo'),
      el('p',{class:'clave'}, ISLA.codigo),
      el('p',{class:'ins'},'Cierren esta ventana y díganle el código a su tutor/a para recibir el cofre'))));
    return;
  }
  const req = el('ul',{class:'requisitos'},
    el('li',{class: n===N ? 'ok' : ''}, (n===N ? '✔ ' : '✘ ')+'Resolver los '+N+' puzzles ('+n+' de '+N+')'),
    el('li',{class: INTERES!=null ? 'ok' : ''}, (INTERES!=null ? '✔ ' : '✘ ')+'Responder la pregunta final'));
  const pend = CTXS.find(x=>!x.resuelto);
  const ir = pend ? el('button',{type:'button',class:'btn',onclick:()=>irPuzzle(pend)},'Ir al puzzle '+(pend.i+1)+' ▶')
                  : el('button',{type:'button',class:'btn',onclick:()=>MAZO.ir(MAZO.iInteres, true)},'Ir a la pregunta final ▶');
  c.append(el('div',{class:'centro'}, el('div',{class:'desbloqueo'},
    el('div',{class:'candado',html:ICONO_CANDADO}),
    el('h2',{id:'t-codigo',class:'kick'},'Código de desbloqueo'),
    el('p',{style:'font-weight:700'},'Para ver el código les falta:'), req, ir)));
}

function revisarCompleto(){
  if(!codigoAbierto() || AVISADO) return;
  AVISADO = true;
  guardarIntereses(o=>{ o.completas = o.completas || {}; o.completas[ISLA.id] = true; });
  try{ window.parent.postMessage({type:'cc-puzzle-complete', isla:ISLA.id, codigo:ISLA.codigo, interes:INTERES}, '*'); }catch(e){}
}

/* Panel de retroalimentación dentro de la diapositiva */
function abrirPanel(ctx, clase, hijos, acciones){
  cerrarPanel(ctx, true);
  ctx.volverA = document.activeElement;
  const p = el('div',{class:'fb-panel '+clase,role:'group','aria-label':'Resultado'}, ...hijos, el('div',{class:'fila'}, ...acciones));
  ctx.panel = p;
  ctx.sec.append(p);
  const foco = acciones[acciones.length-1];
  if(foco) foco.focus({preventScroll:true});
}
function cerrarPanel(ctx, silencioso){
  if(!ctx.panel) return;
  ctx.panel.remove(); ctx.panel = null;
  if(silencioso) return;
  const v = ctx.volverA;
  if(v && v.isConnected && !v.disabled && ctx.sec.contains(v)) v.focus({preventScroll:true});
  else { const h = ctx.sec.querySelector('h2'); h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
}

function intento(ctx, ok, pista){
  if(ctx.resuelto) return true;
  if(ok){ resolver(ctx); return true; }
  ctx.fallos++;
  if(ctx.alFallar) ctx.alFallar();
  ctx.vivo.textContent = 'Todavía no. '+pista;
  abrirPanel(ctx, 'mal temblor', [
    el('span',{class:'capsula err'},'✘ Todavía no · intento '+ctx.fallos),
    el('p',null,pista),
    el('p',{style:'font-size:.85rem;color:var(--gris)'},'Corrijan y vuelvan a probar.')],
    [el('button',{type:'button',class:'btn',onclick:()=>cerrarPanel(ctx)},'Seguir intentando')]);
  return false;
}
function avisar(ctx, msg){
  if(ctx.resuelto) return;
  ctx.vivo.textContent = msg;
  abrirPanel(ctx, 'aviso', [el('span',{class:'capsula amarilla'},'Ojo'), el('p',null,msg)],
    [el('button',{type:'button',class:'btn',onclick:()=>cerrarPanel(ctx)},'Entendido')]);
}

function mostrarExplicacion(ctx){
  const todos = resueltos() === CTXS.length;
  const pendiente = CTXS.find(c=>!c.resuelto && c.i > ctx.i) || CTXS.find(c=>!c.resuelto);
  let txt, fn;
  if(todos){ txt = INTERES == null ? 'Ir a la pregunta final ▶' : 'Ver el código ▶'; fn = ()=>MAZO.ir(INTERES == null ? MAZO.iInteres : MAZO.iCodigo, true); }
  else { txt = pendiente.i > ctx.i ? 'Siguiente puzzle ▶' : 'Ir al puzzle pendiente ▶'; fn = ()=>irPuzzle(pendiente); }
  const hijos = [el('span',{class:'capsula ok'},'✔ ¡Resuelto!'), el('p',null,ctx.q.exp)];
  if(ctx.q.pred) hijos.push(anota('En la bitácora, marquen si su predicción era correcta.'));
  abrirPanel(ctx, 'bien', hijos, [
    el('button',{type:'button',class:'btn sec',onclick:()=>cerrarPanel(ctx)},'Cerrar'),
    el('button',{type:'button',class:'btn osc',onclick:()=>{ cerrarPanel(ctx, true); fn(); }}, txt)]);
}

function resolver(ctx){
  ctx.resuelto = true;
  ctx.primerIntento = ctx.fallos === 0;
  if(!ctx.noBloquear) ctx.zona.querySelectorAll('button, input, select').forEach(x=>{ x.disabled = true; });
  ctx.estado.textContent = '✔ Resuelto'; ctx.estado.classList.add('ok');
  ctx.verExp.hidden = false;
  ctx.vivo.textContent = '¡Resuelto! '+ctx.q.exp;
  guardarIntereses(o=>{ o.aciertos = o.aciertos || {}; o.aciertos[ISLA.id] = CTXS.filter(c=>c.resuelto && c.primerIntento).length; });
  mostrarExplicacion(ctx);
  pintarInteres();
  revisarCompleto();
  pintarCodigo();
  MAZO.refrescar();
}

window.CC = {iniciar, mazo:crearMazo, leerIntereses, el, esc};
})();
