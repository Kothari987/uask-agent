// tests/ui/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import testData from "../../test-data.json";

test("input has label and ARIA attributes", async ({ page }) => {
  const chat = new ChatPage(page);
  await chat.open(testData.baseUrl);
  await expect(chat.inputBox).toHaveAttribute("aria-label", "Please ask me a question");
  await expect(chat.messagesArea).toHaveAttribute("role", "listbox");
});
