import { test, expect } from "@playwright/test";

test("E2E: ChildrenAnxietyMeter стабільний flow (REAL)", async ({ page }) => {
  // ---------------- OPEN ----------------
  await page.goto("http://localhost:5173/child-home/123", {
    waitUntil: "networkidle",
  });

  // ---------------- WAIT PAGE LOAD ----------------
  await page.waitForTimeout(2000);

  // 🔥 ДИАГНОСТИКА (дуже важливо)
  console.log("PAGE URL:", page.url());
  console.log("BODY TEXT:", await page.locator("body").innerText());

  // ---------------- FIND ANY ANXIETY UI ----------------
  const meter = page.locator("text=Термометр тривожності");

  await expect(meter).toBeVisible({ timeout: 20000 });

  // ---------------- LEVEL BUTTONS ----------------
  const button7 = page.locator("button", { hasText: "7" }).first();
  await expect(button7).toBeVisible();

  await button7.click();

  // ---------------- SAVE BUTTON ----------------
  const saveBtn = page.locator("button", { hasText: "ЗБЕРЕГТИ" }).first();

  await expect(saveBtn).toBeVisible();
  await expect(saveBtn).toBeEnabled();

  await saveBtn.click();

  // ---------------- RESULT ----------------
  await expect(page.locator("text=/дякую|збережено|записано/i")).toBeVisible({
    timeout: 15000,
  });
});
