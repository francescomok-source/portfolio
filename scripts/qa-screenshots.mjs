import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const out = path.resolve("output/qa");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(path.resolve("public/images"), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

for (const id of ["about", "skills", "projects", "experience", "interests", "goals", "contact"]) {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(out, `section-${id}.png`) });
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(out, "mobile-top.png") });
await page.getByRole("button", { name: "Open menu" }).click();
await page.screenshot({ path: path.join(out, "mobile-menu.png") });
await page.locator("#section-nav a[href='#projects']").click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, "mobile-projects.png") });

const printPage = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
await printPage.goto("http://127.0.0.1:5174/print.html", { waitUntil: "networkidle" });
await printPage.evaluate(() => document.fonts.ready);
const sheets = printPage.locator(".print-page");
const count = await sheets.count();
for (let index = 0; index < count; index += 1) {
  await sheets.nth(index).screenshot({
    path: path.join(out, `print-${String(index + 1).padStart(2, "0")}.png`),
  });
}
console.log(`print pages: ${count}`);

const site = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await site.goto("https://lolympe-minotaur-project.neocities.org/", {
    waitUntil: "domcontentloaded",
    timeout: 25000,
  });
  await site.waitForTimeout(1200);
  await site.screenshot({ path: path.resolve("public/images/minotaur-website.png") });
  console.log("Captured Minotaur website screenshot");
} catch (error) {
  console.error(`Minotaur capture failed: ${error.message}`);
}

await browser.close();
console.log(errors.length ? errors.join("\n") : "No page errors");
