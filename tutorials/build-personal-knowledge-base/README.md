# Build a Personal Knowledge Base Assistant

这个教程带你从 0 到 1 做一个“个人知识库问答助手”。目标不是堆满框架，而是让你真正理解一个 RAG 应用从用户提问到最终回答的完整链路。

完成后你应该能讲清楚：

- 文档如何进入系统
- 为什么要 chunk
- Embedding 和检索在做什么
- Prompt 如何约束模型只基于资料回答
- 引用来源怎么做
- 如何用评测集持续改进

## 最终效果

用户上传或放入一批 Markdown、PDF、网页笔记后，可以提问：

```text
我的 30 天 AI 学习计划里，第 2 周应该做什么？
```

系统返回：

```text
第 2 周建议重点完成 RAG 入门，包括阅读 RAG 文档、准备测试文档、实现文档切分、检索、RAG 最小版本、引用来源和 20 条测试问题。

来源：
- 30-day-plan.md / Week 2
```

## 推荐技术栈

新手建议先用最小组合：

| 模块 | 推荐 |
| --- | --- |
| 语言 | Python |
| API 服务 | FastAPI |
| 本地存储 | SQLite |
| 向量检索 | 先用内存或 SQLite，后续换 pgvector/Qdrant |
| 文档格式 | 先支持 Markdown，再支持 PDF |
| 评测 | CSV/JSON + 简单评分脚本 |

不要第一天就引入太多框架。先跑通数据流，再替换组件。

## 总体架构

```text
用户问题
  -> 后端 API
  -> 查询改写
  -> 检索相关 chunk
  -> 组装 Prompt
  -> 调用模型
  -> 解析答案和引用
  -> 记录日志和反馈
```

离线索引流程：

```text
文档导入
  -> 文档解析
  -> 文本清洗
  -> Chunk 切分
  -> 生成 Embedding
  -> 保存 chunk + metadata + vector
```

## Step 1：完成最小聊天调用

先不要做知识库。第一步只验证模型 API 能正常调用。

你要做到：

- API Key 放在环境变量里
- 能发送用户问题
- 能打印模型回答
- 能记录耗时和错误

检查点：

- 不把 API Key 写进代码
- 失败时能看到错误信息
- 输出能被日志记录

## Step 2：读取本地文档

先支持 Markdown 文件。读取文件后，把内容和用户问题一起放进 Prompt。

示例 Prompt：

```text
你是个人知识库助手。请只基于下面资料回答问题。

资料：
{document_text}

用户问题：
{question}

如果资料中没有答案，请说“资料中没有找到答案”。
```

这一步会很快遇到上下文太长的问题，所以不能长期把整篇文档塞给模型。

## Step 3：实现 Chunk 切分

Chunk 是文档切分后的片段。新手可以先用简单策略：

- Markdown 按标题优先切分
- 每个 chunk 控制在 500 到 1000 中文字
- 相邻 chunk 保留少量重叠
- 每个 chunk 保存 title、source、section、chunk_id

示例数据结构：

```json
{
  "chunk_id": "30-day-plan#week-2#001",
  "title": "30-Day Plan",
  "source": "checklists/30-day-plan.md",
  "section": "Week 2：RAG 入门",
  "text": "Day 8 阅读 RAG 文档..."
}
```

判断 chunk 好不好，不看数量，而看用户提问时能不能检索到完整依据。

## Step 4：先做关键词检索

在引入向量检索前，先做一个关键词检索版本。它不高级，但很适合帮助你理解检索流程。

最低要求：

- 输入用户问题
- 在 chunk 文本和标题中匹配关键词
- 返回 top-k chunk
- 把 chunk 放进 Prompt 回答

这一步能让你先跑通 RAG 的主链路。

## Step 5：加入 Embedding 和向量检索

Embedding 会把文本转换成向量，用来做语义相似度检索。

索引时：

```text
chunk text -> embedding model -> vector -> 保存
```

查询时：

```text
question -> embedding model -> query vector -> 相似度搜索 -> top-k chunks
```

注意事项：

- chunk 更新后要重新生成 embedding
- 保存 embedding 模型版本
- 保存 chunk metadata，方便过滤和引用
- 记录相似度分数，方便调试

## Step 6：组装 RAG Prompt

把检索到的 chunk 作为“可用资料”，而不是让模型自由发挥。

推荐模板：

```text
你是个人知识库问答助手。

规则：
- 只能基于“可用资料”回答
- 不要编造资料中没有的信息
- 每个关键结论都要给出来源
- 如果资料不足，明确说明缺少什么

可用资料：
{retrieved_chunks}

用户问题：
{question}

输出格式：
答案：
{answer}

来源：
- {source title} / {section}
```

## Step 7：加入引用来源

引用不是装饰，而是 RAG 的信任基础。每个回答至少要能追溯到：

- 文档名
- 章节或页码
- chunk_id
- 原文片段

建议 API 返回：

```json
{
  "answer": "string",
  "sources": [
    {
      "title": "30-Day Plan",
      "source": "checklists/30-day-plan.md",
      "section": "Week 2",
      "chunk_id": "30-day-plan#week-2#001",
      "score": 0.82
    }
  ]
}
```

## Step 8：处理无法回答

资料不足时，系统应该拒答。

常见拒答条件：

- top-k 检索结果分数太低
- 检索结果和问题主题不相关
- 模型判断资料没有直接答案
- 用户请求超出知识库范围

拒答示例：

```text
资料中没有找到这个问题的明确答案。当前检索到的内容主要和 RAG 学习计划有关，没有包含部署费用信息。
```

## Step 9：建立最小评测集

准备 30 条问题：

- 15 条资料中有明确答案
- 5 条需要综合多个 chunk
- 5 条应该拒答
- 5 条历史 bad case

每条记录：

```json
{
  "id": "kb_001",
  "question": "第 2 周学习什么？",
  "expected_behavior": "回答 RAG 入门任务并引用 30-day-plan",
  "required_sources": ["checklists/30-day-plan.md"],
  "tags": ["rag", "easy"]
}
```

## Step 10：上线前检查

上线前至少确认：

- API Key 不在前端和 Git 仓库里
- 用户只能访问自己的文档
- 检索和回答都有日志
- 回答带引用
- 资料不足时会拒答
- 有 token、成本、延迟统计
- 有 bad case 反馈入口

更完整的检查见：[RAG Production Checklist](../../checklists/rag-production-checklist.md)。

## 常见迭代方向

| 问题 | 优化方向 |
| --- | --- |
| 检索不到答案 | 优化 chunk、metadata、query rewrite |
| 检索到了但答错 | 改 Prompt、加引用校验、加强拒答 |
| 引用不准 | 保存更细 metadata，限制模型引用来源 |
| 成本高 | 减少 top-k、压缩上下文、缓存 embedding |
| 延迟高 | 异步索引、缓存、选择更快模型 |

## 最终你应该交付什么

- 一个可运行的 RAG 问答 demo
- 一批测试文档
- 30 条评测问题
- 一份项目 README
- 一份 bad case 记录
- 一张架构图

这比只写“我会 RAG”有说服力得多。
