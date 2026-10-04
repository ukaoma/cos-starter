import { signalFrame } from '../../../src/lib/running-orbit.js'
import { homeSessionActivity, homeActivityTitle } from '../../../src/lib/home-session-activity.js'
import { PhoneRunningMirror } from '../../../src/lib/phone-running-mirror.js'
const body = document.querySelector('#phone-body') as HTMLElement
const mirror = new PhoneRunningMirror(() => body)
const mode = document.querySelector('#state') as HTMLSelectElement
const surface = document.querySelector('#surface') as HTMLSelectElement
let phase = 0, steps = 108, refreshes = 0, replacements = 0
let priorRow: Element | null = null
function view() {
 const now=Date.now(), rows=mode.value==='idle'?[]:['claude','codex','cursor'].map(provider=>({provider,session_id:provider,running:true,running_active:true}))
 const activity=homeSessionActivity(rows,mode.value==='unknown'?now-30_000:now,now,mode.value==='offline')
 const home=surface.value==='home'
 const text=home?homeActivityTitle(activity):`${activity.signal==='unknown'?'LAST SEEN WORKING':activity.signal==='idle'?'COMPLETE':'WORKING · 3 agents'} · ${steps} steps · 8s ago`
 const rest=home?'\n73°F Overcast · Cedar Park\nNext: Family dinner · 6:30p\n\nTap=Latest ↑ Messages ↓ Menu':'Bash · Checking the latest change\nReviewing the current result and preparing\nthe next update.'
 return {text,rest,signal:home?activity.signal:mode.value==='offline'?'offline' as const:activity.signal==='idle'?'complete' as const:activity.signal,animate:activity.animate,home}
}
function refresh() {
 const v=view()
 mirror.setBody(`${v.home?'':'● '}${v.text}\n${v.rest}`,surface.value)
 document.querySelector('#status')!.textContent=v.text
 document.querySelector('#trail')!.textContent=v.rest
 document.querySelector('#head')!.textContent=v.home?'COS [S] 5:30p 10/4/26 · 73%':'↔ Sessions · Codex · 73%'
 const footer=v.home?'Sonnet · v6.10.594 · 73%':'Codex · 20m 24s · Scroll up for history'
 document.querySelector('#footer')!.textContent=footer
 document.querySelector('#phone-footer')!.textContent=footer
 const row=document.querySelector('.phone-running-row')
 if(priorRow && row!==priorRow) replacements++
 if(row) priorRow=row
 refreshes++
 document.querySelector('#proof')!.textContent=`${refreshes} text refreshes · ${replacements} row replacements after first frame`
}
function frame() {
 const v=view(),pixels=signalFrame(v.signal,v.animate?phase%8:2)
 const ctx=(document.querySelector('#mark') as HTMLCanvasElement).getContext('2d')!,im=ctx.createImageData(24,24)
 pixels.forEach((p,i)=>im.data.set([p,p,p,255],i*4));ctx.putImageData(im,0,0)
 mirror.paint({text:v.text,pixels,decorationOnly:false})
}
function reset(){mirror.clear(false);priorRow=null;replacements=0;refreshes=0;phase=0;refresh();frame()}
surface.onchange=reset;mode.onchange=()=>{refresh();frame()}
setInterval(()=>{phase++;frame()},500)
setInterval(()=>{steps++;refresh()},1000)
reset()
