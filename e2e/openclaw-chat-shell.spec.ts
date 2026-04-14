import { expect, test } from "@playwright/test";

import { clickOfficeCanvas, enterOffice } from "./support/ritual";

test("floating chat stays visible and adapts to room context", async ({ page }) => {
  await enterOffice(page);

  const chat = page.getByLabel("openclaw-chat");
  const input = page.getByLabel("openclaw input");

  await expect(chat).toBeVisible();
  await expect(input).toHaveAttribute("placeholder", "和 OpenClaw 对话");

  await clickOfficeCanvas(page, { x: 300, y: 280 });
  await expect(input).toHaveAttribute("placeholder", "更新 soul 或 memory");

  await input.fill("同步一下今天的 memory");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText(/OpenClaw 本地 Webchat 已定位到 人事部/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "打开本地 Webchat" })).toBeVisible();
});


test("meeting-room chat can create a task card without leaving the room", async ({ page }) => {
  await enterOffice(page);

  await page.locator("canvas").first().click({ position: { x: 480, y: 320 } });
  await page.keyboard.down("w");
  await page.waitForTimeout(650);
  await page.keyboard.up("w");

  const input = page.getByLabel("openclaw input");
  await input.fill("新增任务：整理今天客户反馈");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText(/已创建会议任务《整理今天客户反馈》/)).toBeVisible();
  await expect(page.getByRole("button", { name: "领取任务 整理今天客户反馈" })).toBeVisible();
});
