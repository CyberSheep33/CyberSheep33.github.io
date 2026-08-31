# 模型数据更新日志 2026-08-31

> 维护者记录：保存数据来源、校验信息和归档位置，不作为面向用户的公告。

## 版本与来源

- 生成时间（UTC）：2026-08-31T07:56:41.500410+00:00
- 上一版本：2026-08-28
- 数据源：https://sheepaiplus.top/api/pricing
- 源文件：pricing.json
- 原始响应：raw.json.gz
- 原始数据 SHA-256：6bc05b0cd8daeb9452b7668d30ea0cbd00704867bd5745dc4bc5cea0702c4af4
- 清洗快照：`cleaned.json`
- 机器差异：`changes.json`
- 用户公告：`announcements/models-update-2026-08-31.html`

## 数据统计

- 模型数：412
- 有效分组：74
- 厂商数：55
- 调用端点数：180
- 计费类型：audio 3、basic 338、cache 14、image 4、step 53

## 变化摘要

- 新增模型：0
- 移除模型：41
- 字段变化模型：5
- 分组倍率变化：0

## 字段变化分布

- `enable_groups`：5

## 移除模型

claude-3-5-sonnet-20241022, claude-3-7-sonnet-20250219, claude-3-haiku-20240307, glm-3-turbo, glm-4-air, glm-4.5-airx, glm-4.5-flash, glm-4.5-x, gpt-4o-audio-preview-2025-06-03, gpt-oss-20b, grok-1.5-video-10s, grok-1.5-video-15s, grok-1.5-video-6s, grok-video-3, grok-video-3-10s, grok-video-3-15s, kimi-k2.7-code-highspeed, mj_uploads, o3-pro-2025-06-10, omni_flash-10s, sora-2, text-embedding-v1, veo2, veo2-fast, veo2-fast-components, veo2-fast-frames, veo2-pro, veo2-pro-components, veo3, veo3-fast, veo3-fast-frames, veo3-frames, veo3-pro, veo3-pro-frames, veo3.1, veo3.1-4k, veo3.1-components, veo3.1-components-4k, veo3.1-fast, veo3.1-pro, veo3.1-pro-4k

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
