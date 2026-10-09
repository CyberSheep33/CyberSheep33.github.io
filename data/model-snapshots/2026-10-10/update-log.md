# 模型数据更新日志 2026-10-10

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-10-09T23:02:23.845201+00:00
- 上一版本：2026-10-09
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：first.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：56cad0e1798cd4c9f9f5d9243321db12d46c3d8a75010f563756e3245334c5b2
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-10-10.html`

## 数据统计

- 模型数：335
- 有效分组：66
- 厂商数：24
- 调用端点数：182
- 计费类型：audio 2、basic 265、cache 16、image 6、step 46

## 变化摘要

- 新增模型：1
- 移除模型：33
- 字段变化模型：1
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：1

## 新增模型

gemini-embedding-2-preview

## 移除模型

deepseek-r1, deepseek-r1-0528, deepseek-v3.1, deepseek-v3.2, deepseek-v3.2-exp, glm-4.7, qvq-max, qwen-turbo, qwen-vl-max, qwen3-14b, qwen3-235b-a22b-instruct-2507, qwen3-30b-a3b, qwen3-30b-a3b-instruct-2507, qwen3-30b-a3b-thinking-2507, qwen3-32b, qwen3-8b, qwen3-coder-30b-a3b-instruct, qwen3-coder-480b-a35b-instruct, qwen3-max, qwen3-max-2026-01-23, qwen3-max-preview, qwen3-next-80b-a3b-instruct, qwen3-next-80b-a3b-thinking, qwen3-vl-235b-a22b-instruct, qwen3-vl-235b-a22b-thinking, qwen3-vl-30b-a3b-instruct, qwen3-vl-30b-a3b-thinking, qwen3-vl-32b-instruct, qwen3-vl-32b-thinking, qwen3-vl-8b-instruct, qwen3-vl-8b-thinking, qwen3-vl-flash, qwq-plus

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
