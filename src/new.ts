import path from "path";
import { SPEC_DIR, TOOL } from "./constants";
import { PKG_ROOT, exists, listFiles, read, write } from "./fsx";
import { readConfig } from "./init";
import { green, log } from "./ui";

const pascal = (s: string) => s.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

export function create(root: string, kind: string, slug: string) {
  const cfg = readConfig(root);
  if (!cfg) throw new Error(`No ${SPEC_DIR}/config.json here. Run \`${TOOL} init\` first.`);
  if (!slug && kind !== "evidence") throw new Error(`Usage: ${TOOL} new ${kind} <slug>`);
  slug = (slug || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const dir = path.join(root, SPEC_DIR);
  const tpl = (rel: string) => read(path.join(PKG_ROOT, "templates", rel));
  let target = "";
  let text = "";
  if (kind === "screen") {
    target = path.join(dir, "screens", `${slug}.md`);
    text = tpl("screens/_template.md").replace(/SCR-slug/g, `SCR-${slug}`).replace("prototype/src/screens/Slug.tsx", `${cfg.prototype}/src/screens/${pascal(slug)}.tsx`);
  } else if (kind === "flow") {
    target = path.join(dir, "flows", `FLOW-${slug}.md`);
    text = tpl("flows/_template.md").replace(/FLOW-slug/g, `FLOW-${slug}`);
  } else if (kind === "concept") {
    const used = listFiles(path.join(dir, "concepts")).map((p) => path.basename(p).match(/^CON-([A-Z])/)?.[1]).filter(Boolean);
    const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find((l) => !used.includes(l)) || "Z";
    target = path.join(dir, "concepts", `CON-${letter}-${slug}.md`);
    text = tpl("concepts/_template.md").replace(/CON-A/g, `CON-${letter}`);
  } else if (kind === "evidence") {
    const nums = listFiles(path.join(dir, "research/evidence")).map((p) => Number(path.basename(p).match(/^EV-(\d+)/)?.[1] || 0));
    const id = `EV-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
    target = path.join(dir, "research/evidence", `${id}-${slug}.md`);
    text = tpl("research/evidence/_template.md").replace(/EV-000/g, id).replace("YYYY-MM-DD", new Date().toISOString().slice(0, 10));
  } else {
    throw new Error(`Unknown type '${kind}'. Use screen, flow, concept or evidence.`);
  }
  if (exists(target)) throw new Error(`${path.relative(root, target)} already exists.`);
  write(target, text);
  log(`${green("✓")} Created ${path.relative(root, target)}`);
}
