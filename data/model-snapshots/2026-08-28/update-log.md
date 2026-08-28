# 模型数据更新日志 2026-08-28

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-08-28T12:43:37.594218+00:00
- 上一版本：2026-08-24
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：f2993f6a26c9dee1934865056598d5e72bed8796a28935b2d7b1e24902d66d94
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-08-28.html`

## 数据统计

- 模型数：453
- 有效分组：74
- 厂商数：55
- 调用端点数：180
- 计费类型：audio 3、basic 376、cache 17、image 4、step 53

## 变化摘要

- 新增模型：2
- 移除模型：9
- 字段变化模型：63
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：63

## 新增模型

glm-5.3-flash, qwen3.8-flash

## 移除模型

deepseek-v3-1-think-250821, doubao-1-5-pro-256k-250115, doubao-1-5-pro-32k-character-250228, doubao-seed-1-6-flash-250615, doubao-seed-1-6-flash-250715, gemma-7b-it, moonshot-v1-128k, moonshot-v1-32k, moonshot-v1-8k

## 校验与详细差异

完整字段变化见同目录下的 `changes.json`。

价格锚点：

```json
[
  {
    "name": "claude-opus-5",
    "base_input": 5.0,
    "aws_bedrock_1_input": 3.08826
  },
  {
    "name": "gpt-5.6-sol",
    "stage_1_input": 5.0,
    "stage_2_input": 10.0
  }
]
```

价格为模型广场估算值，最终以 Sheep AI Plus 实际扣费为准。
