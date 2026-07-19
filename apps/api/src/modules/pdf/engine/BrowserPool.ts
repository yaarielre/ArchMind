import puppeteer, { type Browser } from "puppeteer";

export class BrowserPool {
  private static instance: BrowserPool | null = null;
  private browser: Browser | null = null;
  private launching = false;
  private launchQueue: ((browser: Browser) => void)[] = [];

  static getInstance(): BrowserPool {
    if (!BrowserPool.instance) BrowserPool.instance = new BrowserPool();
    return BrowserPool.instance;
  }

  async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) return this.browser;

    if (this.launching) {
      return new Promise<Browser>((resolve) => {
        this.launchQueue.push(resolve);
      });
    }

    this.launching = true;
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });

      this.browser.on("disconnected", () => {
        this.browser = null;
      });

      for (const resolve of this.launchQueue) resolve(this.browser);
      this.launchQueue = [];

      return this.browser;
    } finally {
      this.launching = false;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}
