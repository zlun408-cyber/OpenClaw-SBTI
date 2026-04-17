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

  await clickOfficeCanvas(page, { x: 480, y: 320 });
  await page.keyboard.down("w");
  await page.waitForTimeout(650);
  await page.keyboard.up("w");

  await expect(page.getByRole("heading", { name: /meeting room/i })).toBeVisible();
  await expect(page.getByText(/scene hotspots/i)).toBeVisible();
});



test("clicking rest-room furniture can switch the employee into sleep mode", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 740, y: 500 });
  await expect(page.getByRole("heading", { name: /rest area/i })).toBeVisible();

  await page.getByRole("button", { name: /家具 沙发床/i }).click();

  await expect(page.getByText(/已在沙发床切换到睡觉状态/)).toBeVisible();
  await expect(page.getByText("Sleeping")).toBeVisible();
});


test("clicking a training workstation can focus the matching skill set", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 660, y: 280 });
  await expect(page.getByRole("heading", { name: /training room/i })).toBeVisible();

  await page.getByRole("button", { name: /训练工位 执行终端/i }).click();
  await expect(page.getByText(/已聚焦训练工位：执行终端/)).toBeVisible();

  const availableSection = page.getByRole("heading", { name: "Available Skills" }).locator("xpath=ancestor::section[1]");
  await expect(availableSection.getByRole("button", { name: /安装 skill 跑测试/i })).toBeVisible();
  await expect(availableSection.getByText("读文件", { exact: true })).toBeVisible();
});


test("clicking an HR workstation can focus the memory editor", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 300, y: 280 });
  await expect(page.getByRole("heading", { name: /hr office/i })).toBeVisible();

  await page.getByRole("button", { name: /人事工位 Memory 档案柜/i }).click();
  await expect(page.getByText(/已聚焦档案柜：memory.md/)).toBeVisible();
  await expect(page.getByLabel("memory.md editor")).toBeVisible();
});


test("clicking a meeting workstation can focus the submission lane", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 480, y: 320 });
  await page.keyboard.down("w");
  await page.waitForTimeout(650);
  await page.keyboard.up("w");

  await expect(page.getByRole("heading", { name: /meeting room/i })).toBeVisible();
  await page.getByRole("button", { name: /会议工位 提交席/i }).click();

  await expect(page.getByText(/已聚焦会议工位：提交席/)).toBeVisible();
  await expect(page.getByLabel("ready_to_submit-lane").getByRole("heading", { name: /ready to submit/i })).toBeVisible();
});
