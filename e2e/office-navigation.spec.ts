import { expect, test } from "@playwright/test";

import { clickOfficeCanvas, enterOffice } from "./support/ritual";

test("click-to-move can switch the active room panel", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 300, y: 280 });

  await expect(page.getByRole("heading", { name: /hr office/i })).toBeVisible();
  await expect(page.getByText(/soul calibration/i)).toBeVisible();
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
