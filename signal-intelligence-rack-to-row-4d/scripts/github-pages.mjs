import { spawnSync } from "node:child_process";

// Use the already configured Git credential manager. Never log credentials.
const credential = spawnSync("git", ["credential", "fill"], {
  input: "protocol=https\nhost=github.com\n\n",
  encoding: "utf8",
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
});
const token = credential.stdout
  ?.split(/\r?\n/)
  .find((s) => s.startsWith("password="))
  ?.slice(9);
if (credential.status !== 0 || !token)
  throw new Error(
    "GitHub authentication unavailable through Git credential manager",
  );
const repo = "floyd-clark/signal-intelligence-rack-to-row-4d";
async function api(path = "", method = "GET", body) {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    redirect: "error",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "Signal-Intelligence-Publisher",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : {} };
}
const mode = process.argv[2] || "inspect";
if (mode === "inspect") {
  const repository = await api();
  const pages = await api("/pages");
  console.log(
    JSON.stringify(
      {
        repository: {
          status: repository.status,
          defaultBranch: repository.data.default_branch,
          visibility: repository.data.visibility,
          permissions: repository.data.permissions,
        },
        pages: {
          status: pages.status,
          url: pages.data.html_url,
          source: pages.data.source,
          buildType: pages.data.build_type,
          message: pages.data.message,
        },
      },
      null,
      2,
    ),
  );
} else if (mode === "configure") {
  const existing = await api("/pages");
  if (![200, 404].includes(existing.status))
    throw new Error(
      `Pages inspection failed (${existing.status}): ${existing.data.message}`,
    );
  const result = await api("/pages", existing.status === 404 ? "POST" : "PUT", {
    build_type: "legacy",
    source: { branch: "gh-pages", path: "/" },
  });
  console.log(
    JSON.stringify({
      status: result.status,
      url: result.data.html_url,
      message: result.data.message,
    }),
  );
  if (![201, 204].includes(result.status)) process.exitCode = 1;
} else if (mode === "status") {
  const result = await api("/pages/builds/latest");
  console.log(
    JSON.stringify({
      status: result.status,
      build: result.data.status,
      commit: result.data.commit,
      error: result.data.error?.message,
      url: result.data.html_url,
      message: result.data.message,
    }),
  );
} else throw new Error("Use inspect, configure or status");
