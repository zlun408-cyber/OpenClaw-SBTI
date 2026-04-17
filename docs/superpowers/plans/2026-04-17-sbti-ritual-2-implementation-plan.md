# SBTI Ritual 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the pre-office ritual flow into a complete SBTI experience with a pixel-art gate, full official-style 27-type personality system, richer result narrative, generated avatar preview, and office integration that reuses shared base animations for all 27 personas.

**Architecture:** Keep the existing React + Zustand + Phaser structure, but replace the current 3-type placeholder quiz pipeline with a data-driven ritual system. Centralize the 27-type catalog, question bank, scoring rules, result narrative, and avatar asset manifest so intro, quiz, avatar preview, and office runtime all consume the same source of truth. Reuse a shared animation-state contract in the office while letting each personality provide its own portrait/idle-facing pixel identity.

**Tech Stack:** React, TypeScript, React Router, Zustand, Phaser 3, Vitest, React Testing Library, Playwright, local PNG assets/scripts

---

## Planned File Structure

### Ritual system

- `src/types/domain.ts` — expand `QuizResultType`, `QuizResult`, and character profile metadata for 27 personas
- `src/features/quiz/personalityCatalog.ts` — canonical 27-type registry, labels, slogans, result copy, and office/avatar asset keys
- `src/features/quiz/personalityCatalog.test.ts` — catalog coverage and invariants
- `src/features/quiz/questions.ts` — full 30-question main bank plus hidden trigger question metadata
- `src/features/quiz/questions.test.ts` — question bank completeness and answer-shape coverage
- `src/features/quiz/scoring.ts` — 27-type scoring, hidden trigger override, dimension summary calculation
- `src/features/quiz/scoring.test.ts` — result selection, hidden branch trigger, and dimension-profile tests
- `src/features/quiz/SbtiQuizRoute.tsx` — full quiz UI, progress, hidden trigger routing, and result handoff
- `src/features/quiz/SbtiQuizRoute.test.tsx` — richer flow assertions for 30-question progression and result submission

### Intro + result preview

- `src/features/intro/StoneGateScene.tsx` — pixel gate presentation and opening animation
- `src/features/intro/StoneGateRoute.tsx` — intro orchestration remains route-shell only
- `src/features/intro/StoneGateRoute.test.tsx` — gate CTA / animation-state test coverage
- `src/features/avatar/AvatarPreviewRoute.tsx` — result-focused preview route with narrative and generated persona card
- `src/features/avatar/AvatarPreviewCard.tsx` — persona card, slogan, dimension summary, name entry, and hero sprite preview
- `src/features/avatar/AvatarPreviewRoute.test.tsx` — result display, redirect guard, and office entry persistence

### Assets + registry

- `src/assets/characters/manifest.json` — expanded manifest for all 27 personas
- `src/game/data/characterRegistry.ts` — 27-type registry validation and office runtime lookup
- `src/game/data/characterRegistry.test.ts` — manifest/registry completeness
- `public/assets/characters/<type>/...` — pixel portraits and shared office-state sprites for all 27 personas
- `public/assets/ui/gate/` — gate layers, glyphs, and opening-state pixel assets
- `scripts/build-character-manifest.mjs` — manifest generator/validator for 27-type asset layout
- `scripts/build-character-manifest.test.ts` — generator validation

### Office integration

- `src/state/appStore.ts` — persist richer result payload and selected persona metadata
- `src/state/selectors.ts` — selectors for result narrative and current persona presentation
- `src/features/office/OfficeHUD.tsx` — show 27-type label/persona context without changing office task logic
- `src/game/scenes/officeAvatarPresentation.ts` — map all 27 personas to shared animation-state assets
- `src/game/scenes/officeAvatarPresentation.test.ts` — verify 27-type asset mapping and fallbacks

### E2E

- `e2e/ritual-flow.spec.ts` — full gate → quiz → avatar → office ritual regression
- `e2e/support/ritual.ts` — helpers updated for longer quiz and result preview assertions

---

### Task 1: Expand the 27-type personality domain model

