import { useState } from 'react'
import type { ReactNode } from 'react'
import type { SpriteState } from '@/types'
import { CREATURE_LIST } from '@/data/creatures'
import { MOVES } from '@/data/moves'
import { GYM_BACKGROUNDS } from '@/app/gymBackgrounds'
import { playSfx, type SfxName } from '@/app/sfx'
import {
  Confetti,
  CreatureCard,
  CreatureSprite,
  ElementBadge,
  FloatingNumber,
  FpBadge,
  HpBar,
  LockboxChest,
  LockOverlay,
  Modal,
  MoveButton,
  PointsPreview,
  RevealCard,
  TimerRing,
  useToast,
  VictoryStamp,
} from '@/app/components'

const SPRITE_STATES: SpriteState[] = [
  'idle', 'hop', 'sentOut', 'attack', 'hit', 'miss', 'heal', 'zonedOut', 'celebrate', 'selected', 'sleepy',
]

const BREAKDOWN = {
  tierName: 'Deep Focus',
  rate: 12,
  baseFp: 120,
  activated: ['social', 'video'],
  rawMultiplier: 3.5,
  multiplier: 2.5,
  capped: true,
  projectedFp: 300,
}

const SFX_BUTTONS: Array<[SfxName, string]> = [
  ['attack', 'Attack'],
  ['healing', 'Healing'],
  ['miss', 'Miss'],
  ['win', 'Win'],
]

const GYM_BACKGROUND_LABELS = [
  'Gym 1: Ping Plaza',
  'Gym 2: Autoplay Alley',
  'Gym 3: The Endless Feed',
  'Gym 4: FOMO Fortress',
  'Gym 5: The Feed Core',
]

const SWATCHES: Array<[string, string]> = [
  ['cream', '#FFF8EC'], ['paper', '#FFFDF6'], ['ink', '#1F2033'], ['muted', '#4A4D68'], ['soft', '#3A3D58'],
  ['focu', '#5B4BDB'], ['sunshine', '#FFD66B'], ['sunshine-deep', '#FFC94D'], ['lavender', '#C9BFF7'],
  ['fire', '#FFA477'], ['water', '#8FCBF5'], ['grass', '#8ED6A4'], ['blush', '#FFC1D0'], ['mint-pale', '#E4F4DC'],
  ['peach-pale', '#FFD2BF'], ['trail', '#F2DEA8'], ['danger', '#B42318'], ['disabled', '#ECEAF3'], ['points', '#FFF8E1'],
]

const CREATURE_REWARD = { kind: 'creature' as const, creatureId: 'embrit' }

function Showcase({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="focu-card p-6">
      <h2 className="focu-tag mb-4">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  )
}

