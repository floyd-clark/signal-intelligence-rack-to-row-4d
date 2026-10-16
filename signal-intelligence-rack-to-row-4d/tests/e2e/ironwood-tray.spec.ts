import { screenshot, writeEvidence } from "../../scripts/artifacts.mjs";
import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { audit, clickWorld } from "./hardware-helpers";

test("Ironwood tray exposes four physical TPU packages with stable diagnostics", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByLabel("Architecture profile")
    .selectOption("GOOGLE_IRONWOOD_TPU_REFERENCE");
  await page.getByLabel("Graphics quality").selectOption("Performance");
  await page
    .getByLabel("Search components")
    .fill("GOOGLE_IRONWOOD_TPU_REFERENCE/R1/tray-1");
  await page.getByRole("treeitem").first().click();
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.getByLabel("Camera preset").selectOption("top");
  await page.waitForTimeout(1200);
  const rendered = await audit(page);
  const selected = [];
  for (let i = 0; i < 4; i++) {
    const id = `GOOGLE_IRONWOOD_TPU_REFERENCE/R1/accelerator-1.${i + 1}`;
    expect(rendered.hardware.owners[id].kind).toContain(
      "Ironwood TPU: two chiplets",
    );
    await clickWorld(page, [
      i % 2 ? 1.43 : -1.43,
      0.12 + 0.184 * 0.68 - 0.04,
      Math.floor(i / 2) ? -0.85 : 0.65,
    ]);
    await expect(page.locator(".inspector code")).toHaveText(id);
    await expect(page.locator(".inspector")).toContainText("Ironwood TPU");
    selected.push(id);
  }
  await page.getByRole("button", { name: "Collapse panels" }).click();
  await page.waitForTimeout(500);
  await page.getByLabel("Camera preset").selectOption("isometric");
  await page.getByRole("button", { name: "Show panels" }).click();
  await page.getByRole("button", { name: "Drill In" }).click();
  expect((await audit(page)).hardware.owners[selected[3]].kind).toContain(
    "Ironwood TPU: two chiplets",
  );
  expect(errors).toEqual([]);
  await writeEvidence(
    "evidence/v2/ironwood-tray-regression.json",
    JSON.stringify(
      {
        passed: true,
        physicalPicks: selected,
        dualChipletInspection: true,
        errors,
      },
      null,
      2,
    ),
  );
});