**Files:**
- Modify: `src/types/domain.ts`
- Create: `src/features/quiz/personalityCatalog.ts`
- Create: `src/features/quiz/personalityCatalog.test.ts`
- Modify: `src/state/appStore.ts`
- Test: `src/features/quiz/personalityCatalog.test.ts`
- Test: `src/state/appStore.test.ts`

- [ ] **Step 1: Write the failing catalog tests for 27 complete persona definitions**

```ts
import { describe, expect, test } from "vitest";
import { PERSONALITY_TYPES, personalityCatalog, getPersonalityDefinition } from "./personalityCatalog";

describe("personality catalog", () => {
  test("defines all 27 official-style SBTI personas", () => {
    expect(PERSONALITY_TYPES).toHaveLength(27);
    expect(personalityCatalog).toHaveLength(27);
    expect(getPersonalityDefinition("CTRL").title).toBe("拿捏者");
    expect(getPersonalityDefinition("DRUNK").title).toBe("酒鬼");
    expect(getPersonalityDefinition("ZZZZ").title).toBe("装死者");
  });
});
```

- [ ] **Step 2: Run the catalog test to verify it fails**

Run: `npm test -- src/features/quiz/personalityCatalog.test.ts`
Expected: FAIL because the catalog file and 27-type model do not exist.

- [ ] **Step 3: Expand the domain model to support 27 personas and richer result payloads**

Update `src/types/domain.ts` so `QuizResultType` becomes a 27-type union, and `QuizResult` includes fields such as `code`, `title`, `subtitle`, `description`, `slogan`, and dimension-summary metadata instead of only the current 3-type placeholder fields.

- [ ] **Step 4: Implement the catalog with a single source of truth**

Create `src/features/quiz/personalityCatalog.ts` with:
- `PERSONALITY_TYPES`
- `personalityCatalog`
- `getPersonalityDefinition(type)`
- labels/slogans/subtitles for all 27 personas
- asset keys used by avatar preview and office runtime

- [ ] **Step 5: Update the store test for richer quiz results**

Extend `src/state/appStore.test.ts` so completing the quiz preserves the richer result payload instead of only `{ resultType, title }`.

- [ ] **Step 6: Run the focused tests**

Run: `npm test -- src/features/quiz/personalityCatalog.test.ts src/state/appStore.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/types/domain.ts src/features/quiz/personalityCatalog.ts src/features/quiz/personalityCatalog.test.ts src/state/appStore.ts src/state/appStore.test.ts
git commit -m "feat: add 27-type sbti personality catalog"
```

### Task 2: Replace the placeholder quiz with a full question bank and 27-type scoring

**Files:**
- Modify: `src/features/quiz/questions.ts`
- Create: `src/features/quiz/questions.test.ts`
- Modify: `src/features/quiz/scoring.ts`
- Modify: `src/features/quiz/scoring.test.ts`
- Test: `src/features/quiz/questions.test.ts`
- Test: `src/features/quiz/scoring.test.ts`

- [ ] **Step 1: Write failing tests for a 30-question bank and hidden trigger support**
- [ ] **Step 2: Run the question/scoring tests to verify they fail**
- [ ] **Step 3: Replace the 3-question bank with the full 30-question structure plus hidden trigger metadata**
- [ ] **Step 4: Rebuild `scoreQuiz` to return one of 27 personas and a dimension summary**
- [ ] **Step 5: Add hidden trigger override behavior tests**
- [ ] **Step 6: Run focused tests**

Run: `npm test -- src/features/quiz/questions.test.ts src/features/quiz/scoring.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/quiz/questions.ts src/features/quiz/questions.test.ts src/features/quiz/scoring.ts src/features/quiz/scoring.test.ts
git commit -m "feat: add full sbti question bank and scoring"
```

### Task 3: Turn the stone gate into a real pixel-art ritual entrance

**Files:**
- Modify: `src/features/intro/StoneGateScene.tsx`
- Modify: `src/features/intro/StoneGateRoute.test.tsx`
- Create: `public/assets/ui/gate/gate-closed.png`
- Create: `public/assets/ui/gate/gate-opening.png`
- Create: `public/assets/ui/gate/gate-open.png`
- Test: `src/features/intro/StoneGateRoute.test.tsx`

