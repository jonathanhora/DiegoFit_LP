// Diego Fit — interações da landing page
(function () {
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // Menu mobile
  var menuBtn = $('#menu-btn');
  var menu = $('#menu-panel');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    $('.ico-open', menuBtn).toggleAttribute('hidden', open);
    $('.ico-close', menuBtn).toggleAttribute('hidden', !open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) { var first = $('.menu-link', menu); if (first) first.focus({ preventScroll: true }); }
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('[data-close-menu]').forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && !menu.hidden) { setMenu(false); menuBtn.focus(); } });



  // Planos: leva o plano escolhido ao formulário
  var planSelect = $('#f-plano');
  $$('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () { if (planSelect) planSelect.value = a.getAttribute('data-plan'); });
  });

  // Formulário: estados de envio e sucesso
  // Ligue aqui o envio real (Formspree, Make, planilha, CRM...) no lugar do setTimeout.
  var form = $('#lead-form');
  var success = $('#form-success');
  var submitBtn = $('#submit-btn');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    form.setAttribute('aria-busy', 'true');
    var first = (form.elements.nome.value || '').trim().split(' ')[0];
    setTimeout(function () {
      $('#sent-name').textContent = first ? ', ' + first : '';
      form.hidden = true;
      success.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Agendar avaliação grátis';
      form.removeAttribute('aria-busy');
    }, 900);
  });
  var reset = $('#form-reset');
  if (reset) reset.addEventListener('click', function () {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    $('#f-nome').focus();
  });

  // Barra fixa de CTA no celular
  var bar = $('#cta-bar');
  var agendar = $('#agendar');
  var barLink = bar ? $('a', bar) : null;
  var ticking = false;
  function updateBar() {
    ticking = false;
    if (!bar) return;
    var formTop = agendar ? agendar.getBoundingClientRect().top : Infinity;
    var show = window.scrollY > 640 && formTop > window.innerHeight * 0.6;
    bar.classList.toggle('is-shown', show);
    bar.setAttribute('aria-hidden', String(!show));
    if (barLink) barLink.tabIndex = show ? 0 : -1;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(updateBar); } }, { passive: true });
  updateBar();

  // Movimento (GSAP + ScrollTrigger). Nada fica escondido se o script não carregar.
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('[data-anim="hero-img"]', { scale: 1.14, duration: 1.8, ease: 'power2.out' }, 0)
      .from('[data-anim="hero-line"]', { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.1)
      .from('[data-anim="hero-fade"]', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.5);
    $$('[data-anim="lane"]').forEach(function (p, i) {
      var len = p.getTotalLength();
      tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.4 + i * 0.12);
    });
    $$('[data-count]').forEach(function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10) || 0;
      var o = { v: 0 };
      tl.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } }, 0.7);
    });
    var setTrackEnd = function () {
      $$('[data-anim="steps"]').forEach(function (ol) {
        var last = ol.querySelector('li:last-child');
        if (last) ol.style.setProperty('--track-end', Math.max(0, last.offsetHeight - 36) + 'px');
      });
    };
    setTrackEnd();
    window.ScrollTrigger.addEventListener('refreshInit', setTrackEnd);
    $$('[data-anim="track"]').forEach(function (el) {
      gsap.fromTo(el, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: el.closest('[data-anim="steps"]'), start: 'top 65%', end: 'bottom 65%', scrub: 0.4 } });
    });
    $$('[data-anim="steps"] > li').forEach(function (li) {
      window.ScrollTrigger.create({ trigger: li, start: 'top 65%', end: 'max', toggleClass: { targets: li, className: 'is-on' } });
    });
    $$('[data-anim="mark"]').forEach(function (el) {
      gsap.fromTo(el, { '--mark': 0 }, { '--mark': 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    $$('[data-anim="parallax"]').forEach(function (el) {
      gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  // Resultados: o scroll vertical move os cards na horizontal (desktop)
  $$('[data-anim="results"]').forEach(function (sec) {
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      var row = sec.querySelector('[data-anim="testi-row"]');
      var bar = sec.querySelector('[data-anim="testi-bar"]');
      var count = sec.querySelector('[data-anim="testi-count"]');
      var cards = Array.prototype.slice.call(row.children);
      sec.classList.add('is-h');
      var dist = function () { return Math.max(0, row.scrollWidth + parseFloat(getComputedStyle(row).paddingLeft) - window.innerWidth); };
      var size = function () { sec.style.height = (window.innerHeight - 72 + dist() * 1.5) + 'px'; };
      size();
      var tween = gsap.to(row, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: {
        trigger: sec, start: 'top 72px', end: function () { return '+=' + dist() * 1.5; }, scrub: 0.8, invalidateOnRefresh: true, onRefreshInit: size,
        onUpdate: function (self) {
          if (bar) bar.style.transform = 'scaleX(' + self.progress.toFixed(3) + ')';
          if (count) count.textContent = '0' + (Math.round(self.progress * (cards.length - 1)) + 1);
        }
      } });
      cards.forEach(function (card) {
        var img = card.querySelector('img');
        if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } });
      });
      window.ScrollTrigger.refresh();
      return function () { sec.classList.remove('is-h'); sec.style.height = ''; };
    });
  });
})();
