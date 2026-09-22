# 模型数据更新日志 2026-09-23

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-22T23:05:06.487146+00:00
- 上一版本：2026-09-22
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing-1.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：0e1c06f33799c31f37aef108eb9e16c80e82a7f821b41ee34cd4554336b5defc
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-23.html`

## 数据统计

- 模型数：366
- 有效分组：66
- 厂商数：22
- 调用端点数：180
- 计费类型：audio 2、basic 290、cache 13、image 6、step 55

## 变化摘要

- 新增模型：1
- 移除模型：0
- 字段变化模型：8
- 分组倍率变化：1

## 字段变化分布

- `enable_groups`：8

## 新增模型

grok-4.7

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
