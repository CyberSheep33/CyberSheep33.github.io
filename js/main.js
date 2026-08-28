/* ============================================================
   CyberSheep — Theme Toggle · Data-driven Projects · Email Copy
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

  /* ---------- 项目与全局链接 ---------- */
  var siteData = window.CYBERSHEEP_DATA || {}
  var projects = siteData.projects || []

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  function classToken(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }

  function projectCard(project) {
    var tags = (project.tags || []).map(function (tag) {
      return '<span class="repo-tag">' + esc(tag) + '</span>'
    }).join('')
    return (
      '<a class="repo-card" href="' + esc(project.repo_url) + '" target="_blank" rel="noopener">' +
        '<div class="repo-card-meta"><span>' + esc(project.creator) + '</span>' +
          '<span class="repo-source">' + (project.source === 'official' ? '官方项目' : '精选项目') + '</span></div>' +
        '<h3>' + esc(project.name) + '</h3>' +
        '<p>' + esc(project.description) + '</p>' +
        (tags ? '<div class="repo-tags">' + tags + '</div>' : '') +
        '<div class="repo-card-foot"><span class="repo-lang repo-lang--' + classToken(project.language) + '">' + esc(project.language) + '</span>' +
          '<span class="repo-link">GitHub</span></div>' +
      '</a>'
    )
  }

  function renderProjectGroup(id, source) {
    var grid = document.getElementById(id)
    if (!grid) return
    var items = projects.filter(function (project) {
      return (!source || project.source === source) && project.featured !== false
    })
    grid.innerHTML = items.length
      ? items.map(projectCard).join('')
      : '<div class="content-empty"><strong>内容正在整理</strong><span>这里将持续收录经过筛选的优质开源项目。</span></div>'
  }

  function applyManagedLinks() {
    var links = siteData.site && siteData.site.links ? siteData.site.links : {}
    var github = document.getElementById('githubLink')
    var blog = document.getElementById('blogIndexLink')
    if (github && links.github) github.href = links.github
    if (blog && links.blog_index) blog.href = links.blog_index
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
  renderProjectGroup('officialProjectGrid', 'official')
  renderProjectGroup('curatedProjectGrid', 'curated')
  renderProjectGroup('repoGrid', '')
  applyManagedLinks()
})()
