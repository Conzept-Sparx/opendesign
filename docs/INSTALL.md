# Installing OpenDesign

This guide takes you from a clean machine to running your first OpenDesign workflow. It takes about 15 minutes, most of it installing a coding agent if you don't have one yet.

OpenDesign has two parts:

| Part | What it does | You install |
|---|---|---|
| The `opendesign` command | Sets up the spec folder, installs agent commands, checks your work | Step 3 below |
| A coding agent | Does the design thinking and writing: brief analysis, personas, specs, prototypes | Claude Code, Codex or OpenCode (step 2) |

Commands below are for **macOS / Linux** (Terminal) and **Windows** (PowerShell). Where they differ, both are shown.

---

## Step 1 — Install Node.js 18 or later

Check whether you already have it:

```bash
node -v
```

If it prints `v18` or higher, skip to step 2. If it says the command isn't found, or prints a lower version:

- **Easiest:** download the LTS installer from [nodejs.org](https://nodejs.org/en/download) and run it.
- **macOS / Linux, recommended for developers:** use [nvm](https://github.com/nvm-sh/nvm) so global installs never need `sudo`:
  ```bash
  nvm install --lts
  ```

Close and reopen your terminal, then run `node -v` again to confirm.

---

## Step 2 — Install a coding agent

You need at least one. If you're not sure which, start with Claude Code.

### Claude Code (recommended)

Needs a paid Claude plan (Pro, Max, Team or Enterprise) or a Console account; the free plan doesn't include Claude Code.

**macOS / Linux:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

Open a **new** terminal window and check it worked:

```bash
claude --version
```

Then run `claude` once and follow the browser prompt to sign in. Type `/exit` to leave.

Other install options (Homebrew, WinGet, apt) are in the [Claude Code setup guide](https://code.claude.com/docs/en/setup).

### Codex (optional)

```bash
npm install -g @openai/codex
```

Run `codex` and choose **Sign in with ChatGPT**. Details: [github.com/openai/codex](https://github.com/openai/codex).

### OpenCode (optional)

Follow the install steps at [opencode.ai/docs](https://opencode.ai/docs). After installing, run `opencode` and use `/connect` to choose a model provider.

---

## Step 3 — Install OpenDesign

```bash
npm install -g @conzept-sparx/opendesign@latest
```

This works the same on macOS, Linux and Windows. If you see a permission error (`EACCES`) on macOS or Linux, see Troubleshooting below rather than using `sudo`.

---

## Step 4 — Check the installation

```bash
opendesign --version
```

It should print a version number such as `0.1.0`.

---

## Step 5 — Start your first project

Create a project folder anywhere and set it up:

```bash
mkdir my-first-design
cd my-first-design
opendesign init --tools claude
```

Use `--tools claude,codex,opencode` to set up all three agents, or leave `--tools` out to get all three by default.

Then start your agent in the same folder:

```bash
claude
```

Type `/od:` and you should see the OpenDesign commands in the list. Start with:

```
/od:next
```

It checks where the project stands and suggests the first step. To brainstorm a brief straight away, paste it after `/od:explore` instead, then use `/od:lock` to add what you agree on to the spec.

| Agent | How to call a workflow |
|---|---|
| Claude Code | `/od:brief` |
| OpenCode | `/od-brief` |
| Codex | `$opendesign-brief` |

The first time you run `/od:generate`, the agent sets up a React prototype app in a `prototype/` folder. This needs an internet connection and can take a few minutes.

---

## Updating

```bash
npm install -g @conzept-sparx/opendesign@latest
```

Then, inside each design project, refresh its agent commands:

```bash
opendesign update
```

`update` never changes your spec files.

## Uninstalling

```bash
npm uninstall -g @conzept-sparx/opendesign
```

Your design projects keep their `opendesign/` spec folders; they're plain Markdown.

## Installing from source

For contributors, or to try unreleased changes:

```bash
git clone https://github.com/Conzept-Sparx/opendesign.git opendesign
cd opendesign
npm install          # also builds OpenDesign
npm link             # makes the opendesign command available everywhere
npm test             # last line should read "All checks passed"
```

After pulling new changes, run `npm install` again to rebuild. To switch back to the released version, run `npm unlink -g @conzept-sparx/opendesign` and then the install command in step 3.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `opendesign: command not found` (or "not recognized" on Windows) | Close and reopen the terminal. If it still fails, run `npm config get prefix`; the `bin` folder inside it (on Windows, the folder itself) must be on your PATH. |
| `EACCES` / permission denied during `npm install -g` (macOS / Linux) | Your Node install needs admin rights for global packages. Install Node with nvm (step 1) and repeat step 3. Avoid `sudo`. |
| `npm` scripts blocked on Windows ("running scripts is disabled") | In PowerShell, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then reopen PowerShell. |
| `Cannot find module ... dist/cli.js` (source install) | Run `npm install` in the OpenDesign folder to rebuild. |
| `/od:` commands don't appear in Claude Code | Make sure you started `claude` in the folder where you ran `opendesign init` (it should contain `.claude/commands/od/`). Restart Claude Code after running `init`. |
| Codex doesn't pick up `$opendesign-…` | Check that `.codex/skills/` exists in the project, update Codex to the latest version, and restart it in the project folder. |
| `No opendesign/config.json here` | You're not in a design project folder. `cd` into it, or run `opendesign init` first. |
| Something else | Open an issue at https://github.com/Conzept-Sparx/opendesign/issues with the command you ran and its output. |
