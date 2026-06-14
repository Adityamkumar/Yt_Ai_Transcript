# EchoMind AI — Latest Packages & Real-Time Documentation Rules

# Purpose of This Document

This project uses rapidly evolving AI ecosystems:

* Gemini SDK
* LangChain
* MongoDB Atlas Vector Search
* AI tooling
* RAG infrastructure
* TypeScript ecosystem

These packages evolve very quickly.

The purpose of this document is to ensure:

* latest stable APIs are used
* deprecated syntax is avoided
* hallucinated methods are prevented
* official documentation is verified before implementation
* AI-generated code remains modern and production-safe

---

# CRITICAL RULE

DO NOT rely only on model training knowledge for package APIs.

Before implementing:

* packages
* SDKs
* integrations
* framework APIs
* AI tooling

ALWAYS verify:

* latest official documentation
* current stable syntax
* package compatibility
* latest implementation patterns

---

# REQUIRED DOCUMENTATION-FIRST WORKFLOW

Before implementing any feature:

## Step 1

Identify:

* package
* SDK
* framework
* library

being used.

---

## Step 2

Verify:

* latest stable version
* current API syntax
* official implementation examples
* deprecations
* breaking changes

using:

* official documentation
* Context7-compatible documentation retrieval
* real-time documentation search

---

## Step 3

Only AFTER verification:

* generate implementation code
* integrate packages
* create architecture changes

---

# Context7 Usage Rules

Use:

```txt id="p4v8n2"
https://context7.com/
```

as a documentation grounding resource whenever possible.

Context7 should be used to:

* fetch latest package documentation
* retrieve official API examples
* validate modern syntax
* avoid outdated implementations
* reduce hallucinated package methods

---

# IMPORTANT CONTEXT7 PRINCIPLE

Context7 is used to:

```txt id="u8n3w5"
retrieve real-time documentation context
```

NOT:

```txt id="f1r6x9"
blindly generate code without verification
```

Architecture decisions must still follow:

* project architecture rules
* migration constraints
* code quality standards

---

# OFFICIAL DOCUMENTATION PRIORITY

ALWAYS prioritize:

## Priority Order

### 1

Official package documentation

---

### 2

Official GitHub repositories

---

### 3

Official package examples

---

### 4

Verified latest documentation retrieval tools

Example:

* Context7
* MCP documentation tools

---

### 5

Community tutorials ONLY if official docs are insufficient

---

# DO NOT USE OUTDATED IMPLEMENTATIONS

Avoid:

* deprecated APIs
* outdated tutorials
* old syntax
* archived documentation
* obsolete package patterns

If syntax appears outdated:

* verify before implementing

---

# PACKAGE VALIDATION RULES

Before adding any package:

Verify:

* package maintenance status
* compatibility with current stack
* TypeScript support
* ecosystem stability
* active documentation
* compatibility with existing architecture

---

# DO NOT RANDOMLY INSTALL PACKAGES

Avoid:

* unnecessary dependencies
* overlapping libraries
* abandoned packages
* duplicate tooling

Prefer:

* minimal dependency footprint
* stable ecosystems
* officially maintained solutions

---

# IMPORTANT FOR AI TOOLING ECOSYSTEM

This project heavily depends on:

* AI SDKs
* vector databases
* retrieval systems
* embedding models
* modern AI tooling

These ecosystems evolve VERY quickly.

ALWAYS verify:

* latest SDK methods
* latest initialization syntax
* latest authentication methods
* latest vector search APIs
* latest retrieval patterns

before implementation.

---

# IMPORTANT LANGCHAIN RULE

LangChain evolves rapidly.

Before implementing:

* loaders
* splitters
* vector stores
* retrievers
* chains
* embeddings

ALWAYS verify:

* latest package imports
* latest method signatures
* current architecture patterns

DO NOT assume old syntax still works.

---

# IMPORTANT GEMINI SDK RULE

Before implementing Gemini features:

* verify latest SDK initialization
* verify embedding API syntax
* verify model naming
* verify rate limit handling
* verify latest generation APIs

DO NOT assume older SDK examples remain valid.

---

# IMPORTANT MONGODB RULE

Before implementing MongoDB Vector Search:

* verify latest Atlas Vector Search syntax
* verify aggregation pipeline syntax
* verify vector index schema
* verify embedding field configuration

Use latest stable MongoDB Atlas documentation.

---

# DO NOT HALLUCINATE PACKAGE METHODS

If documentation is unclear:

* STOP implementation
* explain uncertainty
* request clarification
* verify official APIs first

NEVER invent:

* package methods
* SDK classes
* framework APIs
* unsupported syntax

---

# IMPORTANT IMPLEMENTATION SAFETY RULE

If:

* latest docs conflict with current architecture
* package introduces breaking changes
* migration risk exists

THEN:

* explain the issue BEFORE coding
* suggest safer alternatives
* preserve existing stable architecture

Do NOT force risky migrations automatically.

---

# VERSION COMPATIBILITY RULE

Always verify compatibility between:

* Node.js version
* TypeScript version
* MongoDB driver
* LangChain packages
* Gemini SDK
* frontend dependencies

Avoid version mismatch issues.

---

# PREFER STABLE IMPLEMENTATIONS

Prefer:

```txt id="h5m2q4"
latest stable compatible version
```

NOT:

```txt id="p9w4t2"
experimental unstable release
```

unless explicitly requested.

---

# IMPORTANT ENGINEERING PRINCIPLE

The implementation priority is:

```txt id="c7m1v8"
correctness + maintainability + compatibility
```

NOT:

```txt id="n3x8q5"
using newest package blindly
```

---

# REAL-TIME VERIFICATION RULE

For:

* AI SDKs
* vector databases
* retrieval libraries
* rapidly evolving frameworks

ALWAYS perform:

```txt id="z2p6w1"
real-time documentation verification
```

before implementation.

---

# DO NOT TRUST OLD AI MEMORY BLINDLY

Model knowledge may contain:

* deprecated APIs
* old syntax
* outdated architecture patterns

Documentation verification is REQUIRED before implementation.

---

# IMPLEMENTATION WORKFLOW

Required workflow for every major feature:

## Step 1

Read project architecture documents.

---

## Step 2

Verify latest package documentation.

---

## Step 3

Check compatibility with current architecture.

---

## Step 4

Explain implementation strategy.

---

## Step 5

Implement incrementally.

---

# FINAL RULE

This project prioritizes:

* scalable architecture
* maintainable code
* modern stable APIs
* grounded implementation
* safe migration
* production-quality engineering

All implementation decisions must follow these rules strictly.
