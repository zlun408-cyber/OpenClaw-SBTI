# Office Environment Layer Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the digital office into a unified, high-end digital command-center environment with layered Phaser ambience and matching React UI chrome.

**Architecture:** Split visual constants out of `OfficeScene` into a typed scene-visual configuration module, then have `OfficeScene` render backdrop, signal paths, room equipment, motion details, and foreground chrome from that config. Add a shared office UI theme module for React chrome, then apply it to the route frame, HUD, room panel host/shell, and OpenClaw chat box without changing room behavior or store semantics.

**Tech Stack:** React, TypeScript, Phaser, Zustand, Vitest, React Testing Library, Playwright

---

## Source Spec

- Spec: `docs/superpowers/specs/2026-04-15-office-environment-layer-upgrade-design.md`
- Existing worktree: `/Users/zhanglun/Desktop/SBTI/.worktrees/sbti-digital-employee`
- Branch: `feat/sbti-digital-employee`

## File Structure

### Create

- `src/game/scenes/officeEnvironmentVisuals.ts` — typed Phaser-side visual configuration for room visuals, background glows, signal paths, room equipment, dynamic particles, and foreground overlays.
- `src/game/scenes/officeEnvironmentVisuals.test.ts` — unit tests proving every room has complete visual/equipment config and that scene-layer configs are parseable.
- `src/features/office/officeTheme.ts` — React-side office design tokens, room accent lookup, and reusable glass/digital terminal style helpers.
- `src/features/office/officeTheme.test.ts` — unit tests proving theme tokens and room accent helpers cover every room and expose stable theme identifiers.
- `src/features/office/RoomPanelShell.tsx` — shared “floating glass terminal” wrapper for active room panels.
- `src/features/office/RoomPanelShell.test.tsx` — component tests for shell semantics, room theme attributes, and pass-through children.

### Modify

- `src/game/scenes/OfficeScene.ts` — render layered command-center ambience from `officeEnvironmentVisuals.ts`; remove local `ROOM_VISUALS` hardcoding.
- `src/features/office/OfficeRoute.tsx` — use shared office theme tokens for the observation-window frame and add stable theme test attributes.
- `src/features/office/OfficeRoute.test.tsx` — assert office route exposes the new theme/chrome markers without breaking the existing canvas + overlay contract.
- `src/features/office/OfficeHUD.tsx` — use shared office theme tokens and room-aware accent attributes while preserving the current information layout.
- `src/features/office/OfficeHUD.test.tsx` — assert HUD exposes the digital terminal theme and active room marker.
- `src/features/office/RoomPanelHost.tsx` — wrap non-office panels with `RoomPanelShell`.
- `src/features/office/RoomPanelHost.test.tsx` — assert active panels render inside the shared terminal shell and inactive states remain empty.
- `src/features/openclaw/FloatingChatBox.tsx` — use shared office theme tokens and command-terminal chat chrome while preserving intent parsing and adapter behavior.
- `src/features/openclaw/FloatingChatBox.test.tsx` — assert chat box exposes the office communication-terminal theme while all existing behavior still passes.
- `e2e/office-navigation.spec.ts` — add one light regression assertion that the office route exposes unified digital-office chrome after entering the office.

### Do Not Modify Unless Required

- `src/state/appStore.ts` — no state changes are expected for this visual upgrade.
- `src/game/systems/*` — movement, room triggers, and pathfinding should remain behaviorally unchanged.
- Room business logic helpers under `src/features/office/panels/*Sync.ts`, `src/features/office/tasks/*`, `src/features/office/training/*`, `src/features/office/rest/*` — the upgrade should not alter business workflows.

---

### Task 1: Add typed Phaser environment visual configuration

**Files:**
- Create: `src/game/scenes/officeEnvironmentVisuals.test.ts`
- Create: `src/game/scenes/officeEnvironmentVisuals.ts`

- [ ] **Step 1: Write failing tests for complete room and layer config**

Create `src/game/scenes/officeEnvironmentVisuals.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import {
  getOfficeRoomVisual,
  OFFICE_ENVIRONMENT_LAYERS,
  OFFICE_ROOM_VISUALS,
  OFFICE_VISUAL_DEPTHS
} from "./officeEnvironmentVisuals";
import type { RoomId } from "../../types/domain";

const roomIds: RoomId[] = ["office", "meeting", "hr", "training", "rest"];

describe("office environment visuals", () => {
  test("defines a complete high-end digital visual for every room", () => {
    roomIds.forEach((roomId) => {
      const visual = getOfficeRoomVisual(roomId);

      expect(visual.label).toBeTruthy();
      expect(visual.subtitle).toBeTruthy();
      expect(visual.fill).toBeGreaterThan(0);
      expect(visual.accent).toBeGreaterThan(0);
      expect(visual.equipment.length).toBeGreaterThanOrEqual(3);
      expect(visual.signalNodes.length).toBeGreaterThanOrEqual(2);
    });

    expect(Object.keys(OFFICE_ROOM_VISUALS).sort()).toEqual([...roomIds].sort());
  });

  test("defines parseable layered environment effects", () => {
    expect(OFFICE_ENVIRONMENT_LAYERS.ambientGlows.length).toBeGreaterThanOrEqual(3);
    expect(OFFICE_ENVIRONMENT_LAYERS.grid.spacing).toBeGreaterThan(0);
    expect(OFFICE_ENVIRONMENT_LAYERS.signalPaths.length).toBeGreaterThanOrEqual(4);
    expect(OFFICE_ENVIRONMENT_LAYERS.particles.length).toBeGreaterThanOrEqual(8);
    expect(OFFICE_ENVIRONMENT_LAYERS.foregroundOverlays.length).toBeGreaterThanOrEqual(3);
  });

  test("keeps environment depths behind the avatar and labels", () => {
    expect(OFFICE_VISUAL_DEPTHS.backdrop).toBeLessThan(OFFICE_VISUAL_DEPTHS.rooms);
    expect(OFFICE_VISUAL_DEPTHS.rooms).toBeLessThan(OFFICE_VISUAL_DEPTHS.avatarShadow);
    expect(OFFICE_VISUAL_DEPTHS.foreground).toBeGreaterThan(OFFICE_VISUAL_DEPTHS.avatarLabels);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/game/scenes/officeEnvironmentVisuals.test.ts
```

