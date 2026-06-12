# EchoMind AI — Strict Migration & Parallel Architecture Instructions

# CRITICAL IMPLEMENTATION RULE

The new RAG architecture MUST be built PARALLELY alongside the existing architecture.

The current working system MUST NOT be removed, rewritten, or heavily modified during initial RAG implementation.

The goal is:

```txt id="m7x2q1"
incremental migration
```

NOT:

```txt id="p4v8n2"
full rewrite
```

---

# VERY IMPORTANT

The existing architecture is already:

* functional
* tested
* feature-complete in many areas
* integrated with frontend UX

The new RAG architecture should initially behave as:

```txt id="u8n3w5"
an additional system layer
```

NOT:

```txt id="f1r6x9"
a destructive replacement
```

---

# STRICT RULES

# 1. DO NOT DELETE EXISTING WORKING FEATURES

Do NOT remove:

* existing transcript flow
* existing PDF flow
* timestamp functionality
* summary generation
* notes generation
* upload flow
* ImageKit integration
* existing frontend behavior

All existing functionality must continue working during migration.

---

# 2. BUILD RAG MODULES SEPARATELY

Create new:

* services
* retrieval logic
* vector search utilities
* embedding pipelines
* chunking flows

inside separate modules/files.

Example:

```txt id="h5m2q4"
Current:
chatWithPdf()

New:
chatWithPdfRAG()
```

Avoid modifying existing stable methods immediately.

---

# 3. DO NOT REFACTOR ENTIRE PROJECT AT ONCE

Avoid:

* massive file rewrites
* large architecture restructuring
* deleting stable logic
* merging all systems together immediately

Migration must happen gradually.

---

# 4. KEEP LEGACY FLOW AS FALLBACK

The old architecture must remain usable as:

```txt id="p9w4t2"
fallback system
```

during RAG testing and stabilization.

---

# 5. USE FEATURE-BASED SEPARATION

Keep:

* old flow
* new RAG flow

isolated initially.

Example:

```txt id="c7m1v8"
src/
 ├── legacy/
 ├── rag/
 ├── ai/
 ├── vector/
 ├── prompts/
```

Avoid tightly coupling old and new systems initially.

---

# 6. DO NOT BREAK EXISTING UX

The following MUST continue working exactly as before:

* clickable timestamps
* video jump navigation
* note generation
* summary generation
* markdown rendering
* frontend APIs
* upload handling
* ImageKit file storage

The RAG implementation must preserve all working user experience features.

---

# 7. RAG SHOULD START AS INTERNAL PIPELINE

Initially:

* build ingestion pipeline
* build vector retrieval
* test grounded responses

WITHOUT replacing the entire chat flow immediately.

---

# 8. MIGRATION SHOULD HAPPEN IN PHASES

## PHASE 1

Build RAG infrastructure separately.

---

## PHASE 2

Test internally:

* retrieval quality
* hallucination reduction
* timestamp preservation
* response quality

---

## PHASE 3

Add controlled switching.

Example:

```txt id="n3x8q5"
strategy: "legacy" | "rag"
```

or:

```txt id="z2p6w1"
USE_RAG=true
```

---

## PHASE 4

Gradually migrate stable features.

ONLY after:

* RAG becomes reliable
* UX remains stable
* retrieval quality is verified

---

# 9. DO NOT OVERWRITE EXISTING PROMPTS IMMEDIATELY

Existing prompts are already functional.

Instead:

* create RAG-specific prompts separately
* compare outputs
* migrate gradually

Example:

```txt id="j6n4r8"
CHAT_SYSTEM_PROMPT
CHAT_SYSTEM_PROMPT_RAG
```

---

# 10. PRESERVE EXISTING DATA STRUCTURES WHEN POSSIBLE

Avoid breaking:

* frontend expectations
* existing APIs
* current timestamp structures
* current transcript format

New RAG schemas can coexist separately initially.

---

# 11. BUILD NEW VECTOR-BASED COLLECTIONS SEPARATELY

Do NOT aggressively mutate current collections initially.

Prefer:

* new chunk collections
* new embedding collections
* separate vector retrieval logic

until migration stabilizes.

---

# 12. DO NOT REMOVE CURRENT WORKING CHAT LOGIC YET

The current chat system should remain operational until:

* RAG retrieval quality is verified
* semantic search works reliably
* grounding is stable

Only then should gradual replacement begin.

---

# 13. MINIMIZE RISK DURING MIGRATION

The implementation priority is:

```txt id="g8x2m5"
stability first
```

NOT:

```txt id="m7q1v3"
rapid full replacement
```

---

# 14. IMPORTANT ENGINEERING PRINCIPLE

The migration strategy should follow:

```txt id="t4w9c6"
Build → Test → Compare → Stabilize → Replace Gradually
```

NOT:

```txt id="u1r8n4"
Delete → Rewrite → Hope it works
```

---

# 15. FINAL IMPLEMENTATION GOAL

Eventually the RAG system may fully replace legacy logic.

BUT:

* only after stability
* only after retrieval validation
* only after UX parity
* only after grounding quality verification

Until then:

```txt id="k8p2w6"
both systems should coexist safely.
```
