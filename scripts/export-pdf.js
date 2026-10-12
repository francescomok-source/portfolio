import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import { startServer } from "./serve.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "output");
const previewDir = path.join(outputDir, "preview");
fs.mkdirSync(previewDir, { recursive: true });

const printHtml = fs.readFileSync(path.join(root, "print.html"), "utf8");
const classMatch = printHtml.match(/name="portfolio-class" content="([^"]+)"/);
const classId = classMatch?.[1] || "CLASS";
const pdfName = `francesco-mok-${classId}.pdf`;

const requiredPhrases = [
  "Francesco Mok",
  "EPITA",
  "six-month",
  "Python",
  "Intermediate",
  "Critical Thinking",
  "French",
  "English",
  "Spanish",
  "The Minotaur Project",
  "labyrinth",
  "lolympe-minotaur-project.neocities.org",
  "Reporters Without Borders",
  "Salesforce",
  "SOQL",
  "Summer 2026",
  "February 2027",
  "Cultural Heritage",
  "Pokémon",
  "francesco.mok@gmail.com",
  "Cloud Computing",
];
const pdfPath = path.join(outputDir, pdfName);

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const SIZE_TOLERANCE = 3;

const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}

function pass(message) {
  console.log(`OK    ${message}`);
}

async function assertLayout(page) {
  const report = await page.evaluate(() =>
    [...document.querySelectorAll(".print-page")].map((el) => {
      const pageRect = el.getBoundingClientRect();
      const escaped = [...el.querySelectorAll("h2, h3, p, li, img, a, figure")].filter((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return false;
        return (
          rect.bottom > pageRect.bottom + 1.5 ||
          rect.right > pageRect.right + 1.5 ||
          rect.left < pageRect.left - 1.5 ||
          rect.top < pageRect.top - 1.5
        );
      });

      return {
        id: el.dataset.page || "page",
        text: `${el.innerText} ${[...el.querySelectorAll("a")].map((link) => link.getAttribute("href") || "").join(" ")}`
          .replace(/\s+/g, " ")
          .trim(),
        overflowY: el.scrollHeight - el.clientHeight,
        overflowX: el.scrollWidth - el.clientWidth,
        escaped: escaped.slice(0, 4).map((node) => node.textContent.replace(/\s+/g, " ").trim().slice(0, 80)),
        collidesWithFooter: (() => {
          const footer = el.querySelector(".page-foot");
          const body = el.querySelector(".page-body");
          if (!footer || !body) return false;
          const footerTop = footer.getBoundingClientRect().top;
          return [...body.querySelectorAll("h2, h3, p, li, img, figure")].some((node) => {
            const rect = node.getBoundingClientRect();
            return rect.height > 0 && rect.bottom > footerTop + 0.5;
          });
        })(),
      };
    }),
  );

  if (report.length < 6) {
    fail(`Expected at least 6 portfolio pages, found ${report.length}.`);
  } else {
    pass(`${report.length} print pages in the document`);
  }

  const combined = report.map((pageInfo) => pageInfo.text).join("\n").toLowerCase();
  const missing = requiredPhrases.filter((phrase) => !combined.includes(phrase.toLowerCase()));
  missing.forEach((phrase) => fail(`Missing content: "${phrase}"`));
  if (missing.length === 0) pass("Required sections and facts are present");

  report.forEach((pageInfo, index) => {
    const label = `page ${index + 1} (${pageInfo.id})`;
    if (pageInfo.text.length < 40) fail(`${label} looks blank`);
    if (pageInfo.overflowY > 2) fail(`${label} overflows vertically by ${pageInfo.overflowY}px`);
    if (pageInfo.overflowX > 2) fail(`${label} overflows horizontally by ${pageInfo.overflowX}px`);
    if (pageInfo.escaped.length > 0) {
      fail(`${label} has content outside the page: ${pageInfo.escaped.join(" | ")}`);
    }
    if (pageInfo.collidesWithFooter) fail(`${label} overlaps the page footer`);
  });

  const brokenImages = await page.evaluate(() =>
    [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute("src") || img.alt),
  );
  if (brokenImages.length > 0) fail(`Broken images: ${brokenImages.join(", ")}`);
  else pass("Images that are present have loaded");

  return report.length;
}

