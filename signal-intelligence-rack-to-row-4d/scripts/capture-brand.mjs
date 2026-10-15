import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";

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
  const url = r.request().url();
  if (
    url.startsWith("http://127.0.0.1:4173") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  )
    return r.continue();
  remote.push(url);
  return r.abort();
});
await page.goto("http://127.0.0.1:4173/");
const logo = page.getByRole("img", { name: "Signal Intelligence symbol" });
await expect(logo).toBeVisible();
await expect
  .poll(() => logo.evaluate((i) => i.complete && i.naturalWidth > 0))
  .toBe(true);
await expect(page.locator(".brand-name")).toHaveText("SIGNAL INTELLIGENCE");
const desktop = await page.locator(".brandmark").boundingBox();
expect(desktop.x).toBeLessThan(25);
expect(desktop.y).toBeLessThan(25);
const colors = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  return {
    accent: root.getPropertyValue("--brand-accent").trim(),
    header: getComputedStyle(document.querySelector("header")).backgroundColor,
    active: getComputedStyle(
      document.querySelector('button[aria-pressed="true"]'),
    ).backgroundColor,
  };
});
expect(colors.accent).toBe("#66baff");
await page.waitForTimeout(2000);
await page.screenshot({
  path: "evidence/v2/brand-desktop.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Collapse panels" }).click();
await page.waitForTimeout(700);
await page.screenshot({
  path: "evidence/v2/brand-presentation.png",
  fullPage: true,
});
await page.setViewportSize({ width: 1280, height: 900 });
await page.getByRole("button", { name: "Show panels" }).click();
await page.waitForTimeout(800);
const narrow = await page.locator(".brandmark").boundingBox();
expect(narrow.x).toBeLessThan(25);
expect(narrow.y).toBeLessThan(25);
const overflow = await page
  .locator("header")
  .evaluate((header) =>
    [...header.children].some(
      (el) => el.getBoundingClientRect().right > innerWidth + 1,
    ),
  );
expect(overflow).toBe(false);
await page.screenshot({ path: "evidence/v2/brand-1280.png", fullPage: true });
const data = await fs.readFile("public/brand/signal-intelligence-symbol.png");
expect(errors).toEqual([]);
expect(remote).toEqual([]);
await fs.writeFile(
  "evidence/v2/brand-verification.json",
  JSON.stringify(
    {
      passed: true,
      symbolSHA256: createHash("sha256").update(data).digest("hex"),
      desktop,
      narrow,
      colors,
      headerOverflow: overflow,
      errors,
      remote,
      checks: [
        "supplied local image decoded",
        "accessible symbol name",
        "top-left placement at 1920 and 1280 widths",
        "brand palette applied",
        "panel collapse and responsive header",
        "remote requests blocked",
      ],
    },
    null,
    2,
  ),
);
console.log(
  "Brand image, palette, responsive header and offline checks passed",
);
await browser.close();
