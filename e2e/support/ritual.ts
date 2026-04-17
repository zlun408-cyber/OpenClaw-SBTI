import { expect, type Page } from "@playwright/test";

import { questions } from "../../src/features/quiz/questions";

const CONTROL_QUIZ_OPTION_LABELS = questions.map((question) => {
  const option = question.options.find((item) => item.axis === "control");
  if (!option) {
    throw new Error(`Missing control option for ${question.id}`);
  }

  return option.label;
});

export async function openGateAndStartTrial(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "穿越之门" }).click();
  await expect(page.getByText(/石门状态：开启中/i)).toBeVisible();
  await expect(page.getByText(/石门状态：已开启/i)).toBeVisible();
  await page.getByRole("button", { name: "开始试炼" }).click();
  await page.waitForURL("**/quiz");
}

export async function answerQuizForControlPersona(page: Page) {
  for (const label of CONTROL_QUIZ_OPTION_LABELS) {
    await page.getByRole("button", { name: label }).click();
  }
}

export async function completeRitualFlow(page: Page, customName = "Alex") {
  await openGateAndStartTrial(page);
  await answerQuizForControlPersona(page);

  await page.waitForURL("**/avatar");
  await expect(page.getByLabel("角色姓名")).toBeVisible();
  await page.getByLabel("角色姓名").fill(customName);
}

export async function enterOffice(page: Page, customName = "Alex") {
  await completeRitualFlow(page, customName);
  await page.getByRole("button", { name: "进入数字办公室" }).click();
  await page.waitForURL("**/office");
  await expect(page.getByTestId("office-scene-layout")).toBeVisible();
  await expect(page.getByTestId("game-canvas")).toHaveAttribute("data-game-ready", "true", {
    timeout: 30_000
  });
  await expect(page.locator('[data-testid="game-canvas"] canvas').first()).toBeVisible({
    timeout: 30_000
  });
}

export async function clickOfficeCanvas(page: Page, position: { x: number; y: number }) {
  const canvas = page.locator('[data-testid="game-canvas"][data-game-ready="true"] canvas').first();
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  await canvas.click({ position });
}
