/* ============================================================
   CyberSheep — 模型广场（models/）渲染逻辑
   ============================================================
   - 纯静态：数据来自 assets/models-data.js（<script> 注入 window.MODELS_DATA）
   - 布局：左侧筛选侧边栏（类型/分组/标签）+ 中间卡片 + 点击卡片右侧详情侧页
   - 价格公式（已按真实计费日志校验）：
       基础输入 $/1M = model_ratio × 2
       补全 = 输入 × completion_ratio；缓存命中 = 输入 × cache_ratio
       5m/1h 缓存创建 = 输入 × cache_creation_5m/1h_ratio
       某分组最终价 = 基础价 × (group_ratio[分组] × 1.4)
   ============================================================ */
(function () {
  'use strict'

  var BASE_MULT = 2
  var GROUP_FACTOR = 1.4

  var state = {
    data: [],
    groupRatio: {},
    usableGroup: {},
    vendors: [],
    supportedEndpoint: {},
    fetchedAt: '',
    filter: { q: '', type: '', group: '', tag: '' },
    sort: 'default'
  }

  var TYPE_LABEL = { chat: '对话', image: '图像', video: '视频', audio: '音频', vector: '向量' }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function typeLabel(t) {
    var s = String(t || '').trim()
    if (!s) return '其他'
    if (TYPE_LABEL[s.toLowerCase()]) return TYPE_LABEL[s.toLowerCase()]
    return s
  }

  function fmtPrice(v) {
    if (v == null || isNaN(v) || v <= 0) return '—'
    if (v >= 1) return '$' + v.toFixed(2)
    if (v >= 0.01) return '$' + v.toFixed(3)
    return '$' + v.toFixed(4)
  }

  /* ---------- 数据加载 ---------- */
  function loadData() {
    if (!window.MODELS_DATA) return Promise.reject(new Error('MODELS_DATA 未加载'))
    var j = window.MODELS_DATA
    state.data = j.data || []
    state.groupRatio = j.group_ratio || {}
    state.usableGroup = j.usable_group || {}
    state.vendors = j.vendors || []
    state.supportedEndpoint = j.supported_endpoint || {}
    state.fetchedAt = j.fetched_at || ''
    return Promise.resolve()
  }

  /* ---------- 价格计算 ---------- */
  function groupMult(group) {
    var r = state.groupRatio[group]
    return r == null ? null : r * GROUP_FACTOR
  }

  function basePrices(m) {
    var ratio = Number(m.model_ratio) || 0
    if (String(m.quota_type) === '0' && ratio) {
      var input = ratio * BASE_MULT
      return {
        kind: 'token',
        input: input,
        completion: input * (Number(m.completion_ratio) || 1),
        cacheHit: input * (Number(m.cache_ratio) || 0),
        cache5m: input * (Number(m.cache_creation_5m_ratio) || 0),
        cache1h: input * (Number(m.cache_creation_1h_ratio) || 0)
      }
    }
    return { kind: 'unit', price: Number(m.model_price) || 0 }
  }

  function groupPrice(base, group) {
    var mult = groupMult(group)
    if (mult == null) return null
    if (base.kind === 'token') {
      return {
        input: base.input * mult, completion: base.completion * mult,
        cacheHit: base.cacheHit * mult, cache5m: base.cache5m * mult,
        cache1h: base.cache1h * mult, mult: mult
      }
    }
    return { price: base.price * mult, mult: mult }
  }

  function priceLevel(base) {
    if (base.kind === 'token') {
      var p = base.input
      if (p < 0.15) return { cls: 'low', label: '低价' }
      if (p < 2) return { cls: 'mid', label: '中价' }
      return { cls: 'high', label: '高价' }
    }
    if (base.price < 0.02) return { cls: 'low', label: '低价' }
    if (base.price < 0.15) return { cls: 'mid', label: '中价' }
    return { cls: 'high', label: '高价' }
  }

  /* ---------- 厂商 ---------- */
  function vendorOf(m) {
    var vid = m.vendor_id
    for (var i = 0; i < state.vendors.length; i++) {
      if (state.vendors[i].id === vid) return state.vendors[i]
    }
    return null
  }

  function vendorHtml(m) {
    var v = vendorOf(m)
    if (v && v.icon) {
      var file = v.icon.replace(/\./g, '-').toLowerCase()
      return '<span class="model-vendor"><img class="model-vendor-img" alt="' + esc(v.name) + '" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/' + file + '.svg"></span>'
    }
    var name = v ? v.name : (m.model_name || '')
    var letter = (name.charAt(0) || 'A').toUpperCase()
    return '<span class="model-vendor"><span class="model-vendor-letter" aria-hidden="true">' + esc(letter) + '</span></span>'
  }

  /* ---------- 过滤 ---------- */
  function tagsOf(m) {
    return (m.tags || '').split(',').map(function (t) { return t.trim() }).filter(Boolean)
  }

  function visibleModels() {
    var q = state.filter.q.toLowerCase()
    var f = state.filter
    return state.data.filter(function (m) {
      if (f.type && typeLabel(m.model_type) !== f.type) return false
      if (f.group && (m.enable_groups || []).indexOf(f.group) < 0) return false
      if (f.tag && tagsOf(m).indexOf(f.tag) < 0) return false
      if (q) {
        return (m.model_name || '').toLowerCase().indexOf(q) >= 0 ||
          (m.description || '').toLowerCase().indexOf(q) >= 0 ||
          (m.tags || '').toLowerCase().indexOf(q) >= 0
      }
      return true
    })
  }

  function sortedModels(list) {
    var sort = state.sort
    return list.slice().sort(function (a, b) {
      if (sort === 'price-asc' || sort === 'price-desc') {
        var pa = basePrices(a), pb = basePrices(b)
        var va = pa.kind === 'token' ? pa.input : pa.price
        var vb = pb.kind === 'token' ? pb.input : pb.price
        return sort === 'price-asc' ? va - vb : vb - va
      }
      if (sort === 'usage') return (b.usage_count || 0) - (a.usage_count || 0)
      return (a.sort_order == null ? 99999 : a.sort_order) - (b.sort_order == null ? 99999 : b.sort_order)
    })
  }

  /* ---------- 卡片 ---------- */
  function cheapestGroup(base, groups) {
    var best = null
    groups.forEach(function (g) {
      var p = groupPrice(base, g)
      if (p) {
        var v = p.input != null ? p.input : p.price
        if (!best || v < best.v) best = { v: v, group: g, p: p }
      }
    })
    return best
  }

  function modelCard(m) {
    var base = basePrices(m)
    var level = priceLevel(base)
    var groups = Array.isArray(m.enable_groups) ? m.enable_groups : []
    var best = cheapestGroup(base, groups)

    var priceHtml
    if (base.kind === 'token') {
      var hero = best
        ? '<div class="price-hero">低至 <strong>' + fmtPrice(best.p.input) + '</strong><span class="price-hero-unit">/1M</span></div>'
        : '<div class="price-hero"><strong>' + fmtPrice(base.input) + '</strong><span class="price-hero-unit">/1M</span></div>'
      priceHtml = hero +
        '<div class="price-rows">' +
          '<span>基础 <b>' + fmtPrice(base.input) + '</b></span>' +
          '<span>输出 <b>' + fmtPrice(base.completion) + '</b></span>' +
          '<span>缓存 <b>' + fmtPrice(base.cacheHit) + '</b></span>' +
        '</div>'
    } else {
      priceHtml =
        '<div class="price-hero"><strong>' + (base.price ? fmtPrice(base.price) : '按次') + '</strong></div>'
    }

    var tags = tagsOf(m).slice(0, 4)
    var tagHtml = tags.map(function (t) { return '<span class="model-tag">' + esc(t) + '</span>' }).join('')

    return (
      '<button class="model-card" type="button" data-name="' + esc(m.model_name) + '" aria-label="查看 ' + esc(m.model_name) + ' 详情">' +
        '<div class="model-card-head">' +
          vendorHtml(m) +
          '<div class="model-title">' +
            '<span class="model-name">' + esc(m.model_name) + '</span>' +
            '<span class="model-type">' + esc(typeLabel(m.model_type)) + '</span>' +
          '</div>' +
          '<span class="price-tag price-tag--' + level.cls + '">' + level.label + '</span>' +
        '</div>' +
        (m.description ? '<p class="model-desc">' + esc(m.description) + '</p>' : '') +
        (tagHtml ? '<div class="model-tags">' + tagHtml + '</div>' : '') +
        '<div class="model-price">' + priceHtml + '</div>' +
        '<div class="model-card-more">查看详情 →</div>' +
      '</button>'
    )
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var grid = document.getElementById('modelGrid')
    var countEl = document.getElementById('modelCount')
    var sourceEl = document.getElementById('modelSource')
    var list = sortedModels(visibleModels())

    if (sourceEl) sourceEl.textContent = state.fetchedAt ? '数据更新 ' + state.fetchedAt : '数据：静态快照'
    if (countEl) countEl.textContent = '共 ' + list.length + ' 个模型'
    if (!list.length) {
      grid.innerHTML = '<div class="models-state"><strong>没有匹配的模型</strong>换个筛选条件试试。</div>'
    } else {
      grid.innerHTML = list.map(modelCard).join('')
    }
    renderActiveFilters()
  }

  function renderActiveFilters() {
    var wrap = document.getElementById('activeFilters')
    if (!wrap) return
    var chips = []
    if (state.filter.type) chips.push({ k: 'type', label: '类型：' + state.filter.type })
    if (state.filter.group) chips.push({ k: 'group', label: '分组：' + state.filter.group })
    if (state.filter.tag) chips.push({ k: 'tag', label: '标签：' + state.filter.tag })
    wrap.innerHTML = chips.map(function (c) {
      return '<span class="af-chip">' + esc(c.label) + '<button type="button" data-clear="' + c.k + '" aria-label="移除该筛选">×</button></span>'
    }).join('')
    Array.prototype.forEach.call(wrap.querySelectorAll('[data-clear]'), function (btn) {
      btn.addEventListener('click', function () {
        state.filter[btn.dataset.clear] = ''
        buildSidebar()
        render()
      })
    })
  }

  /* ---------- 侧边栏 ---------- */
  function collectOptions() {
    var types = {}, groups = {}, tags = {}
    state.data.forEach(function (m) {
      var t = typeLabel(m.model_type)
      types[t] = (types[t] || 0) + 1
      ;(m.enable_groups || []).forEach(function (g) { groups[g] = (groups[g] || 0) + 1 })
      tagsOf(m).forEach(function (t2) { tags[t2] = (tags[t2] || 0) + 1 })
    })
    var typeArr = Object.keys(types).sort()
    var groupArr = Object.keys(groups).sort(function (a, b) {
      return (groups[b] - groups[a]) || a.localeCompare(b)
    })
    var tagArr = Object.keys(tags).sort(function (a, b) {
      return (tags[b] - tags[a]) || a.localeCompare(b)
    })
    return { types: typeArr, groups: groupArr, tags: tagArr, typeCount: types, groupCount: groups, tagCount: tags }
  }

  function optionHtml(list, field, countMap) {
    var sel = state.filter[field]
    return list.map(function (name) {
      return '<button class="sidebar-option' + (name === sel ? ' active' : '') + '" type="button" data-' + field + '="' + esc(name) + '">' +
        esc(name) + ' <span class="sidebar-count">' + countMap[name] + '</span></button>'
    }).join('') || '<span class="models-state" style="padding:12px 0">无</span>'
  }

  function buildSidebar() {
    var opts = collectOptions()

    var typeEl = document.getElementById('sidebarType')
    if (typeEl) typeEl.innerHTML = optionHtml(opts.types, 'type', opts.typeCount)

    var groupQ = (document.getElementById('sidebarGroupSearch').value || '').trim().toLowerCase()
    var groupEl = document.getElementById('sidebarGroup')
    if (groupEl) {
      var glist = opts.groups.filter(function (g) { return !groupQ || g.toLowerCase().indexOf(groupQ) >= 0 })
      groupEl.innerHTML = optionHtml(glist, 'group', opts.groupCount)
    }

    var tagQ = (document.getElementById('sidebarTagSearch').value || '').trim().toLowerCase()
    var tagEl = document.getElementById('sidebarTag')
    if (tagEl) {
      var tlist = opts.tags.filter(function (t) { return !tagQ || t.toLowerCase().indexOf(tagQ) >= 0 })
      tagEl.innerHTML = optionHtml(tlist, 'tag', opts.tagCount)
    }
  }

  function bindSidebar() {
    function bindList(id, field) {
      var el = document.getElementById(id)
      if (!el) return
      el.addEventListener('click', function (e) {
        var btn = e.target.closest('.sidebar-option')
        if (!btn) return
        var val = btn.getAttribute('data-' + field)
        state.filter[field] = state.filter[field] === val ? '' : val
        buildSidebar()
        render()
      })
    }
    bindList('sidebarType', 'type')
    bindList('sidebarGroup', 'group')
    bindList('sidebarTag', 'tag')

    var gs = document.getElementById('sidebarGroupSearch')
    if (gs) gs.addEventListener('input', buildSidebar)
    var ts = document.getElementById('sidebarTagSearch')
    if (ts) ts.addEventListener('input', buildSidebar)

    var clear = document.getElementById('sidebarClear')
    if (clear) clear.addEventListener('click', function () {
      state.filter = { q: state.filter.q, type: '', group: '', tag: '' }
      if (gs) gs.value = ''
      if (ts) ts.value = ''
      buildSidebar()
      render()
    })

    var filterBtn = document.getElementById('filterBtn')
    var sidebar = document.getElementById('modelsSidebar')
    if (filterBtn && sidebar) filterBtn.addEventListener('click', function () { sidebar.classList.add('open') })
    var close = document.getElementById('sidebarClose')
    if (close) close.addEventListener('click', function () { sidebar.classList.remove('open') })
  }

  /* ---------- 详情侧页 ---------- */
  function endpointRows(m) {
    var types = Array.isArray(m.supported_endpoint_types) ? m.supported_endpoint_types : []
    return types.map(function (t) {
      var ep = state.supportedEndpoint[t]
      var path = ep ? ep.path : ''
      var method = ep ? ep.method : ''
      return '<div class="drawer-endpoint"><code>' + esc(t) + '</code>' +
        (path ? '<span>' + esc(method) + ' ' + esc(path) + '</span>' : '<span>—</span>') +
        '</div>'
    }).join('') || '<div class="drawer-endpoint"><code>—</code></div>'
  }

  function groupTable(m) {
    var base = basePrices(m)
    var groups = Array.isArray(m.enable_groups) ? m.enable_groups : []
    if (!groups.length) return '<div class="models-state" style="padding:16px">暂无分组信息</div>'
    var withPrice = [], noPrice = []
    groups.forEach(function (g) {
      var p = groupPrice(base, g)
      if (p) withPrice.push({ group: g, p: p, v: p.input != null ? p.input : p.price })
      else noPrice.push(g)
    })
    withPrice.sort(function (a, b) { return a.v - b.v })

    var rows = withPrice.map(function (item, idx) {
      var best = idx === 0 ? ' is-best' : ''
      if (base.kind === 'token') {
        return '<tr class="' + best + '"><td>' + esc(item.group) + '</td><td>' + fmtPrice(item.p.input) +
          '</td><td>' + fmtPrice(item.p.completion) + '</td><td>' + fmtPrice(item.p.cacheHit) +
          '</td><td>' + fmtPrice(item.p.cache5m) + '</td><td>' + fmtPrice(item.p.cache1h) + '</td></tr>'
      }
      return '<tr class="' + best + '"><td>' + esc(item.group) + '</td><td>' + fmtPrice(item.p.price) + '</td></tr>'
    }).join('')

    var head = base.kind === 'token'
      ? '<th>分组</th><th>输入</th><th>输出</th><th>缓存</th><th>5m建</th><th>1h建</th>'
      : '<th>分组</th><th>价格</th>'

    var extra = noPrice.length
      ? '<p class="drawer-group-legend">另有 ' + noPrice.length + ' 个分组（测试/特供等）价格未收录。</p>'
      : ''

    return '<table class="drawer-table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>' + extra
  }

  function basePriceTable(m) {
    var base = basePrices(m)
    if (base.kind !== 'token') {
      return '<div class="drawer-endpoint"><code>' + fmtPrice(base.price) + '</code><span>按次 / 按单位计费</span></div>'
    }
    return (
      '<table class="drawer-table"><thead><tr><th>项目</th><th>价格 / 1M</th></tr></thead><tbody>' +
        '<tr><td>输入</td><td>' + fmtPrice(base.input) + '</td></tr>' +
        '<tr><td>输出</td><td>' + fmtPrice(base.completion) + '</td></tr>' +
        '<tr><td>缓存命中</td><td>' + fmtPrice(base.cacheHit) + '</td></tr>' +
        '<tr><td>5m 缓存创建</td><td>' + fmtPrice(base.cache5m) + '</td></tr>' +
        '<tr><td>1h 缓存创建</td><td>' + fmtPrice(base.cache1h) + '</td></tr>' +
      '</tbody></table>'
    )
  }

  function renderDrawer(m) {
    var content = document.getElementById('drawerContent')
    var base = basePrices(m)
    var level = priceLevel(base)
    var tags = tagsOf(m)
    content.innerHTML =
      '<div class="drawer-head">' +
        '<div class="drawer-head-top">' + vendorHtml(m) +
          '<div><h2 class="drawer-name">' + esc(m.model_name) + '</h2>' +
          '<span class="model-type">' + esc(typeLabel(m.model_type)) + '</span></div>' +
          '<span class="price-tag price-tag--' + level.cls + '">' + level.label + '</span>' +
        '</div>' +
        (m.description ? '<p class="drawer-desc">' + esc(m.description) + '</p>' : '') +
        (tags.length ? '<div class="drawer-tags">' + tags.map(function (t) { return '<span class="model-tag">' + esc(t) + '</span>' }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="drawer-section"><h3 class="drawer-section-title">基础价格</h3>' + basePriceTable(m) + '</div>' +
      '<div class="drawer-section"><h3 class="drawer-section-title">调用端点</h3>' + endpointRows(m) + '</div>' +
      '<div class="drawer-section"><h3 class="drawer-section-title">各分组计价</h3>' + groupTable(m) + '</div>' +
      '<p class="drawer-group-legend">价格为估算（基础价 × 分组倍率），以平台实际扣费为准。</p>'
  }

  function openDrawer(m) {
    renderDrawer(m)
    var drawer = document.getElementById('modelDrawer')
    drawer.hidden = false
    // 触发过渡
    requestAnimationFrame(function () { drawer.classList.add('open') })
    document.body.style.overflow = 'hidden'
  }

  function closeDrawer() {
    var drawer = document.getElementById('modelDrawer')
    drawer.classList.remove('open')
    setTimeout(function () { drawer.hidden = true }, 260)
    document.body.style.overflow = ''
  }

  function bindDrawer() {
    var grid = document.getElementById('modelGrid')
    if (grid) grid.addEventListener('click', function (e) {
      var card = e.target.closest('.model-card')
      if (!card) return
      var name = card.getAttribute('data-name')
      var m = null
      for (var i = 0; i < state.data.length; i++) {
        if (state.data[i].model_name === name) { m = state.data[i]; break }
      }
      if (m) openDrawer(m)
    })

    var closeBtn = document.getElementById('drawerClose')
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer)
    var backdrop = document.getElementById('drawerBackdrop')
    if (backdrop) backdrop.addEventListener('click', closeDrawer)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('modelDrawer').hidden) closeDrawer()
    })
  }

  /* ---------- 工具栏 ---------- */
  function bindToolbar() {
    var search = document.getElementById('modelSearch')
    if (search) search.addEventListener('input', function () {
      state.filter.q = search.value.trim()
      render()
    })
    var sort = document.getElementById('modelSort')
    if (sort) sort.addEventListener('change', function () {
      state.sort = sort.value
      render()
    })
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var grid = document.getElementById('modelGrid')
    if (!grid) return
    grid.innerHTML = '<div class="models-state"><strong>正在加载模型数据…</strong></div>'
    bindToolbar()
    bindSidebar()
    bindDrawer()
    loadData().then(function () {
      buildSidebar()
      render()
    }).catch(function (e) {
      grid.innerHTML = '<div class="models-state"><strong>加载失败</strong>' + esc(e.message || '') + '</div>'
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
