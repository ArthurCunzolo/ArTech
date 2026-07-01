/**
 * ArTech Solutions – script.js
 * Handles: preloader animation, particles, custom cursor,
 *           GSAP hero entrance, scroll reveals, magnetic buttons,
 *           hero canvas particles, nav scroll state, mobile menu.
 */

/* ═══════════════════════════════════════════════════════════════
   WAIT FOR DOM + GSAP
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Footer year ──────────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Detect GSAP ──────────────────────────────────────────────
  const hasGSAP = typeof gsap !== 'undefined';

  // ── Mobile check ─────────────────────────────────────────────
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════
     1. CUSTOM CURSOR
  ═══════════════════════════════════════════════════════════ */
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');

  if (cursor && cursorDot && !isMobile) {
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;
    let animId;

    document.addEventListener('mousemove', (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
    });

    // Smooth cursor follow
    function animateCursor() {
      cursorX += (dotX - cursorX) * 0.12;
      cursorY += (dotY - cursorY) * 0.12;
      cursor.style.left = cursorX + 'px';
      cursor.style.top  = cursorY + 'px';
      animId = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverTargets = 'a, button, .card, .package, .diff, .nav__cta';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. PRELOADER PARTICLES CANVAS
  ═══════════════════════════════════════════════════════════ */
  const preloaderCanvas = document.getElementById('particle-canvas');

  if (preloaderCanvas && !prefersReducedMotion) {
    const pCtx = preloaderCanvas.getContext('2d');
    let pW, pH, pParticles = [];

    function resizePreloaderCanvas() {
      pW = preloaderCanvas.width  = window.innerWidth;
      pH = preloaderCanvas.height = window.innerHeight;
    }
    resizePreloaderCanvas();

    // Create particles
    const PARTICLE_COUNT = isMobile ? 40 : 90;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pParticles.push({
        x:    Math.random() * pW,
        y:    Math.random() * pH,
        r:    Math.random() * 1.5 + 0.3,
        vx:   (Math.random() - 0.5) * 0.6,
        vy:   (Math.random() - 0.5) * 0.6,
        a:    Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '10,132,255' : '0,194,255',
      });
    }

    let pRaf;
    function animatePreloaderParticles() {
      pCtx.clearRect(0, 0, pW, pH);
      pParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = pW;
        if (p.x > pW) p.x = 0;
        if (p.y < 0) p.y = pH;
        if (p.y > pH) p.y = 0;

        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(${p.color},${p.a})`;
        pCtx.fill();
      });
      pRaf = requestAnimationFrame(animatePreloaderParticles);
    }
    animatePreloaderParticles();

    // Expose cleanup
    window._stopPreloaderParticles = () => {
      cancelAnimationFrame(pRaf);
    };
  }

  /* ═══════════════════════════════════════════════════════════
     3. PRELOADER ANIMATION (GSAP)
  ═══════════════════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');

  if (preloader && hasGSAP && !prefersReducedMotion) {
    const logo = preloader.querySelector('.preloader__logo');
    const tl   = gsap.timeline({
      onComplete: () => {
        if (window._stopPreloaderParticles) window._stopPreloaderParticles();
        initHeroAnimations();
      }
    });

    // Logo entrance
    tl.to(logo, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: 'power3.out',
    })
    // Hold for 0.8s
    .to({}, { duration: 0.8 })
    // Logo blur-out exit
    .to(logo, {
      opacity: 0,
      scale: 1.08,
      filter: 'blur(20px)',
      duration: 0.6,
      ease: 'power2.in',
    })
    // Whole preloader fade out
    .to(preloader, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        preloader.style.display = 'none';
        document.body.style.overflow = '';
      }
    });

    document.body.style.overflow = 'hidden';
  } else {
    // No GSAP or prefers-reduced-motion: instant skip
    if (preloader) preloader.style.display = 'none';
    initHeroAnimations();
  }

  /* ═══════════════════════════════════════════════════════════
     4. HERO CANVAS – Ambient particles
  ═══════════════════════════════════════════════════════════ */
  const heroCanvas = document.getElementById('hero-canvas');

  if (heroCanvas && !prefersReducedMotion) {
    const hCtx = heroCanvas.getContext('2d');
    let hW, hH;
    let hParticles = [];

    function resizeHero() {
      hW = heroCanvas.width  = heroCanvas.offsetWidth;
      hH = heroCanvas.height = heroCanvas.offsetHeight;
    }

    const HERO_PARTICLES = isMobile ? 30 : 70;

    function initHeroParticles() {
      hParticles = [];
      for (let i = 0; i < HERO_PARTICLES; i++) {
        hParticles.push({
          x:    Math.random() * hW,
          y:    Math.random() * hH,
          r:    Math.random() * 1.2 + 0.2,
          vx:   (Math.random() - 0.5) * 0.3,
          vy:   (Math.random() - 0.5) * 0.3,
          a:    Math.random() * 0.35 + 0.05,
          color: Math.random() > 0.6 ? '10,132,255' : '91,140,255',
        });
      }
    }

    function connectHeroParticles() {
      for (let i = 0; i < hParticles.length; i++) {
        for (let j = i + 1; j < hParticles.length; j++) {
          const dx = hParticles[i].x - hParticles[j].x;
          const dy = hParticles[i].y - hParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const a = (1 - dist / 120) * 0.12;
            hCtx.beginPath();
            hCtx.moveTo(hParticles[i].x, hParticles[i].y);
            hCtx.lineTo(hParticles[j].x, hParticles[j].y);
            hCtx.strokeStyle = `rgba(10,132,255,${a})`;
            hCtx.lineWidth = 0.6;
            hCtx.stroke();
          }
        }
      }
    }

    function animateHeroCanvas() {
      hCtx.clearRect(0, 0, hW, hH);
      hParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > hW) p.vx *= -1;
        if (p.y < 0 || p.y > hH) p.vy *= -1;
        hCtx.beginPath();
        hCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        hCtx.fillStyle = `rgba(${p.color},${p.a})`;
        hCtx.fill();
      });
      connectHeroParticles();
      requestAnimationFrame(animateHeroCanvas);
    }

    // Init
    resizeHero();
    initHeroParticles();
    animateHeroCanvas();

    window.addEventListener('resize', () => {
      resizeHero();
      initHeroParticles();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     5. HERO SECTION ENTRANCE (GSAP)
  ═══════════════════════════════════════════════════════════ */
  function initHeroAnimations() {
    if (!hasGSAP || prefersReducedMotion) {
      // Just show everything immediately
      document.querySelectorAll('.hero__eyebrow, .hero__title, .hero__subtitle, .hero__actions, .hero__stats, .hero__visual').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      initScrollAnimations();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const heroTl = gsap.timeline({
      onComplete: initScrollAnimations
    });

    heroTl
      .to('.hero__eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
      .to('.hero__title', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3')
      .to('.hero__subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.4')
      .to('.hero__actions', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.3')
      .to('.hero__stats', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.3')
      .to('.hero__visual', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
      }, '-=0.7');
  }

  /* ═══════════════════════════════════════════════════════════
     6. SCROLL REVEAL ANIMATIONS
  ═══════════════════════════════════════════════════════════ */
  function initScrollAnimations() {
    if (!hasGSAP || prefersReducedMotion) {
      // Instant reveal fallback
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Register ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Reveal each .reveal element as it enters viewport
    document.querySelectorAll('.reveal').forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
          delay: i % 4 * 0.08, // stagger within row
        }
      );
    });

    // Cards stagger per grid row
    document.querySelectorAll('.services__grid').forEach(grid => {
      const cards = grid.querySelectorAll('.card');
      gsap.fromTo(cards,
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Packages entrance
    const packages = document.querySelectorAll('.package');
    gsap.fromTo(packages,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: (i) => packages[i].classList.contains('package--ouro') ? 1.03 : 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.packages__grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      }
    );

    // Diff cards stagger
    gsap.fromTo('.diff',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.diffs__grid',
          start: 'top 82%',
          toggleActions: 'play none none none',
        }
      }
    );

    // CTA section
    gsap.fromTo('.cta-section__inner',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      }
    );

    // Parallax on hero grid overlay
    gsap.to('.hero__grid-overlay', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     7. MAGNETIC BUTTONS
  ═══════════════════════════════════════════════════════════ */
  if (!isMobile && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        const strength = 0.22;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     8. CARD MOUSE GLOW EFFECT
  ═══════════════════════════════════════════════════════════ */
  if (!isMobile) {
    document.querySelectorAll('.card, .diff, .package').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     9. NAV SCROLL STATE
  ═══════════════════════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  let navHidden = false;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add scrolled class
    if (scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    // Hide nav on scroll down, show on scroll up (only after 200px)
    if (!isMobile && scrollY > 200) {
      if (scrollY > lastScroll + 5 && !navHidden) {
        nav.style.transform = 'translateY(-100%)';
        navHidden = true;
      } else if (scrollY < lastScroll - 5 && navHidden) {
        nav.style.transform = 'translateY(0)';
        navHidden = false;
      }
    }
    lastScroll = scrollY;
  }, { passive: true });

  nav.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.4s, backdrop-filter 0.4s, box-shadow 0.4s';

  /* ═══════════════════════════════════════════════════════════
     10. MOBILE MENU
  ═══════════════════════════════════════════════════════════ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    function openMenu() {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      // Remove inline display so CSS .open rule takes over
      mobileMenu.style.removeProperty('display');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      // Hide after transition completes
      setTimeout(() => {
        if (!mobileMenu.classList.contains('open')) {
          mobileMenu.style.display = 'none';
        }
      }, 320);
    }

    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) closeMenu();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     11. CTA SECTION CANVAS (subtle ambient glow)
  ═══════════════════════════════════════════════════════════ */
  const ctaCanvas = document.getElementById('cta-canvas');

  if (ctaCanvas && !prefersReducedMotion) {
    const cCtx = ctaCanvas.getContext('2d');
    let cW, cH;

    function resizeCta() {
      cW = ctaCanvas.width  = ctaCanvas.offsetWidth;
      cH = ctaCanvas.height = ctaCanvas.offsetHeight;
    }
    resizeCta();
    window.addEventListener('resize', resizeCta, { passive: true });

    let cTime = 0;
    function animateCta() {
      cTime += 0.008;
      cCtx.clearRect(0, 0, cW, cH);

      // Slow moving radial glow
      const cx = cW / 2 + Math.sin(cTime * 0.7) * cW * 0.15;
      const cy = cH / 2 + Math.cos(cTime * 0.5) * cH * 0.1;
      const grad = cCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cW, cH) * 0.5);
      grad.addColorStop(0,   'rgba(10,132,255,0.12)');
      grad.addColorStop(0.5, 'rgba(0,194,255,0.04)');
      grad.addColorStop(1,   'transparent');
      cCtx.fillStyle = grad;
      cCtx.fillRect(0, 0, cW, cH);

      requestAnimationFrame(animateCta);
    }
    animateCta();
  }

  /* ═══════════════════════════════════════════════════════════
     12. SMOOTH ANCHOR SCROLL (nav links)
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════
     13. INTERSECTION OBSERVER FALLBACK (if no GSAP ScrollTrigger)
  ═══════════════════════════════════════════════════════════ */
  if (!hasGSAP) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

}); // end DOMContentLoaded

/* ═══════════════════════════════════════════════════════════════
   SERVICE CALCULATOR
═══════════════════════════════════════════════════════════════ */
(function initServiceCalculator() {
  const grid        = document.getElementById('calc-grid');
  const sendBtn     = document.getElementById('calc-send');
  const totalEl     = document.getElementById('calc-total');
  const countEl     = document.getElementById('calc-count');
  const selectedList = document.getElementById('calc-selected-list');

  if (!grid || !sendBtn) return;

  const selected = new Map(); // name -> price

  function updateUI() {
    const count = selected.size;
    let total   = 0;
    selected.forEach(price => total += price);

    // Count label
    countEl.textContent = count === 0
      ? '0 serviços selecionados'
      : `${count} serviço${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}`;

    // Total value
    totalEl.textContent = `R$${total}`;
    totalEl.classList.toggle('has-value', total > 0);

    // Tags list
    selectedList.innerHTML = '';
    selected.forEach((_, name) => {
      const tag = document.createElement('span');
      tag.className = 'calc-tag';
      tag.textContent = name;
      selectedList.appendChild(tag);
    });

    // Send button
    sendBtn.disabled = count === 0;
  }

  // Toggle selection on each item
  grid.querySelectorAll('.svc-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);

      if (selected.has(name)) {
        selected.delete(name);
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        selected.set(name, price);
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      updateUI();
    });

    // Accessibility
    btn.setAttribute('role', 'checkbox');
    btn.setAttribute('aria-pressed', 'false');
  });

  // Build WhatsApp message and redirect
  sendBtn.addEventListener('click', () => {
    if (selected.size === 0) return;

    let total = 0;
    const lines = [];
    selected.forEach((price, name) => {
      total += price;
      lines.push(`• ${name} — R$${price}`);
    });

    const msg =
      `Olá! Gostaria de agendar os seguintes serviços:\n\n` +
      lines.join('\n') +
      `\n\n*Total estimado: R$${total}*\n\nPoderia confirmar disponibilidade e valor final?`;

    const url = `https://wa.me/5511982534271?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  });

  updateUI();
})();

/* ═══════════════════════════════════════════════════════════════
   SERVICE TABS
═══════════════════════════════════════════════════════════════ */
(function initServiceTabs() {
  const tabs   = document.querySelectorAll('.svc-tab');
  const panels = document.querySelectorAll('.svc-panel');

  if (!tabs.length || !panels.length) return;

  function switchTab(targetTab) {
    // Deactivate all
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    panels.forEach(p => {
      p.hidden = true;
      p.classList.remove('active');
    });

    // Activate selected
    targetTab.classList.add('active');
    targetTab.setAttribute('aria-selected', 'true');

    const targetPanelId = targetTab.getAttribute('aria-controls');
    const targetPanel   = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.hidden = false;
      targetPanel.classList.add('active');

      // Re-trigger ScrollTrigger reveals inside newly shown panel
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab));

    // Keyboard: arrow left/right to switch tabs
    tab.addEventListener('keydown', (e) => {
      const tabArray = Array.from(tabs);
      const idx = tabArray.indexOf(tab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        switchTab(tabArray[(idx + 1) % tabArray.length]);
        tabArray[(idx + 1) % tabArray.length].focus();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        switchTab(tabArray[(idx - 1 + tabArray.length) % tabArray.length]);
        tabArray[(idx - 1 + tabArray.length) % tabArray.length].focus();
      }
    });
  });
})();
