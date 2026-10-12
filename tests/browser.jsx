import React from 'react';
import {createRoot} from 'react-dom/client';
import App from '../src/App';
import {KEY,read,normalize,backup,parseBackup} from '../src/storage';
const pause=()=>new Promise(r=>setTimeout(r,100));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const click=text=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));assert(b,'Missing button '+text);b.click();};
const host=document.getElementById('root');
window.confirm=()=>true;
window.alert=message=>{throw new Error(message);};
async function test(){
 localStorage.setItem(KEY,JSON.stringify([normalize({id:'synthetic',chapeta:'TEST-001',nombre:'Sintético',tipo:'Vaca',sexo:'Hembra',pesos:[{id:'p',peso:'100',fecha:'2026-10-12'}]})]));
 let root=createRoot(host);root.render(<App/>);await pause();click('Ver animales');await pause();click('Ver ficha completa');await pause();
 click('Eliminar');await pause();assert(read()[0].pesos.length===0,'Delete failed');assert(read()[0].papelera.length===1,'Trash missing');
 root.unmount();root=createRoot(host);root.render(<App/>);await pause();click('Ver animales');await pause();click('Ver ficha completa');await pause();
 click('Restaurar registro');await pause();assert(read()[0].pesos.length===1,'Restore failed after reopen');assert(read()[0].papelera.length===0,'Trash not cleared');
 click('Editar datos del animal');await pause();const tag=document.querySelector('input[name="chapeta"]');assert(tag,'Tag editing missing');
 Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(tag,'TEST-CORRECTED');tag.dispatchEvent(new Event('input',{bubbles:true}));await pause();
 document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await pause();assert(read()[0].chapeta==='TEST-CORRECTED','Correction failed');
 assert(parseBackup(backup())[0].pesos.length===1,'Backup lost history');
 assert(document.documentElement.scrollWidth<=window.innerWidth,'Mobile overflow');
 document.getElementById('result').textContent='PASS: delete, reopen, restore, edit chapeta, backup, mobile width';
}
test().catch(e=>document.getElementById('result').textContent='FAIL: '+e.stack);
