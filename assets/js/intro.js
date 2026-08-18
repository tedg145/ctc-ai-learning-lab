(() => {
  const intro = document.querySelector('[data-lab-intro]');
  if (!intro) return;

  const canvas = intro.querySelector('[data-intro-canvas]');
  const context = canvas.getContext('2d', { alpha: true });
  const enterButton = intro.querySelector('[data-enter-lab]');
  const replayButton = document.querySelector('[data-replay-intro]');
  const menu = document.querySelector('#lab-menu');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SESSION_KEY = 'ctc_ai_lab_intro_entered_v1';
  const pageRegions = [document.querySelector('.topbar'), document.querySelector('main'), document.querySelector('.footer')].filter(Boolean);

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let running = false;
  let previousTime = 0;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const particles = [];
  const streams = [];

  const palette = {
    cyan: '39, 215, 255',
    blue: '63, 140, 255',
    orange: '255, 156, 42',
    violet: '177, 115, 255'
  };

  function sessionHasEntered() {
    try { return sessionStorage.getItem(SESSION_KEY) === 'true'; }
    catch (error) { return false; }
  }

  function rememberEntry(value) {
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, 'true');
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // The intro remains functional when browser storage is unavailable.
    }
  }

  function setPageInert(value) {
    pageRegions.forEach((region) => {
      if (value) region.setAttribute('inert', '');
      else region.removeAttribute('inert');
    });
  }

  function seedScene() {
    const radius = Math.hypot(width, height) * 0.56;
    particles.length = 0;
    streams.length = 0;

    for (let index = 0; index < 96; index += 1) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random(),
        speed: 0.035 + Math.random() * 0.11,
        drift: (Math.random() - 0.5) * 0.18,
        size: 0.7 + Math.random() * 2.3,
        alpha: 0.2 + Math.random() * 0.7,
        radius,
        color: Math.random() > 0.72 ? palette.orange : (Math.random() > 0.82 ? palette.violet : palette.cyan)
      });
    }

    for (let index = 0; index < 22; index += 1) {
      streams.push({
        angle: (index / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.22,
        twist: 1.1 + Math.random() * 1.8,
        speed: 0.000045 + Math.random() * 0.00008,
        width: 0.35 + Math.random() * 1.1,
        alpha: 0.12 + Math.random() * 0.28,
        offset: Math.random() * 900,
        color: index % 5 === 0 ? palette.orange : (index % 7 === 0 ? palette.violet : palette.cyan)
      });
    }
  }

  function resizeCanvas() {
    const bounds = intro.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    seedScene();
    drawFrame(performance.now(), true);
  }

  function drawStream(stream, time, centerX, centerY, maxRadius) {
    const points = 72;
    context.beginPath();
    for (let index = 0; index <= points; index += 1) {
      const progress = index / points;
      const radius = maxRadius * (1 - progress * 0.94);
      const spiral = stream.angle + progress * stream.twist + time * stream.speed;
      const x = centerX + Math.cos(spiral) * radius;
      const y = centerY + Math.sin(spiral) * radius * 0.56;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = `rgba(${stream.color}, ${stream.alpha})`;
    context.lineWidth = stream.width;
    context.setLineDash([2, 13]);
    context.lineDashOffset = -(time * 0.035 + stream.offset);
    context.stroke();
  }

  function drawParticle(particle, delta, time, centerX, centerY) {
    if (!reducedMotion.matches) {
      particle.distance += delta * particle.speed;
      if (particle.distance > 1) particle.distance -= 1;
    }

    const inward = 1 - particle.distance;
    const radius = particle.radius * inward;
    const angle = particle.angle + time * 0.00006 + particle.distance * 1.25 + particle.drift;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.56;
    const glow = context.createRadialGradient(x, y, 0, x, y, particle.size * 5);
    glow.addColorStop(0, `rgba(${particle.color}, ${particle.alpha})`);
    glow.addColorStop(1, `rgba(${particle.color}, 0)`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, particle.size * 5, 0, Math.PI * 2);
    context.fill();
  }

  function drawCore(time, centerX, centerY) {
    const pulse = reducedMotion.matches ? 1 : 1 + Math.sin(time * 0.0024) * 0.08;
    const radius = Math.min(width, height) * 0.115 * pulse;
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2.2);
    glow.addColorStop(0, 'rgba(255,255,255,.96)');
    glow.addColorStop(0.08, 'rgba(39,215,255,.9)');
    glow.addColorStop(0.36, 'rgba(63,140,255,.28)');
    glow.addColorStop(1, 'rgba(7,17,31,0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, radius * 2.2, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(centerX, centerY);
    context.rotate(reducedMotion.matches ? 0 : time * 0.00011);
    for (let ring = 0; ring < 3; ring += 1) {
      const sides = 6;
      const ringRadius = radius * (0.38 + ring * 0.28);
      context.beginPath();
      for (let side = 0; side <= sides; side += 1) {
        const angle = (side / sides) * Math.PI * 2 + ring * 0.18;
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;
        if (side === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = `rgba(${ring === 2 ? palette.orange : palette.cyan}, ${0.62 - ring * 0.12})`;
      context.lineWidth = 1.2;
      context.setLineDash([]);
      context.stroke();
    }
    context.restore();
  }

  function drawFrame(time, forceOpaque = false) {
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = forceOpaque ? '#030a16' : 'rgba(3, 10, 22, .24)';
    context.fillRect(0, 0, width, height);

    const centerX = width * 0.5 + pointer.x * 32;
    const centerY = height * 0.61 + pointer.y * 20;
    const maxRadius = Math.hypot(width, height) * 0.58;

    context.globalCompositeOperation = 'lighter';
    streams.forEach((stream) => drawStream(stream, time, centerX, centerY, maxRadius));
    particles.forEach((particle) => drawParticle(particle, delta, time, centerX, centerY));
    drawCore(time, centerX, centerY);
    context.globalCompositeOperation = 'source-over';

    if (running && !reducedMotion.matches) animationFrame = requestAnimationFrame(drawFrame);
  }

  function startMotion() {
    cancelAnimationFrame(animationFrame);
    previousTime = 0;
    if (reducedMotion.matches) {
      running = false;
      drawFrame(performance.now(), true);
      return;
    }
    running = true;
    animationFrame = requestAnimationFrame(drawFrame);
  }

  function stopMotion() {
    running = false;
    cancelAnimationFrame(animationFrame);
  }

  function showIntro() {
    rememberEntry(false);
    intro.hidden = false;
    intro.classList.remove('is-leaving');
    document.body.classList.add('intro-active');
    setPageInert(true);
    resizeCanvas();
    startMotion();
    window.setTimeout(() => enterButton.focus({ preventScroll: true }), 80);
  }

  function hideIntro({ instant = false, moveToMenu = false } = {}) {
    rememberEntry(true);
    setPageInert(false);
    document.body.classList.remove('intro-active');
    intro.classList.add('is-leaving');

    const finish = () => {
      stopMotion();
      intro.hidden = true;
      intro.classList.remove('is-leaving');
      if (moveToMenu && menu) {
        menu.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        menu.focus({ preventScroll: true });
      }
    };

    if (instant || reducedMotion.matches) finish();
    else window.setTimeout(finish, 900);
  }

  enterButton.addEventListener('click', (event) => {
    event.preventDefault();
    hideIntro({ moveToMenu: true });
  });

  replayButton?.addEventListener('click', showIntro);

  intro.addEventListener('pointermove', (event) => {
    pointer.targetX = (event.clientX / Math.max(width, 1) - 0.5) * 2;
    pointer.targetY = (event.clientY / Math.max(height, 1) - 0.5) * 2;
    intro.style.setProperty('--pointer-x', `${pointer.targetX * 12}px`);
    intro.style.setProperty('--pointer-y', `${pointer.targetY * 8}px`);
  });

  intro.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    intro.style.setProperty('--pointer-x', '0px');
    intro.style.setProperty('--pointer-y', '0px');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !intro.hidden) hideIntro({ moveToMenu: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopMotion();
    else if (!intro.hidden) startMotion();
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  reducedMotion.addEventListener?.('change', startMotion);

  if (sessionHasEntered()) hideIntro({ instant: true });
  else showIntro();
})();
