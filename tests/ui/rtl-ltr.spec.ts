// tests/ui/rtl-ltr.spec.ts
import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import testData from "../../test-data.json";

test("direction is LTR for English", async ({ page }) => {
  const chat = new ChatPage(page);
  await chat.open(`${testData.baseUrl}?lang=en`);
  await expect(await chat.getDirection()).toBe("ltr");
});

test("direction is RTL for Arabic", async ({ page }) => {
  const chat = new ChatPage(page);
  await chat.open(`${testData.baseUrl}?lang=ar`);
  await expect(await chat.getDirection()).toBe("rtl");
});
