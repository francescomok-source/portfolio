import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1020 },
  deviceScaleFactor: 2,
});
await page.goto("https://lolympe-minotaur-project.neocities.org/", { waitUntil: "networkidle" });
await page.screenshot({
  path: "public/images/projects/minotaur-website.png",
  fullPage: false,
});
await browser.close();
console.log("captured");
