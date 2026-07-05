/* ============================================================
   CyberSheep 赛博小羊 — Dashboard Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     Email Copy-to-Clipboard
     ========================================================== */
  const emailLink = document.getElementById('emailLink');
  if (emailLink) {
    emailLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'cybersheep33@gmail.com';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          emailLink.style.color = 'var(--cyan)';
          emailLink.textContent = '✅ 已复制!';
          setTimeout(() => {
            emailLink.style.color = '';
            emailLink.textContent = '✉️ cybersheep33@gmail.com';
          emailLink.style.whiteSpace = 'nowrap';
          }, 2000);
        }).catch(() => {
          // fallback — still open mailto
          window.location.href = 'mailto:' + email;
        });
      } else {
        window.location.href = 'mailto:' + email;
      }
    });
  }

  /* ==========================================================
     Gentle card entrance animation on load
     ========================================================== */
  const cards = document.querySelectorAll('.info-card, .model-chip');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 80 * (i + 1));
  });

});
