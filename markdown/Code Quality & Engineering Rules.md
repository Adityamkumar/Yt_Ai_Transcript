# EchoMind AI — Code Quality & Engineering Rules

# Core Engineering Philosophy

The codebase must prioritize:

* scalability
* readability
* maintainability
* reusable architecture
* clean separation of concerns

Avoid quick hacks or tightly coupled implementations.

---

# 1. Clean Architecture Separation

Separate logic properly into:

* routes
* controllers
* services
* repositories/database layer
* AI utilities
* vector search utilities
* prompt templates
* chunking utilities

Avoid placing business logic inside controllers.

---

# 2. Reusable AI Utilities

Create reusable methods for:

```ts
generateEmbedding()
generateChatResponse()
generateStructuredNotes()
vectorSearch()
buildPrompt()
```

Avoid duplicating SDK logic across files.

---

# 3. Reusable Chunking Layer

Chunking logic should be reusable for:

* PDFs
* transcripts
* future document types

Avoid duplicate chunk-processing code.

---

# 4. Shared Vector Search Utility

Create reusable vector retrieval utilities.

Example:

```ts
searchRelevantPdfChunks()
searchRelevantTranscriptChunks()
```

Internally reuse:

* similarity logic
* topK retrieval
* threshold filtering

---

# 5. Configurable RAG Parameters

Keep centralized configuration for:

* chunk size
* overlap
* topK retrieval
* similarity threshold
* embedding dimensions
* retry delays

Avoid hardcoding values throughout the codebase.

---

# 6. Strong Error Handling

Handle gracefully:

* Gemini API failures
* rate limits
* invalid PDFs
* empty transcripts
* vector search failures
* MongoDB errors
* embedding generation failures

Never crash the entire flow unexpectedly.

---

# 7. Async-Friendly Architecture

Use:

* proper async/await
* Promise handling
* reusable async utilities

Avoid blocking operations.

---

# 8. Scalable File Structure

Maintain scalable folder structure.

Example:

```txt
src/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── prompts/
 ├── ai/
 ├── rag/
 ├── vector/
 ├── utils/
 ├── schemas/
 └── routes/
```

---

# 9. Preserve Existing UX Features

The RAG refactor MUST preserve:

* clickable timestamps
* transcript navigation
* notes generation
* summaries
* markdown rendering
* structured JSON responses

Do NOT break working UX features.

---

# 10. Grounded AI Responses

All AI responses must:

* use retrieved context only
* avoid hallucinations
* refuse unsupported claims
* stay grounded in retrieved chunks

---

# 11. Clean Prompt Management

Store prompts separately inside:

```txt
prompts/
```

Avoid inline prompts inside controllers or services.

---

# 12. Keep Business Logic Out of Routes

Routes should:

* validate request
* call controller

Controllers should:

* orchestrate flow

Heavy logic belongs in:

* services
* utilities

---

# 13. Avoid Duplicate Code

If logic is reused in multiple places:

* extract utility/service
* create shared helper

Never duplicate embedding or retrieval logic unnecessarily.

---

# 14. Maintain Readable Code

Code should:

* use meaningful naming
* avoid giant functions
* stay modular
* stay easy to debug

Prefer small reusable methods.

---

# 15. Future-Friendly Architecture

Current implementation should make future expansion easy for:

* multi-document retrieval
* hybrid search
* memory systems
* advanced RAG pipelines

without major refactoring.

But do NOT implement future features yet.
Focus only on building a strong RAG foundation first.
