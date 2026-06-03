from dataclasses import dataclass
import re


@dataclass
class Chunk:
    id: str
    title: str
    text: str


DOCUMENTS = [
    Chunk(
        id="doc-1",
        title="RAG Definition",
        text="RAG means Retrieval-Augmented Generation. It retrieves external knowledge before generating an answer.",
    ),
    Chunk(
        id="doc-2",
        title="Agent Definition",
        text="An agent can call tools, inspect tool results, and continue working toward a user goal.",
    ),
    Chunk(
        id="doc-3",
        title="Evaluation",
        text="AI application evaluation should check correctness, faithfulness, format, safety, latency, and cost.",
    ),
]


def retrieve(question: str, limit: int = 2) -> list[Chunk]:
    words = set(re.findall(r"[a-z0-9]+", question.lower()))
    scored = []
    for chunk in DOCUMENTS:
        haystack = f"{chunk.title} {chunk.text}".lower()
        score = sum(1 for word in words if word in haystack)
        scored.append((score, chunk))

    ranked = sorted(scored, key=lambda item: item[0], reverse=True)
    return [chunk for score, chunk in ranked if score > 0][:limit]


def build_prompt(question: str, chunks: list[Chunk]) -> str:
    context = "\n\n".join(
        f"[{chunk.id}] {chunk.title}\n{chunk.text}" for chunk in chunks
    )
    return f"""You are a helpful AI learning assistant.

Answer the question only using the context below.
If the context is not enough, say you do not know.

Context:
{context}

Question:
{question}

Answer with source ids:"""


def fake_model_call(prompt: str) -> str:
    return (
        "This demo stops before calling a real model.\n\n"
        "Send the prompt below to your model provider:\n\n"
        f"{prompt}"
    )


if __name__ == "__main__":
    question = "What is RAG?"
    chunks = retrieve(question)
    prompt = build_prompt(question, chunks)
    print(fake_model_call(prompt))
