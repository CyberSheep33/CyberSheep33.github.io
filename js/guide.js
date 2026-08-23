/* ============================================================
   CyberSheep — Guide 页通用交互（代码复制按钮）
   用法：`.code-block` 内放一个 `<pre>`，并放一个 `.copy-btn`，
   点击复制该 pre 的文本。
   ============================================================ */
(function () {
  'use strict'

  function toast(msg) {
    var el = document.getElementById('toast')
    if (!el) return
    el.textContent = msg
    el.classList.add('toast--show')
    clearTimeout(toast._t)
    toast._t = setTimeout(function () { el.classList.remove('toast--show') }, 1800)
  }

  function copyText(text, okMsg) {
    function done() { toast(okMsg || '已复制') }
    function fail() { toast('复制失败，请手动复制') }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fail)
    } else {
      var ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try {
        var ok = document.execCommand('copy')
        ok ? done() : fail()
      } catch (e) {
        fail()
      }
      document.body.removeChild(ta)
    }
  }

  document.querySelectorAll('.code-block').forEach(function (block) {
    var btn = block.querySelector('.copy-btn')
    var pre = block.querySelector('pre')
    if (!btn || !pre) return
    btn.addEventListener('click', function () {
      copyText(pre.textContent.trim())
      // 短暂反馈按钮文案
      var original = btn.textContent
      btn.textContent = '已复制 ✓'
      setTimeout(function () { btn.textContent = original }, 1400)
    })
  })
})()
