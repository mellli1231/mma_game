# Focu design spec

Source of truth for the visual skin.
- Components follow the "Meadow" pastel style tile (v2): every value below was taken from it.
- Backgrounds use the painted illustration at `public/assets/backgrounds/background_main.webp`.
- Read this whole file before editing any UI.

## 0. Ground rules
- The app is called **Focu**. Creatures are still "Locklings". Lockdex, Lockbox, FocuPoints and Training Centre keep their names. Tagline: "Lock in. Level up."
- Change appearance only: class names, wrapper elements, CSS and the app name. Never change logic, props (docs/CONTRACTS.md), routes, guards, data, engine or tests.
- No new dependencies. Fonts: Fredoka (headings, buttons, numbers) and Nunito (body), both already bundled. No handwriting font.
- No em dashes or en dashes anywhere in text or comments.

## 1. Palette
| Token | Hex | Use |
|---|---|---|
| cream | #FFF8EC | page color behind the scene |
| paper | #FFFDF6 | cards, modals, bars |
| ink | #1F2033 | outlines and body text |
| muted | #4A4D68 | secondary text (never lighter) |
| soft | #3A3D58 | helper paragraphs |
| focu | #5B4BDB | links, selected borders, progress accents only |
| sunshine | #FFD66B | primary buttons, FP coin, epic |
| sunshine-deep | #FFC94D | timer progress, squiggle underlines |
| lavender | #C9BFF7 | selected chips, rare, demo badge |
| fire | #FFA477 | fire, battle card |
| water | #8FCBF5 | water, tags |
| grass | #8ED6A4 | grass, confirm button, HP fill |
| blush | #FFC1D0 | cheeks, social badge |
| mint-pale | #E4F4DC | creature placeholder, timer track |
| peach-pale | #FFD2BF | lagging HP strip |
| trail | #F2DEA8 | nail dots, sand |
| danger | #B42318 | destructive text and borders |
| disabled | #ECEAF3 | disabled fill (border #7C7A99, text #4A4D68) |
| points | #FFF8E1 | points preview panel |

Keep every existing token name in `src/index.css` working. Remap values instead of renaming: surface to paper, bg to cream, muted to #4A4D68, fire/water/grass to the pastel fills, fp-gold to sunshine, danger to #B42318, ring-track to mint-pale. `primary` stays #5B4BDB. Add the new names. Existing utilities (`rounded-card`, `shadow-card`, `min-h-tap`, `ease-airy`, `duration-micro`, `duration-short`, `font-display`) must keep working; give `rounded-card` the wobbly radius and `shadow-card` the soft offset shadow below so existing pages pick them up.

Tailwind v4: tokens go in `@theme`. Write the recipes below as plain CSS classes inside `@layer components`. Use `@utility` only when a Tailwind utility is needed.

## 2. Shape rules
- Outline: 2.5px solid ink (3px on modals). Disabled is dashed.
- Shadows have an offset and no blur. Buttons `3px 4px 0 rgba(31,32,51,0.28)`, cards `4px 5px 0 rgba(31,32,51,0.22)`, modals `6px 7px 0 rgba(31,32,51,0.3)`.
- Wobbly radii:
  - card: `26px 10px 28px 12px / 12px 28px 10px 24px`
  - panel, home card, modal: `30px 12px 26px 14px / 14px 28px 12px 30px`
  - big button: `255px 15px 225px 15px / 15px 225px 15px 255px`
  - move button: `18px 8px 18px 8px / 8px 18px 8px 18px`
  - pills and chips: 999px
- Stitch line on cards: `outline: 2px dashed rgba(31,32,51,0.22); outline-offset: -9px` (-10px on modals).
- Tilts: section tags -2 to 2deg, home cards -1 to 1deg, badges -2.5 to 2.5deg. Never tilt body text, inputs or tables.

