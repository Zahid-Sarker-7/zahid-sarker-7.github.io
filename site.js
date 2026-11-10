// Shared page behaviour. Loaded with `defer`; analytics stays inline in each page <head>.
(function () {
  // Years at Optimizely (since May 2022), rounded down to the half year so it never overstates.
  var y = (Date.now() - Date.UTC(2022, 4, 1)) / 31557600000;
  document.querySelectorAll('[data-yrs]').forEach(function (e) { e.textContent = (Math.floor(y * 2) / 2).toFixed(1); });

  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Career journey: the character evolves rung by rung. Autoplays once when seen, then
  // every step is hover/click/focus-able. Stays interactive under reduced motion (no autoplay).
  var J = document.getElementById('journey');
  if (J) {
    var TITLES = [['2022', 'Intern'], ['2022', 'Software Engineer I'], ['2024', 'Software Engineer II'],
      ['2025', 'Software Engineer II · into AI'], ['2026', 'Senior Software Engineer']];
    var STORY = [
      'First day: Terraform, Grafana, a Next.js admin dashboard, and a lot of reading. I said yes to everything.',
      'I owned a production service that polled everything, all the time. I made it poll smart, and its cost dropped 98%.',
      'I led my first project from planning to delivery, on deadline. I was picked for SPARK (top 5% company-wide) and got GCP-certified.',
      'I moved into AI. The docs assistant gave shaky answers, so I rebuilt its retrieval on Vertex AI Search.',
      'Promoted to Senior. I led our remote MCP server to general availability: tools that let AI agents operate the product, with audit logging and observability built in.'];
    var figs = J.querySelectorAll('.r-stage'), rungs = J.querySelectorAll('.rung'), lad = J.querySelector('.ladder'),
      bot = J.querySelector('.jbot'), yr = document.getElementById('jyr'), ti = document.getElementById('jtitle'),
      story = document.getElementById('jstory'), cur = 4, timer = null;
    var show = function (i, byUser) {
      if (byUser) clearInterval(timer);
      figs[cur].classList.remove('r-on'); figs[i].classList.add('r-on');
      rungs.forEach(function (r, k) { r.classList.toggle('done', k <= i); r.classList.toggle('cur', k === i); });
      lad.style.setProperty('--p', i / 4);
      yr.textContent = TITLES[i][0]; ti.textContent = TITLES[i][1]; story.textContent = STORY[i];
      if (i !== cur && !still) { bot.classList.remove('boot'); void bot.offsetWidth; bot.classList.add('boot'); }
      cur = i;
    };
    rungs.forEach(function (r, k) {
      var b = r.querySelector('button');
      b.addEventListener('mouseenter', function () { show(k, true); });
      b.addEventListener('focus', function () { show(k, true); });
      b.addEventListener('click', function () { show(k, true); if (window.umami) umami.track('robot-story', { year: TITLES[k][0] }); });
    });
    show(4);
    if (!still && 'IntersectionObserver' in window) {
      var jo = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; jo.disconnect();
        var i = 0; show(0);
        timer = setInterval(function () { if (++i > 4) return clearInterval(timer); show(i); }, 1700);
      }, { threshold: 0.4 });
      jo.observe(J);
    }
  }

  var dias = document.querySelectorAll('svg.dia');
  if (still || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.pkt').forEach(function (p) { p.remove(); });
    dias.forEach(function (d) { d.classList.add('go'); });
    document.querySelectorAll('.rv,.stagger,.bug').forEach(function (e) { e.classList.add('in'); });
    return;
  }

  // Typed kicker: the text is in the HTML (readable without JS); we re-type it once.
  document.querySelectorAll('.type').forEach(function (el) {
    var full = el.textContent, i = 0; el.setAttribute('aria-label', full); el.textContent = '';
    (function tick() { el.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(tick, 28); })();
  });

  function countUp(n) {
    var to = +n.dataset.count, t0 = performance.now();
    (function f(t) { var p = Math.min((t - t0) / 1100, 1); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add(el.tagName === 'svg' ? 'go' : 'in'); io.unobserve(el);
      el.querySelectorAll('[data-count]').forEach(countUp);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.rv,.stagger,.bug,svg.dia').forEach(function (el) { io.observe(el); });

  // Liquid-glass specular highlight follows the pointer across each panel.
  addEventListener('pointermove', function (e) {
    var g = e.target.closest && e.target.closest('.glass'); if (!g) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // Blueprint crosshair + coordinate readout (CSS shows it only for fine pointers).
  var cx = document.querySelector('.cx'), cy = document.querySelector('.cy'), co = document.querySelector('.coord');
  if (cx) addEventListener('pointermove', function (e) {
    cx.style.transform = 'translateX(' + e.clientX + 'px)'; cy.style.transform = 'translateY(' + e.clientY + 'px)';
    co.textContent = 'X ' + String(e.clientX).padStart(4, '0') + ' · Y ' + String(Math.round(e.clientY + scrollY)).padStart(4, '0');
  }, { passive: true });
})();
