import { screenshot, writeEvidence } from "../../scripts/artifacts.mjs";
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";
const root = "evidence/catalogue-v2/lifecycle";
const familyIds = Array.from(
  { length: 10 },
  (_, i) => `CAT-${String(i + 1).padStart(2, "0")}`,
);
async function open(page: Page) {
  await page.goto("/?catalogue=1");
  await page.getByRole("button", { name: "4D workspace", exact: true }).click();
  await page.getByLabel("Catalogue quality").selectOption("Performance");
}
async function level(page: Page, n: number, side = "a") {
  await page
    .getByTestId(`assembly-${side}`)
    .getByRole("button", { name: new RegExp(`^${side.toUpperCase()} L${n} `) })
    .click();
  await expect(page.getByTestId(`assembly-${side}`)).toHaveAttribute(
    "data-level",
    String(n),
  );
}
async function audit(page: Page, n: number) {
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  await expect
    .poll(
      async () =>
        JSON.parse(await page.getByTestId("catalogue-audit").innerText()).a
          ?.level,
    )
    .toBe(n);
  const result = JSON.parse(
    await page.getByTestId("catalogue-audit").innerText(),
  );
  await page.getByRole("button", { name: "Catalogue render audit" }).click();
  return result;
}
test("all ten catalogue entries expose L1-L12 and real independently staged hardware", async ({
  page,
}) => {
  test.setTimeout(180000);
  await fs.mkdir(root, { recursive: true });
  await open(page);
  const results = [];
  for (let i = 0; i < familyIds.length; i++) {
    const id = familyIds[i];
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await expect(
      page.locator(".cat-card button", { hasText: "L1–L12 integration" }),
    ).toHaveCount(10);
    await page
      .locator(".cat-card")
      .nth(i)
      .getByRole("button", { name: /^L1–L12 for / })
      .click();
    await expect(
      page.getByLabel("Architecture A", { exact: true }),
    ).toHaveValue(id);
    await expect(
      page.getByTestId("assembly-a").locator(".cat-stage-buttons button"),
    ).toHaveCount(12);
    await expect(
      page.getByRole("button", { name: "L1–L12", exact: true }),
    ).toBeVisible();
    await level(page, 1);
    await expect(page.locator(".cat-lifecycle-panel h3")).toContainText(
      "L1 / Enclosure",
    );
    await expect(page.locator(".cat-gate-test")).toHaveCount(3);
    const shell = (await audit(page, 1)).a;
    expect(Object.keys(shell.owners).some((id) => id.includes("/tray/"))).toBe(
      false,
    );
    await screenshot(page, { path: `${root}/${id}-L1.png`, fullPage: true });
    await level(page, 2);
    const power = (await audit(page, 2)).a;
    expect(power.owners[`${id}/power/1`]).toBeTruthy();
    expect(power.owners[`${id}/tray/1`]).toBeUndefined();
    await level(page, 3);
    expect((await audit(page, 3)).a.owners[`${id}/tray/1`]).toBeTruthy();
    await level(page, 12);
    const complete = (await audit(page, 12)).a;
    expect(complete.triangles).toBeGreaterThan(shell.triangles);
    await screenshot(page, { path: `${root}/${id}-L12.png`, fullPage: true });
    results.push({
      id,
      namedStages: 12,
      shellTriangles: shell.triangles,
      completeTriangles: complete.triangles,
      powerAtL2: true,
      traysAtL3: true,
    });
  }
  await writeEvidence(
    `${root}/family-stages.json`,
    JSON.stringify({ passed: true, results }, null, 2),
  );
});
test("all ten families can earn each applicable gate through three checks and evidence, with air L4 explicitly N/A", async ({
  page,
}) => {
  test.setTimeout(240000);
  await fs.mkdir(root, { recursive: true });
  await open(page);
  const results = [];
  for (const id of familyIds) {
    await page.getByLabel("Architecture A", { exact: true }).selectOption(id);
    const signed = [],
      skipped = [];
    for (let n = 1; n <= 12; n++) {
      await level(page, n);
      if (n === 4 && ["CAT-01", "CAT-03"].includes(id)) {
        await expect(page.locator(".cat-lifecycle-panel")).toContainText(
          "is N/A",
        );
        skipped.push(n);
        continue;
      }
      const sign = page.getByRole("button", {
        name: `Sign earned L${n} pass`,
        exact: true,
      });
      await expect(sign).toBeDisabled();
      for (let i = 1; i <= 3; i++)
        await page
          .getByRole("button", { name: `Run simulated test ${i}`, exact: true })
          .click();
      await expect(sign).toBeDisabled();
      await page
        .getByLabel("Catalogue gate evidence note")
        .fill(`${id} L${n} fixture observation recorded by browser QA`);
      await expect(sign).toBeEnabled();
      await sign.click();
      await expect(
        page.locator(".cat-lifecycle-panel [role=status]"),
      ).toContainText(`L${n} synthetic pass signed`);
      signed.push(n);
    }
    results.push({ id, signed, skipped });
  }
  await writeEvidence(
    `${root}/gate-signoffs.json`,
    JSON.stringify({ passed: true, results, synthetic: true }, null, 2),
  );
});
test("A/B and Rubin have separate saved levels; fixture failures block signing; evidence survives reload and invalidates downstream", async ({
  page,
}) => {
  await open(page);
  await level(page, 1);
  await page.getByLabel("Simulate a failing acceptance fixture").check();
  await page
    .getByRole("button", { name: "Run simulated test 1", exact: true })
    .click();
  await expect(page.getByTestId("gate-result-0")).toContainText("FAIL");
  await expect(
    page.getByRole("button", { name: "Sign earned L1 pass" }),
  ).toBeDisabled();
  await page.getByLabel("Simulate a failing acceptance fixture").uncheck();
  await page
    .getByRole("button", { name: "Investigation", exact: true })
    .click();
  await page.getByLabel("Catalogue fault").selectOption("CAT-04-1");
  await page.getByRole("button", { name: "L1–L12", exact: true }).click();
  await page
    .getByRole("button", { name: "Run simulated test 1", exact: true })
    .click();
  await expect(page.getByTestId("gate-result-0")).toContainText(
    "open synthetic incident",
  );
  await expect(
    page.getByRole("button", { name: "Sign earned L1 pass" }),
  ).toBeDisabled();
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
    .fill("GB300 retained evidence");
  await page.getByRole("button", { name: "Sign earned L1 pass" }).click();
  await level(page, 2);
  for (let i = 1; i <= 3; i++)
    await page
      .getByRole("button", { name: `Run simulated test ${i}`, exact: true })
      .click();
  await page
    .getByLabel("Catalogue gate evidence note")
    .fill("GB300 power evidence");
  await page.getByRole("button", { name: "Sign earned L2 pass" }).click();
  await page
    .getByRole("button", { name: "A/B comparison", exact: true })
    .click();
  await level(page, 9, "b");
  await expect(page.getByTestId("assembly-a")).toHaveAttribute(
    "data-level",
    "2",
  );
  await expect(page.locator(".cat-lifecycle-panel")).toHaveAttribute(
    "data-family",
    "CAT-05/helios",
  );
  await page
    .getByLabel("Architecture B", { exact: true })
    .selectOption("CAT-04");
  await page.getByLabel("Generation B", { exact: true }).selectOption("rubin");
  await level(page, 5, "b");
  await expect(page.getByTestId("assembly-a")).toHaveAttribute(
    "data-level",
    "2",
  );
  await expect(page.locator(".cat-lifecycle-panel")).toHaveAttribute(
    "data-family",
    "CAT-04/rubin",
  );
  await expect(page.getByLabel("Catalogue gate evidence note")).toHaveValue("");
  await page.reload();
  await page.getByRole("button", { name: "4D workspace", exact: true }).click();
  await expect(page.getByTestId("assembly-a")).toHaveAttribute(
    "data-level",
    "2",
  );
  await page
    .getByTestId("assembly-a")
    .getByRole("button", { name: "Gate evidence", exact: true })
    .click();
  await expect(page.getByLabel("Catalogue gate evidence note")).toHaveValue(
    "GB300 power evidence",
  );
  await expect(
    page.locator(".cat-lifecycle-panel [role=status]"),
  ).toContainText("L2 synthetic pass signed");
  await level(page, 1);
  await page
    .getByLabel("Catalogue gate evidence note")
    .fill("Revised grounding observation");
  await level(page, 2);
  await expect(page.getByTestId("gate-result-0")).toHaveText(
    "Evidence pending",
  );
  await expect(
    page.getByRole("button", { name: "Sign earned L2 pass" }),
  ).toBeDisabled();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export L1–L12 evidence" }).click();
  const path = await (await downloaded).path();
  const evidence = JSON.parse(await fs.readFile(path!, "utf8"));
  expect(evidence.lifecycleKey).toBe("CAT-04/nvl72");
  expect(evidence.stages).toHaveLength(12);
  expect(evidence.records[2].signedAt).toBeNull();
  await page
    .getByRole("button", { name: "A/B comparison", exact: true })
    .click();
  await page
    .getByLabel("Architecture B", { exact: true })
    .selectOption("CAT-05");
  await expect(page.getByTestId("assembly-b")).toHaveAttribute(
    "data-level",
    "9",
  );
});
