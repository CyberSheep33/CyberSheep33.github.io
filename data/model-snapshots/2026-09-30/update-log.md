# 模型数据更新日志 2026-09-30

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-30T03:04:38.512114+00:00
- 上一版本：2026-09-27
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing-a.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：9bbb337ec5ed4b2f41e59a5af059ffcd13f845d018a8f6956264b1b720e5a77d
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-30.html`

## 数据统计

- 模型数：366
- 有效分组：66
- 厂商数：24
- 调用端点数：181
- 计费类型：audio 2、basic 285、cache 16、image 6、step 57

## 变化摘要

- 新增模型：6
- 移除模型：9
- 字段变化模型：46
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：25
- `supported_endpoint_types`：27

## 新增模型

claude-opus-4-20250514, claude-sonnet-5-5, doubao-seedance-2-0-mini-260615, gemini-flash-latest, gemini-pro-latest, vidu-image-q2

## 移除模型

MiniMax-Hailuo-02, MiniMax-Hailuo-2.3, audio1.0, vidu-tts, vidu2.0, viduq1, viduq1-classic, viduq3, viduq3-mix

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
