// tests/ui/chat-widget.spec.ts
import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import testData from "../../test-data.json";

test.describe("Chat widget basic behavior", () => {
  test("loads correctly on desktop", async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.open(testData.baseUrl);
    await expect(chat.inputBox).toBeVisible();
    await expect(chat.selectedLanguage).toBeVisible();
  });

  test.use({ viewport: { width: 375, height: 812 } });
  test("loads correctly on mobile", async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.open(testData.baseUrl);
    await expect(chat.inputBox).toBeVisible();
  });

  test("input clears after sending & scrolls to last message", async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.open(testData.baseUrl);
    await chat.sendMessage("Hello");
    await chat.waitForBotReply();

    await expect(chat.inputBox).toHaveValue("");
    expect(await chat.isScrolledToBottom()).toBeTruthy();
  });
});
