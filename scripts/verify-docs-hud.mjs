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
const identity = await source('src/lib/surface-identity.ts');
const chrome=(canonical,surface=null,status=null,history=false)=>identity.surfaceIdentityHeader({canonical,surface,status,history,max:40,batteryLevel:82});
const f = hud.frames;
const readingNav=await source('src/lib/reading-navigation.ts');
const meetingRows=readingNav.readingNavigationRows('live-meeting',true,true);
eq(f.meetingActions.footer,readingNav.readingNavigationFooter(meetingRows,0),'Meeting parent action');
eq(f.meetingHome.footer,readingNav.readingNavigationFooter(meetingRows,1),'Meeting Home retains capture notice');
eq(f.meetingHistory.nav,meeting.formatMeetingMeterHeader({meterSquares:'■■□□',timer:'12:08',bookmarkCount:1,batteryLevel:82,history:true}),'Meeting history header');


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
eq(f.home.nav, chrome(pages.composeLensNavLine('COS [O]','9:16a',now,['3msg','2m']),null), 'Home nav');
eq(f.reader.nav, chrome(pages.composeLensNavLine('COS [O] #411 Pg 1/1','9:16a',now),'messages'), 'Reader nav');
eq(f.session.nav, chrome(pages.composeLensNavLine('COS [O] Sess 1/3','9:16a',now),'sessions'), 'Session nav');
eq(f.job.nav, chrome(pages.composeLensNavLine('COS [O] Thinking 66s','',now,['82%']),'messages'), 'Job nav');
const [question, answer] = f.reader.body.replace(/^\? /,'').split('\n─────\n→ ');
eq(f.reader.body, chat.buildChatViewportChunks({query:question,text:answer})[0], 'Reader prompt/answer formatting');
eq(f.continued.body, f.reader.body, 'Native scroll retains same body');
eq(f.continued.nav, f.reader.nav, 'Native scroll retains nav');
eq(f.continued.footer, f.reader.footer, 'Native scroll retains chunk counter');
const ref = {targetIndex:411,query:question,response:answer};
eq(f.reply.body, prompt.buildPromptLiveBody('','recording'), 'A prompt started by Reply or double-tap has no reference line: those gestures never arm one');
eq(typeof reference.promptReferenceRecordingLine(ref), 'string', 'The Referencing line exists only for the spoken reference command');
eq(f.sessionMic.body, prompt.buildPromptLiveBody('','recording'), 'Session voice has no message reference');
// Recorder headers are checked through the current glassesHeader below.
eq(f.meeting.nav, meeting.formatMeetingMeterHeader({meterSquares:'■■□□',timer:'12:08',bookmarkCount:1,batteryLevel:82}), 'Meeting REC meter');
const actions = ['Back to list','Home','Continue','Fork','Ask COS'].map(label => ({label,enabled:true}));
eq(f.sessionMenu.footer, session.buildSessionThreadMenuFooter(actions,0), 'Session footer-only menu');
actions[2] = {label:'Continue (unavailable)',enabled:false};
eq(f.sessionRefusal.footer, session.buildSessionThreadMenuFooter(actions,2), 'Disabled menu label');
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
const jobs = await source('src/lib/job-trail-view.ts');
const jobFooter = await source('src/lib/messages-job-footer.ts');
const sessionFooter = await source('src/lib/session-trail-view.ts');
let run = jobs.emptyJobTrailRun('demo');
const input = {run,prompt:f.review.body,jobStatus:'running',toolMode:'status',now:66000};
const sending = jobs.buildJobTrailLensPages({...input,statusWord:'◌ SENDING'});
eq(f.receipt.body,sending.pages.at(-1),'Send opens the real job page before acknowledgment');
eq(f.sending.body,f.receipt.body,'Explorer and Send lesson agree');
run=jobs.applyJobTrailEntry(run,1,65000,{kind:'prose',text:'The pilot is on track. Dana owns the import. Sam is checking the rollout notes.'}).run;
const live=jobs.buildJobTrailLensPages({...input,run});
eq(f.live.body,live.pages.at(-1),'Live trail uses the native seven-row builder');
eq(f.history.body,live.pages[0],'Original ask is above live');
for (const [name,elapsed,history] of [['receipt','1s',null],['sending','1s',null],['live','1m 06s',null],['job','1m 06s',null],['history','1m 06s',{index:0,total:2,offset:1}]]) {
  eq(f[name].footer,jobFooter.messagesJobFooter({status:'running',cancelArmed:false,history,elapsed,hasAsk:true}),name+' native job footer');
}
for (const [name,index] of [['sessionLive',1],['sessionHistory',0]]) {
  eq(f[name].footer,sessionFooter.sessionTrailFooter({chunkIndex:index,liveIndex:1,total:2,sourceNote:'stream',missed:0,elapsed:'1m 06s',hasAsk:true,gestureHint:'Tap: actions  Hold: continue'}),name+' native session footer');
}
for(const name of ['sending','live','sessionLive']) {assert.ok(jobs.countLensLines(f[name].body)<=7,name+' fits seven native rows');checks++;}

