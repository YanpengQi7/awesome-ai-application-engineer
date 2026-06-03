# Build a Personal Knowledge Base Assistant

English | [中文](zh-CN.md)

This tutorial walks you through building a personal knowledge base assistant from zero to one. The goal is not to stack frameworks. The goal is to understand the full RAG application flow from a user question to a grounded answer.

By the end, you should be able to explain:

- how documents enter the system
- why chunking is necessary
- what embeddings and retrieval do
- how prompts constrain the model to answer from evidence
- how source citations work
- how evaluation helps you improve the system over time

## Final Result

After a user uploads or stores Markdown files, PDFs, or web notes, they can ask:

```text
In my 30-day AI learning plan, what should I do in week 2?
```

The system returns:

```text
Week 2 should focus on RAG basics, including reading the RAG docs, preparing test documents, implementing chunking, retrieval, a minimal RAG flow, source citations, and 20 evaluation questions.

Sources:
- 30-day-plan.md / Week 2
```

## Recommended Stack

For beginners, start with a small stack:

| Module | Recommendation |
| --- | --- |
| Language | Python |
| API service | FastAPI |
| Local storage | SQLite |
| Vector search | Start with in-memory or SQLite, then move to pgvector/Qdrant |
| Document format | Support Markdown first, then PDF |
| Evaluation | CSV/JSON + a simple scoring script |

Do not introduce too many frameworks on day one. First make the data flow work, then replace components as needed.

## Overall Architecture

```text
User question
  -> Backend API
  -> Query rewrite
  -> Retrieve relevant chunks
  -> Build prompt
  -> Call model
  -> Parse answer and citations
  -> Log result and feedback
```

Offline indexing flow:

```text
Document ingest
  -> Document parsing
  -> Text cleanup
  -> Chunking
  -> Generate embeddings
  -> Store chunks + metadata + vectors
```

## Step 1: Make a Minimal Chat Call

Do not start with a knowledge base. First verify that your model API call works.

You should be able to:

- store the API key in an environment variable
- send a user question
- print the model answer
- record latency and errors

Checkpoints:

- the API key is not hardcoded
- failures show useful error messages
- outputs can be logged

## Step 2: Read a Local Document

Start with Markdown files. Read a file, then put its content and the user question into the prompt.

Example prompt:

```text
You are a personal knowledge base assistant. Answer only from the material below.

Material:
{document_text}

User question:
{question}

If the material does not contain the answer, say "I could not find the answer in the provided material."
```

This step will quickly run into context length limits, so you should not keep sending the entire document to the model.

## Step 3: Implement Chunking

A chunk is a smaller section of a document. Beginners can start with a simple strategy:

- split Markdown by headings when possible
- keep each chunk around 500 to 1,000 Chinese characters, or roughly 300 to 700 English words
- keep a small overlap between neighboring chunks
- store `title`, `source`, `section`, and `chunk_id` for every chunk

Example data structure:

```json
{
  "chunk_id": "30-day-plan#week-2#001",
  "title": "30-Day Plan",
  "source": "checklists/30-day-plan.md",
  "section": "Week 2: RAG Basics",
  "text": "Day 8: Read the RAG docs..."
}
```

Good chunking is not about the number of chunks. It is about whether retrieval can find complete evidence for real user questions.

## Step 4: Start with Keyword Retrieval

Before adding vector search, build a keyword retrieval version. It is not fancy, but it helps you understand the retrieval flow.

Minimum requirements:

- take a user question as input
- match keywords against chunk text and titles
- return top-k chunks
- put those chunks into the prompt

This step lets you run the main RAG flow before adding embeddings.

## Step 5: Add Embeddings and Vector Retrieval

Embeddings convert text into vectors so you can perform semantic similarity search.

During indexing:

```text
chunk text -> embedding model -> vector -> store
```

During querying:

```text
question -> embedding model -> query vector -> similarity search -> top-k chunks
```

Important notes:

- regenerate embeddings when a chunk changes
- store the embedding model name and version
- keep chunk metadata for filtering and citations
- log similarity scores for debugging

## Step 6: Build the RAG Prompt

Treat retrieved chunks as available evidence. Do not let the model freely invent answers.

Recommended template:

```text
You are a personal knowledge base assistant.

Rules:
- Answer only from the available material
- Do not invent information that is not in the material
- Cite sources for every important claim
- If the material is insufficient, explain what is missing

Available material:
{retrieved_chunks}

User question:
{question}

Output format:
Answer:
{answer}

Sources:
- {source title} / {section}
```

## Step 7: Add Source Citations

Citations are not decoration. They are the trust layer of a RAG system. Each answer should trace back to:

- document name
- section or page
- chunk_id
- source snippet

Recommended API response:

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

## Step 8: Handle Unanswerable Questions

When the material is insufficient, the system should refuse to answer or clearly state what is missing.

Common refusal conditions:

- top-k retrieval scores are too low
- retrieved chunks are not related to the question
- the model determines there is no direct answer in the material
- the user asks something outside the knowledge base scope

Example refusal:

```text
I could not find a clear answer in the provided material. The retrieved content is mostly about the RAG learning plan and does not include deployment cost information.
```

## Step 9: Build a Minimal Evaluation Set

Prepare 30 questions:

- 15 questions with clear answers in the material
- 5 questions that require combining multiple chunks
- 5 questions that should be refused
- 5 historical bad cases

Each record can look like this:

```json
{
  "id": "kb_001",
  "question": "What should I learn in week 2?",
  "expected_behavior": "Answer the RAG basics tasks and cite 30-day-plan",
  "required_sources": ["checklists/30-day-plan.md"],
  "tags": ["rag", "easy"]
}
```

## Step 10: Check Before Launch

Before launch, confirm that:

- the API key is not in frontend code or Git history
- users can only access their own documents
- retrieval and answers are logged
- answers include citations
- the system refuses when material is insufficient
- token usage, cost, and latency are tracked
- there is a feedback path for bad cases

For a more complete checklist, see [RAG Production Checklist](../../checklists/rag-production-checklist.md).

## Common Iteration Directions

| Problem | Optimization |
| --- | --- |
| Retrieval misses the answer | Improve chunking, metadata, and query rewrite |
| Retrieval finds evidence but the answer is wrong | Improve the prompt, citation checks, and refusal behavior |
| Citations are inaccurate | Store more precise metadata and restrict source usage |
| Cost is too high | Reduce top-k, compress context, cache embeddings |
| Latency is too high | Use async indexing, caching, and faster models |

## What You Should Deliver

- a runnable RAG Q&A demo
- a set of test documents
- 30 evaluation questions
- a project README
- a bad case log
- an architecture diagram

That is much more convincing than simply saying "I know RAG."
