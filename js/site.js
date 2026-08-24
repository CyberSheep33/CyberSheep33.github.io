/* ============================================================
   CyberSheep — 站点公共组件（site.js）
   ============================================================
   统一渲染全站公共布局：
   - 顶部 Header：品牌 Logo + 主导航 + 主题切换按钮
   - 页脚 Footer：社区面板（QQ 群二维码 + 邮箱）+ 底部版权
   - Toast 提示容器

   每个页面只需要保留占位符：
     <header class="site-header" id="siteHeader"></header>
     <main> ...页面内容... </main>
     <footer class="site-footer" id="siteFooter"></footer>
     <script src="js/site.js"></script>   ← 必须在 main.js 之前
     <script src="js/main.js"></script>

   说明：
   - 主题切换逻辑在 js/main.js 中（读取 localStorage 的 cybersheep-theme），
     site.js 只负责渲染 DOM，不重复实现主题。
   - 本组件会自动判断当前页面是否位于子目录（announcements/guide/tools），
     并据此给导航与资源路径补上 ../ 前缀，保证在 GitHub Pages 与 file:// 下都能工作。
   ============================================================ */
(function () {
  'use strict'

  /* ============================================================
     生态模块注册表（架构预留）
     ============================================================
     未来新增模块时：
       1. 在仓库根目录新建对应文件夹（如 download/、about/）；
       2. 在下方 NAV 里登记一个导航项（有独立首页的模块用页面链接，
          首页区块类模块用锚点 #xxx）；
       3. 如需独立入口，把模块目录作为该模块的入口页即可。

     本阶段已实现：guide（快速开始中心）、announcements（公告中心）、tools（配置工具）。
     未来预留：download（下载中心）、models（模型广场，暂不实现）、studio、about。
     ============================================================ */

  var NAV = [
    { label: 'API 平台', href: '#api', anchor: true },
    { label: '工具箱', href: '#tools', anchor: true },
    { label: '博客', href: '#blog', anchor: true },
    { label: '快速开始', href: 'guide/index.html', section: 'guide' },
    { label: '公告', href: 'announcements/index.html', section: 'announcements' },
    { label: 'SheepAI-Lab', href: '#lab', anchor: true },
    { label: '项目', href: '#projects', anchor: true }
  ]

  var BRAND_IMG = 'assets/cybersheep.png'
  var QR_IMG = 'assets/QQ-group-qcode.jpg'
  var EMAIL = 'cybersheep33@gmail.com'
  var COPYRIGHT = '© 2026 CyberSheep 赛博小羊'

  /* 是否位于子目录（guide / announcements / tools） */
  function isSubPage() {
    return /\/guide\/|\/announcements\/|\/tools\//.test(location.pathname)
  }

  var base = isSubPage() ? '../' : ''

  function currentSection() {
    var p = location.pathname
    if (/\/guide\//.test(p)) return 'guide'
    if (/\/announcements\//.test(p)) return 'announcements'
    if (/\/tools\//.test(p)) return 'tools'
    return ''
  }

  function renderHeader() {
    var el = document.getElementById('siteHeader')
    if (!el) return

    var brandHref = base ? base + 'index.html' : '#top'
    var active = currentSection()

    var navHtml = NAV.map(function (item) {
      var href = base + item.href
      var isActive = item.section && item.section === active
      return '<a href="' + href + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
        item.label + '</a>'
    }).join('')

    el.innerHTML =
      '<a class="brand-mark" href="' + brandHref + '" aria-label="CyberSheep 首页">' +
        '<img src="' + base + BRAND_IMG + '" alt="" width="38" height="38">' +
        '<span><strong>CyberSheep</strong><em>赛博小羊</em></span>' +
      '</a>' +
      '<nav class="site-nav" aria-label="主要入口">' + navHtml + '</nav>' +
      '<button class="theme-toggle" id="themeToggle" type="button" aria-label="切换主题">🌙</button>'
  }

  function renderFooter() {
    var el = document.getElementById('siteFooter')
    if (!el) return

    el.innerHTML =
      '<div class="community-panel">' +
        '<button class="qr-thumb" type="button" popovertarget="qqQrPreview" aria-label="点击放大官方 QQ 群二维码">' +
          '<img src="' + base + QR_IMG + '" alt="赛博小羊官方 QQ 群二维码" width="112" height="112" loading="lazy">' +
          '<span class="qr-zoom-hint">点击放大</span>' +
        '</button>' +
        '<div>' +
          '<p>扫码加入官方 QQ 群，交流 AI 使用心得、获取模型上架资讯、反馈问题建议。</p>' +
          '<button class="email-button" id="emailLink" type="button" title="点击复制邮箱地址">' + EMAIL + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="qr-lightbox" id="qqQrPreview" popover>' +
        '<div class="qr-lightbox-card">' +
          '<button class="qr-lightbox-close" type="button" popovertarget="qqQrPreview" popovertargetaction="hide" aria-label="关闭二维码预览">×</button>' +
          '<img src="' + base + QR_IMG + '" alt="赛博小羊官方 QQ 群二维码大图">' +
          '<p>扫描二维码加入赛博小羊官方 QQ 群</p>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>' + COPYRIGHT + '</span>' +
        '<a href="https://sheepaiplus.top" target="_blank" rel="noopener">Sheep AI Plus</a>' +
      '</div>'
  }

  function ensureToast() {
    if (document.getElementById('toast')) return
    var t = document.createElement('div')
    t.className = 'toast'
    t.id = 'toast'
    t.setAttribute('aria-live', 'polite')
    document.body.appendChild(t)
  }

  renderHeader()
  renderFooter()
  ensureToast()
})()
