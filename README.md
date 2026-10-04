# Focu

**Lock in. Level up.**

Focu turns focus time into a creature-collecting game. Choose the sites that distract you, start an Adventure, and Focu blocks those sites while you focus. Finish your Adventure to earn FocuPoints (FP). Spend FP teaching your elemental creatures, the Locklings, new moves, then take your squad into turn-based battles against the Distraction Gyms.

**Protect your focus. Power up your Locklings. Take on the feed.**

## One focus session. A whole game loop.

1. **Choose a Companion.** Start with Embrit, Puddlo, or Sproutle.
2. **Set an Adventure.** Pick a focus duration and the sites you want blocked. Preview your FP before you lock in.
3. **Stay focused.** A live timer tracks your Adventure while selected sites are blocked. Complete it to earn FP. If you leave early or visit a blocked site, the Adventure ends with 0 FP.
4. **Train your Locklings.** Spend FP or use Move Scrolls to teach moves at the Dojo. Build a Squad of up to three creatures.
5. **Battle distractions.** Use Fire, Water, and Grass matchups, healing, and tactical switches to challenge five Distraction Gyms.
6. **Claim a reward.** Clear a Gym to choose one of three Lockboxes, with a chance to add a creature, learn a move, or earn a Spark Pouch.

## Focus that feels rewarding

- **Real website blocking:** Focu uses Chrome's extension platform to block the sites you choose during an Adventure.
- **Know your reward up front:** See projected FP before committing. Longer focus tiers and category bonuses can increase your reward.
- **Progress you can use:** Turn completed focus time into new moves, stronger strategies, and a growing Lockdex.
- **Try the full loop quickly:** Demo Mode speeds up Adventures so you can explore without waiting through a full-length session.

## Get started

Focu runs as a web app for development and demos. For real site blocking, build and load the Chrome extension.

Requirements: Node.js, npm, and Google Chrome for extension use.

### Run the web app

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Load the Chrome extension

```sh
npm install
npm run build
```

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked** and choose the generated `dist` folder.
4. Open Focu from the extension toolbar.

Enable **Demo Mode** in Settings to speed up Adventures. The Dev page includes preset saves for exploring different game states.

## Permissions

The extension requests:

| Permission | Purpose |
|---|---|
| `storage` | Save your Locklings, FocuPoints, and progress |
| `declarativeNetRequest` and host access | Block selected sites during an Adventure |
| `alarms` | End an Adventure on time, including when the game tab is closed |
| `notifications` | Notify you when an Adventure is complete |
| `tabs` | Open and update the game and blocked-site page |

## For developers

```sh
npm run dev
npm run typecheck
npm run test
npm run build
npm run verify
```

`npm run verify` runs typecheck, tests, and a production build.

- `src/engine` contains the pure TypeScript game rules.
- `src/data` contains creatures, moves, gyms, sites, and game configuration.
- `src/background` manages focus sessions and awards FP.
- `src/platform` connects the app to browser storage and extension APIs.
- `src/app` contains the React interface.

See [SPEC.md](./SPEC.md) for the product specification and [docs/](./docs/) for design and development notes.

## Built with

React, TypeScript, Vite, Tailwind CSS, and Chrome Manifest V3.
