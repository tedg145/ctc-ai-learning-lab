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
    const labels = {'/':'Home','/index.html':'Home'};
    const last = s.lastPage || '/';
    const pretty = labels[last] || last.replace(/index\.html$/,'').replace(/^\//,'').replace(/\//g,' › ') || 'Home';
    el.innerHTML = `<div class="eyebrow">Welcome back</div>
      <h3>Continue Learning</h3>
      <p>You last visited <strong>${pretty}</strong>. Pick up where you left off or return to your recommended pathway.</p>
      <div class="meta">Saved locally in this browser</div>`;
  }
  function renderPassport(){
    const root = document.querySelector('[data-passport]');
    if(!root) return;
    const progress = getProgressByTrack();
    const items = [
      ['Foundations','foundations'],['Faculty','faculty'],['Staff','staff'],['Students','students'],['Builders','builders'],['Labs','labs']
    ];
    root.innerHTML = items.map(([label,key])=>{
      const pct = Math.round((progress[key].done / progress[key].total) * 100);
      return `<div class="progress-item">
        <div class="progress-row"><span>${label}</span><span>${progress[key].done}/${progress[key].total}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
    }).join('');
    const summary = document.querySelector('[data-passport-summary]');
    if(summary){
      const totals = Object.values(progress).reduce((a,b)=>({done:a.done+b.done,total:a.total+b.total}),{done:0,total:0});
      summary.textContent = `${totals.done} of ${totals.total} learning milestones completed in this browser.`;
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
  function init(){
    setLastPage(location.pathname.replace('/mnt/data/ctc-ai-learning-lab',''));
    renderContinue();
    renderPassport();
    bindRoleButtons();
    bindSearch();
    highlightNav();
  }
  return {init, load, save, complete, setRole, increment, renderPassport};
})();

document.addEventListener('DOMContentLoaded', CTC.init);
