// tests/ai/responses-consistency.spec.ts
import { test, expect } from "@playwright/test";
import { ChatPage } from "../../src/pages/ChatPage";
import { loadTestData } from "../../src/utils/testDataLoader";
import { areResponsesConsistent } from "../../src/utils/aiValidators";


const data = loadTestData();
const enCases = data.testCases.filter((c) => c.language === "EN" && c.pairedWith);

for (const enCase of enCases) {
  const arCase = data.testCases.find((c) => c.id === enCase.pairedWith);
  if (!arCase) continue;

  test(`Consistency EN/AR – ${enCase.id} ↔ ${arCase.id}`, async ({ browser }) => {
    const enContext = await browser.newContext({ locale: "en-US" });
    const arContext = await browser.newContext({ locale: "ar-AE" });

    const enPage = await enContext.newPage();
    const arPage = await arContext.newPage();

    const enChat = new (await import("../../src/pages/ChatPage")).ChatPage(enPage);
    const arChat = new (await import("../../src/pages/ChatPage")).ChatPage(arPage);

    await enChat.open(`${data.baseUrl}?lang=en`);
    await arChat.open(`${data.baseUrl}?lang=ar`);

    await enChat.sendMessage(enCase.prompt);
    const enResponse = await enChat.waitForBotReply();

    await arChat.sendMessage(arCase.prompt);
    const arResponse = await arChat.waitForBotReply();

    expect(areResponsesConsistent(enResponse, arResponse)).toBeTruthy();

    await enContext.close();
    await arContext.close();
  });
}
