# Minimal MCP Server

这个示例说明 MCP Server 的最小设计思路：把一个本地能力封装成 AI 客户端可以发现和调用的工具。

这里提供的是教学版伪实现，重点是看懂工具边界。真实项目中可以使用官方 MCP SDK 实现。

## 工具设计

工具名：`search_files`

输入：

- `query`：搜索关键词
- `root`：搜索目录
- `limit`：最多返回数量

输出：

- 文件路径
- 行号
- 匹配内容

## 运行方式

```bash
cd examples/minimal-mcp-server
python search_files_demo.py ../../docs rag
```

## 安全原则

- 只允许搜索白名单目录
- 不读取隐藏文件
- 不返回 `.env`、token、cookie 等敏感内容
- 错误信息要清楚

## 下一步改造

- 使用官方 MCP SDK
- 增加 `read_file` 工具
- 增加权限白名单
- 接入真实 AI 客户端
