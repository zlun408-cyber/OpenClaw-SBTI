# HR Dual-Channel Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an HR room workflow that edits `soul.md` and `memory.md`, prefers OpenClaw-driven updates, and falls back to local file writes when direct sync is unavailable.

**Architecture:** Keep the data model minimal: two markdown documents only. Add a small sync strategy helper that first sends structured update requests through the OpenClaw adapter, then falls back to browser-side file handles selected by the user. Upgrade the HR panel into a dual-editor workspace with per-document sync status.

**Tech Stack:** React, TypeScript, Zustand, Vitest, React Testing Library, Playwright

---

### Task 1: Add HR sync helpers and shared default adapter
- Create: `src/features/openclaw/defaultAdapter.ts`
- Create: `src/features/office/panels/hrDocumentSync.ts`
- Create: `src/features/office/panels/hrDocumentSync.test.ts`

### Task 2: Upgrade HRPanel into dual editors with OpenClaw-first sync
- Modify: `src/features/office/panels/HRPanel.tsx`
- Create: `src/features/office/panels/HRPanel.test.tsx`

### Task 3: Add room-level chat/E2E coverage
- Modify: `e2e/office-navigation.spec.ts`
- Modify: `e2e/openclaw-chat-shell.spec.ts`
