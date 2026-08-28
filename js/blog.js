/* CyberSheep — 博客平台、博主与精选文章渲染 */
(function () {
  'use strict'
  var data = window.CYBERSHEEP_DATA && window.CYBERSHEEP_DATA.blogs
  if (!data) return

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  function empty(title, message) {
    return '<div class="content-empty"><strong>' + esc(title) + '</strong><span>' + esc(message) + '</span></div>'
  }

  var platforms = document.getElementById('blogPlatformGrid')
  if (platforms) {
    platforms.innerHTML = data.platforms.length ? data.platforms.map(function (item) {
      return '<a class="blog-platform-card" href="' + esc(item.url) + '" target="_blank" rel="noopener">' +
        '<span class="blog-platform-index">' + String(item.order || 0).padStart(2, '0') + '</span>' +
        '<strong>' + esc(item.name) + '</strong><p>' + esc(item.description) + '</p><b>访问平台 →</b></a>'
    }).join('') : empty('平台入口正在整理', '提供真实链接后会显示在这里。')
  }

  var creators = document.getElementById('blogCreatorGrid')
  if (creators) {
    creators.innerHTML = data.creators.length ? data.creators.map(function (item) {
      var topics = (item.topics || []).map(function (topic) { return '<span>' + esc(topic) + '</span>' }).join('')
      var links = (item.links || []).map(function (link) {
        return '<a href="' + esc(link.url) + '" target="_blank" rel="noopener">' + esc(link.platform) + ' →</a>'
      }).join('')
      return '<article class="blog-creator-card"><div class="blog-creator-mark" aria-hidden="true">' + esc(item.name.charAt(0)) + '</div>' +
        '<div><h3>' + esc(item.name) + '</h3><p>' + esc(item.description) + '</p>' +
        '<div class="blog-topics">' + topics + '</div><div class="blog-creator-links">' + links + '</div></div></article>'
    }).join('') : empty('精选博主正在整理', '我们只展示经过确认的真实创作者与主页。')
  }

  var articles = document.getElementById('blogArticleList')
  if (articles) {
    articles.innerHTML = data.articles.length ? data.articles.map(function (item) {
      return '<a class="blog-article-item" href="' + esc(item.url) + '" target="_blank" rel="noopener"><div><small>' +
        esc(item.platform || '原文') + ' · ' + esc(item.author || '') + '</small><h3>' + esc(item.title) + '</h3><p>' + esc(item.summary) +
        '</p></div><span>阅读原文 →</span></a>'
    }).join('') : empty('精选博文即将加入', '后续会按 AI Coding、模型、Agent 和工具配置等主题持续收录。')
  }
})()
