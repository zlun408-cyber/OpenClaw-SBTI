# Meeting Room Chat Task Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a meeting-room task loop where OpenClaw chat is the primary task creation entry and the room panel visualizes claim / progress / submission state.

**Architecture:** Extend the global Zustand store with a lightweight meeting-task domain and deterministic seed tasks. Add a small intent parser in the OpenClaw feature so meeting-room chat can create tasks locally before real backend automation exists. Upgrade the meeting room panel into a status board with room-specific actions and result submission.

**Tech Stack:** React, TypeScript, Zustand, Vitest, React Testing Library, Playwright

---

### Task 1: Add meeting task domain + store transitions

**Files:**
- Modify: `src/types/domain.ts`
- Modify: `src/state/appStore.ts`
- Modify: `src/state/appStore.test.ts`
- Create: `src/features/office/tasks/meetingTasks.ts`

### Task 2: Add meeting-task intent parser

**Files:**
- Create: `src/features/openclaw/meetingTaskIntent.ts`
- Create: `src/features/openclaw/meetingTaskIntent.test.ts`

### Task 3: Upgrade meeting room panel

**Files:**
- Modify: `src/features/office/panels/MeetingRoomPanel.tsx`
- Create: `src/features/office/panels/MeetingRoomPanel.test.tsx`

### Task 4: Connect FloatingChatBox to meeting task loop

**Files:**
- Modify: `src/features/openclaw/FloatingChatBox.tsx`
- Modify: `src/features/openclaw/FloatingChatBox.test.tsx`
- Modify: `e2e/openclaw-chat-shell.spec.ts`
- Modify: `e2e/office-navigation.spec.ts`
