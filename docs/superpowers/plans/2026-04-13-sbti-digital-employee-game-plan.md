# SBTI Digital Employee Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a PC web app where users complete the SBTI ritual flow, generate an authorized SBTI character, then control that character inside a 2.5D digital office that stays connected to local OpenClaw.

**Architecture:** Use React + TypeScript + Vite for the application shell, ritual flow, HUD, room panels, and persistent OpenClaw chat. Embed a Phaser 3 game canvas for the office world, movement, pathfinding, collision, triggers, and character state handling. Keep all OpenClaw communication behind a typed adapter so the game/UI layers stay decoupled from the local chat/gateway implementation.

**Tech Stack:** Vite, React, TypeScript, Phaser 3, React Router, Zustand, Vitest, React Testing Library, Playwright, npm

---

## Planned File Structure

### Root

- `package.json` — scripts, dependencies, app metadata
- `tsconfig.json` — TypeScript config
- `vite.config.ts` — Vite config
- `vitest.config.ts` — Vitest config
- `playwright.config.ts` — Playwright config
- `.gitignore` — ignore node_modules, dist, coverage, Playwright artifacts, raw asset workfiles
- `index.html` — Vite entry HTML

### App shell

- `src/main.tsx` — React bootstrap
- `src/app/App.tsx` — route shell
- `src/app/router.tsx` — route definitions
- `src/app/providers/AppProviders.tsx` — global providers

### State

- `src/state/appStore.ts` — global app state (phase, character, room, task, UI)
- `src/state/selectors.ts` — derived selectors
- `src/types/domain.ts` — shared domain types

### Ritual flow

- `src/features/intro/StoneGateRoute.tsx`
- `src/features/intro/StoneGateScene.tsx`
- `src/features/quiz/SbtiQuizRoute.tsx`
- `src/features/quiz/questions.ts`
- `src/features/quiz/scoring.ts`
- `src/features/avatar/AvatarPreviewRoute.tsx`
- `src/features/avatar/AvatarPreviewCard.tsx`

### Game world

- `src/game/GameCanvas.tsx`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/PreloadScene.ts`
- `src/game/scenes/OfficeScene.ts`
- `src/game/systems/MovementSystem.ts`
- `src/game/systems/PathfindingSystem.ts`
- `src/game/systems/RoomTriggerSystem.ts`
- `src/game/systems/AnimationSystem.ts`
- `src/game/data/mapConfig.ts`
- `src/game/data/roomTriggers.ts`
- `src/game/data/characterRegistry.ts`

### Office UI + OpenClaw

- `src/features/office/OfficeRoute.tsx`
- `src/features/office/OfficeHUD.tsx`
- `src/features/office/RoomPanelHost.tsx`
- `src/features/office/panels/MeetingRoomPanel.tsx`
- `src/features/office/panels/HRPanel.tsx`
- `src/features/office/panels/TrainingPanel.tsx`
- `src/features/office/panels/RestPanel.tsx`
- `src/features/openclaw/FloatingChatBox.tsx`
- `src/features/openclaw/OpenClawAdapter.ts`
- `src/features/openclaw/WebchatAdapter.ts`
- `src/features/openclaw/mockAdapter.ts`

### Assets + asset audit

- `src/assets/characters/manifest.json` — normalized asset registry used at runtime
- `docs/assets/character-audit.md` — audit table for source assets and missing states
- `scripts/build-character-manifest.mjs` — converts raw audit data to runtime manifest
- `public/assets/characters/` — processed runtime-ready character assets
- `public/assets/maps/` — office map textures/parallax pieces
- `public/assets/ui/` — gate art, UI chrome, room frames

### Tests

- `src/features/quiz/scoring.test.ts`
- `src/features/avatar/AvatarPreviewRoute.test.tsx`
- `src/features/openclaw/WebchatAdapter.test.ts`
- `src/state/appStore.test.ts`
- `src/features/office/RoomPanelHost.test.tsx`
- `e2e/ritual-flow.spec.ts`
- `e2e/office-navigation.spec.ts`
- `e2e/openclaw-chat-shell.spec.ts`

## Implementation Notes

- The repository currently only contains documentation. The first implementation task will scaffold the app without disturbing `docs/`.
- Build for desktop browsers only. Do not spend time on responsive/mobile behavior.
- Keep assets/config data-driven; all SBTI result support must come from registry + manifest, not hardcoded conditionals spread across components.
- Use placeholders only where asset extraction is incomplete, but wire the runtime to accept all characters from day one.

---

### Task 1: Bootstrap the React/Phaser workspace

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/providers/AppProviders.tsx`
- Modify: `.gitignore`
- Test: `src/app/App.test.tsx`

