# 模型数据更新日志 2026-09-18

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-18T14:03:52.269668+00:00
- 上一版本：2026-09-14
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：a867646aecdd07dde9611573c271c3ac3f49fa7f339b3e9e22d7d34e68e050a5
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-18.html`

## 数据统计

- 模型数：362
- 有效分组：66
- 厂商数：22
- 调用端点数：180
- 计费类型：audio 2、basic 287、cache 13、image 6、step 54

## 变化摘要

- 新增模型：1
- 移除模型：47
- 字段变化模型：26
- 分组倍率变化：7

## 字段变化分布

- `enable_groups`：25
- `model_price`：1

## 新增模型

doubao-seedance-2-5-260628

## 移除模型

claude-sonnet-4-20250514, dall-e-3, davinci-002, deepseek-chat, deepseek-r1-2025-01-20, deepseek-r1-250120, deepseek-r1-250528, deepseek-reasoner, deepseek-v3-0324, deepseek-v3-1-250821, deepseek-v3-250324, doubao-seedance-2-0-fast-260128, gemini-3-pro-preview-11-2025, gemini-flash-latest, gemini-pro-latest, glm-4, gpt-4-0613, gpt-4-turbo-preview, gpt-4o-audio-preview, gpt-4o-mini-audio-preview, gpt-4o-mini-audio-preview-2024-12-17, gpt-4o-mini-search-preview, gpt-4o-mini-search-preview-2025-03-11, gpt-4o-search-preview, gpt-4o-search-preview-2025-03-11, gpt-5.1-chat, gpt-5.1-codex-max, gpt-5.2-chat, gpt-5.3-chat-latest, gpt-5.3-codex-spark, gpt-oss-20b, grok-3, grok-3-mini, grok-4-fast-non-reasoning, grok-4-fast-reasoning, kimi-k2-250905, kimi-k2-instruct, llama-2-13b, llama-3.1-405b-instruct, llama-3.3-70b, mimo-v2-pro, qvq-max-latest, qwen-max-latest, qwen-turbo-2025-07-15, qwen-vl-max-2025-08-13, qwq-32b-preview, qwq-plus-2025-03-05

## 校验与详细差异

完整字段变化见同目录下的 `changes.json`。

价格锚点：

```json
[
  {
    "name": "claude-opus-5",
    "base_input": 5.0,
    "aws_bedrock_1_input": 4.323564
  },
  {
    "name": "gpt-5.6-sol",
    "stage_1_input": 5.0,
    "stage_2_input": 10.0
  }
]
```

价格为模型广场估算值，最终以 Sheep AI Plus 实际扣费为准。
