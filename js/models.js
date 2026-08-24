/* ============================================================
   CyberSheep — 模型广场（models/）渲染逻辑
   ============================================================
   - 纯静态：数据来自 assets/models-data.js（<script> 注入 window.MODELS_DATA）
   - 布局：左侧折叠筛选侧边栏（品牌/分组/类型/标签）+ 中间卡片 + 右侧详情侧页
   - 可用分组白名单 AVAILABLE_GROUPS：来自「Sheep AI 与 Sheep AI Plus 分组对照」
     CSV 中的有效分组，剔除 API 里内部测试/特供等不开放分组；
     分组筛选与详情页计价只展示白名单内的分组。
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

  /* 可用分组白名单（映射到 API 实际分组名） */
  var AVAILABLE_GROUPS = [
    'AWS-Bedrock-1', 'AWS-Claude-1', 'AWS-Claude-2', 'AWS-Claude-3', 'AWS-Platfrom-1',
    'Aistudio-Gemini-1', 'Aistudio-Gemini-2', 'Aistudio-Gemini-3', 'Aistudio-Gemini-4',
    'Alibaba-1', 'Alibaba-2', 'Alibaba-3', 'Anthropic-Claude-1', 'Anti-Gemini-1',
    'Azure-Claude-1', 'Azure-Gpt-1', 'Azure-Gpt-2', 'Azure-Gpt-3', 'Azure-Gpt-4', 'Azure-Gpt-5',
    'Azure-Grok-1', 'Azure-Grok-2',
    'Claude-Code-1', 'Claude-Code-2', 'Cli-Gemini-1', 'Cli-Grok-1', 'Cli-Grok-2',
    'Codex-Gpt-1', 'Codex-Gpt-2', 'Codex-Gpt-3',
    'Doubao-1', 'Doubao-2', 'Doubao-3',
    'Gpt-Image-1', 'Gpt-Image-2',
    'Hailuo-1', 'Hailuo-2', 'Hailuo-3',
    'Kimi-1', 'Kimi-2', 'Kiro-Claude-1', 'Kling-1', 'Kling-2',
    'MJ-1', 'MJ-2',
    'Openai-Gpt-1', 'Openai-Gpt-2', 'Pix-1',
    'Reverse-Gemini-1', 'Reverse-Gemini-2',
    'Seedance-1',
    'Self-Deployed-1', 'Self-Deployed-2', 'Self-Deployed-3', 'Self-Deployed-4',
    'SiliconFlow-1', 'Spark-1', 'Spark-2', 'Spark-3', 'Suno-1', 'Suno-2',
    'Vertex-Claude-1', 'Vertex-Gemini-1', 'Vertex-Gemini-2', 'Vertex-Gemini-3',
    'Vidu-1', 'Vidu-2',
    'Wenxin-1', 'Wenxin-2', 'Wenxin-3',
    'Xai-Grok-1', 'Xiaomi-1', 'Xiaomi-2', 'deepseek-1'
  ]

  function isAvailableGroup(g) {
    return AVAILABLE_GROUPS.indexOf(g) >= 0
  }

  /* 分组类别（来自「Sheep AI 与 Sheep AI Plus 分组对照」CSV 的「模型 / 类别」列，
     键用 API 实际分组名） */
  var GROUP_CATEGORIES = {
    'AWS-Bedrock-1': 'Claude', 'AWS-Claude-1': 'Claude', 'AWS-Claude-2': 'Claude',
    'AWS-Claude-3': 'Claude', 'AWS-Platfrom-1': 'Claude', 'Anthropic-Claude-1': 'Claude',
    'Azure-Claude-1': 'Claude', 'Claude-Code-1': 'Claude', 'Claude-Code-2': 'Claude',
    'Kiro-Claude-1': 'Claude', 'Vertex-Claude-1': 'Claude',
    'Azure-Gpt-1': 'GPT / Codex', 'Azure-Gpt-2': 'GPT / Codex', 'Azure-Gpt-3': 'GPT / Codex',
    'Azure-Gpt-4': 'GPT / Codex', 'Azure-Gpt-5': 'GPT / Codex', 'Codex-Gpt-1': 'GPT / Codex',
    'Codex-Gpt-2': 'GPT / Codex', 'Codex-Gpt-3': 'GPT / Codex', 'Openai-Gpt-1': 'GPT / Codex',
    'Openai-Gpt-2': 'GPT / Codex',
    'Aistudio-Gemini-1': 'Gemini', 'Aistudio-Gemini-2': 'Gemini', 'Aistudio-Gemini-3': 'Gemini',
    'Aistudio-Gemini-4': 'Gemini', 'Anti-Gemini-1': 'Gemini', 'Cli-Gemini-1': 'Gemini',
    'Reverse-Gemini-1': 'Gemini', 'Reverse-Gemini-2': 'Gemini',
    'Vertex-Gemini-1': 'Gemini', 'Vertex-Gemini-2': 'Gemini', 'Vertex-Gemini-3': 'Gemini',
    'Azure-Grok-1': 'Grok', 'Azure-Grok-2': 'Grok', 'Cli-Grok-1': 'Grok', 'Cli-Grok-2': 'Grok',
    'Xai-Grok-1': 'Grok',
    'MJ-1': 'MJ / Suno', 'MJ-2': 'MJ / Suno', 'Suno-1': 'MJ / Suno', 'Suno-2': 'MJ / Suno',
    'Kling-1': 'Kling', 'Kling-2': 'Kling',
    'Vidu-1': 'Vidu', 'Vidu-2': 'Vidu',
    'Hailuo-1': 'Hailuo', 'Hailuo-2': 'Hailuo', 'Hailuo-3': 'Hailuo',
    'Pix-1': 'Pix',
    'Doubao-1': 'Doubao', 'Doubao-2': 'Doubao', 'Doubao-3': 'Doubao',
    'Alibaba-1': 'Alibaba', 'Alibaba-2': 'Alibaba', 'Alibaba-3': 'Alibaba',
    'Self-Deployed-1': 'Self-Deployed', 'Self-Deployed-2': 'Self-Deployed',
    'Self-Deployed-3': 'Self-Deployed', 'Self-Deployed-4': 'Self-Deployed',
    'Kimi-1': 'Kimi', 'Kimi-2': 'Kimi',
    'Xiaomi-1': 'Xiaomi', 'Xiaomi-2': 'Xiaomi',
    'Wenxin-1': 'Wenxin', 'Wenxin-2': 'Wenxin', 'Wenxin-3': 'Wenxin',
    'SiliconFlow-1': 'SiliconFlow',
    'Spark-1': 'Spark', 'Spark-2': 'Spark', 'Spark-3': 'Spark',
    'Gpt-Image-1': 'GPT-Image', 'Gpt-Image-2': 'GPT-Image',
    'Seedance-1': 'Seedance', 'deepseek-1': 'DeepSeek'
  }

  /* 品牌归属修正：上游 /api/pricing 中个别模型 vendor 标错，这里人工核对后覆盖。
     键：模型名；值：正确的 vendor_id。
     说明：aigc-image-kling 被上游标为「腾讯」(61)，但属于 Kling 系列（vendor 88），
     其余所有 kling-* 模型均在 Kling 名下。 */
  var BRAND_OVERRIDES = {
    'aigc-image-kling': 88
  }

  var state = {
    data: [],
    groupRatio: {},
    usableGroup: {},
    vendors: [],
    supportedEndpoint: {},
    fetchedAt: '',
    filter: { q: '', brand: '', group: '', type: '', tag: '' },
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

  /* ---------- 厂商 ---------- */
  function vendorById(id) {
    for (var i = 0; i < state.vendors.length; i++) {
      if (state.vendors[i].id === id) return state.vendors[i]
    }
    return null
  }

  function brandVendorId(m) {
    if (m && BRAND_OVERRIDES.hasOwnProperty(m.model_name)) return BRAND_OVERRIDES[m.model_name]
    return m.vendor_id
  }

  function vendorOf(m) {
    return vendorById(brandVendorId(m))
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

  function vendorNameOf(m) {
    var v = vendorOf(m)
    if (v && v.name) return v.name
    var name = m.model_name || ''
    for (var i = 0; i < VENDOR_RULES.length; i++) {
      if (VENDOR_RULES[i][0].test(name)) return VENDOR_RULES[i][1]
    }
    return (name.split(/[-\s_.]/)[0] || '其他').charAt(0).toUpperCase() + (name.split(/[-\s_.]/)[0] || '').slice(1) || '其他'
  }

  function vendorHtml(m) {
    var v = vendorOf(m)
    if (v && v.icon) {
      var file = v.icon.replace(/\./g, '-').toLowerCase()
      return '<span class="model-vendor"><img class="model-vendor-img" alt="' + esc(v.name) + '" loading="lazy" src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/' + file + '.svg"></span>'
    }
    var name = vendorNameOf(m)
    return '<span class="model-vendor"><span class="model-vendor-letter" aria-hidden="true">' + esc(name.charAt(0).toUpperCase() || 'A') + '</span></span>'
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

  function availableGroupsOf(m) {
    return (m.enable_groups || []).filter(isAvailableGroup)
  }

  /* ---------- 过滤 ---------- */
  function tagsOf(m) {
    return (m.tags || '').split(',').map(function (t) { return t.trim() }).filter(Boolean)
  }

  function visibleModels() {
    var q = state.filter.q.toLowerCase()
    var f = state.filter
    return state.data.filter(function (m) {
      if (f.brand && String(brandVendorId(m)) !== f.brand) return false
      if (f.type && typeLabel(m.model_type) !== f.type) return false
      if (f.group && availableGroupsOf(m).indexOf(f.group) < 0) return false
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
    var groups = availableGroupsOf(m)
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
    var chips = []
    if (state.filter.brand) chips.push({ k: 'brand', label: '品牌：' + vendorNameById(state.filter.brand) })
    if (state.filter.type) chips.push({ k: 'type', label: '类型：' + state.filter.type })
    if (state.filter.group) chips.push({ k: 'group', label: '分组：' + state.filter.group })
    if (state.filter.tag) chips.push({ k: 'tag', label: '标签：' + state.filter.tag })

    function fill(el) {
      if (!el) return
      if (!chips.length) {
        el.innerHTML = ''
        el.classList.remove('has-chips')
        return
      }
      el.innerHTML = chips.map(function (c) {
        return '<span class="af-chip">' + esc(c.label) + '<button type="button" data-clear="' + c.k + '" aria-label="移除该筛选">×</button></span>'
      }).join('')
      el.classList.add('has-chips')
      Array.prototype.forEach.call(el.querySelectorAll('[data-clear]'), function (btn) {
        btn.addEventListener('click', function () {
          state.filter[btn.dataset.clear] = ''
          buildSidebar()
          render()
        })
      })
    }
    fill(document.getElementById('activeFilters'))
    fill(document.getElementById('filterActive'))
  }

  function vendorNameById(id) {
    var v = vendorById(Number(id))
    return v ? v.name : id
  }

  /* ---------- 侧边栏（四类折叠） ---------- */
  function collectOptions() {
    var brands = {}, types = {}, groups = {}, tags = {}
    state.data.forEach(function (m) {
      var vid = String(brandVendorId(m) == null ? '0' : brandVendorId(m))
      brands[vid] = (brands[vid] || 0) + 1
      var t = typeLabel(m.model_type)
      types[t] = (types[t] || 0) + 1
      availableGroupsOf(m).forEach(function (g) { groups[g] = (groups[g] || 0) + 1 })
      tagsOf(m).forEach(function (t2) { tags[t2] = (tags[t2] || 0) + 1 })
    })

    var brandArr = Object.keys(brands).sort(function (a, b) {
      var na = vendorNameById(a), nb = vendorNameById(b)
      return na.localeCompare(nb)
    })
    var typeArr = Object.keys(types).sort()
    var groupArr = Object.keys(groups).sort(function (a, b) {
      return (groups[b] - groups[a]) || a.localeCompare(b)
    })
    var tagArr = Object.keys(tags).sort(function (a, b) {
      return (tags[b] - tags[a]) || a.localeCompare(b)
    })
    return { brands: brandArr, types: typeArr, groups: groupArr, tags: tagArr,
      brandCount: brands, typeCount: types, groupCount: groups, tagCount: tags }
  }

  function optionHtml(list, field, countMap, labelFn, subFn) {
    var sel = state.filter[field]
    return list.map(function (name) {
      var label = labelFn ? labelFn(name) : name
      var sub = subFn ? subFn(name) : ''
      var subHtml = sub ? '<span class="sidebar-cat">' + esc(sub) + '</span>' : ''
      return '<button class="sidebar-option' + (name === sel ? ' active' : '') + '" type="button" data-' + field + '="' + esc(name) + '">' +
        esc(label) + subHtml + ' <span class="sidebar-count">' + countMap[name] + '</span></button>'
    }).join('') || '<span class="models-state" style="padding:12px 0">无</span>'
  }

  function buildSidebar() {
    var opts = collectOptions()

    var brandEl = document.getElementById('acc-brand')
    if (brandEl) brandEl.innerHTML = '<div class="sidebar-list sidebar-list--brand">' +
      optionHtml(opts.brands, 'brand', opts.brandCount, function (id) { return vendorNameById(id) }) + '</div>'

    var typeEl = document.getElementById('acc-type')
    if (typeEl) typeEl.innerHTML = '<div class="sidebar-list sidebar-list--type">' +
      optionHtml(opts.types, 'type', opts.typeCount) + '</div>'

    var groupQ = (document.getElementById('sidebarGroupSearch').value || '').trim().toLowerCase()
    var groupEl = document.getElementById('sidebarGroup')
    if (groupEl) {
      var glist = opts.groups.filter(function (g) { return !groupQ || g.toLowerCase().indexOf(groupQ) >= 0 })
      // 按分组类别分组展示
      var cats = {}
      glist.forEach(function (g) {
        var c = GROUP_CATEGORIES[g] || '其他'
        ;(cats[c] = cats[c] || []).push(g)
      })
      var html = ''
      Object.keys(cats).sort().forEach(function (c) {
        html += '<div class="sidebar-cat-group"><div class="sidebar-cat-title">' + esc(c) + '</div>' +
          '<div class="sidebar-list">' + optionHtml(cats[c], 'group', opts.groupCount) + '</div></div>'
      })
      groupEl.innerHTML = html || '<span class="models-state" style="padding:12px 0">无</span>'
    }

    var tagQ = (document.getElementById('sidebarTagSearch').value || '').trim().toLowerCase()
    var tagEl = document.getElementById('sidebarTag')
    if (tagEl) {
      var tlist = opts.tags.filter(function (t) { return !tagQ || t.toLowerCase().indexOf(tagQ) >= 0 })
      tagEl.innerHTML = optionHtml(tlist, 'tag', opts.tagCount)
    }
  }

  function bindAccordion() {
    var acc = document.getElementById('sidebarAccordion')
    if (!acc) return
    acc.addEventListener('click', function (e) {
      var head = e.target.closest('.sidebar-acc-head')
      if (!head) return
      var body = document.getElementById('acc-' + head.getAttribute('data-acc'))
      var open = body.classList.toggle('open')
      head.classList.toggle('open', open)
      head.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
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
    bindList('acc-brand', 'brand')
    bindList('acc-type', 'type')
    bindList('sidebarGroup', 'group')
    bindList('sidebarTag', 'tag')

    var gs = document.getElementById('sidebarGroupSearch')
    if (gs) gs.addEventListener('input', buildSidebar)
    var ts = document.getElementById('sidebarTagSearch')
    if (ts) ts.addEventListener('input', buildSidebar)

    var clear = document.getElementById('sidebarClear')
    if (clear) clear.addEventListener('click', function () {
      state.filter = { q: state.filter.q, brand: '', type: '', group: '', tag: '' }
      if (gs) gs.value = ''
      if (ts) ts.value = ''
      buildSidebar()
      render()
    })

    /* 浮动筛选弹窗 */
    var layer = document.getElementById('filterLayer')
    var backdrop = document.getElementById('filterBackdrop')
    var filterClose = document.getElementById('filterClose')
    var filterBtn = document.getElementById('filterBtn')

    function openFilter() {
      if (!layer) return
      layer.hidden = false
      requestAnimationFrame(function () { layer.classList.add('open') })
      document.body.style.overflow = 'hidden'
    }
    function closeFilter() {
      if (!layer) return
      layer.classList.remove('open')
      setTimeout(function () { layer.hidden = true }, 240)
      document.body.style.overflow = ''
    }
    if (filterBtn) filterBtn.addEventListener('click', openFilter)
    if (backdrop) backdrop.addEventListener('click', closeFilter)
    if (filterClose) filterClose.addEventListener('click', closeFilter)
    window.__closeModelFilter = closeFilter
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
    var groups = availableGroupsOf(m)
    if (!groups.length) return '<div class="models-state" style="padding:16px">暂无可公开分组</div>'

    var cols = []
    if (base.kind === 'token') {
      cols.push({ key: 'input', label: '输入' })
      cols.push({ key: 'completion', label: '输出' })
      if (Number(m.cache_ratio) > 0) cols.push({ key: 'cacheHit', label: '缓存命中' })
      if (Number(m.cache_creation_5m_ratio) > 0) cols.push({ key: 'cache5m', label: '5m缓存创建' })
      if (Number(m.cache_creation_1h_ratio) > 0) cols.push({ key: 'cache1h', label: '1h缓存创建' })
    } else {
      cols.push({ key: 'price', label: '价格' })
    }

    var withPrice = [], noPrice = []
    groups.forEach(function (g) {
      var p = groupPrice(base, g)
      if (p) withPrice.push({ group: g, p: p, v: p.input != null ? p.input : p.price })
      else noPrice.push(g)
    })
    withPrice.sort(function (a, b) { return a.v - b.v })

    var rows = withPrice.map(function (item, idx) {
      var best = idx === 0 ? ' is-best' : ''
      var tds = '<td>' + esc(item.group) + '</td>'
      cols.forEach(function (c) { tds += '<td>' + fmtPrice(item.p[c.key]) + '</td>' })
      return '<tr class="' + best + '">' + tds + '</tr>'
    }).join('')

    var head = '<th>分组</th>' + cols.map(function (c) { return '<th>' + c.label + '</th>' }).join('')
    var extra = noPrice.length
      ? '<p class="drawer-group-legend">另有 ' + noPrice.length + ' 个非公开分组已隐藏。</p>'
      : ''

    return '<div class="drawer-table-wrap"><table class="drawer-table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>' + extra
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
      if (e.key !== 'Escape') return
      if (!document.getElementById('modelDrawer').hidden) closeDrawer()
      else if (window.__closeModelFilter) window.__closeModelFilter()
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
    bindAccordion()
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
