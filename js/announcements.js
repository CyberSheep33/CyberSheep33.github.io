/* ============================================================
   CyberSheep — 公告数据 + 列表渲染
   ============================================================
   维护方式：新增 HTML 详情页后，在 data/announcements.json 登记元数据，
   运行 scripts/build-site-data.py。首页与公告中心会自动更新。
   ============================================================ */
(function () {
  'use strict'

  var ANNOUNCEMENTS = (window.CYBERSHEEP_DATA && window.CYBERSHEEP_DATA.announcements) || []
  var filterState = { q: '', category: '' }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  // 根据当前页面位置拼接相对 URL：
  // 在 /announcements/ 下 → 直接 `slug.html`
  // 在根目录/其他目录 → `announcements/slug.html`
  function announceUrl(announcement) {
    var inAnnounceDir = /\/announcements\/[^/]*$/.test(location.pathname)
    return (inAnnounceDir ? '' : 'announcements/') + announcement.slug + '.html'
  }

  function renderAnnouncements() {
    var list = document.getElementById('announceList')
    if (!list) return

    var max = list.hasAttribute('data-max') ? parseInt(list.getAttribute('data-max'), 10) : ANNOUNCEMENTS.length
    if (!(max > 0)) max = ANNOUNCEMENTS.length

    var items = ANNOUNCEMENTS.filter(function (item) {
      if (filterState.category && item.category !== filterState.category) return false
      if (!filterState.q) return true
      var haystack = [item.title, item.excerpt, item.category].concat(item.keywords || []).join(' ').toLowerCase()
      return haystack.indexOf(filterState.q) >= 0
    }).slice(0, max)
    var count = document.getElementById('announceCount')
    if (count) count.textContent = '找到 ' + items.length + ' 条内容'
    if (!items.length) {
      list.innerHTML = '<li class="content-empty"><strong>暂无公告</strong><span>新内容发布后会显示在这里。</span></li>'
      return
    }
    list.innerHTML = items.map(function (a) {
      return (
        '<li>' +
          '<a class="announce-item" href="' + announceUrl(a) + '">' +
            '<time datetime="' + esc(a.date) + '">' + esc(a.date) + '</time>' +
            '<p>' +
              '<span class="announce-meta">' + esc(a.category || '公告') + '</span>' +
              '<strong>' + esc(a.title) + '</strong>' +
              '<span class="announce-excerpt">' + esc(a.excerpt) + '</span>' +
              '<span class="announce-more">阅读全文</span>' +
            '</p>' +
          '</a>' +
        '</li>'
      )
    }).join('')
  }

  function bindAnnouncementFilters() {
    var search = document.getElementById('announceSearch')
    var categories = document.getElementById('announceCategories')
    if (!search || !categories) return

    var values = []
    ANNOUNCEMENTS.forEach(function (item) {
      if (item.category && values.indexOf(item.category) < 0) values.push(item.category)
    })
    categories.innerHTML = [''].concat(values).map(function (category) {
      return '<button type="button" data-category="' + esc(category) + '" class="announce-category' + (!category ? ' is-active' : '') + '">' + esc(category || '全部') + '</button>'
    }).join('')

    search.addEventListener('input', function () {
      filterState.q = search.value.trim().toLowerCase()
      renderAnnouncements()
    })
    categories.addEventListener('click', function (event) {
      var button = event.target.closest('[data-category]')
      if (!button) return
      filterState.category = button.getAttribute('data-category')
      Array.prototype.forEach.call(categories.querySelectorAll('[data-category]'), function (item) {
        item.classList.toggle('is-active', item === button)
      })
      renderAnnouncements()
    })
  }

  /* ============================================================
     公告详情页翻页导航
     在每个公告详情页的 #announceNav 占位处渲染「上一篇 / 下一篇」，
     顺序跟随 ANNOUNCEMENTS 数组（最新在前）：数组前一项即「上一篇」，
     后一项即「下一篇」。新增公告时无需改导航逻辑。
     ============================================================ */
  function renderAnnouncementNav() {
    var el = document.getElementById('announceNav')
    if (!el) return

    var m = location.pathname.match(/\/([^/]+)\.html$/)
    var slug = m ? m[1] : ''
    var idx = -1
    for (var i = 0; i < ANNOUNCEMENTS.length; i++) {
      if (ANNOUNCEMENTS[i].slug === slug) { idx = i; break }
    }
    if (idx < 0) return

    var prev = idx > 0 ? ANNOUNCEMENTS[idx - 1] : null
    var next = idx < ANNOUNCEMENTS.length - 1 ? ANNOUNCEMENTS[idx + 1] : null

    var html =
      '<div class="announce-nav-head">' +
        '<span>公告导航</span>' +
        '<a href="index.html">返回公告中心</a>' +
      '</div>' +
      '<div class="announce-pager">'

    if (prev) {
      html += '<a class="announce-pager-item" href="' + prev.slug + '.html">' +
                '<small>← 上一篇</small><span>' + prev.title + '</span></a>'
    } else {
      html += '<span class="announce-pager-item is-empty"></span>'
    }

    if (next) {
      html += '<a class="announce-pager-item is-next" href="' + next.slug + '.html">' +
                '<small>下一篇 →</small><span>' + next.title + '</span></a>'
    } else {
      html += '<span class="announce-pager-item is-empty"></span>'
    }

    html += '</div>'
    el.innerHTML = html
  }

  function init() {
    bindAnnouncementFilters()
    renderAnnouncements()
    renderAnnouncementNav()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
