import path from "path";
import { SPEC_DIR, TOOL } from "./constants";
import { listFiles, read } from "./fsx";
import { load, Model } from "./model";
import { bold, cyan, dim, green, log, red, yellow } from "./ui";

const KINDS: [RegExp, string][] = [
  [/^REQ-\d+$/, "Requirement"], [/^G\d+$/, "Goal"], [/^P\d+$/, "Persona"], [/^EC-\d+$/, "Edge case"],
  [/^DEC-\d+$/, "Decision"], [/^Q\d+$/, "Open question"], [/^EV-\d+$/, "Evidence"], [/^CON-[A-Z]+$/, "Concept"],
  [/^SCR-[\w-]+$/, "Screen"], [/^FLOW-[\w-]+$/, "Flow"],
];

interface Hit { file: string; line: number; text: string }

function idRegex(id: string) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\w-])${esc}(?![\\w-])`);
}

function searchFiles(m: Model): string[] {
  const spec = listFiles(m.dir, (p) => /\.(md|html)$/.test(p) && !path.basename(p).startsWith("_") &&
    !["verify-report.md", "CONVENTIONS.md", "ARTEFACTS.md"].includes(path.basename(p)));
  const code = m.codeFiles.map((c) => path.join(m.root, c.file));
  return [...new Set([...spec, ...code])];
}

function findHits(m: Model, id: string): Hit[] {
  const re = idRegex(id);
  const hits: Hit[] = [];
  for (const f of searchFiles(m)) {
    read(f).split(/\r?\n/).forEach((text, i) => { if (re.test(text)) hits.push({ file: path.relative(m.root, f), line: i + 1, text: text.trim() }); });
  }
  return hits;
}

const clip = (s: string, n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const cleanRow = (s: string) => s.replace(/^\|\s*/, "").replace(/\s*\|\s*$/, "").replace(/\s*\|\s*/g, " · ").replace(/`/g, "");

function definitionOf(m: Model, id: string, kind: string, hits: Hit[]): Hit | undefined {
  const isDef = (h: Hit) => {
    switch (kind) {
      case "Requirement": case "Edge case": case "Decision": return h.text.startsWith(`| ${id} |`);
      case "Goal": case "Open question": return new RegExp(`^-\\s+${id}\\b`).test(h.text);
      case "Persona": return new RegExp(`^##\\s+${id}\\b`).test(h.text);
      case "Evidence": case "Concept": case "Screen": case "Flow": return h.text === `id: ${id}`;
      default: return false;
    }
  };
  return hits.find(isDef);
}

