import test from "node:test";
import assert from "node:assert/strict";
import { baseline, demoSignal } from "../site/engine.js";
import { parseCSV, csvCell } from "../site/ui.js";
test("constant input stays constant even at edges", () => {
  assert.deepEqual(baseline([3, 3, 3, 3, 3]).baseline, [3, 3, 3, 3, 3]);
});
test("known minimum filter and subtraction", () => {
  const r = baseline([1, 4, 2, 5, 3], { radius: 1, width: 1 });
  assert.deepEqual(r.baseline, [1, 1, 2, 2, 3]);
  assert.deepEqual(r.corrected, [0, 3, 0, 3, 0]);
});
test("edge mean uses actual observations, no artificial zero padding", () => {
  assert.deepEqual(
    baseline([2, 4, 6], { radius: 0, width: 3 }).baseline,
    [3, 4, 5],
  );
});
test("shift and explicit endpoint restoration", () => {
  const r = baseline([1, 4, 2, 5, 3], {
    radius: 1,
    width: 1,
    shift: 0.1,
    endpoints: true,
  });
  assert.equal(r.baseline[0], 1);
  assert.equal(r.baseline.at(-1), 3);
  assert.equal(r.baseline[1], 1.2);
});
test("reject invalid data and settings", () => {
  for (const a of [
    [1, 2],
    [1, NaN, 3],
    [1, Infinity, 2],
    [1, "2", 3],
  ])
    assert.throws(() => baseline(a));
  for (const options of [
    { width: 2 },
    { radius: -1 },
    { shift: 1 },
    { width: Infinity },
  ])
    assert.throws(() => baseline([1, 2, 3], options));
});
test("synthetic example is deterministic and input is immutable", () => {
  const d = demoSignal(),
    copy = [...d];
  assert.deepEqual(d, demoSignal());
  baseline(d);
  assert.deepEqual(d, copy);
});
test("CSV quoted cells and spreadsheet text are safe", () => {
  assert.deepEqual(parseCSV('value,note\r\n3,"a,b"'), [
    ["value", "note"],
    ["3", "a,b"],
  ]);
  assert.throws(() => parseCSV('"bad'));
  assert.equal(csvCell("=SUM(A1)"), '"\'=SUM(A1)"');
  assert.equal(csvCell(-3), '"-3"');
});
