# Minimal RAG

这个示例用最少代码解释 RAG 的核心流程：

```text
文档 -> 切分 -> 检索相关片段 -> 拼进 Prompt -> 模型回答
```

为了让新手容易理解，这个示例先用关键词检索，不强制引入向量数据库。真正项目中可以把 `retrieve` 替换成 Embedding + Vector Store。

## 运行方式

```bash
cd examples/minimal-rag
python rag_demo.py
```

## 你应该观察什么

- 文档是如何切成 chunk 的
- 用户问题如何匹配 chunk
- Prompt 如何要求模型只基于上下文回答
- 当上下文没有答案时应该如何拒答

## 下一步改造

- 接入 Embedding
- 使用 pgvector 或 Qdrant
- 增加引用来源
- 增加评测集
- 支持上传 PDF 或 Markdown
