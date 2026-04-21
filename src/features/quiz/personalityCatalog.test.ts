import { describe, expect, test } from "vitest";

import {
  PERSONALITY_TYPES,
  getPersonalityDefinition,
  personalityCatalog
} from "./personalityCatalog";

describe("personality catalog", () => {
  test("defines all 27 SBTI personas", () => {
    expect(PERSONALITY_TYPES).toHaveLength(27);
    expect(personalityCatalog).toHaveLength(27);
    expect(new Set(PERSONALITY_TYPES).size).toBe(27);
  });

  test("exposes stable lookup metadata for representative personas", () => {
    expect(getPersonalityDefinition("CTRL")).toMatchObject({
      code: "CTRL",
      title: "拿捏者",
      slogan: "怎么样，被我拿捏了吧？"
    });

    expect(getPersonalityDefinition("DRUNK")).toMatchObject({
      code: "DRUNK",
      title: "酒鬼",
      slogan: "烈酒烧喉，不得不醉。"
    });

    expect(getPersonalityDefinition("ZZZZ")).toMatchObject({
      code: "ZZZZ",
      title: "装死者",
      slogan: "我没死，我只是在睡觉。"
    });
  });
});
