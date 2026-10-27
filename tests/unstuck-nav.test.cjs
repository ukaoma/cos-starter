const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const NAV_PAGES=['index.html','ai-adoption/index.html','ai-chief-of-staff-vs-human-chief-of-staff/index.html','challenge/index.html',
  'context-engineering-vs-prompt-engineering/index.html','control/index.html','embodied-intelligence/index.html','harness/index.html','control/docs/index.html'];
const DL='https://github.com/ukaoma/cos-starter/releases/latest/download/COS-Control-macOS-arm64-latest.zip';
const control=read('control/index.html');
const prompt=(()=>{
  const m=control.match(/<pre id="unstuckPrompt">([\s\S]*?)<\/pre>/);
  assert.ok(m,'the Unstuck prompt is on /control');
  return m[1].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim();
})();
const enc=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());

test('every page that carries the homepage nav has the direct Mac download and the Unstuck entries',()=>{
  for(const p of NAV_PAGES){
    const t=read(p);
    assert.equal(t.split(`<a href="${DL}" class="cta" download>Download for Mac</a>`).length-1,1,p+' nav CTA is the direct latest download');
    assert.equal(t.split('<a href="/control/#unstuck">Update stuck?</a>').length-1,1,p+' top strip entry');
    assert.equal(t.split('<a href="/control/#unstuck">Unstuck <small>Update stuck or timed out</small></a>').length-1,1,p+' Getting Started entry');
    assert.ok(!t.includes('href="/control/#install" class="cta"'),p+' nav CTA no longer points at the install anchor');
  }
});

test('/control has the #unstuck section with the three links and a copy button',()=>{
  assert.equal(control.split('id="unstuck"').length-1,1);
  for(const k of ['claude','codex','cursor'])assert.ok(control.includes(`data-ua="${k}"`),k);
  assert.ok(control.includes('id="uaCopy"'));
  assert.ok(control.includes("'claude://code/new?q='"));
  assert.ok(control.includes("'codex://threads/new?prompt='"));
  assert.ok(control.includes("'cursor://anysphere.cursor-deeplink/prompt?text='"));
  assert.ok(control.includes("'&mode=agent'"));
});

test('the prompt is plain ASCII with no em dashes or arrows, and fits every deep link',()=>{
  assert.ok(!/[^\x00-\x7F]/.test(prompt),'ASCII only');
  assert.ok(!prompt.startsWith('/'),'Claude refuses a prompt that starts with a slash');
  const cursor='cursor://anysphere.cursor-deeplink/prompt?text='+enc(prompt)+'&mode=agent';
  assert.ok(cursor.length<9000,'Cursor drops prompts of about 10,000 characters: '+cursor.length);
  assert.ok(('claude://code/new?q='+enc(prompt)).length<14000);
  assert.ok(('codex://threads/new?prompt='+enc(prompt)).length<9000);
});

test('the prompt carries every safety step and gate',()=>{
  const must=['defaults read "/Applications/COS Control.app/Contents/Info.plist" CFBundleShortVersionString','http://127.0.0.1:3141/api/health',
    'curl -L --fail',DL,DL+'.sha256','ditto -x -k','codesign --verify --deep --strict','spctl -a -vv -t exec','Notarized Developer ID',
    'Developer ID Application: Miles Ukaoma (NV3X46LLCR)','Never use sudo','Never use pkill or killall','Never use rm -rf',
    'Never turn off Gatekeeper','Never remove the quarantine flag','Wait for my yes','osascript -e','pgrep -x "COS Control"'];
  for(const s of must)assert.ok(prompt.includes(s),'missing: '+s);
  assert.ok(!/--max-time/.test(prompt.split('Step 3')[1]||''),'the download has no time limit');
  assert.ok(prompt.indexOf('Step 2')<prompt.indexOf('Step 3')&&prompt.indexOf('Step 4')<prompt.indexOf('Step 5'),'recording check before download, verification before quit');
  assert.ok(!/\brm\b(?!\s*-rf\.)/.test(prompt.replace('Never use rm -rf.','')),'the runbook never deletes');
});
