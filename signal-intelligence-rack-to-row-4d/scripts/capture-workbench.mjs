import { screenshot, writeEvidence } from "./artifacts.mjs";
import { createHash } from "node:crypto";
import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
const root = "evidence/catalogue-v2/workbench";
await fs.mkdir(root, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:4173/?catalogue=1";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
let comparison;
const errors = [],
  remote = [],
  results = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route("**/*", (r) => {
  const u = r.request().url();
  if (
    u.startsWith(new URL(url).origin) ||
    u.startsWith("data:") ||
    u.startsWith("blob:")
  )
    return r.continue();
  remote.push(u);
  return r.abort();
});
async function audit() {
  await page
    .getByRole("button", { name: "Catalogue render audit", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        !!JSON.parse(await page.getByTestId("catalogue-audit").innerText()).a
          ?.camera,
    )
    .toBe(true);
  const data = JSON.parse(
    await page.getByTestId("catalogue-audit").innerText(),
  );
  await page
    .getByRole("button", { name: "Catalogue render audit", exact: true })
    .click();
  return data;
}
try {
  await page.goto(url);
  await expect(page.locator(".cat-card")).toHaveCount(10);
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await page
      .locator(".cat-card")
      .nth(i)
      .getByRole("button", { name: "Open 4D workspace →", exact: true })
      .click();
    await expect(page.getByTestId("4d-workbench")).toBeVisible();
    await expect(
      page.getByRole("tree", {
        name: "Accessible component tree",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What is it?", exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(5200);
    const a = (await audit()).a;
    const samples = a.fpsSamples.slice(-4).sort((x, y) => x - y);
    const id = `CAT-${String(i + 1).padStart(2, "0")}`;
    await screenshot(page, { path: `${root}/${id}-4D.png`, fullPage: true });
    results.push({
      id,
      quality: await page.getByLabel("Catalogue quality").inputValue(),
      viewport: [1920, 1080],
      canvas: await page.locator("canvas").boundingBox(),
      fpsSamples: a.fpsSamples,
      medianFPS: samples[Math.floor(samples.length / 2)],
      drawCalls: a.drawCalls,
      triangles: a.renderTriangles,
      renderer: a.renderer,
    });
    console.log(id, JSON.stringify(results.at(-1)));
  }
  await page
    .getByLabel("Architecture A", { exact: true })
    .selectOption("CAT-04");
  await page.getByRole("button", { name: "Tray", exact: true }).click();
  await page.getByRole("button", { name: "CAD cutaway", exact: true }).click();
  await page.waitForTimeout(1500);
  await screenshot(page, { path: `${root}/GB300-tray-4D.png`, fullPage: true });
  await page
    .getByLabel("Search components", { exact: true })
    .fill("CAT-04/memory/2.1");
  await page
    .getByRole("tree", { name: "Accessible component tree" })
    .getByRole("treeitem")
    .first()
    .dblclick();
  await page.waitForTimeout(1200);
  await screenshot(page, {
    path: `${root}/GB300-HBM-tray2-4D.png`,
    fullPage: true,
  });
  const detail = await audit();
  expect(detail.a.owners["CAT-04/memory/2.1"]).toBeTruthy();
  await page.getByLabel("Search components", { exact: true }).fill("");
  await page.getByRole("button", { name: "Rack", exact: true }).click();
  await page
    .getByRole("button", { name: "Investigation", exact: true })
    .click();
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByLabel("Catalogue time").fill("180");
  await page.waitForTimeout(1000);
  await screenshot(page, {
    path: `${root}/GB300-diagnostics-4D.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "A/B comparison", exact: true })
    .click();
  await page
    .getByLabel("Architecture B", { exact: true })
    .selectOption("CAT-06");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await page.getByLabel("Metric trace").selectOption("goodputPct");
  await page.waitForTimeout(5200);
  comparison = await audit();
  expect(
    Math.max(
      ...comparison.a.target.map((v, i) =>
        Math.abs(v - comparison.b.target[i]),
      ),
    ),
  ).toBeLessThan(0.04);
  expect(
    Math.max(
      ...comparison.a.camera.map((v, i) =>
        Math.abs(v - comparison.b.camera[i]),
      ),
    ),
  ).toBeLessThan(0.04);
  await screenshot(page, {
    path: `${root}/GB300-Ironwood-4D-comparison.png`,
    fullPage: true,
  });
  await page
    .getByLabel("Explorer experience")
    .selectOption("Assembly Timeline");
  await page.getByLabel("Catalogue time").fill("250");
  await page.waitForTimeout(1200);
  await screenshot(page, {
    path: `${root}/AB-build-timeline-L6.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
  await writeEvidence(
    `${root}/native-verification.json`,
    JSON.stringify(
      {
        url,
        checkedAt: new Date().toISOString(),
        bundleSHA256: createHash("sha256")
          .update(await fs.readFile("dist/index.html"))
          .digest("hex"),
        results,
        comparison,
        deepSelected: "CAT-04/memory/2.1",
        errors,
        remote,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
