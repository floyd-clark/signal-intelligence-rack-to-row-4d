import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const url =
  process.argv[2] ||
  "https://floyd-clark.github.io/signal-intelligence-rack-to-row-4d/?catalogue=1";
const local = new URL(url).hostname === "127.0.0.1";
const prefix = local ? "publication-local" : "public";
const root = "evidence/catalogue-v2";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [],
  failedResponses = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400)
    failedResponses.push({ status: r.status(), url: r.url() });
});
try {
  const response = await page.goto(url);
  expect(response.status()).toBe(200);
  await expect(page.locator(".cat-card")).toHaveCount(10);
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: `${root}/${prefix}-gallery.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Compare the rack-scale heroes ↗" })
    .click();
  await expect(page.locator(".cat-canvas canvas")).toHaveCount(2);
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  const audit = JSON.parse(
    await page.getByTestId("catalogue-audit").innerText(),
  );
  expect(audit.a.drawCalls).toBeGreaterThan(0);
  expect(audit.b.drawCalls).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  await page.screenshot({
    path: `${root}/${prefix}-comparison.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Investigate", exact: true }).click();
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByLabel("Catalogue time").fill("180");
  await expect(page.locator(".cat-inspector")).toContainText("27 affected");
  await page.getByRole("button", { name: "Return to 4D lab" }).click();
  await expect(page.getByLabel("Architecture profile")).toHaveValue(
    "FS_CONCEPT",
  );
  expect(errors).toEqual([]);
  expect(failedResponses).toEqual([]);
  await fs.writeFile(
    `${root}/${prefix}-verification.json`,
    JSON.stringify(
      {
        url,
        checkedAt: new Date().toISOString(),
        http: response.status(),
        galleryFamilies: 10,
        decodedImages: true,
        comparisonCanvases: 2,
        drawCalls: [audit.a.drawCalls, audit.b.drawCalls],
        renderer: audit.a.renderer,
        scopedFaultAffected: 27,
        legacyReturn: true,
        errors,
        failedResponses,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      url,
      passed: true,
      screenshots: [`${prefix}-gallery.png`, `${prefix}-comparison.png`],
    }),
  );
} finally {
  await browser.close();
}
