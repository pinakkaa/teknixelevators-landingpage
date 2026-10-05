(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- CONFIG (same email + Google Sheet endpoint as the live site) ---------- */
  var ENDPOINT = 'https://emailjsfuntions-428145106157.asia-south1.run.app/client-submit-form';
  var THANK_YOU = 'thankyou.html';

  document.body.classList.remove('js-off');

  /* ---------- FORM FIELDS (rendered into both forms) ---------- */
  var sel = function (name, label, opts) {
    return '<div class="fld"><label for="{id}-' + name + '">' + label + '</label><select id="{id}-' + name + '" name="' + name + '" required><option value="" disabled selected>' + label + '</option>' +
      opts.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('') + '</select></div>';
  };
  var FIELDS =
    '<input type="hidden" name="_subject" value="Enquiry from Teknix Landing Page">' +
    '<div class="fld"><label for="{id}-name">Name</label><input id="{id}-name" type="text" name="name" placeholder="Your name" autocomplete="name" required></div>' +
    '<div class="fld"><label for="{id}-phone">Phone</label><input id="{id}-phone" type="tel" name="phone" placeholder="Phone number" autocomplete="tel" inputmode="tel" required></div>' +
    '<div class="fld"><label for="{id}-email">Email</label><input id="{id}-email" type="email" name="email" placeholder="Email address" autocomplete="email" required></div>' +
    sel('floors', 'No. of Floors', ['1-3 Floors', '4-6 Floors', '7-10 Floors', '11-15 Floors', '15+ Floors']) +
    sel('construction', 'Construction Type', ['Residential', 'Commercial', 'Industrial', 'Hospital', 'Hotel']) +
    sel('location', 'Site Location', ['Bangalore', 'Chennai', 'Hyderabad']) +
    sel('budget', 'Select your budget', ['₹8-15 Lakhs', '₹15-20 Lakhs', '₹20-50 Lakhs', '₹50+ Lakhs']) +
    sel('plan', 'Select your plan', ['Basic Plan', 'Standard Plan', 'Premium Plan', 'Luxury Plan']) +
    '<div class="fld full"><label for="{id}-message">Additional requirements</label><textarea id="{id}-message" name="message" rows="3" placeholder="Additional requirements..."></textarea></div>' +
    '<div class="fsub"><button type="submit" class="btn wht"><span class="l">Submit</span><span class="ar l">→</span></button><span class="note" role="status"></span></div>';

  $$('form.form').forEach(function (f) {
    f.innerHTML = FIELDS.replace(/\{id\}/g, f.id);
    f.addEventListener('submit', function (e) { e.preventDefault(); submit(f); });
  });

  function submit(f) {
    var btn = $('button[type=submit]', f), label = $('.l', btn), note = $('.note', f);
    var v = function (n) { return (f.elements[n].value || '').trim(); };
    note.className = 'note';
    if (!f.checkValidity()) { f.reportValidity(); return; }
    if (!/^[+\d][\d\s\-()]{6,17}$/.test(v('phone'))) { note.className = 'note er'; note.textContent = 'Please enter a valid phone number.'; return; }

    btn.disabled = true; label.textContent = 'Please Wait'; note.textContent = '';
    var body = new URLSearchParams({
      name: v('name'), email: v('email'), phone: v('phone'), message: v('message'),
      floors: v('floors'), construction: v('construction'), location: v('location'),
      budget: v('budget'), plan: v('plan'),
      subject: 'Enquiry from Teknix Landing Page', form_source: 'Home Page'
    });

    fetch(ENDPOINT, { method: 'POST', body: body })
      .then(function (r) { return r.text(); })
      .then(function (msg) {
        if (msg.trim() === 'Email sent successfully') {
          note.className = 'note ok'; note.textContent = 'Email Sent Successfully!';
          f.reset();
          setTimeout(function () { window.location.href = THANK_YOU; }, 300);
        } else { throw new Error(msg || 'Error'); }
      })
      .catch(function (err) {
        btn.disabled = false; label.textContent = 'Submit';
        note.className = 'note er'; note.textContent = (err && err.message && err.message.length < 90) ? err.message : 'Error sending email!';
      });
  }

  /* ---------- NAV: transparent on top, hides on scroll-down, solid on scroll-up ---------- */
  var nav = $('#nav'), lastY = window.scrollY, tick = false;
  function evalNav() {
    var y = window.scrollY, d = y - lastY;
    if (y <= 40) nav.dataset.s = 'top';
    else if (y < 120) nav.dataset.s = 'hidden';
    else if (d > 6) nav.dataset.s = 'hidden';
    else if (d < -6) nav.dataset.s = 'revealed';
    lastY = y; tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(evalNav); } }, { passive: true });
  evalNav();

  /* ---------- DRAWER ---------- */
  var drawer = $('#drawer');
  function drawerOpen(o) { drawer.classList.toggle('open', o); document.body.classList.toggle('lock', o); }
  $('#burger').addEventListener('click', function () { drawerOpen(true); });
  $$('[data-close]', drawer).forEach(function (el) { el.addEventListener('click', function () { drawerOpen(false); }); });

  /* ---------- MODAL ---------- */
  var modal = $('#modal');
  function modalOpen(o) {
    modal.classList.toggle('on', o); modal.setAttribute('aria-hidden', !o);
    document.body.classList.toggle('lock', o);
    if (o) setTimeout(function () { var i = $('input[name=name]', modal); i && i.focus({ preventScroll: true }); }, 400);
  }
  $$('.open-form').forEach(function (b) {
    b.addEventListener('click', function (e) {
      if (b.tagName === 'A' && window.matchMedia('(min-width:1025px)').matches) { return; } // desktop CONTACT scrolls to form
      e.preventDefault(); modalOpen(true);
    });
  });
  $('#mx').addEventListener('click', function () { modalOpen(false); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modalOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { modalOpen(false); drawerOpen(false); } });
  try { // auto-open once per session, like the live site
    if (!sessionStorage.getItem('teknixModalShown')) {
      setTimeout(function () { if (!drawer.classList.contains('open')) { modalOpen(true); sessionStorage.setItem('teknixModalShown', '1'); } }, 4000);
    }
  } catch (e) { }

  /* ---------- PRODUCT SLIDER ---------- */
  var P = [
    ['Optima', 'image1.png', 'The all new OPTIMA redefines simplicity giving you vertical mobility solution with a range of technologically advanced features with German craftsmanship at its heart.'],
    ['Vertix', 'image2.png', 'VERTIX combines cutting-edge vertical transportation technology with sleek design, offering premium performance and energy efficiency for modern buildings.'],
    ['Greentek', 'image3.png', 'GREENTEK represents our commitment to sustainable mobility solutions, featuring eco-friendly technology and renewable energy integration.'],
    ['Hydratek', 'image1.png', 'HYDRATEK delivers powerful hydraulic elevation systems with exceptional load capacity and smooth operation for low to mid-rise applications.'],
    ['Villa matek', 'image2.png', 'VILLA MATEK is specially designed for residential applications, combining elegant aesthetics with compact design for luxury homes.']
  ];
  var pi = 0, tabs = $$('#tabs li'), img = $('#pimg'), desc = $('#pdesc'), tag = $('#ptag');
  function show(i) {
    pi = (i + P.length) % P.length;
    tabs.forEach(function (t, k) { t.classList.toggle('on', k === pi); });
    img.style.opacity = 0; desc.style.opacity = 0; tag.style.opacity = 0;
    setTimeout(function () {
      img.src = './icons/' + P[pi][1]; img.alt = 'Teknix ' + P[pi][0] + ' elevator';
      desc.textContent = P[pi][2]; tag.textContent = P[pi][0];
      img.style.opacity = 1; desc.style.opacity = 1; tag.style.opacity = 1;
    }, 280);
  }
  desc.textContent = P[0][2];
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
  $('#prev').addEventListener('click', function () { show(pi - 1); });
  $('#next').addEventListener('click', function () { show(pi + 1); });

  /* ---------- TESTIMONIALS ---------- */
  var cards = $$('#tw .tc'), dots = $('#dots'), ti = 0, timer;
  cards.forEach(function (c, k) { var d = document.createElement('i'); d.addEventListener('click', function () { go(k, true); }); dots.appendChild(d); });
  function go(k, manual) {
    ti = (k + cards.length) % cards.length;
    cards.forEach(function (c, j) { c.classList.toggle('on', j === ti); });
    $$('i', dots).forEach(function (d, j) { d.classList.toggle('on', j === ti); });
    if (manual) { clearInterval(timer); timer = setInterval(function () { go(ti + 1); }, 6000); }
  }
  go(0); timer = setInterval(function () { go(ti + 1); }, 6000);
  $('#tprev').addEventListener('click', function () { go(ti - 1, true); });
  $('#tnext').addEventListener('click', function () { go(ti + 1, true); });
  var tw = $('#tw'), sx = null;
  tw.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  tw.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 45) go(ti + (dx < 0 ? 1 : -1), true);
  });
  tw.addEventListener('mouseenter', function () { clearInterval(timer); });
  tw.addEventListener('mouseleave', function () { clearInterval(timer); timer = setInterval(function () { go(ti + 1); }, 6000); });
  function fitReviews() { // keep the box tall enough for the longest review at any width
    tw.style.minHeight = '0'; var h = 0;
    cards.forEach(function (c) { c.style.position = 'relative'; h = Math.max(h, c.offsetHeight); c.style.position = ''; });
    tw.style.minHeight = h + 'px';
  }
  fitReviews(); window.addEventListener('resize', fitReviews); window.addEventListener('load', fitReviews);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitReviews);

  /* ---------- FILL BUTTON (circle grows from cursor) ---------- */
  $$('.btn').forEach(function (b) {
    var fill = document.createElement('span'); fill.className = 'fill'; b.insertBefore(fill, b.firstChild);
    var pos = function (e) { var r = b.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    b.addEventListener('mouseenter', function (e) {
      var p = pos(e); fill.style.transition = 'none'; fill.style.left = p[0] + 'px'; fill.style.top = p[1] + 'px';
      fill.style.transform = 'translate(-50%,-50%) scale(0)'; void fill.offsetWidth;
      fill.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)'; fill.style.transform = 'translate(-50%,-50%) scale(1)';
    });
    b.addEventListener('mouseleave', function (e) {
      var p = pos(e); fill.style.left = p[0] + 'px'; fill.style.top = p[1] + 'px'; fill.style.transform = 'translate(-50%,-50%) scale(0)';
    });
  });

  /* ---------- SCROLL REVEALS ---------- */
  var targets = $$('.rv,.ln,.ri');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add('in');
        $$('.ri', x.target).forEach(function (r) { r.classList.add('in'); });
        io.unobserve(x.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (t) {
      if (t.classList.contains('ri')) { t.__ob = t.parentNode; io.observe(t.parentNode); } else { io.observe(t); }
    });
  } else { targets.forEach(function (t) { t.classList.add('in'); }); }

  /* ---------- PARALLAX on section images ---------- */
  var par = $$('.corp .im img');
  if (par.length && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    window.addEventListener('scroll', function () {
      par.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect(), p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        im.style.transform = 'translateY(' + (p * -40) + 'px) scale(1.12)';
      });
    }, { passive: true });
  }
})();