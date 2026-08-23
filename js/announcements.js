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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAnnouncements)
  } else {
    renderAnnouncements()
  }
})()
