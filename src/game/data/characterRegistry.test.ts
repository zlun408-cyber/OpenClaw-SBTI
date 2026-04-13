import { describe, expect, test } from "vitest";

import { getCharacterConfig } from "./characterRegistry";

describe("getCharacterConfig", () => {
  test("returns a config for every supported SBTI result", () => {
    expect(getCharacterConfig("CTRL")).toBeDefined();
    expect(getCharacterConfig("EXEC")).toBeDefined();
    expect(getCharacterConfig("HARM")).toBeDefined();
  });
});
