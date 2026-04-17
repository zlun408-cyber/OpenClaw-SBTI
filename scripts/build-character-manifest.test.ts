import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, expect, test } from "vitest";

import { personalityCatalog } from "../src/features/quiz/personalityCatalog";
import { buildCharacterManifest } from "./build-character-manifest.mjs";

const tempDirectories: string[] = [];

afterEach(() => {
  while (tempDirectories.length > 0) {
    const directory = tempDirectories.pop();
    if (directory) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});

test("writes manifest output and placeholder assets from the audit table", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "sbti-manifest-"));
  tempDirectories.push(workspace);

  const auditPath = path.join(workspace, "character-audit.md");
  const manifestPath = path.join(workspace, "manifest.json");
  const publicRoot = path.join(workspace, "public");

  const rows = personalityCatalog
    .map(
      (persona) =>
        `| ${persona.code} | ${persona.title} | TODO | /assets/characters/${persona.assetKey}/transparent.png | /assets/characters/${persona.assetKey}/idle.png | /assets/characters/${persona.assetKey}/walk.png | /assets/characters/${persona.assetKey}/work.png | /assets/characters/${persona.assetKey}/rest.png | /assets/characters/${persona.assetKey}/sleep.png | /assets/characters/${persona.assetKey}/dance.png | /assets/characters/${persona.assetKey}/train.png | /assets/characters/${persona.assetKey}/task-submit.png | placeholder |`
    )
    .join("\n");

  fs.writeFileSync(
    auditPath,
    `# Character Asset Audit

| Type | Title | Source URL | Transparent | Idle | Walk | Work | Rest | Sleep | Dance | Train | Task Submit | Quality |
| ---- | ----- | ---------- | ----------- | ---- | ---- | ---- | ---- | ----- | ----- | ----- | ----------- | ------- |
${rows}
`,
    "utf8"
  );

  const result = buildCharacterManifest({
    auditPath,
    manifestPath,
    publicRoot
  });

  expect(result.manifest).toHaveLength(27);
  expect(fs.existsSync(manifestPath)).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/characters/ctrl/idle.png"))).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/characters/woc/dance.png"))).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/characters/drunk/train.png"))).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/maps"))).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/ui"))).toBe(true);
});
