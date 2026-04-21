import { expect, test } from "@playwright/test";

import {
  answerQuizForControlPersona,
  completeRitualFlow,
  enterOffice,
  openGateAndStartTrial
} from "./support/ritual";

test("user can move from gate to avatar preview", async ({ page }) => {
  await completeRitualFlow(page, "Alex");

  await expect(page).toHaveURL(/\/avatar$/);
  await expect(page.getByRole("button", { name: "进入数字办公室" })).toBeVisible();
  await expect(page.getByLabel("角色姓名")).toHaveValue("Alex");
});

test("ritual flow covers gate → quiz → avatar → office", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/石门状态：封印/i)).toBeVisible();
  await openGateAndStartTrial(page);
  await expect(page.getByRole("progressbar", { name: /quiz progress/i })).toBeVisible();
  await expect(page.getByText(/第 1 \/ 31 题/)).toBeVisible();

  await answerQuizForControlPersona(page);
  await page.waitForURL("**/avatar");
  await page.getByLabel("角色姓名").fill("阿酒");

  await expect(page.getByRole("heading", { name: "拿捏者" })).toBeVisible();
  await expect(page.getByText("控场与边界感很强的主导型人格")).toBeVisible();
  await expect(page.getByText("怎么样，被我拿捏了吧？")).toBeVisible();
  await expect(page.getByAltText("拿捏者 人格立绘")).toHaveAttribute(
    "src",
    "/assets/characters/ctrl/transparent.png"
  );
  await expect(page.getByLabel("角色姓名")).toHaveValue("阿酒");

  await page.getByRole("button", { name: "进入数字办公室" }).click();
  await expect(page).toHaveURL(/\/office$/);
  await expect(page.getByLabel("office-current-room-stage")).toHaveAttribute("data-room-id", "office");
  await expect(page.getByLabel("office-minimap")).toBeVisible();
  await expect(page.getByAltText("拿捏者 房间立绘位")).toHaveAttribute(
    "src",
    "/assets/characters/ctrl/transparent.png"
  );
  await expect(page.getByLabel("office-hud")).toHaveAttribute("data-persona-code", "CTRL");
});

test("enterOffice helper lands on the rebuilt office shell", async ({ page }) => {
  await enterOffice(page, "Alex");

  await expect(page.getByLabel("office-current-room-stage")).toHaveAttribute("data-room-id", "office");
  await expect(page.getByLabel("office-entry-door")).toBeVisible();
});
