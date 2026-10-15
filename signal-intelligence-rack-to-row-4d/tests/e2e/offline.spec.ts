import { test, expect } from "@playwright/test";
test("production bundle works with external networking blocked, records performance and topology", async ({
  page,
}) => {
  const remote: string[] = [],
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (
      url.startsWith("http://127.0.0.1:4173") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    )
      return route.continue();
    remote.push(url);
    return route.abort();
  });
  await page.goto("http://127.0.0.1:4173");
  await page.locator("canvas").waitFor();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", { name: "Inventory & performance audit" })
    .click();
  await expect(page.locator(".modal pre")).toContainText('"missing": []');
  const audit = JSON.parse(await page.locator(".modal pre").innerText());
  expect(audit.fps).toBeGreaterThan(0);
  await import("node:fs/promises").then((fs) =>
    fs.writeFile(
      "evidence/catalogue-v2/legacy-runtime-audit.json",
      JSON.stringify(
        {
          browser: "Chromium with SwiftShader (software rendering)",
          viewport: "1600 × 1000",
          ...audit,
        },
        null,
        2,
      ),
    ),
  );
  await page.screenshot({
    path: "evidence/catalogue-v2/legacy-09-audit.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  await page.getByRole("button", { name: "Row overview", exact: true }).click();
  await page
    .getByLabel("Architecture profile")
    .selectOption("GOOGLE_IRONWOOD_TPU_REFERENCE");
  await page.getByLabel("Camera preset").selectOption("graph");
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: "evidence/catalogue-v2/legacy-10-ironwood-topology.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Settings / Import Better Rack Model" })
    .click();
  await page.getByLabel("Operational mode").selectOption("challenge");
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  await page
    .getByRole("button", { name: "investigation", exact: true })
    .click();
  await expect(page.getByLabel("Incident preset")).toContainText("Challenge");
  await page.getByLabel("Incident preset").selectOption("INC-10");
  await page.getByRole("button", { name: "Inject simulated fault" }).click();
  await expect(
    page.getByRole("heading", { name: "Masked diagnosis challenge" }),
  ).toBeVisible();
  expect(remote).toEqual([]);
  expect(errors).toEqual([]);
});
