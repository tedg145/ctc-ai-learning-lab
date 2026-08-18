document.addEventListener('DOMContentLoaded', ()=>{
  const task = document.querySelector('#pg-task');
  const audience = document.querySelector('#pg-audience');
  const source = document.querySelector('#pg-source');
  const constraints = document.querySelector('#pg-constraints');
  const verification = document.querySelector('#pg-verification');
  const output = document.querySelector('#prompt-output');
  const btn = document.querySelector('#build-prompt');
  if(!btn) return;

  btn.addEventListener('click', ()=>{
    const parts = [];
    parts.push(`You are helping me with this task: ${task.value.trim() || '[describe the task]'}.`);
    if(audience.value.trim()) parts.push(`The intended audience is: ${audience.value.trim()}.`);
    if(source.value.trim()) parts.push(`Use the following source material or context: ${source.value.trim()}.`);
    if(constraints.value.trim()) parts.push(`Follow these constraints: ${constraints.value.trim()}.`);
    if(verification.value.trim()) parts.push(`Before finalizing, use this verification check: ${verification.value.trim()}.`);
    parts.push('If something is uncertain, say so clearly instead of guessing.');
    parts.push('Give the result in a clean, practical format I can revise quickly.');

    output.textContent = parts.join(' ');
    CTC.complete('prompt-gym');
    CTC.increment('promptGymRuns');
  });
});
