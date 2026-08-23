/* ============================================================
   CyberSheep — CC Switch Deep Link 核心逻辑
   ============================================================
   所有页面统一调用这一份逻辑：
     preset → API Key → 校验 → 构建配置 → URL Encode → ccswitch:// 链接

   Deep Link 协议（CC Switch V1，官方规范）：
     ccswitch://v1/import?resource=provider&app={app}&name={name}
       &endpoint={encoded}&apiKey={encoded}&homepage={encoded}&enabled=true

   安全要求：
   - API Key 只在当前页面内存中参与构建链接；
   - 不写入 localStorage / sessionStorage / Cookie；
   - 不发送到任何服务器 / 统计服务；
   - 不打印到 console。
   ============================================================ */
(function () {
  'use strict'

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  // 校验 API Key：非空，去掉首尾空白后长度 >= 10，且不含空格
  function validateApiKey(apiKey) {
    var key = String(apiKey || '').trim()
    if (!key) return { ok: false, reason: 'empty' }
    if (key.length < 10) return { ok: false, reason: 'too-short' }
    if (/\s/.test(key)) return { ok: false, reason: 'whitespace' }
    return { ok: true, value: key }
  }

  // 构建 provider 导入链接
  // preset: CCSWITCH_PRESETS 里的配置对象
  // apiKey: 用户输入的 API Key（仅用于本次构建）
  function buildProviderDeepLink(preset, apiKey) {
    var key = String(apiKey || '').trim()
    var params = new URLSearchParams()
    params.append('resource', 'provider')
    params.append('app', preset.app)
    params.append('name', preset.name || 'sheepaiplus')
    if (preset.endpoint) params.append('endpoint', preset.endpoint)
    if (key) params.append('apiKey', key)
    if (preset.homepage) params.append('homepage', preset.homepage)
    if (preset.model) params.append('model', preset.model)
    params.append('enabled', preset.enabled === false ? 'false' : 'true')
    return 'ccswitch://v1/import?' + params.toString()
  }

  // 触发打开 CC Switch（用户点击事件中调用）
  function openDeepLink(url) {
    if (!url) return false
    var a = document.createElement('a')
    a.href = url
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  }

  // 复制配置链接到剪贴板（含 API Key，仅在用户主动触发时调用）
  function copyDeepLink(url, onDone, onFail) {
    function fallback() {
      var ta = document.createElement('textarea')
      ta.value = url
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.style.top = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try {
        var ok = document.execCommand('copy')
        ok ? onDone() : onFail()
      } catch (e) {
        onFail()
      }
      document.body.removeChild(ta)
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(onDone).catch(fallback)
    } else {
      fallback()
    }
  }

  window.CCSWITCH = window.CCSWITCH || {}
  window.CCSWITCH.escapeHtml = escapeHtml
  window.CCSWITCH.validateApiKey = validateApiKey
  window.CCSWITCH.buildProviderDeepLink = buildProviderDeepLink
  window.CCSWITCH.openDeepLink = openDeepLink
  window.CCSWITCH.copyDeepLink = copyDeepLink
})()
