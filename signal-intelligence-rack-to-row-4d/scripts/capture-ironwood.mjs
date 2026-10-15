import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [],
  remote = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("**/*", (r) => {
  const u = r.request().url();
  if (
    u.startsWith("http://127.0.0.1:4173") ||
    u.startsWith("data:") ||
    u.startsWith("blob:")
  )
    return r.continue();
  remote.push(u);
  return r.abort();
});
await page.goto("http://127.0.0.1:4173/");
await page
  .getByLabel("Architecture profile")
  .selectOption("GOOGLE_IRONWOOD_TPU_REFERENCE");
await page
  .getByLabel("Search components")
  .fill("GOOGLE_IRONWOOD_TPU_REFERENCE/R1/tray-1");
await page.getByRole("treeitem").first().click();
await page.getByRole("button", { name: "Drill In" }).click();
await page.getByRole("button", { name: "Collapse panels" }).click();
await page.waitForTimeout(4500);
await page.screenshot({
  path: "evidence/v2/ironwood-tray-tpus.png",
  fullPage: true,
});
await page.getByLabel("Camera preset").selectOption("top");
await page.waitForTimeout(1500);
await page.screenshot({
  path: "evidence/v2/ironwood-tray-top.png",
  fullPage: true,
});
await page.locator("footer button").click();
const diagnostic = JSON.parse(await page.locator(".modal pre").innerText());
await page.getByRole("button", { name: "Close ×", exact: true }).click();
await page.getByRole("button", { name: "Show panels" }).click();
await page
  .getByLabel("Search components")
  .fill("GOOGLE_IRONWOOD_TPU_REFERENCE/R1/accelerator-1.1");
await page.getByRole("treeitem").first().click();
await page.getByRole("button", { name: "Drill In" }).click();
await page.getByLabel("Camera preset").selectOption("isometric");
await page.getByRole("button", { name: "Collapse panels" }).click();
await page.waitForTimeout(2000);
await page.screenshot({
  path: "evidence/v2/ironwood-tpu-package.png",
  fullPage: true,
});
await fs.writeFile(
  "evidence/v2/ironwood-tray-metrics.json",
  JSON.stringify(
    {
      viewport: [1920, 1080],
      profile: "GOOGLE_IRONWOOD_TPU_REFERENCE",
      level: 9,
      quality: "Balanced",
      cutaway: true,
      errors,
      remote,
      diagnostic,
      notes: [
        "Four TPU records mounted on the tray board; Google documents four chips per host and two chiplets per chip.",
        "Original illustrative enclosure, chiplet proportions and HBM placement, not vendor CAD.",
      ],
    },
    null,
    2,
  ),
);
await browser.close();
console.log(
  JSON.stringify({
    fps: diagnostic.fps,
    renderer: diagnostic.renderer,
    drawCalls: diagnostic.drawCalls,
    triangles: diagnostic.triangles,
    errors,
    remote,
  }),
);
if (errors.length || remote.length)
  throw Error("Capture recorded runtime errors or remote requests");
