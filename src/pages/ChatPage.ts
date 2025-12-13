import { Page, Locator, Response } from "@playwright/test";
export class ChatPage {
  readonly page: Page;
  readonly inputBox: Locator;
  readonly sendButton: Locator;
  readonly languageSelector: Locator;
  readonly selectedLanguage: Locator;
  readonly messagesArea: Locator;
  readonly lastUserMessage: Locator;
  readonly lastBotMessage: Locator;
  readonly loadingIndicator: Locator;
  private networkLogs: string[] = [];
  private responseListener: ((response: Response) => Promise<void>) | null = null;

  constructor(page: Page) {
    this.page = page;
    this.inputBox = this.page.locator("#'conversation'");
    this.languageSelector = this.page.locator("select[@id='Language_conversation']");
    this.sendButton = this.page.locator("[aria-label='Send Message']");
    this.messagesArea = this.page.locator("[aria-label='Messages']");
    this.lastUserMessage = this.page.locator("//p[contains(@class,'title-user')]").last();
    this.lastBotMessage = this.page.locator("//div[contains(@class,'card-body') ]//div//markdown").last();
    this.loadingIndicator = this.page.locator("[data-testid='loading']");
    this.selectedLanguage = this.page.locator(".notification-cirle");
  }

  async open(baseUrl: string) {
    await this.page.goto(baseUrl, { waitUntil: "load" });
    await this.page.waitForLoadState("networkidle");

    // Handle disclaimer if present
    await this.acceptDisclaimer();
  }

  async sendMessage(text: string) {
    // Handle disclaimer if present
    await this.acceptDisclaimer();
    await this.inputBox.waitFor({ state: 'visible', timeout: 30_000 });
    await this.inputBox.fill(text, { timeout: 30000 });
    await this.sendButton.click();
  }

  async language(language: string) {
    await this.acceptDisclaimer();
    await this.languageSelector.waitFor({ state: 'visible', timeout: 30_000 });
    await this.languageSelector.selectOption(language);
  }

  async acceptDisclaimer() {
    const acceptButton = this.page.getByRole("button", { name: "Accept and continue" });
    try {
      await acceptButton.waitFor({ state: "visible", timeout: 5000 });
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
      }
    } catch (e) {
      // Disclaimer not found or not visible, proceed
    }
  }


  async waitForBotReply() {

    await this.acceptDisclaimer();
    await this.loadingIndicator.waitFor({ state: "visible" });
    await this.loadingIndicator.waitFor({ state: "hidden" });
    await this.lastBotMessage.waitFor({ state: "visible" });
    return this.lastBotMessage.innerText();
  }

  async getDirection() {
    return this.messagesArea.getAttribute("dir");
  }

  async isScrolledToBottom() {
    const scrollInfo = await this.messagesArea.evaluate((el) => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight
    }));
    return (
      scrollInfo.scrollHeight - scrollInfo.scrollTop - scrollInfo.clientHeight <
      5
    );
  }

  async startNetworkInterceptor() {
    this.networkLogs = [];
    this.responseListener = async (response: Response) => {
      const contentType = response.headers()["content-type"];
      if (contentType && contentType.includes("application/json")) {
        try {
          const body = await response.json();
          const bodyString = JSON.stringify(body).toLowerCase();
          if (bodyString.includes("<script") || bodyString.includes("javascript:")) {
            console.error(`[SECURITY WARNING] Suspicious content found in response from ${response.url()}:`, body);
            this.networkLogs.push(`Suspicious content in ${response.url()}`);
          }
        } catch (e) {
          // Ignore JSON parse errors or body access errors
        }
      }
    };
    this.page.on("response", this.responseListener);
  }

  async validateNetworkResponses() {
    if (this.networkLogs.length > 0) {
      throw new Error(`Network validation failed: ${this.networkLogs.join(", ")}`);
    }
  }

  async stopNetworkInterceptor() {
    if (this.responseListener) {
      this.page.off("response", this.responseListener);
      this.responseListener = null;
    }
  }
}
