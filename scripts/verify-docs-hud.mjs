/** Read-only source-contract QA. Run from cos-glasses-app:
 * node --import tsx /path/to/cos-starter/scripts/verify-docs-hud.mjs "$PWD"
 * Imports pure formatters only; never imports Main, state, or a device bridge.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.resolve(process.argv[2] || '../cos-glasses-app');
const source = async name => import(pathToFileURL(path.join(app, name)).href);
const read = name => fs.readFileSync(path.join(site, name), 'utf8');
const ctx = {};
vm.runInNewContext(read('assets/docs-hud.js'), ctx);
const hud = ctx.CosDocsHud;
let checks = 0;
const eq = (actual, expected, label) => { assert.equal(actual, expected, label); checks++; };
const NativeDate = Date;
const now = new NativeDate(2026, 8, 4, 9, 16);
class SampleDate extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
  static now() { return now.getTime(); }
}
globalThis.Date = SampleDate;

const pages = await source('src/lib/display-pages.ts');
const positions = await source('src/lib/message-page-footer.ts');
const chat = await source('src/lib/chat-viewport-pages.ts');
const reference = await source('src/lib/meeting-reference.ts');
const prompt = await source('src/lib/prompt-live-transcript.ts');
const headers = await source('src/lib/header-activity.ts');
const meeting = await source('src/lib/meeting-header.ts');
const session = await source('src/lib/session-thread-actions.ts');
const menu = await source('src/lib/hub-context-menu.ts');
const model = await source('shared/model-preference.ts');
const activity = await source('src/lib/job-activity.ts');
const f = hud.frames;

for (const [recording, fixture] of [[false, hud.menuIdle], [true, hud.menuRecording]]) {
  eq(JSON.stringify(fixture), JSON.stringify(['Display off', ...menu.buildHubMenu({meetingActive:recording, modelShort:'Opus'}).map(x => x.itemName), 'Brightness', 'Close']), 'Firmware/COS row order');
}
const listItems = [
  {no:412,query:'Friday pilot',timestamp:new Date(2026,8,4,9,14).getTime()},
  {no:411,query:'Design review',timestamp:new Date(2026,8,4,8,42).getTime()},
  {no:410,query:'Team brief',timestamp:new Date(2026,8,3,9).getTime()},
];
for (const [name, index] of [['messages',0],['selected',1]]) {
  eq(f[name].body, pages.formatQueryList(listItems,index).replace(/^MESSAGES\n\n?/,'').trim(), `${name} native list`);
}
eq(f.home.nav, pages.composeLensNavLine('COS [O]','9:16 AM',now,['3msg','2m']), 'Home nav');
eq(f.reader.nav, pages.composeLensNavLine('COS [O] #411 Pg 1/1','9:16 AM',now), 'Reader nav');
eq(f.session.nav, pages.composeLensNavLine('COS [O] Sess 1/3','9:16 AM',now), 'Session nav');
eq(f.job.nav, pages.composeLensNavLine('COS [O] Thinking 66s','',now,['82%']), 'Job nav');
const [question, answer] = f.reader.body.replace(/^\? /,'').split('\n─────\n→ ');
eq(f.reader.body, chat.buildChatViewportChunks({query:question,text:answer})[0], 'Reader prompt/answer formatting');
eq(f.continued.body, f.reader.body, 'Native scroll retains same body');
eq(f.continued.nav, f.reader.nav, 'Native scroll retains nav');
eq(f.continued.footer, f.reader.footer, 'Native scroll retains chunk counter');
const ref = {targetIndex:411,query:question,response:answer};
eq(f.reply.body, prompt.buildPromptLiveBody('','recording',reference.promptReferenceRecordingLine(ref)), 'Referenced voice body');
eq(f.sessionMic.body, prompt.buildPromptLiveBody('','recording'), 'Session voice has no message reference');
eq(f.reply.nav, headers.composePrefixedHeader(pages.composeLensNavLine('COS [O●] Msg Tap to finish','9:16 AM',now),'■□□□ LISTEN',40), 'Voice meter nav');
eq(f.meeting.nav, meeting.formatMeetingMeterHeader({meterSquares:'■■□□',timer:'12:08',bookmarkCount:1,batteryLevel:82}), 'Meeting REC meter');
const actions = ['Back to list','Continue','Fork','Ask COS'].map(label => ({label,enabled:true}));
eq(f.sessionMenu.footer, session.buildSessionThreadMenuFooter(actions,0), 'Session footer-only menu');
actions[1] = {label:'Continue (unavailable)',enabled:false};
eq(f.sessionRefusal.footer, session.buildSessionThreadMenuFooter(actions,1), 'Disabled menu label');
eq(f.sessionMenu.body, f.session.body, 'Menu preserves session body');
eq(f.sessionRefusal.body, f.session.body, 'Unavailable action preserves session body');
eq(f.session.body, pages.formatSessionDetailBody({provider:'claude',domain:'personal',device_id:'mac',display_label:'Friday pilot rollout',slug:'friday-pilot',duration_minutes:14,message_count:31,user_message_count:15,assistant_message_count:16,git_branch:'main',total_input_tokens:0,total_output_tokens:0,file_size_bytes:0,first_prompt:'Import owner is Dana. Rollout email drafts Thursday.'}), 'Native session body');
eq(f.job.body, activity.formatJobActivityWithPrompt('summarize the pilot thread',[
  {at:0,kind:'sent',text:'summarize the pilot thread'},
  {at:9000,kind:'tool',text:'Searching web...'},
  {at:21000,kind:'output',text:'5 results · vendor pricing'},
  {at:34000,kind:'tool',text:'Reading page...'},
  {at:65000,kind:'live',text:'The pilot is on track. Two'},
  {at:66000,kind:'live',text:'items need a decision…'},
]).join('\n'), 'Job immutable ASK and activity format');

// Extract the actual private footer formatter without loading display-manager's
// runtime imports. Its dependencies remain the app's exported pure helpers.
const requireApp = createRequire(path.join(app, 'package.json'));
const ts = requireApp('typescript');
const dm = fs.readFileSync(path.join(app,'src/display-manager.ts'),'utf8');
const ast = ts.createSourceFile('display-manager.ts',dm,ts.ScriptTarget.Latest,true);
const fn = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'buildStatusLine');
assert.ok(fn,'Native buildStatusLine must exist');
const state = {modelPreference:'opus',messages:[...listItems].reverse().map(x => ({...x,sessionId:'demo1234',modelPreference:'opus'})),currentMsgIndex:2,currentPage:'welcome',sessionId:'demo1234',lastBatteryLevel:82,chatChunks:['sample'],chatChunkIndex:0,isQueryStreaming:false};
const footerContext = {state,Date:SampleDate,...model,...positions,...reference,...chat};
vm.runInNewContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,footerContext);
const footer = footerContext.buildStatusLine;
eq(f.home.footer, footer(), 'Home status formatter');
eq(f.messages.footer, footer(positions.queryListFooterPosition(0,3,1)), 'Message list footer');
eq(f.selected.footer, footer(positions.queryListFooterPosition(1,3,1)), 'Selected message footer');
state.currentPage='query-result'; state.currentMsgIndex=1;
eq(f.reader.footer, footer(), 'Reader status formatter');
eq(f.session.footer, footer('1/3 · Tap: actions'), 'Session status formatter');
state.pendingReference=ref;
eq(f.reply.footer, footer('Tap to finish'), 'Voice reference footer');
state.pendingReference=null; state.isQueryStreaming=true; state.streamingStartTime=now.getTime()-66000;
eq(f.job.footer, footer('Running · double-tap to cancel'), 'Job elapsed footer');

// The user explicitly replaced device-coordinate styling with the Hub mockup.
// Keep all native-content assertions above; test that presentation never drops text.
const plain = markup => markup.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
for (const [name, frame] of Object.entries(f)) {
  const markup = hud.html(frame);
  eq(plain(markup.match(/<div class="lens-text">([\s\S]*?)<\/div>/)[1]), frame.body, name+' themed body retains every character');
  eq(plain(hud.footerHtml(frame.footer)), frame.footer, name+' themed footer retains every character');
}
const css = read('assets/docs-hud.css');
for (const token of ['font-family:var(--mono)', 'aspect-ratio:2/1', '.lens-hud::before', 'rgba(70,232,120,.24)', 'border-top:1px solid rgba(70,232,120,.14)', '.lens-battery{flex-shrink:0}']) {
  assert.ok(css.includes(token), 'Hub theme contract: '+token); checks++;
}

const html = read('docs/index.html');
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (!/\bsrc=|application\/ld\+json/.test(match[1])) new vm.Script(match[2]);
}
for (const file of ['assets/docs-hud.js','assets/ring-3d.js']) new vm.Script(read(file));
checks++;
for (const match of html.matchAll(/<div\b[^>]*data-hud="([^"]+)"[^>]*>/g)) {
  const tags = /<\/?div\b[^>]*>/g; tags.lastIndex=match.index; let depth=0, end;
  for (let tag; (tag=tags.exec(html));) { depth += tag[0].startsWith('</') ? -1 : 1; if (!depth) {end=tag.index;break;} }
  eq(html.slice(match.index+match[0].length,end),hud.html(match[1]), `${match[1]} no-JS fallback`);
}
eq(hud.ringFrames.length,8,'Eight gesture states');
eq([...html.matchAll(/data-rp-step="\d+"/g)].length,8,'Eight matching walkthrough steps');
assert.ok(!hud.html({nav:'<img>',body:'<script>',footer:'&'}).includes('<script>'),'Fixture text is escaped'); checks++;
globalThis.Date=NativeDate;
console.log(`PASS: ${checks} Docs HUD source-contract checks. Browser/optical fidelity is a separate visual check.`);
