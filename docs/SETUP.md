# SETUP.md: the first 30 minutes

## Person A (does this first; B and C start sketching while A works)

```bash
mkdir locklings && cd locklings && git init
# copy in: SPEC.md (from the Word doc), the starter kit files (CLAUDE.md, PROGRESS.md, .claude/, docs/)
pandoc Locklings_PSD.docx -t gfm -o SPEC.md
git add . && git commit -m "spec + starter kit"
git branch -M main
# create a GitHub repo, add it as origin, then:
git push -u origin main
```
Then A starts `claude`, pastes the A kickoff prompt from docs/PROMPTS.md and does card A1 part 1 only:
bare scaffold (package.json, tsconfig, Vite + React + Tailwind + crxjs, empty manifest). Push to main
within 30 minutes. Do not wait to finish the rest of A1 before pushing.

package.json scripts A must include (this is the team's single gate):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "verify": "npm run typecheck && npm run test && npm run build"
  }
}
```
Vitest needs at least one test file to pass. B's first test (data counts) covers this; until then A adds
a trivial `tests/smoke.test.ts` that asserts `1 + 1 === 2`.

## Persons B and C (as soon as A's scaffold hits main)

```bash
git clone <repo-url> locklings && cd locklings
npm install
git checkout -b b/engine        # Person C uses: git checkout -b c/design
cp docs/local-settings/B.json .claude/settings.local.json     # C copies C.json; A copies A.json
```
`.claude/settings.local.json` should be gitignored (add `.claude/settings.local.json` to .gitignore).
Open `claude`, run `/permissions` once to confirm the deny rules loaded, then paste your kickoff prompt.

## Everyone, every day
- Start sessions with: "Read SPEC.md sections for my task, CLAUDE.md, docs/TEAM.md, docs/CONTRACTS.md and my PROGRESS.md section."
- One task card per Claude session. When it is done: `npm run verify`, commit, push, open PR, `/clear`.
- Load the extension: chrome://extensions, Developer mode on, Load unpacked, pick `dist`. Click reload on
  the extension card after each build. Check the card's "Errors" button when something fails.
- Add `.claude/settings.local.json`, `dist/`, `node_modules/` to .gitignore.

## If the deny rules do not seem to block edits
Permission rule syntax can change between Claude Code versions. Run `/permissions` and check the docs at
https://code.claude.com/docs/en/best-practices.md . Even if rules fail, the lane rule in CLAUDE.md still tells Claude
to stay in its lane, and PR review at each task card catches strays.
