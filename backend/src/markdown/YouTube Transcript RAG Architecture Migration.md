# YouTube Transcript RAG Architecture Migration

## Goal

Migrate the current YouTube transcript system from:

* embedded transcript chunks inside `Video` schema

to:

* proper RAG architecture with separated vector chunk storage.

---

# Current Problem

Current architecture stores:

* video metadata
* transcript chunks

inside the same `Video` document.

This creates:

* duplicated large documents
* poor scalability
* harder retrieval optimization
* inefficient vector search architecture
* tight coupling between metadata and embeddings

---

# Target Architecture

## 1. Video Collection (`videos`)

Store ONLY video metadata.

Example:

```ts
{
  _id,
  youtubeUrl,
  youtubeVideoId,
  title,
  uploadedBy,
  totalChunks,
  status,
  createdAt,
  updatedAt
}
```

Responsibilities:

* metadata storage
* ownership
* processing state
* document lifecycle

---

## 2. TranscriptChunk Collection (`transcriptchunks`)

Store ONLY:

* searchable transcript chunks
* embeddings
* timestamp navigation data

Example:

```ts
{
  _id,
  videoDocumentId,
  text,
  embedding,
  chunkIndex,
  start,
  end,
  duration,
  createdAt
}
```

Responsibilities:

* vector retrieval
* semantic search
* timestamp navigation
* retrieval grounding

---

# IMPORTANT DESIGN RULES

## REMOVE duplicated metadata from TranscriptChunk

REMOVE:

* `youtubeUrl`
* `title`

Reason:
These already exist in `Video` collection.

Duplicating them:

* wastes storage
* increases vector payload size
* slows retrieval
* complicates updates

---

# KEEP timestamp fields

KEEP:

* `start`
* `end`
* `duration`

Reason:
These are REQUIRED for:

* clickable timestamps
* jump-to-video navigation
* transcript grounding
* future clip generation
* timestamp citations

These belong to retrieval context.

---

# IMPORTANT RELATIONSHIP CHANGE

Current:

```ts
videoId: string
```

Target:

```ts
videoDocumentId: ObjectId
```

Reason:

* normalized database relationship
* easier joins
* cleaner cascading deletion
* consistent with PDF architecture

---

# Final Desired Architecture

## Video Schema

```ts
{
  _id,
  youtubeUrl,
  youtubeVideoId,
  title,
  uploadedBy,
  totalChunks,
  status
}
```

---

## TranscriptChunk Schema

```ts
{
  _id,
  videoDocumentId,
  text,
  embedding,
  chunkIndex,
  start,
  end,
  duration
}
```

---

# Future RAG Flow

```txt
Extract Transcript
↓
Create Transcript Chunks
↓
Generate Embeddings
↓
Store in transcriptchunks
↓
Store metadata in videos
↓
MongoDB Vector Search
↓
Retrieve relevant chunks
↓
Ground LLM response
↓
Timestamp-aware AI answers
```

---

# IMPORTANT IMPLEMENTATION RULES

* Preserve migration-safe architecture
* Do NOT break existing timestamp UX
* Do NOT remove legacy flow immediately
* Build parallel RAG architecture first
* Keep reusable embedding services
* Reuse shared vector search utilities
* Keep schemas modular and scalable
* Avoid duplicated logic between PDF and Video RAG systems

---

# Current Priority

ONLY focus on:

* schema cleanup
* transcript chunk separation
* vector-ready architecture
* migration-safe ingestion

Do NOT implement:

* multi-video ingestion
* queues
* advanced orchestration
* reranking
* clip generation

Keep implementation simple and stable.
