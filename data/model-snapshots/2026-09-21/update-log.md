# 模型数据更新日志 2026-09-21

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-20T23:05:57.219970+00:00
- 上一版本：2026-09-20
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing-1.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：5355a4427a0e45b8a94aa5047ec95272c0db9d61be27146ad571829cb9c83a4a
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-21.html`

## 数据统计

- 模型数：362
- 有效分组：66
- 厂商数：22
- 调用端点数：180
- 计费类型：audio 2、basic 287、cache 13、image 6、step 54

## 变化摘要

- 新增模型：2
- 移除模型：2
- 字段变化模型：3
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：3

## 新增模型

doubao-seed-2-1-pro-260915, doubao-seed-2-1-turbo-260628

## 移除模型

mj_upload, mj_upscale

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
