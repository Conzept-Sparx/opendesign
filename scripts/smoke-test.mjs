// End-to-end smoke test: init in a temp project, check generated files, verify the example,
// and confirm verify fails when a requirement tag is removed.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "dist", "cli.js");
const run = (cwd, ...args) => {
  try {
    return { code: 0, out: execFileSync("node", [cli, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NO_COLOR: "1" } }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || "") + (e.stderr || "") };
  }
};
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "ok  " : "FAIL"} ${msg}`); if (!cond) failures++; };
const has = (dir, rel) => fs.existsSync(path.join(dir, rel));

// 0. version
ok(run(root, "--version").out.trim() === "0.1.0", "--version prints the version");

// 1. init with all tools
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "opendesign-"));
const init = run(tmp, "init", "--name", "Smoke");
ok(init.code === 0, "init exits 0");
for (const rel of [
  "opendesign/config.json", "opendesign/CONVENTIONS.md", "opendesign/requirements.md", "opendesign/screens/_template.md",
  "opendesign/critique/_template.md", ".claude/commands/od/brief.md", ".claude/skills/opendesign-generate/SKILL.md",
  ".codex/skills/opendesign-verify/SKILL.md", ".opencode/commands/od-screen.md", ".opencode/skills/opendesign-users/SKILL.md",
  "AGENTS.md", "CLAUDE.md", "opendesign/ARTEFACTS.md", "opendesign/explore/_template.md",
  "opendesign/wireframes/_template.html", "opendesign/artefacts/_template.md",
  ...["explore", "lock", "view", "change", "artefact"].map((id) => `.claude/commands/od/${id}.md`),
  ".codex/skills/opendesign-explore/SKILL.md", ".opencode/commands/od-lock.md",
]) ok(has(tmp, rel), `init created ${rel}`);
const skill = fs.readFileSync(path.join(tmp, ".claude/skills/opendesign-brief/SKILL.md"), "utf8");
ok(/^---\nname: opendesign-brief\ndescription: .+\n---/.test(skill), "skill has name/description frontmatter");
const cmd = fs.readFileSync(path.join(tmp, ".claude/commands/od/brief.md"), "utf8");
ok(cmd.includes("$ARGUMENTS"), "command passes $ARGUMENTS");
const agents = fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8");
ok(agents.includes("$opendesign-brief") && agents.includes("/od-brief"), "AGENTS.md lists Codex and OpenCode invocations");

// 2. idempotent init/update keeps user edits and doesn't duplicate blocks
fs.appendFileSync(path.join(tmp, "opendesign/brief.md"), "\nMy edit\n");
run(tmp, "init");
run(tmp, "update");
ok(fs.readFileSync(path.join(tmp, "opendesign/brief.md"), "utf8").includes("My edit"), "re-init keeps user edits");
ok((fs.readFileSync(path.join(tmp, "CLAUDE.md"), "utf8").match(/OPENDESIGN:START/g) || []).length === 1, "managed block not duplicated");

// 3. new
ok(run(tmp, "new", "screen", "order-history").code === 0 && has(tmp, "opendesign/screens/order-history.md"), "new screen");
ok(run(tmp, "new", "evidence", "interview-1").code === 0 && has(tmp, "opendesign/research/evidence/EV-001-interview-1.md"), "new evidence numbers EV-001");
ok(run(tmp, "new", "concept", "calendar").code === 0 && has(tmp, "opendesign/concepts/CON-A-calendar.md"), "new concept letters CON-A");
ok(run(tmp, "status").code === 0, "status on a fresh project");
ok(run(tmp, "verify").code === 0, "verify passes on a fresh project");

// 4. a small traced project: verify passes, trace follows links, broken copies fail
const fx = fs.mkdtempSync(path.join(os.tmpdir(), "opendesign-fx-"));
run(fx, "init", "--tools", "claude", "--name", "Fixture");
const spec = (rel) => path.join(fx, "opendesign", rel);
const edit = (rel, from, to) => fs.writeFileSync(spec(rel), fs.readFileSync(spec(rel), "utf8").replace(from, to));
edit("users.md", "## P1 — <persona name>", "## P1 — Shopper");
edit("users.md", "- G1 <goal> `[assumed]`", "- G1 Find a past order quickly `[assumed]`");
edit("journeys.md", "| ID | Situation | Where it happens | Impact | Source |\n|---|---|---|---|---|",
  "| ID | Situation | Where it happens | Impact | Source |\n|---|---|---|---|---|\n| EC-001 | No orders yet | Order list | Looks broken | `[assumed]` |");
edit("requirements.md", "## Core\n\n| ID | Requirement | Source | Serves |\n|---|---|---|---|",
  "## Core\n\n| ID | Requirement | Source | Serves |\n|---|---|---|---|\n| REQ-001 | List past orders, newest first. | assumed | G1 |\n| REQ-002 | Explain an empty order list and offer a way forward. | assumed | G1, EC-001 |");
edit("requirements.md", "## Open questions", "## Open questions\n- Q1 How many orders should one page show? (affects REQ-001)");
run(fx, "new", "screen", "order-history");
edit("screens/order-history.md", "covers: []", "covers: [REQ-001, REQ-002]");
const code = path.join(fx, "prototype/src/screens/OrderHistory.tsx");
fs.mkdirSync(path.dirname(code), { recursive: true });
fs.writeFileSync(code, [
  'import { Card } from "@/components/ui/card";',
  'import { Button } from "@/components/ui/button";',
  'export default function OrderHistory() {',
  '  return (<Card><ul data-req="REQ-001"></ul><div data-req="REQ-002"><Button variant="outline">Start shopping</Button></div></Card>);',
  "}",
].join("\n"));
const v = run(fx, "verify");
ok(v.code === 0 && v.out.includes("2/2 tagged in code"), "verify passes on a traced project");
const tr = run(fx, "trace", "REQ-001");
ok(tr.code === 0 && tr.out.includes("SCR-order-history") && tr.out.includes("serves G1") && tr.out.includes("Q1"), "trace shows screen, goal and open question");
const te = run(fx, "trace", "EC-001");
ok(te.code === 0 && te.out.includes("REQ-002"), "trace of an edge case shows the requirement that serves it");
ok(run(fx, "trace", "REQ-999").code === 1, "trace of an unknown ID fails");
fs.writeFileSync(code, fs.readFileSync(code, "utf8").replace(' data-req="REQ-002"', ""));
const res = run(fx, "verify");
ok(res.code === 1 && res.out.includes("REQ-002"), "verify fails and names the missing REQ-002 tag");
fs.writeFileSync(code, 'import { Dialog } from "@/components/ui/dialog";\n' + fs.readFileSync(code, "utf8"));
ok(run(fx, "verify").out.includes("'dialog'"), "verify flags a component missing from the design system");

fs.rmSync(tmp, { recursive: true, force: true });
fs.rmSync(fx, { recursive: true, force: true });
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
