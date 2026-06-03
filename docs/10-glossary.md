# Glossary

这份术语表用尽量简单的话解释 AI 应用开发中的常见概念。

## LLM

Large Language Model，大语言模型。可以理解和生成文本，也可以辅助代码、推理、摘要、分类和信息抽取。

## Prompt

给模型的指令和上下文。好的 Prompt 会告诉模型角色、任务、约束、输出格式和失败处理方式。

## Token

模型处理文本的基本单位。输入和输出都会消耗 Token，影响费用和上下文长度。

## Context Window

模型一次请求最多能看到的内容长度。不是所有历史和文档都能无限塞进去。

## Temperature

控制模型输出随机性的参数。低温度更稳定，高温度更有创造性。

## Embedding

把文本转换成向量，用于语义相似度检索。

## Vector Database

向量数据库，用来存储和检索 Embedding。常见选择包括 pgvector、Qdrant、Milvus。

## RAG

Retrieval-Augmented Generation，检索增强生成。先检索资料，再让模型基于资料回答。

## Chunk

文档切分后的片段。RAG 会把文档切成 chunk 后再向量化。

## Rerank

对初步检索结果重新排序，提高最相关内容排在前面的概率。

## Agent

能调用工具、读取结果并继续执行任务的 AI 系统。

## Tool Calling

模型根据上下文选择外部工具，并生成结构化参数进行调用。

## MCP

Model Context Protocol，用统一方式把工具和数据源连接给 AI 应用。

## Hallucination

模型生成看似合理但不真实的信息，中文常称为幻觉。

## LLM-as-judge

用另一个模型给模型输出打分。适合批量评测，但需要人工抽检。

## Guardrails

安全和边界控制，包括权限、拒答、敏感信息保护、工具确认等。

## Observability

可观测性。记录 prompt、模型输出、工具调用、延迟、成本和错误，方便排查和优化。
