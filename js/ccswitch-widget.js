/* ============================================================
   CyberSheep — CC Switch 配置组件（Widget）
   ============================================================
   用法：在页面任意位置放
     <div class="ccswitch-widget" data-preset="codex-cli"></div>
   然后依次加载：
     ccswitch-presets.js → ccswitch-core.js → ccswitch-widget.js

   组件会自动生成 API Key 输入框、显示/隐藏按钮、Preset 信息、
   一键导入按钮与安全提示，并调用 ccswitch-core.js 的统一逻辑。
   ============================================================ */
(function () {
  'use strict'

  var widgets = document.querySelectorAll('.ccswitch-widget[data-preset]')
  var widgetIndex = 0

  function showStatus(root, msg, type) {
    var el = root.querySelector('.ccw-status')
    if (!el) return
    el.textContent = msg
    el.className = 'ccw-status' + (type ? ' ccw-status--' + type : '')
  }

  function toast(msg) {
    var el = document.getElementById('toast')
    if (!el) return
    el.textContent = msg
    el.classList.add('toast--show')
    clearTimeout(toast._t)
    toast._t = setTimeout(function () { el.classList.remove('toast--show') }, 1800)
  }

  function renderWidget(host, presetId, index) {
    var preset = window.CCSWITCH.getPreset(presetId)
    if (!preset) {
      host.innerHTML = '<p class="ccw-error">未找到配置预设：' + window.CCSWITCH.escapeHtml(presetId) + '</p>'
      return
    }

    var uid = 'ccw-' + index + '-' + Math.random().toString(36).slice(2, 7)
    var esc = window.CCSWITCH.escapeHtml

    host.innerHTML =
      '<div class="ccw-header">' +
        '<span class="ccw-kicker">一键配置</span>' +
        '<h3>接入 ' + esc(preset.providerName) + '</h3>' +
        '<p>将刚刚创建的 API Key 粘贴到下方。</p>' +
      '</div>' +
      '<div class="ccw-field">' +
        '<label for="' + uid + '-key">API Key</label>' +
        '<div class="ccw-input-wrap">' +
          '<input class="ccw-input" id="' + uid + '-key" type="password" inputmode="text" ' +
            'placeholder="sk-••••••••••••••••" autocomplete="off" autocapitalize="off" spellcheck="false">' +
          '<button class="ccw-eye" type="button" aria-label="显示 / 隐藏 API Key" title="显示 / 隐藏">👁</button>' +
        '</div>' +
      '</div>' +
      '<dl class="ccw-info">' +
        '<div class="ccw-info-row"><dt>服务商</dt><dd>' + esc(preset.providerName) + '</dd></div>' +
        '<div class="ccw-info-row"><dt>适用于</dt><dd>' + esc(preset.title) + '</dd></div>' +
        '<div class="ccw-info-row"><dt>接口地址</dt><dd><code>' + esc(preset.endpoint) + '</code></dd></div>' +
      '</dl>' +
      '<div class="ccw-actions">' +
        '<button class="btn btn-primary ccw-import" type="button">一键导入 CC Switch</button>' +
        '<button class="btn btn-secondary ccw-copy" type="button">复制配置链接</button>' +
      '</div>' +
      '<p class="ccw-note">🔒 API Key 仅在当前浏览器中用于生成配置，不会上传或保存。</p>' +
      '<p class="ccw-status" role="status" aria-live="polite"></p>'

    var input = host.querySelector('input')
    var eye = host.querySelector('.ccw-eye')
    var importBtn = host.querySelector('.ccw-import')
    var copyBtn = host.querySelector('.ccw-copy')

    function currentKey() {
      return (input.value || '').trim()
    }

    eye.addEventListener('click', function () {
      var show = input.type === 'password'
      input.type = show ? 'text' : 'password'
      eye.textContent = show ? '🙈' : '👁'
      eye.setAttribute('aria-label', show ? '隐藏 API Key' : '显示 API Key')
      input.focus()
    })

    function buildLink() {
      var check = window.CCSWITCH.validateApiKey(currentKey())
      if (!check.ok) {
        if (check.reason === 'empty') {
          showStatus(host, '请先填入你的 Sheep AI Plus API Key。', 'error')
        } else {
          showStatus(host, 'API Key 格式看起来不对，请检查后重试。', 'error')
        }
        input.focus()
        return null
      }
      return window.CCSWITCH.buildProviderDeepLink(preset, check.value)
    }

    importBtn.addEventListener('click', function () {
      var link = buildLink()
      if (!link) return
      window.CCSWITCH.openDeepLink(link)
      showStatus(host, '已唤起 CC Switch，请在弹窗中确认导入。', 'ok')
    })

    copyBtn.addEventListener('click', function () {
      var link = buildLink()
      if (!link) return
      window.CCSWITCH.copyDeepLink(link, function () {
        showStatus(host, '配置链接已复制，注意其中包含 API Key，请勿公开分享。', 'ok')
      }, function () {
        showStatus(host, '复制失败，请长按链接手动复制。', 'error')
      })
    })

    // 输入时清除状态提示
    input.addEventListener('input', function () {
      var st = host.querySelector('.ccw-status')
      if (st && st.className !== 'ccw-status') st.className = 'ccw-status'
    })
  }

  widgets.forEach(function (host) {
    var presetId = host.getAttribute('data-preset')
    renderWidget(host, presetId, widgetIndex++)
  })
})()