- [ ] **Step 1: Scaffold the Vite React TypeScript app in the repo root**

```bash
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: Install core dependencies and test tooling**

```bash
npm install phaser react-router-dom zustand
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom playwright
```

- [ ] **Step 3: Expand `.gitignore` for app outputs and local asset work**

```gitignore
node_modules/
dist/
coverage/
playwright-report/
test-results/
public/assets/raw/
```

- [ ] **Step 4: Write the failing shell smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app shell heading", () => {
  render(<App />);
  expect(screen.getByText(/sbti digital employee/i)).toBeInTheDocument();
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm exec vitest run src/app/App.test.tsx`  
Expected: FAIL because the test file or heading does not exist yet.

- [ ] **Step 6: Implement the minimal app shell and providers**

```tsx
export default function App() {
  return <div>SBTI Digital Employee</div>;
}
```

- [ ] **Step 7: Run the test again**

Run: `npm exec vitest run src/app/App.test.tsx`  
Expected: PASS

- [ ] **Step 8: Verify the app builds**

Run: `npm run build`  
Expected: Vite build succeeds with a `dist/` output.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: bootstrap react phaser workspace"
```

### Task 2: Define domain types and global state

**Files:**
- Create: `src/types/domain.ts`
- Create: `src/state/appStore.ts`
- Create: `src/state/selectors.ts`
- Test: `src/state/appStore.test.ts`

- [ ] **Step 1: Write the failing store test for the core ritual flow**

```ts
import { useAppStore } from "./appStore";

