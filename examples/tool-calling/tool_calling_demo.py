from dataclasses import dataclass
from typing import Optional


@dataclass
class ToolCall:
    name: str
    arguments: dict


def search_docs(query: str) -> list[dict]:
    docs = [
        {"title": "RAG", "summary": "RAG retrieves knowledge before generation."},
        {"title": "MCP", "summary": "MCP connects AI clients with tools and data."},
    ]
    return [doc for doc in docs if query.lower() in doc["title"].lower()]


def fake_model_decide_tool(user_message: str) -> Optional[ToolCall]:
    if "rag" in user_message.lower():
        return ToolCall(name="search_docs", arguments={"query": "RAG"})
    if "mcp" in user_message.lower():
        return ToolCall(name="search_docs", arguments={"query": "MCP"})
    return None


def run_tool(call: ToolCall) -> object:
    if call.name == "search_docs":
        return search_docs(**call.arguments)
    raise ValueError(f"Unknown tool: {call.name}")


def answer_with_tool_result(user_message: str, tool_result: object) -> str:
    return (
        f"User asked: {user_message}\n"
        f"Tool result: {tool_result}\n\n"
        "A real model would use this tool result to produce the final answer."
    )


if __name__ == "__main__":
    user_message = "Can you explain RAG?"
    tool_call = fake_model_decide_tool(user_message)

    if tool_call is None:
        print("No tool needed.")
    else:
        result = run_tool(tool_call)
        print(answer_with_tool_result(user_message, result))
