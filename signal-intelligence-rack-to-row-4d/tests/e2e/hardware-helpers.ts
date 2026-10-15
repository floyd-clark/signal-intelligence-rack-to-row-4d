import { type Page, expect } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
export async function audit(page: Page) {
  await page.locator("footer button").click();
  const a = JSON.parse(await page.locator(".modal pre").innerText());
  await page.getByRole("button", { name: "Close ×", exact: true }).click();
  return a;
}
export async function clickWorld(page: Page, point: number[]) {
  const a = await audit(page);
  const box = (await page.locator("canvas").boundingBox())!;
  const camera = new PerspectiveCamera(38, box.width / box.height, 0.005, 100);
  camera.position.fromArray(a.hardware.camera);
  camera.lookAt(
    new Vector3(...(a.hardware.target as [number, number, number])),
  );
  camera.updateMatrixWorld();
  const ndc = new Vector3(...(point as [number, number, number])).project(
    camera,
  );
  await page.mouse.click(
    box.x + ((ndc.x + 1) * box.width) / 2,
    box.y + ((1 - ndc.y) * box.height) / 2,
  );
}
export async function treeDrill(page: Page, id: string) {
  await page.getByLabel("Search components").fill(id);
  await page
    .getByRole("treeitem")
    .filter({
      hasText: id.includes("/hbm-")
        ? "hbm"
        : id.includes("/accelerator-")
          ? "GPU"
          : " ",
    })
    .first()
    .click()
    .catch(async () => {
      await page.getByRole("treeitem").first().click();
    });
  await page.getByRole("button", { name: "Drill In" }).click();
  await page.waitForTimeout(1000);
}
