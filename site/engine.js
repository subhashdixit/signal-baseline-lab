export function baseline(
  values,
  { radius = 16, width = 31, shift = 0, endpoints = false } = {},
) {
  if (
    !Array.isArray(values) ||
    values.length < 3 ||
    values.length > 10000 ||
    values.some(
      (v) => typeof v !== "number" || !Number.isFinite(v) || Math.abs(v) > 1e12,
    )
  )
    throw Error("Provide 3–10,000 finite values within ±1e12.");
  if (
    !Number.isInteger(radius) ||
    radius < 0 ||
    radius > 200 ||
    !Number.isInteger(width) ||
    width < 1 ||
    width > 501 ||
    width % 2 !== 1 ||
    !Number.isFinite(shift) ||
    Math.abs(shift) > 0.3 ||
    typeof endpoints !== "boolean"
  )
    throw Error("Invalid filter settings. Smoothing width must be odd.");
  const low = values.map((_, i) =>
    Math.min(
      ...values.slice(
        Math.max(0, i - radius),
        Math.min(values.length, i + radius + 1),
      ),
    ),
  );
  const half = (width - 1) / 2;
  let curve = low.map((_, i) => {
    const part = low.slice(
      Math.max(0, i - half),
      Math.min(low.length, i + half + 1),
    );
    return part.reduce((a, b) => a + b, 0) / part.length;
  });
  const offset = shift * (Math.max(...curve) - Math.min(...curve));
  curve = curve.map((v) => v + offset);
  if (endpoints) {
    curve[0] = values[0];
    curve[curve.length - 1] = values.at(-1);
  }
  return {
    raw: [...values],
    baseline: curve,
    corrected: values.map((v, i) => v - curve[i]),
  };
}
export function demoSignal() {
  return Array.from({ length: 400 }, (_, i) => {
    const x = i / 399;
    return (
      2 +
      1.5 * x +
      0.3 * Math.sin(x * 5) +
      7 * Math.exp(-(((x - 0.3) / 0.035) ** 2)) +
      5 * Math.exp(-(((x - 0.7) / 0.06) ** 2)) +
      0.06 * Math.sin(i * 2.37)
    );
  });
}
