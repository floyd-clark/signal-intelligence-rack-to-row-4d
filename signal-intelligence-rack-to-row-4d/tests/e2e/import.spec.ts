import { audit, clickWorld } from "./hardware-helpers";
import { test, expect } from "@playwright/test";
test("real mesh picking, safe GLB mapping, replay roundtrip and tour", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator("canvas").waitFor();
  await page.waitForTimeout(1200);
  await page.getByLabel("Camera preset").selectOption("front");
  await page.waitForTimeout(1000);
  const initial = await audit(page);
  const bound = initial.hardware.owners["FS_CONCEPT/R1/tray-6"].bounds;
  await clickWorld(page, [0, (bound[1] + bound[4]) / 2, 1.065]);
  await expect(page.locator(".inspector h2")).toContainText("tray");
  await page.getByRole("button", { name: "Drill In" }).click();
  await expect(page.locator("h1")).toContainText("tray");
  await page.getByRole("button", { name: "← Back" }).click();
  await page
    .getByRole("button", { name: "Settings / Import Better Rack Model" })
    .click();
  await page
    .getByLabel("Local rack model")
    .setInputFiles("tests/fixtures/original-rack.glb");
  await expect(page.getByLabel("Asset mesh")).toContainText("fixture-rack");
  await page.getByLabel("Binding search").fill("cpu-1.1");
  await page.getByLabel("Bind component").selectOption("FS_CONCEPT/R1/cpu-1.1");
  await page
    .getByLabel("Model attribution")
    .fill("Signal Intelligence original QA fixture");
  await page
    .getByLabel("Model license")
    .fill("Original authored test geometry");
  await page
    .getByRole("button", { name: "Validate, preview & apply mapping" })
    .click();
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: "evidence/catalogue-v2/legacy-07-imported-model.png",
    fullPage: true,
  });
  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator(".inspector h2")).toContainText("cpu");
  await page
    .getByRole("button", { name: "Rack Catalogue 2.0", exact: true })
    .click();
  await page.getByRole("button", { name: "Return to 4D lab" }).click();
  await page.waitForTimeout(500);
  const restored = (await page.locator("canvas").boundingBox())!;
  await page.mouse.click(
    restored.x + restored.width / 2,
    restored.y + restored.height / 2,
  );
  await expect(page.locator(".inspector h2")).toContainText("cpu");
  await page
    .getByRole("button", { name: "Settings / Import Better Rack Model" })
    .click();
  await page
    .getByRole("button", { name: "Return to procedural geometry" })
    .click();
  await page
    .getByRole("button", { name: "investigation", exact: true })
    .click();
  await page.getByLabel("Incident preset").selectOption("INC-14");
  await page.getByRole("button", { name: "Inject simulated fault" }).click();
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  await page.getByLabel("Time scrubber").fill("300");
  const before = await page.locator(".metrics").innerText();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export replay", exact: true })
    .click();
  const download = await downloaded;
  await download.saveAs("evidence/catalogue-v2/legacy-roundtrip-scenario.json");
  await page
    .getByLabel("Import replay")
    .setInputFiles("evidence/catalogue-v2/legacy-roundtrip-scenario.json");
  await page.getByLabel("Time scrubber").fill("300");
  expect(await page.locator(".metrics").innerText()).toBe(before);
  await page.getByRole("button", { name: "▶ 6-minute tour" }).click();
  for (let i = 0; i < 7; i++) {
    if (
      await page
        .getByRole("button", { name: "Close ×", exact: true })
        .isVisible()
    )
      await page.getByRole("button", { name: "Close ×", exact: true }).click();
    await page.getByRole("button", { name: "Next chapter" }).click();
    await page.waitForTimeout(100);
  }
  await expect(page.locator(".demo")).toContainText("TPM release call");
  await page.getByRole("button", { name: "Next chapter" }).click();
  await expect(page.locator(".demo")).toContainText("Tour complete");
  await page.screenshot({
    path: "evidence/catalogue-v2/legacy-08-tour.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
