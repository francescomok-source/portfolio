# Francesco Mok — Portfolio

Personal portfolio for Francesco Mok, a second-year Computer Science student at EPITA. The site is the interactive version. The same content is also laid out as a printable A4 document and exported to PDF.

## Requirements

- Node.js 20 or newer
- A Chromium browser installed for Playwright (`npx playwright install chromium`)

On Ubuntu or WSL, Chromium also needs system libraries:

```bash
sudo npx playwright install-deps chromium
npx playwright install chromium
```

If `node` is not found in Ubuntu, a local install may already be available:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Local development

```bash
npm install
npm run dev
```

Open the address printed in the terminal. The interactive site is `index.html`. The A4 preview is `print.html`.

The pages are HTML and CSS. `js/site.js` only handles the mobile menu, the active section and the fade-in.

## Update the content

Edit the text directly in `index.html` and `print.html`. Keep the two pages in agreement: the website and the PDF show the same facts.

Before submitting the PDF, replace the class identifier in `print.html`:

```html
<meta name="portfolio-class" content="CLASS" />
```

The exported file is named `francesco-mok-<class>.pdf`. Leave it as `CLASS` only until the real EPITA class code is known.

Images belong in `public/images/`. The portrait is `public/images/profile.jpg`. Until that file is present, the About section shows a monogram placeholder rather than a generated photograph. The EPITA and Reporters Without Borders marks are the official logos, shown in full and without recolouring. There is no GitHub link because none was provided.

## Regenerate the PDF

```bash
npm run export:pdf
```

This opens the A4 layout in Chromium, checks pagination, and writes:

- `output/francesco-mok-<classId>.pdf`
- `output/preview/page-01.png` and the following pages, for visual inspection

The PDF uses A4 portrait, prints backgrounds, and does not add browser headers or footers. The script checks page size, page count, missing text, blank pages and content that overflows a page.

## Deploy

The site is already static. Publish the project folder, including `index.html`, `print.html`, `css/`, `js/`, `fonts/` and `public/images/`. No build step is required for the website. GitHub Pages can serve that folder directly.

## Still to confirm

- EPITA class identifier
- Personal photograph at `public/images/profile.jpg`, if one should be used
- Source-code link and any additional game libraries
- A fuller account of individual contributions, challenges and results
- Future academic projects
- GitHub profile, if it should be listed
