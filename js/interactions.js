/* ============================================================
   INTERACTIONS — one motion system for the whole site
   Order: nav → reveal → spotlight → magnetic → toc → progress
   ============================================================ */

window.Interactions = (function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- Navbar: transparent → blurred surface ---------- */

  function navbar() {
    const bar = document.querySelector('[data-topbar]');
    if (!bar) return;
    const onScroll = () => {
      bar.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav disclosure ---------- */

  function mobileNav() {
    const btn = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-mobile-nav]');
    if (!btn || !panel) return;

    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', '打开导航菜单');
      panel.hidden = true;
      document.body.classList.remove('nav-open');
    };

    const open = () => {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', '关闭导航菜单');
      panel.hidden = false;
      document.body.classList.add('nav-open');
    };

    btn.addEventListener('click', () => {
      btn.getAttribute('aria-expanded') === 'true' ? close() : open();
    });

    // Same-page anchors don't reload, so close explicitly.
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        close();
        btn.focus();
      }
    });

    // Leaving the mobile breakpoint must not strand an open panel.
    const wide = window.matchMedia('(min-width: 861px)');
    const onChange = () => {
      if (wide.matches) close();
    };
    wide.addEventListener ? wide.addEventListener('change', onChange) : wide.addListener(onChange);
  }

  /* ---------- Scroll progress ---------- */

  function progress() {
    const el = document.querySelector('[data-progress]');
    if (!el || reduced.matches) return;
    let raf = null;
    const update = () => {
      raf = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${pct.toFixed(4)})`;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (raf === null) raf = requestAnimationFrame(update);
      },
      { passive: true },
    );
    update();
  }

  /* ---------- Section reveal ---------- */

  function reveal() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduced.matches || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in', 'is-done'));
      return;
    }

    // Anything already in the first screen shows immediately — no
    // "loading" feel above the fold.
    const vh = window.innerHeight;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('is-in');
          observer.unobserve(el);
          el.addEventListener(
            'transitionend',
            () => el.classList.add('is-done'),
            { once: true },
          );
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    items.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) {
        el.classList.add('is-in');
        return;
      }
      observer.observe(el);
    });
  }

  /* ---------- Spotlight (lead capability card only) ---------- */

  function spotlight() {
    if (!finePointer.matches || reduced.matches) return;
    document.querySelectorAll('[data-spotlight]').forEach((card) => {
      card.addEventListener(
        'pointermove',
        (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        },
        { passive: true },
      );
    });
  }

  /* ---------- Magnetic primary CTA ---------- */

  function magnetic() {
    if (!finePointer.matches || reduced.matches) return;
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const reset = () => {
        btn.style.transform = '';
      };
      btn.addEventListener(
        'pointermove',
        (e) => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          const max = 4;
          btn.style.transform = `translate(${(dx * max).toFixed(2)}px, ${(dy * max).toFixed(2)}px)`;
        },
        { passive: true },
      );
      btn.addEventListener('pointerleave', reset);
      btn.addEventListener('blur', reset);
    });
  }

  function projectExplorer() {
    const root = document.querySelector('[data-project-explorer]');
    if (!root || !window.SHOWCASE_DATA) return;
    const rows = Array.from(root.querySelectorAll('[data-project-id]'));
    const preview = root.querySelector('[data-project-preview]');
    const frame = root.querySelector('[data-project-frame]');
    const title = root.querySelector('[data-project-title]');
    const scene = root.querySelector('[data-project-scene]');
    const result = root.querySelector('[data-project-result]');
    const kind = root.querySelector('[data-project-kind]');
    const count = root.querySelector('[data-project-count]');
    const link = root.querySelector('[data-project-link]');
    const data = window.SHOWCASE_DATA.projects || [];
    const esc = (value) => String(value || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const kindOf = (project) => window.UI.kindOf(project);
    const activate = (id) => {
      const project = data.find((item) => item.id === id);
      const row = rows.find((item) => item.dataset.projectId === id);
      if (!project || !row) return;
      rows.forEach((item) => {
        const active = item === row;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-current', active ? 'true' : 'false');
      });
      preview.classList.add('is-switching');
      window.setTimeout(() => {
        frame.innerHTML = `<div class="frame"><div class="frame-bar"><i></i><i></i><i></i><b>${esc(project.name)}</b></div><div class="frame-media"><img src="${esc(project.cover)}" alt="${esc(project.name)}" /></div></div>`;
        title.textContent = project.name || '';
        scene.textContent = project.scene || '';
        result.textContent = project.result || '';
        kind.textContent = kindOf(project);
        count.textContent = `${String(data.indexOf(project) + 1).padStart(2, '0')} / ${String(data.length).padStart(2, '0')}`;
        link.href = `project.html?id=${encodeURIComponent(project.id)}`;
        preview.classList.remove('is-switching');
      }, reduced.matches ? 0 : 120);
    };
    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => activate(row.dataset.projectId));
      row.addEventListener('focus', () => activate(row.dataset.projectId));
    });
  }

  /* ---------- Technical hero depth + custom pointer ---------- */

  function technicalStage() {
    const stage = document.querySelector('[data-tech-stage]');
    if (!stage || !finePointer.matches || reduced.matches) return;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty('--stage-x', `${((e.clientX - r.left) / r.width - .5) * 28}px`);
      stage.style.setProperty('--stage-y', `${((e.clientY - r.top) / r.height - .5) * 22}px`);
    }, { passive: true });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--stage-x', '0px');
      stage.style.setProperty('--stage-y', '0px');
    }, { passive: true });
  }

  function customCursor() {
    if (!finePointer.matches || reduced.matches) return;
    const dot = document.createElement('span');
    dot.className = 'pointer-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-pointer');
    window.addEventListener('pointermove', (e) => {
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    }, { passive: true });
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('pointerenter', () => document.documentElement.classList.add('cursor-focus'));
      el.addEventListener('pointerleave', () => document.documentElement.classList.remove('cursor-focus'));
    });
  }

  function contactFeedback() {
    document.querySelectorAll('[data-contact]').forEach((link) => {
      link.addEventListener('click', () => {
        const toast = document.createElement('span');
        toast.className = 'contact-toast';
        toast.textContent = '正在打开联系方式';
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('is-visible'));
        window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
        window.setTimeout(() => toast.remove(), 2200);
      });
    });
  }

  /* ---------- Case TOC active state ---------- */

  function toc() {
    const nav = document.querySelector('[data-toc]');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a'));
    const sections = links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((a) =>
            a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`),
          );
        });
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
  }

  function init() {
    document.documentElement.classList.remove('no-js');
    navbar();
    mobileNav();
    reveal();
    spotlight();
    magnetic();
    projectExplorer();
    technicalStage();
    contactFeedback();
    toc();
    progress();
  }

  return { init };
})();
