# Focu

**Lock in. Level up.**

Focu is a Chrome extension that turns focus time into a small creature-collecting game. You pick the sites that distract you, go on an Adventure, and while the timer runs those sites are blocked. Finish the Adventure and you earn FocuPoints (FP). Spend FP on moves for your creatures, called Locklings, then use them to battle the Distraction Gyms.

Give up early, or visit a blocked site, and the Adventure ends with 0 FP. Finishing is the only way to earn.

## What you can do

- **Go on an Adventure.** Choose a length (5 to 180 minutes) and the sites to block. A live preview shows how much FP you will earn. A timer ring counts down while your Lockling explores, and the background shifts from cool to warm as you get closer to the end.
- **Earn FP.** Longer Adventures pay a higher rate per minute, and blocking whole categories of sites adds a bonus.
- **Collect Locklings.** There are nine, in three types: Fire, Water and Grass. You start with one of Embrit, Puddlo or Sproutle. Build a Squad of up to three in the Lockdex and put your lead first.
- **Teach moves at the dojo.** Spend FP (or a Move Scroll) to teach a Lockling new moves. Each can know up to four, and moves are locked to its type.
- **Battle the five Distraction Gyms.** Each gym has its own leader, team and painted arena. Beat a gym to unlock the next and win a Lockbox. Cleared gyms can be replayed as Practice.
- **Open Lockboxes.** Pick one of three boxes to reveal a new Lockling, a Move Scroll or a pouch of FP.

## How earning FP works

```
FP = floor(minutes x tier rate x multiplier)
```

| Tier | Length | Rate |
|---|---|---|
| Trail | up to 60 min | 10 FP per minute |
| Expedition | up to 120 min | 15 FP per minute |
| Odyssey | up to 180 min | 20 FP per minute |

- The sites are grouped into six categories: Social Media, Video and Streaming, Gaming, Messaging, News and Gossip, and Shopping.
- A category bonus only activates when you block **three or more** sites from it.
- Bonuses stack, but the total multiplier is capped at **x2.5**.
- Custom sites you add (up to 10) are blocked too, but never count toward a bonus.
- A new player starts with 300 FP.

## How battles work

- Every Lockling has 100 HP. There are no other stats.
- Fire beats Grass, Grass beats Water, Water beats Fire. A strong hit does double damage, a weak one half.
- Damage is the move's power times the type bonus, rounded.
- Every move, attack or heal, misses 30% of the time. A missed heal still uses up one of its uses.
- You act first each round. You can attack, heal, switch Locklings or forfeit. When you switch, each choice shows the Lockling, its type, its health and whether it is strong or weak against the opponent.
- The enemy never switches on its own.

## Try it

You need a Chrome based browser and Node.js.

```bash
npm install
npm run build
```

Then load the extension:

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `dist` folder.
4. Click the Focu icon in the toolbar to open the game.

After changing code, run `npm run build` again and click the reload icon on the extension card. If something breaks, the card's **Errors** button shows why.

### See the whole game in a few minutes

A real Adventure takes at least five minutes. To try everything quickly:

1. Open **Settings** and switch on **Demo Mode**. Adventures then run 60 times faster and can be as short as one minute.
2. Open the dev panel from Settings (or go to `index.html#/dev` in the extension). It can load preset saves, add 1000 FP, finish the current Adventure, and jump to any gym from 1 to 5.
3. The component gallery at `index.html#/gallery` shows every piece of the interface, the five gym backgrounds and the sound effects.

### Settings

- **Demo Mode:** fast Adventures for trying things out. It cannot be changed during an Adventure.
- **Sound effects:** on by default. Attacks, misses, heals and victory have sounds. Turn them off or play a test sound here.
- **Reset:** erases all progress and starts over.

## What the extension asks for

| Permission | Why |
|---|---|
| `storage` | Saves your Locklings, FP and history |
| `declarativeNetRequest`, host access | Blocks your chosen sites during an Adventure and shows the Trail Closed page instead |
| `alarms` | Ends the Adventure on time, even if the game tab is closed |
| `notifications` | Tells you when an Adventure is complete |
| `tabs` | Opens and updates the game and the blocked page |

## For developers

```bash
npm run dev         # Vite dev server
npm run typecheck   # TypeScript only
npm run test        # unit tests (Vitest)
npm run verify      # typecheck, tests and build: the gate before every commit
```

- `src/engine` is pure TypeScript with no browser APIs, so battles and points are easy to test.
- `src/data` holds all content and tunable numbers (creatures, moves, gyms, sites, `config.ts`).
- `src/background` is the service worker. It is the only thing that starts and ends Adventures and awards FP.
- `src/platform` is the only place the interface talks to the browser.
- `src/app` is the React interface. The visual style is described in `docs/DESIGN.md`.
- `SPEC.md` is the full product specification, and `docs/` has the team notes and interface contracts.

