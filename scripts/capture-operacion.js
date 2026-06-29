const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const OUT_DIR = path.join(__dirname, "..", "screenshots", "after");

  for (const vp of [
    { name: "operacion-valentia-mobile", width: 375, height: 812 },
    { name: "operacion-valentia-desktop", width: 1440, height: 900 },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/operacion-valentia", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}.png`), fullPage: true });
    console.log(`✓ ${vp.name}`);
    await ctx.close();
  }
  await browser.close();
})();
