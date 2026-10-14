import { SPEC_DIR, TOOL } from "./constants";
import path from "path";
import { isFilled, load } from "./model";
import { PKG_ROOT, listFiles, read } from "./fsx";
import { check } from "./verify";
import { bold, cyan, dim, green, log, yellow } from "./ui";
import { invocation } from "./agents";
import { readConfig } from "./init";

export function status(root: string) {
  const m = load(root);
  if (!m.hasConfig) throw new Error(`No ${SPEC_DIR}/config.json here. Run \`${TOOL} init\` first.`);
  const r = check(m);
  const filled = (name: string) => isFilled(m.files[name], read(path.join(PKG_ROOT, "templates", name)));
  const ev = m.personas.reduce((a, p) => ({ o: a.o + p.observed, r: a.r + p.research, a: a.a + p.assumed }), { o: 0, r: 0, a: 0 });
  const steps: [string, boolean, string][] = [
    ["system", filled("design-system.md"), `${m.components.size} components, ${m.variants.size} variants`],
    ["brief", filled("brief.md"), filled("brief.md") ? "written" : "not started"],
    ["research", m.evidence.length > 0 || filled("research/plan.md"), `${m.evidence.length} evidence files`],
    ["users", m.personas.length > 0, `${m.personas.length} personas, ${m.goals.length} goals · evidence ${ev.o} observed / ${ev.r} research / ${ev.a} assumed`],
    ["journeys", m.edgeCases.length > 0 || filled("journeys.md"), `${m.edgeCases.length} edge cases`],
    ["requirements", m.reqs.length > 0, `${r.stats.reqs} requirements, ${m.questions.length} open questions`],
    ["ideate", m.concepts.length > 0 || m.decisions.length > 0, `${m.concepts.length} concepts, ${m.decisions.length} decisions`],
    ["structure", filled("ia.md") || m.flows.length > 0, `${m.flows.length} flows`],
    ["screen", m.screens.length > 0, `${m.screens.length} screen specs · ${r.stats.inScreens}/${r.stats.reqs} requirements covered`],
    ["generate", r.stats.generated > 0, `${r.stats.generated}/${m.screens.length} screens generated`],
  ];
  const count = (rel: string, re: RegExp) => listFiles(path.join(m.dir, rel), (p) => re.test(path.basename(p)) && !path.basename(p).startsWith("_")).length;
  const critiques = count("critique", /\.md$/);
  const rationales = count("rationale", /\.md$/);
  const extras = [["explore notes", count("explore", /\.md$/)], ["wireframes", count("wireframes", /\.html$/)], ["artefacts", count("artefacts", /\.md$/)]]
    .filter(([, n]) => n).map(([l, n]) => `${n} ${l}`).join(" · ");
  steps.push(["critique", critiques > 0, `${critiques} critiques`], ["rationale", rationales > 0, `${rationales} rationale documents`]);
  const cfg = readConfig(root);
  const tool = cfg?.tools?.[0] || "claude";
  log();
  log(bold(`${cfg?.name || "Project"} — OpenDesign status`));
  log();
  for (const [id, done, detail] of steps) log(`  ${done ? green("●") : dim("○")} ${id.padEnd(13)} ${done ? detail : dim(detail)}`);
  if (extras) log(`  ${dim("also: " + extras)}`);
  log();
  const fails = r.findings.filter((f) => f.level === "fail").length;
  const warns = r.findings.filter((f) => f.level === "warn").length;
  log(`  verify: ${r.status === "PASS" ? green("PASS") : yellow("FAIL")} ${dim(`(${fails} failures, ${warns} warnings)`)}`);
  const generated = steps.find(([id]) => id === "generate")![1];
  const next = steps.find(([id, done]) => !done && (generated || id !== "critique" && id !== "rationale"));
  const suggestion = next ? next[0] : fails ? "verify" : "view";
  log(`  next:   ${cyan(invocation(tool, suggestion))}`);
  log();
}
