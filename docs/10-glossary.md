# Glossary

这份术语表用尽量简单的话解释 AI 应用开发中的常见概念。

## LLM

Large Language Model，大语言模型。可以理解和生成文本，也可以辅助代码、推理、摘要、分类和信息抽取。

## Prompt

给模型的指令和上下文。好的 Prompt 会告诉模型角色、任务、约束、输出格式和失败处理方式。

## HTTP API

通过 HTTP 请求调用服务的接口。大多数模型能力、向量数据库和业务系统都通过 API 集成。

## JSON

一种常见的结构化数据格式。AI 应用常用 JSON 表达模型输入、工具参数、结构化输出和评测数据。

## Environment Variable

环境变量。用来保存 API Key、数据库地址和运行环境等配置，避免把敏感信息写死在代码里。

## Token

模型处理文本的基本单位。输入和输出都会消耗 Token，影响费用和上下文长度。

## Context Window

模型一次请求最多能看到的内容长度。不是所有历史和文档都能无限塞进去。

## Message

一次模型调用中的消息单元，通常包含 role 和 content。常见 role 包括 system、user、assistant 和 tool。

## Temperature

控制模型输出随机性的参数。低温度更稳定，高温度更有创造性。

## Max Output Tokens

限制模型最多生成多少 token。设置太小可能回答被截断，设置太大可能增加成本。

## Structured Output

要求模型按固定结构输出，例如 JSON、表格或 schema。适合分类、抽取、评分和工具参数生成。

## Embedding

把文本转换成向量，用于语义相似度检索。

## Vector Database

向量数据库，用来存储和检索 Embedding。常见选择包括 pgvector、Qdrant、Milvus。

## RAG

Retrieval-Augmented Generation，检索增强生成。先检索资料，再让模型基于资料回答。

## Chunk

文档切分后的片段。RAG 会把文档切成 chunk 后再向量化。

## Metadata

描述数据的数据。例如文档来源、页码、作者、部门、时间和权限标签。RAG 常用 metadata 做过滤和引用。

## Rerank

对初步检索结果重新排序，提高最相关内容排在前面的概率。

## Query Rewrite

把用户问题改写成更适合检索的查询。例如把多轮对话里的“这个怎么算”改写成完整问题。

## Citation

引用来源。RAG 回答中用来说明答案依据来自哪篇文档、哪个章节或哪个片段。

## Agent

能调用工具、读取结果并继续执行任务的 AI 系统。

## Tool Calling

模型根据上下文选择外部工具，并生成结构化参数进行调用。

## Function Schema

描述工具输入输出结构的 schema。它告诉模型工具需要哪些参数，也方便代码校验。

## Workflow

由代码固定编排的一组步骤。和 Agent 相比，workflow 更确定，适合流程稳定的业务。

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

## Prompt Injection

提示词注入。用户输入或外部文档中包含恶意指令，试图让模型忽略系统规则、泄露信息或执行危险操作。

## Rate Limit

限流。限制用户或系统在一段时间内的请求次数，防止滥用和成本失控。

## Cache

缓存。保存可复用结果以降低延迟和成本，例如 embedding、摘要、检索结果或高频问题答案。

## Bad Case

失败案例。模型答错、检索失败、格式错误、越权风险等都可以记录为 bad case，用于评测和迭代。

## Human Review

人工复核。在高风险或低置信度场景中，让人检查模型输出或工具操作后再继续。