- [ ] **Step 1: Write a failing intro test for gate art / staged opening state**
- [ ] **Step 2: Run the intro test to verify it fails**
- [ ] **Step 3: Implement pixel gate layers and a short opening-state transition before quiz navigation**
- [ ] **Step 4: Run the intro test**

Run: `npm test -- src/features/intro/StoneGateRoute.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/intro/StoneGateScene.tsx src/features/intro/StoneGateRoute.test.tsx public/assets/ui/gate
git commit -m "feat: add pixel stone gate ritual entrance"
```

### Task 4: Redesign the quiz route for the full ritual flow

**Files:**
- Modify: `src/features/quiz/SbtiQuizRoute.tsx`
- Modify: `src/features/quiz/SbtiQuizRoute.test.tsx`
- Modify: `src/app/router.test.tsx`
- Test: `src/features/quiz/SbtiQuizRoute.test.tsx`

- [ ] **Step 1: Write failing route tests for 30-question progression, progress UI, and result handoff**
- [ ] **Step 2: Run the quiz route tests to verify they fail**
- [ ] **Step 3: Implement the richer quiz UI without changing router structure**
- [ ] **Step 4: Keep the warp transition but let it carry the full result into preview**
- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/features/quiz/SbtiQuizRoute.test.tsx src/app/router.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/quiz/SbtiQuizRoute.tsx src/features/quiz/SbtiQuizRoute.test.tsx src/app/router.test.tsx
git commit -m "feat: redesign full sbti ritual quiz flow"
```

### Task 5: Build the real result page and avatar preview card

**Files:**
- Modify: `src/features/avatar/AvatarPreviewRoute.tsx`
- Modify: `src/features/avatar/AvatarPreviewCard.tsx`
- Modify: `src/features/avatar/AvatarPreviewRoute.test.tsx`
- Test: `src/features/avatar/AvatarPreviewRoute.test.tsx`

- [ ] **Step 1: Write failing tests for persona slogan, result narrative, dimension summary, and preview sprite rendering**
- [ ] **Step 2: Run the avatar preview tests to verify they fail**
- [ ] **Step 3: Implement the richer result page using the new personality catalog**
- [ ] **Step 4: Preserve existing office-entry guards and name persistence**
- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/features/avatar/AvatarPreviewRoute.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/avatar/AvatarPreviewRoute.tsx src/features/avatar/AvatarPreviewCard.tsx src/features/avatar/AvatarPreviewRoute.test.tsx
git commit -m "feat: add full sbti result preview card"
```

### Task 6: Expand avatar assets and registry to all 27 personas

**Files:**
- Modify: `src/assets/characters/manifest.json`
- Modify: `src/game/data/characterRegistry.ts`
- Modify: `src/game/data/characterRegistry.test.ts`
- Modify: `scripts/build-character-manifest.mjs`
- Modify: `scripts/build-character-manifest.test.ts`
- Create: `public/assets/characters/<type>/...` for all 27 personas

- [ ] **Step 1: Write failing registry tests for 27 persona assets**
- [ ] **Step 2: Run the registry/manifest tests to verify they fail**
- [ ] **Step 3: Expand the manifest generator and JSON output to 27 personas**
- [ ] **Step 4: Add pixel portraits plus shared base office-state sprites for all persona folders**
- [ ] **Step 5: Re-run focused tests**

Run: `npm test -- src/game/data/characterRegistry.test.ts scripts/build-character-manifest.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/assets/characters/manifest.json src/game/data/characterRegistry.ts src/game/data/characterRegistry.test.ts scripts/build-character-manifest.mjs scripts/build-character-manifest.test.ts public/assets/characters
git commit -m "feat: add 27 persona pixel avatar assets"
```

### Task 7: Integrate the 27 personas into office runtime and HUD

