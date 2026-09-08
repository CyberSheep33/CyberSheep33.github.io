# 模型数据更新日志 2026-09-08

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-09-08T07:36:55.814599+00:00
- 上一版本：2026-09-02
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：1d4762a55367a3647cdb92dab1fb9c0a89aed22aaefc96c4d9d6fb29e5ea434a
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-09-08.html`

## 数据统计

- 模型数：407
- 有效分组：67
- 厂商数：55
- 调用端点数：180
- 计费类型：audio 2、basic 332、cache 15、image 4、step 54

## 变化摘要

- 新增模型：4
- 移除模型：9
- 字段变化模型：22
- 分组倍率变化：7

## 字段变化分布

- `enable_groups`：21
- `model_price`：1

## 新增模型

gemini-3.8-flash, gpt-6-astra, qwen3.8-max-0902, wan3.0-video

## 移除模型

ERNIE-3.5-8K, ERNIE-4.0-8K, ERNIE-Character-8K, ERNIE-Functions-8K, ERNIE-Lite-8K, ERNIE-Speed-128K, ERNIE-Speed-8K, ERNIE-Tiny-8K, Embedding-V1

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
