# RAG Ingestion Reliability + Deduplication + Retry Architecture Fix

# Objective

We need to redesign the PDF RAG ingestion lifecycle to become:

* idempotent
* deduplicated
* retry-safe
* scalable
* user-friendly
* production-grade

Current system works functionally, but several critical reliability and UX issues still exist.

This document explains:

* the problems
* why they happen
* the correct architecture
* retry rules
* deduplication strategy
* frontend UX improvements
* backend ingestion rules
* user notification strategy
* scalable system behavior

---

# Current Problems

We discovered multiple production-grade issues in the ingestion lifecycle.

---

# Problem 1 — Duplicate Document Uploads

Currently:

* user uploads same PDF multiple times
* system creates multiple metadata documents
* embeddings regenerate repeatedly
* duplicate vector chunks get created

This wastes:

* vector DB storage
* embedding API quota
* ingestion compute
* database space

It also creates:

* stale duplicated documents
* inconsistent retrieval
* unnecessary processing

---

# Problem 2 — Infinite Automatic Retry Loops

Current behavior:

* failed document opens again
* ingestion automatically retries again
* every revisit triggers another retry

This creates:

* unnecessary API calls
* repeated embedding failures
* quota exhaustion
* DB pressure
* runaway retry loops

---

# Problem 3 — Unlimited Manual Retries

Currently:

* user can retry endlessly
* repeated retries spam embedding provider
* can destroy quotas quickly

This is dangerous for:

* Gemini APIs
* local models
* cloud billing
* backend stability

---

# Problem 4 — Bad Failure UX

Current UI shows:

* giant red error screens
* "INDEXING FAILED"
* disabled broken-looking UI

This creates:

* panic
* bad UX
* low trust
* system-feels-broken perception

Most failures are actually:

* temporary rate limits
* temporary provider overload
* retryable infrastructure issues

NOT permanent document failures.

---

# Important Architecture Principle

This is CRITICAL:

```txt id="az6s9m"
Uploaded document ≠ AI indexed document
```

There are TWO separate systems:

---

# 1. File Storage Layer

Responsible for:

* ImageKit upload
* metadata persistence
* ownership tracking

---

# 2. AI Retrieval Layer

Responsible for:

* chunking
* embeddings
* vector indexing
* semantic retrieval

The frontend MUST understand this separation.

---

# Required Final Architecture

We now officially move to:

```txt id="jc8q1n"
Idempotent RAG ingestion architecture
```

with:

* document hashing
* deduplication
* retry limits
* controlled recovery
* clean UX states

---

# REQUIRED BACKEND CHANGES

# 1. Add documentHash

Add to PdfDocument schema:

```ts id="ek1u5r"
documentHash: {
  type: String,
  required: true,
  unique: true,
  index: true,
}
```

---

# Important Rule

Hash MUST be generated from:

```txt id="nm7v2x"
actual PDF file bytes/content
```

NOT:

* filename
* title
* URL

Because:

* same filename can be different files
* different filenames can be same file

Use:

* SHA-256 hashing

---

# 2. Deduplication Flow

Before creating new PdfDocument:

Always check:

```txt id="wu4z8c"
Does documentHash already exist?
```

---

# CASE A — Existing READY Document

If existing document:

```ts id="db5f7k"
ragStatus === "ready"
```

Then:

* DO NOT create new document
* DO NOT regenerate embeddings
* DO NOT duplicate vectors

Instead:

* silently reuse existing document
* attach/open same AI workspace internally

User should NEVER see:

* "document already exists"

This should happen completely internally.

---

# CASE B — Existing PROCESSING Document

If:

```ts id="gj2m9p"
ragStatus === "processing"
```

Then:

* reuse existing document
* show indexing UI
* do not create duplicate ingestion
* do not restart pipeline

---

# CASE C — Existing FAILED Document

If:

```ts id="fr8n1y"
ragStatus === "failed"
```

Then:

* reuse SAME document
* re-trigger ingestion internally
* do not create new metadata document
* do not duplicate embeddings

This is critical.

---

# Final Deduplication Rule

```txt id="pv3s6t"
One physical document = One database identity
```

ALWAYS.

---

# REQUIRED RETRY ARCHITECTURE

# Add retryCount

Add to PdfDocument:

```ts id="lk7q4m"
retryCount: {
  type: Number,
  default: 0,
  min: 0,
}
```

---

# Automatic Retry Rules

System should allow:

```txt id="yb9w2r"
MAX 2 automatic retries
```

After that:
STOP automatic retries completely.

---

# Automatic Retry Flow

## First ingestion attempt fails

retryCount = 1

Auto retry allowed.

---

## Second attempt fails

retryCount = 2

Auto retry allowed.

---

## Third failure

STOP automatic retries permanently.

Set:

