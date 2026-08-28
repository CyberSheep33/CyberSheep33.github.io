# 快速开始教程内容模型与交互规范

> 本规范定义快速开始的工具、模型、配置方式和教程路线。新增教程时必须遵守。

## 1. 为什么使用“有效路线”

工具、模型和配置方式不是任意组合：CC Switch 只支持特定工具；Reasonix 使用内置面板；CLion 中不同 AI 插件有各自设置页。因此系统不生成笛卡尔积，而只发布已经验证的路线。

一条教程路线表示：

```text
某个工具 + 某类模型 + 某种配置方式 + 一个真实教程页面
```

## 2. 实体定义

### 工具

字段：

- `id`：稳定标识，不随显示名称变化；
- `name`：用户看到的名称；
- `family`：兼容性归属，例如 `codex`、`claude-code`；
- `kind`：CLI、Desktop、IDE、Plugin 或 Harness；
- `status`：`published` 或 `planned`；
- `summary`：一句话说明用途；
- `order`：展示顺序。

CLion 等宿主中的插件应建成独立工具条目，并通过 `host` 指向宿主，避免把不同插件错误地视为同一个配置目标。

### 模型目标

模型维度描述教程所针对的模型族或兼容目标，不要求每个具体模型 ID 都创建教程。

- `native`：工具原生模型，例如 Claude Code 的 Claude、Codex 的 GPT；
- `other`：通过兼容协议接入的其他模型，例如 DeepSeek；
- `protocol`：OpenAI、Anthropic 或其他兼容协议；
- `default_model`：教程示例使用的默认模型，可为空。

当多个模型使用完全相同的配置流程时，应共用一篇教程，并在正文中列出可替换的模型 ID。

### 配置方式

标准类型：

- `manual-config-file`：手动修改配置文件；
- `ccswitch`：通过 CC Switch 配置；
- `ccswitch-local-router`：CC Switch 加本地路由；
- `builtin-panel`：工具自带配置面板；
- `plugin-panel`：IDE 插件设置面板；
- `manual-provider-entry`：手动填写供应商、端点和密钥。

配置方式可声明 `supported_families`。为空表示由路线人工确认；非空时，构建脚本必须拒绝不兼容路线。

### 教程路线

必填字段：

- `id`、`tool`、`model`、`method`；
- `title`、`summary`、`url`；
- `status`：`published`、`draft`、`needs-review`；
- `updated` 和 `verified_at`；
- `difficulty`：`beginner`、`intermediate`、`advanced`。

可选字段：`recommended`、`requires_local_router`、`source_urls`、`tool_version`、`configurator_version`、`tags`。

只有 `published` 路线出现在用户页面。`needs-review` 用来记录已经存在但需要重新核验的旧教程。

## 3. 用户界面

快速开始首页分两级：

1. 工具选择区：只显示至少有一条已发布路线的工具；
2. 路线区：选择工具后，按模型目标分组，展示该工具实际支持的配置方式。

两级属于同一个主流程，桌面端并列展示并使用方向指引，移动端按上下顺序展示。两个区域必须使用可辨识的同色系表面色，当前选择需要同时反馈在工具卡片和路线区标题中。

用户直接进入快速开始首页时不得默认选中第一个工具，路线区应显示“等待选择工具”的引导状态；从首页工具卡片通过 `?tool=<tool-id>` 进入时，可以直接显示对应路线。

配置生成器、网络专题等内容属于独立资源，不编号为第三步，也不得在视觉上伪装成主流程的后续操作。

路线卡片应显示：模型、配置方式、难度、是否推荐、是否需要本地路由、最后验证日期。

URL 支持 `?tool=<tool-id>`，便于首页和其他内容直接进入某个工具的教程集合。

## 4. 教程正文规范

建议结构：

1. 本教程适用于谁；
2. 最终会完成什么；
3. 环境和版本要求；
4. 安装工具；
5. 注册 Sheep AI Plus 并创建 API Key；
6. 选择模型与令牌分组；
7. 按路线完成配置；
8. 启动验证；
9. 常见错误和关联公告；
10. 来源、适用版本和最后验证时间。

安全要求：API Key 示例必须打码；不得写入前端数据、日志、URL 示例、localStorage 或 Cookie。

## 5. AI 辅助维护流程

AI 更新教程时必须：

1. 读取本规范和相关官方资料；
2. 确认工具、模型和配置方式的兼容关系；
3. 把无法验证的信息标为待核验，不得猜测；
4. 保留原 URL，除非提供重定向；
5. 更新 `verified_at`、版本与来源；
6. 运行构建和验证脚本；
7. 对桌面、375px 移动端、浅色和深色主题进行目验。