async function assertPdf(expectedPages) {
  const bytes = fs.readFileSync(pdfPath);
  const document = await PDFDocument.load(bytes);
  document.setTitle("Francesco Mok — Portfolio");
  document.setAuthor("Francesco Mok");
  document.setSubject("Computer science portfolio for EPITA");
  document.setKeywords(["portfolio", "EPITA", "computer science", "internship"]);
  document.setProducer("Francesco Mok portfolio");
  fs.writeFileSync(pdfPath, await document.save());

  const saved = await PDFDocument.load(fs.readFileSync(pdfPath));
  const pages = saved.getPages();
  if (pages.length !== expectedPages) {
    fail(`PDF has ${pages.length} pages; the layout has ${expectedPages}.`);
  } else {
    pass(`PDF page count matches the layout (${pages.length})`);
  }

  pages.forEach((pdfPage, index) => {
    const width = pdfPage.getWidth();
    const height = pdfPage.getHeight();
    const widthOk = Math.abs(width - A4_WIDTH) <= SIZE_TOLERANCE;
    const heightOk = Math.abs(height - A4_HEIGHT) <= SIZE_TOLERANCE;
    if (!widthOk || !heightOk) {
      fail(`Page ${index + 1} is ${width.toFixed(2)} x ${height.toFixed(2)} pt, not A4.`);
    }
  });
  if (!failures.some((item) => item.includes("not A4"))) pass("Every PDF page is A4 portrait");

}

async function renderPreview(browser) {
  const pdfjsDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
  const page = await browser.newPage();
  await page.route("https://pdfjs.local/**", async (route) => {
    const url = new URL(route.request().url());
    const relative = decodeURIComponent(url.pathname.replace(/^\//, ""));
    const file = path.join(pdfjsDir, relative);
    if (!file.startsWith(pdfjsDir)) {
      await route.abort();
      return;
    }
    const type = file.endsWith(".mjs") || file.endsWith(".js") ? "text/javascript" : "application/octet-stream";
    await route.fulfill({ body: fs.readFileSync(file), contentType: type });
  });

  const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
  await page.setContent(`<!DOCTYPE html>
    <html><body>
    <script type="module">
      import * as pdfjs from "https://pdfjs.local/build/pdf.min.mjs";
      pdfjs.GlobalWorkerOptions.workerSrc = "https://pdfjs.local/build/pdf.worker.min.mjs";
      const bytes = Uint8Array.from(atob(${JSON.stringify(pdfBase64)}), (char) => char.charCodeAt(0));
      const doc = await pdfjs.getDocument({ data: bytes }).promise;
      for (let index = 1; index <= doc.numPages; index += 1) {
        const pdfPage = await doc.getPage(index);
        const viewport = pdfPage.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.dataset.page = String(index);
        document.body.append(canvas);
        await pdfPage.render({ canvas, viewport }).promise;
      }
      const pages = [];
      for (let index = 1; index <= doc.numPages; index += 1) {
        const content = await (await doc.getPage(index)).getTextContent();
        pages.push(content.items.map((item) => item.str).join(" "));
      }
      document.body.dataset.pdfText = pages.join("\\n");
      document.body.dataset.ready = "yes";
    </script>
    </body></html>`);
  await page.waitForSelector("body[data-ready='yes']", { timeout: 30000 });
  const pdfText = (await page.locator("body").getAttribute("data-pdf-text")) || "";
  const compactText = pdfText.replace(/\s+/g, "").toLowerCase();
  pdfText.split("\n").forEach((pageText, index) => {
    if (pageText.trim().length < 20) fail(`PDF page ${index + 1} has almost no text`);
  });
  const missingInPdf = requiredPhrases.filter(
    (phrase) => !compactText.includes(phrase.replace(/\s+/g, "").toLowerCase()),
  );
  missingInPdf.forEach((phrase) => fail(`PDF text is missing "${phrase}"`));
  if (missingInPdf.length === 0) pass("PDF text includes the required content");

  const canvases = page.locator("canvas");
  const count = await canvases.count();
  for (let index = 0; index < count; index += 1) {
    const file = path.join(previewDir, `page-${String(index + 1).padStart(2, "0")}.png`);
    await canvases.nth(index).screenshot({ path: file });
    if (fs.statSync(file).size < 1000) fail(`Preview image for page ${index + 1} is unexpectedly small`);
  }
  if (count === 0) fail("PDF preview images were not created");
  else pass(`Rendered ${count} PDF pages to output/preview`);
  await page.close();
}

let server;
if (!process.env.PORTFOLIO_URL) {
  server = await startServer(4173);
}

const printUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:4173/print.html";

let browser;
try {
  browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage();
  await page.goto(printUrl, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.emulateMedia({ media: "print" });

  const expectedPages = await assertLayout(page);
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  pass(`Wrote ${pdfName}`);

  await assertPdf(expectedPages);
  await renderPreview(browser);
} finally {
  if (browser) await browser.close();
  if (server) await server.close();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}

console.log(`\nPortfolio PDF is ready: output/${pdfName}`);
