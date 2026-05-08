import { test, expect } from "@playwright/test";

test("ChildHome завантажується", async ({ page }) => {
  // ---------------- MOCK API ----------------
  await page.route("**/api/child/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        child: { name: "Test" },
      }),
    }),
  );

  await page.route("**/api/child-mood/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        mood: "happy",
        hasMood: true,
      }),
    }),
  );

  await page.route("**/api/child-garden/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        flowers: [],
        treeStage: 1,
      }),
    }),
  );

  // ---------------- OPEN ----------------
  await page.goto("/child-home/123");

  // ---------------- НЕ ЧЕКАЄМО loading ----------------
  await page.waitForLoadState("domcontentloaded");

  // ---------------- ЧЕКАЄМО ГОЛОВНИЙ UI ----------------
  await expect(page.locator("body")).toContainText(/сад|настрій|вправи/i);

  // ---------------- ASSISTANT ----------------
  await expect(page.locator(".assistant-container")).toBeAttached();
});
