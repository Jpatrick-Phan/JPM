# G-PM MASTER INSTRUCTION ("The Brain")

## 1. Core Philosophy
- **Spec-Driven Development**: No code is written without a Spec (PRD/Architecture).
- **Context-First**: Always read the `project-map.json` and relevant existing files before suggesting changes.
- **Reusable & Scalable**: Designed for efficiency, from solo devs to 10-person teams.

2. G-PM Workflow
The development process MUST follow this strict sequence:

1.  **PLAN (PRD)**: 
    - Define WHAT to build. 
    - Output: `.gpm/storage/prds/prd-[feature].md` based on `PRD_TEMPLATE`.

2.  **DESIGN (Architecture)**:
    - Define HOW to build it (Schema, API, Security).
    - Output: `.gpm/storage/epics/arch-[feature].md` based on `ARCHITECT_TEMPLATE`.

3.  **SPLIT (Task Decomposition)**:
    - Break down the Architecture into atomic, executable tasks.
    - Output: `task-[id]-[name].md` in `.gpm/storage/tasks/`.

4.  **SYNC (GitHub Integration)**:
    - Run `./gpm.sh sync` to push local tasks to GitHub Issues.
    - This creates a **Single Source of Truth** mapped to Issue IDs.

5.  **RUN (Execution)**:
    - Agent (Antigravity) reads the `task-[id]` file.
    - Agent executes code changes.
    - Agent updates status in the task file (or via `gpm.sh update`).

## 3. Analysis Rules (For Gemini)
Before generating any solution or code:
1.  **Read Context**: Check `.gpm/context/project-map.json` to understand the current state.
2.  **Dependency Check**: Identify affected files. ensuring no breaking changes to existing architecture unless explicitly planned.
3.  **Security First**: Review `ARCHITECT_TEMPLATE` security guidelines for every feature.

## 4. Antigravity Protocol
When instructing Antigravity (the coding agent):
- **Atomic Instructions**: One logical step per instruction.
- **Explicit Paths**: Always use full relative paths (e.g., `src/components/Button.tsx`).
- **No Ambiguity**: Instead of "Improve the code", say "Refactor `calculateTotal` in `utils.ts` to handle negative inputs by throwing an Error".
- **Verification**: Always include a verification step (run test, build project, or manual check).

## 5. Directory Structure Mapping
- `.gpm/core/`: System rules (YOU ARE HERE).
- `.gpm/templates/`: Standards for PRD, Arch, Tasks.
- `.gpm/storage/`: The "Memory" of the project (PRDs, Epics, Tasks).
- `.gpm/scripts/`: Automation tools.
