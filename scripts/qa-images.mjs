import { chromium } from "playwright";
import { startServer } from "./serve.js";

const server = await startServer(4174);
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const errors = [];

async function shoot(page, name) {
  await page.screenshot({ path: `output/qa/${name}.png`, fullPage: false });
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on("pageerror", (error) => errors.push(error.message));
await desktop.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
await desktop.evaluate(() => document.fonts.ready);
const imageReport = await desktop.evaluate(() =>
  [...document.images].map((img) => ({
    src: img.getAttribute("src"),
    alt: img.alt,
    w: img.naturalWidth,
    h: img.naturalHeight,
    complete: img.complete,
  })),
);
console.log(JSON.stringify({ images: imageReport, errors }, null, 2));
await desktop.locator("#about").scrollIntoViewIfNeeded();
await shoot(desktop, "about");
await desktop.locator("#projects").scrollIntoViewIfNeeded();
await shoot(desktop, "projects");
const projectLink = desktop.getByRole("link", { name: "Project presentation" }).first();
console.log("presentation href", await projectLink.getAttribute("href"));
await desktop.locator("#experience").scrollIntoViewIfNeeded();
await shoot(desktop, "experience");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
await mobile.getByRole("button", { name: "Open menu" }).click();
await shoot(mobile, "mobile-menu");
await mobile.keyboard.press("Escape");
await mobile.locator("#projects").scrollIntoViewIfNeeded();
await shoot(mobile, "mobile-projects");
await mobile.locator("#about").scrollIntoViewIfNeeded();
await shoot(mobile, "mobile-about");

const print = await browser.newPage({ viewport: { width: 900, height: 1200 } });
await print.goto("http://127.0.0.1:4174/print.html", { waitUntil: "networkidle" });
const printImages = await print.evaluate(() =>
  [...document.images].map((img) => ({
    src: img.getAttribute("src"),
    alt: img.alt,
    w: img.naturalWidth,
  })),
);
console.log("print images", JSON.stringify(printImages));
await print.locator("[data-page='about']").screenshot({ path: "output/qa/print-about.png" });
await print.locator("[data-page='minotaur']").screenshot({ path: "output/qa/print-project.png" });
await print.locator("[data-page='rsf']").screenshot({ path: "output/qa/print-experience.png" });

await browser.close();
await server.close();
if (errors.length) process.exit(1);
