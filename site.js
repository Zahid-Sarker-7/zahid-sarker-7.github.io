// Shared page behaviour. Loaded with `defer`; analytics stays inline in each page <head>.
(function () {
  // Years at Optimizely (since May 2022), rounded down to the half year so it never overstates.
  var y = (Date.now() - Date.UTC(2022, 4, 1)) / 31557600000;
  document.querySelectorAll('[data-yrs]').forEach(function (e) { e.textContent = (Math.floor(y * 2) / 2).toFixed(1); });

  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dias = document.querySelectorAll('svg.dia');
  if (still || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.pkt').forEach(function (p) { p.remove(); });
    dias.forEach(function (d) { d.classList.add('go'); });
    document.querySelectorAll('.rv,.stagger,.ladder,.bug').forEach(function (e) { e.classList.add('in'); });
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
  document.querySelectorAll('.rv,.stagger,.ladder,.bug,svg.dia').forEach(function (el) { io.observe(el); });

  // Blueprint crosshair + coordinate readout (CSS shows it only for fine pointers).
  var cx = document.querySelector('.cx'), cy = document.querySelector('.cy'), co = document.querySelector('.coord');
  if (cx) addEventListener('pointermove', function (e) {
    cx.style.transform = 'translateX(' + e.clientX + 'px)'; cy.style.transform = 'translateY(' + e.clientY + 'px)';
    co.textContent = 'X ' + String(e.clientX).padStart(4, '0') + ' · Y ' + String(Math.round(e.clientY + scrollY)).padStart(4, '0');
  }, { passive: true });
})();
