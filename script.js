(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer = null;
  let toastTimer;

  function showToast(message) {
    const toast = $('.toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  let endEntry = null;
  function startEntry() {
    if (reducedMotion.matches || location.hash) return;
    try {
      if (sessionStorage.getItem('swp-entry-seen')) return;
      sessionStorage.setItem('swp-entry-seen', '1');
    } catch { /* The entry can still be skipped with storage disabled. */ }
    const gate = $('#entry-gate');
    const backgrounds = $$('#main, .site-header, .site-footer, .back-top');
    gate.hidden = false;
    gate.classList.remove('leaving');
    document.body.classList.add('gate-open');
    backgrounds.forEach(element => { element.inert = true; });
    gate.tabIndex = -1;
    gate.focus({ preventScroll: true });
    const progress = $('#entry-progress');
    const percentage = $('#entry-percentage');
    const status = $('#entry-status');
    let ready = 0;
    let fontsReady = !document.fonts;
    let displayed = 0;
    let frame = 0;
    let finishTimer = 0;
    const deadline = setTimeout(() => finish(), 2400);
    const began = performance.now();
    const duration = 1150;
    const assets = $$('.project-cover img').slice(0, 3);
    assets.forEach(cover => {
      const image = new Image();
      let settled = false;
      const settle = () => { if (!settled) { settled = true; ready++; } };
      image.onload = settle;
      image.onerror = settle;
      image.src = cover.src;
      setTimeout(settle, 1600);
    });
    document.fonts?.ready.then(() => { fontsReady = true; });
    function finish(skipped = false) {
      if (!endEntry) return;
      endEntry = null;
      cancelAnimationFrame(frame);
      clearTimeout(finishTimer);
      clearTimeout(deadline);
      percentage.textContent = '100';
      progress.setAttribute('aria-valuenow', '100');
      $('span', progress).style.width = '100%';
      status.textContent = skipped ? '开始浏览' : '加载完成';
      gate.classList.add('leaving');
      document.body.classList.remove('gate-open');
      backgrounds.forEach(element => { element.inert = false; });
      setTimeout(() => {
        const hadFocus = gate.contains(document.activeElement);
        gate.hidden = true;
        gate.classList.remove('leaving');
        if (hadFocus) $('#hero-title').focus({ preventScroll: true });
        renderer?.redraw();
      }, reducedMotion.matches ? 20 : 430);
    }
    endEntry = () => finish(true);
    function tick(now) {
      if (!endEntry) return;
      const visualProgress = Math.min(1, (now - began) / duration);
      // The resource share tracks real local assets; the final share tracks the entrance sequence.
      const target = 55 * ready / assets.length + (fontsReady ? 10 : 0) + 15 + 20 * visualProgress;
      displayed = Math.min(target, displayed + (target - displayed) * 0.08 + 0.1);
      const number = displayed > 99.4 && target >= 100 ? 100 : Math.min(99, Math.floor(displayed));
      percentage.textContent = String(number).padStart(2, '0');
      progress.setAttribute('aria-valuenow', String(number));
      $('span', progress).style.width = displayed + '%';
      status.textContent = number < 35 ? '加载页面' : number < 75 ? '准备内容' : number < 100 ? '即将就绪' : '加载完成';
      if (number === 100) finishTimer = setTimeout(() => finish(), 110);
      else frame = requestAnimationFrame(tick);
    }
    progress.setAttribute('aria-valuenow', '0');
    $('span', progress).style.width = '0%';
    percentage.textContent = '00';
    status.textContent = '载入视觉资源';
    frame = requestAnimationFrame(tick);
  }
  $('#entry-skip').addEventListener('click', () => endEntry?.());
  $('#entry-gate').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); endEntry?.(); }
    if (event.key === 'Tab') { event.preventDefault(); $('#entry-skip').focus(); }
  });

  const menuToggle = $('.menu-toggle');
  const navigation = $('#navigation');
  function closeMenu() {
    navigation.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '展开导航');
  }
  menuToggle.addEventListener('click', () => {
    const open = !navigation.classList.contains('open');
    navigation.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  });
  $$('.navigation a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

  const navLinks = $$('.navigation a');
  const pageSections = $$('#main > section[id]').filter(section => section.id !== 'home');
  let scrollScheduled = false;
  function updateScroll() {
    scrollScheduled = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    $('.scroll-progress').style.transform = `scaleX(${progress})`;
    $('.back-top').classList.toggle('visible', window.scrollY > 550);
    let activeId = '';
    pageSections.forEach(section => { if (section.getBoundingClientRect().top < window.innerHeight * 0.38) activeId = section.id; });
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + activeId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  function scheduleScroll() {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  $('.back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  updateScroll();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
    $$('.reveal').forEach(element => {
      element.classList.add('reveal-pending');
      revealObserver.observe(element);
    });
  }

  const skillTabs = $$('.skill-tab');
  function selectSkill(tab, focus = false) {
    skillTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  skillTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectSkill(tab));
    tab.addEventListener('keydown', event => {
      let target = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (index + 1) % skillTabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') target = (index + skillTabs.length - 1) % skillTabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = skillTabs.length - 1;
      else return;
      event.preventDefault();
      selectSkill(skillTabs[target], true);
    });
  });
  const narrowScreen = window.matchMedia('(max-width: 680px)');
  function updateTabOrientation() { $('.skill-tabs').setAttribute('aria-orientation', narrowScreen.matches ? 'horizontal' : 'vertical'); }
  narrowScreen.addEventListener('change', updateTabOrientation);
  updateTabOrientation();

  const dialogs = $$('.modal');
  function updateModalState() {
    document.body.classList.toggle('modal-open', dialogs.some(dialog => dialog.open));
    renderer?.redraw();
  }
  function openDialog(dialog) {
    dialogs.forEach(item => { if (item !== dialog && item.open) item.close(); });
    dialog.showModal();
    updateModalState();
  }
  function closeDialog(dialog) {
    dialog.close();
    updateModalState();
  }
  dialogs.forEach(dialog => {
    $('.modal-close', dialog).addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      updateModalState();
    });
  });
  $$('.resume-trigger').forEach(link => link.addEventListener('click', event => {
    const dialog = $('#resume-dialog');
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    closeMenu();
    openDialog(dialog);
    $('.resume-pages').scrollTop = 0;
  }));

  $('#copy-email').addEventListener('click', async event => {
    const value = event.currentTarget.dataset.copyValue;
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        success = true;
      }
    } catch { /* Fall back for file://, denied clipboard permission, or older browsers. */ }
    if (!success) {
      const input = document.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.append(input);
      input.select();
      try { success = document.execCommand('copy'); } catch { success = false; }
      input.remove();
      event.currentTarget?.focus();
      $('#copy-email').focus({ preventScroll: true });
    }
    showToast(success ? '邮箱已复制：' + value : '邮箱：' + value + '，请长按或手动复制');
  });

  function createRenderer() {
    const canvas = $('#shader-canvas');
    const viewport = $('#lab-viewport');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL unavailable');

    const vertexSource = `
      attribute vec2 aPosition;
      void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;
    const fragmentSource = `
      precision highp float;
      uniform vec2 uResolution;
      uniform vec2 uRotation;
      uniform vec2 uPointer;
      uniform float uPulse;
      mat3 rx(float a) {
        float c=cos(a),s=sin(a);
        return mat3(1.,0.,0., 0.,c,s, 0.,-s,c);
      }
      mat3 ry(float a) {
        float c=cos(a),s=sin(a);
        return mat3(c,0.,-s, 0.,1.,0., s,0.,c);
      }
      vec3 toLocal(vec3 point) {
        return rx(uRotation.y) * ry(uRotation.x) * point;
      }
      float slab(vec3 point, float level, float angle) {
        vec3 offset = ry(angle) * (point - vec3(0.0, level, 0.0));
        vec3 edge = abs(offset) - vec3(.91, .092, .69);
        return length(max(edge, 0.0)) + min(max(edge.x, max(edge.y, edge.z)), 0.0) - .075;
      }
      float shape(vec3 p) {
        vec3 q = toLocal(p);
        return min(slab(q, -.67, -.14), min(slab(q, 0.0, .10), slab(q, .67, .28)));
      }
      vec3 normalAt(vec3 p) {
        vec2 e=vec2(0.003,0.);
        return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));
      }
      void main() {
        vec2 uv=(2.0*gl_FragCoord.xy-uResolution)/uResolution.y;
        vec3 ro=vec3(0.,0.,4.7);
        vec3 rd=normalize(vec3(uv,-3.15));
        float t=0.;
        float d=1.;
        for(int i=0;i<64;i++) {
          d=shape(ro+rd*t);
          if(d<0.003 || t>7.0) break;
          t+=d*0.9;
        }
        if(t>7.0 || d>0.012) { gl_FragColor=vec4(0.); return; }
        vec3 p=ro+rd*t;
        vec3 n=normalAt(p);
        vec3 v=-rd;
        vec3 light = normalize(vec3(-2.0 + uPointer.x, 3.2 + uPointer.y, 4.0));
        float diffuse = max(dot(n, light), 0.0);
        float edge = pow(1.0 - max(dot(n, v), 0.0), 2.0);
        float shine = pow(max(dot(n, normalize(light + v)), 0.0), 33.0);
        vec3 local = toLocal(p);
        vec3 material = local.y > .33 ? vec3(.96,.62,.37)
          : local.y < -.33 ? vec3(.37,.58,.63) : vec3(.83,.80,.67);
        float pulse = sin(uPulse * 3.14159);
        vec3 color = material * (.46 + diffuse * .66);
        color += vec3(.37,.25,.17) * (edge * .23 + shine * .42 + pulse * .42);
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    function compile(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const reason = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(reason);
      }
      return shader;
    }
    const vertex = compile(vertexSource, gl.VERTEX_SHADER);
    const fragment = compile(fragmentSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['uResolution', 'uRotation', 'uPointer', 'uPulse'].map(name => [name, gl.getUniformLocation(program, name)]));
    let yaw = -0.35;
    let pitch = 0.55;
    let autoRotate = !reducedMotion.matches;
    let visible = true;
    let frame = 0;
    let lastTimestamp = 0;
    let lastDraw = 0;
    let contextLost = false;
    let disposed = false;
    let pointer = [0, 0];
    let targetPointer = [0, 0];
    let scrollValue = window.scrollY * 0.002;
    let targetScroll = scrollValue;
    let pulseStarted = -2000;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = viewport.getBoundingClientRect();
      const width = Math.min(760, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(width * rect.height / Math.max(rect.width, 1)));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function draw() {
      if (contextLost || disposed) return;
      resize();
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uRotation, yaw + pointer[0] * 0.32 + scrollValue * 0.2, pitch + pointer[1] * 0.22 + Math.sin(scrollValue) * 0.08);
      gl.uniform2f(uniforms.uPointer, pointer[0], pointer[1]);
      gl.uniform1f(uniforms.uPulse, Math.min(1, Math.max(0, (performance.now() - pulseStarted) / 1400)));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function canAnimate() { return (autoRotate || performance.now() - pulseStarted < 1400) && visible && !document.hidden && !document.body.classList.contains('modal-open') && !document.body.classList.contains('gate-open') && !contextLost && !disposed; }
    function tick(timestamp) {
      frame = 0;
      const elapsed = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.05) : 0;
      lastTimestamp = timestamp;
      if (canAnimate() && autoRotate) yaw += elapsed * 0.10;
      pointer[0] += (targetPointer[0] - pointer[0]) * 0.1;
      pointer[1] += (targetPointer[1] - pointer[1]) * 0.1;
      scrollValue += (targetScroll - scrollValue) * 0.12;
      if (timestamp - lastDraw > 31) { draw(); lastDraw = timestamp; }
      if (canAnimate()) frame = requestAnimationFrame(tick);
    }
    function redraw() {
      if (disposed || contextLost) return;
      if (!frame) { lastTimestamp = 0; draw(); if (canAnimate()) frame = requestAnimationFrame(tick); }
    }
    function resetModel() {
      yaw = -0.35;
      pitch = 0.55;
      pointer = [0, 0];
      pulseStarted = -2000;
      autoRotate = !reducedMotion.matches;
      redraw();
    }
    function pulse() { pulseStarted = performance.now(); redraw(); }
    function trackPointer(x, y) {
      const bounds = viewport.getBoundingClientRect();
      targetPointer = [(x - bounds.left) / bounds.width * 2 - 1, 1 - (y - bounds.top) / bounds.height * 2];
      if (reducedMotion.matches) { pointer = [...targetPointer]; }
      redraw();
    }
    viewport.addEventListener('pointermove', event => trackPointer(event.clientX,event.clientY), {passive:true});
    viewport.addEventListener('touchmove', event => { if(event.touches[0]) trackPointer(event.touches[0].clientX,event.touches[0].clientY); }, {passive:true});
    window.addEventListener('scroll', () => { targetScroll = window.scrollY * 0.002; if(reducedMotion.matches) scrollValue = targetScroll; redraw(); }, {passive:true});
    canvas.addEventListener('pointerdown', pulse, {passive:true});
    canvas.addEventListener('dblclick', resetModel);
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); pulse(); return; }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') yaw -= 0.12;
      if (event.key === 'ArrowRight') yaw += 0.12;
      if (event.key === 'ArrowUp') pitch = Math.max(-1.5, pitch - 0.12);
      if (event.key === 'ArrowDown') pitch = Math.min(1.5, pitch + 0.12);
      redraw();
    });
    const resizeObserver = new ResizeObserver(redraw);
    resizeObserver.observe(viewport);
    let visibilityObserver;
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; redraw(); }, { threshold: 0 });
      visibilityObserver.observe(viewport);
    }
    document.addEventListener('visibilitychange', redraw);
    reducedMotion.addEventListener('change', () => { autoRotate = !reducedMotion.matches; redraw(); });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      contextLost = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      showRendererFallback();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      disposed = true;
      resizeObserver.disconnect();
      visibilityObserver?.disconnect();
      // Keep the dependable fallback until the next page load after a GPU reset.
    });
    window.addEventListener('pagehide', () => { if (frame) cancelAnimationFrame(frame); frame = 0; });
    window.addEventListener('pageshow', redraw);
    $('#model-fallback').classList.add('webgl-ready');
    redraw();
    return { redraw };
  }
  function showRendererFallback() {
    $('#model-fallback').classList.remove('webgl-ready');
    $('.lab').classList.add('renderer-fallback');
    $('#shader-canvas').hidden = true;
    $('#shader-canvas').tabIndex = -1;
  }

  try { renderer = createRenderer(); } catch { showRendererFallback(); }
  startEntry();
})();
