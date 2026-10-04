// Generate only the pure 24px raster data from the submitted app source.
// Run from its checkout: node --import tsx ../cos-starter/scripts/generate-docs-signals.mjs "$PWD"
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const app=path.resolve(process.argv[2]);
const ts=createRequire(path.join(app,'package.json'))('typescript');
const source=fs.readFileSync(path.join(app,'src/lib/running-orbit.ts'),'utf8');
const ast=ts.createSourceFile('signal.ts',source,ts.ScriptTarget.Latest,true);
const names=['ORBIT_SIZE','NODES','PAIRS','clamp','lineDistance','signalFrame'];
const pure=ast.statements.filter(n=>names.includes(n.name?.text)||n.declarationList?.declarations.some(d=>names.includes(d.name?.text))).map(n=>n.getText(ast)).join('\n');
const ctx={exports:{}};vm.runInNewContext(ts.transpileModule(pure,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,ctx);
const states=['working','offline','waiting','idle','complete','failed','stopped','unknown','saved','sending','saving','attention','queued','question','approval','mac'];
const data=Object.fromEntries(states.map(s=>[s,Array.from({length:8},(_,phase)=>Buffer.from(ctx.exports.signalFrame(s,phase)).toString('base64'))]));
const version=JSON.parse(fs.readFileSync(path.join(app,'package.json'),'utf8')).version;
const commit=execFileSync('git',['-C',app,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const out=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/docs-signal-data.js');
if(process.argv.includes('--check')) {
 const actual={};vm.runInNewContext(fs.readFileSync(out,'utf8'),actual);
 if(JSON.stringify(actual.CosDocsSignalData.frames)!==JSON.stringify(data))throw new Error('Native signal frames drifted');
 console.log('PASS: 128 native signal frames match source');
 process.exit(0);
}
fs.writeFileSync(out,`/* Generated from COS Glasses ${version}, ${commit}. Do not redraw by hand. */\n(function(root){'use strict';root.CosDocsSignalData=${JSON.stringify({version,size:24,frames:data})};})(typeof window==='undefined'?globalThis:window);\n`);
console.log('Generated native 24px frames for '+version+' ('+fs.statSync(out).size+' bytes)');
