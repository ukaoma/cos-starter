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
vm.runInNewContext(read('assets/ring-lessons.js'), ctx);
const hud = ctx.CosDocsHud;
const ringLessons = ctx.CosRingLessons;
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
const readerMenu = await source('src/lib/reader-action-menu.ts');
const tasks = await source('src/lib/task-menu.ts');
const queryStatus = await source('src/lib/query-status.ts');
const modelPicker = await source('src/lib/hub-model-picker.ts');
const effortPicker = await source('src/lib/hub-effort-picker.ts');
const voiceFlow = await source('src/lib/voice-prompt-flow.ts');
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
eq(f.job.body, activity.formatJobActivityWithPrompt(f.review.body,[
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

// Menus with all rows visible clamp; one-row footer menus wrap. Exercise the
// exported app functions, not their comments (one task comment is obsolete).
const l = ringLessons.lessons;
// The lesson uses the actual full-HUD picker body and footer, not the native
// context menu's alternative model rows or the text-only fallback headings.
state.pendingReference=null;state.isQueryStreaming=false;state.currentPage='model-picker';
const modelSlots=modelPicker.hubModelPickerSlots(true,false);
const effortSlots=effortPicker.hubEffortPickerSlots();
eq(JSON.stringify(ringLessons.modelRows),JSON.stringify(modelSlots.map(model.modelShortLabel)),'Available model labels');
eq(JSON.stringify(ringLessons.effortRows),JSON.stringify(effortSlots.map(effortPicker.effortShortLabel)),'Lens effort labels');
for(let i=0;i<modelSlots.length;i++){
  const view=ringLessons.picker('model',i);
  eq(view.body,modelPicker.formatHubModelPickerBody(modelSlots,i,'opus'),'Model window/cursor/current '+i);
  eq(view.footer,footer(modelPicker.hubModelPickerFooterLabel(modelSlots,i)),'Model next-message footer '+i);
  eq(view.nav,pages.composeLensNavLine('COS [O] Model','9:16 AM',now),'Model header '+i);
}
state.modelPreference='sonnet';state.currentPage='effort-picker';
for(let i=0;i<effortSlots.length;i++){
  const view=ringLessons.picker('effort',i);
  eq(view.body,effortPicker.formatHubEffortPickerBody(effortSlots,i,'high'),'Effort cursor/current '+i);
  eq(view.footer,footer(effortPicker.hubEffortPickerFooterLabel(effortSlots,i)),'Effort next-message footer '+i);
  eq(view.nav,pages.composeLensNavLine('COS [S] Effort','9:16 AM',now),'Effort header '+i);
}
state.currentPage='welcome';state.currentMsgIndex=2;
eq(l.models[10].frame.nav,pages.composeLensNavLine('COS [S]','9:16 AM',now,['3msg','2m']),'Returned Home active model');
// Keep the native attribution contract independently verified. The Docs lesson
// intentionally presents the selected model on completion, per product direction;
// this display-only override must not be mistaken for a native formatter change.
eq(f.home.footer,footer(),'Native Home still attributes the existing Opus message');
eq(l.models[10].frame.footer,model.modelShortLabel(state.modelPreference)+footer().slice('Opus'.length),'Lesson completion displays selected model, retaining native footer metadata');
eq(l.models[10].frame.body,f.home.body,'Return does not rewrite the existing Home body');
eq(modelPicker.hubModelPickerSlots(false,false).length,5,'Unavailable Cursor/Ollama are absent');
eq(modelPicker.hubModelPickerSlots(true,true).length,8,'Ready Ollama adds a slot');
for(const s of l.models){
  const rendered=hud.html(s.frame).match(/<div class="lens-text">([\s\S]*?)<\/div>/)[1];
  eq(rendered.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&gt;/g,'>'),s.frame.body,'Model lesson preserves native body characters');
}
const photoActions = readerMenu.queryResultActionsFor({hasAttachments:true,imagePreviewEnabled:true,meetingCritical:false});
for (const [step,index] of [[2,0],[3,1],[4,2],[5,2],[6,1]]) {
  eq(l.messages[step].frame.footer,readerMenu.formatQueryResultActionFooter(index,photoActions),'Reader menu selection '+step);
}
eq(readerMenu.moveQueryResultAction(2,'forward',photoActions),2,'Reader does not wrap');
eq(readerMenu.queryResultActionsFor({hasAttachments:true,imagePreviewEnabled:true,meetingCritical:true}).length,2,'No photo row during critical capture');
eq(readerMenu.queryResultActionsFor({hasAttachments:false,imagePreviewEnabled:true,meetingCritical:false}).length,2,'No photo row without attachment');
const taskActions = tasks.taskMenuActions(ringLessons.taskFixture);
eq(JSON.stringify(taskActions.map(a=>a.label)),JSON.stringify(ringLessons.taskRows),'Task rows follow this fixture state');
eq(ringLessons.task.body,pages.formatTaskDetailBody(ringLessons.taskFixture),'Task body');
for (const [step,index] of [[2,0],[3,1],[4,2],[5,3],[6,4],[7,5],[8,0]]) {
  eq(l.tasks[step].frame.footer,tasks.buildTaskMenuFooter(taskActions,index),'Task menu '+step);
  eq(l.tasks[step].frame.body,ringLessons.task.body,'Task action preserves body '+step);
}
eq(tasks.moveTaskMenuAction(5,'forward',taskActions),0,'Task last to first');
eq(tasks.moveTaskMenuAction(0,'back',taskActions),5,'Task first to last');
const sessionActions = ringLessons.sessionRows.map(label=>({label,enabled:true}));
for (const [step,index] of [[2,0],[3,1],[4,2],[5,3],[6,0]]) {
  eq(l.sessions[step].frame.footer,session.buildSessionThreadMenuFooter(sessionActions,index),'Session menu '+step);
  eq(l.sessions[step].frame.body,f.session.body,'Session action preserves body '+step);
}
eq(session.moveSessionThreadAction(3,'forward',sessionActions),0,'Session last to first');
eq(session.moveSessionThreadAction(0,'back',sessionActions),3,'Session first to last');
eq(l.ask[9].frame.footer,queryStatus.cancelArmFooterPrompt(),'Cancellation arm copy');
eq(l.ask[2].frame.body,prompt.buildPromptLiveBody('','recording'),'Fresh Ask has no reference');
eq(l.ask[3].before.body,prompt.buildPromptLiveBody(ringLessons.askTranscript,'recording'),'Finish starts from captured words');
eq(l.ask[3].frame.body,ringLessons.askTranscript,'Review preserves the captured words');
eq(l.ask[4].frame.body,l.ask[3].frame.body,'Double-tap preserves the reviewed draft');
eq(l.messages[7].frame.body,l.messages[8].frame.body,'Confirmed Reply and express Reply reference same message');

// Execute the real confirmation renderer with a capture-only viewport, never
// import the app entry point or connect a microphone. Derive nav/footer using
// the actual formatter functions instead of inventing REVIEW chrome.
const mainText=fs.readFileSync(path.join(app,'src/main.ts'),'utf8');
const mainAst=ts.createSourceFile('main.ts',mainText,ts.ScriptTarget.Latest,true);
const confirmFn=mainAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='showVoicePromptConfirmation');
const headerFn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='glassesHeader');
assert.ok(confirmFn && headerFn,'Native confirmation and nav formatters must exist');
state.modelPreference='opus';state.currentPage='voice-prompt';state.isQueryStreaming=false;
state.micEnabled=false;state.voiceDraftChunkIndex=0;state.queuePromptReviewTarget=null;
const headerContext={state,Date:SampleDate,exports:{},...model,...pages,...meeting};
vm.runInNewContext(ts.transpileModule(headerFn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,headerContext);
const confirmContext={state,exports:{},...voiceFlow,pushVoicePromptViewport:(_bridge,title,body,position)=>{
  state.currentMsgCounter=position;confirmContext.result={title,body,position};
}};
vm.runInNewContext(ts.transpileModule(confirmFn.getText(mainAst),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,confirmContext);
for(const [view,pending] of [[f.review,null],[f.replyReview,ref]]){
  state.pendingReference=pending;state.voiceDraftChunks=[];state.voiceDraftText=view.body;state.voiceDraftChunkIndex=0;
  await confirmContext.showVoicePromptConfirmation(null);
  eq(confirmContext.result.title,'REVIEW','Native prompt confirmation title');
  eq(view.body,confirmContext.result.body,'Native confirmation displays exact transcript');
  eq(view.footer,footer(confirmContext.result.position),'Native review footer and reference');
  eq(view.nav,headerContext.glassesHeader(),'Native review nav, no microphone meter');
  eq(state.voicePromptPhase,'confirming','Review is not a running query');
}
state.pendingReference=null;
const voiceActions=voiceFlow.voicePromptReviewActions(false,'cos');
for(const [stepIndex,cursor] of [[5,2],[6,3],[7,2]]){
  const view=l.ask[stepIndex].frame;
  eq(view.body,voiceFlow.buildVoiceReviewMenuBody(voiceActions,cursor,false,'opus'),'Native review choices '+cursor);
  eq(view.footer,footer(voiceFlow.buildVoiceReviewMenuFooter()),'Native review-options footer');
  state.currentMsgCounter=voiceFlow.buildVoiceReviewMenuFooter();
  eq(view.nav,headerContext.glassesHeader(),'Native review-options nav');
  assert.ok(view.body.split('\n').length<=voiceFlow.VOICE_REVIEW_MENU_MAX_BODY_LINES,'Review menu stays within firmware line budget');checks++;
}
eq(voiceFlow.defaultVoicePromptReviewActionIndex(false,'cos'),2,'Review defaults to Send original');
eq(l.messages[0].before,f.selected,'Message-opening tap starts from selected list');
eq(l.messages[9].frame,f.replyReview,'Message lesson finishes on referenced review');

// Evaluate only the actual isolated routing function with harmless spies. No
// Main import, no bridge, no microphone, no server, and no app state writes.
const gestures = fs.readFileSync(path.join(app,'src/gesture-handlers.ts'),'utf8');
const gestureAst = ts.createSourceFile('gestures.ts',gestures,ts.ScriptTarget.Latest,true);
const routeFn = gestureAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='handleNonHomeDoubleTap');
assert.ok(routeFn,'Actual context routing must exist');
const routeContext = {state:{}, logEvent:()=>{}, resetQueryResultActionMenuState:()=>{}, clearQueryResultActionMenu:()=>{},
  showQuickActions:()=>routeContext.result='hub',replyToCurrentMessage:()=>routeContext.result='reply',showQueryList:()=>{},
  startPromptRecording:()=>routeContext.result='record',confirmDoubleTapReturnToHub:()=>routeContext.result='confirm-hub'};
vm.runInNewContext(ts.transpileModule(routeFn.getText(gestureAst),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,routeContext);
for (const [page,expected] of [['query-list','hub'],['query-result','reply'],['quick-actions','record'],['task-detail','hub'],['session-detail','confirm-hub'],['voice-prompt','none']]) {
  routeContext.state={currentPage:page,pendingReadyMessageNo:null,isQueryStreaming:false};routeContext.result='none';
  await routeContext.handleNonHomeDoubleTap({});eq(routeContext.result,expected,'Native double-tap: '+page);
}

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
const documentedApp = html.match(/Covers COS Glasses (\d+\.\d+\.\d+)/)?.[1];
assert.ok(documentedApp, 'The published app coverage label must exist');
eq(f.home.body.split('\n')[0], 'Chief of Staff v'+documentedApp, 'HUD fixture follows the documented release, not the audited development source');
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (!/\bsrc=|application\/ld\+json/.test(match[1])) new vm.Script(match[2]);
}
for (const file of ['assets/docs-hud.js','assets/ring-3d.js','assets/ring-lessons.js']) new vm.Script(read(file));
checks++;
for (const match of html.matchAll(/<div\b[^>]*data-hud="([^"]+)"[^>]*>/g)) {
  const tags = /<\/?div\b[^>]*>/g; tags.lastIndex=match.index; let depth=0, end;
  for (let tag; (tag=tags.exec(html));) { depth += tag[0].startsWith('</') ? -1 : 1; if (!depth) {end=tag.index;break;} }
  eq(html.slice(match.index+match[0].length,end),hud.html(match[1]), `${match[1]} no-JS fallback`);
}
eq(hud.ringFrames.length,9,'Nine gesture states including prompt review');
eq([...html.matchAll(/data-rp-step="\d+"/g)].length,9,'Nine matching walkthrough steps');
eq([...html.matchAll(/data-ring-lesson="[^"]+"/g)].length,5,'Five reusable context lessons');
assert.ok(!html.includes('data-session-deck'),'Desktop session deck is not a glasses lesson');checks++;
assert.ok(!html.includes('data-story="choice"'),'Sessions uses the shared ring, not an independent autoplay HUD');checks++;
const sessionsSection=html.match(/<section[^>]+id="sessions">([\s\S]*?)<\/section>/)?.[1];
assert.ok(sessionsSection?.includes('data-ring-lesson="sessions"'),'Sessions owns its top-level ring lesson');checks++;
eq([...html.matchAll(/href="#sessions">Sessions<\/a>/g)].length,2,'Desktop and mobile navigation expose Sessions');
assert.ok(!html.includes('double-tap anywhere in the list'),'No stale list recording instruction');checks++;
assert.ok(html.includes('Task-menu wrapping requires glasses 6.9.455'),'Task wrap version is qualified');checks++;
for (const [context,steps] of Object.entries(l)) for (const step of steps) {
  assert.ok(['idle','tap','hold','swipe-up','swipe-down','double-tap'].includes(step.gesture),context+' known ring gesture');checks++;
  assert.ok(hud.html(step.frame).includes('lens-footer'),context+' valid HUD frame');checks++;
}
assert.ok(!hud.html({nav:'<img>',body:'<script>',footer:'&'}).includes('<script>'),'Fixture text is escaped'); checks++;
globalThis.Date=NativeDate;
console.log(`PASS: ${checks} Docs HUD source-contract checks. Browser/optical fidelity is a separate visual check.`);
