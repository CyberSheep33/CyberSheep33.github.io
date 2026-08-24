/* ============================================================
   CyberSheep — 模型广场（models/）渲染逻辑
   ============================================================
   - 纯静态：数据只来自本地快照 ../assets/models.json（含
     data / group_ratio / usable_group / vendors），由人工定期更新。
   - 价格公式（已按 Sheep AI Plus 模型广场校验）：
       基础输入 $/1M = model_ratio × 0.2470588
       补全        = 基础输入 × completion_ratio
       缓存命中    = 基础输入 × cache_ratio
       5m 缓存创建 = 基础输入 × cache_creation_5m_ratio
       1h 缓存创建 = 基础输入 × cache_creation_1h_ratio
       某分组最终价 = 基础价 × (group_ratio[分组] / 0.0882353)
   ============================================================ */
(function () {
  'use strict'

  var SNAPSHOT_URL = '../assets/models.json'

  var BASE_PRICE = 0.247058823   // model_ratio = 1 时的输入 $/1M
  var BASE_GROUP = 0.0882353     // 基础价对应的 group_ratio 值

  var state = {
    data: [],
    groupRatio: {},
    usableGroup: {},
    vendors: [],
    fetchedAt: '',
    filter: { q: '', type: '' },
    sort: 'default'
  }

  var TYPE_LABEL = { chat: '对话', image: '图像', video: '视频', audio: '音频', vector: '向量' }

  /* ---------- 数据加载（纯静态快照） ---------- */
  function loadData() {
    return fetch(SNAPSHOT_URL).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return r.json()
    }).then(function (j) {
      state.data = j.data || []
      state.groupRatio = j.group_ratio || {}
      state.usableGroup = j.usable_group || {}
      state.vendors = j.vendors || []
      state.fetchedAt = j.fetched_at || ''
    })
  }

  /* ---------- 价格计算 ---------- */
  function groupMult(group) {
    var r = state.groupRatio[group]
    if (r == null) return null
    return r / BASE_GROUP
  }

  function basePrices(m) {
    var ratio = Number(m.model_ratio) || 0
    if (String(m.quota_type) === '0' && ratio) {
      var input = ratio * BASE_PRICE
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
        input: base.input * mult,
        completion: base.completion * mult,
        cacheHit: base.cacheHit * mult,
        cache5m: base.cache5m * mult,
        cache1h: base.cache1h * mult,
        mult: mult
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
  function vendorIcon(m) {
    var vid = m.vendor_id
    var v = null
    for (var i = 0; i < state.vendors.length; i++) {
      if (state.vendors[i].id === vid) { v = state.vendors[i]; break }
    }
    if (v && v.icon) {
      var file = v.icon.replace(/\./g, '-').toLowerCase()
      return {
        name: v.name,
        icon: '<img class="model-vendor-img" alt="' + esc(v.name) + '" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/' + file + '.svg">'
      }
    }
    return { name: v ? v.name : '', icon: '' }
  }

  var VENDOR_RULES = [
    [/^(gpt|o[0-9]|openai|chatgpt)/i, 'OpenAI'],
    [/^claude/i, 'Anthropic'],
    [/^gemini|^palm/i, 'Google'],
    [/^grok/i, 'xAI'],
    [/^deepseek/i, 'DeepSeek'],
    [/^qwen/i, 'Qwen'],
    [/^kimi/i, 'Moonshot'],
    [/^doubao/i, 'Doubao'],
    [/^(glm|zhipu)/i, 'Zhipu'],
    [/^minimax/i, 'MiniMax'],
    [/^mistral/i, 'Mistral'],
    [/^llama/i, 'Meta']
  ]

  function vendorFallback(name) {
    for (var i = 0; i < VENDOR_RULES.length; i++) {
      if (VENDOR_RULES[i][0].test(name)) return VENDOR_RULES[i][1]
    }
    var first = (name || '').split(/[-\s_.]/)[0]
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'AI'
  }

  function badgeLetter(name) {
    return name.charAt(0).toUpperCase()
  }

  /* ---------- 工具 ---------- */
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

  function fmtCount(n) {
    n = Number(n) || 0
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return String(n)
  }

  /* ---------- 过滤排序 ---------- */
  function visibleModels() {
    var q = state.filter.q.toLowerCase()
    var out = state.data.filter(function (m) {
      if (state.filter.type && typeLabel(m.model_type) !== state.filter.type) return false
      if (!q) return true
      return (m.model_name || '').toLowerCase().indexOf(q) >= 0 ||
        (m.description || '').toLowerCase().indexOf(q) >= 0 ||
        (m.tags || '').toLowerCase().indexOf(q) >= 0
    })
    var sort = state.sort
    out.sort(function (a, b) {
      if (sort === 'price-asc' || sort === 'price-desc') {
        var pa = basePrices(a), pb = basePrices(b)
        var va = pa.kind === 'token' ? pa.input : pa.price
        var vb = pb.kind === 'token' ? pb.input : pb.price
        return sort === 'price-asc' ? va - vb : vb - va
      }
      if (sort === 'usage') return (b.usage_count || 0) - (a.usage_count || 0)
      return (a.sort_order == null ? 99999 : a.sort_order) - (b.sort_order == null ? 99999 : b.sort_order)
    })
    return out
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

  function groupRowsHtml(base, groups) {
    if (!groups.length) return '<div class="model-group-unknown">暂无分组信息</div>'
    var withPrice = [], noPrice = []
    groups.forEach(function (g) {
      var p = groupPrice(base, g)
      if (p) withPrice.push({ group: g, p: p, v: p.input != null ? p.input : p.price })
      else noPrice.push(g)
    })
    withPrice.sort(function (a, b) { return a.v - b.v })

    var html = ''
    withPrice.forEach(function (item, idx) {
      var isBest = idx === 0
      if (base.kind === 'token') {
        html +=
          '<div class="model-group-row' + (isBest ? ' is-best' : '') + '">' +
            '<span class="model-group-name">' + esc(item.group) + '</span>' +
            '<span class="model-group-main">' + fmtPrice(item.p.input) + '/1M</span>' +
            '<span class="model-group-detail">输出 ' + fmtPrice(item.p.completion) +
              ' · 缓存 ' + fmtPrice(item.p.cacheHit) +
              ' · 5m建 ' + fmtPrice(item.p.cache5m) +
              ' · 1h建 ' + fmtPrice(item.p.cache1h) + '</span>' +
            (isBest ? '<span class="model-group-best">最划算</span>' : '') +
          '</div>'
      } else {
        html +=
          '<div class="model-group-row' + (isBest ? ' is-best' : '') + '">' +
            '<span class="model-group-name">' + esc(item.group) + '</span>' +
            '<span class="model-group-main">' + fmtPrice(item.p.price) + '</span>' +
            '<span class="model-group-detail">' + (item.p.mult ? '×' + item.p.mult.toFixed(2) : '') + '</span>' +
            (isBest ? '<span class="model-group-best">最划算</span>' : '') +
          '</div>'
      }
    })

    if (noPrice.length) {
      html += '<div class="model-group-unknown">另有 ' + noPrice.length + ' 个分组（测试/特供等）价格未收录</div>'
    }
    return html
  }

  function modelCard(m) {
    var base = basePrices(m)
    var level = priceLevel(base)
    var vendor = vendorIcon(m)
    var vendorName = vendor.name || vendorFallback(m.model_name)
    var groups = Array.isArray(m.enable_groups) ? m.enable_groups : []
    var best = cheapestGroup(base, groups)

    var priceHtml
    if (base.kind === 'token') {
      if (best) {
        priceHtml =
          '<span class="price-main">低至 ' + fmtPrice(best.p.input) + '/1M</span>' +
          '<span class="price-sub">基础 ' + fmtPrice(base.input) + ' · 输出 ' + fmtPrice(base.completion) + ' · 缓存 ' + fmtPrice(base.cacheHit) + '</span>'
      } else {
        priceHtml =
          '<span class="price-main">' + fmtPrice(base.input) + '/1M</span>' +
          '<span class="price-sub">输出 ' + fmtPrice(base.completion) + ' · 缓存 ' + fmtPrice(base.cacheHit) + '</span>'
      }
    } else {
      priceHtml =
        '<span class="price-main">' + (base.price ? fmtPrice(base.price) : '按次计费') + '</span>' +
        '<span class="price-sub">' + (m.model_type ? typeLabel(m.model_type) : '') + '</span>'
    }

    var tags = (m.tags || '').split(',').map(function (t) { return t.trim() }).filter(Boolean).slice(0, 5)
    var tagHtml = tags.map(function (t) { return '<span class="model-tag">' + esc(t) + '</span>' }).join('')

    var vendorHtml = vendor.icon
      ? vendor.icon
      : '<span class="model-vendor-letter" aria-hidden="true">' + esc(badgeLetter(vendorName)) + '</span>'

    return (
      '<article class="model-card" data-name="' + esc(m.model_name) + '">' +
        '<div class="model-card-head">' +
          '<span class="model-vendor">' + vendorHtml + '</span>' +
          '<div class="model-title">' +
            '<h3 class="model-name">' + esc(m.model_name) + '</h3>' +
            '<span class="model-type">' + esc(typeLabel(m.model_type)) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="model-card-body">' +
          (m.description ? '<p class="model-desc">' + esc(m.description) + '</p>' : '') +
          (tagHtml ? '<div class="model-tags">' + tagHtml + '</div>' : '') +
          '<div class="model-price">' + priceHtml +
            '<span class="price-tag price-tag--' + level.cls + '">' + level.label + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="model-card-foot">' +
          '<span class="model-usage">调用 ' + fmtCount(m.usage_count) + '</span>' +
          '<button class="model-groups-btn" type="button" aria-expanded="false" aria-label="查看 ' + esc(m.model_name) + ' 的分组价格">' +
            '分组 ' + groups.length + ' <span class="model-groups-caret" aria-hidden="true">▾</span>' +
          '</button>' +
        '</div>' +
        '<div class="model-groups" hidden>' +
          '<p class="model-groups-title">各分组最终价格（$/1M tokens，含分组倍率）</p>' +
          '<div class="model-groups-list">' + groupRowsHtml(base, groups) + '</div>' +
        '</div>' +
      '</article>'
    )
  }

  /* ---------- 渲染 ---------- */
  function render() {
    var grid = document.getElementById('modelGrid')
    var countEl = document.getElementById('modelCount')
    var sourceEl = document.getElementById('modelSource')
    var list = visibleModels()

    if (sourceEl) sourceEl.textContent = state.fetchedAt ? '数据更新 ' + state.fetchedAt : '数据：静态快照'
    if (countEl) countEl.textContent = '共 ' + list.length + ' 个模型'

    if (!list.length) {
      grid.innerHTML = '<div class="models-state"><strong>没有匹配的模型</strong>换个关键词或类型试试。</div>'
      return
    }
    grid.innerHTML = list.map(modelCard).join('')
  }

  /* ---------- 工具栏 ---------- */
  function buildTypeChips() {
    var seen = {}
    state.data.forEach(function (m) {
      var t = typeLabel(m.model_type)
      if (!seen[t]) seen[t] = true
    })
    var types = ['全部'].concat(Object.keys(seen).sort())
    var wrap = document.getElementById('modelTypeChips')
    if (!wrap) return
    wrap.innerHTML = types.map(function (t, i) {
      return '<button class="models-chip' + (i === 0 ? ' active' : '') + '" type="button" data-type="' + esc(t) + '">' + esc(t) + '</button>'
    }).join('')
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.models-chip')
      if (!btn) return
      wrap.querySelectorAll('.models-chip').forEach(function (c) { c.classList.remove('active') })
      btn.classList.add('active')
      state.filter.type = btn.dataset.type === '全部' ? '' : btn.dataset.type
      render()
    })
  }

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
    var grid = document.getElementById('modelGrid')
    if (grid) grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.model-groups-btn')
      if (!btn) return
      var panel = btn.closest('.model-card').querySelector('.model-groups')
      var open = panel.classList.toggle('open')
      panel.hidden = !open
      btn.setAttribute('aria-expanded', open ? 'true' : 'false')
      btn.querySelector('.model-groups-caret').style.transform = open ? 'rotate(180deg)' : ''
    })
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var grid = document.getElementById('modelGrid')
    if (!grid) return
    grid.innerHTML = '<div class="models-state"><strong>正在加载模型数据…</strong></div>'
    bindToolbar()
    loadData().then(function () {
      buildTypeChips()
      render()
    }).catch(function () {
      grid.innerHTML = '<div class="models-state"><strong>加载失败</strong>请稍后重试，或直接访问 <a href="https://sheepaiplus.top/pricing" target="_blank" rel="noopener">Sheep AI Plus 模型广场</a>。</div>'
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
