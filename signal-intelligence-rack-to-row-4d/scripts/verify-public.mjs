import { screenshot, writeEvidence } from "./artifacts.mjs";
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
  const expectedBundle = (await fs.readFile("dist/index.html", "utf8")).match(
    /src="\.\/assets\/([^"]+)"/,
  )[1];
  expect(await response.text()).toContain(expectedBundle);
  await expect(page.locator(".cat-card")).toHaveCount(10);
  await expect(
    page.locator(".cat-card button", { hasText: "L1–L12 integration" }),
  ).toHaveCount(10);
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every((i) => i.complete && i.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await screenshot(page, {
    path: `${root}/${prefix}-gallery.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Compare the rack-scale heroes ↗" })
    .click();
  await expect(page.locator(".cat-canvas canvas")).toHaveCount(2);
  await expect(page.getByTestId("4d-workbench")).toBeVisible();
  await expect(
    page.getByRole("tree", { name: "Accessible component tree", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What is it?", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Linked overlays")).toBeVisible();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  const audit = JSON.parse(
    await page.getByTestId("catalogue-audit").innerText(),
  );
  expect(audit.a.drawCalls).toBeGreaterThan(0);
  expect(audit.b.drawCalls).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  await screenshot(page, {
    path: `${root}/${prefix}-comparison.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Investigation", exact: true })
    .click();
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByLabel("Catalogue time").fill("180");
  await expect(page.locator(".cat-inspector")).toContainText("27 affected");
  await page
    .getByTestId("assembly-a")
    .getByRole("button", { name: /^A L1 / })
    .click();
  await expect(
    page.getByTestId("assembly-a").locator(".cat-stage-buttons button"),
  ).toHaveCount(12);
  await expect(page.getByTestId("assembly-b")).toHaveAttribute(
    "data-level",
    "12",
  );
  await page
    .getByRole("button", { name: "Run simulated test 1", exact: true })
    .click();
  await expect(page.getByTestId("gate-result-0")).toContainText("FAIL");
  await page
    .getByRole("button", { name: "Investigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear family incident", exact: true })
    .click();
  await page.getByRole("button", { name: "L1–L12", exact: true }).click();
  for (let i = 1; i <= 3; i++)
    await page
      .getByRole("button", { name: `Run simulated test ${i}`, exact: true })
      .click();
  await page
    .getByLabel("Catalogue gate evidence note")
    .fill("Live public synthetic fixture verification");
  await page
    .getByRole("button", { name: "Sign earned L1 pass", exact: true })
    .click();
  await expect(
    page.locator(".cat-lifecycle-panel [role=status]"),
  ).toContainText("L1 synthetic pass signed");
  await page
    .getByTestId("assembly-a")
    .getByRole("button", { name: /^A L3 / })
    .click();
  await page.waitForTimeout(500);
  await screenshot(page, {
    path: `${root}/${prefix}-lifecycle.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "4D workspace", exact: true }).click();
  await page
    .getByLabel("Architecture A", { exact: true })
    .selectOption("CAT-03");
  await page
    .getByTestId("assembly-a")
    .getByRole("button", { name: /^A L2 / })
    .click();
  await page.getByLabel("Catalogue camera").selectOption("rear");
  await page.waitForTimeout(600);
  await screenshot(page, {
    path: `${root}/${prefix}-DGX-L2-power.png`,
    fullPage: true,
  });
  await page
    .getByTestId("assembly-a")
    .getByRole("button", { name: /^A L12 / })
    .click();
  await page.getByLabel("Catalogue camera").selectOption("oblique");
  await page.waitForTimeout(5500);
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  const dgx = JSON.parse(
    await page.getByTestId("catalogue-audit").innerText(),
  ).a;
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  const dgxPerformance = {
    fpsSamples: dgx.fpsSamples.slice(-5),
    drawCalls: dgx.drawCalls,
    triangles: dgx.renderTriangles,
    renderer: dgx.renderer,
    viewport: [1920, 1080],
    quality: "Balanced",
    level: 12,
  };
  await page.getByRole("button", { name: "Reference profiles" }).click();
  await expect(page.getByLabel("Architecture profile")).toHaveValue(
    "FS_CONCEPT",
  );
  expect(errors).toEqual([]);
  expect(failedResponses).toEqual([]);
  await writeEvidence(
    `${root}/${prefix}-verification.json`,
    JSON.stringify(
      {
        url,
        checkedAt: new Date().toISOString(),
        http: response.status(),
        galleryFamilies: 10,
        converged4DWorkbench: true,
        expectedBundle,
        decodedImages: true,
        comparisonCanvases: 2,
        drawCalls: [audit.a.drawCalls, audit.b.drawCalls],
        renderer: audit.a.renderer,
        scopedFaultAffected: 27,
        lifecycle: {
          cardEntries: 10,
          stageButtonsPerPane: 12,
          independentABLevels: true,
          activeIncidentBlocks: true,
          l1Signoff: true,
        },
        dgxPerformance,
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
      screenshots: [
        `${prefix}-gallery.png`,
        `${prefix}-comparison.png`,
        `${prefix}-lifecycle.png`,
        `${prefix}-DGX-L2-power.png`,
      ],
    }),
  );
} finally {
  await browser.close();
}
