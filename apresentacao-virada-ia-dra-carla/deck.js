/* VIRADA IA — per-slide reveal + counter animations
   Each <section> can have data-reveals="N" (element count) and child elements
   with .seq / .seq-line / .seq-zoom + data-step="k" to reveal on click k.
   If no step is set, all .seq reveal together on mount.
*/

(function(){
  const stage = document.querySelector('deck-stage');
  if(!stage) return;

  // Track active slide index and current step per slide
  const state = new Map(); // idx -> currentStep

  function getActiveSection(){
    const sections = stage.querySelectorAll(':scope > section');
    // deck-stage adds data-active or similar — fallback: visible one
    for(const s of sections){
      const style = getComputedStyle(s);
      if(style.display !== 'none' && style.visibility !== 'hidden'){
        // deck-stage hides inactive via opacity/display; pick whichever is shown
        return s;
      }
    }
    return sections[0];
  }

  function slideIndex(section){
    const sections = [...stage.querySelectorAll(':scope > section')];
    return sections.indexOf(section);
  }

  function maxStep(section){
    const stepped = section.querySelectorAll('[data-step]');
    let m = 0;
    stepped.forEach(el => {
      const s = parseInt(el.dataset.step, 10);
      if(s > m) m = s;
    });
    return m;
  }

  function applyStep(section, step){
    // Un-stepped elements reveal immediately
    section.querySelectorAll('.seq, .seq-line, .seq-zoom, .mock-line, .tree-line').forEach(el => {
      const s = el.dataset.step;
      if(s === undefined){
        // Staggered auto-reveal by order
        const idx = [...section.querySelectorAll('.seq:not([data-step]), .seq-line:not([data-step]), .seq-zoom:not([data-step])')].indexOf(el);
        setTimeout(() => el.classList.add('in'), 80 + idx * 160);
      } else {
        const sNum = parseInt(s, 10);
        if(sNum <= step){
          if(!el.classList.contains('in')){
            el.classList.add('in');
            // Trigger counters
            if(el.dataset.counter){
              animateCounter(el);
            }
            // Beat-2 glow two-stage
            if(el.classList.contains('beat-2')){
              // drop-shadow comes from .in already; no extra
            }
          }
        } else {
          el.classList.remove('in');
        }
      }
    });

    // Tagline two-beat automatic pause
    const twoBeats = section.querySelectorAll('.tagline-two-beat');
    twoBeats.forEach(tb => {
      const b1 = tb.querySelector('.beat-1');
      const b2 = tb.querySelector('.beat-2');
      if(!b1 || !b2) return;
      const s1 = parseInt(b1.dataset.step || '0', 10);
      if(step >= s1){
        b1.classList.add('in');
        // auto-schedule beat-2 1.2s later
        if(!tb.dataset.scheduled){
          tb.dataset.scheduled = '1';
          setTimeout(() => {
            const sec = getActiveSection();
            if(sec === section) b2.classList.add('in');
          }, 1200);
        }
      } else {
        b1.classList.remove('in');
        b2.classList.remove('in');
        delete tb.dataset.scheduled;
      }
    });
  }

  function animateCounter(el){
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if(t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  function initSlide(section){
    const idx = slideIndex(section);
    // Auto-advance to step 1 on entry so initial reveals happen without a click
    const hasStep1 = section.querySelector('[data-step="1"]');
    const startStep = hasStep1 ? 1 : 0;
    state.set(idx, startStep);
    applyStep(section, startStep);
  }

  function advance(section){
    const idx = slideIndex(section);
    const cur = state.get(idx) || 0;
    const mx = maxStep(section);
    if(cur < mx){
      state.set(idx, cur + 1);
      applyStep(section, cur + 1);
      return true; // consumed
    }
    return false;
  }

  function retreat(section){
    const idx = slideIndex(section);
    const cur = state.get(idx) || 0;
    if(cur > 0){
      state.set(idx, cur - 1);
      applyStep(section, cur - 1);
      return true;
    }
    return false;
  }

  // Intercept keyboard — deck-stage also listens, but we want to step first
  window.addEventListener('keydown', (e) => {
    const section = getActiveSection();
    if(!section) return;
    if(e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown'){
      if(advance(section)){ e.stopPropagation(); e.preventDefault(); }
    } else if(e.key === 'ArrowLeft' || e.key === 'PageUp'){
      if(retreat(section)){ e.stopPropagation(); e.preventDefault(); }
    }
  }, true); // capture phase to run before deck-stage

  // Click to advance (on slide body, not nav chrome)
  document.addEventListener('click', (e) => {
    if(e.target.closest('.deck-chrome, .nav-button, button, a')) return;
    const section = getActiveSection();
    if(!section) return;
    advance(section);
  });

  function enterSlide(sec, idx){
    if(!sec) return;
    sec.querySelectorAll('[data-scheduled]').forEach(el => delete el.dataset.scheduled);
    sec.querySelectorAll('.seq.in, .seq-line.in, .seq-zoom.in').forEach(el => el.classList.remove('in'));
    const hasStep1 = sec.querySelector('[data-step="1"]');
    const startStep = hasStep1 ? 1 : 0;
    state.set(idx, startStep);
    applyStep(sec, startStep);
  }

  // deck-stage fires a 'slidechange' CustomEvent (incl. on init)
  stage.addEventListener('slidechange', (e) => {
    const idx = (e.detail && typeof e.detail.index === 'number') ? e.detail.index : null;
    const sections = [...stage.querySelectorAll(':scope > section')];
    const sec = idx !== null ? sections[idx] : getActiveSection();
    const finalIdx = idx !== null ? idx : sections.indexOf(sec);
    enterSlide(sec, finalIdx);
  });

  // postMessage fallback
  window.addEventListener('message', (e) => {
    if(e.data && typeof e.data.slideIndexChanged === 'number'){
      const sections = [...stage.querySelectorAll(':scope > section')];
      const sec = sections[e.data.slideIndexChanged];
      enterSlide(sec, e.data.slideIndexChanged);
    }
  });

  // Reset counters once
  [...stage.querySelectorAll(':scope > section')].forEach(s => {
    s.querySelectorAll('[data-counter]').forEach(el => {
      if(!el.dataset.initial) el.dataset.initial = el.textContent;
      el.textContent = '';
    });
  });

  // deck-stage marks the active slide with [data-deck-active]. Observe that.
  let lastActiveIdx = -1;
  function checkActive(){
    const sections = [...stage.querySelectorAll(':scope > section')];
    let activeIdx = sections.findIndex(s => s.hasAttribute('data-deck-active'));
    if(activeIdx === -1){
      // Fallback to first visible
      activeIdx = sections.findIndex(s => {
        const cs = getComputedStyle(s);
        return cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.01;
      });
    }
    if(activeIdx === -1) activeIdx = 0;
    if(activeIdx !== lastActiveIdx){
      lastActiveIdx = activeIdx;
      enterSlide(sections[activeIdx], activeIdx);
    }
  }

  // Run immediately + poll for first 3s (covers deck-stage's async activation)
  checkActive();
  const pollId = setInterval(checkActive, 50);
  setTimeout(() => clearInterval(pollId), 3000);

  // Watch for data-deck-active attribute changes on any section
  const mo = new MutationObserver(checkActive);
  [...stage.querySelectorAll(':scope > section')].forEach(s => {
    mo.observe(s, { attributes: true, attributeFilter: ['data-deck-active', 'style', 'class'] });
  });
})();
