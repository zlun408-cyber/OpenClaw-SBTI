import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auditPath = path.resolve(__dirname, "../docs/assets/character-audit.md");
const manifestPath = path.resolve(__dirname, "../src/assets/characters/manifest.json");

function parseMarkdownTable(markdown) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (lines.length < 2) {
    throw new Error("character-audit.md table is missing or malformed.");
  }

  const header = lines[0]
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

  const rows = lines.slice(2);

  return rows
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    )
    .filter((cells) => cells.length === header.length)
    .map((cells) =>
      Object.fromEntries(header.map((key, index) => [key, cells[index]]))
    );
}

function nonEmpty(value) {
  return value && value !== "TODO" ? value : "";
}

const auditMarkdown = fs.readFileSync(auditPath, "utf8");
const rows = parseMarkdownTable(auditMarkdown);

const manifest = rows.map((row) => ({
  type: row.Type,
  title: row.Title,
  sourceUrl: nonEmpty(row["Source URL"]),
  quality: nonEmpty(row.Quality),
  states: {
    transparent: nonEmpty(row.Transparent),
    idle: nonEmpty(row.Idle),
    walk: nonEmpty(row.Walk),
    work: nonEmpty(row.Work),
    rest: nonEmpty(row.Rest),
    train: nonEmpty(row.Train)
  }
}));

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${manifest.length} character entries to ${manifestPath}`);
