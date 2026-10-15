export function download(name: string, data: unknown) {
  const content =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([content], {
      type: name.endsWith(".json") ? "application/json" : "text/plain",
    }),
  );
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
