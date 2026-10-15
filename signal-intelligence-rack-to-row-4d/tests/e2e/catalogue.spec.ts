import { test, expect, type Page } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
import fs from "node:fs/promises";
test("gallery images, generation delta, corresponding concepts, keyboard and fallback remain usable", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Catalogue", exact: true }).click();
  await expect(page.locator(".cat-card")).toHaveCount(10);
  await expect
    .poll(() =>
      page
        .locator(".cat-thumb img")
        .evaluateAll((images) =>
          images.every(
            (i) =>
              (i as HTMLImageElement).complete &&
              (i as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.getByLabel("Search catalogue", { exact: true }).fill("UALink");
  await expect(page.locator(".cat-card")).toHaveCount(1);
  await page.getByLabel("Search catalogue", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "Architecture studio", exact: true })
    .click();
  await page.getByLabel("Generation A", { exact: true }).selectOption("rubin");
  await expect(page.locator(".cat-inspector h2")).toHaveText(
    "NVIDIA Vera Rubin NVL72",
  );
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await expect(page.locator(".cat-inspector")).toContainText(
    "Power shelves: 4 shelf",
  );
  await expect(page.locator(".cat-inspector")).toContainText("DC output: 54 V");
  await page.getByRole("button", { name: "Explain", exact: true }).click();
  await page
    .locator(".cat-flowbar")
    .getByRole("button", { name: "memory", exact: true })
    .click();
  await expect(page.getByTestId("catalogue")).toHaveAttribute(
    "data-focus",
    "chip",
  );
  await page.getByRole("button", { name: "Hide engineering panel" }).click();
  await expect
    .poll(
      async () =>
        (await page.locator(".cat-canvas canvas").boundingBox())!.width,
    )
    .toBeGreaterThan(1400);
  await page.getByRole("button", { name: "Show engineering panel" }).click();
  await page.getByLabel("2D fallback", { exact: true }).check();
  await expect(page.locator(".cat-canvas canvas")).toHaveCount(0);
  await page.locator(".cat-fallback button").first().click();
  await expect(page.getByTestId("catalogue-selected")).toHaveText(
    "CAT-04/rack",
  );
  await page.getByLabel("2D fallback", { exact: true }).uncheck();
  await page.getByLabel("Architecture A", { exact: true }).focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByLabel("Architecture A", { exact: true })).toHaveValue(
    "CAT-03",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator("header")).toBeVisible();
});
async function open(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Rack Catalogue 2.0", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Architecture studio", exact: true })
    .click();
  await page.getByLabel("Catalogue quality").selectOption("Performance");
}
async function audit(page: Page) {
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  await expect
    .poll(async () => {
      const a = JSON.parse(
        await page.getByTestId("catalogue-audit").innerText(),
      );
      return !!a.a?.camera;
    })
    .toBe(true);
  const a = JSON.parse(await page.getByTestId("catalogue-audit").innerText());
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  return a;
}
async function clickWorld(page: Page, side: "a" | "b", point: number[]) {
  const info = (await audit(page))[side];
  const box = (await page
    .locator(`.cat-canvas[data-side="${side}"] canvas`)
    .boundingBox())!;
  const c = new PerspectiveCamera(38, box.width / box.height, 0.01, 100);
  c.position.fromArray(info.camera);
  c.lookAt(new Vector3(...(info.target as [number, number, number])));
  c.updateMatrixWorld();
  const p = new Vector3(...(point as [number, number, number])).project(c);
  await page.mouse.click(
    box.x + ((p.x + 1) * box.width) / 2,
    box.y + ((1 - p.y) * box.height) / 2,
  );
}
test("all ten families retain real front/rear picking, accessible IDs, detailed carriers and offline runtime", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [],
    remote: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) => {
    const u = r.request().url();
    if (
      u.startsWith("http://127.0.0.1") ||
      u.startsWith("data:") ||
      u.startsWith("blob:")
    )
      return r.continue();
    remote.push(u);
    return r.abort();
  });
  await open(page);
  await page.getByRole("button", { name: "CAD cutaway", exact: true }).click();
  const results = [];
  const rear: Record<string, { point: number[]; id: string }> = {
    "CAT-01": { point: [-0.54, 2, -1.3], id: "power/1" },
    "CAT-02": { point: [0, 2.1, -1.39], id: "power/1" },
    "CAT-03": { point: [-0.5, 0.4, -1.4], id: "network" },
    "CAT-04": { point: [-0.12, 2.1, -1.31], id: "power/1" },
    "CAT-05": { point: [-0.93, 2.15, -1.6], id: "fabric/1" },
    "CAT-06": { point: [-0.72, 3.9, -1.34], id: "cooling" },
    "CAT-07": { point: [0, 4.63, -1.45], id: "network" },
    "CAT-08": { point: [1.2, 1.8, -0.83], id: "cooling" },
    "CAT-09": { point: [-0.85, 3.4, -1.625], id: "cooling" },
    "CAT-10": { point: [1.5, 1.8, -0.83], id: "cooling" },
  };
  for (let i = 1; i <= 10; i++) {
    const id = `CAT-${String(i).padStart(2, "0")}`;
    await page.getByLabel("Architecture A", { exact: true }).selectOption(id);
    await page.getByLabel("Catalogue camera").selectOption("front");
    await page.waitForTimeout(1100);
    const data = (await audit(page)).a;
    expect(data.family).toBe(id);
    const bounds = data.owners[`${id}/tray/1`].bounds;
    const y =
      (bounds[1] + bounds[4]) / 2 + (i === 10 ? 0.22 : i === 9 ? 0.65 : 0);
    await clickWorld(page, "a", [
      (bounds[0] + bounds[3]) / 2,
      y,
      bounds[5] + 0.02,
    ]);
    await expect(page.getByTestId("catalogue-selected")).toHaveText(
      `${id}/tray/1`,
    );
    await page.getByLabel("Catalogue camera").selectOption("rear");
    await page.waitForTimeout(1100);
    await clickWorld(page, "a", rear[id].point);
    await expect(page.getByTestId("catalogue-selected")).toHaveText(
      `${id}/${rear[id].id}`,
    );
    await page.getByRole("button", { name: "Tray", exact: true }).click();
    await expect(page.getByTestId("catalogue")).toHaveAttribute(
      "data-focus",
      "tray",
    );
    await page.waitForTimeout(500);
    expect((await audit(page)).a.triangles).toBeGreaterThan(500);
    await page.getByRole("button", { name: "Rack", exact: true }).click();
    results.push({
      id,
      frontPick: `${id}/tray/1`,
      rearPick: `${id}/${rear[id].id}`,
    });
  }
  expect(errors).toEqual([]);
  expect(remote).toEqual([]);
  await fs.writeFile(
    "evidence/catalogue-v2/picking-offline.json",
    JSON.stringify({ passed: true, results, errors, remote }, null, 2),
  );
});
test("A/B synchronized orbit, independent overlays, selection, deterministic failure/replay and NPI", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", { name: "A/B comparison", exact: true })
    .click();
  await page
    .getByLabel("Architecture A", { exact: true })
    .selectOption("CAT-04");
  await page
    .getByLabel("Architecture B", { exact: true })
    .selectOption("CAT-05");
  await page.getByLabel("Catalogue camera").selectOption("front");
  await page.waitForTimeout(1200);
  const canvas = page.locator('.cat-canvas[data-side="a"] canvas');
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width * 0.6 + 100,
    box.y + box.height * 0.4 + 40,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.waitForTimeout(700);
  const after = await audit(page);
  for (let j = 0; j < 3; j++)
    expect(Math.abs(after.a.camera[j] - after.b.camera[j])).toBeLessThan(0.04);
  await page.getByLabel("Overlay A", { exact: true }).selectOption("Cooling");
  await expect(page.getByLabel("Overlay B", { exact: true })).toHaveValue(
    "Cooling",
  );
  await page.getByLabel("Linked overlays").uncheck();
  await page.getByLabel("Overlay B", { exact: true }).selectOption("Network");
  await expect(page.getByLabel("Overlay A", { exact: true })).toHaveValue(
    "Cooling",
  );
  await page.getByRole("button", { name: "Investigate", exact: true }).click();
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByLabel("Catalogue time").fill("8");
  await expect(page.locator(".cat-telemetry")).toContainText("48.0 °C");
  await page.getByLabel("Catalogue time").fill("180");
  await expect(page.locator(".cat-inspector")).toContainText("27 affected");
  await page.getByLabel("Catalogue time").fill("0");
  await expect(page.locator(".cat-telemetry")).toContainText("100.0%");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export catalogue replay", exact: true })
    .click();
  const path = await (await download).path();
  await page
    .getByLabel("Import catalogue replay", { exact: true })
    .setInputFiles(path!);
  await expect(page.getByRole("status")).toContainText("Replay loaded");
  await page.getByRole("button", { name: "NPI", exact: true }).click();
  await page.getByLabel("Catalogue assembly level").fill("2");
  await page.waitForTimeout(1100);
  expect(
    Object.keys((await audit(page)).a.owners).every(
      (id) => !id.includes("/tray/"),
    ),
  ).toBe(true);
  await page.getByLabel("Catalogue assembly level").fill("12");
  await page.getByRole("button", { name: "Return to 4D lab" }).click();
  await expect(page.getByLabel("Architecture profile")).toHaveValue(
    "FS_CONCEPT",
  );
});
test("all twenty scenario demonstrations change the correct synthetic state and restore on rewind", async ({
  page,
}) => {
  test.setTimeout(180000);
  await open(page);
  await page.getByRole("button", { name: "Investigate", exact: true }).click();
  const results = [];
  for (let i = 1; i <= 10; i++) {
    const id = `CAT-${String(i).padStart(2, "0")}`;
    await page.getByLabel("Architecture A", { exact: true }).selectOption(id);
    for (let fault = 1; fault <= 2; fault++) {
      await page.getByLabel("Catalogue time").fill("0");
      await page.getByLabel("Catalogue fault").selectOption(`${id}-${fault}`);
      await page.getByLabel("Catalogue time").fill("180");
      await expect(page.locator(".cat-inspector")).toContainText("Scope:");
      results.push({
        family: id,
        fault: `${id}-${fault}`,
        t180: await page.locator(".cat-telemetry").innerText(),
      });
      await page.getByLabel("Catalogue time").fill("0");
      await expect(page.locator(".cat-telemetry")).toContainText("100.0%");
    }
  }
  await fs.writeFile(
    "evidence/catalogue-v2/scenario-regression.json",
    JSON.stringify({ passed: true, scenarios: results }, null, 2),
  );
});