export default function Gallery() {
  const [spriteState, setSpriteState] = useState<SpriteState>('idle')
  const [selectedCreature, setSelectedCreature] = useState('embrit')
  const [modalOpen, setModalOpen] = useState(false)
  const [locked, setLocked] = useState(true)
  const [confetti, setConfetti] = useState(false)
  const { toast } = useToast()

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-4 pb-16 sm:p-8">
      <header className="focu-panel px-6 py-4">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Focu UI kit</p>
        <h1 className="focu-title mt-1">Component Gallery</h1>
        <p className="mt-2 max-w-2xl text-muted">Browse every Lockling and component. Choose a creature state to preview its motion throughout the gallery.</p>
      </header>

      <section className="focu-card p-6" aria-labelledby="sprite-preview-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="sprite-preview-title" className="text-xl">Creature states</h2>
            <p className="mt-1 text-sm text-muted">Current state: <span className="font-bold text-ink">{spriteState}</span></p>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            Creature
            <select className="focu-input" value={selectedCreature} onChange={(event) => setSelectedCreature(event.target.value)}>
              {CREATURE_LIST.map((creature) => <option key={creature.id} value={creature.id}>{creature.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Creature animation state">
          {SPRITE_STATES.map((state) => (
            <button
              key={state}
              type="button"
              aria-pressed={spriteState === state}
              onClick={() => setSpriteState(state)}
              className="focu-chip text-sm capitalize"
            >
              {state}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREATURE_LIST.map((creature) => (
            <button key={creature.id} type="button" onClick={() => setSelectedCreature(creature.id)} className={`flex min-h-28 items-center gap-4 rounded-card p-4 text-left transition-shadow border-[2.5px] ${selectedCreature === creature.id ? 'border-primary bg-lavender' : 'border-ink bg-white'}`}>
              <CreatureSprite defId={creature.id} uid={`gallery-${creature.id}`} size={72} state={spriteState} showParticles />
              <span><span className="block font-display text-lg">{creature.name}</span><span className="text-sm capitalize text-muted">{creature.element} · {creature.rarity}</span></span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-ring-track pt-5">
          <div className="text-center"><CreatureSprite defId={selectedCreature} uid="gallery-large" size={128} state={spriteState} showParticles /><span className="text-xs text-muted">96 px default → 128 px</span></div>
          <div className="text-center"><CreatureSprite defId={selectedCreature} uid="gallery-left" size={96} state={spriteState} facing="left" /><span className="block text-xs text-muted">Facing left</span></div>
          <div className="text-center"><CreatureSprite defId={selectedCreature} uid="gallery-no-shadow" size={96} state={spriteState} showShadow={false} /><span className="block text-xs text-muted">Shadow hidden</span></div>
        </div>
      </section>

      <section className="focu-card p-6" aria-labelledby="skin-title">
        <h2 id="skin-title" className="focu-title mb-4 !text-3xl">Focu skin</h2>
        <ul className="mb-6 flex flex-wrap gap-3">
          {SWATCHES.map(([name, hex]) => (
            <li key={name} className="text-center text-xs font-bold">
              <span className="block h-12 w-16 border-[2.5px] border-ink" style={{ background: hex, borderRadius: 12 }} />
              {name}
              <span className="block font-normal text-muted">{hex}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="focu-btn focu-btn--primary">Primary</button>
          <button type="button" className="focu-btn focu-btn--confirm">Confirm</button>
          <button type="button" className="focu-btn focu-btn--secondary">Secondary</button>
          <button type="button" className="focu-btn focu-btn--danger">Danger</button>
          <button type="button" className="focu-btn" disabled>Disabled</button>
          <button type="button" className="focu-link-danger">Visit site anyway</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="focu-tag">Section tag</span>
          <button type="button" className="focu-chip" aria-pressed="false">Chip</button>
          <button type="button" className="focu-chip" aria-pressed="true">Selected chip</button>
          <span className="focu-badge focu-badge--fire">Fire</span>
          <span className="focu-badge focu-badge--water">Water</span>
          <span className="focu-badge focu-badge--grass">Grass</span>
          <span className="focu-rarity focu-rarity--common">Common</span>
          <span className="focu-rarity focu-rarity--rare">Rare</span>
          <span className="focu-rarity focu-rarity--epic">Epic</span>
          <span className="focu-sticker">Super effective!</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="focu-home-card focu-home-card--adventure"><span className="focu-home-card__title">Adventure</span><span className="focu-home-card__sub">Focus to earn FP</span></div>
          <div className="focu-home-card focu-home-card--battle"><span className="focu-home-card__title">Battle</span><span className="focu-home-card__sub">Challenge a gym</span></div>
          <div className="focu-home-card focu-home-card--training"><span className="focu-home-card__title">Training</span><span className="focu-home-card__sub">Learn new moves</span></div>
        </div>
      </section>

      <section className="focu-card p-6" aria-labelledby="sfx-title">
        <h2 id="sfx-title" className="focu-tag mb-4">Sound effects</h2>
        <div className="flex flex-wrap gap-3">
          {SFX_BUTTONS.map(([name, label]) => (
            <button key={name} type="button" className="focu-chip" onClick={() => playSfx(name)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="focu-card p-6" aria-labelledby="gym-bg-title">
        <h2 id="gym-bg-title" className="focu-tag mb-4">Gym backgrounds</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GYM_BACKGROUND_LABELS.map((label, index) => {
            const entry = GYM_BACKGROUNDS[index + 1]
            return (
              <li key={label}>
                <div className="aspect-video overflow-hidden rounded-2xl border-[2.5px] border-ink">
                  <img
                    src={entry.src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: entry.position }}
                  />
                </div>
                <p className="mt-1 font-display font-semibold">{label}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Showcase title="CreatureCard">
          {CREATURE_LIST.slice(0, 3).map((creature) => <CreatureCard key={creature.id} defId={creature.id} moveCount={2} selected={creature.id === selectedCreature} badge={creature.isStarter ? 'Starter' : undefined} onClick={() => setSelectedCreature(creature.id)} />)}
          <CreatureCard defId="Puddlo" moveCount={4} dimmed badge="Locked" />
        </Showcase>
        <Showcase title="ElementBadge">
          {(['fire', 'water', 'grass'] as const).map((element) => <div key={element} className="flex items-center gap-3"><ElementBadge element={element} size="sm" /><ElementBadge element={element} /></div>)}
        </Showcase>
        <Showcase title="HpBar">
          {[100, 64, 24].map((hp) => <div key={hp} className="w-full max-w-xs"><HpBar hp={hp} /><span className="text-xs text-muted">{hp} HP</span></div>)}
          <div className="w-full max-w-xs"><HpBar hp={67} showNumber={false} /></div>
        </Showcase>
        <Showcase title="FpBadge">
          {[0, 180, 1250].map((amount) => <FpBadge key={amount} amount={amount} animate />)}
        </Showcase>
        <Showcase title="TimerRing">
          <TimerRing startedAt={Date.now()} endsAt={Date.now() + 60_000} size={128} />
          <TimerRing startedAt={Date.now()} endsAt={Date.now() + 300_000} size={96} />
        </Showcase>
        <Showcase title="MoveButton">
          <MoveButton move={MOVES.fire_ember_flick} onClick={() => toast('Ember Flick selected')} />
          <MoveButton move={MOVES.water_splash_jab} effectiveness="super" onClick={() => toast('Super effective!')} />
          <MoveButton move={MOVES.fire_kindle} usesLeft={1} effectiveness="weak" onClick={() => toast('Kindle selected')} />
          <MoveButton move={MOVES.grass_leaf_nick} disabled disabledReason="No uses left" onClick={() => undefined} />
        </Showcase>
        <Showcase title="PointsPreview">
          <div className="w-full max-w-sm"><PointsPreview breakdown={BREAKDOWN} nudges={['Avoid social sites for the full bonus.', 'One more focus session unlocks a streak bonus.']} /></div>
          <div className="w-full max-w-sm"><PointsPreview breakdown={{ ...BREAKDOWN, baseFp: 30, projectedFp: 0, tierName: 'Getting Started', rate: 3, activated: [], rawMultiplier: 1, multiplier: 1, capped: false }} /></div>
        </Showcase>
        <Showcase title="FloatingNumber">
          <FloatingNumber value="−25" kind="damage" /><FloatingNumber value="+25" kind="heal" /><FloatingNumber value="MISS" kind="miss" />
        </Showcase>
        <Showcase title="LockOverlay">
          <div className="flex gap-3"><LockOverlay locked={locked} reason="Beat Gym 2"><div className="rounded-card bg-ring-track p-6 font-display">Gym 3</div></LockOverlay><LockOverlay locked={false}><div className="rounded-card bg-grass p-6 font-display text-ink">Unlocked</div></LockOverlay></div>
          <button type="button" className="focu-chip" onClick={() => setLocked((value) => !value)}>Toggle locked state</button>
        </Showcase>
        <Showcase title="LockboxChest">
          <LockboxChest state="closed" onClick={() => toast('Pick a Lockbox!')} /><LockboxChest state="shaking" /><LockboxChest state="open" /><LockboxChest state="closed" dimmed />
        </Showcase>
        <Showcase title="RevealCard">
          <RevealCard content={CREATURE_REWARD} onContinue={() => toast('Added Embrit to your Lockdex')} />
          <RevealCard content={{ kind: 'move', moveId: 'fire_blaze_burst' }} />
          <RevealCard content={{ kind: 'fp', amount: 250 }} />
        </Showcase>
        <Showcase title="VictoryStamp">
          <VictoryStamp /><VictoryStamp text="NICE WORK!" onDone={() => toast('Victory animation complete')} />
        </Showcase>
        <Showcase title="Confetti">
          <Confetti fire={confetti} colors={['#ff7a45', '#3ba3ff', '#3fbf7f']} />
          <button type="button" className="focu-chip" onClick={() => setConfetti((value) => !value)}>{confetti ? 'Hide' : 'Show'} confetti</button>
        </Showcase>
        <Showcase title="Modal">
          <button type="button" className="focu-btn focu-btn--primary" onClick={() => setModalOpen(true)}>Open example modal</button>
          <Modal open={modalOpen} title="Leave your Adventure?" onClose={() => setModalOpen(false)} actions={<><button type="button" className="focu-btn focu-btn--primary" onClick={() => setModalOpen(false)}>Stay</button><button type="button" className="focu-link-danger" onClick={() => setModalOpen(false)}>Leave</button></>}>
            Your focus session is still running. You can return whenever you are ready.
          </Modal>
        </Showcase>
        <Showcase title="Toast">
          <button type="button" className="focu-btn focu-btn--primary" onClick={() => toast('Your Lockling is ready!')}>Show toast</button>
        </Showcase>
      </div>
    </main>
  )
}
