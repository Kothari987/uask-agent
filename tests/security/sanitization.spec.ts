// tests/security/sanitization.spec.ts
import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import { loadTestData } from "../../src/utils/testDataLoader";

const data = loadTestData();
const sanCases = data.testCases.filter((c) => c.category === "SANITIZATION");

for (const tc of sanCases) {
  test(tc.id + " – " + tc.description, async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.open(`${data.baseUrl}?lang=en`);

    await chat.sendMessage(tc.prompt);
    const response = await chat.waitForBotReply();

    // Frontend should escape scripts in UI (no script execution; here we check text)
    expect(response).not.toContain("<script>alert('XSS')</script>");

    // Also ensure page didn't navigate or show alert (basic sanity: still on same URL)
    await expect(page).toHaveURL(/uask/);
  });
}
