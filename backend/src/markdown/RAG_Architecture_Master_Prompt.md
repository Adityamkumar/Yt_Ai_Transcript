# EchoMind AI — RAG Architecture Master Prompt

# Project Goal

Convert the existing Chat with PDF and YouTube Transcript features into a proper Retrieval-Augmented Generation (RAG) system.

The architecture should:

* support semantic retrieval
* reduce hallucinations
* scale cleanly
* preserve existing UX features
* generate grounded AI responses

The system must use:

* vector embeddings
* semantic similarity search
* MongoDB Atlas Vector Search
* Gemini embedding models
* retrieved-context-based answering

---

# Existing Architecture Constraints

## File Storage

The project already stores:

* PDFs
* documents
* uploaded files

inside:

```txt
ImageKit Cloud Storage
```

This architecture MUST remain unchanged.

### ImageKit Responsibility

* store actual files
* CDN delivery
* file hosting

### MongoDB Responsibility

* metadata
* semantic chunks
* embeddings
* vector retrieval

---

# Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* MongoDB Atlas Vector Search

## AI Models

### Embedding Model

```txt
gemini-embedding-2
```

### Chat Model

Use Gemini chat model for:

* chat
* notes
* summaries
* grounded responses

---

# Required Packages

## MongoDB

```ts
import { MongoClient } from "mongodb";
```

## Gemini SDK

```ts
import { GoogleGenAI } from "@google/genai";
```

## PDF Loader

```ts
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
```

## Text Splitter

```ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
```

---

# Embedding Configuration

## Vector Dimensions

Use:

```txt
1536
```

Reason:

* faster generation
* smaller storage
* faster retrieval
* sufficient semantic quality

---

# Similarity Metric

Use:

```txt
cosine similarity
```

---

# Chunking Strategy

## Chunk Size

```txt
500
```

## Chunk Overlap

```txt
100
```

Reason:

* preserve semantic continuity
* avoid context loss
* improve retrieval quality

---

# PDF Document Metadata Schema

Store ONLY metadata inside PdfDocument collection.

```ts
{
  title,
  fileName,
  fileUrl,
  fileId,
  pageCount,
  totalChunks,
  uploadedBy,
  status,
  createdAt,
  updatedAt
}
```

---

# PdfChunk Schema

Store searchable semantic chunks separately.

```ts
{
  documentId,
  text,
  embedding,
  chunkIndex,
  page,
  wordCount,
  createdAt
}
```

---

# Transcript Chunk Schema

Store transcript chunks separately.

```ts
{
  videoId,
  youtubeUrl,
  title,
  text,
  embedding,
  start,
  end,
  duration,
  chunkIndex,
  createdAt
}
```

---

# Important Timestamp Requirement

Timestamp navigation MUST continue working exactly like the existing system.

The frontend should still support:

* clickable timestamps
* jump-to-video behavior
* timeline navigation

The RAG system MUST preserve:

* start time
* end time
* duration

inside transcript chunks.

---

# MongoDB Vector Index

Create vector index on:

```txt
embedding
```

Configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

---

# PDF RAG Ingestion Pipeline

## Step 1

User uploads PDF.

---

## Step 2

Store metadata in PdfDocument.

---

## Step 3

Fetch PDF from ImageKit URL.

---

## Step 4

Extract PDF text.

---

## Step 5

Create semantic chunks.

Chunk configuration:

* chunkSize: 500
* chunkOverlap: 100

---

## Step 6

Generate embeddings using:

```txt
gemini-embedding-2
```

---

## Step 7

Store:

* chunk text
* embeddings
* metadata

inside PdfChunk collection.

---

# Transcript RAG Ingestion Pipeline

## Step 1

Fetch YouTube transcript.

---

## Step 2

Create transcript chunks.

---

## Step 3

Preserve:

* timestamps
* duration
* transcript ordering

---

## Step 4

Generate embeddings.

---

## Step 5

Store chunks in MongoDB Atlas.

---

# Retrieval Pipeline

## Step 1

User asks question.

---

## Step 2

Generate query embedding using:

```txt
RETRIEVAL_QUERY
```

---

## Step 3

Perform vector similarity search in MongoDB.

---

## Step 4

Retrieve:

* top 5 relevant chunks
* chunk metadata
* timestamps/pages

---

## Step 5

Send ONLY retrieved plain text chunks to chat model.

IMPORTANT:
Embeddings are NEVER sent to the LLM.

Embeddings are ONLY used for semantic retrieval.

---

# Grounding Rules

The AI MUST:

* answer ONLY from retrieved context
* avoid hallucinations
* refuse unsupported questions
* refuse unrelated questions

If context is insufficient:

```txt
Politely say the information is not available in the provided content.
```

---

# Similarity Threshold Protection

If retrieval similarity score is too low:

* refuse answer
* avoid hallucination
* do not guess

---

# Source Attribution

The system should support:

* page references
* timestamp references

when relevant.

Examples:

* "According to page 4..."
* "Explained around 02:30..."

Never invent timestamps or pages.

---

# Retrieval-Aware Timestamp Support

Transcript retrieval MUST preserve:

* timestamp metadata
* semantic chunk references

Frontend should continue rendering:

* clickable timestamps
* timestamp pills
* video jump links

---

# RAG Principles

## Embeddings Purpose

Embeddings exist ONLY for:

```txt
semantic similarity search
```

LLMs receive:

```txt
plain text chunks
```

NOT vectors.

---

# Why Vector Search Exists

Vector search allows:

* semantic understanding
* synonym matching
* contextual retrieval

Example:

```txt
"stored in memory"
≈
"caching"
```

even without exact keyword matching.

---

# Scope of Current Stage

Focus ONLY on:

* PDF RAG
* Transcript RAG
* semantic retrieval
* grounded answers
* timestamp-aware retrieval
* MongoDB Atlas Vector Search

Do NOT add:

* agents
* memory systems
* hybrid retrieval
* reranking
* multi-agent workflows
* autonomous pipelines

Keep architecture clean and stable first.
