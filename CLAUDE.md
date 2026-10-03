# Locklings: Claude Code project rules

Source of truth: SPEC.md (the Locklings Product Specification Document).
Also read docs/TEAM.md (who owns what) and docs/CONTRACTS.md (frozen interfaces)
at the start of every session. Read the SPEC sections named in each task before coding.

## Invariants (never change without a Decisions Log entry in SPEC.md Section 17)
- Every creature has MAX_HP = 100. No other stats exist.
- MISS_CHANCE = 0.30 for ALL moves (attack and heal). A missed heal still consumes a use.
- damage = Math.round(move.power * typeModifier(move.element, defender.element))
- Fire beats Grass, Grass beats Water, Water beats Fire. Same element = 1.0. Strong = 2.0. Weak = 0.5.
- Moves are element-locked. Max 4 moves per creature. A creature always keeps at least 1 attack move.
- FP = floor(durationMin * tierRate * min(1 + sum(activated bonuses), 2.5))
- A category bonus activates only with 3 or more sites of that category selected.
- FP comes ONLY from completed Adventures (plus the Spark Pouch fallback). Abandoned = 0 FP.
- The background service worker is the ONLY writer of activeSession and session FP.
- Player acts first each round. Enemy AI never switches voluntarily.

## Code rules
- All tunable numbers live in src/data/config.ts. All content lives in src/data/*.ts.
  No magic numbers in components.
- src/engine is pure TypeScript: no chrome.*, no React, no Math.random (inject rng).
- UI code talks to src/platform only, never to chrome.* directly.
- Animate only transform and opacity (SPEC Section 10.8). Respect prefers-reduced-motion.
- No em dashes or en dashes in any UI copy or docs. Use the copy deck in SPEC Section 10.5.
- Prefer simple, readable code. This is a 24-hour build. Do not add features outside the SPEC.

## Team ownership (3 people, 3 branches)
The first prompt of each session says whether you are working for Person A, B or C.
- Edit ONLY files inside that person's lane (docs/TEAM.md, section "Lanes").
- NEVER edit frozen contract files (docs/CONTRACTS.md) unless the person tells you
  this is an approved contract-change PR.
- If you need a change outside the lane, STOP and tell the person the exact change
  (file, what, why) so they can message the owner. Do not make it yourself.
- Branch names: a/platform, b/engine, c/design. Never commit directly to main.

## Workflow
- Start of session: read SPEC.md sections for the task, CLAUDE.md, docs/TEAM.md,
  docs/CONTRACTS.md, and your section of PROGRESS.md.
- For anything larger than a one-line change, make a plan first and show it to the
  person before editing.
- Before every commit run: npm run verify (typecheck + tests + build). Fix failures first.
- Commit format: `[A] M5: block rules (BLK-01, BLK-02)`  (person, milestone, requirement IDs).
- After each task card, append a short entry to YOUR section of PROGRESS.md:
  what was built, requirement IDs covered, anything left, any decision you made.
- Log ambiguities as decisions in PROGRESS.md. Do not silently change the SPEC.
- Never edit SPEC.md.
