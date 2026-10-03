# Locklings - Claude Code project rules
Source of truth: SPEC.md (Locklings PSD). Read the sections named in each task before coding.
 
## Invariants (never change without updating SPEC.md Section 17)
- Every creature has MAX_HP = 100. No other stats.
- MISS_CHANCE = 0.30 for ALL moves (attack and heal). Missed heals consume a use.
- damage = Math.round(move.power * typeModifier(move.element, defender.element))
- Fire > Grass > Water > Fire. Same element = 1.0. Strong = 2.0. Weak = 0.5.
- Moves are element-locked. Max 4 moves. Always keep >= 1 attack move.
- FP = floor(durationMin * tierRate * min(1 + sum(activated bonuses), 2.5))
- Category bonus activates only with >= threshold (3) sites of that category.
- FP is earned ONLY from completed Adventures (plus Spark Pouch fallback). Abandon = 0 FP.
- Background service worker is the ONLY writer of activeSession and session FP.
 
## Code rules
- All tunables in src/data/config.ts. All content in src/data/*.ts. No magic numbers in components.
- src/engine is pure TypeScript: no chrome.*, no React, no Math.random (inject rng).
- UI uses the Platform interface (src/platform), never chrome.* directly.
- Use requirement IDs (e.g. BTL-06) in commit messages.
- After any engine change run: npm test
- Prefer simple, readable code over clever abstractions. This is a 24-hour build.
