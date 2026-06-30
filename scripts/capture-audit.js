const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const LABEL = process.argv[2] || "audit-before";
const OUT_DIR = path.join(__dirname, "..", "screenshots", LABEL);
const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  {
    name: "iphone16",
    config: { ...devices["iPhone 15 Pro"], viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 },
  },
  {
    name: "desktop-1280",
    config: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 },
  },
];

const PAGES = [
  { path: "/", slug: "home" },
  { path: "/operacion-valentia", slug: "ov" },
  { path: "/becas", slug: "becas" },
];

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext(vp.config);
    const page = await ctx.newPage();
    for (const p of PAGES) {
      try {
        await page.goto(BASE_URL + p.path, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("load", { timeout: 12000 }).catch(() => {});
        await page.waitForTimeout(2500);
        await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}__${p.slug}.png`), fullPage: true });
        console.log(`✓ ${vp.name} ${p.slug}`);
      } catch (e) {
        console.error(`FAIL ${vp.name} ${p.slug}:`, e.message);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\n✓ ${LABEL}`);
})();
