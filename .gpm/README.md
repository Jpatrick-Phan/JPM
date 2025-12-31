# G-PM: Gemini Project Manager

**G-PM** is a Spec-Driven Development framework designed for large-context AI Agents (Gemini/Antigravity) and human teams. It enforces a strict workflow of Planning -> Designing -> Execution to minimize errors and maximize scalability.

## Installation
1.  Copy the `.gpm` folder to the root of your project.
2.  Make scripts executable:
    ```bash
    chmod +x .gpm/scripts/*.sh
    ```
3.  Add `.gpm/scripts` to your PATH or run via relative path.

## Quick Start
1.  **Initialize**:
    ```bash
    ./.gpm/scripts/gpm.sh init
    ```
2.  **Plan a Feature**:
    ```bash
    ./.gpm/scripts/gpm.sh plan authentication
    ```
    *Use your AI Agent to fill the generated PRD in `.gpm/storage/prds/`.*
3.  **Design Architecture**:
    ```bash
    ./.gpm/scripts/gpm.sh design authentication
    ```
    *Use your AI Agent to fill the Architecture doc based on the PRD.*
4.  **Execute**:
    Use the `TASK_TEMPLATE` to break down work and assign to Antigravity.

## Directory Structure
- `core/`: System rules and protocols.
- `templates/`: Standardized templates for PRDs, Architecture, and Tasks.
- `storage/`: "Memory" containing all project specs and task status.
- `scripts/`: CLI tools for managing the workflow.
- `context/`: Machine-readable context (JSON) for the Agent.

## Ignore Configuration (Recommended)

To ensure G-PM does not end up in your Production build (Docker, Node, etc.), exclude the `.gpm` directory:

**1. .dockerignore**
```text
.gpm
```

**2. .eslintignore**
```text
.gpm
```

**3. tsconfig.json**
```json
{
  "exclude": [".gpm"]
}
```

## Philosophy
- **No Spec, No Code**: Never guess. Always write a plan first.
- **Context is King**: The `project-map.json` maintains the state of truth.
