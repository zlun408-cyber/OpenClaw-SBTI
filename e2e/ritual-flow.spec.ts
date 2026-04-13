import { expect, test } from "@playwright/test";

import { completeRitualFlow } from "./support/ritual";

test("user can move from gate to avatar preview", async ({ page }) => {
  await completeRitualFlow(page, "Alex");

  await expect(page).toHaveURL(/\/avatar$/);
  await expect(page.getByRole("button", { name: "进入数字办公室" })).toBeVisible();
  await expect(page.getByLabel("角色姓名")).toHaveValue("Alex");
});
