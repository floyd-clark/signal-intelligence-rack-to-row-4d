import fs from "node:fs/promises";
// Windows scanners/indexers can briefly lock existing evidence files. Retry only
// filesystem writes; application assertions and browser errors are never retried.
export async function writeEvidence(path, data) {
  for (let attempt = 0; ; attempt++) {
    try {
      await fs.writeFile(path, data);
      return;
    } catch (error) {
      if (
        attempt >= 4 ||
        !["UNKNOWN", "EBUSY", "EPERM", "EACCES"].includes(error.code)
      )
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }
}
export async function screenshot(page, options) {
  const { path, ...capture } = options;
  const buffer = await page.screenshot(capture);
  await writeEvidence(path, buffer);
  return buffer;
}
