@AGENTS.md

# Claude-specific

## Planning

- For large or multi-file changes, interview me first and write a spec in `specs/`.
- One session plans, a fresh session implements, a third reviews if needed.
- Use `/compact` when context gets heavy. When compacting, preserve: modified files, commands run, and open risks.
- Use `/clear` between unrelated tasks.

## Session workflow

- Start by reading AGENTS.md (auto-loaded via this file).
- For unfamiliar areas, read the relevant docs/ file before changing code.
- Run the "done when" checks before declaring work complete.
- Do not update docs/history/PROGRESS.md or AGENT_BRIEFING.md — those are legacy files.

## Subagents

- Use subagents for bounded parallel work: exploration, test writing, file-by-file sweeps.
- Keep the main thread on the core objective.

## Rules

Path-scoped rules are in `.claude/rules/` — they load automatically for matching files.
