import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const native = process.env.NATIVE_GPU === "1";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: native
    ? ["--use-angle=d3d11"]
    : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
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
const manifest = {},
  metrics = {};
async function shot(name) {
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `evidence/v2/${name}.png`, fullPage: true });
  manifest[name] = {
    ...JSON.parse(await page.locator(".app").getAttribute("data-render-state")),
    viewport: [1920, 1080],
    fovDegrees: 38,
    assetSource: "original procedural geometry in src/scene/hardware",
    build: "v2 local production",
  };
  console.log("Captured " + name);
}
async function audit() {
  await page.locator("footer button").click();
  const a = JSON.parse(await page.locator(".modal pre").innerText());
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  return a;
}
async function sample(scope) {
  await page.waitForTimeout(5200);
  const a = await audit();
  const v = a.fpsSamples.slice(-5).sort((x, y) => x - y);
  metrics[scope] = {
    fpsSamples: a.fpsSamples.slice(-5),
    fpsMin: v[0],
    fpsMedian: v[Math.floor(v.length / 2)],
    fpsMax: v.at(-1),
    drawCalls: a.drawCalls,
    triangles: a.triangles,
    geometries: a.geometries,
    materials: a.materials,
    textures: a.textures,
    renderer: a.renderer,
    dpr: a.dpr,
    quality: a.quality,
    ownerCount: Object.keys(a.hardware.owners).length,
    settings: JSON.parse(
      await page.locator(".app").getAttribute("data-render-state"),
    ),
  };
}
async function drill(id) {
  if (
    await page
      .getByRole("button", { name: "Show panels", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Show panels", exact: true })
      .click();
  await page.getByLabel("Search components").fill(id);
  await page.getByRole("treeitem").first().click();
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.getByRole("button", { name: "Collapse panels" }).click();
}
await page.goto("http://127.0.0.1:4173");
await page.locator("canvas").waitFor();
await page.getByRole("button", { name: "Collapse panels" }).click();
await shot("rack-front-hero");
await sample("rack-balanced");
await page.getByLabel("Camera preset").selectOption("orthographic");
await shot("rack-front-orthographic");
await page.getByLabel("Camera preset").selectOption("rear-service");
await shot("rack-rear-service");
await page.getByRole("button", { name: "Explode", exact: true }).click();
await shot("rack-selected-tray-extracted");
await page.getByRole("button", { name: "Explode", exact: true }).click();
await page.getByLabel("Camera preset").selectOption("isometric");
await drill("FS_CONCEPT/R1/tray-1");
await shot("compute-tray-isolated");
await drill("FS_CONCEPT/R1/board-1");
await page.getByLabel("Camera preset").selectOption("top");
await shot("compute-board-inspection");
await page.getByLabel("Camera preset").selectOption("isometric");
await drill("FS_CONCEPT/R1/accelerator-1.1");
await shot("accelerator-package");
await drill("FS_CONCEPT/R1/hbm-1.1.1");
await shot("hbm-closeup");
await sample("hbm-balanced");
await page.getByLabel("Camera preset").selectOption("front");
await shot("hbm-closeup-alternate");
await page.getByLabel("Camera preset").selectOption("isometric");
await page.getByRole("button", { name: "Explode", exact: true }).click();
await shot("hbm-exploded-cutaway");
await page.getByRole("button", { name: "Explode", exact: true }).click();
await page.getByRole("button", { name: "Show panels" }).click();
await page.getByLabel("Search components").fill("");
await page.getByRole("button", { name: "Row overview", exact: true }).click();
await page.getByRole("button", { name: "Collapse panels" }).click();
await shot("row-cold-aisle");
await sample("row-balanced");
await page.getByLabel("Graphics quality").selectOption("Performance");
await sample("row-performance");
await page.getByLabel("Graphics quality").selectOption("Balanced");
await page.getByLabel("Camera preset").selectOption("rear-service");
await shot("row-rear-service");
await page.getByRole("button", { name: "Show panels" }).click();
await page.getByRole("button", { name: "investigation", exact: true }).click();
await page.getByLabel("Incident preset").selectOption("INC-10");
await page.getByRole("button", { name: "Inject simulated fault" }).click();
await page.getByRole("button", { name: "Ⅱ Pause" }).click();
await page.getByLabel("Time scrubber").fill("15");
await shot("row-cooling-fault-t15");
await page.getByLabel("Time scrubber").fill("500");
await shot("row-cooling-fault-t500");
await page
  .getByRole("button", { name: "Show panels" })
  .click()
  .catch(() => {});
await page
  .getByLabel("Architecture profile")
  .selectOption("NVIDIA_GB200_NVL72_REFERENCE");
await page.getByLabel("Explorer experience").selectOption("Inspect");
await page.getByLabel("Camera preset").selectOption("isometric");
await page.getByRole("button", { name: "Collapse panels" }).click();
await shot("profile-nvidia");
await page.getByRole("button", { name: "Show panels" }).click();
await page.locator(".overlays").getByRole("button", { name: /Power/ }).click();
await page.getByRole("button", { name: "Collapse panels" }).click();
await shot("power-network-layer");
await page.getByRole("button", { name: "Show panels" }).click();
await page
  .getByLabel("Architecture profile")
  .selectOption("GOOGLE_IRONWOOD_TPU_REFERENCE");
await page.getByLabel("Camera preset").selectOption("graph");
await page.getByRole("button", { name: "Collapse panels" }).click();
await shot("profile-ironwood");
await fs.writeFile(
  native
    ? "evidence/v2/native-visual-metrics.json"
    : "evidence/v2/visual-metrics.json",
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      viewport: [1920, 1080],
      browser: native
        ? "Installed Chrome, ANGLE D3D11; actual adapter recorded per scope"
        : "Installed Chrome, SwiftShader forced for reproducible software rendering; not hardware GPU performance",
      runtimeRemoteRequests: remote,
      errors,
      scopes: metrics,
      screenshots: manifest,
      notes: [
        "FPS distributions are five short one-second samples, not a long-duration benchmark",
        "t15 is 15 seconds, t500 is 500 seconds; the unchanged simulation horizon is 600 seconds",
        "No vendor photos or remote textures are runtime assets",
      ],
    },
    null,
    2,
  ),
);
await browser.close();
if (errors.length || remote.length)
  throw Error(JSON.stringify({ errors, remote }));
