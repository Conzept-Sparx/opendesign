import path from "path";
import { SPEC_DIR, TOOL } from "./constants";
import { write } from "./fsx";
import { load, Model } from "./model";
import { bold, dim, green, log, red, yellow } from "./ui";

export interface Finding { level: "fail" | "warn"; check: string; message: string }
export interface Result {
  status: "PASS" | "FAIL";
  findings: Finding[];
  coverage: { id: string; screens: string[]; tagged: boolean | null; retired: boolean; quality: boolean }[];
  stats: { reqs: number; inScreens: number; taggedOfCovered: number; covered: number; screens: number; generated: number };
  evidence: { id: string; observed: number; research: number; assumed: number }[];
}

export function check(m: Model): Result {
  const findings: Finding[] = [];
  const fail = (check: string, message: string) => findings.push({ level: "fail", check, message });
  const warn = (check: string, message: string) => findings.push({ level: "warn", check, message });
  const reqIds = new Set(m.reqs.map((r) => r.id));
  const active = m.reqs.filter((r) => !r.retired);
  const qualityIds = new Set(m.reqs.filter((r) => r.quality).map((r) => r.id));
  const retiredIds = new Set(m.reqs.filter((r) => r.retired).map((r) => r.id));

  for (const id of m.duplicates) fail("ids", `${id} is defined more than once`);

  // Screens → requirements → code
  let covered = 0;
  let generated = 0;
  for (const s of m.screens) {
    for (const r of s.covers) if (!reqIds.has(r)) fail("trace", `${s.id} covers ${r}, which is not in requirements.md`);
    for (const r of s.covers) if (retiredIds.has(r)) warn("trace", `${s.id} still covers ${r}, which is retired; remove it from covers and from the code`);
    for (const r of s.mentioned) if (reqIds.has(r) && !s.covers.includes(r) && !retiredIds.has(r)) warn("trace", `${s.id} mentions ${r} but doesn't list it in covers`);
    if (s.flow && !m.flows.includes(s.flow)) warn("trace", `${s.id} names flow ${s.flow}, which doesn't exist in flows/`);
    if (s.pattern && m.patterns.length && !m.patterns.includes(s.pattern)) warn("design-system", `${s.id} names pattern ${s.pattern}, which isn't defined in design-system.md`);
    if (!s.code) { warn("trace", `${s.id} has no code: path in its frontmatter`); continue; }
    if (!s.codeExists) { warn("trace", `${s.id} is not generated yet (${s.code} doesn't exist)`); continue; }
    generated++;
    for (const r of s.covers) {
      if (retiredIds.has(r) || qualityIds.has(r)) continue;
      if (s.tags.has(r)) covered++;
      else fail("trace", `${s.id} lists ${r} but no element in ${s.code} carries data-req="${r}"`);
    }
  }
  for (const c of m.codeFiles) {
    for (const t of new Set(c.tags)) if (!reqIds.has(t)) fail("trace", `${c.file} tags ${t}, which is not in requirements.md`);
  }
  const coverage = m.reqs.map((r) => {
    const screens = m.screens.filter((s) => s.covers.includes(r.id));
    const gen = screens.filter((s) => s.codeExists);
    return { id: r.id, screens: screens.map((s) => s.id), tagged: gen.length ? gen.every((s) => s.tags.has(r.id)) : null, retired: r.retired, quality: r.quality };
  });
  for (const c of coverage) if (!c.retired && c.screens.length === 0 && m.screens.length > 0) warn("trace", `${c.id} isn't covered by any screen yet`);

  // Requirements → goals / edge cases
  const known = new Set([...m.goals, ...m.edgeCases]);
  for (const r of active) {
    if (r.serves.length === 0 && !/\ball\b/i.test(r.text + r.source)) warn("trace", `${r.id} doesn't list the goals (G) or edge cases (EC) it serves`);
    for (const s of r.serves) if (!known.has(s)) warn("trace", `${r.id} serves ${s}, which isn't defined in users.md or journeys.md`);
  }
  for (const ec of m.edgeCases) if (!active.some((r) => r.serves.includes(ec))) warn("trace", `${ec} has no requirement that handles it`);

  // Design system
  if (m.components.size) {
    for (const c of m.codeFiles) for (const imp of new Set(c.imports)) {
      if (!m.components.has(imp)) fail("design-system", `${c.file} imports '${imp}', which isn't listed in design-system.md`);
    }
  }
  if (m.variants.size) {
    for (const c of m.codeFiles) {
      const seen = new Set<string>();
      for (const { component, variant } of c.variants) {
        const key = `${component}|${variant}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!m.variants.has(variant)) warn("design-system", `${c.file} uses variant '${variant}', which isn't listed in design-system.md`);
        else if (component && !m.variantPairs.has(`${component.toLowerCase()}|${variant}`)) warn("design-system", `${c.file} uses variant '${variant}' on ${component}, but design-system.md doesn't list it for ${component}`);
      }
    }
  }

  // Evidence
  const ev = new Set(m.evidence);
  for (const c of m.citations) if (!ev.has(c.ev)) fail("evidence", `${c.file} cites ${c.ev}, but research/evidence has no ${c.ev} file`);
  for (const p of m.personas) {
    const total = p.observed + p.research + p.assumed;
    if (total && p.assumed / total > 0.5) warn("evidence", `${p.id} is ${Math.round((100 * p.assumed) / total)}% assumption (${p.assumed} of ${total}); plan research before treating it as fact`);
  }

  const coveredReqs = new Set(m.screens.flatMap((s) => s.covers));
  const totalCovers = m.screens.filter((s) => s.codeExists).reduce((n, s) => n + s.covers.filter((c) => !retiredIds.has(c) && !qualityIds.has(c)).length, 0);
  return {
    status: findings.some((x) => x.level === "fail") ? "FAIL" : "PASS",
    findings,
    coverage,
    stats: { reqs: active.length, inScreens: active.filter((r) => coveredReqs.has(r.id)).length, taggedOfCovered: totalCovers, covered, screens: m.screens.length, generated },
    evidence: m.personas,
  };
}