Expected: FAIL because `src/game/scenes/officeEnvironmentVisuals.ts` does not exist.

- [ ] **Step 3: Implement the minimal typed visual config**

Create `src/game/scenes/officeEnvironmentVisuals.ts` with exported types and constants:

```ts
import type { RoomId } from "../../types/domain";

export type OfficeRoomEquipment = {
  id: string;
  kind: "console" | "screen" | "pillar" | "terminal" | "pod" | "beacon";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
};

export type OfficeSignalNode = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
};

export type OfficeRoomVisual = {
  label: string;
  subtitle: string;
  fill: number;
  accent: number;
  shadow: number;
  equipment: OfficeRoomEquipment[];
  signalNodes: OfficeSignalNode[];
};

export const OFFICE_VISUAL_DEPTHS = {
  backdrop: 0,
  signalPaths: 2,
  rooms: 4,
  roomEquipment: 6,
  dynamicSignals: 8,
  avatarShadow: 10,
  avatarGlow: 11,
  avatarAura: 12,
  avatarBody: 14,
  avatarLabels: 15,
  foreground: 18
} as const;

export const OFFICE_ROOM_VISUALS: Record<RoomId, OfficeRoomVisual> = {
  office: {
    label: "主办公室",
    subtitle: "Command / Observe / Sync",
    fill: 0x182f3a,
    accent: 0x69d6ff,
    shadow: 0x06131c,
    equipment: [
      { id: "office-control-ring", kind: "console", label: "Control Ring", x: 0, y: 16, width: 54, height: 22, alpha: 0.36 },
      { id: "office-status-wall", kind: "screen", label: "Status Wall", x: -44, y: -24, width: 42, height: 12, alpha: 0.32 },
      { id: "office-sync-beacon", kind: "beacon", label: "Sync Beacon", x: 46, y: -18, width: 18, height: 18, alpha: 0.42 }
    ],
    signalNodes: [
      { x: -54, y: 32, radius: 3, alpha: 0.44 },
      { x: 58, y: -28, radius: 4, alpha: 0.34 }
    ]
  },
  meeting: {
    label: "会议室",
    subtitle: "Brief / Dispatch / Submit",
    fill: 0x243246,
    accent: 0xf0ca87,
    shadow: 0x0b111c,
    equipment: [
      { id: "meeting-board", kind: "screen", label: "Mission Board", x: 0, y: -30, width: 92, height: 16, alpha: 0.34 },
      { id: "meeting-table", kind: "console", label: "Dispatch Table", x: 0, y: 18, width: 76, height: 20, alpha: 0.34 },
      { id: "meeting-submit-light", kind: "beacon", label: "Submit Light", x: 56, y: -2, width: 12, height: 28, alpha: 0.38 }
    ],
    signalNodes: [
      { x: -56, y: -26, radius: 3, alpha: 0.36 },
      { x: 54, y: 30, radius: 4, alpha: 0.42 }
    ]
  },
  hr: {
    label: "人事部",
    subtitle: "Soul / Memory / Identity",
    fill: 0x302846,
    accent: 0xd3b2f3,
    shadow: 0x100c1b,
    equipment: [
      { id: "hr-soul-pillar", kind: "pillar", label: "Soul Pillar", x: -48, y: 4, width: 16, height: 54, alpha: 0.34 },
      { id: "hr-memory-vault", kind: "pillar", label: "Memory Vault", x: 44, y: 2, width: 20, height: 58, alpha: 0.32 },
      { id: "hr-scan-line", kind: "screen", label: "Identity Scan", x: 0, y: -30, width: 84, height: 10, alpha: 0.3 }
    ],
    signalNodes: [
      { x: -48, y: -26, radius: 3, alpha: 0.4 },
      { x: 50, y: 28, radius: 3, alpha: 0.38 }
    ]
  },
  training: {
    label: "培训室",
    subtitle: "Skill / Module / Growth",
    fill: 0x183934,
    accent: 0x9fe3c4,
    shadow: 0x081713,
    equipment: [
      { id: "training-skill-terminal", kind: "terminal", label: "Skill Terminal", x: -44, y: 8, width: 28, height: 38, alpha: 0.34 },
      { id: "training-light-column", kind: "beacon", label: "Training Column", x: 0, y: -4, width: 22, height: 64, alpha: 0.28 },
      { id: "training-module-screen", kind: "screen", label: "Module Screen", x: 48, y: -24, width: 44, height: 14, alpha: 0.32 }
    ],
    signalNodes: [
      { x: -52, y: 30, radius: 3, alpha: 0.34 },
      { x: 50, y: -28, radius: 3, alpha: 0.4 }
    ]
  },
  rest: {
    label: "休息间",
    subtitle: "Recover / Idle / Low Frequency",
    fill: 0x322c35,
    accent: 0x88c8ff,
    shadow: 0x0d0d14,
    equipment: [
      { id: "rest-recovery-pod", kind: "pod", label: "Recovery Pod", x: -34, y: 14, width: 50, height: 24, alpha: 0.28 },
      { id: "rest-low-light", kind: "beacon", label: "Low Light", x: 48, y: -18, width: 16, height: 30, alpha: 0.26 },
      { id: "rest-standby-panel", kind: "screen", label: "Standby Panel", x: 0, y: -30, width: 64, height: 12, alpha: 0.24 }
    ],
    signalNodes: [
      { x: -56, y: -24, radius: 3, alpha: 0.28 },
      { x: 58, y: 28, radius: 3, alpha: 0.3 }
    ]
  }
};

export const OFFICE_ENVIRONMENT_LAYERS = {
  grid: { spacing: 40, lineColor: 0x79d9ff, lineAlpha: 0.055, nodeColor: 0xf0ca87, nodeAlpha: 0.16 },
  ambientGlows: [
    { x: -260, y: -150, radius: 260, color: 0x1d8dff, alpha: 0.07 },
    { x: 210, y: -120, radius: 220, color: 0x69d6ff, alpha: 0.06 },
    { x: 150, y: 185, radius: 240, color: 0xf0ca87, alpha: 0.045 }
  ],
  signalPaths: [
    { from: { x: -180, y: -40 }, to: { x: 0, y: 0 }, pulseOffset: 0 },
    { from: { x: 180, y: -40 }, to: { x: 0, y: 0 }, pulseOffset: 0.25 },
    { from: { x: 0, y: 0 }, to: { x: 0, y: -120 }, pulseOffset: 0.5 },
    { from: { x: 120, y: 80 }, to: { x: 260, y: 180 }, pulseOffset: 0.75 }
  ],
  particles: Array.from({ length: 12 }, (_, index) => ({
    id: `ambient-particle-${index + 1}`,
    x: -280 + index * 52,
    y: index % 2 === 0 ? -190 + index * 18 : 160 - index * 12,
    radius: index % 3 === 0 ? 2 : 1.4,
    alpha: 0.16 + (index % 4) * 0.025
  })),
  foregroundOverlays: [
    { x: -330, y: -210, width: 150, height: 36, alpha: 0.08 },
    { x: 250, y: -205, width: 180, height: 42, alpha: 0.07 },
    { x: -120, y: 225, width: 240, height: 32, alpha: 0.055 }
  ]
} as const;

export const getOfficeRoomVisual = (roomId: RoomId) => OFFICE_ROOM_VISUALS[roomId];
```

