# JPM-CLI: Just Project Manager

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> [Đọc bằng tiếng Việt](README-VI.md) 🇻🇳

**JPM (Jatrick Project Manager)** is a Spec-Driven Development CLI designed to streamline the workflow of AI Agents and Human Developers. It enforces a strict "Plan → Design → Split → Sync" methodology to ensure code quality and project consistency.

---

## 🌟 Why JPM?

- **🧠 Spec-Driven**: No more coding without a plan. PRD and Architecture artifacts are mandatory.
- **⚡ AI-Powered**: Uses Google Gemini to generate high-quality specs and task breakdowns.
- **🤝 GitHub Sync**: Decomposes big features into "Parent Issues" with trackable Tasklists.
- **🛡️ Master Rule Enforcement**: Enforces your project's `JPM_MASTER.md` rules (Tech Stack, Naming, Design) on every AI generation.

---

## 📦 Installation

Install globally via NPM:

```bash
npm install -g jpm-cli
```

### Configuration (Important!)

JPM requires a Google Gemini API Key. You can set this up easily:

1.  Run the config command:
    ```bash
    jpm config
    ```
    *(This opens the global installation directory)*
2.  Create or duplicate `.env` file in that folder.
3.  Add your key:
    ```env
    JPM_API_KEY=your_gemini_api_key_here
    ```

---

## 🚀 Zero to Hero Workflow

### 1. Initialize a Project
Go to your project folder and wake up JPM.

```bash
mkdir my-super-app
cd my-super-app
jpm init
```
*Creates `.jpm/` structure and `JPM_MASTER.md`. Edit `JPM_MASTER.md` to define your stack!*

### 2. Plan a Feature (The "What")
Generate a Product Requirement Document (PRD).

```bash
jpm plan "User Authentication"
```

### 3. Design the System (The "How")
Create a technical architecture based on the PRD.

```bash
jpm design "User Authentication"
```

### 4. Split into Tasks (The "Steps")
Break the architecture down into atomic, developer-ready tasks.

```bash
jpm split "User Authentication"
```

### 5. Sync to GitHub (The "Management")
Push your tasks to GitHub Issues (requires `gh` CLI).

```bash
jpm sync
```

---

## 🧹 Maintenance

Clean up cache and backups to save space:

```bash
jpm clean
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **AI**: Google Gemini (via `@google/generative-ai`)
- **CLI Tools**: `inquirer`, `ora`, `boxen`, `commander`

---

Made with ❤️ by Jatrick
