# 模型数据更新日志 2026-09-27

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-27T02:02:31.033542+00:00
- 上一版本：2026-09-25
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：241c0448b13779c73ebac3dbf2cd139306411f40d4a0a9fa95a2b451b34605ee
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-27.html`

## 数据统计

- 模型数：369
- 有效分组：66
- 厂商数：24
- 调用端点数：181
- 计费类型：audio 2、basic 290、cache 14、image 6、step 57

## 变化摘要

- 新增模型：0
- 移除模型：0
- 字段变化模型：29
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：6
- `supported_endpoint_types`：27

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