**Files:**
- Modify: `src/game/scenes/officeAvatarPresentation.ts`
- Modify: `src/game/scenes/officeAvatarPresentation.test.ts`
- Modify: `src/features/office/OfficeHUD.tsx`
- Modify: `src/features/office/OfficeHUD.test.tsx`
- Modify: `src/state/selectors.ts`
- Test: `src/game/scenes/officeAvatarPresentation.test.ts`
- Test: `src/features/office/OfficeHUD.test.tsx`

- [ ] **Step 1: Write failing tests for 27 persona runtime mapping and HUD identity display**
- [ ] **Step 2: Run focused tests to verify they fail**
- [ ] **Step 3: Reuse the shared base office actions for all 27 personas**
- [ ] **Step 4: Surface persona code/title in HUD without changing task loops**
- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/game/scenes/officeAvatarPresentation.test.ts src/features/office/OfficeHUD.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/scenes/officeAvatarPresentation.ts src/game/scenes/officeAvatarPresentation.test.ts src/features/office/OfficeHUD.tsx src/features/office/OfficeHUD.test.tsx src/state/selectors.ts
git commit -m "feat: integrate 27 personas into office runtime"
```

### Task 8: Move the office shell toward an in-room view with minimap support

**Files:**
- Modify: `src/features/office/OfficeRoute.tsx`
- Modify: `src/features/office/OfficeRoute.test.tsx`
- Modify: `src/game/scenes/OfficeScene.ts`
- Modify: `src/game/scenes/officeEnvironmentVisuals.ts`
- Create: `src/features/office/OfficeMiniMap.tsx`
- Create: `src/features/office/OfficeMiniMap.test.tsx`
- Test: `src/features/office/OfficeRoute.test.tsx`
- Test: `src/features/office/OfficeMiniMap.test.tsx`

- [ ] **Step 1: Write failing tests for a persistent minimap and current-room-first presentation**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Replace floating-room emphasis with current-room presentation and top-left minimap**
- [ ] **Step 4: Keep movement/room trigger logic unchanged**
- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/features/office/OfficeRoute.test.tsx src/features/office/OfficeMiniMap.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/office/OfficeRoute.tsx src/features/office/OfficeRoute.test.tsx src/features/office/OfficeMiniMap.tsx src/features/office/OfficeMiniMap.test.tsx src/game/scenes/OfficeScene.ts src/game/scenes/officeEnvironmentVisuals.ts
git commit -m "feat: add in-room office view and minimap"
```

### Task 9: Add end-to-end ritual regression for the rebuilt flow

**Files:**
- Modify: `e2e/ritual-flow.spec.ts`
- Modify: `e2e/support/ritual.ts`
- Test: `e2e/ritual-flow.spec.ts`

- [ ] **Step 1: Extend the existing ritual helper for the longer quiz and result preview assertions**
- [ ] **Step 2: Add a failing E2E that verifies gate art, result narrative, avatar preview, and office entry**
- [ ] **Step 3: Run E2E to verify current behavior fails or is incomplete**
- [ ] **Step 4: Adjust only missing selectors/assertions after implementation**
- [ ] **Step 5: Re-run the ritual E2E**

Run: `npm run test:e2e -- e2e/ritual-flow.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add e2e/ritual-flow.spec.ts e2e/support/ritual.ts
git commit -m "test: cover rebuilt sbti ritual flow"
```

### Task 10: Final verification and cleanup

**Files:**
- Potentially modify any file touched above only if verification reveals issues.

- [ ] **Step 1: Run the full unit/component test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Run the office and ritual E2E regressions**

Run: `npm run test:e2e -- e2e/ritual-flow.spec.ts e2e/office-navigation.spec.ts`
Expected: PASS.

- [ ] **Step 4: Review git diff statistics**

Run: `git diff --stat HEAD~10..HEAD`
Expected: Changes are limited to ritual flow, avatar/result content, asset manifests, office integration, and E2E/test updates.

- [ ] **Step 5: Commit verification-driven cleanup only if required**

```bash
git add <changed-files>
git commit -m "chore: finalize sbti ritual 2.0"
```