// Extract the actual private footer formatter without loading display-manager's
// runtime imports. Its dependencies remain the app's exported pure helpers.
const requireApp = createRequire(path.join(app, 'package.json'));
const ts = requireApp('typescript');
const dm = fs.readFileSync(path.join(app,'src/display-manager.ts'),'utf8');
const ast = ts.createSourceFile('display-manager.ts',dm,ts.ScriptTarget.Latest,true);
const fn = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'buildStatusLine');
assert.ok(fn,'Native buildStatusLine must exist');
const state = {modelPreference:'opus',messages:[...listItems].reverse().map(x => ({...x,sessionId:'demo1234',modelPreference:'opus'})),currentMsgIndex:2,currentPage:'welcome',sessionId:'demo1234',lastBatteryLevel:82,chatChunks:['sample'],chatChunkIndex:0,isQueryStreaming:false};
const footerContext = {state,Date:SampleDate,...model,...positions,...reference,...chat,
  ...await source('src/lib/hud-session-id.ts'),...await source('src/lib/status-line-fit.ts'),
  readHudSessionIdPref:()=>false,readPromptGesture:()=> 'tap',heldBodyHintShowing:()=>false,
  STATUS_LINE_JOIN:'  ',MESSAGE_ACTIONS_HINT:'Tap: actions',REFERENCE_HOLD_HINT:'Hold: ask'};