- [ ] **Step 4: Run the config test to verify it passes**

Run:

```bash
npm test -- src/game/scenes/officeEnvironmentVisuals.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/game/scenes/officeEnvironmentVisuals.ts src/game/scenes/officeEnvironmentVisuals.test.ts
git commit -m "feat: add office environment visual config"
```

---

### Task 2: Add shared React office theme tokens

**Files:**
- Create: `src/features/office/officeTheme.test.ts`
- Create: `src/features/office/officeTheme.ts`

- [ ] **Step 1: Write failing tests for theme coverage and helpers**

Create `src/features/office/officeTheme.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import {
  getOfficeRoomAccent,
  getOfficeRoomTheme,
  OFFICE_THEME,
  OFFICE_ROOM_ACCENTS
} from "./officeTheme";
import type { RoomId } from "../../types/domain";

const roomIds: RoomId[] = ["office", "meeting", "hr", "training", "rest"];

describe("office theme", () => {
  test("exposes a stable digital command center theme identity", () => {
    expect(OFFICE_THEME.id).toBe("digital-command-center");
    expect(OFFICE_THEME.surface.panel).toContain("linear-gradient");
    expect(OFFICE_THEME.effects.scanline).toContain("linear-gradient");
    expect(OFFICE_THEME.border.glass).toContain("rgba");
  });

  test("defines room accents for every office room", () => {
    expect(Object.keys(OFFICE_ROOM_ACCENTS).sort()).toEqual([...roomIds].sort());

    roomIds.forEach((roomId) => {
      expect(getOfficeRoomAccent(roomId).hex).toMatch(/^#/);
      expect(getOfficeRoomAccent(roomId).rgba).toContain("rgba");
    });
  });

  test("falls back to office theme when there is no active room", () => {
    expect(getOfficeRoomTheme(null).roomId).toBe("office");
    expect(getOfficeRoomTheme("training").roomId).toBe("training");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/office/officeTheme.test.ts
```

