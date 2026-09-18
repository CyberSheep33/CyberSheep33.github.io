# 模型数据更新日志 2026-09-14

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-14T02:53:39.514072+00:00
- 上一版本：2026-09-08
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：4d164d2fcee00c8c3750ac4bdd499e203577152476e3eb617c247439e4306e4b
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-14.html`

## 数据统计

- 模型数：408
- 有效分组：67
- 厂商数：22
- 调用端点数：180
- 计费类型：audio 2、basic 332、cache 14、image 6、step 54

## 变化摘要

- 新增模型：7
- 移除模型：6
- 字段变化模型：85
- 分组倍率变化：67

## 字段变化分布

- `enable_groups`：80
- `model_price`：2
- `model_ratio`：2
- `supported_endpoint_types`：5

## 新增模型

aigc-video-hailuo, deepseek-v4.1-flash, gpt-image-2.5-flare, gpt-image-2.5-flare-c, gpt-image-2.5-sunburst, gpt-image-2.5-sunburst-c, gpt-oss-20b

## 移除模型

claude-opus-4-20250514, gemini-2.0-flash-lite, gemini-2.5-flash-lite-preview-09-2025, grok-4-1-fast-non-reasoning, grok-4-1-fast-reasoning, kling-image

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
