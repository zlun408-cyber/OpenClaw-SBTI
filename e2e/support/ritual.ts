import { expect, type Page } from "@playwright/test";

const QUIZ_OPTION_LABELS = [
  "先定规则和边界，确保方向可控",
  "倾听各方诉求，先求共识",
  "优先交付，先把关键结果做出来"
] as const;

export async function completeRitualFlow(page: Page, customName = "Alex") {
  await page.goto("/");
  await page.getByRole("button", { name: "穿越之门" }).click();
  await page.getByRole("button", { name: "开始试炼" }).waitFor();
  await page.getByRole("button", { name: "开始试炼" }).click();

  for (const label of QUIZ_OPTION_LABELS) {
    await page.getByRole("button", { name: label }).click();
  }

  await page.waitForURL("**/avatar");
  await expect(page.getByLabel("角色姓名")).toBeVisible();
  await page.getByLabel("角色姓名").fill(customName);
}

export async function enterOffice(page: Page, customName = "Alex") {
  await completeRitualFlow(page, customName);
  await page.getByRole("button", { name: "进入数字办公室" }).click();
  await page.waitForURL("**/office");
  await expect(page.getByTestId("office-scene-layout")).toBeVisible();
}

export async function clickOfficeCanvas(page: Page, position: { x: number; y: number }) {
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await canvas.click({ position });
}