Expected: FAIL because `src/features/office/officeTheme.ts` does not exist.

- [ ] **Step 3: Implement minimal theme token module**

Create `src/features/office/officeTheme.ts`:

```ts
import type { CSSProperties } from "react";

import type { RoomId } from "../../types/domain";

export type OfficeRoomAccent = {
  hex: string;
  rgba: string;
  softRgba: string;
};

export const OFFICE_THEME = {
  id: "digital-command-center",
  surface: {
    page: "radial-gradient(circle at 18% 16%, rgba(46, 146, 255, 0.18), transparent 24%), radial-gradient(circle at 78% 20%, rgba(105, 214, 255, 0.12), transparent 24%), linear-gradient(180deg, #07101A 0%, #0A1422 48%, #070B12 100%)",
    frame: "linear-gradient(180deg, rgba(14, 30, 47, 0.82) 0%, rgba(7, 12, 22, 0.76) 100%)",
    panel: "linear-gradient(180deg, rgba(10, 24, 38, 0.94) 0%, rgba(6, 11, 20, 0.92) 100%)",
    panelSoft: "rgba(105, 214, 255, 0.06)",
    input: "rgba(4, 12, 22, 0.9)"
  },
  border: {
    glass: "1px solid rgba(126, 218, 255, 0.18)",
    active: "1px solid rgba(240, 202, 135, 0.34)"
  },
  text: {
    primary: "#F3FAFF",
    secondary: "#9FC7D8",
    accent: "#F0CA87"
  },
  shadow: {
    panel: "0 30px 90px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
    glow: "0 0 36px rgba(105, 214, 255, 0.12)"
  },
  effects: {
    scanline: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 18%, transparent 100%), repeating-linear-gradient(90deg, rgba(105,214,255,0.045) 0 1px, transparent 1px 10px)",
    dataGrid: "linear-gradient(rgba(105,214,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(105,214,255,0.04) 1px, transparent 1px)"
  }
} as const;

export const OFFICE_ROOM_ACCENTS: Record<RoomId, OfficeRoomAccent> = {
  office: { hex: "#69D6FF", rgba: "rgba(105,214,255,0.58)", softRgba: "rgba(105,214,255,0.12)" },
  meeting: { hex: "#F0CA87", rgba: "rgba(240,202,135,0.58)", softRgba: "rgba(240,202,135,0.12)" },
  hr: { hex: "#D3B2F3", rgba: "rgba(211,178,243,0.58)", softRgba: "rgba(211,178,243,0.12)" },
  training: { hex: "#9FE3C4", rgba: "rgba(159,227,196,0.58)", softRgba: "rgba(159,227,196,0.12)" },
  rest: { hex: "#88C8FF", rgba: "rgba(136,200,255,0.52)", softRgba: "rgba(136,200,255,0.1)" }
};

export const getOfficeRoomAccent = (roomId: RoomId | null): OfficeRoomAccent =>
  OFFICE_ROOM_ACCENTS[roomId ?? "office"];

export const getOfficeRoomTheme = (roomId: RoomId | null) => ({
  themeId: OFFICE_THEME.id,
  roomId: roomId ?? "office",
  accent: getOfficeRoomAccent(roomId)
});

export const createGlassTerminalStyle = (
  roomId: RoomId | null,
  overrides: CSSProperties = {}
): CSSProperties => {
  const roomTheme = getOfficeRoomTheme(roomId);

  return {
    border: OFFICE_THEME.border.glass,
    background: OFFICE_THEME.surface.panel,
    color: OFFICE_THEME.text.primary,
    boxShadow: `${OFFICE_THEME.shadow.panel}, 0 0 48px ${roomTheme.accent.softRgba}`,
    backdropFilter: "blur(16px)",
    ...overrides
  };
};
```

- [ ] **Step 4: Run the theme test to verify it passes**

Run:

```bash
npm test -- src/features/office/officeTheme.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/features/office/officeTheme.ts src/features/office/officeTheme.test.ts
git commit -m "feat: add office digital theme tokens"
```

---

### Task 3: Render layered Phaser environment in `OfficeScene`

**Files:**
- Modify: `src/game/scenes/OfficeScene.ts`
- Test: `src/game/scenes/officeEnvironmentVisuals.test.ts`
- Test: `src/game/scenes/OfficeScene.test.ts`

- [ ] **Step 1: Write a failing expectation that dynamic layer config includes renderable pulse metadata**

Extend `src/game/scenes/officeEnvironmentVisuals.test.ts`:

```ts
test("signal paths and particles include animation metadata", () => {
  OFFICE_ENVIRONMENT_LAYERS.signalPaths.forEach((path) => {
    expect(path.pulseOffset).toBeGreaterThanOrEqual(0);
    expect(path.pulseOffset).toBeLessThanOrEqual(1);
  });

  OFFICE_ENVIRONMENT_LAYERS.particles.forEach((particle) => {
    expect(particle.id).toMatch(/^ambient-particle-/);
    expect(particle.alpha).toBeGreaterThan(0);
  });
});
```

If Task 1 already made this pass, add one more expectation for a `pulseSpeed` field on every signal path:

