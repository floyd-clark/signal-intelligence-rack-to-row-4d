import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://127.0.0.1:4173/");
await p
  .getByRole("button", { name: "Rack Catalogue 2.0", exact: true })
  .click();
await p
  .getByRole("button", { name: "Architecture studio", exact: true })
  .click();
for (const id of ["CAT-04", "CAT-05", "CAT-06"]) {
  await p.getByLabel("Architecture A", { exact: true }).selectOption(id);
  await p.getByLabel("Catalogue camera").selectOption("oblique");
  await p.waitForTimeout(1800);
  await p.screenshot({
    path: `evidence/catalogue-v2/${id}-hero-proof.png`,
    fullPage: true,
  });
  await p.getByLabel("Catalogue camera").selectOption("rear");
  await p.waitForTimeout(900);
  await p.screenshot({
    path: `evidence/catalogue-v2/${id}-rear-proof.png`,
    fullPage: true,
  });
  await p.getByRole("button", { name: "CAD cutaway", exact: true }).click();
  await p.getByRole("button", { name: "Tray", exact: true }).click();
  await p.waitForTimeout(1000);
  await p.screenshot({
    path: `evidence/catalogue-v2/${id}-tray-proof.png`,
    fullPage: true,
  });
  await p.getByRole("button", { name: "Rack", exact: true }).click();
  await p.getByRole("button", { name: "CAD cutaway", exact: true }).click();
}
await p.getByRole("button", { name: "A/B comparison", exact: true }).click();
await p.getByLabel("Architecture A", { exact: true }).selectOption("CAT-04");
await p.getByLabel("Architecture B", { exact: true }).selectOption("CAT-05");
await p.waitForTimeout(1800);
await p.screenshot({
  path: "evidence/catalogue-v2/hero-comparison-proof.png",
  fullPage: true,
});
await p.getByRole("button", { name: "Catalogue render audit" }).click();
await fs.writeFile(
  "evidence/catalogue-v2/hero-proof-metrics.json",
  await p.getByTestId("catalogue-audit").innerText(),
);
await fs.writeFile(
  "evidence/catalogue-v2/hero-proof-errors.json",
  JSON.stringify(errors),
);
console.log(JSON.stringify(errors));
await b.close();
if (errors.length) throw Error("Runtime exceptions");