vm.runInNewContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,footerContext);
const footer = footerContext.buildStatusLine;
eq(f.home.footer, footer(), 'Home status formatter');
eq(f.messages.footer, footer(positions.queryListFooterPosition(0,3,1)), 'Message list footer');
eq(f.selected.footer, footer(positions.queryListFooterPosition(1,3,1)), 'Selected message footer');
state.currentPage='query-result'; state.currentMsgIndex=1;
eq(f.reader.footer, footer(), 'Reader status formatter');
state.currentPage='session-detail';
eq(f.session.footer, footer('1/3 · Tap: actions'), 'Session status formatter');
state.pendingReference=null;state.currentPage='voice-prompt';
eq(f.reply.footer, footer('Tap to finish'), 'Reader-started prompt footer carries no reference');
state.pendingReference=null; state.isQueryStreaming=true; state.streamingStartTime=now.getTime()-66000;
// Job footer is verified directly with messagesJobFooter above.

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
  eq(view.nav,chrome(pages.composeLensNavLine('COS [O] Model','9:16a',now),null),'Model header '+i);
}
state.modelPreference='sonnet';state.currentPage='effort-picker';
for(let i=0;i<effortSlots.length;i++){
  const view=ringLessons.picker('effort',i);
  eq(view.body,effortPicker.formatHubEffortPickerBody(effortSlots,i,'high'),'Effort cursor/current '+i);
  eq(view.footer,footer(effortPicker.hubEffortPickerFooterLabel(effortSlots,i)),'Effort next-message footer '+i);
  eq(view.nav,chrome(pages.composeLensNavLine('COS [S] Effort','9:16a',now),null),'Effort header '+i);
}
state.currentPage='welcome';state.currentMsgIndex=2;
eq(l.models[11].frame.nav,chrome(pages.composeLensNavLine('COS [S]','9:16a',now,['3msg','2m']),null),'Returned Home active model');
// Keep the native attribution contract independently verified. The Docs lesson
// intentionally presents the selected model on completion, per product direction;
// this display-only override must not be mistaken for a native formatter change.
eq(f.home.footer,footer(),'Native Home still attributes the existing Opus message');
eq(l.models[11].frame.footer,model.modelShortLabel(state.modelPreference)+footer().slice('Opus'.length),'Lesson completion displays selected model, retaining native footer metadata');
eq(l.models[11].frame.body,f.home.body,'Return does not rewrite the existing Home body');
eq(modelPicker.hubModelPickerSlots(false,false).length,5,'Unavailable Cursor/Ollama are absent');
eq(modelPicker.hubModelPickerSlots(true,true).length,8,'Ready Ollama adds a slot');
for(const s of l.models){
  const rendered=hud.html(s.frame).match(/<div class="lens-text">([\s\S]*?)<\/div>/)[1];
  eq(rendered.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&gt;/g,'>'),s.frame.body,'Model lesson preserves native body characters');
}
const photoActions = readerMenu.queryResultActionsFor({canReference:true,hasAttachments:true,imagePreviewEnabled:true,meetingCritical:false});
for (const [step,index] of [[3,0],[4,1],[5,2],[6,3],[7,4],[8,0],[9,1],[10,2]]) {
  eq(l.messages[step].frame.footer,readerMenu.formatQueryResultActionFooter(index,photoActions),'Reader menu selection '+step);
}
eq(readerMenu.moveQueryResultAction(4,'forward',photoActions),0,'Reader wraps forward to Messages');
eq(readerMenu.moveQueryResultAction(0,'back',photoActions),4,'Reader wraps back to the last row');
eq(readerMenu.queryResultActionsFor({hasAttachments:true,imagePreviewEnabled:true,meetingCritical:true}).length,3,'No photo row during critical capture');
eq(readerMenu.queryResultActionsFor({hasAttachments:false,imagePreviewEnabled:true,meetingCritical:false}).length,3,'No photo row without attachment');
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
for (const [step,index] of [[2,0],[3,1],[4,2],[5,3],[6,4],[7,0]]) {
  eq(l.sessions[step].frame.footer,session.buildSessionThreadMenuFooter(sessionActions,index),'Session menu '+step);
  eq(l.sessions[step].frame.body,f.session.body,'Session action preserves body '+step);
}
eq(session.moveSessionThreadAction(4,'forward',sessionActions),0,'Session last to first');
eq(session.moveSessionThreadAction(0,'back',sessionActions),4,'Session first to last');
eq(l.ask[11].frame.footer,queryStatus.cancelArmFooterPrompt(),'Cancellation arm copy');
eq(l.ask[9].frame,f.receipt,'Confirming Send lands directly on its job');
eq(l.ask[10].frame,f.job,'The later Log example keeps the same job');
for(const i of [6,7,8]){eq((hud.html(l.ask[i].frame).match(/lens-bright/g)||[]).length,1,'Review menu highlights exactly one row '+i);}
eq(l.ask[3].frame.body,prompt.buildPromptLiveBody('','recording'),'Fresh Ask has no reference');
eq(l.ask[4].before.body,prompt.buildPromptLiveBody(ringLessons.askTranscript,'recording'),'Finish starts from captured words');
eq(l.ask[4].frame.body,ringLessons.askTranscript,'Review preserves the captured words');
eq(l.ask[5].frame.body,l.ask[4].frame.body,'Double-tap preserves the reviewed draft');
eq(l.messages[11].frame.body,l.messages[12].frame.body,'Confirmed Reply and express double-tap open the same microphone');
// Messages ring: both double-tap meanings stay demonstrated, in order. Idle reader:
// double-tap opens the microphone. Running reply: the first arms, the second cancels.
// Every chrome string is derived from the app, not restated.
eq(l.messages[12].gesture,'double-tap','Messages ring shows double-tap to start recording');
eq(l.messages[12].frame.body,f.reply.body,'Express double-tap opens the microphone');
eq(l.messages[13].frame.body,f.replyReview.body,'Recording finishes into the reviewable transcript');
eq(l.messages[14].gesture,'tap','Send is a deliberate single tap');
eq(l.messages[14].frame.footer,f.receipt.footer,'Reply lands on its job with history and cancel');
assert.ok(l.messages[14].frame.body.includes(f.replyReview.body),'Receipt echoes the reviewed reply');checks++;
eq(l.messages[15].gesture,'double-tap','Messages ring shows the arming double-tap');
eq(l.messages[15].frame.footer,queryStatus.cancelArmFooterPrompt(),'Messages cancel arm copy');
eq(l.messages[16].gesture,'double-tap','Messages ring shows the confirming double-tap');
const cancelSrc = fs.readFileSync(path.join(app,'src/gesture-handlers.ts'),'utf8');
assert.ok(cancelSrc.includes("setHeaderStatus(state.activeBridge, '\\u00D7 Cancelled', 'flash')"),'Native cancel flash literal');checks++;
eq(l.messages[16].frame.nav,chrome(pages.composeLensNavLine('COS [O]','9:16a',now,['3msg','2m']),null,'× Cancelled'),'Confirmed cancel flashes over the Home nav');
eq(l.messages[16].frame.body,f.home.body,'Cancel without browsing away returns Home');
eq(l.messages[16].frame.footer,f.home.footer,'Cancel clears the streaming and confirm footers');
eq(l.messages.length,17,'Messages lesson ends on the confirmed cancel');