```ts
expect(path.pulseSpeed).toBeGreaterThan(0);
```

- [ ] **Step 2: Run test to verify it fails correctly**

Run:

```bash
npm test -- src/game/scenes/officeEnvironmentVisuals.test.ts
```

Expected: FAIL if `pulseSpeed` is missing. If the test passes immediately because implementation already includes it, tighten the test with the `pulseSpeed` assertion before proceeding.

- [ ] **Step 3: Add the missing animation metadata to config**

Update each `OFFICE_ENVIRONMENT_LAYERS.signalPaths` item in `src/game/scenes/officeEnvironmentVisuals.ts`:

```ts
{ from: { x: -180, y: -40 }, to: { x: 0, y: 0 }, pulseOffset: 0, pulseSpeed: 0.65 }
```

Use slight variation per path, e.g. `0.55`, `0.65`, `0.75`, `0.6`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/game/scenes/officeEnvironmentVisuals.test.ts
```

Expected: PASS.

- [ ] **Step 5: Integrate the config into `OfficeScene`**

Modify `src/game/scenes/OfficeScene.ts`:

1. Replace the local `ROOM_VISUALS` constant with imports:

```ts
import {
  getOfficeRoomVisual,
  OFFICE_ENVIRONMENT_LAYERS,
  OFFICE_VISUAL_DEPTHS
} from "./officeEnvironmentVisuals";
```

2. Add private arrays for dynamic objects:

```ts
private readonly ambientSignalObjects: Phaser.GameObjects.Arc[] = [];
private readonly pathPulseObjects: Phaser.GameObjects.Rectangle[] = [];
```

3. In `create()`, preserve current order but call layered render methods:

```ts
this.renderBackdrop(centerX, centerY);
this.renderConnectionPaths(centerX, centerY);
this.renderRooms(centerX, centerY);
this.renderAmbientSignals(centerX, centerY);
this.renderForegroundOverlays(centerX, centerY);
```

4. Update `update()` to animate low-frequency ambient objects without affecting movement:

```ts
this.syncEnvironmentAnimation(time);
```

5. Update `renderBackdrop()` to use `OFFICE_ENVIRONMENT_LAYERS.grid` and `ambientGlows`.

6. Update `renderConnectionPaths()` to render the base track plus pulse rectangles from `signalPaths`.

7. Update `renderRooms()` to call `getOfficeRoomVisual(roomId)` and draw each room’s `equipment` and `signalNodes` after the room frame.

8. Add methods:

```ts
private renderAmbientSignals(centerX: number, centerY: number) { /* particles from OFFICE_ENVIRONMENT_LAYERS.particles */ }
private renderForegroundOverlays(centerX: number, centerY: number) { /* glass reflection / corner overlay rectangles */ }
private syncEnvironmentAnimation(time: number) { /* set alpha/scale/x-y for pathPulseObjects + ambientSignalObjects */ }
```

Keep all new visuals below or above the avatar by `OFFICE_VISUAL_DEPTHS`; do not change room trigger geometry.

- [ ] **Step 6: Run scene-related tests**

Run:

```bash
npm test -- src/game/scenes/officeEnvironmentVisuals.test.ts src/game/scenes/OfficeScene.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run TypeScript build check**

Run:

```bash
npm run build
```

Expected: PASS (`tsc --noEmit` succeeds and Vite build completes).

- [ ] **Step 8: Commit Task 3**

```bash
git add src/game/scenes/OfficeScene.ts src/game/scenes/officeEnvironmentVisuals.ts src/game/scenes/officeEnvironmentVisuals.test.ts
git commit -m "feat: render layered office environment"
```

---

### Task 4: Upgrade the office route observation-window chrome

**Files:**
- Modify: `src/features/office/OfficeRoute.test.tsx`
- Modify: `src/features/office/OfficeRoute.tsx`
- Test: `src/features/office/officeTheme.test.ts`

- [ ] **Step 1: Write failing route chrome assertions**

Add to `src/features/office/OfficeRoute.test.tsx`:

```ts
test("renders the office route with unified digital command center chrome", () => {
  bridgeState.emittedRoomId = "office";

  render(createElement(OfficeRoute));

  const layout = screen.getByTestId("office-scene-layout");
  expect(layout).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(screen.getByLabelText("office-observation-window")).toBeInTheDocument();
  expect(screen.getByText("SBTI Digital Office")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/office/OfficeRoute.test.tsx
```

Expected: FAIL because `data-office-theme` and/or `office-observation-window` are missing.

- [ ] **Step 3: Implement route chrome with shared theme tokens**

Modify `src/features/office/OfficeRoute.tsx`:

1. Import `OFFICE_THEME`:

```ts
import { OFFICE_THEME } from "./officeTheme";
```

2. Replace hard-coded route colors with `OFFICE_THEME.surface.page`, `OFFICE_THEME.surface.frame`, `OFFICE_THEME.border.glass`, `OFFICE_THEME.shadow.panel`, and `OFFICE_THEME.effects.dataGrid` where appropriate.

3. Add route attributes:

```tsx
<section
  aria-label="office-scene-layout"
  data-testid="office-scene-layout"
  data-office-theme={OFFICE_THEME.id}
  style={layoutStyle}
>
```