function report(m: Model, r: Result): string {
  const fails = r.findings.filter((f) => f.level === "fail");
  const warns = r.findings.filter((f) => f.level === "warn");
  const yes = (v: boolean | null) => (v === null ? "not generated" : v ? "yes" : "**no**");
  return [
    "# Verify report",
    "",
    `_Generated by \`${TOOL} verify\` — do not edit by hand._`,
    "",
    `**Result: ${r.status}** · ${r.stats.inScreens} of ${r.stats.reqs} requirements covered by a screen · ` +
      `${r.stats.covered} of ${r.stats.taggedOfCovered} screen requirements tagged in generated code · ` +
      `${r.stats.generated} of ${r.stats.screens} screens generated`,
    "",
    "## Requirement coverage",
    "",
    "| Requirement | Screens | Tagged in code |",
    "|---|---|---|",
    ...r.coverage.map((c) => `| ${c.id}${c.retired ? " (retired)" : c.quality ? " (quality)" : ""} | ${c.screens.join(", ") || "—"} | ${!c.screens.length ? "—" : c.quality ? "by review" : yes(c.tagged)} |`),
    "",
    "_Quality requirements are checked in `critique`, not by tags: a tag on a wrapper element proves nothing about contrast or keyboard access._",
    "",
    "## Persona evidence",
    "",
    ...(r.evidence.length ? r.evidence.map((p) => `- ${p.id}: observed ${p.observed} · research ${p.research} · assumed ${p.assumed}`) : ["- no personas yet"]),
    "",
    "## Failures",
    "",
    ...(fails.length ? fails.map((f) => `- [${f.check}] ${f.message}`) : ["- none"]),
    "",
    "## Warnings",
    "",
    ...(warns.length ? warns.map((f) => `- [${f.check}] ${f.message}`) : ["- none"]),
    "",
    "## Open questions",
    "",
    ...(m.questions.length ? m.questions.map((q) => `- ${q.id} ${q.text}`) : ["- none"]),
    "",
  ].join("\n");
}

export function verify(root: string, opts: { json?: boolean }): number {
  const m = load(root);
  if (!m.hasConfig) throw new Error(`No ${SPEC_DIR}/config.json here. Run \`${TOOL} init\` first.`);
  const r = check(m);
  write(path.join(m.dir, "verify-report.md"), report(m, r));
  if (opts.json) {
    console.log(JSON.stringify({ ...r, questions: m.questions }, null, 2));
    return r.status === "PASS" ? 0 : 1;
  }
  const fails = r.findings.filter((f) => f.level === "fail");
  const warns = r.findings.filter((f) => f.level === "warn");
  log();
  log(`${r.status === "PASS" ? green(bold("PASS")) : red(bold("FAIL"))}  ` +
    `${r.stats.inScreens}/${r.stats.reqs} requirements in screens · ${r.stats.covered}/${r.stats.taggedOfCovered} tagged in code · ${r.stats.generated}/${r.stats.screens} screens generated`);
  if (fails.length) { log(); fails.forEach((f) => log(`  ${red("✗")} ${f.message}`)); }
  if (warns.length) { log(); warns.forEach((f) => log(`  ${yellow("!")} ${f.message}`)); }
  if (m.questions.length) log(`\n  ${dim(`${m.questions.length} open question(s) in requirements.md`)}`);
  log(dim(`\n  Full report: ${path.relative(root, path.join(m.dir, "verify-report.md")) || "verify-report.md"}`));
  log();
  return r.status === "PASS" ? 0 : 1;
}
