const CTC = (() => {
  const KEY = 'ctc_ai_learning_lab_v1';
  const defaultState = {
    role: 'faculty',
    completed: {},
    lastPage: '/',
    started: false,
    promptGymRuns: 0,
    decisionLabRuns: 0
  };
  function load(){
    try{return {...defaultState, ...(JSON.parse(localStorage.getItem(KEY))||{})};}
    catch(e){return {...defaultState};}
  }
  function save(state){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function setRole(role){ const s=load(); s.role = role; s.started=true; save(s); }
  function complete(id){ const s=load(); s.completed[id]=true; save(s); renderPassport(); }
  function setLastPage(path){ const s=load(); s.lastPage=path; save(s); }
  function increment(counter){ const s=load(); s[counter]=(s[counter]||0)+1; save(s); }
  function getProgressByTrack(){
    const s = load();
    const tracks = {
      foundations:['start-here','llm-foundations'],
      faculty:['faculty-1','faculty-2','faculty-3'],
      staff:['staff-1','staff-2','staff-3'],
      students:['students-1','students-2','students-3'],
      builders:['builders-1','builders-2','builders-3'],
      labs:['decision-lab','prompt-gym']
    };
    return Object.fromEntries(Object.entries(tracks).map(([k,arr])=>[k,{done:arr.filter(x=>s.completed[x]).length,total:arr.length}]));
  }
  function renderContinue(){
    const el = document.querySelector('[data-continue-card]');
    if(!el) return;
    const s=load();
    const labels = {
      '/':'Home','/index.html':'Home',
      '/start-here/':'Start Here','/start-here/index.html':'Start Here',
      '/foundations/':'Foundations','/foundations/index.html':'Foundations',
      '/labs/decision-lab/':'AI Decision Lab','/labs/decision-lab/index.html':'AI Decision Lab',
      '/labs/prompt-gym/':'Prompt Gym','/labs/prompt-gym/index.html':'Prompt Gym'
    };
    const last = s.lastPage || '/';
    const localPath = last.replace(/^\/ctc-ai-learning-lab\/?/,'/');
    const hasResumePage = !['/','/index.html'].includes(localPath);
    const pretty = hasResumePage ? (labels[localPath] || localPath.replace(/index\.html$/,'').replace(/^\//,'').replace(/\/$/,'').replace(/\//g,' › ')) : 'Start Here';
    const resumeHref = hasResumePage ? last : 'start-here/index.html';
    el.innerHTML = `<span class="home-feature-card__icon" aria-hidden="true">↗</span>
      <div><div class="home-kicker">Continue learning</div>
      <h3>${pretty}</h3>
      <p>${hasResumePage ? 'Pick up where you left off.' : 'Begin with a short introduction.'}</p>
      <a class="home-card-link" href="${resumeHref}">${hasResumePage ? 'Resume' : 'Begin'} →</a></div>`;
  }
  function renderPassport(){
    const root = document.querySelector('[data-passport]');
    if(!root) return;
    const progress = getProgressByTrack();
    const items = [
      ['Foundations','foundations'],['Faculty','faculty'],['Staff','staff'],['Students','students'],['Builders','builders'],['Labs','labs']
    ];
    const totals = Object.values(progress).reduce((a,b)=>({done:a.done+b.done,total:a.total+b.total}),{done:0,total:0});
    if(root.hasAttribute('data-passport-compact')){
      const pct = Math.round((totals.done / totals.total) * 100);
      root.innerHTML = `<div class="home-passport-row"><strong>${pct}%</strong><span>${totals.done} of ${totals.total} complete</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;
    } else {
    root.innerHTML = items.map(([label,key])=>{
      const pct = Math.round((progress[key].done / progress[key].total) * 100);
      return `<div class="progress-item">
        <div class="progress-row"><span>${label}</span><span>${progress[key].done}/${progress[key].total}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
    }
    const summary = document.querySelector('[data-passport-summary]');
    if(summary){
      summary.textContent = `${totals.done} of ${totals.total} milestones completed in this browser.`;
    }
  }
  function bindRoleButtons(){
    document.querySelectorAll('[data-set-role]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        setRole(btn.dataset.setRole);
        const target = btn.dataset.target || 'pathways/' + btn.dataset.setRole + '/';
        window.location.href = btn.getAttribute('href') || ('../' + target);
      });
    });
  }
  function highlightNav(){
    const path = location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a=>{
      const href = a.getAttribute('href');
      if(!href) return;
      if((href === '../' && /ctc-ai-learning-lab\/$/.test(path)) || path.endsWith(href.replace('../',''))){
        a.classList.add('active');
      }
    });
  }
  function bindSearch(){
    const searchInput = document.querySelector('[data-module-search]');
    if(!searchInput) return;
    const modules = [...document.querySelectorAll('[data-module]')];
    searchInput.addEventListener('input', ()=>{
      const q = searchInput.value.trim().toLowerCase();
      modules.forEach(m=>{
        const text = m.textContent.toLowerCase();
        m.classList.toggle('hidden', !!q && !text.includes(q));
      });
    });
  }
  function initScout(){
    if(document.querySelector('[data-scout-guide]')) return;
    const appScript = [...document.scripts].find(script=>/\/assets\/js\/app\.js(?:\?|$)/.test(script.src));
    const siteRoot = appScript ? new URL('../../',appScript.src) : new URL('./',location.href);
    let playEquationIntro = false;
    try{
      const forceIntro = new URLSearchParams(location.search).has('scout-intro');
      playEquationIntro = forceIntro || sessionStorage.getItem('ctc-scout-equation-intro-v1') !== 'seen';
      if(playEquationIntro) sessionStorage.setItem('ctc-scout-equation-intro-v1','seen');
    }catch(error){ playEquationIntro = true; }
    const routeUrl = path=>new URL(path,siteRoot).href;
    const routes = [
      {words:['teach','faculty','class','assignment','lesson','feedback'],title:'Faculty Pathway',detail:'Explore teaching, feedback, and classroom-ready uses.',path:'pathways/faculty/index.html'},
      {words:['student','study','homework','career','learn'],title:'Student Pathway',detail:'Use AI for studying, reflection, and career preparation.',path:'pathways/students/index.html'},
      {words:['staff','workflow','office','process','document'],title:'Staff Pathway',detail:'Find practical support for communication and everyday workflows.',path:'pathways/staff/index.html'},
      {words:['build','code','prototype','automation','developer'],title:'Builder Pathway',detail:'Explore structured prompting, prototypes, and workflow design.',path:'pathways/builders/index.html'},
      {words:['safe','risk','data','decision','private','sensitive'],title:'AI Decision Lab',detail:'Check whether AI fits the task and what a person must verify.',path:'labs/decision-lab/index.html'},
      {words:['prompt','write','email','draft','message'],title:'Prompt Gym',detail:'Build a stronger prompt with context, audience, constraints, and verification.',path:'labs/prompt-gym/index.html'},
      {words:['resource','guide','find','library'],title:'Resources',detail:'Browse practical guides, pathways, and learning tools.',path:'resources/index.html'},
      {words:['role','path','choose'],title:'Choose Your Path',detail:'Compare the Faculty, Staff, Student, and Builder pathways.',path:'index.html#pathways'}
    ];
    const fallback = {title:'Start Here',detail:'Begin with the essentials, then choose the path that matches your goal.',path:'start-here/index.html'};
    const guide = document.createElement('div');
    guide.className = `scout-guide scout-guide--equation${playEquationIntro ? ' is-birthing' : ''}`;
    guide.dataset.scoutGuide = '';
    guide.innerHTML = `
      <span class="scout-sr-only" id="scout-move-instructions">Drag Scout anywhere on the screen, or focus Scout and use the arrow keys to move him.</span>
      <section class="scout-panel" aria-label="Scout learning guide" aria-hidden="true" aria-live="polite">
        <div class="scout-panel__header">
          <div class="scout-panel__face" data-scout-mini-face>^‿^</div>
          <div class="scout-panel__title">Scout · AI helper<small><span class="scout-panel__dot"></span>Ready to help</small></div>
          <button class="scout-panel__reset" type="button" aria-label="Reset Scout position" title="Return Scout to the corner">↺</button>
          <button class="scout-panel__close" type="button" aria-label="Close Scout">×</button>
        </div>
        <div class="scout-messages" data-scout-messages>
          <div class="scout-message">Hi, I’m Scout! Tell me what you want to accomplish, and I’ll point you to the best place to begin.</div>
          <div class="scout-recommendation">
            <small>Suggested starting point</small>
            <strong>Start Here</strong>
            <p>A five-step introduction to AI, safe habits, and the learning tools.</p>
            <a href="${routeUrl(fallback.path)}">Open Start Here →</a>
          </div>
        </div>
        <div class="scout-choices" aria-label="Quick questions">
          <button class="scout-choice" type="button" data-scout-query="I want to write a better prompt">Write a prompt</button>
          <button class="scout-choice" type="button" data-scout-query="I need to use AI safely">Use AI safely</button>
          <button class="scout-choice" type="button" data-scout-query="Help me choose my role pathway">Choose my path</button>
          <button class="scout-choice" type="button" data-scout-query="I need a teaching resource">Find a resource</button>
        </div>
        <div class="scout-compose">
          <input type="text" aria-label="Message Scout" placeholder="What would you like to work on?">
          <button type="button" data-scout-send>Send</button>
          <p class="scout-privacy">Guided recommendations stay in this browser. Scout does not send your message to an outside service.</p>
        </div>
      </section>
      <button class="scout-launcher" type="button" aria-label="Open Scout learning guide" aria-describedby="scout-move-instructions" aria-expanded="false" title="Drag Scout to move him · click to ask for help">
        <span class="scout-launcher__label">Ask Scout <small>drag me</small></span>
        <span class="scout-birth" aria-hidden="true"><i>H(X) = −</i><i>Σ</i><i>p(x)</i><i>log₂</i><i>p(x)</i></span>
        <span class="scout-bot scout-bot--equation is-happy" aria-hidden="true">
          <span class="scout-bot__shadow"></span>
          <span class="scout-bot__ear scout-bot__ear--left"></span><span class="scout-bot__ear scout-bot__ear--right"></span>
          <span class="scout-bot__head"><span class="scout-bot__face"><i class="scout-bot__eye"></i><i class="scout-bot__eye"></i><i class="scout-bot__mouth"></i></span></span>
          <span class="scout-bot__body"><i class="scout-equation__core"></i></span><span class="scout-bot__arm scout-bot__arm--left"></span><span class="scout-bot__arm scout-bot__arm--right"></span>
          <span class="scout-equation__leg scout-equation__leg--left"></span><span class="scout-equation__leg scout-equation__leg--right"></span>
          <span class="scout-equation__nav scout-equation__nav--learn">›</span><span class="scout-equation__nav scout-equation__nav--multis">◆</span>
          <span class="scout-equation__laptop"><i class="scout-equation__screen"></i><i class="scout-equation__keys"></i></span>
        </span>
      </button>`;
    document.body.appendChild(guide);

    if(playEquationIntro) window.setTimeout(()=>guide.classList.remove('is-birthing'),3900);

    const panel = guide.querySelector('.scout-panel');
    const launcher = guide.querySelector('.scout-launcher');
    const closeButton = guide.querySelector('.scout-panel__close');
    const resetButton = guide.querySelector('.scout-panel__reset');
    const input = guide.querySelector('.scout-compose input');
    const sendButton = guide.querySelector('[data-scout-send]');
    const messages = guide.querySelector('[data-scout-messages]');
    const bot = guide.querySelector('.scout-bot');
    const miniFace = guide.querySelector('[data-scout-mini-face]');
    const positionKey = 'ctc-scout-position-v1';
    let dragState = null;
    let suppressLauncherClick = false;

    function clamp(value,min,max){
      return Math.min(Math.max(value,min),max);
    }
    function positionPanel(){
      const edge = 12;
      const gap = 12;
      const launcherRect = launcher.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;
      const preferredLeft = launcherRect.left + launcherRect.width / 2 > window.innerWidth / 2
        ? launcherRect.right - panelWidth
        : launcherRect.left;
      const left = clamp(preferredLeft,edge,Math.max(edge,window.innerWidth - panelWidth - edge));
      let top;
      if(launcherRect.top >= panelHeight + gap + edge){
        top = launcherRect.top - panelHeight - gap;
      }else if(window.innerHeight - launcherRect.bottom >= panelHeight + gap + edge){
        top = launcherRect.bottom + gap;
      }else{
        top = clamp(
          launcherRect.top + launcherRect.height / 2 - panelHeight / 2,
          edge,
          Math.max(edge,window.innerHeight - panelHeight - edge)
        );
      }
      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(top)}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }
    function setLauncherPosition(left,top){
      const edge = 8;
      const maxLeft = Math.max(edge,window.innerWidth - launcher.offsetWidth - edge);
      const maxTop = Math.max(edge,window.innerHeight - launcher.offsetHeight - edge);
      launcher.style.left = `${Math.round(clamp(left,edge,maxLeft))}px`;
      launcher.style.top = `${Math.round(clamp(top,edge,maxTop))}px`;
      launcher.style.right = 'auto';
      launcher.style.bottom = 'auto';
      positionPanel();
    }
    function saveLauncherPosition(){
      const edge = 8;
      const rect = launcher.getBoundingClientRect();
      const availableWidth = Math.max(1,window.innerWidth - launcher.offsetWidth - edge * 2);
      const availableHeight = Math.max(1,window.innerHeight - launcher.offsetHeight - edge * 2);
      const position = {
        x: clamp((rect.left - edge) / availableWidth,0,1),
        y: clamp((rect.top - edge) / availableHeight,0,1)
      };
      try{ localStorage.setItem(positionKey,JSON.stringify(position)); }catch(error){}
    }
    function restoreLauncherPosition(){
      let position = null;
      try{ position = JSON.parse(localStorage.getItem(positionKey)); }catch(error){}
      if(position && Number.isFinite(position.x) && Number.isFinite(position.y)){
        const edge = 8;
        const availableWidth = Math.max(1,window.innerWidth - launcher.offsetWidth - edge * 2);
        const availableHeight = Math.max(1,window.innerHeight - launcher.offsetHeight - edge * 2);
        setLauncherPosition(edge + clamp(position.x,0,1) * availableWidth,edge + clamp(position.y,0,1) * availableHeight);
      }else{
        positionPanel();
      }
    }
    function moveActiveDrag(clientX,clientY){
      if(!dragState) return;
      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;
      if(!dragState.moved && Math.hypot(deltaX,deltaY) < 6) return;
      dragState.moved = true;
      guide.classList.remove('is-noticing');
      setLauncherPosition(dragState.startLeft + deltaX,dragState.startTop + deltaY);
    }
    function completeDrag(){
      if(!dragState) return;
      const pointerId = dragState.pointerId;
      if(dragState.moved){
        saveLauncherPosition();
        suppressLauncherClick = true;
        window.setTimeout(()=>{ suppressLauncherClick = false; },0);
      }
      launcher.classList.remove('is-dragging');
      if(Number.isInteger(pointerId) && launcher.hasPointerCapture(pointerId)) launcher.releasePointerCapture(pointerId);
      dragState = null;
    }
    function finishDrag(event){
      if(!dragState || event.pointerId !== dragState.pointerId) return;
      completeDrag();
    }

    function setOpen(open){
      guide.classList.toggle('is-open',open);
      panel.setAttribute('aria-hidden',String(!open));
      launcher.setAttribute('aria-expanded',String(open));
      launcher.setAttribute('aria-label',open ? 'Close Scout learning guide' : 'Open Scout learning guide');
      if(open){
        window.requestAnimationFrame(positionPanel);
        window.setTimeout(()=>input.focus(),180);
      }
    }
    function setMood(mood){
      bot.classList.remove('is-happy','is-thinking','is-curious');
      bot.classList.add(mood);
      miniFace.textContent = mood === 'is-thinking' ? '•_•' : mood === 'is-curious' ? '•o•' : '^‿^';
    }
    function getRecommendation(query){
      const lower = query.toLowerCase();
      return routes.find(route=>route.words.some(word=>lower.includes(word))) || fallback;
    }
    function addRecommendation(query){
      const userMessage = document.createElement('div');
      userMessage.className = 'scout-message scout-message--user';
      userMessage.textContent = query;
      messages.appendChild(userMessage);
      messages.scrollTop = messages.scrollHeight;
      setMood('is-thinking');
      window.setTimeout(()=>{
        const match = getRecommendation(query);
        const card = document.createElement('div');
        card.className = 'scout-recommendation';
        const label = document.createElement('small');
        label.textContent = 'My recommendation';
        const title = document.createElement('strong');
        title.textContent = match.title;
        const detail = document.createElement('p');
        detail.textContent = match.detail;
        const link = document.createElement('a');
        link.href = routeUrl(match.path);
        link.textContent = `Open ${match.title} →`;
        card.append(label,title,detail,link);
        messages.appendChild(card);
        messages.scrollTop = messages.scrollHeight;
        setMood('is-happy');
      },520);
    }
    function sendTypedQuestion(){
      const query = input.value.trim();
      if(!query) return;
      addRecommendation(query);
      input.value = '';
    }

    launcher.addEventListener('pointerdown',event=>{
      if(dragState || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const rect = launcher.getBoundingClientRect();
      dragState = {
        pointerId:event.pointerId,
        startX:event.clientX,
        startY:event.clientY,
        startLeft:rect.left,
        startTop:rect.top,
        moved:false
      };
      launcher.setPointerCapture(event.pointerId);
      launcher.classList.add('is-dragging');
    });
    launcher.addEventListener('pointermove',event=>{
      if(!dragState || event.pointerId !== dragState.pointerId) return;
      moveActiveDrag(event.clientX,event.clientY);
    });
    launcher.addEventListener('pointerup',finishDrag);
    launcher.addEventListener('pointercancel',finishDrag);
    launcher.addEventListener('mousedown',event=>{
      if(event.button !== 0 || dragState) return;
      const rect = launcher.getBoundingClientRect();
      dragState = {
        pointerId:'mouse',
        startX:event.clientX,
        startY:event.clientY,
        startLeft:rect.left,
        startTop:rect.top,
        moved:false
      };
      launcher.classList.add('is-dragging');
    });
    document.addEventListener('mousemove',event=>{
      if(!dragState) return;
      moveActiveDrag(event.clientX,event.clientY);
    });
    document.addEventListener('mouseup',()=>completeDrag());
    launcher.addEventListener('click',event=>{
      if(suppressLauncherClick){
        event.preventDefault();
        return;
      }
      const open = !guide.classList.contains('is-open');
      if(open){
        guide.classList.remove('is-birthing');
        guide.classList.add('is-working');
        setMood('is-curious');
        window.setTimeout(()=>setOpen(true),420);
      }else{
        setOpen(false);
        window.setTimeout(()=>guide.classList.remove('is-working'),240);
      }
    });
    launcher.addEventListener('keydown',event=>{
      const directions = {
        ArrowLeft:[-1,0],
        ArrowRight:[1,0],
        ArrowUp:[0,-1],
        ArrowDown:[0,1]
      };
      if(!directions[event.key]) return;
      event.preventDefault();
      const [horizontal,vertical] = directions[event.key];
      const step = event.shiftKey ? 40 : 12;
      const rect = launcher.getBoundingClientRect();
      setLauncherPosition(rect.left + horizontal * step,rect.top + vertical * step);
      saveLauncherPosition();
      guide.classList.remove('is-noticing');
    });
    closeButton.addEventListener('click',()=>{
      setOpen(false);
      window.setTimeout(()=>guide.classList.remove('is-working'),240);
    });
    resetButton.addEventListener('click',()=>{
      try{ localStorage.removeItem(positionKey); }catch(error){}
      launcher.removeAttribute('style');
      window.requestAnimationFrame(positionPanel);
    });
    guide.querySelectorAll('[data-scout-query]').forEach(button=>button.addEventListener('click',()=>addRecommendation(button.dataset.scoutQuery)));
    sendButton.addEventListener('click',sendTypedQuestion);
    input.addEventListener('keydown',event=>{
      if(event.key !== 'Enter') return;
      event.preventDefault();
      sendTypedQuestion();
    });
    document.addEventListener('keydown',event=>{
      if(event.key === 'Escape' && guide.classList.contains('is-open')) setOpen(false);
    });
    window.addEventListener('resize',()=>window.requestAnimationFrame(restoreLauncherPosition));
    window.requestAnimationFrame(restoreLauncherPosition);
    window.setTimeout(()=>guide.classList.add('is-noticing'),2200);
    window.setInterval(()=>{
      if(bot.classList.contains('is-thinking')) return;
      const nextMood = bot.classList.contains('is-happy') ? 'is-curious' : 'is-happy';
      setMood(nextMood);
    },6200);
  }
  function init(){
    renderContinue();
    setLastPage(location.pathname.replace('/mnt/data/ctc-ai-learning-lab',''));
    renderPassport();
    bindRoleButtons();
    bindSearch();
    highlightNav();
    initScout();
  }
  return {init, load, save, complete, setRole, increment, renderPassport};
})();

document.addEventListener('DOMContentLoaded', CTC.init);
