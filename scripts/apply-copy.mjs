import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lookup } from "../content/portfolio.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "print.html"];

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

export function applyCopy() {
  for (const name of pages) {
    const file = path.join(root, name);
    let html = fs.readFileSync(file, "utf8");
    const seen = new Set();

    html = html.replace(/<a\b([^>]*)>/gi, (full, attrs) => {
      const key = attrs.match(/\sdata-href="([^"]+)"/);
      if (!key) return full;
      const href = escapeAttr(lookup(key[1]));
      seen.add(key[1]);
      const next = /\shref="[^"]*"/.test(attrs)
        ? attrs.replace(/\shref="[^"]*"/, ` href="${href}"`)
        : `${attrs} href="${href}"`;
      return `<a${next}>`;
    });

    html = html.replace(
      /(<([a-z0-9]+)\b[^>]*\sdata-copy="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/gi,
      (full, open, _tag, key, _text, close) => {
        seen.add(key);
        return `${open}${escapeHtml(lookup(key))}${close}`;
      },
    );

    const missing = [...html.matchAll(/\sdata-copy="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((key) => !seen.has(key));
    if (missing.length > 0) {
      throw new Error(`${name} has data-copy keys that were not applied: ${missing.join(", ")}`);
    }

    fs.writeFileSync(file, html);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  applyCopy();
  console.log("Applied shared portfolio copy to index.html and print.html");
}
