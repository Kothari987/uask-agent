// tests/ai/loading-fallback.spec.ts
import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import testData from "../../test-data.json";

test("shows loading indicator while waiting & fallback on error", async ({ page }) => {
  // Intercept backend API call (adjust URL pattern)
  await page.route("**/api/chat*", async (route) => {
    // simulate failure
    await route.fulfill({
      status: 500,
      body: JSON.stringify({ error: "Internal error" })
    });
  });

  const chat = new ChatPage(page);
  await chat.open(testData.baseUrl);

  await chat.sendMessage("Test fallback message");
  // Loading indicator appears
  await expect(chat.loadingIndicator).toBeVisible();

  // Fallback message rendered
  const lastBotText = await chat.lastBotMessage.innerText();
  expect(lastBotText).toMatch(/sorry/i);
  expect(lastBotText).toMatch(/try again/i);
});
