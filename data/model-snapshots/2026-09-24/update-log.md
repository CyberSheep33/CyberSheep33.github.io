# 模型数据更新日志 2026-09-24

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-23T23:03:26.510608+00:00
- 上一版本：2026-09-23
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：0b758df3a7494329a4d0bbde2d01265864a960af8855e163179b8329b05340b7
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-24.html`

## 数据统计

- 模型数：370
- 有效分组：66
- 厂商数：22
- 调用端点数：180
- 计费类型：audio 2、basic 291、cache 14、image 6、step 57

## 变化摘要

- 新增模型：5
- 移除模型：1
- 字段变化模型：3
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：3

## 新增模型

claude-opus-5-5, gpt-6-luna, gpt-6-sol, mimo-v2.6-flash, mimo-v2.6-pro

## 移除模型

gpt-3.5-turbo-0125

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
