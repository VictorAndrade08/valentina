/**
 * Captura solo el viewport (above-the-fold) para comparar header.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const LABEL = process.argv[2] || "after";
const OUT_DIR = path.join(__dirname, "..", "screenshots", LABEL);

const VIEWPORTS = [
  { name: "header-laptop-1024", width: 1024, height: 200 },
  { name: "header-desktop-1280", width: 1280, height: 200 },
  { name: "header-desktop-1440", width: 1440, height: 200 },
  { name: "header-mobile-375",  width: 375,  height: 200 },
];

(async () => {
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}.png`), fullPage: false });
    console.log(`✓ ${vp.name}`);
    await ctx.close();
  }

  await browser.close();
})();
