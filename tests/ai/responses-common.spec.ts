import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import { loadTestData } from "../../src/utils/testDataLoader";
import {
  isHelpful,
  isCleanlyFormatted,
  isNotHallucinatedSimple
} from "../../src/utils/aiValidators";

const data = loadTestData();
const commonCases = data.testCases.filter((c) => c.category === "COMMON_SERVICE");

for (const tc of commonCases) {
  test.describe(`AI response validation – ${tc.id} (${tc.language})`, () => {
    test(tc.description, async ({ page }) => {
      const chat = new ChatPage(page);
      const url =
        tc.language === "AR" ? `${data.baseUrl}?lang=ar` : `${data.baseUrl}?lang=en`;
      await chat.open(url);

      // Start network validation after page load to avoid inspecting initial assets
      await chat.startNetworkInterceptor();

      await chat.sendMessage(tc.prompt);
      const response = await chat.waitForBotReply();

      expect(
        isHelpful(response, tc.minResponseLength ?? 100, tc.mustContain ?? [])
      ).toBeTruthy();

      expect(isCleanlyFormatted(response)).toBeTruthy();

      expect(
        isNotHallucinatedSimple(response, tc.mustNotContain ?? [])
      ).toBeTruthy();

      // Validate no suspicious network responses were found
      await chat.validateNetworkResponses();
      await chat.stopNetworkInterceptor();
    });
  });
}
