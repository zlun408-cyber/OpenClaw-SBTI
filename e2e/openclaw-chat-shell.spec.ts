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
  await expect(page.getByRole("heading", { name: /meeting room/i })).toBeVisible();

  const input = page.getByLabel("openclaw input");
  await input.fill("新增任务：整理今天客户反馈");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText(/已创建会议任务《整理今天客户反馈》/)).toBeVisible();
  await expect(page.getByRole("button", { name: "领取任务 整理今天客户反馈" })).toBeVisible();
});


test("training-room chat can install a new skill", async ({ page }) => {
  await enterOffice(page);

  await page.locator("canvas").first().click({ position: { x: 660, y: 280 } });
  await expect(page.getByRole("heading", { name: /training room/i })).toBeVisible();

  const input = page.getByLabel("openclaw input");
  await input.fill("安装 skill：日报总结");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText(/已安装训练技能《日报总结》/)).toBeVisible();

  const installedSection = page.getByRole("heading", { name: "Installed Skills" }).locator("xpath=..");
  await expect(installedSection.getByText("日报总结", { exact: true })).toBeVisible();
});


test("rest-room chat can switch the digital employee into dance mode", async ({ page }) => {
  await enterOffice(page);

  await clickOfficeCanvas(page, { x: 740, y: 500 });
  await expect(page.getByRole("heading", { name: /rest area/i })).toBeVisible();

  const input = page.getByLabel("openclaw input");
  await input.fill("跳舞放松一下");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(page.getByText(/已切换到跳舞状态/)).toBeVisible();
  await expect(page.getByText("Dancing")).toBeVisible();
});
