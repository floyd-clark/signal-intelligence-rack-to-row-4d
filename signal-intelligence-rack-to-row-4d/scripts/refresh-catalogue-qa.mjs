import { chromium, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const root = "evidence/catalogue-v2";
const output = JSON.parse(
  await fs.readFile(`${root}/visual-metrics.json`, "utf8"),
);
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [],
  remote = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.route("**/*", (r) => {
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
await p.goto("http://127.0.0.1:4173");
await p
  .getByRole("button", { name: "Rack Catalogue 2.0", exact: true })
  .click();
await p
  .getByRole("button", { name: "Architecture studio", exact: true })
  .click();
async function shot(name) {
  await p.waitForTimeout(750);
  await p.screenshot({ path: `${root}/${name}.png`, fullPage: true });
  output.manifest[name] = {
    viewport: [1920, 1080],
    a: await p.getByTestId("catalogue").getAttribute("data-family-a"),
    b: await p.getByTestId("catalogue").getAttribute("data-family-b"),
    view: await p.getByTestId("catalogue").getAttribute("data-focus"),
    time: await p.getByTestId("catalogue").getAttribute("data-time"),
    camera: (await p.getByLabel("Catalogue camera").count())
      ? await p.getByLabel("Catalogue camera").inputValue()
      : null,
    quality: (await p.getByLabel("Catalogue quality").count())
      ? await p.getByLabel("Catalogue quality").inputValue()
      : null,
    source: "actual Chromium; original procedural scene",
    refreshedAt: new Date().toISOString(),
  };
}
async function audit() {
  await p.getByRole("button", { name: "Catalogue render audit" }).click();
  const v = JSON.parse(await p.getByTestId("catalogue-audit").innerText());
  await p.getByRole("button", { name: "Catalogue render audit" }).click();
  return v;
}
for (let i = 1; i <= 10; i++) {
  const id = `CAT-${String(i).padStart(2, "0")}`;
  await p.getByLabel("Architecture A", { exact: true }).selectOption(id);
  await p
    .locator(".cat-flowbar")
    .getByRole("button", { name: "compute", exact: true })
    .click();
  await p.getByLabel("Catalogue camera").selectOption("oblique");
  if (i === 10) {
    await shot(`${id}-hero`);
    await p
      .locator(".cat-canvas canvas")
      .screenshot({ path: `public/catalogue-thumbs/${id}.png` });
    await fs.copyFile(
      `public/catalogue-thumbs/${id}.png`,
      `dist/catalogue-thumbs/${id}.png`,
    );
    await p.waitForTimeout(5200);
    const m = (await audit()).a;
    const samples = m.fpsSamples.slice(-5),
      v = [...samples].sort((a, b) => a - b);
    output.metrics[id] = {
      family: m.family,
      renderer: m.renderer,
      fpsSamples: samples,
      min: v[0],
      median: v[2],
      max: v.at(-1),
      drawCalls: m.drawCalls,
      triangles: m.renderTriangles,
      geometries: m.geometries,
      textures: m.textures,
      ownerCount: Object.keys(m.owners).length,
      bounds: m.owners[`${id}/rack`].bounds,
    };
    await p.getByLabel("Catalogue camera").selectOption("front");
    await shot(`${id}-front`);
    await p.getByLabel("Catalogue camera").selectOption("rear");
    await shot(`${id}-rear`);
    await p.getByLabel("Catalogue explosion").fill("1");
    await shot(`${id}-exploded`);
    await p.getByLabel("Catalogue explosion").fill("0");
    await p.getByLabel("Catalogue camera").selectOption("oblique");
  }
  await p.getByRole("button", { name: "Investigate", exact: true }).click();
  await p.getByLabel("Catalogue time").fill("0");
  await p.getByLabel("Catalogue fault").selectOption(`${id}-1`);
  await shot(`${id}-fault-t0`);
  await p.getByLabel("Catalogue time").fill("180");
  await shot(`${id}-fault-t180`);
  await p.getByLabel("Catalogue time").fill("0");
  await p.getByRole("button", { name: "Explain", exact: true }).click();
  const concept =
    i <= 2
      ? "power"
      : i <= 5
        ? "memory"
        : i <= 7
          ? "network"
          : i === 8 || i === 10
            ? "cooling"
            : "compute";
  await p
    .locator(".cat-flowbar")
    .getByRole("button", { name: concept, exact: true })
    .click();
  if (i === 9)
    await p.getByRole("button", { name: "Chip / wafer", exact: true }).click();
  await shot(`${id}-defining`);
  await p.getByRole("button", { name: "Rack", exact: true }).click();
  await p.getByRole("button", { name: "Row", exact: true }).click();
  await shot(`${id}-row`);
  await p.getByRole("button", { name: "Rack", exact: true }).click();
  console.log(`Refreshed ${id} physical fault and defining component`);
}
await p.getByLabel("Architecture A", { exact: true }).selectOption("CAT-04");
await p
  .locator(".cat-flowbar")
  .getByRole("button", { name: "compute", exact: true })
  .click();
await p.getByLabel("Generation A", { exact: true }).selectOption("rubin");
await shot("rubin-generation-rack");
await p.getByRole("button", { name: "CAD cutaway", exact: true }).click();
await p.getByRole("button", { name: "Tray", exact: true }).click();
await shot("rubin-two-board-tray");
await p.getByRole("button", { name: "Rack", exact: true }).click();
await p.getByRole("button", { name: "CAD cutaway", exact: true }).click();
await p.getByRole("button", { name: "A/B comparison", exact: true }).click();
await p.getByLabel("Architecture B", { exact: true }).selectOption("CAT-04");
await p.getByLabel("Generation A", { exact: true }).selectOption("");
await p.getByLabel("Generation B", { exact: true }).selectOption("rubin");
await shot("compare-gb300-rubin-delta");
await p.getByRole("button", { name: "Compare", exact: true }).click();
for (const [a, b] of [
  ["CAT-04", "CAT-05"],
  ["CAT-04", "CAT-06"],
  ["CAT-01", "CAT-02"],
  ["CAT-03", "CAT-04"],
  ["CAT-09", "CAT-10"],
]) {
  await p.getByLabel("Architecture A", { exact: true }).selectOption(a);
  await p.getByLabel("Architecture B", { exact: true }).selectOption(b);
  if (b === "CAT-04")
    await p.getByLabel("Generation B", { exact: true }).selectOption("");
  await p
    .locator(".cat-flowbar")
    .getByRole("button", { name: "compute", exact: true })
    .click();
  await p.getByRole("button", { name: "Rack", exact: true }).click();
  await p.getByLabel("Catalogue camera").selectOption("oblique");
  await shot(`compare-${a}-${b}`);
}
await p.getByRole("button", { name: "Catalogue", exact: true }).click();
await shot("gallery");
output.refreshedAt = new Date().toISOString();
output.notes = output.notes.map((n) =>
  n.includes("human visual scores remain pending")
    ? "Distinct hashes supplement semantic geometry tests and developer inspection; user reports >=90/100 for all ten base families (human-review.json)"
    : n,
);
output.refreshNotes = [
  "Final sealed Cray front, corresponding component inspection, scoped fabric highlights and optional-liquid baseline refreshed",
  "Rubin generation has four taller shelves, two-board carrier and sourced 54V busbar",
  "Other base geometry and performance counts unchanged from full capture",
  "Base family user review >=90/100 recorded; child Rubin remains unscored",
];
output.hashes["CAT-10"] = createHash("sha256")
  .update(await fs.readFile("public/catalogue-thumbs/CAT-10.png"))
  .digest("hex");
output.errors.push(...errors);
output.remote.push(...remote);
await fs.writeFile(
  `${root}/visual-metrics.json`,
  JSON.stringify(output, null, 2),
);
expect(errors).toEqual([]);
expect(remote).toEqual([]);
await b.close();
