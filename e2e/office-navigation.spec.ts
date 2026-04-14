import { expect, test } from "@playwright/test";

import { clickOfficeCanvas, enterOffice } from "./support/ritual";

test("click-to-move can open the HR room panel", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 300, y: 280 });

  await expect(page.getByRole("heading", { name: /hr office/i })).toBeVisible();
  await expect(page.getByLabel(/soul.md editor/i)).toBeVisible();
  await expect(page.getByLabel(/memory.md editor/i)).toBeVisible();
});

test("wasd movement can reach the meeting room", async ({ page }) => {
  await enterOffice(page);

  await page.locator("canvas").first().click({ position: { x: 480, y: 320 } });
  await page.keyboard.down("w");
  await page.waitForTimeout(650);
  await page.keyboard.up("w");

  await expect(page.getByRole("heading", { name: /meeting room/i })).toBeVisible();
  await expect(page.getByText(/Chat-first task control console/i)).toBeVisible();
});



test("clicking rest-room furniture can switch the employee into sleep mode", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 740, y: 500 });
  await expect(page.getByRole("heading", { name: /rest area/i })).toBeVisible();

  await page.getByRole("button", { name: /家具 沙发床/i }).click();

  await expect(page.getByText(/已在沙发床切换到睡觉状态/)).toBeVisible();
  await expect(page.getByText("Sleeping")).toBeVisible();
});
