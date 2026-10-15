import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://127.0.0.1:4173/");
await p.getByRole("button", { name: "Collapse panels" }).click();
for (const camera of ["isometric", "front", "rear-service"]) {
  await p.getByLabel("Camera preset").selectOption(camera);
  await p.waitForTimeout(1200);
  await p.screenshot({
    path: `evidence/catalogue-v2/baseline/rack-${camera}.png`,
  });
}
await p.locator("footer button").click();
await fs.writeFile(
  "evidence/catalogue-v2/baseline/metrics.json",
  await p.locator(".modal pre").innerText(),
);
await p.getByRole("button", { name: "Close ×", exact: true }).click();
await p.getByRole("button", { name: "Show panels" }).click();
await p
  .getByRole("button", { name: "Compare architectures", exact: true })
  .click();
await p.screenshot({ path: "evidence/catalogue-v2/baseline/comparison.png" });
await p.getByRole("button", { name: "Close ×", exact: true }).click();
await p.getByRole("button", { name: "Row overview", exact: true }).click();
await p.getByRole("button", { name: "Collapse panels" }).click();
await p.waitForTimeout(1200);
await p.screenshot({ path: "evidence/catalogue-v2/baseline/row.png" });
await p.getByRole("button", { name: "Show panels" }).click();
await p.getByLabel("Search components").fill("FS_CONCEPT/R1/hbm-1.1.1");
await p.getByRole("treeitem").first().click();
await p.getByRole("button", { name: "Drill In" }).click();
await p.getByRole("button", { name: "Collapse panels" }).click();
await p.getByLabel("Camera preset").selectOption("isometric");
await p.waitForTimeout(1200);
await p.screenshot({ path: "evidence/catalogue-v2/baseline/hbm.png" });
await b.close();
