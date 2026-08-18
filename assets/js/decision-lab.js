document.addEventListener('DOMContentLoaded', ()=>{
  const task = document.querySelector('#task');
  const dataType = document.querySelector('#data-type');
  const risk = document.querySelector('#risk-level');
  const out = document.querySelector('#decision-output');
  const btn = document.querySelector('#run-decision');
  if(!btn) return;

  const toolGuide = {
    drafting: 'Use EX-MULTIS to brainstorm and draft, then review and personalize the output before sharing.',
    summarizing: 'Use EX-MULTIS with a clear purpose and source text. Ask for a short summary and then verify key details.',
    research: 'Use EX-MULTIS for initial framing or question generation, but verify claims with trusted sources.',
    teaching: 'Use EX-MULTIS to generate examples, lesson ideas, and practice materials. Keep a human check for accuracy and instructional fit.',
    workflow: 'Use EX-MULTIS to outline process steps, templates, and repetitive-task helpers. Validate against your local process.',
    analysis: 'Use EX-MULTIS for pattern spotting or first-pass reasoning, but confirm calculations, policy points, and decisions before acting.'
  };

  btn.addEventListener('click', ()=>{
    const t = task.value;
    const d = dataType.value;
    const r = risk.value;
    const verification = [];
    const cautions = [];
    let recommendation = toolGuide[t] || 'Use EX-MULTIS as a guided assistant, but keep a human in the loop.';

    if(d === 'sensitive'){
      cautions.push('Do not paste sensitive, confidential, or regulated information unless the approved institutional process explicitly allows it.');
      verification.push('Remove or de-identify protected information before using AI.');
    } else if(d === 'internal'){
      cautions.push('Treat internal information carefully and confirm you are using an approved workflow.');
      verification.push('Review output against institutional guidance and your original source.');
    } else {
      verification.push('Keep a copy of your source so you can compare the output to it.');
    }

    if(r === 'high'){
      cautions.push('High-impact use: a human decision-maker should approve the final result.');
      verification.push('Check accuracy, completeness, and fairness before using the result.');
    } else if(r === 'medium'){
      verification.push('Review for tone, missing context, and factual errors.');
    } else {
      verification.push('Quick review is still required before reuse or publication.');
    }

    const nextSteps = [
      '1. Define the outcome you want in one sentence.',
      '2. Decide what source material you can safely use.',
      '3. Use EX-MULTIS with a specific prompt and clear constraints.',
      '4. Verify the output against trusted materials.',
      '5. Make the final human decision before publishing, sending, or acting.'
    ];

    out.innerHTML = `
      <h3>Recommended approach</h3>
      <p class="highlight">${recommendation}</p>
      <div class="callout small"><strong>EX-MULTIS fit:</strong> This is a good use case for EX-MULTIS when used as a drafting, thinking, or support tool - not as the final authority.</div>
      <h4>Key cautions</h4>
      <ul>${cautions.map(x=>`<li>${x}</li>`).join('')}</ul>
      <h4>Verification steps</h4>
      <ul>${verification.map(x=>`<li>${x}</li>`).join('')}</ul>
      <h4>Suggested workflow</h4>
      <ul>${nextSteps.map(x=>`<li>${x}</li>`).join('')}</ul>
    `;
    CTC.complete('decision-lab');
    CTC.increment('decisionLabRuns');
  });
});
