/* ============================================================
   CyberSheep 赛博小羊 — Interactive Logic
   Scroll effects, navigation, animations, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     DOM References
     ========================================================== */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const allSections = document.querySelectorAll('section[id]');

  /* ==========================================================
     Mobile Navigation Overlay
     ========================================================== */
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function openMenu() {
    navLinks.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', '关闭菜单');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '展开菜单');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  // Close menu when a nav link is clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  });

  /* ==========================================================
     Nav Scroll Effect
     ========================================================== */
  function updateNav() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // initial check

  /* ==========================================================
     Active Nav Link (Intersection Observer)
     ========================================================== */
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        allNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-section') === id);
        });
      }
    });
  }, observerOptions);

  allSections.forEach(section => sectionObserver.observe(section));

  /* ==========================================================
     Scroll-in Animations
     ========================================================== */

  // Mark elements for animation
  const animatableSelectors = [
    '.feature-card',
    '.tool-card',
    '.model-card',
    '.blog-topic-card',
    '.community-card',
    '.section-badge',
    '.section-title',
    '.section-desc',
    '.btn-outline',
    '.login-method',
    '.email-link',
  ];

  animatableSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('animate-on-scroll');
      // Add stagger class for card grids
      if (el.parentElement) {
        const parent = el.parentElement;
        const siblings = parent.querySelectorAll(selector);
        if (siblings.length > 1) {
          const i = Array.from(siblings).indexOf(el);
          const staggerClass = `animate-stagger-${Math.min(i + 1, 6)}`;
          el.classList.add(staggerClass);
        }
      }
    });
  });

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    animationObserver.observe(el);
  });

  /* ==========================================================
     Email Copy-to-Clipboard
     ========================================================== */
  const emailLink = document.querySelector('.email-link');
  const emailHint = document.querySelector('.email-hint');

  if (emailLink && emailHint) {
    emailLink.addEventListener('click', (e) => {
      const email = 'cybersheep33@gmail.com';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          emailHint.textContent = '✅ 已复制到剪贴板';
          setTimeout(() => {
            emailHint.textContent = '点击复制邮箱地址';
          }, 2000);
        }).catch(() => {
          // Clipboard failed, mailto still opens
        });
      }
    });
  }

  /* ==========================================================
     Keyboard Accessibility — Escape to close menu
     ========================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      navToggle.focus();
    }
  });

});
