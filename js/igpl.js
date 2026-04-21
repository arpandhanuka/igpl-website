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

    function openMenu() {
      menu.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      menu.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      if (menu.classList.contains('hidden')) openMenu();
      else closeMenu();
    });

    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // Close menu when any nav link (that isn't an accordion trigger) is clicked
    menu.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => closeMenu());
    });

    // Close with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) closeMenu();
    });

    // Progressive-enhance: collapse Products / Investors sub-items into accordions
    initMobileAccordions(menu);
  }

  // ---- Mobile Accordion Enhancement ----
  // Finds Products / Investors parent links in the mobile menu and wraps the
  // immediately-following sub-item list into a collapsible panel with a chevron.
  function initMobileAccordions(menu) {
    const parents = [
      { href: 'products.html', label: 'Products' },
      { href: 'investors.html', label: 'Investors' }
    ];

    parents.forEach(({ href, label }) => {
      // Find the parent link inside the mobile menu
      const parentLink = menu.querySelector('a[href="' + href + '"]');
      if (!parentLink) return;

      // The sibling sub-list uses pl-4 (padding-left-4) on a flex-col wrapper
      const subList = parentLink.nextElementSibling;
      if (!subList || !subList.classList.contains('pl-4')) return;

      // Build the wrapper: a row with parent label + chevron toggle
      const wrapper = document.createElement('div');
      wrapper.className = 'mobile-accordion-wrapper';

      const triggerRow = document.createElement('div');
      triggerRow.className = 'flex items-center justify-between';

      // Move parentLink into triggerRow (it keeps its own click-to-navigate)
      parentLink.parentNode.insertBefore(wrapper, parentLink);
      triggerRow.appendChild(parentLink);

      // Create the chevron button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-mobile-accordion-trigger', '');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Toggle ' + label + ' sub-menu');
      btn.className = 'p-2 -mr-2 text-[#374151]';
      btn.innerHTML = '<svg class="chevron w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>';
      triggerRow.appendChild(btn);

      wrapper.appendChild(triggerRow);

      // Move subList into wrapper, add the accordion data-attr + collapsed class
      subList.setAttribute('data-mobile-accordion', '');
      wrapper.appendChild(subList);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = subList.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
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
