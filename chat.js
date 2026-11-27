/* Support panel. Talks to the bell-to-bell-chat Worker. Do not change the request paths or bodies. */
(()=>{
var d=document,API="https://chat.belltobellstrategies.com",KEY='btb-chat',btn=d.getElementById('ask');
function $(s,root){return(root||d).querySelector(s);}
function on(n,ev,fn){n.addEventListener(ev,fn);}
if(!btn||btn.getAttribute('data-ask'))return;
btn.setAttribute('data-ask','1');
var BUSY="We're getting a lot of messages right now. Please email support@belltobellstrategies.com.";
var DOWN="Chat isn't reachable right now. Email support@belltobellstrategies.com.";
var GOT="Got it. We'll answer here, and by email if you left one.";
var STOP=' a an the of to and or for in on is it my do i you your we with at by from that this be are can how what which does did will if as so not no they them me our '.split(' ').reduce((m,w)=>{m[w]=1;return m;},{});
var SYN=[['vps','pc','computer'],['refund','cancel','money','back'],['trial','free'],['key','license','licence'],['prop','firm','evaluation','eval','funded'],['tick','data','feed'],['ninja','ninjatrader'],['tradingview','wealthcharts']];
var chat=load(),open=false,hi=0,who='',at=0,busy=false,faq=null,timer=0,sugT=0,gen=0,pin=true;
var dot=el('span','ask-dot');
dot.appendChild(el('span','ask-sr','New reply'));
dot.hidden=true;
btn.appendChild(dot);
btn.setAttribute('aria-expanded','false');
btn.setAttribute('aria-controls','ask-panel');
var backdrop=el('div','ask-backdrop');
backdrop.hidden=true;
var panel=el('div','ask-panel');
panel.id='ask-panel';
panel.hidden=true;
panel.setAttribute('role','dialog');
panel.setAttribute('aria-modal','true');
panel.setAttribute('aria-labelledby','ask-title');
panel.innerHTML=''
+'<header class="ask-head">'
+'<div class="ask-bar"><b id="ask-title">Support</b><button type="button" class="ask-x" aria-label="Close">\u00d7</button></div>'
+'<p class="ask-status"><span class="ask-live"><span class="ask-live-dot" aria-hidden="true"></span>Available 24/7</span><span class="ask-eta">Average response time: <strong>1-2 hrs.</strong></span></p>'
+'</header>'
+'<div class="ask-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Messages"><div class="ask-pad" aria-hidden="true"></div><p class="ask-empty">No messages yet. Send one and we\'ll reply here.</p></div>'
+'<div class="ask-sug" hidden></div>'
+'<form class="ask-form">'
+'<label class="ask-hp">Website<input name="website" tabindex="-1" autocomplete="off"></label>'
+'<label class="ask-email">Email (optional, so we can reply if you leave)<input type="email" name="email" maxlength="254" autocomplete="email" inputmode="email"></label>'
+'<p class="ask-email-set" hidden>We\'ll also reply by email.</p>'
+'<label class="ask-field"><span class="ask-sr">How can we help?</span><textarea name="message" maxlength="1000" placeholder="How can we help?" required></textarea></label>'
+'<button type="submit" class="btn primary">Send</button>'
+'</form>'
+'<footer class="ask-foot">'
+'<p class="ask-fine">We can\'t give trading or financial advice. Messages are kept 12 months. <a href="legal.html#privacy">Privacy policy</a></p>'
+'<button type="button" class="ask-new">Start a new message</button>'
+'<p class="ask-note" aria-live="polite"></p>'
+'</footer>';
d.body.appendChild(backdrop);
d.body.appendChild(panel);
var log=$('.ask-log',panel),empty=$('.ask-empty',panel),sug=$('.ask-sug',panel),box=$('textarea',panel);
var emailBox=$('.ask-email',panel),emailIn=$('input',emailBox),emailSet=$('.ask-email-set',panel);
var hp=$('[name=website]',panel),note=$('.ask-note',panel),form=$('form',panel),sendBtn=$('button[type=submit]',panel);
function el(t,c,x){var n=d.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n;}
function bellMark(){
var s=d.createElementNS('http://www.w3.org/2000/svg','svg');
s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');
var p=d.createElementNS('http://www.w3.org/2000/svg','path');
p.setAttribute('d','M12 1.8a1.4 1.4 0 1 1 0 2.8a1.4 1.4 0 1 1 0-2.8zM12 4.6c-3.6 0-6 2.7-6 6.2v3.9c0 .9-.4 1.7-1.1 2.3l-.9.8v1.2h16v-1.2l-.9-.8c-.7-.6-1.1-1.4-1.1-2.3v-3.9c0-3.5-2.4-6.2-6-6.2zM9.6 20.2a2.4 2.4 0 0 0 4.8 0z');
s.appendChild(p);return s;
}
function when(iso){
var t=new Date(iso);if(!iso||isNaN(t.getTime()))return '';
var time=t.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
if(t.toDateString()===(new Date()).toDateString())return time;
return t.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' \u00b7 '+time;
}
function load(){try{var v=JSON.parse(localStorage.getItem(KEY)||'');if(v&&v.id&&v.token)return v;}catch(e){}return null;}
function save(){try{if(chat)localStorage.setItem(KEY,JSON.stringify({id:chat.id,token:chat.token,last:chat.last||0,vt:chat.vt||0}));else localStorage.removeItem(KEY);}catch(e){}}
function path(){var p=location.pathname||'/';return(p.charAt(0)==='/'?p:'/'+p).slice(0,200);}
function syncEmail(){
var on=emailBox.hidden;
emailSet.hidden=!on;
if(!on)return;
var em=emailIn.value.trim();
emailSet.textContent=em?"We'll also reply at "+em+".":"We'll also reply by email.";
}
function setBusy(v){
busy=v;
sendBtn.disabled=v;
sendBtn.textContent=v?'Sending':'Send';
sendBtn.setAttribute('aria-busy',v?'true':'false');
}
function follow(){if(pin)log.scrollTop=log.scrollHeight;}
function paint(ms){
(ms||[]).forEach((m)=>{
if(!m||!(m.id>hi))return;
hi=m.id;who=m.who;if(m.who==='bell')at=Date.now();
var mine=m.who!=='bell';
var row=el('div','ask-row '+(mine?'ask-me':'ask-bell'));
if(!mine){var av=el('span','ask-avatar');av.setAttribute('aria-hidden','true');av.appendChild(bellMark());row.appendChild(av);}
var bub=el('div','ask-bubble');
bub.appendChild(el('span','ask-who',mine?'You':'Bell to Bell'));
bub.appendChild(el('p','ask-body',m.body));
var label=when(m.at);
if(label){var time=el('time','ask-time',label);time.dateTime=m.at;bub.appendChild(time);}
row.appendChild(bub);
log.appendChild(row);
});
empty.hidden=!!log.querySelector('.ask-row');
if(open&&chat){chat.last=hi;dot.hidden=true;save();}
else if(chat&&who==='bell'&&hi>(chat.last||0))dot.hidden=false;
follow();
}
function pull(){
if(!chat)return Promise.resolve();
return fetch(API+'/v1/chats/'+chat.id+'?after='+hi+(open?'&open=1':''),{headers:{Authorization:'Bearer '+chat.token}}).then((r)=>{
if(r.status===401||r.status===404){chat=null;save();return;}
if(r.ok)return r.json().then((j)=>{
paint(j.messages);
if(j.status&&j.status.email){emailBox.hidden=true;syncEmail();}
});
}).catch(()=>{});
}
function gap(){
if(d.hidden||!chat)return 0;
if(open){var age=Date.now()-at;return age<12e4?5000:age<6e5?15000:60000;}
return who==='visitor'&&chat.vt&&Date.now()-chat.vt<18e5?60000:0;
}
function arm(){clearTimeout(timer);var w=gap();if(w)timer=setTimeout(()=>{pull().then(arm);},w);}
function sheet(){d.documentElement.classList.toggle('ask-open',open&&window.matchMedia('(max-width:720px)').matches);}
function show(){
var g=++gen;
open=true;pin=true;
panel.hidden=false;backdrop.hidden=false;
btn.setAttribute('aria-expanded','true');
sheet();
requestAnimationFrame(function(){requestAnimationFrame(function(){
if(g!==gen||!open)return;
panel.classList.add('is-open');
backdrop.classList.add('is-open');
});});
box.focus();
loadFaq().then(match);
pull().then(function(){follow();arm();});
}
function shut(){
if(!open)return;
var g=++gen;
open=false;
panel.classList.remove('is-open');
backdrop.classList.remove('is-open');
btn.setAttribute('aria-expanded','false');
sheet();
var finish=function(){if(g!==gen)return;panel.hidden=true;backdrop.hidden=true;};
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
else setTimeout(finish,240);
btn.focus();
arm();
}
function focusables(){
return Array.prototype.filter.call(panel.querySelectorAll('a,button,textarea,input'),function(n){
return !n.disabled&&n.tabIndex!==-1&&!n.closest('[hidden]');
});
}
function toks(s){return String(s||'').toLowerCase().split(/[^a-z0-9]+/).filter((w)=>{return w&&!STOP[w];});}
function grow(ws){
var out=[],i,w,g,j;
for(i=0;i<ws.length;i++){
w=ws[i];
if(w==='money'&&ws[i+1]==='back'){w='refund';i++;}
g=null;
for(j=0;j<SYN.length;j++)if(SYN[j].indexOf(w)>=0)g=SYN[j];
if(g)out.push.apply(out,g);else out.push(w);
}
return out;
}
function rank(e,ts){
var q=' '+toks(e.q).join(' ')+' ',a=' '+toks(e.a).join(' ')+' ',n=0,seen={},i,t;
for(i=0;i<ts.length;i++){t=ts[i];if(seen[t])continue;seen[t]=1;n+=q.indexOf(' '+t+' ')>=0?2:a.indexOf(' '+t+' ')>=0?1:0;}
return n;
}
function showSug(list){
sug.textContent='';sug.hidden=!list.length;if(!list.length)return;
sug.appendChild(el('p','ask-sug-h','From our FAQ'));
list.forEach((e)=>{
var b=el('div'),s=e.a.indexOf('. ');
b.appendChild(el('p','',e.q));
b.appendChild(el('p','',s<0?e.a:e.a.slice(0,s+1)));
b.appendChild(el('a','','Read more')).href='faq.html#'+e.id;
sug.appendChild(b);
});
}
function match(){
var raw=box.value.trim(),scored=[],i,s;
if(raw.length<3||!faq){sug.hidden=true;sug.textContent='';return;}
var ts=grow(toks(raw));
for(i=0;i<faq.length;i++){s=rank(faq[i],ts);if(s>=2)scored.push([s,i]);}
scored.sort((a,b)=>{return b[0]-a[0]||a[1]-b[1];});
showSug(scored.slice(0,3).map((x)=>{return faq[x[1]];}));
}
function loadFaq(){if(faq)return Promise.resolve(faq);return fetch('chat-faq.json').then((r)=>{return r.json();}).then((j)=>{return faq=j||[];}).catch(()=>{return faq=[];});}
function putEmail(em){
return fetch(API+'/v1/chats/'+chat.id+'/email',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+chat.token},body:JSON.stringify({email:em})}).then((r)=>{
if(r.ok){emailBox.hidden=true;syncEmail();}
});
}
function sent(j,em,existed){
if(!chat)chat={id:j.id,token:j.token,last:0,vt:Date.now()};else chat.vt=Date.now();
at=Date.now();who='visitor';box.value='';sug.hidden=true;pin=true;
paint(j.messages);save();note.textContent=GOT;
var extra=existed&&em?putEmail(em):Promise.resolve();
if(em){emailBox.hidden=true;syncEmail();}
return extra.then(pull).then(arm);
}
function submit(e){
e.preventDefault();
var text=box.value.trim(),em=emailIn.value.trim();
if(!text||busy)return;
setBusy(true);
var headers={'Content-Type':'application/json'},url,body,existed=!!chat;
if(!chat){url='/v1/chats';body={message:text,page:path(),website:hp.value};if(em)body.email=em;}
else{url='/v1/chats/'+chat.id+'/messages';headers.Authorization='Bearer '+chat.token;body={message:text,after:hi};}
fetch(API+url,{method:'POST',headers:headers,body:JSON.stringify(body)}).then((r)=>{
if(r.status===429){note.textContent=BUSY;return;}
if(!r.ok){note.textContent=DOWN;return;}
return r.json().then((j)=>{return sent(j,em,existed);});
}).catch(()=>{note.textContent=DOWN;}).then(()=>{setBusy(false);if(open)box.focus();});
}
function reset(){
chat=null;hi=0;who='';at=0;save();
log.querySelectorAll('.ask-row').forEach((n)=>{n.remove();});
empty.hidden=false;
note.textContent='';sug.hidden=true;
emailBox.hidden=false;emailIn.value='';syncEmail();
dot.hidden=true;pin=true;box.focus();
}
on(btn,'click',(e)=>{e.preventDefault();open?shut():show();});
on($('.ask-x',panel),'click',shut);
on($('.ask-new',panel),'click',reset);
on(form,'submit',submit);
on(box,'keydown',(e)=>{
if(e.key!=='Enter'||e.shiftKey||e.isComposing||e.keyCode===229)return;
e.preventDefault();
if(!busy)form.requestSubmit();
});
on(box,'input',()=>{clearTimeout(sugT);sugT=setTimeout(match,150);});
on(log,'scroll',()=>{pin=log.scrollHeight-log.scrollTop-log.clientHeight<80;});
on(d,'keydown',(e)=>{
if(e.key==='Escape'&&open){e.preventDefault();shut();return;}
if(!open||e.key!=='Tab')return;
var list=focusables();if(!list.length)return;
var first=list[0],last=list[list.length-1];
if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus();}
else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus();}
});
on(d,'mousedown',(e)=>{if(open&&!panel.contains(e.target)&&!btn.contains(e.target))shut();});
on(d,'visibilitychange',()=>{if(d.hidden)clearTimeout(timer);else pull().then(arm);});
var peek=$('.sb-peek');
if(peek&&window.IntersectionObserver)new IntersectionObserver((es)=>{
var hit=es[0]&&es[0].isIntersecting&&es[0].intersectionRect.height>8;
if(hit)d.documentElement.style.setProperty('--ask-lift',Math.round(es[0].intersectionRect.height+12)+'px');
else d.documentElement.style.removeProperty('--ask-lift');
}).observe(peek);
var pop=$('.popup');
function syncPop(){var p=$('.popup:not([hidden])');btn.hidden=!!p;if(p)shut();}
if(pop&&window.MutationObserver)new MutationObserver(syncPop).observe(pop,{attributes:true,attributeFilter:['hidden','class']});
syncPop();
var hash=location.hash||'',fid=hash.replace(/^#/,'');
if(fid&&fid.indexOf('chat=')!==0){var det=d.getElementById(fid);if(det&&det.tagName==='DETAILS'){det.open=true;try{det.scrollIntoView({block:'start'});}catch(e){}}}
var cm=/^#chat=([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/.exec(hash);
if(cm){chat={id:cm[1],token:cm[2],last:0,vt:0};save();try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}show();}
else if(chat)pull().then(arm);
})();
