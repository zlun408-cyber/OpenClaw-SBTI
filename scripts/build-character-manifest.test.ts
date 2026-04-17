import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, expect, test } from "vitest";

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

  fs.writeFileSync(
    auditPath,
    `# Character Asset Audit

| Type | Title | Source URL | Transparent | Idle | Walk | Work | Rest | Sleep | Dance | Train | Task Submit | Quality |
| ---- | ----- | ---------- | ----------- | ---- | ---- | ---- | ---- | ----- | ----- | ----- | ----------- | ------- |
| CTRL | 控制者 | TODO | /assets/characters/ctrl/transparent.png | /assets/characters/ctrl/idle.png | /assets/characters/ctrl/walk.png | /assets/characters/ctrl/work.png | /assets/characters/ctrl/rest.png | TODO | TODO | /assets/characters/ctrl/train.png | TODO | placeholder |
| EXEC | 执行者 | TODO | /assets/characters/exec/transparent.png | /assets/characters/exec/idle.png | /assets/characters/exec/walk.png | /assets/characters/exec/work.png | /assets/characters/exec/rest.png | TODO | TODO | /assets/characters/exec/train.png | TODO | placeholder |
| HARM | 协调者 | TODO | /assets/characters/harm/transparent.png | /assets/characters/harm/idle.png | /assets/characters/harm/walk.png | /assets/characters/harm/work.png | /assets/characters/harm/rest.png | TODO | TODO | /assets/characters/harm/train.png | TODO | placeholder |
`,
    "utf8"
  );

  const result = buildCharacterManifest({
    auditPath,
    manifestPath,
    publicRoot
  });

  expect(result.manifest).toHaveLength(3);
  expect(fs.existsSync(manifestPath)).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/characters/ctrl/idle.png"))).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/maps"))).toBe(true);
  expect(fs.existsSync(path.join(publicRoot, "assets/ui"))).toBe(true);
});
