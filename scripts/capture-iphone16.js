/**
 * Captura iPhone 16 / 15 Pro — auditoría móvil real.
 * Usa devices preset de Playwright (más confiable que viewport manual).
 */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const LABEL = process.argv[2] || "iphone16-before";
const OUT_DIR = path.join(__dirname, "..", "screenshots", LABEL);
const BASE_URL = "http://localhost:3000";

// Forzar viewport iPhone 16 Pro real (393x852 @ 3x)
const iPhone16 = {
  ...devices["iPhone 15 Pro"],
  viewport: { width: 393, height: 852 },
  screen: { width: 393, height: 852 },
  deviceScaleFactor: 3,
};

const PAGES = [
  { path: "/",                   slug: "home" },
  { path: "/becas",              slug: "becas" },
  { path: "/biografia",          slug: "biografia" },
  { path: "/operacion-valentia", slug: "operacion-valentia" },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext(iPhone16);
  const page = await ctx.newPage();

  console.log(`Viewport: ${iPhone16.viewport.width}×${iPhone16.viewport.height} @${iPhone16.deviceScaleFactor}x`);

  for (const p of PAGES) {
    try {
      await page.goto(BASE_URL + p.path, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForLoadState("load", { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(2500);

      const size = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
      console.log(`  ${p.slug} → window.innerWidth=${size.w}`);

      await page.screenshot({
        path: path.join(OUT_DIR, `${p.slug}__01-above-fold.png`),
        fullPage: false,
      });

      await page.screenshot({
        path: path.join(OUT_DIR, `${p.slug}__02-full-page.png`),
        fullPage: true,
      });

      if (p.path === "/") {
        const burger = await page.$('button[aria-label*="menú" i], button[aria-label*="abrir" i]');
        if (burger) {
          await burger.click({ force: true });
          await page.waitForTimeout(800);
          await page.screenshot({
            path: path.join(OUT_DIR, `${p.slug}__03-menu-open.png`),
            fullPage: false,
          });
        }
      }

      console.log(`  ✓ ${p.slug}`);
    } catch (e) {
      console.error(`FAIL ${p.slug}:`, e.message);
    }
  }

  await ctx.close();
  await browser.close();
  console.log(`\n✓ ${LABEL} en ${OUT_DIR}`);
})();
