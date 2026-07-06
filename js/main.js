/* ============================================================
   CyberSheep — Minimal Interactions
   ============================================================ */

(function () {
  var emailEl = document.getElementById('emailLink')
  var toastEl = document.getElementById('toast')

  if (!emailEl || !toastEl) return

  var toastTimer = null

  function showToast(msg) {
    toastEl.textContent = msg
    toastEl.classList.add('toast--show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('toast--show')
    }, 1800)
  }

  emailEl.addEventListener('click', function () {
    var email = emailEl.textContent.trim()
    if (!email) return

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () {
        showToast('邮箱已复制 ✅')
      }).catch(function () {
        fallbackCopy(email)
      })
    } else {
      fallbackCopy(email)
    }
  })

  function fallbackCopy(text) {
    var ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    ta.style.top = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try {
      var ok = document.execCommand('copy')
      showToast(ok ? '邮箱已复制 ✅' : '复制失败，请手动复制')
    } catch (e) {
      showToast('复制失败，请手动复制')
    }
    document.body.removeChild(ta)
  }
})()