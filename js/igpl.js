/* ==========================================================================
   IGPL Core JS v2
   Scroll reveals, animated counters, nav behavior, value chain, accordion
   ========================================================================== */

(function() {
  'use strict';

  // ---- Scroll Reveal ----
  function initScrollReveal() {
    const els = document.querySelectorAll('.igpl-reveal, .igpl-reveal-left, .igpl-reveal-right, .igpl-stagger');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('igpl-reveal--visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  // ---- Animated Counters ----
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const startTime = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(target * easeOut(progress));
      el.textContent = prefix + value.toLocaleString('en-IN') + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.counted) {
          e.target.dataset.counted = 'true';
          animateCounter(e.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => obs.observe(el));
  }

  // ---- Nav Behavior (transparent -> solid on scroll) ----
  function initNav() {
    const nav = document.querySelector('[data-igpl-nav]');
    if (!nav) return;

    function updateNav() {
      if (window.scrollY > 80) {
        nav.classList.remove('igpl-nav--transparent');
        nav.classList.add('igpl-nav--solid');
      } else {
        nav.classList.add('igpl-nav--transparent');
        nav.classList.remove('igpl-nav--solid');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('menu-backdrop');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      if (backdrop) backdrop.classList.toggle('hidden');
    });

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        menu.classList.add('hidden');
        backdrop.classList.add('hidden');
      });
    }
  }

  // ---- Value Chain Interactivity ----
  function initValueChain() {
    const nodes = document.querySelectorAll('[data-vc-node]');
    if (!nodes.length) return;

    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        node.style.transform = 'scale(1.08)';
        node.style.boxShadow = '0 8px 30px rgba(0,124,102,0.25)';
      });
      node.addEventListener('mouseleave', () => {
        node.style.transform = '';
        node.style.boxShadow = '';
      });
    });
  }

  // ---- FAQ Accordion ----
  function initAccordion() {
    const triggers = document.querySelectorAll('.igpl-accordion__trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.parentElement;
        const isOpen = item.hasAttribute('open');

        // Close siblings
        const siblings = item.parentElement.querySelectorAll('.igpl-accordion__item[open]');
        siblings.forEach(s => {
          if (s !== item) s.removeAttribute('open');
        });

        if (isOpen) {
          item.removeAttribute('open');
        } else {
          item.setAttribute('open', '');
        }
      });
    });
  }

  // ---- Init All ----
  document.addEventListener('DOMContentLoaded', function() {
    initScrollReveal();
    initCounters();
    initNav();
    initMobileMenu();
    initValueChain();
    initAccordion();
  });

})();
