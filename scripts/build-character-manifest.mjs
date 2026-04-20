import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultAuditPath = path.resolve(__dirname, "../docs/assets/character-audit.md");
const defaultManifestPath = path.resolve(__dirname, "../src/assets/characters/manifest.json");
const defaultPublicRoot = path.resolve(__dirname, "../public");

const TRANSPARENT_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

const SUPPORTED_TYPES = [
  "CTRL",
  "ATM-er",
  "Dior-s",
  "BOSS",
  "THAN-K",
  "OH-NO",
  "GOGO",
  "SEXY",
  "LOVE-R",
  "MUM",
  "FAKE",
  "OJBK",
  "MALO",
  "JOKE-R",
  "WOC!",
  "THIN-K",
  "SHIT",
  "ZZZZ",
  "POOR",
  "MONK",
  "IMSB",
  "SOLO",
  "FUCK",
  "DEAD",
  "IMFW",
  "HHHH",
  "DRUNK"
];
const REQUIRED_HEADERS = [
  "Type",
  "Title",
  "Source URL",
  "Transparent",
  "Idle",
  "Walk",
  "Work",
  "Rest",
  "Sleep",
  "Dance",
  "Train",
  "Task Submit",
  "Quality"
];

function parseCells(row) {
  if (!row.startsWith("|") || !row.endsWith("|")) {
    throw new Error(`Malformed markdown table row: ${row}`);
  }

  return row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parseMarkdownTable(markdown) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (lines.length < 3) {
    throw new Error("character-audit.md table is missing or malformed.");
  }

  const header = parseCells(lines[0]);
  const separator = parseCells(lines[1]);
  if (separator.some((segment) => !/^-+$/.test(segment.replace(/\s+/g, "")))) {
    throw new Error("character-audit.md table separator row is malformed.");
  }

  const missingHeaders = REQUIRED_HEADERS.filter((required) => !header.includes(required));
  if (missingHeaders.length > 0) {
    throw new Error(`character-audit.md missing required header(s): ${missingHeaders.join(", ")}`);
  }

  const typeSeen = new Set();
  const parsedRows = [];

  lines.slice(2).forEach((line, rowIndex) => {
    const cells = parseCells(line);
    if (cells.length !== header.length) {
      throw new Error(
        `character-audit.md row ${rowIndex + 3} has ${cells.length} cells; expected ${header.length}.`
      );
    }

    const row = Object.fromEntries(header.map((key, index) => [key, cells[index]]));
    const type = row.Type;

    if (!SUPPORTED_TYPES.includes(type)) {
      throw new Error(`Unsupported character type '${type}' at row ${rowIndex + 3}.`);
    }

    if (typeSeen.has(type)) {
      throw new Error(`Duplicate character type '${type}' at row ${rowIndex + 3}.`);
    }

    typeSeen.add(type);
    parsedRows.push(row);
  });

  for (const type of SUPPORTED_TYPES) {
    if (!typeSeen.has(type)) {
      throw new Error(`Missing character type '${type}' in character-audit.md.`);
    }
  }

  return parsedRows;
}

function parseNullable(value) {
  const normalized = value.trim();
  if (normalized === "" || normalized === "TODO" || normalized === "N/A" || normalized === "-") {
    return null;
  }
  return normalized;
}

function deriveAssetKey(row) {
  const candidates = [
    row.Transparent,
    row.Idle,
    row.Walk,
    row.Work,
    row.Rest,
    row.Sleep,
    row.Dance,
    row.Train,
    row["Task Submit"]
  ];

  for (const candidate of candidates) {
    const normalized = parseNullable(candidate);
    if (typeof normalized !== "string") {
      continue;
    }

    const match = normalized.match(/^\/assets\/characters\/([^/]+)\//);
    if (match?.[1]) {
      return match[1];
    }
  }

  throw new Error(`Unable to derive assetKey for character type '${row.Type}'.`);
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

export function buildCharacterManifest({
  auditPath = defaultAuditPath,
  manifestPath = defaultManifestPath,
  publicRoot = defaultPublicRoot
} = {}) {
  const auditMarkdown = fs.readFileSync(auditPath, "utf8");
  const rows = parseMarkdownTable(auditMarkdown);

  const manifestByType = new Map(
    rows.map((row) => [
      row.Type,
      {
        type: row.Type,
        assetKey: deriveAssetKey(row),
        title: row.Title,
        sourceUrl: parseNullable(row["Source URL"]),
        quality: parseNullable(row.Quality),
        transparent: parseNullable(row.Transparent),
        states: {
          idle: parseNullable(row.Idle),
          walk: parseNullable(row.Walk),
          work: parseNullable(row.Work),
          rest: parseNullable(row.Rest),
          sleep: parseNullable(row.Sleep),
          dance: parseNullable(row.Dance),
          train: parseNullable(row.Train),
          "task-submit": parseNullable(row["Task Submit"])
        }
      }
    ])
  );

  const manifest = SUPPORTED_TYPES.map((type) => manifestByType.get(type));

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  ensureDirectory(path.resolve(publicRoot, "assets/maps"));
  ensureDirectory(path.resolve(publicRoot, "assets/ui"));

  manifest.forEach((entry) => {
    ensurePlaceholderAsset(entry.transparent, publicRoot);
    Object.values(entry.states).forEach((assetPath) => {
      ensurePlaceholderAsset(assetPath, publicRoot);
    });
  });

  return { manifest, manifestPath };
}

function ensurePlaceholderAsset(assetPath, publicRoot) {
  if (typeof assetPath !== "string" || !assetPath.startsWith("/assets/")) {
    return;
  }

  const absoluteAssetPath = path.resolve(publicRoot, `.${assetPath}`);
  ensureDirectory(path.dirname(absoluteAssetPath));

  if (!fs.existsSync(absoluteAssetPath)) {
    fs.writeFileSync(absoluteAssetPath, Buffer.from(TRANSPARENT_PNG_BASE64, "base64"));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const { manifest, manifestPath } = buildCharacterManifest();
  console.log(`Wrote ${manifest.length} character entries to ${manifestPath}`);
}