4. Add the observation-window label to the canvas frame:

```tsx
<div aria-label="office-observation-window" style={canvasFrameStyle}>
```

5. Add one subtle background grid/scan layer inside the route frame if needed:

```tsx
<div aria-hidden="true" style={routeDataGridStyle} />
```

Keep `GameCanvas`, `OfficeHUD`, `RoomPanelHost`, and `FloatingChatBox` mounting exactly as before.

- [ ] **Step 4: Run the route test**

Run:

```bash
npm test -- src/features/office/OfficeRoute.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/features/office/OfficeRoute.tsx src/features/office/OfficeRoute.test.tsx
git commit -m "feat: upgrade office route chrome"
```

---

### Task 5: Upgrade HUD to a room-aware digital terminal

**Files:**
- Modify: `src/features/office/OfficeHUD.test.tsx`
- Modify: `src/features/office/OfficeHUD.tsx`
- Test: `src/features/office/officeTheme.test.ts`

- [ ] **Step 1: Write failing HUD theme assertions**

Add or update tests in `src/features/office/OfficeHUD.test.tsx`:

```ts
test("renders as a room-aware digital employee terminal", () => {
  useAppStore.setState({ currentRoomId: "training" });

  render(<OfficeHUD />);

  const hud = screen.getByLabelText("office-hud");
  expect(hud).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(hud).toHaveAttribute("data-office-room", "training");
  expect(screen.getByText(/Digital Employee/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/office/OfficeHUD.test.tsx
```

Expected: FAIL because HUD has no theme/room attributes.

- [ ] **Step 3: Implement themed HUD styles and attributes**

Modify `src/features/office/OfficeHUD.tsx`:

1. Import theme helpers:

```ts
import { createGlassTerminalStyle, getOfficeRoomTheme, OFFICE_THEME } from "./officeTheme";
```

2. Read current room id alongside current room context:

```ts
const currentRoomId = useAppStore((state) => state.currentRoomId);
const roomTheme = getOfficeRoomTheme(currentRoomId);
```

3. Replace `hudStyle` usage with a computed style:

```ts
const themedHudStyle = {
  ...createGlassTerminalStyle(currentRoomId, hudStyle),
  border: `1px solid ${roomTheme.accent.rgba}`
} satisfies React.CSSProperties;
```

4. Add attributes:

```tsx
<aside
  aria-label="office-hud"
  data-office-theme={OFFICE_THEME.id}
  data-office-room={roomTheme.roomId}
  style={themedHudStyle}
>
```

5. Add one subtle internal scanline layer with `aria-hidden="true"` if it does not interfere with text readability.

- [ ] **Step 4: Run HUD tests**

Run:

```bash
npm test -- src/features/office/OfficeHUD.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```bash
git add src/features/office/OfficeHUD.tsx src/features/office/OfficeHUD.test.tsx
git commit -m "feat: theme office hud terminal"
```

---

### Task 6: Add shared room panel shell and wrap active panels

**Files:**
- Create: `src/features/office/RoomPanelShell.test.tsx`
- Create: `src/features/office/RoomPanelShell.tsx`
- Modify: `src/features/office/RoomPanelHost.test.tsx`
- Modify: `src/features/office/RoomPanelHost.tsx`

- [ ] **Step 1: Write failing shell component tests**

Create `src/features/office/RoomPanelShell.test.tsx`:

```tsx
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";

import { RoomPanelShell } from "./RoomPanelShell";

