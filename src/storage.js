export const KEY = 'animalesSanJuan';
export const PREVIOUS = `${KEY}:anterior`;
export const fields = ['pesos', 'salud', 'reproduccion', 'partos', 'leche'];
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export function validate(data) {
  if (!Array.isArray(data)) throw new Error('Se esperaba una lista de animales. No se modificaron los datos.');
  const ids = new Set(), tags = new Set();
  for (const a of data) {
    if (!object(a) || !['string','number'].includes(typeof a.id) || !String(a.id).trim() || typeof a.chapeta !== 'string' || !a.chapeta.trim()) throw new Error('Animal sin identificación válida.');
    const id = String(a.id), tag = a.chapeta.trim().toLowerCase();
    if (ids.has(id) || tags.has(tag)) throw new Error('Hay identificaciones o chapetas duplicadas.');
    ids.add(id); tags.add(tag);
    for (const f of fields) {
      if (a[f] !== undefined && !Array.isArray(a[f])) throw new Error(`Historial ${f} inválido.`);
      const entries = new Set();
      for (const r of a[f] || []) {
        if (!object(r) || !['string','number'].includes(typeof r.id) || !String(r.id).trim() || entries.has(String(r.id))) throw new Error(`Registro inválido o duplicado en ${f}.`);
        entries.add(String(r.id));
        for(const [key,value] of Object.entries(r)) {
          if(key !== 'id' && ['fecha','peso','observacion','tratamiento','medicamento','dosis','via','responsable','tipo','toro','resultado','cria','sexo','litros','cantidad','produccion','leche','valor'].includes(key) && !['string','number'].includes(typeof value)) throw new Error('Campo de historial inválido: '+key);
        }
      }
    }
    if (a.papelera !== undefined) {
      if(!Array.isArray(a.papelera))throw new Error('Papelera inválida.');
      for(const entry of a.papelera) {
        if(!object(entry) || !fields.includes(entry.campo) || typeof entry.eliminado !== 'string')throw new Error('Entrada de papelera inválida.');
        validate([{id:'trash-validation',chapeta:'trash-validation',[entry.campo]:[entry.registro]}]);
      }
    }
    for (const key of ['nombre','tipo','sexo','raza','colorChapeta','fechaNacimiento','madre','padre','procedencia','observaciones','foto','estado','fechaSalida','motivoSalida']) {
      if (a[key] !== undefined && typeof a[key] !== 'string') throw new Error(`Campo ${key} inválido.`);
    }
    if (a.foto && !/^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\r\n]+$/i.test(a.foto)) throw new Error('Foto no válida: use PNG, JPEG, WebP o GIF.');
  }
  return data;
}
export const normalize = a => ({...a, estado:a.estado || 'Activo', ...Object.fromEntries(fields.map(f=>[f,a[f] || []]))});
export function read(storage = localStorage) {
  const raw = storage.getItem(KEY);
  try { return validate(JSON.parse(raw ?? '[]')).map(normalize); }
  catch (e) { throw new Error(`No se pueden abrir los datos: ${e.message} Exporte el contenido original desde Respaldos antes de intentar recuperarlo.`); }
}
export function save(data, expected, storage = localStorage) {
  validate(data);
  const before = storage.getItem(KEY);
  const current = read(storage);
  if (JSON.stringify(current) !== JSON.stringify(expected)) throw new Error('Los datos cambiaron en otra pestaña. Recargue antes de guardar; conserve su corrección.');
  // Both writes must succeed. A failed checkpoint prevents modifying the main key.
  const checkpoint=storage.getItem(PREVIOUS);
  if (before !== null) storage.setItem(PREVIOUS, before);
  try { storage.setItem(KEY, JSON.stringify(data)); }
  catch(error) { try {if(checkpoint===null)storage.removeItem(PREVIOUS);else storage.setItem(PREVIOUS,checkpoint);}catch { /* Main data remains intact; report the failure. */ } throw error; }
  return data;
}
export function backup(storage = localStorage, origin = '') {
  return JSON.stringify({format:'ganado-san-juan',version:1,createdAt:new Date().toISOString(),origin,animales:read(storage)}, null, 2);
}
export function parseBackup(text) {
  if (text.length > 20 * 1024 * 1024) throw new Error('Respaldo mayor de 20 MB.');
  const value = JSON.parse(text);
  if (Array.isArray(value)) return validate(value).map(normalize);
  if (!object(value) || value.format !== 'ganado-san-juan' || value.version !== 1) throw new Error('Formato o versión de respaldo no compatible.');
  return validate(value.animales).map(normalize);
}
export function merge(current, incoming) {
  const result = [...current];
  for (const a of incoming) {
    const match = current.find(b => String(b.id) === String(a.id) || b.chapeta.trim().toLowerCase() === a.chapeta.trim().toLowerCase());
    if (match) { if (JSON.stringify(match) !== JSON.stringify(a)) throw new Error(`Conflicto en chapeta ${a.chapeta}. Corrija el archivo antes de importar.`); }
    else result.push(a);
  }
  return validate(result);
}

export function recover(data, expectedRaw, storage = localStorage) {
 validate(data);
 if(storage.getItem(KEY)!==expectedRaw)throw new Error('Los datos cambiaron. Revise el respaldo otra vez.');
 const checkpoint=storage.getItem(PREVIOUS);
 if(expectedRaw!==null)storage.setItem(PREVIOUS,expectedRaw);
 try {storage.setItem(KEY,JSON.stringify(data));}
 catch(error){try {if(checkpoint===null)storage.removeItem(PREVIOUS);else storage.setItem(PREVIOUS,checkpoint);}catch {} throw error;}
}
