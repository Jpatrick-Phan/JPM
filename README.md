# JPM: Jatrick Project Manager

**JPM** is a Spec-Driven Development framework designed for large-context AI Agents (Gemini, Claude, GPT-4) and human teams. It enforces a strict workflow of Planning -> Designing -> Execution to minimize errors and maximize scalability.

## Prerequisites

Before using JPM, ensure you have the following installed:

- **Node.js**: v14 or higher. (Required for JSON processing and logic).
- **Git Bash** (Windows only): Required for running the shell scripts.
- **Git**: Required for version control and syncing tasks.

## Installation

### Via NPM (Recommended)
Install globally to use the `jpm` command anywhere.

```bash
npm install -g jpm-cli
```

### Manual Installation
1. Clone the repo: `git clone https://github.com/jatrick/jpm.git ~/.jpm-core`
2. Add to PATH: `export PATH="$HOME/.jpm-core/.jpm/scripts:$PATH"`

## Command Reference

JPM provides a suite of commands to manage the entire lifecycle of a feature.

### 1. Initialization
**Command:** `jpm init`
- **Description:** Initializes the JPM structure in your current project.
- **What it does:**
  - Creates the `.jpm` directory structure (`context`, `storage`, etc.).
  - Creates a `.gitignore` entry for `.jpm` to keep it out of your build.
  - Creates `project-map.json` to track features.
  - Sets up GitHub labels (if `gh` CLI is available).

### 2. Configuration
**Command:** `jpm config [key] [value]`
- **Description:** Sets configuration variables for JPM.
- **Usage:**
  ```bash
  jpm config provider gemini
  jpm config api_key YOUR_API_KEY
  ```
- **Keys:**
  - `provider`: The AI provider to use (`gemini`, `openai`, `claude`).
  - `api_key`: The API key for the selected provider.

### 3. Planning (PRD)
**Command:** `jpm plan [feature_name] "[requirements]"`
- **Description:** Creates a Product Requirement Document (PRD) for a new feature.
- **Arguments:**
  - `feature_name`: A unique slug for the feature (e.g., `auth-login`).
  - `requirements` (Optional): A text description of what you want to build.
- **What it does:**
  - Generates a PRD file at `.jpm/storage/prds/prd-[feature].md`.
  - If requirements are provided, it uses AI to draft the PRD content automatically.
  - Updates `project-map.json` to include the new feature.

### 4. Designing (Architecture)
**Command:** `jpm design [feature_name]`
- **Description:** Generates a System Architecture document based on the PRD.
- **Arguments:**
  - `feature_name`: The slug of the feature you planned.
- **What it does:**
  - Reads the corresponding PRD from `.jpm/storage/prds/`.
  - Uses AI to design the technical architecture, data structures, and API endpoints.
  - Saves the output to `.jpm/storage/epics/arch-[feature].md`.

### 5. Task Breakdown
**Command:** `jpm split [feature_name]`
- **Description:** Decomposes the architecture into atomic development tasks.
- **Arguments:**
  - `feature_name`: The slug of the feature.
- **What it does:**
  - Reads the Architecture document.
  - Uses AI to break it down into small, implementable tasks.
  - Generates individual task files in `.jpm/storage/tasks/`.

### 6. Syncing
**Command:** `jpm sync`
- **Description:** Synchronizes local tasks with GitHub Issues.
- **What it does:**
  - Scans `.jpm/storage/tasks/` for new tasks.
  - Uses the `gh` CLI to create issues in your GitHub repository.
  - Updates local task files with the created Issue Numbers.

### 7. Execution Context
**Command:** `jpm run [task_id]`
- **Description:** Prepares the context for an AI agent or developer to execute a task.
- **Arguments:**
  - `task_id`: The ID or filename of the task (e.g., `task-001`).
- **What it does:**
  - Prints the full context needed to solve the task:
    - The Task Description.
    - The Architecture Context.
    - The PRD Context.
    - Relevant Project Map info.

### 8. AI Generation Utility
**Command:** `jpm gen [input_file] [output_file]`
- **Description:** A generic utility to run a prompt through the configured AI provider.
- **Usage:**
  ```bash
  jpm gen prompt.txt result.md
  ```

## Project Structure

When you run `jpm init`, the following structure is created:

```
.jpm/
├── context/
│   └── project-map.json    # Tracks all features and project state
├── storage/
│   ├── prds/               # Product Requirement Documents
│   ├── epics/              # Architecture & Design Documents
│   └── tasks/              # Atomic Task definitions
└── config.env              # Local configuration (API keys)
```

## Supported AI Providers

- **Gemini** (`gemini`): Fast and free tier available.
- **OpenAI** (`openai`): GPT-4 for high-quality reasoning.
- **Claude** (`claude`): Claude 3 Opus for complex architectural design.

## Philosophy

1.  **Spec-First**: Code is a liability. Specifications are assets. We never write code without a plan.
2.  **Context-Aware**: AI needs context. JPM structures your project so AI always knows *why* it's writing code.
3.  **Atomic Tasks**: Large features are broken down until they are small enough to be solved in one shot.