test("wraps room panel content in the shared office terminal shell", () => {
  render(
    <RoomPanelShell roomId="meeting">
      <div>Panel body</div>
    </RoomPanelShell>
  );

  const shell = screen.getByLabelText("office-room-terminal");
  expect(shell).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(shell).toHaveAttribute("data-office-room", "meeting");
  expect(screen.getByText("Panel body")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run shell test to verify it fails**

Run:

```bash
npm test -- src/features/office/RoomPanelShell.test.tsx
```

Expected: FAIL because `RoomPanelShell.tsx` does not exist.

- [ ] **Step 3: Implement `RoomPanelShell`**

Create `src/features/office/RoomPanelShell.tsx`:

```tsx
import type { PropsWithChildren } from "react";

import type { RoomId } from "../../types/domain";
import { createGlassTerminalStyle, getOfficeRoomTheme, OFFICE_THEME } from "./officeTheme";

type RoomPanelShellProps = PropsWithChildren<{
  roomId: Exclude<RoomId, "office">;
}>;

const shellStyle = {
  position: "relative",
  padding: "10px",
  borderRadius: "30px",
  overflow: "hidden"
} satisfies React.CSSProperties;

const scanlineStyle = {
  position: "absolute",
  inset: 0,
  opacity: 0.36,
  pointerEvents: "none",
  mixBlendMode: "screen"
} satisfies React.CSSProperties;

export function RoomPanelShell({ roomId, children }: RoomPanelShellProps) {
  const roomTheme = getOfficeRoomTheme(roomId);

  return (
    <div
      aria-label="office-room-terminal"
      data-office-theme={OFFICE_THEME.id}
      data-office-room={roomTheme.roomId}
      style={createGlassTerminalStyle(roomId, shellStyle)}
    >
      <div aria-hidden="true" style={{ ...scanlineStyle, background: OFFICE_THEME.effects.scanline }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run shell test to verify it passes**

Run:

```bash
npm test -- src/features/office/RoomPanelShell.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing host wrapper assertions**

Extend `src/features/office/RoomPanelHost.test.tsx`:

```tsx
test("wraps active room panels in the shared terminal shell", () => {
  useAppStore.setState({ currentRoomId: "meeting" });

  render(<RoomPanelHost />);

  const shell = screen.getByLabelText("office-room-terminal");
  expect(shell).toHaveAttribute("data-office-room", "meeting");
  expect(screen.getByRole("heading", { name: /meeting room/i })).toBeInTheDocument();
});
```

- [ ] **Step 6: Run host test to verify it fails**

Run:

```bash
npm test -- src/features/office/RoomPanelHost.test.tsx
```

Expected: FAIL because `RoomPanelHost` still returns panels directly.

- [ ] **Step 7: Wrap active panels in `RoomPanelHost`**

Modify `src/features/office/RoomPanelHost.tsx`:

```tsx
import { RoomPanelShell } from "./RoomPanelShell";

export function RoomPanelHost() {
  const currentRoom = useAppStore((state) => state.currentRoomId);

  switch (currentRoom) {
    case "meeting":
      return <RoomPanelShell roomId="meeting"><MeetingRoomPanel /></RoomPanelShell>;
    case "hr":
      return <RoomPanelShell roomId="hr"><HRPanel /></RoomPanelShell>;
    case "training":
      return <RoomPanelShell roomId="training"><TrainingPanel /></RoomPanelShell>;
    case "rest":
      return <RoomPanelShell roomId="rest"><RestPanel /></RoomPanelShell>;
    default:
      return null;
  }
}
```

- [ ] **Step 8: Run panel shell and host tests**

Run:

```bash
npm test -- src/features/office/RoomPanelShell.test.tsx src/features/office/RoomPanelHost.test.tsx
```

Expected: PASS, including existing “renders nothing” tests for `office` and `null`.

- [ ] **Step 9: Commit Task 6**

```bash
git add src/features/office/RoomPanelShell.tsx src/features/office/RoomPanelShell.test.tsx src/features/office/RoomPanelHost.tsx src/features/office/RoomPanelHost.test.tsx
git commit -m "feat: wrap room panels in office terminal shell"
```

---

### Task 7: Theme the OpenClaw floating chat as office communication terminal

**Files:**
- Modify: `src/features/openclaw/FloatingChatBox.test.tsx`
- Modify: `src/features/openclaw/FloatingChatBox.tsx`

- [ ] **Step 1: Write failing chat theme assertion**

Add to `src/features/openclaw/FloatingChatBox.test.tsx`:

```tsx
test("renders as an office communication terminal", () => {
  render(<FloatingChatBox />);

  const chat = screen.getByLabelText("openclaw-chat");
  expect(chat).toHaveAttribute("data-office-theme", "digital-command-center");
  expect(chat).toHaveAttribute("data-office-room", "meeting");
  expect(screen.getByText(/OpenClaw/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/openclaw/FloatingChatBox.test.tsx
```

Expected: FAIL because chat has no office theme attributes.

- [ ] **Step 3: Implement chat theme integration without changing behavior**

Modify `src/features/openclaw/FloatingChatBox.tsx`:

1. Import theme helpers:

```ts
import { createGlassTerminalStyle, getOfficeRoomTheme, OFFICE_THEME } from "../office/officeTheme";
```

2. Compute room theme after reading `currentRoomId`:

```ts
const roomTheme = getOfficeRoomTheme(currentRoomId);
```

3. Keep `boxStyle` layout properties, but merge shared terminal style:

```ts
const themedBoxStyle = {
  ...createGlassTerminalStyle(currentRoomId, boxStyle),
  border: `1px solid ${roomTheme.accent.rgba}`,
  pointerEvents: "none"
} satisfies React.CSSProperties;
```

4. Add attributes:

```tsx
<section
  aria-label="openclaw-chat"
  data-office-theme={OFFICE_THEME.id}
  data-office-room={roomTheme.roomId}
  style={themedBoxStyle}
>
```

5. Adjust input/button styles to use `OFFICE_THEME.surface.input`, `OFFICE_THEME.text.accent`, and `roomTheme.accent` while preserving `pointerEvents: "auto"` on interactive controls.

Do not touch parsing logic for meeting tasks, rest intents, or training skills.

- [ ] **Step 4: Run all chat tests**

Run:

```bash
npm test -- src/features/openclaw/FloatingChatBox.test.tsx
```

Expected: PASS, including existing adapter, task creation, training skill, rest intent, and fallback tests.

- [ ] **Step 5: Commit Task 7**

```bash
git add src/features/openclaw/FloatingChatBox.tsx src/features/openclaw/FloatingChatBox.test.tsx
git commit -m "feat: theme openclaw office terminal"
```

---

### Task 8: Lightly align panel interiors to the shared theme

**Files:**
- Modify: `src/features/office/panels/MeetingRoomPanel.tsx`
- Modify: `src/features/office/panels/HRPanel.tsx`
- Modify: `src/features/office/panels/TrainingPanel.tsx`
- Modify: `src/features/office/panels/RestPanel.tsx`
- Test: `src/features/office/panels/MeetingRoomPanel.test.tsx`
- Test: `src/features/office/panels/HRPanel.test.tsx`
- Test: `src/features/office/panels/TrainingPanel.test.tsx`
- Test: `src/features/office/panels/RestPanel.test.tsx`

- [ ] **Step 1: Run current panel tests as a baseline**

Run:

```bash
npm test -- src/features/office/panels/MeetingRoomPanel.test.tsx src/features/office/panels/HRPanel.test.tsx src/features/office/panels/TrainingPanel.test.tsx src/features/office/panels/RestPanel.test.tsx
```

Expected: PASS before styling changes. If this fails, stop and fix the unrelated baseline failure first.

- [ ] **Step 2: Update panel outer styles only**

In each panel file, keep all behavior and internal workstation logic unchanged. Only adjust top-level `panelStyle` values so the panel interior sits well inside `RoomPanelShell`:

- Set `background` to a lower-opacity glass surface, e.g. `linear-gradient(180deg, rgba(8, 18, 30, 0.78) 0%, rgba(5, 10, 18, 0.74) 100%)`.
- Set `border` to `1px solid rgba(126,214,255,0.10)` plus existing room accent where appropriate.
- Keep existing width and grid layout.
- Do not change headings, buttons, forms, or store actions.

If a panel already has strong room-specific color, reduce intensity rather than removing it entirely.

- [ ] **Step 3: Run panel tests after style-only edits**

Run:

```bash
npm test -- src/features/office/panels/MeetingRoomPanel.test.tsx src/features/office/panels/HRPanel.test.tsx src/features/office/panels/TrainingPanel.test.tsx src/features/office/panels/RestPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit Task 8**

```bash
git add src/features/office/panels/MeetingRoomPanel.tsx src/features/office/panels/HRPanel.tsx src/features/office/panels/TrainingPanel.tsx src/features/office/panels/RestPanel.tsx
git commit -m "style: align room panel interiors"
```

---

### Task 9: Add one E2E regression for unified office chrome

**Files:**
- Modify: `e2e/office-navigation.spec.ts`

- [ ] **Step 1: Inspect existing office navigation flow**

Run:

```bash
sed -n '1,260p' e2e/office-navigation.spec.ts
```

Expected: Identify the existing helper/path that gets the app into the office route.

- [ ] **Step 2: Add a failing E2E assertion for digital-office chrome**

In `e2e/office-navigation.spec.ts`, add a test or extend the existing office-entry test:

```ts
await expect(page.getByTestId("office-scene-layout")).toHaveAttribute("data-office-theme", "digital-command-center");
await expect(page.getByLabel("office-observation-window")).toBeVisible();
await expect(page.getByLabel("openclaw-chat")).toHaveAttribute("data-office-theme", "digital-command-center");
```

If no single test reliably enters the office route, prefer extending the existing office navigation test instead of duplicating the whole quiz flow.

- [ ] **Step 3: Run E2E test to verify current implementation passes or identify missing wiring**

Run:

```bash
npm run test:e2e -- e2e/office-navigation.spec.ts
```

Expected: PASS if Tasks 4 and 7 are complete. If it fails, fix only missing labels/attributes; do not change navigation flow.

- [ ] **Step 4: Commit Task 9**

```bash
git add e2e/office-navigation.spec.ts
git commit -m "test: cover unified office chrome"
```

---

### Task 10: Final verification and cleanup

**Files:**
- Potentially modify any file touched above only if verification reveals issues.

- [ ] **Step 1: Run all unit/component tests**

Run:

```bash
npm test
```

Expected: PASS across the Vitest suite.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS (`tsc --noEmit` and Vite build both complete successfully).

- [ ] **Step 3: Run office E2E regression**

Run:

```bash
npm run test:e2e -- e2e/office-navigation.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Inspect git diff for accidental behavior changes**

Run:

```bash
git diff --stat HEAD~10..HEAD
```

Expected: Changes are limited to scene visuals, office UI theme/chrome, tests, and the E2E chrome assertion.

- [ ] **Step 5: Check final working tree status**

Run:

```bash
git status --short --branch
```

Expected: Clean working tree on `feat/sbti-digital-employee`.

- [ ] **Step 6: If cleanup fixes were required, commit them**

Only if files changed during verification:

```bash
git add <changed-files>
git commit -m "chore: finalize office environment upgrade"
```

Expected: Final commit contains only verification-driven cleanup.

---

## Implementation Notes

- Use TDD for behavior/config changes. Do not write production code until the relevant test fails for the expected reason.
- Keep all new visual effects optional and local to presentation. Movement, room triggers, store state, and OpenClaw intent logic should remain unchanged.
- Prefer low-frequency animation and subtle alpha changes. The target is “digital command center,” not “cyberpunk nightclub.”
- Do not add image/audio/font dependencies for this iteration.
- If Phaser rendering helpers make `OfficeScene.ts` too large, extract pure helper functions into `officeEnvironmentVisuals.ts` only if they are configuration-driven and easy to test.
- Each task should be committed separately so visual/UI regressions can be bisected.
