import fs from "fs";
import path from "path";
import { SPEC_DIR, TOOL, TOOL_TITLE, TOOLS, Tool, VERSION } from "./constants";
import { PKG_ROOT, copyMissing, exists, read, write } from "./fsx";
import { invocation, loadWorkflows, writeAgentFiles, writeInstructionBlocks } from "./agents";
import { bold, cyan, dim, green, log, yellow } from "./ui";

export interface Config { name: string; version: string; stack: string; prototype: string; tools: Tool[]; createdWith: string }

export function parseTools(value: string | undefined, fallback: Tool[]): Tool[] {
  if (!value) return fallback;
  const tools = value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const bad = tools.filter((t) => !(TOOLS as readonly string[]).includes(t));
  if (bad.length) throw new Error(`Unknown tool: ${bad.join(", ")}. Choose from ${TOOLS.join(", ")}.`);
  return tools as Tool[];
}

export function readConfig(root: string): Config | null {
  const p = path.join(root, SPEC_DIR, "config.json");
  if (!exists(p)) return null;
  return JSON.parse(read(p)) as Config;
}

function refreshAgents(root: string, tools: Tool[]) {
  const wfs = loadWorkflows();
  // CONVENTIONS.md is owned by the tool and refreshed on every init/update.
  for (const owned of ["CONVENTIONS.md", "ARTEFACTS.md"]) {
    write(path.join(root, SPEC_DIR, owned), read(path.join(PKG_ROOT, "templates", owned)));
  }
  const files = writeAgentFiles(root, tools, wfs);
  const blocks = writeInstructionBlocks(root, tools, wfs);
  return { wfs, files, blocks };
}

function printCommands(tools: Tool[], ids: string[]) {
  for (const tool of tools) {
    const label = { claude: "Claude Code", codex: "Codex", opencode: "OpenCode" }[tool];
    log(`  ${bold(label.padEnd(12))} ${ids.slice(0, 4).map((id) => cyan(invocation(tool, id))).join("  ")}  ${dim("…")}`);
  }
}

export function init(root: string, opts: { tools?: string; name?: string; prototype?: string }) {
  const existing = readConfig(root);
  const tools = parseTools(opts.tools, existing?.tools || [...TOOLS]);
  const specDir = path.join(root, SPEC_DIR);
  const created = copyMissing(path.join(PKG_ROOT, "templates"), specDir);
  const config: Config = existing
    ? { ...existing, tools }
    : {
        name: opts.name || path.basename(path.resolve(root)),
        version: "0.1",
        stack: "React + TypeScript + Tailwind CSS + shadcn/ui",
        prototype: opts.prototype || "prototype",
        tools,
        createdWith: `${TOOL} ${VERSION}`,
      };
  write(path.join(specDir, "config.json"), JSON.stringify(config, null, 2) + "\n");
  const { wfs, files, blocks } = refreshAgents(root, tools);

  log();
  log(bold(`${TOOL_TITLE} ${existing ? "re-initialised" : "initialised"} in ${path.resolve(root)}`));
  log(`  ${green("✓")} ${SPEC_DIR}/ ${dim(existing ? `(kept your files, added ${created.length} missing)` : `(${created.length} files)`)}`);
  log(`  ${green("✓")} ${files.length} agent files for ${tools.join(", ")}`);
  log(`  ${green("✓")} instructions in ${blocks.join(", ")}`);
  log();
  log(bold("Start in your coding agent with:"));
  printCommands(tools, wfs.map((w) => w.id));
  log();
  log(`${dim("Start with")} ${cyan(invocation(tools[0], "next"))} ${dim("to see where the project stands, or")} ${cyan(invocation(tools[0], "explore"))} ${dim("to brainstorm a brief.")}`);
  if (!existing && !fs.existsSync(path.join(root, ".git"))) log(yellow("Tip: commit the opendesign/ folder so the spec is versioned with your work."));
  log();
}

export function update(root: string, opts: { tools?: string }) {
  const config = readConfig(root);
  if (!config) throw new Error(`No ${SPEC_DIR}/config.json here. Run \`${TOOL} init\` first.`);
  const tools = parseTools(opts.tools, config.tools);
  if (opts.tools) write(path.join(root, SPEC_DIR, "config.json"), JSON.stringify({ ...config, tools }, null, 2) + "\n");
  const created = copyMissing(path.join(PKG_ROOT, "templates"), path.join(root, SPEC_DIR));
  const { files, blocks } = refreshAgents(root, tools);
  log(`${green("✓")} Refreshed ${files.length} agent files and ${blocks.join(", ")} for ${tools.join(", ")}.`);
  if (created.length) log(`${green("✓")} Added ${created.length} new template files.`);
  log(dim("Your spec files were not changed."));
}
