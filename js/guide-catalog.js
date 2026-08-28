/* CyberSheep — 快速开始：工具 × 模型 × 配置方式路线导航 */
(function () {
  'use strict'

  var data = window.CYBERSHEEP_DATA && window.CYBERSHEEP_DATA.tutorials
  var toolGrid = document.getElementById('guideToolGrid')
  var routeGroups = document.getElementById('guideRouteGroups')
  if (!toolGrid || !routeGroups) return

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  if (!data) {
    toolGrid.innerHTML = '<div class="content-empty"><strong>教程数据未加载</strong><span>请刷新页面或重新生成站点数据。</span></div>'
    routeGroups.innerHTML = ''
    return
  }

  var routes = data.routes.filter(function (route) { return route.status === 'published' })
  var toolMap = {}, modelMap = {}, methodMap = {}
  data.tools.forEach(function (item) { toolMap[item.id] = item })
  data.models.forEach(function (item) { modelMap[item.id] = item })
  data.methods.forEach(function (item) { methodMap[item.id] = item })

  var publishedTools = data.tools.filter(function (tool) {
    return tool.status === 'published' && routes.some(function (route) { return route.tool === tool.id })
  })
  var plannedTools = data.tools.filter(function (tool) { return tool.status === 'planned' })
  var currentTool = ''

  function toolInitial(tool) {
    return tool.name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (word) {
      return word.charAt(0)
    }).join('').toUpperCase()
  }

  function renderTools() {
    if (!publishedTools.length) {
      toolGrid.innerHTML = '<div class="content-empty"><strong>暂无已发布教程</strong><span>教程上线后会显示在这里。</span></div>'
      return
    }
    toolGrid.innerHTML = publishedTools.map(function (tool) {
      var count = routes.filter(function (route) { return route.tool === tool.id }).length
      return '<button class="guide-tool-card' + (tool.id === currentTool ? ' is-active' : '') + '" type="button" data-tool="' + esc(tool.id) + '" aria-pressed="' + (tool.id === currentTool ? 'true' : 'false') + '">' +
        '<span class="guide-tool-mark" aria-hidden="true">' + esc(toolInitial(tool)) + '</span>' +
        '<span class="guide-tool-copy"><strong>' + esc(tool.name) + '</strong><span>' + esc(tool.summary) + '</span></span>' +
        '<span class="guide-tool-side"><small>' + esc(tool.kind) + '</small><b>' + (tool.id === currentTool ? '已选择' : count + ' 条路线') + '</b></span>' +
      '</button>'
    }).join('')
  }

  function routeHref(route) {
    return '../' + String(route.url || '').replace(/^\.\//, '')
  }

  function routeCard(route) {
    var method = methodMap[route.method] || {}
    var difficulty = { beginner: '入门', intermediate: '进阶', advanced: '高级' }[route.difficulty] || route.difficulty
    return '<a class="guide-route-card" href="' + esc(routeHref(route)) + '">' +
      '<div class="guide-route-top"><span class="guide-route-method">' + esc(method.series || '配置教程') + '</span>' +
        (route.recommended ? '<span class="guide-route-recommended">推荐</span>' : '') + '</div>' +
      '<h3>' + esc(route.title) + '</h3><p>' + esc(route.summary) + '</p>' +
      '<div class="guide-route-meta"><span>' + esc(method.name || route.method) + '</span><span>' + esc(difficulty) + '</span>' +
        (route.requires_local_router ? '<span>需要本地路由</span>' : '') + '</div>' +
      '<div class="guide-route-foot"><small>验证于 ' + esc(route.verified_at || '待核验') + '</small><span>查看教程 →</span></div>' +
    '</a>'
  }

  function renderRoutes() {
    var tool = toolMap[currentTool]
    var selected = routes.filter(function (route) { return route.tool === currentTool })
    var title = document.getElementById('guideRouteTitle')
    var summary = document.getElementById('guideRouteSummary')
    var selectedTool = document.getElementById('guideSelectedTool')
    var stage = document.getElementById('guideRoutesStage')
    if (title) title.textContent = tool ? tool.name + ' 配置路线' : '选择配置路线'
    if (summary) summary.textContent = tool
      ? '先选择模型目标，再进入该工具实际支持的配置方式。不会显示不兼容组合。'
      : '请先在第一步选择一个工具。'
    if (stage) stage.classList.toggle('is-ready', Boolean(tool))
    if (selectedTool) {
      selectedTool.hidden = !tool
      selectedTool.innerHTML = tool
        ? '<span>当前工具</span><strong>' + esc(tool.name) + '</strong><small>' + selected.length + ' 条可用路线</small>'
        : ''
    }
    if (!selected.length) {
      routeGroups.innerHTML = tool
        ? '<div class="guide-route-empty"><span aria-hidden="true">↗</span><strong>暂无可用路线</strong><p>该工具的教程正在整理。</p></div>'
        : '<div class="guide-route-empty guide-route-empty--waiting"><span aria-hidden="true">1</span><strong>等待选择工具</strong><p>选择后，这里会按“原生模型”和“其他模型”列出可用教程。</p></div>'
      return
    }

    var groups = {}
    selected.forEach(function (route) { (groups[route.model] = groups[route.model] || []).push(route) })
    routeGroups.innerHTML = Object.keys(groups).sort(function (a, b) {
      return ((modelMap[a] || {}).order || 9999) - ((modelMap[b] || {}).order || 9999)
    }).map(function (modelId) {
      var model = modelMap[modelId] || { name: modelId, summary: '' }
      return '<section class="guide-model-group"><header><span>' + (model.category === 'native' ? '原生模型' : '其他模型') +
        '</span><h3>' + esc(model.name) + '</h3><p>' + esc(model.summary) + '</p></header>' +
        '<div class="guide-route-grid">' + groups[modelId].map(routeCard).join('') + '</div></section>'
    }).join('')
  }

  function renderPlanned() {
    var wrap = document.getElementById('guidePlannedTools')
    if (!wrap) return
    wrap.innerHTML = plannedTools.map(function (tool) {
      return '<span class="guide-planned-item"><b>' + esc(tool.name) + '</b><small>' + esc(tool.kind) + ' · 规划中</small></span>'
    }).join('')
  }

  function renderSupport() {
    var wrap = document.getElementById('guideSupportGrid')
    if (!wrap) return
    wrap.innerHTML = data.support_links.map(function (item) {
      return '<a class="guide-support-card" href="../' + esc(item.url) + '"><strong>' + esc(item.title) + '</strong><span>' + esc(item.summary) + '</span><b>查看 →</b></a>'
    }).join('')
  }

  function selectTool(id, updateUrl) {
    if (!toolMap[id] || !publishedTools.some(function (tool) { return tool.id === id })) return
    currentTool = id
    renderTools()
    renderRoutes()
    if (updateUrl && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', location.pathname + '?tool=' + encodeURIComponent(id))
    }
    if (updateUrl && window.matchMedia('(max-width: 760px)').matches) {
      window.requestAnimationFrame(function () {
        var stage = document.getElementById('guideRoutesStage')
        if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  toolGrid.addEventListener('click', function (event) {
    var button = event.target.closest('[data-tool]')
    if (button) selectTool(button.getAttribute('data-tool'), true)
  })

  var query = new URLSearchParams(location.search).get('tool')
  currentTool = publishedTools.some(function (tool) { return tool.id === query })
    ? query
    : ''
  renderTools()
  renderRoutes()
  renderPlanned()
  renderSupport()
})()