```ts id="ts6f8v"
ragStatus = "failed"
```

Now ONLY manual retry allowed.

---

# Important Rule

Opening old failed chats should NEVER:

* restart ingestion endlessly
* trigger infinite retries
* spam APIs automatically

Once retry limit reached:
system becomes stable until manual user action.

---

# MANUAL RETRY LIMITS

Manual retries also need limits.

Otherwise:

* users can spam retry endlessly
* APIs get destroyed
* quotas burn rapidly

---

# Required Manual Retry Rule

Allow:

```txt id="qn5z4b"
MAX 2 manual retries
```

After that:
disable retry button temporarily.

---

# Suggested Final Retry Model

## Automatic Retries

2 max.

---

## Manual Retries

2 max.

---

# Total Possible Attempts

```txt id="hx1m7w"
4 total ingestion attempts maximum
```

This is enough for:

* temporary failures
* provider recovery
* transient outages

without destroying infrastructure.

---

# REQUIRED FRONTEND UX CHANGES

# IMPORTANT UX PRINCIPLE

Do NOT treat indexing failures like catastrophic system failures.

Most failures are:

* temporary
* retryable
* infrastructure-related

The document itself is still safe.

---

# REMOVE CURRENT BAD UX

Remove:

* giant red failure screens
* scary failure layouts
* broken-looking workspace

---

# Replace With Premium UX

Show:

* document card normally
* subtle warning state
* lightweight retry option
* soft informational messaging

---

# Correct User Messaging

GOOD:

```txt id="ca4u8k"
AI indexing is temporarily unavailable.
Your document is safely stored and can be retried.
```

BAD:

```txt id="rv6n2s"
INDEXING FAILED
```

---

# Important UX Rule

Users should only see:

* relevant information
* actionable information
* understandable information

Users should NEVER see:

* technical ingestion internals
* database concepts
* duplication warnings
* vector terminology
* retry counters

---

# TOAST NOTIFICATION RULES

# Use Toasts For:

## Temporary failures

Example:

```txt id="ke3x7p"
AI indexing temporarily unavailable. Please retry shortly.
```

---

## Retry started

```txt id="gw2m5n"
Re-indexing document...
```

---

## Successful indexing

```txt id="sd7f1q"
Document ready for AI chat.
```

---

# DO NOT USE TOASTS FOR:

* duplicate document detection
* internal deduplication
* retry exhaustion internals
* technical provider failures

Those should remain internal.

---

# REQUIRED FRONTEND STATES

# Processing State

Show:

* indexing animation
* preparing AI workspace
* disabled AI actions

---

# Ready State

Enable:

* chat
* summaries
* notes
* semantic search

---

# Failed State

Show:

* subtle warning UI
* retry CTA
* safe document message

DO NOT:

* render catastrophic error page
* show broken workspace
* show huge red screens

---

# RETRY BUTTON RULES

Retry button should:

## Be disabled when:

* retry already running
* retry limits exhausted

---

## Show loading state during retry

Example:

```txt id="ux4m8z"
Re-indexing...
```

---

## Hide completely if retries exhausted

Instead show:

```txt id="ep2f5s"
Please try again later.
```

---

# IMPORTANT BACKEND CLEANUP RULE

Before every retry:

ALWAYS delete old:

* PdfChunks
* embeddings
* stale vector artifacts

for that documentId.

This prevents:

* duplicate vectors
* stale retrieval
* corrupted semantic search

---

# IMPORTANT IDEMPOTENCY RULE

Retries MUST always be:

```txt id="zy6m3n"
safe and repeatable
```

Retrying should NEVER:

* duplicate embeddings
* duplicate metadata
* create inconsistent vector state

---

# Important Final System Behavior

After implementation:

## Same document uploaded repeatedly

System:

* silently reuses existing document
* avoids duplication internally

User never notices.

---

## Failed ingestion reopened

System:

* respects retry limits
* avoids infinite loops

---

## Temporary provider failures

System:

* retries safely
* presents clean UX
* preserves user trust

---

## Existing indexed document uploaded again

System:

* instantly reuses indexed document
* avoids regeneration completely

---

# Required Engineering Standards

Implementation MUST:

* maintain clean architecture
* maintain reusable services
* maintain centralized ingestion logic
* maintain TypeScript safety
* avoid duplicated logic
* preserve scalable RAG structure
* preserve vector retrieval architecture
* preserve existing chat functionality

---

# Final Architecture Goal

After this migration:

```txt id="mr8v4x"
Document ingestion becomes:
- idempotent
- deduplicated
- retry-safe
- scalable
- user-friendly
- production-grade
```

System should:

* silently recover when possible
* avoid duplicate work
* avoid noisy failures
* avoid infinite retries
* preserve smooth AI UX
* protect infrastructure stability