## 3. Component recipes (names are suggestions, keep them consistent)
```css
.focu-card { background:#FFFDF6; border:2.5px solid #1F2033; border-radius:26px 10px 28px 12px / 12px 28px 10px 24px; box-shadow:4px 5px 0 rgba(31,32,51,.22); outline:2px dashed rgba(31,32,51,.22); outline-offset:-9px; }
.focu-tag  { display:inline-block; border:2.5px solid #1F2033; border-radius:999px; padding:3px 16px; font:600 17px 'Fredoka'; transform:rotate(-2deg); } /* fill chosen per use */

.focu-btn { min-height:54px; padding:10px 28px; border:2.5px solid #1F2033; border-radius:255px 15px 225px 15px / 15px 225px 15px 255px; box-shadow:3px 4px 0 rgba(31,32,51,.28); font:600 21px 'Fredoka'; color:#1F2033; cursor:pointer; transition:transform 120ms, box-shadow 120ms; }
.focu-btn:hover { transform:translate(-1px,-1px); box-shadow:4px 5px 0 rgba(31,32,51,.28); }
.focu-btn:active { transform:translate(2px,3px); box-shadow:1px 1px 0 rgba(31,32,51,.28); }
.focu-btn:focus-visible { outline:3px solid #5B4BDB; outline-offset:3px; }
.focu-btn--primary { background:#FFD66B; }
.focu-btn--confirm { background:#8ED6A4; }
.focu-btn--secondary { background:#FFFFFF; }
.focu-btn--danger { background:#FFFFFF; color:#B42318; border-color:#B42318; box-shadow:3px 4px 0 rgba(180,35,24,.28); }
.focu-btn:disabled { background:#ECEAF3; color:#4A4D68; border:2.5px dashed #7C7A99; box-shadow:none; cursor:not-allowed; transform:none; }

.focu-chip { min-height:44px; padding:6px 20px; background:#FFFFFF; border:2.5px solid #1F2033; border-radius:999px; box-shadow:2px 3px 0 rgba(31,32,51,.28); font:600 17px 'Fredoka'; }
.focu-chip[aria-pressed="true"] { background:#C9BFF7; border-color:#5B4BDB; box-shadow:2px 3px 0 rgba(91,75,219,.4); }
```
- **Element badge:** inline-flex, gap 6px, border 2.5px ink, radius 999px, padding 2px 14px 2px 9px, Fredoka 600 16px, ink icon 18px. Fire #FFA477 rotate(-2deg), water #8FCBF5 rotate(1.5deg), grass #8ED6A4 rotate(-1deg).
- **FP badge (coin):** sunshine fill, border 2.5px ink, radius 999px, padding 4px 16px 4px 8px, min-height 36px, Fredoka 700 20px, shadow `2px 3px 0 rgba(31,32,51,.28)`, coin icon (pale gold circle with ink outline and a dash).
- **Rarity pills:** 15px Fredoka 600, border 2.5px ink. Common white, rare lavender, epic sunshine rotate(-2deg).
- **Home card:** position relative, panel radius, border 2.5px ink, shadow `4px 5px 0 rgba(31,32,51,.25)`, padding `16px 22px 16px 82px`, min-height 76px. Title Fredoka 700 24px, subtitle Nunito 700 15px. A 48px icon (white fill, 3px ink stroke) at left 20px, vertically centered. A 8px nail dot (trail fill, 2px ink border) at left 10px top 8px. Fills: adventure sunshine (tilt -1deg), battle fire (0.8deg), training grass (-0.6deg).
- **HP bar:** height 24px, border 2.5px ink, radius 999px, white, overflow hidden. Lagging strip peach-pale, fill grass with `repeating-linear-gradient(135deg, rgba(255,255,255,.45) 0 6px, transparent 6px 12px)` and a 2.5px ink right border. Number below in Fredoka 600 16px, tabular numerals.
- **Move button:** min-height 64px, padding 8px 16px, border 2.5px ink, move radius, shadow `3px 4px 0 rgba(31,32,51,.28)`. Name Fredoka 600 18px, sub-line 14px weight 800. Filled by element color. Disabled uses the dashed disabled style.
- **Timer ring (170px, scale with size):** outer ring r76 and inner ring r48 in ink (2.5px), track r62 width 24 in mint-pale, progress r62 width 24 in sunshine-deep with round caps, time in Fredoka 700 (size 30 at 170px) ink.
- **Modal:** paper, border 3px ink, panel radius, shadow `6px 7px 0 rgba(31,32,51,.3)`, dashed stitch with offset -10px, padding 28px 30px. Overlay `rgba(31,32,51,.4)`. Title Fredoka 700 30px. Actions: primary button sunshine, destructive as a text link (danger color, underline 3px, Fredoka 600 19px).
- **Toast:** ink fill, cream text, border 2.5px ink, radius 18px, shadow `3px 4px 0 #FFD66B`, padding 12px 20px, Fredoka 500 18px.
- **Points preview:** points fill, border 2.5px ink, panel radius, shadow `4px 5px 0 rgba(31,32,51,.25)`, padding 22px 24px. Rows 16px. Category badge blush. Divider 2.5px ink. Label "PROJECTED FP" 12px weight 800 letter-spacing .08em muted. Number Fredoka 700 44px with `linear-gradient(transparent 58%, #FFD66B 58%)`.
- **Victory stamp:** Fredoka 700 46px, color sunshine, rotate(-5deg), `text-shadow` ink outline (2.5px in four directions) plus `4px 5px 0 #1F2033`.
- **"Super effective!" sticker:** sunshine fill, border 2.5px ink, radius `12px 4px 12px 4px`, rotate(-4deg), Fredoka 600 18px.
- **Lock overlay, creature card, lockbox chest, reveal card:** use the card recipe with pastel fills.
- **Header chips:** trainer name as a paper pill, FP coin, settings as a 44px round paper button with ink border and small shadow.
- **Home bar (AppShell):** sticky top, paper fill, bottom border 2.5px ink, small offset shadow, link with the cat, an arrow and the label in Fredoka 600.

