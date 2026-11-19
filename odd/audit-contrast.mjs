import fs from "node:fs";

const css = fs.readFileSync("src/index.css", "utf8");
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const L = (h) => {
  const [r, g, b] = hex2rgb(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const cr = (a, b) => {
  const l1 = L(a);
  const l2 = L(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const tokens = {};
for (const m of css.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens["--" + m[1]] = m[2];

// El texto tiene que pasar sobre la superficie mas clara que exista.
const surfaces = ["--bg-pane", "--bg-pane-hi", "--bg-canvas"]
  .map((k) => tokens[k])
  .filter(Boolean)
  .sort((a, b) => L(b) - L(a));
const PANEL = surfaces[0] ?? "#05070e";
const BODY = tokens["--bg-canvas"] ?? PANEL;

// Aplana @media para auditar cada bloque de declaraciones.
const flat = css.replace(/@media[^{]+\{/g, "\n");
let checked = 0;
let fails = 0;

for (const block of flat.split("}")) {
  const braceAt = block.indexOf("{");
  if (braceAt === -1) continue;
  const sel = block.slice(0, braceAt).trim().split("\n").pop().trim();
  const body = block.slice(braceAt + 1);
  const cm = body.match(/(?:^|[\s;])color:\s*([^;]+);/);
  if (!cm) continue;
  let raw = cm[1].trim();
  if (raw.startsWith("var(")) raw = tokens[raw.slice(4, -1).trim()] ?? raw;
  if (!/^#[0-9a-fA-F]{6}$/.test(raw)) {
    console.log("SKIP (no hex literal)  " + raw + "  <- " + sel);
    continue;
  }
  // La seleccion es texto oscuro sobre el acento, no sobre el panel.
  const highlight = tokens["--accent-azure"] ?? tokens["--accent"] ?? tokens["--green"];
  if (sel.includes("::selection") && !highlight) {
    console.log("SKIP (sin token de acento)  " + sel);
    continue;
  }
  // Si el bloque declara su propio fondo, ese es el que el texto pisa.
  const own = body.match(/(?:^|[\s;])background(?:-color)?:\s*([^;]+);/);
  let surface = null;
  if (own) {
    let value = own[1].trim();
    if (value.startsWith("var(")) value = tokens[value.slice(4, -1).trim()] ?? value;
    if (/^#[0-9a-fA-F]{6}$/.test(value)) surface = value;
  }
  const worst = sel.includes("::selection")
    ? cr(raw, highlight)
    : surface
      ? cr(raw, surface)
      : Math.min(cr(raw, PANEL), cr(raw, BODY));
  checked++;
  if (worst < 4.5) fails++;
  console.log(
    (worst >= 4.5 ? "PASS" : "FAIL") + "  " + worst.toFixed(2) + ":1  " + raw + "  <- " + sel,
  );
}

console.log(
  "\n" + checked + " declaraciones de color auditadas, " + fails + " por debajo de 4.5:1",
);

// La escala es relativa: se informa el equivalente en px tomando 15px de base.
const sizes = [
  ...[...css.matchAll(/font-size:\s*([\d.]+)px/g)].map((m) => +m[1]),
  ...[...css.matchAll(/font-size:\s*([\d.]+)rem/g)].map((m) => +(m[1] * 15).toFixed(1)),
];
console.log(
  "font-size minimo: " +
    Math.min(...sizes) +
    "px  (valores: " +
    [...new Set(sizes)].sort((a, b) => a - b).join(", ") +
    ")",
);
