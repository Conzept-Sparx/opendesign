import path from "path";
import { SPEC_DIR } from "./constants";
import { asList, asString, exists, frontmatter, listFiles, read } from "./fsx";

export interface Req { id: string; text: string; source: string; serves: string[]; retired: boolean; quality: boolean }
export interface Persona { id: string; observed: number; research: number; assumed: number; goals: string[] }
export interface Screen { id: string; file: string; persona: string; flow: string; pattern: string; covers: string[]; mentioned: string[]; code: string; codeExists: boolean; tags: Set<string> }
export interface Citation { file: string; ev: string }

export interface Model {
  root: string;
  dir: string;
  prototype: string;
  hasConfig: boolean;
  files: Record<string, string>;
  evidence: string[];
  personas: Persona[];
  goals: string[];
  edgeCases: string[];
  reqs: Req[];
  questions: { id: string; text: string }[];
  concepts: string[];
  decisions: string[];
  flows: string[];
  screens: Screen[];
  components: Set<string>;
  patterns: string[];
  variants: Set<string>;
  variantPairs: Set<string>;
  citations: Citation[];
  duplicates: string[];
  codeFiles: { file: string; tags: string[]; imports: string[]; variants: { component: string | null; variant: string }[] }[];
}

const TAG_RE = /`\[(observed|research|assumed)(?::\s*([^\]`]*))?\]`/g;
const DATA_REQ_RE = /data-req=(?:"([^"]*)"|'([^']*)'|\{\s*["'`]([^"'`]*)["'`]\s*\})/g;

export function codeTags(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(DATA_REQ_RE)) out.push(...(m[1] ?? m[2] ?? m[3] ?? "").split(/\s+/).filter(Boolean));
  return out;
}

function tableIds(text: string, prefix: string): string[] {
  return [...text.matchAll(new RegExp(`^\\|\\s*(${prefix}-\\d{3,})\\s*\\|`, "gm"))].map((m) => m[1]);
}

export function load(root: string): Model {
  const dir = path.join(root, SPEC_DIR);
  const f = (rel: string) => read(path.join(dir, rel));
  const hasConfig = exists(path.join(dir, "config.json"));
  const config = hasConfig ? JSON.parse(f("config.json")) : {};
  const prototype = path.join(root, config.prototype || "prototype");
  const files: Record<string, string> = {};
  for (const name of ["brief.md", "users.md", "journeys.md", "requirements.md", "design-system.md", "decisions.md", "ia.md", "research/plan.md"]) files[name] = f(name);

  const evidence = [...new Set(listFiles(path.join(dir, "research/evidence"), (p) => /^EV-\d{3,}.*\.md$/.test(path.basename(p)))
    .map((p) => path.basename(p).match(/^(EV-\d{3,})/)![1]))];

  // Personas: count evidence tags per "## P<n>" section, skipping the legend lines.
  const personas: Persona[] = [];
  let current: Persona | null = null;
  for (const line of files["users.md"].split(/\r?\n/)) {
    const h = line.match(/^##\s+(P\d+)\b(?!.*<)/);
    if (h) { current = { id: h[1], observed: 0, research: 0, assumed: 0, goals: [] }; personas.push(current); continue; }
    if (!current || !/^\s*-\s+(?!`)/.test(line)) continue;
    const g = line.match(/^\s*-\s+(G\d+)\b(?!.*<)/);
    if (g) current.goals.push(g[1]);
    for (const m of line.matchAll(TAG_RE)) current[m[1] as "observed" | "research" | "assumed"]++;
  }
  const goals = [...files["users.md"].matchAll(/^\s*-\s+(G\d+)\b(?!.*<)/gm)].map((m) => m[1]);
  const edgeCases = tableIds(files["journeys.md"], "EC");

  const reqs: Req[] = [];
  let section = "";
  for (const line of files["requirements.md"].split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.*?)\s*$/);
    if (heading) { section = heading[1].toLowerCase(); continue; }
    const m = line.match(/^\|\s*(REQ-\d{3,})\s*\|(.*)\|\s*$/);
    if (!m) continue;
    const cells = m[2].split("|").map((c) => c.trim());
    reqs.push({
      id: m[1], text: cells[0] || "", source: cells[1] || "",
      serves: (cells[2] || "").match(/\b(G\d+|EC-\d{3,})\b/g) || [],
      retired: /^retired\b/i.test(cells[0] || ""),
      quality: section === "quality",
    });
  }
  const questions = [...files["requirements.md"].matchAll(/^\s*-\s+(Q\d+)\s+(.*)$/gm)].map((m) => ({ id: m[1], text: m[2] }));

  const concepts = listFiles(path.join(dir, "concepts"), (p) => /CON-[A-Z]/.test(path.basename(p))).map((p) => path.basename(p).match(/(CON-[A-Z]+)/)![1]);
  const decisions = tableIds(files["decisions.md"], "DEC");
  const flows = listFiles(path.join(dir, "flows"), (p) => p.endsWith(".md") && !path.basename(p).startsWith("_")).map((p) => path.basename(p, ".md"));

  const screens: Screen[] = listFiles(path.join(dir, "screens"), (p) => p.endsWith(".md") && !path.basename(p).startsWith("_")).map((p) => {
    const { data, body } = frontmatter(read(p));
    const code = asString(data.code);
    const codePath = code ? path.join(root, code) : "";
    const codeExists = !!codePath && exists(codePath);
    return {
      id: asString(data.id) || `SCR-${path.basename(p, ".md")}`,
      file: path.relative(root, p),
      persona: asString(data.persona),
      flow: asString(data.flow),
      pattern: asString(data.pattern),
      mentioned: [...new Set(body.match(/\bREQ-\d{3,}\b/g) || [])],
      covers: asList(data.covers).filter((c) => /^REQ-\d+/.test(c)),
      code,
      codeExists,
      tags: new Set(codeExists ? codeTags(read(codePath)) : []),
    };
  });

  const ds = files["design-system.md"];
  const components = new Set([...ds.matchAll(/`@\/components\/ui\/([\w-]+)`/g)].map((m) => m[1]));
  const patterns = patternsOf(ds);
  const variants = new Set<string>();
  const variantSection = ds.split(/^##\s+Variants\s*$/m)[1]?.split(/^##\s/m)[0] || "";
  const variantPairs = new Set<string>();
  for (const m of variantSection.matchAll(/^\|\s*([^|`]+?)\s*\|\s*`([\w-]+)`\s*\|/gm)) {
    variants.add(m[2]);
    variantPairs.add(`${m[1].toLowerCase()}|${m[2]}`);
  }

  const citations: Citation[] = [];
  for (const name of ["brief.md", "users.md", "journeys.md", "requirements.md", "design-system.md"]) {
    for (const m of files[name].matchAll(TAG_RE)) {
      for (const ev of (m[2] || "").match(/\bEV-\d{3,}\b/g) || []) citations.push({ file: name, ev });
    }
  }
  for (const m of files["requirements.md"].matchAll(/^\|\s*REQ-\d+\s*\|[^|]*\|([^|]*)\|/gm)) {
    for (const ev of m[1].match(/\bEV-\d{3,}\b/g) || []) citations.push({ file: "requirements.md", ev });
  }

  const allIds = [...goals, ...edgeCases, ...reqs.map((r) => r.id), ...decisions, ...screens.map((s) => s.id)];
  const duplicates = [...new Set(allIds.filter((id, i) => allIds.indexOf(id) !== i))];

  const srcDir = path.join(prototype, "src");
  const codeFiles = listFiles(srcDir, (p) => /\.(t|j)sx?$/.test(p) && !p.includes(`${path.sep}components${path.sep}ui${path.sep}`) && !p.includes(`${path.sep}explorations${path.sep}`))
    .map((p) => {
      const code = read(p);
      return {
        file: path.relative(root, p),
        tags: codeTags(code),
        imports: [...code.matchAll(/from\s+["']@\/components\/ui\/([\w-]+)["']/g)].map((m) => m[1]),
        variants: codeVariants(code),
      };
    });
  // Screen code may live outside prototype/src (e.g. in examples); include it.
  for (const s of screens) {
    if (s.codeExists && !codeFiles.some((c) => c.file === path.normalize(s.code))) {
      const code = read(path.join(root, s.code));
      codeFiles.push({
        file: path.normalize(s.code), tags: codeTags(code),
        imports: [...code.matchAll(/from\s+["']@\/components\/ui\/([\w-]+)["']/g)].map((m) => m[1]),
        variants: codeVariants(code),
      });
    }
  }

  return { root, dir, prototype, hasConfig, files, evidence, personas, goals, edgeCases, reqs, questions, concepts, decisions, flows, screens, components, patterns, variants, variantPairs, citations, duplicates, codeFiles };
}

/** True when a spec file has at least `min` meaningful lines that aren't in its template. */
export function isFilled(text: string, template: string, min = 2): boolean {
  const norm = (t: string) =>
    t.replace(/^---[\s\S]*?---/, "").replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/).map((l) => l.trim())
      .filter((l) => l && !/^\|[-\s|]+\|$/.test(l) && !/^#+\s/.test(l));
  const base = new Set(norm(template));
  return norm(text).filter((l) => !base.has(l) && !/<[a-z][^>]*>/i.test(l)).length >= min;
}

/** Variants used in code, with the JSX component they sit on (null when it can't be told, e.g. cva objects). */
function codeVariants(code: string): { component: string | null; variant: string }[] {
  const out: { component: string | null; variant: string }[] = [];
  const re = /\bvariant(?:=\{([^}]*)\}|=["']([\w-]+)["']|:\s*["']([\w-]+)["'])/g;
  for (const m of code.matchAll(re)) {
    const names = m[1] !== undefined ? [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]) : [m[2] ?? m[3]];
    let component: string | null = null;
    if (m[3] === undefined) {
      const tags = [...code.slice(0, m.index).matchAll(/<([A-Z]\w*)/g)];
      component = tags.length ? tags[tags.length - 1][1] : null;
    }
    for (const variant of names) out.push({ component, variant });
  }
  return out;
}

/** Pattern names defined in design-system.md, ignoring the template's HTML comments. */
export function patternsOf(designSystem: string): string[] {
  return [...new Set([...designSystem.replace(/<!--[\s\S]*?-->/g, "").matchAll(/\bPAT-[\w-]+/g)].map((m) => m[0]))];
}
