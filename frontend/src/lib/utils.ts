// Re-export cn from the project's canonical location.
// This file exists so that shadcn/ui components using `@/lib/utils` work
// without modifying every import.  The single source of truth remains
// src/utils/cn.ts.
export { cn } from "@/utils/cn";
