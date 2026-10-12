import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5187','--strictPort'],{stdio:'pipe'});
let started=false;
server.stdout.on('data',async chunk=>{
 if(started || !chunk.toString().includes('Local:'))return; started=true;
 const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--disable-background-networking','--user-data-dir='+path.resolve('../edge-ganado-test'),'--window-size=390,844','--virtual-time-budget=8000','--dump-dom','http://127.0.0.1:5187/tests/browser.html']);
 let output='';browser.stdout.on('data',x=>output+=x);browser.stderr.on('data',()=>{});
 browser.on('close',()=>{fs.writeFileSync('browser-test-output.html',output);console.log(output.match(/(?:PASS|FAIL):[^<]*/)?.[0]||'NO RESULT');server.kill();process.exit(output.includes('PASS:')?0:1);});
});server.stderr.on('data',x=>process.stderr.write(x));
setTimeout(()=>{server.kill();console.error('Timeout');process.exit(1);},25000).unref();
