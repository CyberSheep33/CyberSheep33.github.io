/* ============================================================
   CyberSheep — 公告数据 + 列表渲染
   ============================================================
   维护方式：新增公告时
   1. 在 announcements/ 下新建 HTML 详情页
   2. 在下方 ANNOUNCEMENTS 数组里增加一条记录（最新放最前）
   首页与公告中心会自动渲染，无需再改页面 HTML。
   ============================================================ */
(function () {
  'use strict'

  var ANNOUNCEMENTS = [
    {
      date: '2026-08-24',
      title: 'Sheep AI Plus 分组介绍：类别、倍率与用途速查',
      excerpt: '按类别列出 Sheep AI Plus 常用分组、倍率与用途，帮你按场景快速选组。',
      slug: 'sheep-ai-plus-group-intro'
    },
    {
      date: '2026-08-23',
      title: 'Sheep AI Plus 分组机制说明：选对分组，价格差好几倍',
      excerpt: '创建令牌时默认智能路由自动选组，手动选择合适分组可以便宜很多。',
      slug: 'sheep-ai-plus-group-guide'
    },
    {
      date: '2026-08-20',
      title: 'Sheep AI → Sheep AI Plus 计费对照',
      excerpt: '新旧分组、倍率与人民币费率对照，一目了然看变化，支持搜索筛选。',
      slug: 'billing-comparison'
    },
    {
      date: '2026-08-20',
      title: 'Sheep AI → Sheep AI Plus 迁移通知',
      excerpt: '账号基础数据自动迁移、旧站余额继续使用，新站统一采用真实 USD 计价。',
      slug: 'sheep-ai-plus-migration'
    },
    {
      date: '2026-07-24',
      title: 'sheepai-creator 桌面应用上线',
      excerpt: '跨平台 AI 图像 / 视频创作客户端，源码已开源在 SheepAI-Lab。',
      slug: 'creator-desktop-launch'
    }
  ]

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

    var items = ANNOUNCEMENTS.slice(0, max)
    list.innerHTML = items.map(function (a) {
      return (
        '<li>' +
          '<a class="announce-item" href="' + announceUrl(a) + '">' +
            '<time datetime="' + a.date + '">' + a.date + '</time>' +
            '<p>' +
              '<strong>' + a.title + '</strong>' +
              '<span class="announce-excerpt">' + a.excerpt + '</span>' +
              '<span class="announce-more">阅读全文</span>' +
            '</p>' +
          '</a>' +
        '</li>'
      )
    }).join('')
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
    renderAnnouncements()
    renderAnnouncementNav()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
