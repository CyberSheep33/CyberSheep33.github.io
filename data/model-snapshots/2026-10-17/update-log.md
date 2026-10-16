# 模型数据更新日志 2026-10-17

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-10-16T23:02:05.659545+00:00
- 上一版本：2026-10-16
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：c656245883790ccc82a36169dd5783239e0dfefe69ad4159b7020b64c2847d1a
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-10-17.html`

## 数据统计

- 模型数：333
- 有效分组：65
- 厂商数：24
- 调用端点数：182
- 计费类型：audio 2、basic 265、cache 16、image 6、step 44

## 变化摘要

- 新增模型：0
- 移除模型：2
- 字段变化模型：10
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：10

## 移除模型

doubao-seedance-1-5-pro-251215, gpt-3.5-turbo-16k

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
