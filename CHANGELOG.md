# Changelog

## [1.0.2] - 2026-01-06
### Added
- **Global `jpm-cli`**: Now installable globally via `npm i -g jpm-cli`.
- **`jpm init`**: Automatically creates `.jpm/` context and `JPM_MASTER.md` in any directory.
- **`jpm config`**: Opens the global package root to easily configure `.env` with API keys.
- **`jpm sync`**: Integrated with GitHub CLI (`gh`) to create Parent Issues with detailed Tasklists.
- **`jpm clean`**: Command to clear cache and backups.
- **Rules Enforcement**: `JPM_MASTER.md` rules are now injected into all AI prompts (Plan/Design/Split).
- **Smart Error Handling**: Errors now provide actionable suggestions (e.g., "Check local .env").

### Changed
- **CLI Name**: Renamed from `jpm` (local) to `jpm-cli` (global) in `package.json`.
- **Docs**: Comprehensive update to `README.md` and `README-VI.md`.
- **Project Structure**: Removed local `.jpm` artifacts from source control.

## [1.0.0] - 2026-01-01
- Initial release of JPM CLI.
- Features: Plan, Design, Split, Sync, Run.
- AI Integration: Gemini, OpenAI, Claude.
