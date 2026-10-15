import { test, expect } from "@playwright/test";
test("rack, drill, row, profiles, gates, investigation and offline requests", async ({
  page,
}) => {
  const errors: string[] = [];
  const remote: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:4173") &&
      !r.url().startsWith("data:") &&
      !r.url().startsWith("blob:")
    )
      remote.push(r.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Inside the AI rack." }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "evidence/01-rack.png", fullPage: true });
  await page.getByLabel("Search components").fill("tray -1");
  await page.getByRole("treeitem").first().click();
  await expect(page.locator(".inspector h2")).toContainText("tray");
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.getByRole("treeitem").first().dblclick();
  await page.getByLabel("Search components").fill("hbm -1.1.1");
  await page.getByRole("treeitem").first().click();
  await expect(page.locator(".inspector")).toContainText("ECC");
  await page.screenshot({ path: "evidence/02-component.png", fullPage: true });
  await page.getByRole("button", { name: "← Back" }).click();
  await page.getByLabel("Search components").fill("");
  await page.getByRole("button", { name: "Row overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Infrastructure, connected." }),
  ).toBeVisible();
  await page.screenshot({ path: "evidence/03-row.png", fullPage: true });
  await page.getByLabel("Visit rack").selectOption("8");
  await expect(page.locator(".scene-top")).toContainText("RACK-08");
  await page
    .getByLabel("Architecture profile")
    .selectOption("NVIDIA_GB200_NVL72_REFERENCE");
  await expect(page.locator(".scene-top")).toContainText("NVLink");
  await page
    .getByLabel("Architecture profile")
    .selectOption("GOOGLE_IRONWOOD_TPU_REFERENCE");
  await expect(page.locator(".scene-top")).toContainText("ICI");
  await page.getByLabel("Architecture profile").selectOption("FS_CONCEPT");
  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole("button", { name: /Gate evidence/ }).click();
  await expect(
    page.getByRole("button", { name: "Sign earned L1 pass" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Run simulated test" }).nth(0).click();
  await page.getByRole("button", { name: "Run simulated test" }).nth(1).click();
  await page.getByRole("button", { name: "Run simulated test" }).nth(2).click();
  await page.getByRole("button", { name: "Sign earned L1 pass" }).click();
  await page.screenshot({ path: "evidence/04-gate.png", fullPage: true });
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  await page.getByRole("button", { name: "9", exact: true }).click();
  await page
    .getByRole("button", { name: "investigation", exact: true })
    .click();
  await page.getByLabel("Incident preset").selectOption("INC-10");
  await page
    .getByRole("button", { name: "Inject simulated fault", exact: true })
    .click();
  await page.getByRole("button", { name: "Ⅱ Pause", exact: true }).click();
  await page.getByLabel("Time scrubber").fill("500");
  await expect(page.locator(".metrics")).not.toContainText("100.0");
  await page.getByRole("button", { name: "Row overview", exact: true }).click();
  await page.screenshot({ path: "evidence/05-incident.png", fullPage: true });
  await expect(
    page.getByRole("button", { name: "Choose containment", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: /^Collect ·/ })
    .nth(0)
    .click();
  await page
    .getByRole("button", { name: /^Collect ·/ })
    .nth(0)
    .click();
  await page
    .getByRole("button", { name: "Choose containment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply simulated recovery", exact: true })
    .click();
  await page.getByLabel("Time scrubber").fill("600");
  await page.screenshot({ path: "evidence/06-rca.png", fullPage: true });
  await page.getByLabel("Time scrubber").fill("0");
  await expect(page.locator(".metrics")).toContainText("100.0");
  await page
    .getByRole("button", { name: "Settings / Import Better Rack Model" })
    .click();
  await page.getByText("Accessible 2D fallback", { exact: false }).click();
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Accessible 2D system diagram" }),
  ).toBeVisible();
  expect(remote).toEqual([]);
  expect(errors).toEqual([]);
});
