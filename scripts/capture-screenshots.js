/**
 * Capturas responsive automáticas para auditoría UX/UI.
 *
 * Uso:
 *   node scripts/capture-screenshots.js [before|after]
 *
 * Captura las páginas principales en 4 breakpoints (mobile, tablet, laptop, desktop)
 * y las guarda en /screenshots/<label>/.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const LABEL = process.argv[2] || "before";
const OUT_DIR = path.join(__dirname, "..", "screenshots", LABEL);
const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  { name: "01-mobile-375",  width: 375,  height: 812 },   // iPhone X
  { name: "02-tablet-768",  width: 768,  height: 1024 },  // iPad portrait
  { name: "03-laptop-1024", width: 1024, height: 700 },   // small laptop
  { name: "04-desktop-1440",width: 1440, height: 900 },   // desktop
];

const PAGES = [
  { path: "/",         slug: "home" },
  { path: "/becas",    slug: "becas" },
  { path: "/biografia",slug: "biografia" },
  { path: "/concurso", slug: "concurso" },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const total = VIEWPORTS.length * PAGES.length;
  let done = 0;

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
        // Esperar que cargue el contenido visible. Tolerante con el video pesado de Home.
        await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(2000); // dejar que se acomoden animaciones/CMS
        const file = path.join(OUT_DIR, `${vp.name}__${p.slug}.png`);
        await page.screenshot({ path: file, fullPage: true });
        done++;
        console.log(`[${done}/${total}] ${vp.name} ${p.slug} → ${path.basename(file)}`);
      } catch (e) {
        console.error(`FAIL ${vp.name} ${p.slug}:`, e.message);
      }
    }

    await ctx.close();
  }

  await browser.close();
  console.log(`\n✓ ${LABEL} screenshots saved to ${OUT_DIR}`);
})();
