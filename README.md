# Locklings Starter Kit (copy into the root of your repo)

Drop these files into the repo root, next to SPEC.md.

| File | Goes to | Purpose |
|---|---|---|
| CLAUDE.md | repo root | Rules every Claude Code session loads automatically |
| PROGRESS.md | repo root | Per-person progress log (separate sections, so it never merge-conflicts) |
| .claude/settings.json | repo root | Shared permissions: safe commands allowed, dangerous ones denied |
| docs/TEAM.md | docs/ | Lanes, timeline, handoffs, sync checklists, git rules |
| docs/CONTRACTS.md | docs/ | Frozen interfaces: routes, Platform, component props, engine API |
| docs/FIXTURES.md | docs/ | Exact preset saves so nobody waits on anybody else |
| docs/PROMPTS.md | docs/ | Paste-ready kickoff prompt and task cards for A, B and C |
| docs/SETUP.md | docs/ | The first 30 minutes, command by command |
| docs/local-settings/A.json, B.json, C.json | each person copies theirs to .claude/settings.local.json | Blocks edits outside your own lane |

Quick start:
1. Read docs/SETUP.md (5 minutes). Person A runs it first.
2. Everyone pulls main, creates their branch, copies their local settings file.
3. Everyone starts `claude` and pastes their kickoff prompt from docs/PROMPTS.md.
4. Work the task cards in order. Stop at every SYNC point in docs/TEAM.md.
