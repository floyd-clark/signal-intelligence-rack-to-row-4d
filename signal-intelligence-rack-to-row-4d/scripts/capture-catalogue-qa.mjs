import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "evidence/catalogue-v2";
await fs.mkdir("public/catalogue-thumbs", { recursive: true });
await fs.mkdir("dist/catalogue-thumbs", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [],
  remote = [],
  metrics = {},
  manifest = {};
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
  .getByRole("button", { name: "Rack Catalogue 2.0", exact: true })
  .click();
await page
  .getByRole("button", { name: "Architecture studio", exact: true })
  .click();
async function audit() {
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  await expect
    .poll(
      async () =>
        !!JSON.parse(await page.getByTestId("catalogue-audit").innerText()).a
          ?.camera,
    )
    .toBe(true);
  const a = JSON.parse(await page.getByTestId("catalogue-audit").innerText());
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  return a;
}
async function shot(name) {
  await page.waitForTimeout(750);
  await page.screenshot({ path: `${root}/${name}.png`, fullPage: true });
  manifest[name] = {
    viewport: [1920, 1080],
    a: await page.getByTestId("catalogue").getAttribute("data-family-a"),
    b: await page.getByTestId("catalogue").getAttribute("data-family-b"),
    view: await page.getByTestId("catalogue").getAttribute("data-focus"),
    time: await page.getByTestId("catalogue").getAttribute("data-time"),
    camera: await page.getByLabel("Catalogue camera").inputValue(),
    quality: await page.getByLabel("Catalogue quality").inputValue(),
    source: "actual Chromium; original procedural scene",
  };
}
for (let i = 1; i <= 10; i++) {
  const id = `CAT-${String(i).padStart(2, "0")}`;
  await page.getByLabel("Architecture A", { exact: true }).selectOption(id);
  await page.getByLabel("Catalogue camera").selectOption("oblique");
  await page.getByRole("button", { name: "Rack", exact: true }).click();
  await shot(`${id}-hero`);
  // Actual renderer previews, never vendor photography or generated mockups.
  await page
    .locator(".cat-canvas canvas")
    .screenshot({ path: `public/catalogue-thumbs/${id}.png` });
  await fs.copyFile(
    `public/catalogue-thumbs/${id}.png`,
    `dist/catalogue-thumbs/${id}.png`,
  );
  await page.waitForTimeout(5400);
  const m = (await audit()).a;
  const samples = m.fpsSamples.slice(-5),
    sorted = [...samples].sort((a, b) => a - b);
  metrics[id] = {
    family: m.family,
    renderer: m.renderer,
    fpsSamples: samples,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted.at(-1),
    drawCalls: m.drawCalls,
    triangles: m.renderTriangles,
    geometries: m.geometries,
    textures: m.textures,
    ownerCount: Object.keys(m.owners).length,
    bounds: m.owners[`${id}/rack`]?.bounds,
  };
  await page.getByLabel("Catalogue camera").selectOption("front");
  await shot(`${id}-front`);
  await page.getByLabel("Catalogue camera").selectOption("rear");
  await shot(`${id}-rear`);
  await page.getByLabel("Catalogue explosion").fill("1");
  await shot(`${id}-exploded`);
  await page.getByLabel("Catalogue explosion").fill("0");
  await page.getByRole("button", { name: "CAD cutaway", exact: true }).click();
  await page.getByLabel("Catalogue camera").selectOption("oblique");
  await page.getByRole("button", { name: "Tray", exact: true }).click();
  await shot(`${id}-tray`);
  await page.getByRole("button", { name: "Chip / wafer", exact: true }).click();
  await shot(`${id}-chip`);
  await page.getByRole("button", { name: "Topology", exact: true }).click();
  await shot(`${id}-topology`);
  await page.getByRole("button", { name: "Rack", exact: true }).click();
  await page.getByRole("button", { name: "CAD cutaway", exact: true }).click();
  await page.getByRole("button", { name: "Investigate", exact: true }).click();
  await page.getByLabel("Catalogue time").fill("0");
  await page.getByLabel("Catalogue fault").selectOption(`${id}-1`);
  await shot(`${id}-fault-t0`);
  await page.getByLabel("Catalogue time").fill("180");
  await shot(`${id}-fault-t180`);
  await page.getByLabel("Catalogue time").fill("0");
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  console.log(
    `Captured ${id}: ${metrics[id].median} FPS, ${metrics[id].triangles} triangles`,
  );
}
await page.getByRole("button", { name: "A/B comparison", exact: true }).click();
for (const [a, b] of [
  ["CAT-04", "CAT-05"],
  ["CAT-04", "CAT-06"],
  ["CAT-01", "CAT-02"],
  ["CAT-03", "CAT-04"],
  ["CAT-09", "CAT-10"],
]) {
  await page.getByLabel("Architecture A", { exact: true }).selectOption(a);
  await page.getByLabel("Architecture B", { exact: true }).selectOption(b);
  await page.getByLabel("Catalogue camera").selectOption("oblique");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await shot(`compare-${a}-${b}`);
}
await page.getByLabel("Architecture A", { exact: true }).selectOption("CAT-04");
await page.getByLabel("Architecture B", { exact: true }).selectOption("CAT-05");
await page.getByLabel("Catalogue camera").selectOption("rear");
await page.getByLabel("Overlay A", { exact: true }).selectOption("Cooling");
await page.waitForTimeout(5500);
metrics.comparison = await audit();
await shot("comparison-cooling");
const dl = page.waitForEvent("download");
await page.getByRole("button", { name: "Export 4K hardware" }).click();
const path = await (await dl).path();
const png = await fs.readFile(path);
expect(png.readUInt32BE(16)).toBe(3840);
expect(png.readUInt32BE(20)).toBe(2160);
await fs.writeFile(`${root}/comparison-4k.png`, png);
// Repeat the same family cycles. GPU object counts are bounded evidence, not GPU-byte leak proof.
await page
  .getByRole("button", { name: "Architecture studio", exact: true })
  .click();
const disposal = [];
for (let cycle = 0; cycle < 2; cycle++)
  for (let i = 1; i <= 10; i++) {
    const id = `CAT-${String(i).padStart(2, "0")}`;
    await page.getByLabel("Architecture A", { exact: true }).selectOption(id);
    await page.waitForTimeout(1050);
    const a = (await audit()).a;
    disposal.push({
      cycle,
      family: id,
      geometries: a.geometries,
      textures: a.textures,
    });
  }
await page.getByRole("button", { name: "Catalogue", exact: true }).click();
await page.screenshot({ path: `${root}/gallery.png`, fullPage: true });
const hashes = {};
for (let i = 1; i <= 10; i++) {
  const id = `CAT-${String(i).padStart(2, "0")}`;
  hashes[id] = createHash("sha256")
    .update(await fs.readFile(`public/catalogue-thumbs/${id}.png`))
    .digest("hex");
}
expect(new Set(Object.values(hashes)).size).toBe(10);
expect(errors).toEqual([]);
expect(remote).toEqual([]);
await fs.writeFile(
  `${root}/visual-metrics.json`,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      browser:
        "Installed Chrome; ANGLE D3D11 requested, actual renderer recorded",
      viewport: [1920, 1080],
      quality: "Balanced",
      metrics,
      disposal,
      hashes,
      manifest,
      errors,
      remote,
      notes: [
        "Five short one-second native samples, not universal FPS or long-duration stress test",
        "Distinct hashes supplement semantic geometry tests and developer inspection; user reports >=90/100 for all ten base families (human-review.json)",
        "Draw calls/triangles per canvas; comparison totals require both sides",
        "GPU object counts are not byte-level memory profiling",
      ],
    },
    null,
    2,
  ),
);
await browser.close();
