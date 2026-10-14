import fs from "fs";
import path from "path";

export const exists = (p: string) => fs.existsSync(p);
export const read = (p: string) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

export function write(p: string, content: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

export function listFiles(dir: string, filter: (f: string) => boolean = () => true): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full, filter));
    else if (filter(full)) out.push(full);
  }
  return out.sort();
}

/** Copy a directory tree, never overwriting existing files. Returns files created. */
export function copyMissing(src: string, dest: string): string[] {
  const created: string[] = [];
  for (const file of listFiles(src)) {
    const target = path.join(dest, path.relative(src, file));
    if (!fs.existsSync(target)) {
      write(target, fs.readFileSync(file, "utf8"));
      created.push(target);
    }
  }
  return created;
}

/** Package root: dist/ sits one level below it. */
export const PKG_ROOT = path.resolve(__dirname, "..");

export interface Frontmatter { [key: string]: string | string[] }

export function frontmatter(text: string): { data: Frontmatter; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  const data: Frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim();
    const list = value.match(/^\[(.*)\]$/);
    data[kv[1]] = list ? list[1].split(",").map((s) => s.trim()).filter(Boolean) : value;
  }
  return { data, body: text.slice(m[0].length) };
}

export const asList = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []);
export const asString = (v: string | string[] | undefined): string => (Array.isArray(v) ? v.join(", ") : v || "");
