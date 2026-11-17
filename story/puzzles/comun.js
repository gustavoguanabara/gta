/* Expedición CC · motor común de los puzzles por isla.
   Portado de la app de una sola página "Expedición CC" (Ceibal): mismas mecánicas, metas,
   pistas y explicaciones. Sin XP, sin reloj, sin equipos y sin localStorage.
   Cada página llama a CC.iniciar({...}) con los datos de su isla. */
(function(){
'use strict';

/* ---------- Utilidades ---------- */
const $ = (s, r) => (r || document).querySelector(s);
function el(tag, attrs, ...hijos){
  const n = document.createElement(tag);
  if(attrs) for(const k in attrs){
    if(k === 'html') n.innerHTML = attrs[k];
    else if(k === 'class') n.className = attrs[k];
    else if(k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  for(const h of hijos){ if(h == null) continue; n.append(h.nodeType ? h : document.createTextNode(h)); }
  return n;
}
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const REGLAS = {
  py:/("[^"\n]*"|'[^'\n]*')|(\b\d+\b)|(\b(?:for|in|if|else|while|or|and|not|True|False)\b)|(\b(?:print|range|input|len)\b)/g,
  sql:/('[^'\n]*')|(\b\d+\b)|(\b(?:SELECT|FROM|WHERE)\b)|(\*)/g
};
function hl(code, lang){
  const re = REGLAS[lang]; if(!re) return esc(code);
  let out = '', ult = 0, m; re.lastIndex = 0;
  while((m = re.exec(code))){
    out += esc(code.slice(ult, m.index));
    const k = [1,2,3,4].find(i => m[i] !== undefined) - 1;
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
const desplazar = (nodo, block) => nodo.scrollIntoView({behavior: reducido() ? 'auto' : 'smooth', block: block || 'start'});

const ICONO_LAPIZ = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.2V21h3.8l11-11-3.8-3.8-11 11zM20.7 7a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.8 3.8L20.7 7z"/></svg>';
const ICONO_SIM = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16v12H4zM2 18h20v2H2z"/><path d="M8 8l3 2-3 2zM12 12h4v1h-4z" fill="#fff"/></svg>';
const ICONO_CANDADO = '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4V7zm3 9.7V18h-2v-1.3a1.5 1.5 0 1 1 2 0z"/></svg>';
const ICONO_EJECUTAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

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
function marcoSim(titulo, meta){
  const cuerpo = el('div',{class:'sim-cuerpo'});
  if(meta) cuerpo.append(el('div',{class:'meta'}, el('b',null,'Meta'), el('span',null,meta)));
  const caja = el('div',{class:'sim'}, el('div',{class:'sim-cab',html:ICONO_SIM+'<span>'+esc(titulo)+'</span>'}), cuerpo);
  return {caja, cuerpo};
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
    const {caja, cuerpo} = marcoSim('Laboratorio de comillas', q.meta);
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
    cuerpo.append(el('p',{style:'font-size:.9rem;color:var(--gris)'},'Toquen cada 1 para ponerle o sacarle las comillas.'), linea, btnEjecutar(()=>{
      if(est.a && est.b) con.textContent = '11';
      else if(!est.a && !est.b) con.textContent = '2';
      else con.innerHTML = '<span class="err">TypeError: no se puede sumar texto (str) y número (int)</span>';
    }), con);
    const id = ctx.uid+'resp';
    const inp = el('input',{type:'text',id,autocomplete:'off',autocapitalize:'off',spellcheck:'false',placeholder:'Escriban la salida'});
    const enviar = ()=>{
      const v = inp.value.trim().replace(/^["']|["']$/g,'').replace(/\s+/g,'');
      if(!v){ inp.focus(); return; }
      ctx.intento(q.respuestas.includes(v), v==='2' ? 'Ojo: en el programa original los dos 1 llevan comillas. Pruébenlo así en el simulador.' : 'Armen print("1" + "1") en el simulador y miren la consola.');
    };
    inp.addEventListener('keydown', ev=>{ if(ev.key==='Enter') enviar(); });
    cuerpo.append(el('label',{for:id,style:'font-weight:700'},'¿Qué muestra print("1" + "1")?'),
      el('div',{class:'respuesta'}, inp, el('button',{type:'button',class:'btn',onclick:enviar},'Responder')));
    return caja;
  },

  bucle(q, ctx){
    const {caja, cuerpo} = marcoSim('Simulador de bucle', q.meta);
    const est = {n:2, corrida:null};
    const id = ctx.uid+'rango';
    const rango = el('input',{type:'range',min:1,max:6,value:2,id});
    const cod = el('pre',{class:'codigo'});
    const lbl = el('label',{for:id});
    const pintar = ()=>{ lbl.textContent = 'Número dentro de range( ): '+est.n; cod.innerHTML = hl('for vuelta in range('+est.n+'):\n    print("Hola Ana")\nprint("Listo")','py'); };
    rango.oninput = ()=>{ est.n = Number(rango.value); pintar(); };
    pintar();
    const con = consola();
    cuerpo.append(el('div',{class:'control'}, lbl, rango), cod);
    let corriendo = false;
    cuerpo.append(el('div',{class:'fila'}, btnEjecutar(async()=>{
      if(corriendo) return; corriendo = true;
      con.textContent = ''; const n = est.n;
      for(let i=0;i<n;i++){ con.textContent += 'Hola Ana\n'; await sleep(250); }
      con.textContent += 'Listo'; est.corrida = n; corriendo = false;
    }), btnComprobar(()=>{
      if(corriendo) return;
      if(est.corrida == null) return ctx.intento(false,'Primero ejecuten el programa y cuenten los saludos.');
      ctx.intento(est.corrida === 4, 'Salió '+est.corrida+' veces. ¿Qué número tiene que ir dentro de range( )?');
    })), con);
    return caja;
  },

  logica(q, ctx){
    const {caja, cuerpo} = marcoSim('Interruptores lógicos', q.meta);
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
      el('label',{class:'interruptor',for:idC}, chk, el('span',null,'tiene_permiso')), cod);
    let ultima = null;
    cuerpo.append(el('div',{class:'fila'}, btnEjecutar(()=>{
      const r = evalua(); ultima = r;
      const py = v => v ? 'True' : 'False';
      con.innerHTML = '<b>'+py(r)+'</b>   <span class="vacia">('+py(est.edad>=18)+' or '+py(est.permiso)+')</span>';
    }), btnComprobar(()=>{
      if(ultima === null) return ctx.intento(false,'Ejecuten el programa para ver qué reporta.');
      ctx.intento(evalua() === false && ultima === false, 'Todavía da True. Con or, ¿cuántas partes tienen que ser False para que todo sea False?');
    })), con);
    return caja;
  },

  hacker(q, ctx){
    const {caja, cuerpo} = marcoSim('Consola de datos', q.meta);
    const COLS = ['curso','fase','area','modalidad'];
    const CONDS = {
      none:{nl:'sin condición', sql:'', f:()=>true, usa:null},
      f1:{nl:'la fase es 1', sql:'fase = 1', f:r=>r.fase===1, usa:'fase'},
      f2:{nl:'la fase es 2', sql:'fase = 2', f:r=>r.fase===2, usa:'fase'},
      ia:{nl:'el área es IA', sql:"area = 'IA'", f:r=>r.area==='IA', usa:'area'},
      prog:{nl:'el área es Programación', sql:"area = 'Programación'", f:r=>r.area==='Programación', usa:'area'}
    };
    const est = {cols:[], tabla:null, cond:null, corrida:null};

    // Tablas visibles: la de cursos (real) y una de distracción
    const tablaCursos = tabla({nombre:'cursos_cc', cols:COLS, filas:T_CC.map(r=>COLS.map(c=>r[c]))});
    const filasHTML = [...tablaCursos.querySelectorAll('tbody tr')];
    cuerpo.append(el('p',{style:'font-weight:700;font-size:.9rem'},'Base de datos: ceibal_cc'), tablaCursos,
      el('details',{class:'extra'}, el('summary',null,'Ver la otra tabla: inscriptos'), tabla({nombre:'inscriptos', cols:['nombre','departamento','curso'], filas:T_INS})));

    // Etiquetas en lenguaje natural
    const traduccion = el('div',{class:'traduccion','aria-live':'polite'});
    const slot = (rotulo, sql, chips) => el('div',{class:'slot'},
      el('div',{class:'slot-rot'}, el('span',{class:'capsula hk'},rotulo), el('small',null,'= '+sql)),
      el('div',{class:'tags',role:'group','aria-label':rotulo+' ('+sql+')'}, ...chips));
    const chip = (txt, onclick, attrs) => el('button',Object.assign({type:'button',class:'tag','aria-pressed':'false',onclick},attrs||{}),txt);
    const chipsCol = [chip('todo (*)',()=>{ est.cols = est.cols[0]==='*' ? [] : ['*']; pintar(); },{'data-col':'*'})]
      .concat(COLS.map(c=>chip(c,()=>{ est.cols = est.cols.filter(x=>x!=='*'); est.cols = est.cols.includes(c) ? est.cols.filter(x=>x!==c) : est.cols.concat(c); pintar(); },{'data-col':c})));
    const chipsTab = ['cursos_cc','inscriptos'].map(t=>chip(t,()=>{ est.tabla = t; pintar(); },{'data-tab':t}));
    const chipsCond = Object.keys(CONDS).map(k=>chip(CONDS[k].nl,()=>{ est.cond = k; pintar(); },{'data-cond':k}));
    cuerpo.append(el('p',{style:'font-weight:800'},'Armen la consulta tocando etiquetas'),
      slot('MOSTRAME','SELECT',chipsCol), slot('DE DÓNDE','FROM',chipsTab), slot('DÓNDE','WHERE',chipsCond), traduccion);

    const term = el('div',{class:'term','aria-live':'polite'});
    term.innerHTML = '<span class="dim">ceibal_cc&gt; esperando consulta…</span><span class="cursor" aria-hidden="true">▍</span>';
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
    cuerpo.append(el('div',{class:'fila'}, ejecutar, comprobar), term);

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
      const linea = (html, cls) => { const d = el('div',{class:cls||''}); d.innerHTML = html; term.append(d); return d; };
      const tipear = async (d, txt, v) => { for(const ch of txt){ d.textContent += ch; await sleep(v||18); } };
      await tipear(linea('', 'dim'), '$ conectando a ceibal_cc.db ...');
      await sleep(250); term.lastChild.textContent += ' OK';
      const barra = linea('', 'dim');
      for(let i=1;i<=12;i++){ barra.textContent = '$ cargando '+snap.tabla+' ['+'█'.repeat(i)+'░'.repeat(12-i)+']'; await sleep(45); }
      const q1 = linea('', 'cmd'); await tipear(q1, '> '+sqlTexto(), 28);
      // Errores realistas
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
      if(!ctx.resuelto){ ejecutar.disabled = false; comprobar.disabled = false; }
    }
    pintar();
    return caja;
  },

  web(q, ctx){
    const {caja, cuerpo} = marcoSim('Mini editor web', q.meta);
    const est = {texto:'Mi página', color:'black', js:false, clics:0};
    const idT = ctx.uid+'h1', idC = ctx.uid+'color', idJ = ctx.uid+'js';
    const inTxt = el('input',{type:'text',id:idT,value:est.texto,maxlength:30,autocomplete:'off'});
    const sCol = el('select',{id:idC}, el('option',{value:'black'},'black (negro)'), el('option',{value:'orange'},'orange (naranja)'), el('option',{value:'blue'},'blue (azul)'));
    const chk = el('input',{type:'checkbox',id:idJ});
    const h1 = el('p',{class:'h1-vista',role:'heading','aria-level':'3'}), boton = el('button',{type:'button'}), aviso = el('p',{style:'font-size:.8rem;color:#555;font-family:Arial,sans-serif;min-height:1.2em','aria-live':'polite'});
    h1.style.cssText = 'font-size:1.6rem;font-family:Georgia,"Times New Roman",serif;font-weight:700;line-height:1.2;overflow-wrap:anywhere;max-width:100%';
    const pintar = ()=>{ h1.textContent = est.texto; h1.style.color = est.color; boton.textContent = '♥ Me gusta: '+est.clics; };
    boton.onclick = ()=>{ if(est.js){ est.clics++; aviso.textContent=''; pintar(); } else aviso.textContent = 'Sin JS el botón existe, pero no hace nada.'; };
    inTxt.oninput = ()=>{ est.texto = inTxt.value; pintar(); };
    sCol.onchange = ()=>{ est.color = sCol.value; pintar(); };
    chk.onchange = ()=>{ est.js = chk.checked; if(!est.js) est.clics = 0; pintar(); };
    pintar();
    cuerpo.append(
      el('div',{class:'control'}, el('label',{for:idT},'HTML · texto del título  <h1>…</h1>'), inTxt),
      el('div',{class:'control'}, el('label',{for:idC},'CSS · h1 { color: … }'), sCol),
      el('label',{class:'interruptor',for:idJ}, chk, el('span',null,'JS · al tocar el botón, sumar 1')),
      el('div',{class:'vista-web',role:'region','aria-label':'Vista previa de la página'}, el('div',{class:'barra-nav'},'mi-pagina.html'), el('div',{class:'pag'}, h1, boton, aviso)),
      btnComprobar(()=>{
        const t = est.texto.trim().toLowerCase().replace(/\s+/g,' ');
        if(t !== 'hola utu') return ctx.intento(false,'El título tiene que decir «Hola UTU». Eso se cambia en el HTML.');
        if(est.color !== 'orange') return ctx.intento(false,'El título todavía no está en naranja. El color es cosa del CSS.');
        if(!est.js) return ctx.intento(false,'El botón no cuenta. ¿Qué capa le da comportamiento a la página?');
        if(est.clics < 1) return ctx.intento(false,'Activaron JS, pero no lo probaron: toquen el botón en la vista previa.');
        ctx.intento(true);
      }));
    return caja;
  },

  ia(q, ctx){
    const {caja, cuerpo} = marcoSim('Anti-cheat con IA', q.meta);
    // [CPS, tipo, apodo]  H = humano, B = bot. El «pro» es humano pero clickea como bot.
    const datos = [[4,'H','lucia_09'],[6,'H','mate_uy'],[7.5,'H','sofi.gg'],[9,'H','tomi_rv'],[10.5,'H','cami77'],[15,'H','PRO_xNico'],
                   [13,'B','b0t_3412'],[17,'B','xX_aim_Xx'],[20,'B','autoclick'],[24,'B','farm_bot']];
    const est = {u:2};
    const id = ctx.uid+'umbral';
    const rango = el('input',{type:'range',min:0,max:25,step:0.5,value:2,id});
    const lbl = el('label',{for:id});
    const graf = el('div',{class:'graf'});
    const marcador = el('div',{class:'meta','aria-live':'polite'});
    const lista = el('div',{class:'jugadores'});
    const clasifica = cps => cps > est.u ? 'B' : 'H';
    const aciertos = ()=>datos.filter(([c,t])=>clasifica(c) === t).length;
    const F = 'font-family="Montserrat,Verdana,sans-serif"';
    const pintar = ()=>{
      const u = est.u.toString().replace('.',',');
      lbl.textContent = 'Regla: más de '+u+' CPS → BOT (baneado); si no → humano';
      rango.setAttribute('aria-valuetext', u+' clics por segundo');
      const W=320, H=124, x = c => 14 + c/25*(W-28);
      let s = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Jugadores ordenados por clics por segundo y umbral en '+u+'">';
      s += '<rect x="'+x(est.u)+'" y="10" width="'+(x(25)-x(est.u))+'" height="70" fill="#E2203F" opacity=".14"/>';
      s += '<text x="'+(x(0)+4)+'" y="24" font-size="10" font-weight="800" style="fill:var(--gris)" '+F+'>HUMANOS</text>';
      s += '<text x="'+(W-14)+'" y="24" text-anchor="end" font-size="10" font-weight="800" style="fill:var(--err)" '+F+'>BANEADOS</text>';
      s += '<line x1="'+x(0)+'" y1="80" x2="'+x(25)+'" y2="80" style="stroke:var(--gris)" stroke-width="1.5"/>';
      for(const k of [0,5,10,15,20,25]) s += '<text x="'+x(k)+'" y="96" text-anchor="middle" font-size="10" style="fill:var(--gris)" '+F+'>'+k+'</text>';
      s += '<text x="'+(W/2)+'" y="108" text-anchor="middle" font-size="9.5" font-weight="700" style="fill:var(--gris)" '+F+'>clics por segundo (CPS)</text>';
      datos.forEach(([c,t],i)=>{
        const bien = clasifica(c) === t, cy = 44 + (i%2)*18;
        s += '<circle cx="'+x(c)+'" cy="'+cy+'" r="10" fill="'+(t==='H'?'#05428F':'#F39219')+'"/>';
        s += '<text x="'+x(c)+'" y="'+(cy+4)+'" text-anchor="middle" font-size="10" font-weight="800" fill="'+(t==='H'?'#fff':'#1D1D1B')+'" '+F+'>'+t+'</text>';
        if(!bien) s += '<circle cx="'+x(c)+'" cy="'+cy+'" r="13.5" fill="none" stroke="#E2203F" stroke-width="2.5"/>';
      });
      s += '<line x1="'+x(est.u)+'" y1="6" x2="'+x(est.u)+'" y2="84" stroke="#9225A5" stroke-width="3"/>';
      s += '<text x="'+x(0)+'" y="121" font-size="9.5" style="fill:var(--gris)" '+F+'>H = humano · B = bot · círculo rojo = la IA se equivocó</text>';
      s += '</svg>';
      graf.innerHTML = s;
      marcador.innerHTML = '<b>Aciertos</b><span style="font-size:1.2rem">'+aciertos()+' de 10</span>';
      lista.innerHTML = '';
      datos.forEach(([c,t,n])=>{
        const pred = clasifica(c), bien = pred === t;
        lista.append(el('div',{class:'jug'+(bien?'':' mal')},
          el('span',{class:'nick'},n), el('span',{class:'cps'},String(c).replace('.',',')+' CPS'),
          el('span',{class:'veredicto '+(pred==='B'?'ban':'ok')}, pred==='B' ? '⛔ BAN' : '✔ OK'),
          bien ? null : el('span',{class:'nota'}, t==='H' ? 'falso positivo' : 'bot sin detectar')));
      });
    };
    rango.oninput = ()=>{ est.u = Number(rango.value); pintar(); };
    pintar();
    cuerpo.append(el('div',{class:'control'}, lbl, rango), graf, marcador,
      el('details',{class:'extra'}, el('summary',null,'Ver el registro de jugadores'), lista),
      btnComprobar(()=>{
        const a = aciertos();
        ctx.intento(a >= 9, 'Van '+a+' de 10. Muevan la línea violeta al hueco entre los humanos y los bots.');
      }));
    return caja;
  },

  micro(q, ctx){
    const {caja, cuerpo} = marcoSim('Simulador micro:bit', q.meta);
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
    cuerpo.append(el('div',{class:'zona-placa'}, placa), el('div',{class:'control'}, lbl, rango), cod, btnComprobar(()=>{
      ctx.intento(est.x < -300, est.x > 300 ? 'Esa es la flecha hacia la derecha. Inclinen para el otro lado.' : 'Muestra un punto: falta inclinar más. Lean la condición del programa.');
    }));
    return caja;
  },

  /* Puzzle de clasificación: cada tarjeta va a una de dos columnas */
  clasificar(q, ctx){
    const {caja, cuerpo} = marcoSim(q.titulo || 'Clasificador', q.meta);
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
    cuerpo.append(el('div',{class:'clasif'}, ...filas), btnComprobar(()=>{
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
    const {caja, cuerpo} = marcoSim('Detective de tablas', q.meta);
    cuerpo.append(tablasDatos());
    const sels = T_EST.filas.map(([id,nombre,cid])=>{
      const s = el('select',{id:ctx.uid+'u'+id,'aria-label':'Curso de '+nombre}, el('option',{value:''},'¿Qué curso?'), ...T_CUR.filas.map(([cid2,n])=>el('option',{value:cid2},n)));
      s.addEventListener('change', ()=>s.parentElement.classList.remove('bien','mal'));
      return {s, nombre, cid};
    });
    const lista = el('div',{class:'clasif'}, ...sels.map(x=>el('div',{class:'clasif-fila'}, el('p',null, el('b',null,x.nombre), ' · curso_id = '+x.cid), x.s)));
    cuerpo.append(lista, btnComprobar(()=>{
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
    const {caja, cuerpo} = marcoSim('Filtro antispam', q.meta);
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
    const marcador = el('div',{class:'meta','aria-live':'polite'});
    const esSpam = t => [...elegidas].some(p=>norm(t).includes(p));
    const aciertos = ()=>MSJ.filter(([t,s])=>esSpam(t)===s).length;
    function pintar(){
      bandeja.innerHTML = '';
      MSJ.forEach(([t,s])=>{
        const pred = esSpam(t), ok = pred === s;
        bandeja.append(el('div',{class:'clasif-fila '+(ok?'bien':'mal')}, el('p',null,t),
          el('span',{class:'veredicto-spam '+(pred?'si':'no')}, pred ? '✘ Spam' : '✔ Bandeja de entrada')));
      });
      marcador.innerHTML = '<b>Aciertos</b><span style="font-size:1.2rem">'+aciertos()+' de 6</span>';
    }
    pintar();
    cuerpo.append(el('p',{style:'font-weight:700'},'Regla del filtro: es spam si tiene alguna de estas palabras'),
      el('div',{class:'tags',role:'group','aria-label':'Palabras del filtro'}, ...chips), marcador, bandeja, btnComprobar(()=>{
        const a = aciertos();
        ctx.intento(a === 6, 'Van '+a+' de 6. ¿Qué palabras aparecen solo en los mensajes tramposos y nunca en los de clase?');
      }));
    return caja;
  },

  /* Puzzle micro:bit: programar dos eventos y probarlos */
  eventos(q, ctx){
    const {caja, cuerpo} = marcoSim('Programa la micro:bit', q.meta);
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
      el('div',{class:'placa'}, leds),
      el('div',{class:'fila'}, ...EVENTOS.map(([v])=>el('button',{type:'button',class:'btn osc','data-ev':v,onclick:()=>probar(v)}, v==='agitar' ? 'Agitar' : 'Botón '+v))),
      salida, btnComprobar(()=>{
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
  const {caja, cuerpo} = marcoSim(q.titulo || 'Ordenar pasos', q.meta || null);
  const puestos = [];
  const pool = mezclar(q.pasos.map((_,i)=>i), q.pasos.length*13 + ctx.semilla.length);
  const zonaR = el('div',{class:'orden-zona',role:'group','aria-label':'Su orden'});
  const zonaP = el('div',{class:'orden-zona',role:'group','aria-label':'Pasos disponibles'});
  const comprobar = el('button',{type:'button',class:'btn',disabled:''},'Comprobar orden');
  const clsTxt = q.mono ? 'mono-paso' : '';
  const pintar = ()=>{
    zonaR.innerHTML = ''; zonaP.innerHTML = '';
    if(!puestos.length) zonaR.append(el('div',{class:'vacio'},'Toquen los pasos de abajo en orden'));
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
  cuerpo.append(el('p',{style:'font-weight:700;font-size:.9rem'},'Su orden'), zonaR, el('p',{style:'font-weight:700;font-size:.9rem'},'Pasos'), zonaP, comprobar);
  return caja;
}

/* ---------- Tocar la línea de código ---------- */
function simLinea(q, ctx){
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
  return box;
}

/* ---------- Página de isla ---------- */
let ISLA = null, CTXS = [], UI = {};

function iniciar(isla){
  ISLA = isla;
  const app = document.getElementById('app');
  document.documentElement.style.setProperty('--c', isla.color);
  document.documentElement.style.setProperty('--ct', isla.ct);
  const N = isla.preguntas.length;

  // Cabecera con el ícono del curso
  const cab = el('header',{class:'cab-est'},
    el('div',{class:'cab-fila'},
      el('div',{class:'cab-img'}, el('img',{src:'../logos-cursos/'+isla.logo, alt:'Ícono del curso '+isla.mapaCurso, width:'270', height:'259'})),
      el('div',{class:'cab-txt'},
        el('span',{class:'kick'}, isla.kick),
        el('h1',{id:'t-isla'}, isla.nombre),
        el('span',{class:'sub'}, isla.curso))),
    el('div',{class:'info-curso'},
      el('p',null,isla.info),
      el('ul',{class:'chips','aria-label':'Modalidad'}, ...isla.modalidad.map(m=>el('li',null,m)))));
  app.append(cab);

  // Barra de progreso
  UI.progTxt = el('span',{class:'prog-txt','aria-live':'polite'});
  UI.progSeg = el('div',{class:'prog-seg','aria-hidden':'true'}, ...isla.preguntas.map(()=>el('i')));
  UI.verCodigo = el('button',{type:'button',class:'btn',hidden:'',onclick:()=>irAlCodigo()},'Ver código ↓');
  app.append(el('div',{class:'progreso'}, el('div',{class:'fila'}, UI.progTxt, UI.verCodigo), UI.progSeg));

  app.append(el('p',{style:'color:var(--gris);font-size:.95rem'},
    'Resuelvan los '+N+' puzzles de esta isla. Pueden reintentar todas las veces que necesiten. Al terminar aparece el código de desbloqueo.'));

  // Puzzles
  isla.preguntas.forEach((q,i)=>{
    const ctx = {i, q, uid:'pz'+(i+1)+'-', fallos:0, resuelto:false, semilla:isla.semilla || isla.id};
    const tituloId = ctx.uid+'tit';
    ctx.estado = el('span',{class:'pz-estado'},'Pendiente');
    ctx.fb = el('div',{class:'fb','aria-live':'polite'});
    ctx.zona = el('div',{class:'pila'});
    ctx.sec = el('section',{class:'puzzle pila',id:'puzzle-'+(i+1),'aria-labelledby':tituloId},
      el('div',{class:'pz-cab'},
        el('h2',{id:tituloId}, el('span',{class:'capsula isla'}, q.etiqueta), el('span',{class:'pz-num'},'Puzzle '+(i+1)+' de '+N)),
        ctx.estado),
      el('p',{class:'enunciado'}, q.texto));
    if(q.codigo && q.tipo !== 'linea') ctx.sec.append(el('pre',{class:'codigo','aria-label':'Código del programa',html:hl(q.codigo, q.lang)}));
    if(q.pred) ctx.sec.append(anota('<b>Bitácora:</b> anoten su predicción en la bitácora antes de probar.'));
    ctx.sec.append(ctx.zona, ctx.fb);
    ctx.intento = (ok, pista) => intento(ctx, ok, pista);
    ctx.avisar = msg => avisar(ctx, msg);
    if(q.tipo === 'orden') ctx.zona.append(simOrden(q, ctx));
    else if(q.tipo === 'linea') ctx.zona.append(simLinea(q, ctx));
    else if(q.tipo === 'sim') ctx.zona.append(SIMS[q.sim](q, ctx));
    CTXS.push(ctx);
    app.append(ctx.sec);
  });

  // Caja del código de desbloqueo (cerrada hasta terminar)
  UI.caja = el('section',{class:'desbloqueo',id:'codigo','aria-labelledby':'t-codigo',tabindex:'-1'});
  app.append(UI.caja);
  pintarCandado();
  app.append(el('p',{class:'pie'},'Recurso educativo · ANEP / Ceibal · ceibal.edu.uy'));
  actualizarProgreso();
}

function pintarCandado(){
  UI.caja.className = 'desbloqueo';
  UI.caja.innerHTML = '';
  UI.caja.append(el('div',{class:'candado',html:ICONO_CANDADO}),
    el('h2',{id:'t-codigo',class:'kick'},'Código de desbloqueo'),
    el('p',{style:'font-weight:700'},'Resuelvan los '+ISLA.preguntas.length+' puzzles de la isla para ver el código.'));
}

function resueltos(){ return CTXS.filter(c=>c.resuelto).length; }
function actualizarProgreso(){
  const n = resueltos(), N = CTXS.length;
  UI.progTxt.textContent = n === N ? '¡Isla completa! '+n+' de '+N+' puzzles' : n+' de '+N+' puzzles resueltos';
  [...UI.progSeg.children].forEach((s,i)=>s.classList.toggle('hecho', CTXS[i].resuelto));
  UI.verCodigo.hidden = n !== N;
}

function intento(ctx, ok, pista){
  if(ctx.resuelto) return true;
  if(ok){ resolver(ctx); return true; }
  ctx.fallos++;
  ctx.fb.innerHTML = '';
  ctx.fb.append(el('div',{class:'feedback mal temblor'},
    el('span',{class:'capsula err'},'✘ Todavía no · intento '+ctx.fallos),
    el('p',null,pista),
    el('p',{style:'font-size:.9rem;color:var(--gris)'},'Corrijan y vuelvan a probar.')));
  return false;
}
function avisar(ctx, msg){
  if(ctx.resuelto) return;
  ctx.fb.innerHTML = '';
  ctx.fb.append(el('div',{class:'feedback aviso'}, el('span',{class:'capsula amarilla'},'Ojo'), el('p',null,msg)));
}

function resolver(ctx){
  ctx.resuelto = true;
  ctx.zona.querySelectorAll('button, input, select').forEach(x=>{ x.disabled = true; });
  ctx.estado.textContent = '✔ Resuelto'; ctx.estado.classList.add('ok');
  const todos = resueltos() === CTXS.length;
  const caja = el('div',{class:'feedback bien'},
    el('span',{class:'capsula ok'},'✔ ¡Resuelto!'),
    el('p',null,ctx.q.exp));
  if(ctx.q.pred) caja.append(anota('En la bitácora, marquen si su predicción era correcta.'));
  const pendiente = CTXS.find(c=>!c.resuelto && c.i > ctx.i) || CTXS.find(c=>!c.resuelto);
  const btn = todos
    ? el('button',{type:'button',class:'btn osc',onclick:()=>irAlCodigo()},'Ver el código de desbloqueo')
    : el('button',{type:'button',class:'btn osc',onclick:()=>{ const p = CTXS.find(c=>!c.resuelto && c.i > ctx.i) || CTXS.find(c=>!c.resuelto); if(p){ desplazar(p.sec); p.sec.querySelector('h2').setAttribute('tabindex','-1'); p.sec.querySelector('h2').focus({preventScroll:true}); } else irAlCodigo(); }},
        pendiente && pendiente.i > ctx.i ? 'Ir al siguiente puzzle' : 'Ir al puzzle pendiente');
  caja.append(btn);
  ctx.fb.innerHTML = '';
  ctx.fb.append(caja);
  btn.focus({preventScroll:true});
  actualizarProgreso();
  if(todos) completar();
}

function completar(){
  UI.caja.className = 'desbloqueo abierto aparece';
  UI.caja.innerHTML = '';
  UI.caja.append(
    el('h2',{id:'t-codigo',class:'kick'},'¡Isla completa! · Código de desbloqueo'),
    el('p',{class:'clave'}, ISLA.codigo),
    el('p',{class:'ins'},'Cierren esta ventana y díganle el código a su tutor/a para recibir el cofre'));
  try{ window.parent.postMessage({type:'cc-puzzle-complete', isla:ISLA.id, codigo:ISLA.codigo}, '*'); }catch(e){}
}
function irAlCodigo(){ desplazar(UI.caja, 'center'); UI.caja.focus({preventScroll:true}); }

window.CC = {iniciar};
})();