test("can complete quiz and enter avatar preview", () => {
  const store = useAppStore.getState();
  store.completeQuiz({ resultType: "CTRL", title: "控制者" });
  expect(useAppStore.getState().phase).toBe("avatarPreview");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/state/appStore.test.ts`  
Expected: FAIL because the store does not exist.

- [ ] **Step 3: Implement shared domain types**

```ts
export type AppPhase = "intro" | "quiz" | "warp" | "avatarPreview" | "office";
export type RoomId = "office" | "meeting" | "hr" | "training" | "rest";
export type CharacterState = "idle" | "walk" | "work" | "rest" | "sleep" | "dance" | "train" | "task-submit";
```

- [ ] **Step 4: Implement the Zustand store with explicit transitions**

```ts
completeQuiz(result: { resultType: string; title: string }) {
  set({ phase: "avatarPreview", result: { ...result } });
}
```

- [ ] **Step 5: Add selectors for current room context and active character display name**

```ts
export const selectCharacterLabel = (state: AppState) =>
  state.character.customName || state.character.title;
```

- [ ] **Step 6: Run the tests**

Run: `npm exec vitest run src/state/appStore.test.ts`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/types/domain.ts src/state/appStore.ts src/state/selectors.ts src/state/appStore.test.ts
git commit -m "feat: add core app state model"
```

### Task 3: Implement the route shell and ritual navigation

**Files:**
- Create: `src/app/router.tsx`
- Create: `src/features/intro/StoneGateRoute.tsx`
- Create: `src/features/quiz/SbtiQuizRoute.tsx`
- Create: `src/features/avatar/AvatarPreviewRoute.tsx`
- Create: `src/features/office/OfficeRoute.tsx`
- Test: `src/app/router.test.tsx`

- [ ] **Step 1: Write the failing routing test**

```tsx
test("lands on the intro route by default", async () => {
  render(<App />);
  expect(await screen.findByText(/穿越之门/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/app/router.test.tsx`  
Expected: FAIL because routes are not wired.

- [ ] **Step 3: Implement a memory router with explicit ritual routes**

```tsx
createBrowserRouter([
  { path: "/", element: <StoneGateRoute /> },
  { path: "/quiz", element: <SbtiQuizRoute /> },
  { path: "/avatar", element: <AvatarPreviewRoute /> },
  { path: "/office", element: <OfficeRoute /> },
]);
```

- [ ] **Step 4: Add minimal route components with stable headings/buttons**

```tsx
export function StoneGateRoute() {
  return <button>穿越之门</button>;
}
```

- [ ] **Step 5: Run the tests**

Run: `npm exec vitest run src/app/router.test.tsx`  
Expected: PASS

- [ ] **Step 6: Smoke test navigation manually**

Run: `npm run dev`  
Expected: visiting `/`, `/quiz`, `/avatar`, `/office` renders the correct shell.

- [ ] **Step 7: Commit**

```bash
git add src/app/router.tsx src/features/intro/StoneGateRoute.tsx src/features/quiz/SbtiQuizRoute.tsx src/features/avatar/AvatarPreviewRoute.tsx src/features/office/OfficeRoute.tsx src/app/router.test.tsx src/app/App.tsx
git commit -m "feat: add ritual route shell"
```

### Task 4: Build the SBTI quiz data model and scoring logic

**Files:**
- Create: `src/features/quiz/questions.ts`
- Create: `src/features/quiz/scoring.ts`
- Test: `src/features/quiz/scoring.test.ts`

- [ ] **Step 1: Write the failing scoring test**

```ts
import { scoreQuiz } from "./scoring";

test("maps a consistent answer set to a stable SBTI result", () => {
  const result = scoreQuiz([
    { questionId: "q1", value: "A" },
    { questionId: "q2", value: "B" },
  ]);
  expect(result.type).toBe("CTRL");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/features/quiz/scoring.test.ts`  
Expected: FAIL because scoring is missing.

- [ ] **Step 3: Add typed question data and answer options**

```ts
export const questions = [
  { id: "q1", prompt: "...", options: [{ id: "A", axis: "control", weight: 1 }] },
];
```

- [ ] **Step 4: Implement deterministic scoring and result metadata**

```ts
export function scoreQuiz(answers: QuizAnswer[]) {
  return { type: "CTRL", title: "控制者" };
}
```

- [ ] **Step 5: Add at least three test cases**
  - dominant one result
  - tie-breaking behavior
  - incomplete answers rejected

- [ ] **Step 6: Run the tests**

Run: `npm exec vitest run src/features/quiz/scoring.test.ts`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/quiz/questions.ts src/features/quiz/scoring.ts src/features/quiz/scoring.test.ts
git commit -m "feat: add sbti quiz scoring"
```

### Task 5: Implement the quiz UI and avatar preview flow

**Files:**
- Modify: `src/features/quiz/SbtiQuizRoute.tsx`
- Create: `src/features/avatar/AvatarPreviewCard.tsx`
- Modify: `src/features/avatar/AvatarPreviewRoute.tsx`
- Test: `src/features/avatar/AvatarPreviewRoute.test.tsx`

- [ ] **Step 1: Write the failing preview flow test**

```tsx
test("lets the user rename the generated character", async () => {
  render(<AvatarPreviewRoute />);
  await user.type(screen.getByLabelText(/角色姓名/i), "阿张");
  expect(screen.getByDisplayValue("阿张")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/features/avatar/AvatarPreviewRoute.test.tsx`  
Expected: FAIL because the preview form is missing.

- [ ] **Step 3: Build the quiz route UI with one-question-at-a-time rendering**

```tsx
<button onClick={() => submitAnswer(option.id)}>{option.label}</button>
```

- [ ] **Step 4: On final answer, compute the result and move store phase to `avatarPreview`**

```ts
completeQuiz(scoreQuiz(collectedAnswers));
navigate("/avatar");
```

- [ ] **Step 5: Build the avatar preview card**

```tsx
<h1>{character.title}</h1>
<label>
  角色姓名
  <input value={customName} onChange={...} />
</label>
```

- [ ] **Step 6: Add the “进入数字办公室” CTA and persist the chosen name**

```tsx
<button onClick={() => enterOffice()}>进入数字办公室</button>
```

- [ ] **Step 7: Run tests**

Run: `npm exec vitest run src/features/avatar/AvatarPreviewRoute.test.tsx src/features/quiz/scoring.test.ts`  
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/features/quiz/SbtiQuizRoute.tsx src/features/avatar/AvatarPreviewCard.tsx src/features/avatar/AvatarPreviewRoute.tsx src/features/avatar/AvatarPreviewRoute.test.tsx
git commit -m "feat: add quiz to avatar preview flow"
```

### Task 6: Build the stone gate intro and warp transition

**Files:**
- Create: `src/features/intro/StoneGateScene.tsx`
- Modify: `src/features/intro/StoneGateRoute.tsx`
- Create: `src/features/intro/StoneGateRoute.test.tsx`

- [ ] **Step 1: Write the failing intro interaction test**

```tsx
test("opens the gate and reveals the quiz CTA", async () => {
  render(<StoneGateRoute />);
  await user.click(screen.getByRole("button", { name: /穿越之门/i }));
  expect(await screen.findByText(/开始试炼/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/features/intro/StoneGateRoute.test.tsx`  
Expected: FAIL because the sequence is missing.

- [ ] **Step 3: Implement the gate scene component with explicit animation states**

```ts
type GateStage = "closed" | "opening" | "revealed";
```

- [ ] **Step 4: Use CSS classes/timers to model gate open -> reveal -> start quiz**

```tsx
{stage === "revealed" && <button>开始试炼</button>}
```

- [ ] **Step 5: Add a reusable warp overlay hook used when leaving quiz and entering preview**

```ts
const [isWarping, setWarping] = useState(false);
```

- [ ] **Step 6: Run tests**

Run: `npm exec vitest run src/features/intro/StoneGateRoute.test.tsx`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/intro/StoneGateScene.tsx src/features/intro/StoneGateRoute.tsx src/features/intro/StoneGateRoute.test.tsx src/features/quiz/SbtiQuizRoute.tsx
git commit -m "feat: add stone gate intro and warp transition"
```

### Task 7: Add asset audit artifacts and character registry plumbing

**Files:**
- Create: `docs/assets/character-audit.md`
- Create: `scripts/build-character-manifest.mjs`
- Create: `src/assets/characters/manifest.json`
- Create: `src/game/data/characterRegistry.ts`
- Test: `src/game/data/characterRegistry.test.ts`

- [ ] **Step 1: Write the failing registry test**

```ts
import { getCharacterConfig } from "./characterRegistry";

test("returns a config for every supported SBTI result", () => {
  expect(getCharacterConfig("CTRL")).toBeDefined();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/game/data/characterRegistry.test.ts`  
Expected: FAIL because the registry is missing.

- [ ] **Step 3: Create the human-maintained audit document**

```md
| Type | Title | Source URL | Transparent | Idle | Walk | Work | Rest | Train | Quality |
| ---- | ----- | ---------- | ----------- | ---- | ---- | ---- | ---- | ----- | ------- |
```

- [ ] **Step 4: Add a manifest builder script**

```js
import fs from "node:fs";
```

- [ ] **Step 5: Seed the runtime manifest with placeholder entries for all SBTI results**

```json
[
  { "type": "CTRL", "title": "控制者", "states": { "idle": "/assets/characters/ctrl/idle.png" } }
]
```

- [ ] **Step 6: Implement `characterRegistry.ts` on top of the manifest**

```ts
export function getCharacterConfig(type: string) {
  return manifest.find((item) => item.type === type);
}
```

- [ ] **Step 7: Run tests**

Run: `npm exec vitest run src/game/data/characterRegistry.test.ts`  
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add docs/assets/character-audit.md scripts/build-character-manifest.mjs src/assets/characters/manifest.json src/game/data/characterRegistry.ts src/game/data/characterRegistry.test.ts
git commit -m "feat: add character asset audit and registry"
```

### Task 8: Bootstrap Phaser and render the office map shell

**Files:**
- Create: `src/game/GameCanvas.tsx`
- Create: `src/game/scenes/BootScene.ts`
- Create: `src/game/scenes/PreloadScene.ts`
- Create: `src/game/scenes/OfficeScene.ts`
- Create: `src/game/data/mapConfig.ts`
- Test: `src/game/scenes/OfficeScene.test.ts`

- [ ] **Step 1: Write the failing office shell test**

```tsx
test("mounts the phaser game canvas on the office route", () => {
  render(<OfficeRoute />);
  expect(screen.getByTestId("game-canvas")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/game/scenes/OfficeScene.test.ts`  
Expected: FAIL because the game canvas is missing.

- [ ] **Step 3: Implement the Phaser container and scene startup**

```tsx
<div data-testid="game-canvas" ref={containerRef} />
```

- [ ] **Step 4: Seed `mapConfig.ts` with the approved room layout**

```ts
export const mapConfig = {
  rooms: {
    office: { x: 0, y: 0 },
    meeting: { x: 0, y: -120 },
    hr: { x: -180, y: -40 },
    training: { x: 180, y: -40 },
    rest: { x: 260, y: 180 },
  },
};
```

- [ ] **Step 5: Render placeholder room nodes in `OfficeScene`**

```ts
this.add.rectangle(x, y, width, height, 0x2e394a);
```

- [ ] **Step 6: Run tests**

Run: `npm exec vitest run src/game/scenes/OfficeScene.test.ts`  
Expected: PASS

- [ ] **Step 7: Manually verify the office route renders the scene**

Run: `npm run dev`  
Expected: `/office` shows the approved room arrangement.

- [ ] **Step 8: Commit**

```bash
git add src/game/GameCanvas.tsx src/game/scenes/BootScene.ts src/game/scenes/PreloadScene.ts src/game/scenes/OfficeScene.ts src/game/data/mapConfig.ts src/features/office/OfficeRoute.tsx src/game/scenes/OfficeScene.test.ts
git commit -m "feat: add phaser office scene shell"
```

### Task 9: Implement movement, keyboard control, click-to-move, and room triggers

**Files:**
- Create: `src/game/systems/MovementSystem.ts`
- Create: `src/game/systems/PathfindingSystem.ts`
- Create: `src/game/systems/RoomTriggerSystem.ts`
- Create: `src/game/data/roomTriggers.ts`
- Modify: `src/game/scenes/OfficeScene.ts`
- Test: `src/game/systems/MovementSystem.test.ts`

- [ ] **Step 1: Write the failing movement system test**

```ts
test("keyboard input interrupts click-to-move navigation", () => {
  const movement = new MovementSystem();
  movement.startAutoMove({ x: 100, y: 100 });
  movement.applyKeyboardInput({ left: true });
  expect(movement.mode).toBe("manual");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/game/systems/MovementSystem.test.ts`  
Expected: FAIL because the movement system is missing.

- [ ] **Step 3: Implement a movement mode state machine**

```ts
type MovementMode = "manual" | "auto";
```

- [ ] **Step 4: Implement WASD / arrow key movement**

```ts
if (input.left) velocity.x = -speed;
```

- [ ] **Step 5: Implement click target navigation**

```ts
startAutoMove(target: Point) {
  this.mode = "auto";
  this.target = target;
}
```

- [ ] **Step 6: Implement room trigger definitions matching the approved layout**

```ts
export const roomTriggers = [
  { id: "meeting", center: { x: 0, y: -120 }, radius: 56 },
];
```

- [ ] **Step 7: Wire room-enter events from Phaser to React store**

```ts
eventBus.emit({ type: "ROOM_ENTERED", roomId: "meeting" });
```

- [ ] **Step 8: Run tests**

Run: `npm exec vitest run src/game/systems/MovementSystem.test.ts`  
Expected: PASS

- [ ] **Step 9: Manual verification**

Run: `npm run dev`  
Expected: WASD moves the character, clicking a room walks there, entering a room updates the active room UI.

- [ ] **Step 10: Commit**

```bash
git add src/game/systems/MovementSystem.ts src/game/systems/PathfindingSystem.ts src/game/systems/RoomTriggerSystem.ts src/game/data/roomTriggers.ts src/game/scenes/OfficeScene.ts src/game/systems/MovementSystem.test.ts
git commit -m "feat: add office movement and room triggers"
```

### Task 10: Add office HUD and room-specific panels

**Files:**
- Create: `src/features/office/OfficeHUD.tsx`
- Create: `src/features/office/RoomPanelHost.tsx`
- Create: `src/features/office/panels/MeetingRoomPanel.tsx`
- Create: `src/features/office/panels/HRPanel.tsx`
- Create: `src/features/office/panels/TrainingPanel.tsx`
- Create: `src/features/office/panels/RestPanel.tsx`
- Modify: `src/features/office/OfficeRoute.tsx`
- Test: `src/features/office/RoomPanelHost.test.tsx`

- [ ] **Step 1: Write the failing room panel test**

```tsx
test("shows the HR panel when the current room is hr", () => {
  useAppStore.setState({ currentRoom: "hr" });
  render(<RoomPanelHost />);
  expect(screen.getByText(/soul/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/features/office/RoomPanelHost.test.tsx`  
Expected: FAIL because the host is missing.

- [ ] **Step 3: Build the HUD shell**

```tsx
<aside>
  <div>{characterName}</div>
  <div>{currentTaskStatus}</div>
</aside>
```

- [ ] **Step 4: Implement `RoomPanelHost` with room-based rendering**

```tsx
switch (currentRoom) {
  case "meeting":
    return <MeetingRoomPanel />;
}
```

- [ ] **Step 5: Add stable content for each room**
  - Meeting: task intake + submit result
  - HR: soul + memory
  - Training: install + view skill
  - Rest: tea + sleep + dance actions

- [ ] **Step 6: Run tests**

Run: `npm exec vitest run src/features/office/RoomPanelHost.test.tsx`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/office/OfficeHUD.tsx src/features/office/RoomPanelHost.tsx src/features/office/panels/*.tsx src/features/office/OfficeRoute.tsx src/features/office/RoomPanelHost.test.tsx
git commit -m "feat: add office hud and room panels"
```

### Task 11: Implement the OpenClaw adapter and floating chat shell

**Files:**
- Create: `src/features/openclaw/OpenClawAdapter.ts`
- Create: `src/features/openclaw/WebchatAdapter.ts`
- Create: `src/features/openclaw/mockAdapter.ts`
- Create: `src/features/openclaw/FloatingChatBox.tsx`
- Test: `src/features/openclaw/WebchatAdapter.test.ts`
- Test: `src/features/openclaw/FloatingChatBox.test.tsx`

- [ ] **Step 1: Write the failing adapter test**

```ts
import { createWebchatAdapter } from "./WebchatAdapter";

test("includes room context in outgoing requests", async () => {
  const adapter = createWebchatAdapter({ baseUrl: "http://127.0.0.1:18789" });
  const request = adapter.buildRequest("测试", { roomId: "meeting" });
  expect(request.context.roomId).toBe("meeting");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm exec vitest run src/features/openclaw/WebchatAdapter.test.ts`  
Expected: FAIL because the adapter is missing.

- [ ] **Step 3: Define the adapter interface**

```ts
export interface OpenClawAdapter {
  sendMessage(input: string, context?: RoomContext): Promise<ChatReply>;
}
```

- [ ] **Step 4: Implement a webchat-backed adapter plus a mock adapter**

```ts
return {
  async sendMessage(input, context) {
    return { text: `mock:${context?.roomId}:${input}` };
  },
};
```

- [ ] **Step 5: Build the right-bottom floating chat shell**

```tsx
<section aria-label="OpenClaw chat">...</section>
```

- [ ] **Step 6: Update placeholder text based on the active room**

```ts
const prompt = currentRoom === "meeting" ? "给数字员工分配任务" : "和 OpenClaw 对话";
```

- [ ] **Step 7: Run tests**

Run: `npm exec vitest run src/features/openclaw/WebchatAdapter.test.ts src/features/openclaw/FloatingChatBox.test.tsx`  
Expected: PASS

- [ ] **Step 8: Manual verification**

Run: `npm run dev`  
Expected: the chat box stays visible on `/office` and room changes adjust the prompt text.

- [ ] **Step 9: Commit**

```bash
git add src/features/openclaw/OpenClawAdapter.ts src/features/openclaw/WebchatAdapter.ts src/features/openclaw/mockAdapter.ts src/features/openclaw/FloatingChatBox.tsx src/features/openclaw/*.test.ts
git commit -m "feat: add openclaw floating chat shell"
```

### Task 12: Add end-to-end coverage and final project scripts

**Files:**
- Modify: `package.json`
- Create: `e2e/ritual-flow.spec.ts`
- Create: `e2e/office-navigation.spec.ts`
- Create: `e2e/openclaw-chat-shell.spec.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Write the first failing Playwright spec for the ritual flow**

```ts
test("user can move from gate to avatar preview", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "穿越之门" }).click();
  await expect(page.getByText("进入数字办公室")).toBeVisible();
});
```

- [ ] **Step 2: Run the spec to verify it fails**

Run: `npm exec -- playwright test e2e/ritual-flow.spec.ts`  
Expected: FAIL until the dev server and flow are fully wired.

- [ ] **Step 3: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 4: Add the remaining e2e specs**
  - office navigation with WASD/click-to-move
  - room panel changes
  - floating chat prompt changes by room

- [ ] **Step 5: Run all unit tests**

Run: `npm test`  
Expected: PASS

- [ ] **Step 6: Run e2e tests**

Run: `npm run test:e2e`  
Expected: PASS

- [ ] **Step 7: Build for release**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add package.json playwright.config.ts e2e/
git commit -m "test: add e2e coverage for ritual office flow"
```

## Execution Notes

- Implement in task order unless a reviewer explicitly approves reordering.
- Keep each commit small and passing.
- Do not start polishing assets or custom effects until the route flow, office map, and OpenClaw shell all work end-to-end.
- When real OpenClaw integration blocks local development, use `mockAdapter.ts` to keep UI and game work moving.

## Local Review Result

I could not run the required plan-review subagent because the current tool policy only permits subagents when the user explicitly asks for delegation. Before execution, do a focused review against:

- `docs/superpowers/specs/2026-04-10-sbti-digital-employee-game-design.md`
- this plan file

Check specifically for missing asset-audit work, room-layout drift, and any hardcoded SBTI result assumptions.
