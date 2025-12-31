# JPM: Jatrick Project Manager

**JPM** is a Spec-Driven Development framework designed for large-context AI Agents (Gemini, Claude, GPT-4) and human teams. It enforces a strict workflow of Planning -> Designing -> Execution to minimize errors and maximize scalability.

## Installation

### Via NPM (Recommended)
Install globally to use the `jpm` command anywhere.

```bash
npm install -g jpm-cli
```

### Manual Installation
1. Clone the repo: `git clone https://github.com/jatrick/jpm.git ~/.jpm-core`
2. Add to PATH: `export PATH="$HOME/.jpm-core/.jpm/scripts:$PATH"`

## Workflow

**1. Plan (Interactive)**
Create a PRD draft. You can optionally provide requirements directly.
```bash
jpm plan authentication "User can login via Google and Email"
```
*Action: Review and edit the generated PRD in `.jpm/storage/prds/`.*

**2. Design (AI-Powered)**
Generate System Architecture based on your PRD.
```bash
jpm design authentication
```
*Action: JPM reads your PRD and asks AI to design the architecture. Review the output in `.jpm/storage/epics/`.*

**3. Split & Sync**
Prepare tasks and sync to GitHub.
```bash
jpm split authentication
jpm sync
```

**4. Run**
Get context for execution.
```bash
jpm run task-001
```

## Supported AI Providers
- **Gemini** (`gemini`): Requires `JPM_GEMINI_API_KEY`
- **OpenAI** (`openai`): Requires `JPM_OPENAI_API_KEY`
- **Claude** (`claude`): Requires `JPM_CLAUDE_API_KEY`

## Philosophy
- **No Spec, No Code**: Never guess. Always write a plan first.
- **Context is King**: The `project-map.json` maintains the state of truth.
