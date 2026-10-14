#!/usr/bin/env node
import { TOOL, TOOL_TITLE, TOOLS, VERSION } from "./constants";
import { init, update } from "./init";
import { status } from "./status";
import { verify } from "./verify";
import { create } from "./new";
import { trace } from "./trace";
import { loadWorkflows, invocation } from "./agents";
import { bold, cyan, dim, log, red } from "./ui";

const HELP = `${bold(`${TOOL_TITLE} ${VERSION}`)} — spec-driven UX for AI coding agents

${bold("Usage")}
  ${TOOL} init [--tools ${TOOLS.join(",")}] [--name <project>] [--prototype <dir>]
  ${TOOL} update [--tools ...]        refresh agent commands and CONVENTIONS.md
  ${TOOL} status                      where the project stands, and what's next
  ${TOOL} verify [--json]             check traceability, design system and evidence
  ${TOOL} trace <ID>                  everything linked to an ID (REQ-006, G1, SCR-x…)
  ${TOOL} new <screen|flow|concept|evidence> <slug>
  ${TOOL} workflows                   list the agent workflows

${dim("Run inside your project folder. The design work happens in your coding agent;")}
${dim("this CLI sets up the spec and checks it.")}`;

function parse(argv: string[]) {
  const args: string[] = [];
  const opts: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) opts[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) opts[k] = argv[++i];
      else opts[k] = true;
    } else args.push(a);
  }
  return { args, opts };
}

function main() {
  const { args, opts } = parse(process.argv.slice(2));
  const root = process.cwd();
  if (opts.version && !args.length) { log(VERSION); return 0; }
  if (opts.help && !args.length) { log(HELP); return 0; }
  const str = (k: string) => (typeof opts[k] === "string" ? (opts[k] as string) : undefined);
  switch (args[0]) {
    case "init": init(root, { tools: str("tools"), name: str("name"), prototype: str("prototype") }); return 0;
    case "update": update(root, { tools: str("tools") }); return 0;
    case "status": status(root); return 0;
    case "verify": return verify(root, { json: !!opts.json });
    case "trace": trace(root, args[1] || ""); return 0;
    case "new": create(root, args[1] || "", args[2] || ""); return 0;
    case "workflows":
      for (const wf of loadWorkflows()) log(`  ${cyan(invocation("claude", wf.id).padEnd(17))} ${bold(wf.title)}\n  ${" ".repeat(17)} ${dim(wf.description.split(". ")[0])}`);
      return 0;
    case "--version": case "-v": case "version": log(VERSION); return 0;
    case undefined: case "help": case "--help": case "-h": log(HELP); return 0;
    default: log(red(`Unknown command '${args[0]}'.`)); log(HELP); return 1;
  }
}

try {
  process.exitCode = main();
} catch (e) {
  console.error(red(`✗ ${(e as Error).message}`));
  process.exitCode = 1;
}
