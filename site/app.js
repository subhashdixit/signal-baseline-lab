import { baseline, demoSignal } from "./engine.js";
import {
  $,
  announce,
  csv,
  parseCSV,
  lineChart,
  download,
  readText,
} from "./ui.js";
let result;
function load() {
  $("values").value = demoSignal()
    .map((v) => v.toFixed(6))
    .join("\n");
  run();
}
function run() {
  try {
    const text = $("values").value.trim();
    const values = text.split(/[\s,;]+/).map(Number);
    result = baseline(values, {
      radius: Number($("radius").value),
      width: Number($("width").value),
      shift: Number($("shift").value),
      endpoints: $("endpoints").checked,
    });
    lineChart("chart", [
      { name: "Raw signal", values: result.raw },
      { name: "Estimated background", values: result.baseline },
      { name: "Corrected signal", values: result.corrected },
    ]);
    $("metrics").textContent =
      `${values.length} observations · corrected mean ${(result.corrected.reduce((a, b) => a + b, 0) / values.length).toFixed(3)} · negative residuals are retained`;
    $("export").disabled = false;
    announce(
      "Calculated locally. Compare several window sizes before choosing an estimate.",
    );
  } catch (error) {
    result = null;
    $("export").disabled = true;
    announce(error.message);
  }
}
$("run").addEventListener("click", run);
$("example").addEventListener("click", load);
$("file").addEventListener("change", async (e) => {
  try {
    const rows = parseCSV(await readText(e.target.files[0]));
    const index = rows[0].findIndex((v) => v.trim().toLowerCase() === "value");
    if (index < 0) throw Error("CSV needs a value header.");
    if (rows.slice(1).some((r) => !r[index]?.trim()))
      throw Error("Missing signal value.");
    $("values").value = rows
      .slice(1)
      .map((r) => r[index])
      .join("\n");
    run();
  } catch (error) {
    announce(error.message);
  }
});
$("export").addEventListener("click", () => {
  if (result)
    download(
      "baseline-results.csv",
      csv([
        ["index", "raw", "baseline", "corrected"],
        ...result.raw.map((v, i) => [
          i,
          v,
          result.baseline[i],
          result.corrected[i],
        ]),
      ]),
      "text/csv",
    );
});
load();
