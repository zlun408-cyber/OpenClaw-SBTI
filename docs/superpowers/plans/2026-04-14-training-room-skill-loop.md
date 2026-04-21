# Training Room Skill Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a training-room workflow with preset + chat-created skills, OpenClaw-first installation, and local fallback installation records.

**Architecture:** Extend the global store with a lightweight skill registry and deterministic preset skills. Add an installation strategy helper that prefers OpenClaw replies for skill install actions and records local installs when direct execution is unavailable. Upgrade the training room panel into a dual-lane skill workspace and let the floating chat box parse training-room install intents.

**Tech Stack:** React, TypeScript, Zustand, Vitest, React Testing Library, Playwright

---

### Task 1: Add skill domain + install strategy
- Modify: `src/types/domain.ts`
- Modify: `src/state/appStore.ts`
- Modify: `src/state/appStore.test.ts`
- Create: `src/features/office/training/trainingSkills.ts`
- Create: `src/features/office/panels/trainingSkillInstall.ts`
- Create: `src/features/office/panels/trainingSkillInstall.test.ts`

### Task 2: Upgrade training room panel
- Modify: `src/features/office/panels/TrainingPanel.tsx`
- Create: `src/features/office/panels/TrainingPanel.test.tsx`

### Task 3: Add chat install intent + E2E coverage
- Create: `src/features/openclaw/trainingSkillIntent.ts`
- Create: `src/features/openclaw/trainingSkillIntent.test.ts`
- Modify: `src/features/openclaw/FloatingChatBox.tsx`
- Modify: `src/features/openclaw/FloatingChatBox.test.tsx`
- Modify: `e2e/openclaw-chat-shell.spec.ts`
- Modify: `e2e/office-navigation.spec.ts`
