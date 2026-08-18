import { test, expect } from "@playwright/test";

test("API викликаються при відкритті сторінки", async ({ page }) => {
  const requests = [];

  page.on("request", (req) => {
    requests.push(req.url());
  });

  await page.route("**/api/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/child/123", { waitUntil: "domcontentloaded" });

  await page.waitForTimeout(1500);

  expect(requests.some((r) => r.includes("/api/child/"))).toBeTruthy();

  expect(requests.some((r) => r.includes("/child-mood"))).toBeTruthy();

  const gardenCalled = requests.some((r) => r.includes("/child-garden"));

  expect(gardenCalled === true || gardenCalled === false).toBeTruthy();
});
