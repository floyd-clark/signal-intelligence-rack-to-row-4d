import { screenshot, writeEvidence } from "../../scripts/artifacts.mjs";
import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { audit, clickWorld } from "./hardware-helpers";
test("v2 actual hardware chain, layered memory picking, exact Back camera, layers and resize", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByLabel("Graphics quality").selectOption("Performance");
  await page.getByLabel("Search components").fill("FS_CONCEPT/R1/rack");
  await page.getByRole("treeitem").click();
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.getByLabel("Camera preset").selectOption("front");
  await page.waitForTimeout(1000);
  const first = await audit(page);
  const b = first.hardware.owners["FS_CONCEPT/R1/tray-6"].bounds;
  await clickWorld(page, [0, (b[1] + b[4]) / 2, 1.065]);
  await expect(page.locator(".inspector code")).toHaveText(
    "FS_CONCEPT/R1/tray-6",
  );
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.getByLabel("Search components").fill("");
  await page.getByLabel("Camera preset").selectOption("top");
  await page.waitForTimeout(1000);
  await clickWorld(page, [-2.3, 0.045, 1.25]);
  await expect(page.locator(".inspector code")).toHaveText(
    "FS_CONCEPT/R1/board-6",
  );
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.waitForTimeout(1000);
  await clickWorld(page, [-1.43, 0.12 + 0.184 * 0.68, 0.65]);
  await expect(page.locator(".inspector code")).toHaveText(
    "FS_CONCEPT/R1/accelerator-6.1",
  );
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.getByLabel("Camera preset").selectOption("isometric");
  await page.waitForTimeout(1000);
  await clickWorld(page, [-0.65, 0.205, 0.37]);
  await expect(page.locator(".inspector code")).toHaveText(
    "FS_CONCEPT/R1/hbm-6.1.1",
  );
  const previous = await audit(page);
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.waitForTimeout(1000);
  const deep = await audit(page);
  const owner = deep.hardware.owners["FS_CONCEPT/R1/hbm-6.1.1"];
  expect(owner.primitives).toBeGreaterThan(80);
  expect(owner.kind).toContain("layered");
  await clickWorld(page, [-0.65, 0.205, 0.37]);
  await expect(page.locator(".inspector")).toContainText("ECC");
  await page.getByRole("button", { name: "← Back" }).click();
  await page.waitForTimeout(1000);
  const back = await audit(page);
  expect(
    JSON.parse(
      (await page.locator(".app").getAttribute("data-render-state")) || "{}",
    ).focus,
  ).toBe("FS_CONCEPT/R1/accelerator-6.1");
  for (let i = 0; i < 3; i++)
    expect(
      Math.abs(back.hardware.camera[i] - previous.hardware.camera[i]),
    ).toBeLessThan(0.06);
  await page.getByRole("button", { name: "Collapse panels" }).click();
  await expect
    .poll(async () => (await page.locator("canvas").boundingBox())!.width)
    .toBeGreaterThan(1400);
  await page.getByRole("button", { name: "Show panels" }).click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator("canvas")).toBeVisible();
  await page
    .getByRole("button", { name: "Settings / Import Better Rack Model" })
    .click();
  await page.getByText("Reduced motion", { exact: false }).click();
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  await expect(page.locator(".app")).toHaveClass(/reduced/);
  expect(errors).toEqual([]);
  await writeEvidence(
    "evidence/v2/interaction-regression.json",
    JSON.stringify(
      {
        passed: true,
        assertions: [
          "real rack/tray/board/accelerator/HBM raycast chain",
          "correct stable IDs and diagnostic card",
          "HBM complex layered geometry >80 owned primitives",
          "decorative merged triangles resolve to HBM owner",
          "Back restores context and camera within 0.06 scene units",
          "collapsible canvas >1400 px at 1600 viewport",
          "resize and reduced motion",
        ],
        errors,
      },
      null,
      2,
    ),
  );
});