export function trace(root: string, id: string) {
  if (!id) throw new Error(`Usage: ${TOOL} trace <ID>   e.g. REQ-006, G1, EC-003, SCR-my-attendance`);
  id = id.trim();
  if (!/^SCR-|^FLOW-/i.test(id)) id = id.toUpperCase();
  const kind = KINDS.find(([re]) => re.test(id))?.[1];
  if (!kind) throw new Error(`'${id}' doesn't look like an OpenDesign ID (REQ-001, G1, P1, EC-001, DEC-001, Q1, EV-001, CON-A, SCR-x, FLOW-x).`);
  const m = load(root);
  if (!m.hasConfig) throw new Error(`No ${SPEC_DIR}/config.json here. Run \`${TOOL} init\` first.`);
  const hits = findHits(m, id);
  if (!hits.length) throw new Error(`No ${id} found in ${SPEC_DIR}/ or the prototype.`);
  const def = definitionOf(m, id, kind, hits);

  log();
  log(`${bold(id)} ${dim(`— ${kind}`)}`);
  const reqDef = kind === "Requirement" ? m.reqs.find((x) => x.id === id)?.text : undefined;
  const defText = reqDef ?? (def && /^id:/.test(def.text) ? "" : def ? cleanRow(def.text.replace(new RegExp(`^(\\|\\s*)?-?\\s*${id}\\s*\\|?`), "")) : "");
  if (def) log(`  ${defText ? clip(defText, 140) + "  " : dim("defined in ")}${dim(`${def.file}:${def.line}`)}`);
  log();

  const goalText = (g: string) => findHits(m, g).find((h) => new RegExp(`^-\\s+${g}\\b`).test(h.text))?.text.replace(/^-\s+G\d+\s+/, "") || "";
  const ecText = (e: string) => { const h = findHits(m, e).find((x) => x.text.startsWith(`| ${e} |`)); return h ? cleanRow(h.text).split(" · ")[1] || "" : ""; };

  if (kind === "Requirement") {
    const r = m.reqs.find((x) => x.id === id)!;
    if (r.retired) log(yellow("  Retired."));
    log(bold("  Why it exists"));
    log(`    source: ${r.source || dim("—")}`);
    if (r.serves.length) r.serves.forEach((s) => log(`    serves ${cyan(s)} ${dim(clip(s.startsWith("G") ? goalText(s) : ecText(s), 90))}`));
    else log(yellow("    serves nothing: add the goals or edge cases it serves"));
    log();
    log(bold("  Where it's used"));
    const screens = m.screens.filter((s) => s.covers.includes(id));
    if (!screens.length) log(yellow("    not covered by any screen yet"));
    for (const s of screens) {
      const tag = !s.codeExists ? dim("not generated") : r.quality ? dim("checked by review") : s.tags.has(id) ? green("tagged in code") : red("NOT tagged in code");
      log(`    ${cyan(s.id)}  ${tag}${s.codeExists ? dim(`  ${s.code}`) : ""}`);
    }
    const tagged = m.codeFiles.filter((c) => c.tags.includes(id));
    for (const c of tagged) log(`    ${dim("code")} ${c.file} ${dim(`(${c.tags.filter((t) => t === id).length} element${c.tags.filter((t) => t === id).length > 1 ? "s" : ""})`)}`);
    const qs = m.questions.filter((q) => idRegex(id).test(q.text));
    for (const q of qs) log(`    ${yellow(q.id)} ${dim(clip(q.text, 100))}`);
    log();
  }
  if (kind === "Goal" || kind === "Edge case") {
    const reqs = m.reqs.filter((r) => r.serves.includes(id) && !r.retired);
    log(bold("  Served by"));
    if (!reqs.length) log(yellow(`    no requirement serves ${id} yet`));
    reqs.forEach((r) => log(`    ${cyan(r.id)} ${dim(clip(r.text, 100))}`));
    log();
  }
  if (kind === "Decision" && def) {
    const cells = cleanRow(def.text).split(" · ");
    log(bold("  Decision"));
    if (cells[2]) log(`    options: ${dim(clip(cells[2], 100))}`);
    if (cells[3]) log(`    why: ${dim(clip(cells[3], 100))}`);
    log(bold("  Affects"));
    const affects = (cells[4] || "").match(/\b(REQ-\d+|SCR-[\w-]+|FLOW-[\w-]+|EC-\d+|G\d+|P\d+)\b/g) || [];
    if (affects.length) affects.forEach((a) => log(`    ${cyan(a)}`));
    else log(yellow("    no IDs listed: say which REQ or screen this decision affects"));
    log();
  }
  if (kind === "Persona") {
    const p = m.personas.find((x) => x.id === id);
    if (p) {
      log(bold("  Goals"));
      p.goals.forEach((g) => log(`    ${cyan(g)} ${dim(clip(goalText(g), 90))}`));
      const reqs = m.reqs.filter((r) => !r.retired && r.serves.some((x) => p.goals.includes(x)));
      log(bold("  Requirements serving their goals"));
      if (!reqs.length) log(yellow("    none yet"));
      reqs.forEach((r) => log(`    ${cyan(r.id)} ${dim(clip(r.text, 90))}`));
      const screens = m.screens.filter((s) => s.persona === id);
      if (screens.length) { log(bold("  Screens")); screens.forEach((s) => log(`    ${cyan(s.id)}`)); }
      log(`  evidence: ${p.observed} observed · ${p.research} research · ${p.assumed} assumed`);
      log();
    }
  }
  if (kind === "Screen") {
    const s = m.screens.find((x) => x.id === id);
    if (s) {
      log(bold("  Covers"));
      const quality = s.covers.filter((c) => m.reqs.find((r) => r.id === c)?.quality);
      if (quality.length) log(dim(`    ${quality.join(", ")} are quality requirements: checked in critique, not by tags`));
      log(`    ${s.covers.join(", ") || yellow("nothing yet")}`);
      log(`    code: ${s.code || dim("—")} ${!s.code ? "" : !s.codeExists ? dim("(not generated)") : `${dim("·")} ${s.covers.filter((c) => s.tags.has(c)).length}/${s.covers.length} tagged`}`);
      log();
    }
  }

  const others = hits.filter((h) => h !== def);
  if (others.length) {
    log(bold("  Mentioned in"));
    const byFile = new Map<string, Hit[]>();
    others.forEach((h) => byFile.set(h.file, [...(byFile.get(h.file) || []), h]));
    for (const [file, list] of byFile) {
      const label = file.includes(`${SPEC_DIR}${path.sep}explore`) ? dim(" (exploration)") : "";
      log(`    ${file}${label}`);
      list.slice(0, 3).forEach((h) => log(dim(`      ${String(h.line).padStart(4)}  ${clip(cleanRow(h.text), 100)}`)));
      if (list.length > 3) log(dim(`            … ${list.length - 3} more`));
    }
    log();
  }
}
