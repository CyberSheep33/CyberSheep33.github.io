/* ============================================================
   CyberSheep — CC Switch 配置预设
   ============================================================
   Deep Link 协议（已按 CC Switch 官方 V1 规范确认）：
     ccswitch://v1/import?resource=provider&app={app}&name={name}
       &endpoint={encoded}&apiKey={encoded}&homepage={encoded}&enabled=true

   维护方式：新增 preset 只需在 CCSWITCH_PRESETS 里加一条对象。
   - id        : 唯一标识，用于 ?preset= 与 widget 的 data-preset
   - app       : CC Switch 的 app 类型（见下方枚举，Claude Desktop 与 Claude Code 是独立类型）
                 claude / claude-desktop / codex / gemini / grokbuild / opencode / openclaw / hermes / pi
   - name      : 导入到 CC Switch 时的供应商名称（deep link 的 name 参数）
   - providerName : 页面展示用的供应商名称
   - endpoint  : 供应商 API 端点（deep link 会自动 URL 编码）
   - homepage  : 供应商官网
   - model     : 默认模型（deep link 的 model 参数；不填则用 CC Switch 内置默认）
   - enabled   : 导入后是否立即启用

   注意：API Key 永远不会写在 preset 里，由用户在页面中即时输入。
   ============================================================ */
(function () {
  'use strict'

  var CCSWITCH_PRESETS = {
    'codex-cli': {
      id: 'codex-cli',
      title: 'Codex CLI',
      app: 'codex',
      name: 'sheepaiplus',
      providerName: 'Sheep AI Plus',
      endpoint: 'https://sheepaiplus.top/v1',
      homepage: 'https://sheepaiplus.top',
      model: 'gpt-5.6-luna',
      enabled: true,
      tag: 'OpenAI · CLI',
      desc: '在终端中使用 OpenAI Codex。'
    },

    'codex-desktop': {
      id: 'codex-desktop',
      title: 'Codex Desktop',
      app: 'codex',
      name: 'sheepaiplus',
      providerName: 'Sheep AI Plus',
      endpoint: 'https://sheepaiplus.top/v1',
      homepage: 'https://sheepaiplus.top',
      model: 'gpt-5.6-luna',
      enabled: true,
      tag: 'OpenAI · 桌面客户端',
      desc: '使用 Codex 桌面客户端进行 AI 编程。'
    },

    'claude-code': {
      id: 'claude-code',
      title: 'Claude Code',
      app: 'claude',
      name: 'sheepaiplus',
      providerName: 'Sheep AI Plus',
      endpoint: 'https://sheepaiplus.top',
      homepage: 'https://sheepaiplus.top',
      enabled: true,
      tag: 'Anthropic · CLI',
      desc: '在终端中使用 Claude Code。'
    },

    'claude-desktop': {
      id: 'claude-desktop',
      title: 'Claude Desktop',
      app: 'claude-desktop',
      name: 'sheepaiplus',
      providerName: 'Sheep AI Plus',
      endpoint: 'https://sheepaiplus.top',
      homepage: 'https://sheepaiplus.top',
      // CC Switch V1 深度链接协议暂未支持 app=claude-desktop 一键导入（官方文档 app 仅列出
      // claude/codex/gemini/opencode/openclaw）。因此该 preset 先置 deeplinkSupported=false，
      // 页面展示手动配置步骤；等 CC Switch 支持后再改成 true 即可开放一键导入。
      deeplinkSupported: false,
      enabled: true,
      tag: 'Anthropic · 桌面客户端',
      desc: '使用 Claude 桌面客户端。'
    },

    'gemini-cli': {
      id: 'gemini-cli',
      title: 'Gemini CLI',
      app: 'gemini',
      name: 'sheepaiplus',
      providerName: 'Sheep AI Plus',
      endpoint: 'https://sheepaiplus.top',
      homepage: 'https://sheepaiplus.top',
      enabled: true,
      tag: 'Google · CLI',
      desc: '在终端中使用 Gemini CLI。'
    }
  }

  function getPreset(id) {
    return CCSWITCH_PRESETS[id] || null
  }

  function allPresets() {
    var keys = Object.keys(CCSWITCH_PRESETS)
    return keys.map(function (k) { return CCSWITCH_PRESETS[k] })
  }

  window.CCSWITCH_PRESETS = CCSWITCH_PRESETS
  window.CCSWITCH = window.CCSWITCH || {}
  window.CCSWITCH.getPreset = getPreset
  window.CCSWITCH.allPresets = allPresets
})()
