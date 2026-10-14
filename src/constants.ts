// Rename the tool here (and in package.json) before the public launch.
export const TOOL = "opendesign";
export const TOOL_TITLE = "OpenDesign";
export const CMD_PREFIX = "od";
export const SPEC_DIR = "opendesign";
export const VERSION = "0.1.0";
export const BLOCK_START = "<!-- OPENDESIGN:START -->";
export const BLOCK_END = "<!-- OPENDESIGN:END -->";
export const TOOLS = ["claude", "codex", "opencode"] as const;
export type Tool = (typeof TOOLS)[number];
