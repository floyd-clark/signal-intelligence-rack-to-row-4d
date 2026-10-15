import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11"],
});
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://127.0.0.1:4173");
await p.locator("canvas").waitFor();
await p.getByRole("button", { name: "Collapse panels" }).click();
await p.waitForTimeout(7000);
await p.locator("footer button").click();
const data = JSON.parse(await p.locator(".modal pre").innerText());
await fs.writeFile(
  "evidence/v2/native-gpu-benchmark.json",
  JSON.stringify(
    {
      browser:
        "Installed Chrome, ANGLE D3D11 requested; actual adapter verified in renderer",
      ...data,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    fps: data.fps,
    renderer: data.renderer,
    drawCalls: data.drawCalls,
    triangles: data.triangles,
  }),
);
await b.close();
