# 模型数据更新日志 2026-10-09

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-10-09T11:52:40.872513+00:00
- 上一版本：2026-10-04
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing-first.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：944c7b092adc4d6a73c75aa67106f0c768b380c47fb9dc3110506a5b526ebdca
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-10-09.html`

## 数据统计

- 模型数：367
- 有效分组：66
- 厂商数：24
- 调用端点数：182
- 计费类型：audio 2、basic 286、cache 16、image 6、step 57

## 变化摘要

- 新增模型：3
- 移除模型：6
- 字段变化模型：14
- 分组倍率变化：0

## 字段变化分布

- `cache_ratio`：1
- `enable_groups`：12
- `supported_endpoint_types`：1

## 新增模型

claude-haiku-5-5, gemini-2.0-flash-lite, gemini-nano-banana-2.1

## 移除模型

gemini-embedding-2-preview, gemini-flash-latest, gemini-pro-latest, qwen3-coder-plus, qwen3.6-max-preview, wan3.0-video

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
