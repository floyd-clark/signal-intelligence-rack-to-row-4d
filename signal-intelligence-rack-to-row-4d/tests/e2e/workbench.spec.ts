import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
async function open(page: Page) {
  await page.goto("/?catalogue=1");
  await page.getByRole("button", { name: "4D workspace", exact: true }).click();
  await page.getByLabel("Catalogue quality").selectOption("Performance");
}
async function audit(page: Page) {
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
test("all catalogue cards enter the full 4D workbench and retain arbitrary-tray inspection", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  for (let i = 0; i < 10; i++) {
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await page
      .locator(".cat-card")
      .nth(i)
      .getByRole("button", { name: "Open 4D workspace →", exact: true })
      .click();
    await expect(page.getByTestId("4d-workbench")).toBeVisible();
    await expect(
      page.locator(".cat-workbench-rail .overlays button"),
    ).toHaveCount(8);
    await expect(
      page.getByRole("heading", { name: "What is it?", exact: true }),
    ).toBeVisible();
    const id = `CAT-${String(i + 1).padStart(2, "0")}`;
    await expect(page.getByTestId("catalogue-selected")).toHaveText(
      `${id}/rack`,
    );
    await page
      .getByLabel("Search components", { exact: true })
      .fill(`${id}/tray/2`);
    await page
      .getByRole("tree", { name: "Accessible component tree" })
      .getByRole("treeitem")
      .first()
      .dblclick();
    await expect(page.getByTestId("catalogue")).toHaveAttribute(
      "data-focus",
      "tray",
    );
    await expect
      .poll(async () => !!(await audit(page)).a.owners[`${id}/tray/2`])
      .toBe(true);
    await page.getByRole("button", { name: "← Back", exact: true }).click();
    await expect(page.getByTestId("catalogue")).toHaveAttribute(
      "data-focus",
      "rack",
    );
    await page.getByLabel("Search components", { exact: true }).fill("");
  }
  expect(errors).toEqual([]);
});
test("shared runtime/build timeline, A/B evidence isolation and complete incident export", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Tray", exact: true }).click();
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  await page
    .getByRole("button", { name: "A/B comparison", exact: true })
    .click();
  await expect
    .poll(async () => {
      const data = await audit(page);
      if (!data.b?.target) return Infinity;
      return Math.max(
        ...data.a.target.map((v: number, i: number) =>
          Math.abs(v - data.b.target[i]),
        ),
      );
    })
    .toBeLessThan(0.04);
  await expect
    .poll(async () => (await audit(page)).a.target[1])
    .toBeCloseTo(2.05, 2);
  await page.getByRole("button", { name: "4D workspace", exact: true }).click();
  await page.getByLabel("Explorer experience").selectOption("Diagnose");
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByLabel("Catalogue time").fill("180");
  await expect(page.getByRole("img", { name: /dieC in/ })).toBeVisible();
  const panel = page.locator(".cat-inspector");
  await panel.locator("input[type=checkbox]").nth(1).check();
  await panel.locator("input[type=checkbox]").nth(2).check();
  await page.getByLabel("Catalogue hypothesis").selectOption({ index: 1 });
  await page
    .getByRole("button", { name: "Record containment plan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply simulated recovery", exact: true })
    .click();
  await page.getByLabel("Catalogue time").fill("400");
  await expect(
    page.getByRole("button", { name: "Record release decision", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Record hold decision", exact: true })
    .click();
  await page
    .getByRole("button", { name: "A/B comparison", exact: true })
    .click();
  await page.getByLabel("Inspector side").selectOption("b");
  await page.getByLabel("Catalogue fault").selectOption("CAT-05-1");
  await expect(page.getByLabel("Catalogue hypothesis")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Apply simulated recovery", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Inspector side").selectOption("a");
  await expect(page.getByLabel("Catalogue hypothesis")).not.toHaveValue("");
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export incident evidence", exact: true })
    .click();
  const path = await (await event).path();
  const report = JSON.parse(await fs.readFile(path!, "utf8"));
  expect(report.architecture).toBe("CAT-04");
  expect(report.investigation.evidence).toHaveLength(2);
  expect(report.investigation.containmentAt).toBe(180);
  expect(report.replay.recoveredAt).toBe(180);
  expect(report.sourceRefs.length).toBeGreaterThan(0);
  expect(report.synthetic).toBe(true);
  await page
    .getByLabel("Explorer experience")
    .selectOption("Assembly Timeline");
  await page.getByLabel("Catalogue time").fill("250");
  await expect(page.getByTestId("assembly-a")).toHaveAttribute(
    "data-level",
    "6",
  );
  await expect(page.getByTestId("assembly-b")).toHaveAttribute(
    "data-level",
    "6",
  );
  await page.getByRole("button", { name: "Runtime", exact: true }).click();
  await expect(page.getByLabel("Explorer experience")).toHaveValue("Diagnose");
});
test("catalogue licensed model bindings and original profile navigation use shared render/import tools", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", {
      name: "Settings / Import Better Rack Model",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Licensed rack model")
    .setInputFiles("tests/fixtures/original-rack.glb");
  await expect(page.getByLabel("Imported mesh")).toContainText("fixture-rack");
  await page
    .getByLabel("Model attribution")
    .fill("Signal Intelligence original QA fixture");
  await page.getByLabel("Model license").fill("Original test geometry");
  await page.getByLabel("Binding component").selectOption("CAT-04/tray/2");
  await page
    .getByRole("button", { name: "Bind mesh to component", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply mapped geometry", exact: true })
    .click();
  await expect
    .poll(async () => (await audit(page)).a.renderMode)
    .toBe("imported");
  const data = (await audit(page)).a;
  expect(data.owners["CAT-04/tray/2"]).toBeTruthy();
  await page.getByLabel("Catalogue camera").selectOption("front");
  await page.waitForTimeout(500);
  const box = (await page.locator("canvas").boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId("catalogue-selected")).toHaveText(
    "CAT-04/tray/2",
  );
  await page
    .getByLabel("Architecture A", { exact: true })
    .selectOption("FS_CONCEPT");
  await expect(page.getByLabel("Architecture profile")).toHaveValue(
    "FS_CONCEPT",
  );
  await expect(page.getByTestId("4d-workbench")).toBeVisible();
  await page.getByLabel("Architecture profile").selectOption("CAT-04");
  await expect
    .poll(async () => (await audit(page)).a.renderMode)
    .toBe("imported");
  await page
    .getByRole("button", {
      name: "Settings / Import Better Rack Model",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Return to procedural geometry", exact: true })
    .click();
  await expect
    .poll(async () => (await audit(page)).a.renderMode)
    .toBe("procedural");
});
test("release requires recovery and a fresh earned L12 signoff", async ({
  page,
}) => {
  test.setTimeout(180000);
  await open(page);
  await page.getByRole("button", { name: "L1–L12", exact: true }).click();
  async function checks(n: number) {
    for (let i = 1; i <= 3; i++)
      await page
        .getByRole("button", { name: `Run simulated test ${i}`, exact: true })
        .click();
    await page
      .getByLabel("Catalogue gate evidence note")
      .fill(`Owned L${n} synthetic qualification evidence`);
    await page
      .getByRole("button", { name: `Sign earned L${n} pass`, exact: true })
      .click();
  }
  for (let n = 1; n <= 12; n++) {
    await page
      .getByTestId("assembly-a")
      .getByRole("button", { name: new RegExp(`^A L${n} `) })
      .click();
    await checks(n);
  }
  await page
    .getByRole("button", { name: "Investigation", exact: true })
    .click();
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByLabel("Catalogue time").fill("180");
  const panel = page.locator(".cat-inspector");
  await panel.locator("input[type=checkbox]").nth(1).check();
  await panel.locator("input[type=checkbox]").nth(2).check();
  await page.getByLabel("Catalogue hypothesis").selectOption({ index: 1 });
  await page
    .getByRole("button", { name: "Record containment plan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply simulated recovery", exact: true })
    .click();
  await page.getByLabel("Catalogue time").fill("400");
  await expect(
    page.getByRole("button", { name: "Record release decision", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "L1–L12", exact: true }).click();
  await checks(12);
  await page
    .getByRole("button", { name: "Investigation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Record release decision", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Record release decision", exact: true })
    .click();
  await expect(panel.getByRole("status")).toContainText("Release supported");
});
