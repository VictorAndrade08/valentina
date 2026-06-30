/**
 * Capturas integrales del sitio en 4 breakpoints + 6 páginas para audit UX/UI 2027.
 *
 * Uso:
 *   node scripts/capture-2027.js [before|after]
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const LABEL = process.argv[2] || "before-2027";
const OUT_DIR = path.join(__dirname, "..", "screenshots", LABEL);
const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  { name: "01-mobile-iphone-390",  width: 390,  height: 844 },   // iPhone 14 Pro
  { name: "02-tablet-ipad-820",    width: 820,  height: 1180 },  // iPad Air
  { name: "03-laptop-1280",        width: 1280, height: 800 },   // laptop estándar
  { name: "04-desktop-1920",       width: 1920, height: 1080 },  // FHD desktop
];

const PAGES = [
  { path: "/",                   slug: "home" },
  { path: "/becas",              slug: "becas" },
  { path: "/biografia",          slug: "biografia" },
  { path: "/operacion-valentia", slug: "operacion-valentia" },
  { path: "/concurso",           slug: "concurso" },
  { path: "/basesconcurso",      slug: "basesconcurso" },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  let done = 0;
  const total = VIEWPORTS.length * PAGES.length;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      userAgent: vp.width < 768
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    });
    const page = await ctx.newPage();

    for (const p of PAGES) {
      const url = BASE_URL + p.path;
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("load", { timeout: 12000 }).catch(() => {});
        await page.waitForTimeout(2500);
        const file = path.join(OUT_DIR, `${vp.name}__${p.slug}.png`);
        await page.screenshot({ path: file, fullPage: true });
        done++;
        console.log(`[${done}/${total}] ${vp.name} ${p.slug}`);
      } catch (e) {
        console.error(`FAIL ${vp.name} ${p.slug}:`, e.message);
      }
    }

    await ctx.close();
  }

  await browser.close();
  console.log(`\n✓ ${LABEL} guardadas en ${OUT_DIR}`);
})();