## 4. Backgrounds
- Build a `SceneBackground` component: a fixed layer (`position:fixed; inset:0; z-index:-1; pointer-events:none`) showing `/assets/backgrounds/background_main.webp` with `object-fit:cover; object-position:center bottom`.
- Props: `tone` ("full" or "dim") and optional `progress` (0 to 1). `dim` adds an overlay `rgba(255,248,236,.55)`.
- Timer tint by progress: under 0.33 a cool wash (#BFD9FF, alpha .4, multiply), 0.33 to 0.66 none, above 0.66 a warm wash (#FF9E5E, alpha .42, multiply). Change it with a slow opacity transition, no transition when reduced motion is on.
- `html` carries the cream color; `body` and `#root` must be transparent so the layer is visible.
- Content never sits directly on the painting. Anything over it has an opaque paper fill. The brand sign and header chips are the only floating elements.

## 5. Typography
Fredoka 700 for page titles (36 to 44px), headings and numbers. Fredoka 600 for buttons and labels. Nunito 400/700/800 for body at 16 to 18px. Tabular numerals for FP, time and HP. A wavy underline under page titles is optional (SVG stroke 5px, sunshine-deep or grass).

## 6. Motion and accessibility
- Animate only transform and opacity. Existing reduced-motion handling must stay and cover anything new.
- Contrast 4.5:1 or better: ink on every pastel fill, white text only on focu purple or ink, muted text never lighter than #4A4D68.
- Tap targets 44px or larger. Focus ring: 3px focu purple, offset 3px. Keep all aria labels and alt text. Disabled means dashed and no shadow.

## 7. Screen notes
| Screen | Scene | Notes |
|---|---|---|
| Onboarding | full | Brand sign (cat 96px, "Focu" Fredoka 700 58px, tagline). Step content on paper cards. Starter cards use the card recipe, selected has a focu border and lifts. |
| Home | full | Header chips top left, brand sign top right, three home cards. Keep the existing layout, restyle it. |
| Adventure Setup | dim | Sections as cards with tags. Presets are chips. Sticky points preview. Primary button sunshine. |
| Adventure timer | dim, tint by progress | Ring and companion on a paper card. "Give up" stays a quiet text link. |
| Result | full if completed, dim if lost | Card with the FP number and stamp. |
| Gym map | dim | Nodes as stickers, locked nodes dashed, leader card as a card. |
| Battle | dim | Two creature cards, HP bars, a paper log panel, action buttons from the recipes. |
| Lockbox, Defeat | dim | Chests and messages on cards. |
| Dojo, Lockdex, Settings, Dev, Gallery | dim | Cards, chips and buttons only. |
| Trail Closed (blocked.html) | dim | Centered card. Primary "Back to my Adventure", destructive text link "Visit site anyway". |
