/* ============================================================
   CyberSheep — Theme Toggle · Repo Render · Email Copy
   ============================================================ */
(function () {
  'use strict'

  /* ---------- 主题 ---------- */
  var THEME_KEY = 'cybersheep-theme'
  var root = document.documentElement
  var themeToggle = document.getElementById('themeToggle')

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙'
    if (persist) localStorage.setItem(THEME_KEY, theme)
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY)
    applyTheme(saved === 'dark' || saved === 'light' ? saved : systemTheme(), false)
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next, true)
    })
  }

  /* ---------- 仓库卡片 ---------- */
  var REPOS = [
    {
      name: 'sheepai-creator',
      desc: '跨平台 AI 图像 / 视频创作桌面应用',
      lang: 'TypeScript',
      url: 'https://github.com/SheepAI-Lab/sheepai-creator'
    },
    {
      name: 'sheepai-hud',
      desc: 'SheepAI 用户信息、余额与 API Token 用量桌面小组件',
      lang: 'Swift',
      url: 'https://github.com/SheepAI-Lab/sheepai-hud'
    }
    // 新增小项目：复制上面一条对象即可（name/desc/lang/url）
  ]

  var LANG_COLORS = {
    TypeScript: '#3178c6',
    Swift: '#f05138',
    Shell: '#89e051'
  }

  function langStyle(lang) {
    return LANG_COLORS[lang] ? 'color:' + LANG_COLORS[lang] + ';' : ''
  }

  function renderRepos() {
    var grid = document.getElementById('repoGrid')
    if (!grid) return
    grid.innerHTML = REPOS.map(function (r) {
      return (
        '<a class="repo-card" href="' + r.url + '" target="_blank" rel="noopener">' +
          '<h3>' + r.name + '</h3>' +
          '<p>' + r.desc + '</p>' +
          '<span class="repo-lang" style="' + langStyle(r.lang) + '">' + r.lang + '</span>' +
          '<span class="repo-link">GitHub →</span>' +
        '</a>'
      )
    }).join('')
  }

  /* ---------- 邮箱复制 ---------- */
  var emailEl = document.getElementById('emailLink')
  var toastEl = document.getElementById('toast')
  var toastTimer = null

  function showToast(msg) {
    if (!toastEl) return
    toastEl.textContent = msg
    toastEl.classList.add('toast--show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('toast--show')
    }, 1800)
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('邮箱已复制')
      }).catch(function () {
        fallbackCopy(text)
      })
    } else {
      fallbackCopy(text)
    }
  }

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
      showToast(ok ? '邮箱已复制' : '复制失败，请手动复制')
    } catch (e) {
      showToast('复制失败，请手动复制')
    }
    document.body.removeChild(ta)
  }

  if (emailEl) {
    emailEl.addEventListener('click', function () {
      copyText(emailEl.textContent.trim())
    })
  }

  /* ---------- 初始化 ---------- */
  initTheme()
  renderRepos()
})()
