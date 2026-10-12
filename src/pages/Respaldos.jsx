import { useState } from 'react';
import { KEY, PREVIOUS, recover, read, save, backup, parseBackup, merge } from '../storage';
function download(text, name) {
 const url = URL.createObjectURL(new Blob([text], {type:'application/json'}));
 const a = document.createElement('a'); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function Respaldos() {
 const [message,setMessage]=useState(''), [candidate,setCandidate]=useState(null);
 const [mode,setMode]=useState('merge');
 function run(action) { try { action(); } catch(e) { setMessage(e.message); } }
 async function select(e) {
  setCandidate(null); setMessage(''); const file=e.target.files?.[0]; if(!file)return;
  try { if(file.size>20*1024*1024)throw new Error('Respaldo mayor de 20 MB.'); const animals=parseBackup(await file.text()); setCandidate({animals,baseline:localStorage.getItem(KEY),name:file.name}); }
  catch(err){setMessage(err.message);} e.target.value='';
 }
 function apply() {
  if(localStorage.getItem(KEY)!==candidate.baseline) throw new Error('Los datos cambiaron después de la revisión. Seleccione el respaldo otra vez.');
  let current, damaged=false; try {current=read();} catch(e) {if(mode!=='replace')throw e;damaged=true;} const result=mode==='merge'?merge(current,candidate.animals):candidate.animals;
  if(!window.confirm(`¿${mode==='merge'?'Combinar':'Reemplazar'} con ${result.length} animales? Se descargará primero el respaldo actual. Guárdelo.`))return;
  download(damaged ? candidate.baseline : backup(localStorage,location.origin),'san-juan-antes-de-importar.json');
  if(damaged)recover(result,candidate.baseline);else save(result,current);setCandidate(null);setMessage('Importación guardada. Abra Animales para revisar las fichas.');
 }
 return <section className="contenedor seccion"><h2>Respaldos y recuperación</h2>
 <p>Los registros se guardan en este navegador y en este origen: <strong>{location.origin}</strong>. No se sincronizan. Antes de cambiar dominio, equipo o navegador, exporte aquí e importe el archivo en el destino. Una lista vacía en otro origen no significa que se borraron sus fichas.</p>
 <div className="acciones-centro"><button onClick={()=>run(()=>{download(backup(localStorage,location.origin),'san-juan-respaldo.json');setMessage('Archivo preparado. Conserve una copia fuera de este equipo.');})}>Exportar respaldo</button>
 <button onClick={()=>run(()=>download(localStorage.getItem(KEY)??'null','san-juan-original.json'))}>Exportar contenido original</button></div>
 <label>Seleccionar respaldo JSON (máximo 20 MB)<input type="file" accept=".json,application/json" onChange={select}/></label>
 {candidate&&<div className="mensaje"><p>Archivo validado: {candidate.name}. {candidate.animals.length} animales; se conservan sus historiales, fotos y papelera.</p><label>Modo de incorporación <select value={mode} onChange={e=>setMode(e.target.value)}><option value="merge">Combinar sin sobrescribir (rechaza conflictos)</option><option value="replace">Reemplazar toda la lista</option></select></label><button onClick={()=>run(apply)}>Confirmar importación</button><button onClick={()=>setCandidate(null)}>Cancelar</button></div>}
 <h3>Última versión anterior</h3><p>Cada guardado conserva una versión anterior en este navegador. La papelera de cada ficha conserva los registros eliminados. Los archivos exportados son el respaldo duradero.</p>
 <button onClick={()=>run(()=>{const raw=localStorage.getItem(PREVIOUS);if(!raw)throw new Error('No hay versión anterior.');download(raw,'san-juan-version-anterior.json');setMessage('Versión anterior exportada. Revísela e impórtela si corresponde.');})}>Exportar versión anterior</button>
 {message&&<p role="status" className="mensaje">{message}</p>}</section>;
}