// Execute the real confirmation renderer with a capture-only viewport, never
// import the app entry point or connect a microphone. Derive nav/footer using
// the actual formatter functions instead of inventing REVIEW chrome.
const mainText=fs.readFileSync(path.join(app,'src/main.ts'),'utf8');
const mainAst=ts.createSourceFile('main.ts',mainText,ts.ScriptTarget.Latest,true);
const confirmFn=mainAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='showVoicePromptConfirmation');
const headerFn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='glassesHeader');
assert.ok(confirmFn && headerFn,'Native confirmation and nav formatters must exist');
state.questionReclaim={answerable:[],waiting:[]};state.modelPreference='opus';state.currentPage='voice-prompt';state.isQueryStreaming=false;
state.micEnabled=false;state.voiceDraftChunkIndex=0;state.queuePromptReviewTarget=null;
const headerContext={state,Date:SampleDate,exports:{},...model,...pages,...meeting,...headers,...await source('src/lib/lens-clock.ts'),needsYouMark:()=>'',macOfflineMark:()=>'',dockedOverlayOnLens:()=>false,overlayHeaderStatus:()=>null,G2_NAV_LINE_MAX:40};
vm.runInNewContext(ts.transpileModule(headerFn.getText(ast),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,headerContext);
const confirmContext={state,exports:{},questionAnswerCaptureActive:()=>false,workNoteCaptureActive:()=>false,macLinkNow:()=> "ready",...voiceFlow,pushVoicePromptViewport:(_bridge,title,body,position)=>{
  state.currentMsgCounter=position;confirmContext.result={title,body,position};
}};
vm.runInNewContext(ts.transpileModule(confirmFn.getText(mainAst),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,confirmContext);
for(const [view,pending] of [[f.review,null],[f.replyReview,null]]){
  state.pendingReference=pending;state.voiceDraftChunks=[];state.voiceDraftText=view.body;state.voiceDraftChunkIndex=0;
  await confirmContext.showVoicePromptConfirmation(null);
  eq(confirmContext.result.title,'REVIEW','Native prompt confirmation title');
  eq(view.body,confirmContext.result.body,'Native confirmation displays exact transcript');
  eq(view.footer,footer(confirmContext.result.position),'Native review footer and reference');
  eq(view.nav,chrome(headerContext.glassesHeader(),'messages'),'Native review nav, no microphone meter');
  eq(state.voicePromptPhase,'confirming','Review is not a running query');
}
const hold = await source('src/lib/hold-where.ts');
const holdControl = hold.holdControlText({heldMs:4000,switchMs:15000,switchPlanned:true,noSwitch:null,capMs:90000});
state.currentMsgCounter=holdControl;state.micEnabled=true;state.audioPipeline={getState:()=>'recording_prompt_draft'};
eq(f.replyHold.footer,footer(holdControl),'Hold recorder shows seconds held against switch time');
eq(f.replyHold.nav,chrome(headerContext.glassesHeader(),'messages','■□□□ LISTEN'),'Hold recorder meter and current header');
state.currentMsgCounter='Tap to finish';
eq(f.reply.nav,chrome(headerContext.glassesHeader(),'messages','■□□□ LISTEN'),'Tap recorder uses the current header');
state.micEnabled=false;state.audioPipeline=null;
state.pendingReference=null;
const voiceActions=voiceFlow.voicePromptReviewActions(false,'cos');
for(const [stepIndex,cursor] of [[6,2],[7,3],[8,2]]){
  const view=l.ask[stepIndex].frame;
  eq(view.body,voiceFlow.buildVoiceReviewMenuBody(voiceActions,cursor,false,'opus'),'Native review choices '+cursor);
  eq(view.footer,footer(voiceFlow.buildVoiceReviewMenuFooter()),'Native review-options footer');
  state.currentMsgCounter=voiceFlow.buildVoiceReviewMenuFooter();
  eq(view.nav,chrome(headerContext.glassesHeader(),'messages'),'Native review-options nav');
  assert.ok(view.body.split('\n').length<=voiceFlow.VOICE_REVIEW_MENU_MAX_BODY_LINES,'Review menu stays within firmware line budget');checks++;
}
eq(voiceFlow.defaultVoicePromptReviewActionIndex(false,'cos'),2,'Review defaults to Send original');
eq(l.messages[0].frame,f.selected,'Messages lesson starts idle on the selected list');
eq(l.messages[1].before,f.selected,'Message-opening tap starts from the selected list');
eq(l.messages[13].frame,f.replyReview,'Message lesson finishes on an unsent review');

// Evaluate only the actual isolated routing function with harmless spies. No
// Main import, no bridge, no microphone, no server, and no app state writes.
const gestures = fs.readFileSync(path.join(app,'src/gesture-handlers.ts'),'utf8');
const gestureAst = ts.createSourceFile('gestures.ts',gestures,ts.ScriptTarget.Latest,true);
const routeFn = gestureAst.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='handleNonHomeDoubleTap');
assert.ok(routeFn,'Actual context routing must exist');
const routeContext = {state:{},closeArchiveChatActionMenuBeforeLeaving:async()=>{},archiveChatMenuEffects:()=>({}), logEvent:()=>{}, resetQueryResultActionMenuState:()=>{}, clearQueryResultActionMenu:()=>{},
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
eq([...html.matchAll(/data-ring-lesson="[^"]+"/g)].length,6,'Six reusable context lessons');
assert.ok(!html.includes('data-session-deck'),'Desktop session deck is not a glasses lesson');checks++;
assert.ok(!html.includes('data-story="choice"'),'Sessions uses the shared ring, not an independent autoplay HUD');checks++;
const sessionsSection=html.match(/<section[^>]+id="sessions">([\s\S]*?)<\/section>/)?.[1];
assert.ok(sessionsSection?.includes('data-ring-lesson="sessions"'),'Sessions owns its top-level ring lesson');checks++;
eq([...html.matchAll(/href="#sessions">Sessions<\/a>/g)].length,2,'Desktop and mobile navigation expose Sessions');
assert.ok(!html.includes('double-tap anywhere in the list'),'No stale list recording instruction');checks++;
assert.ok(html.includes('Task-menu wrapping requires glasses 6.9.455'),'Task wrap version is qualified');checks++;
assert.ok(html.includes('Reader-menu wrapping ships in the glasses build after 6.9.455'),'Reader wrap version is qualified');checks++;
for (const [context,steps] of Object.entries(l)) for (const step of steps) {
  assert.ok(['idle','tap','hold','swipe-up','swipe-down','double-tap'].includes(step.gesture),context+' known ring gesture');checks++;
  assert.ok(hud.html(step.frame).includes('lens-footer'),context+' valid HUD frame');checks++;
}
assert.ok(!hud.html({nav:'<img>',body:'<script>',footer:'&'}).includes('<script>'),'Fixture text is escaped'); checks++;
globalThis.Date=NativeDate;
console.log(`PASS: ${checks} Docs HUD source-contract checks. Browser/optical fidelity is a separate visual check.`);
