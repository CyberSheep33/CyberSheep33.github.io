# 模型数据更新日志 2026-09-02

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-02T07:31:30.169410+00:00
- 上一版本：2026-08-31
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：1d45b23373032c605a417961494442b398169d2948a66d7481159090087835db
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-02.html`

## 数据统计

- 模型数：412
- 有效分组：74
- 厂商数：55
- 调用端点数：180
- 计费类型：audio 2、basic 338、cache 15、image 4、step 53

## 变化摘要

- 新增模型：2
- 移除模型：2
- 字段变化模型：68
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：68

## 新增模型

claude-fable-5-1, o3-pro-2025-06-10

## 移除模型

gpt-realtime-1.5-2026-02-23, gpt-realtime-2025-08-28

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
