import { useEffect, useMemo, useReducer, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { GYMS } from '@/data/gyms';
import { CREATURES } from '@/data/creatures';
import { MOVES } from '@/data/moves';
import { MAX_HP } from '@/data/config';
import {
  Confetti,
  CreatureSprite,
  ElementBadge,
  FloatingNumber,
  HpBar,
  MoveButton,
  VictoryStamp,
} from '@/app/components';
import { useGameState } from '@/app/store';
import { applyEnemyTurn, applyForcedSwitch, applyPlayerAction, createBattle } from '@/engine/battle';
import { defaultRng } from '@/engine/rng';
import { clearGym, recordBattleLoss } from '@/engine/rewards';
import { platform } from '@/platform/platform';
import { typeModifier } from '@/engine/typeChart';
import type { BattleEvent, BattleState, PlayerAction, SpriteState } from '@/types';

interface BattlePageState {
  battle: BattleState | null;
  logs: string[];
  events: BattleEvent[];
  currentEvent: BattleEvent | null;
  playingEvents: boolean;
  thinking: boolean;
  selectingMove: string | null;
  choosingSwitch: boolean;
  confirmingForfeit: boolean;
  error: string | null;
}

type BattlePageAction =
  | { type: 'initialize'; battle: BattleState }
  | { type: 'resolve'; battle: BattleState; events: BattleEvent[] }
  | { type: 'show-event'; event: BattleEvent }
  | { type: 'events-finished' }
  | { type: 'thinking'; value: boolean }
  | { type: 'select-move'; moveId: string | null }
  | { type: 'choose-switch'; value: boolean }
  | { type: 'confirm-forfeit'; value: boolean }
  | { type: 'error'; message: string };

const initialPageState: BattlePageState = {
  battle: null,
  logs: [],
  events: [],
  currentEvent: null,
  playingEvents: false,
  thinking: false,
  selectingMove: null,
  choosingSwitch: false,
  confirmingForfeit: false,
  error: null,
};

function pageReducer(state: BattlePageState, action: BattlePageAction): BattlePageState {
  switch (action.type) {
    case 'initialize':
      return { ...initialPageState, battle: action.battle };
    case 'resolve':
      return {
        ...state,
        battle: action.battle,
        events: action.events,
        currentEvent: null,
        playingEvents: action.events.length > 0,
        thinking: false,
        selectingMove: null,
        choosingSwitch: false,
        error: null,
      };
    case 'show-event':
      return {
        ...state,
        events: state.events.slice(1),
        currentEvent: action.event,
        logs: [...state.logs, action.event.message].slice(-4),
      };
    case 'events-finished':
      return { ...state, events: [], currentEvent: null, playingEvents: false };
    case 'thinking':
      return { ...state, thinking: action.value };
    case 'select-move':
      return { ...state, selectingMove: action.moveId, choosingSwitch: false };
    case 'choose-switch':
      return { ...state, choosingSwitch: action.value, selectingMove: null };
    case 'confirm-forfeit':
      return { ...state, confirmingForfeit: action.value };
    case 'error':
      return { ...state, error: action.message, thinking: false, playingEvents: false };
  }
}

function playerActionForMove(moveId: string, targetIndex?: number): PlayerAction {
  return targetIndex === undefined
    ? { type: 'move', moveId }
    : { type: 'move', moveId, targetIndex };
}

export function isMissEventForCreature(event: BattleEvent | null, creatureName: string): boolean {
  return event?.type === 'MISSED' && event.message.startsWith(`${creatureName} `);
}

export default function Battle() {
  const { level: levelParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = useGameState();
  const [page, dispatch] = useReducer(pageReducer, initialPageState);
  const aliveRun = useRef(true);
  const turnInProgress = useRef(false);
  const terminalResultSaved = useRef(false);
  const gymLevel = Number(levelParam);
  const gym = GYMS[gymLevel];
  const practice = new URLSearchParams(location.search).get('practice') === '1';
  const activeBattle = page.battle;
  const player = activeBattle?.player.team[activeBattle.player.activeIndex];
  const enemy = activeBattle?.enemy.team[activeBattle.enemy.activeIndex];
  const blockedReason = useMemo(() => {
    if (!state) return null;
    if (state.activeSession) return 'Battles are locked while you’re on an Adventure.';
    if (state.pendingReward) return 'Choose your pending Lockbox reward before battling.';
    if (state.squad.length === 0) return 'Add a Lockling to your Squad before battling.';
    if (!practice && gymLevel !== state.currentGymLevel) return 'Only the current Gym can be challenged.';
    if (practice && gymLevel >= state.currentGymLevel) return 'Practice is available after a Gym has been cleared.';
    return null;
  }, [gymLevel, practice, state]);

  useEffect(() => {
    aliveRun.current = true;
    return () => {
      aliveRun.current = false;
    };
  }, []);

  useEffect(() => {
    if (!state || !gym || blockedReason || page.battle) return;
    try {
      dispatch({ type: 'initialize', battle: createBattle(state, gymLevel, practice) });
    } catch (error) {
      dispatch({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not start this battle.',
      });
    }
  }, [blockedReason, gym, gymLevel, page.battle, practice, state]);

  async function takeAction(action: PlayerAction) {
    if (
      turnInProgress.current
      || !activeBattle
      || page.playingEvents
      || page.thinking
      || activeBattle.phase !== 'player_turn'
    ) return;
    turnInProgress.current = true;
    try {
      const playerResult = applyPlayerAction(activeBattle, action, defaultRng);
      dispatch({ type: 'resolve', battle: playerResult.battle, events: playerResult.events });
      await playEvents(playerResult.events);
      if (!aliveRun.current) return;
      if (playerResult.battle.phase === 'victory') {
        await finishBattle(playerResult.battle);
        return;
      }
      if (playerResult.battle.phase === 'defeat') {
        await finishBattle(playerResult.battle);
        return;
      }
      if (playerResult.battle.phase === 'player_forced_switch') return;
      if (playerResult.battle.phase !== 'enemy_turn') return;

      dispatch({ type: 'thinking', value: true });
      await delay(900);
      if (!aliveRun.current) return;
      const enemyResult = applyEnemyTurn(playerResult.battle, gym!, defaultRng);
      dispatch({ type: 'resolve', battle: enemyResult.battle, events: enemyResult.events });
      await playEvents(enemyResult.events);
      if (!aliveRun.current) return;
      if (enemyResult.battle.phase === 'defeat') {
        await finishBattle(enemyResult.battle);
      }
    } catch (error) {
      dispatch({
        type: 'error',
        message: error instanceof Error ? error.message : 'That battle action could not be completed.',
      });
    } finally {
      turnInProgress.current = false;
    }
  }

  async function finishBattle(battle: BattleState) {
    if (terminalResultSaved.current) return;
    terminalResultSaved.current = true;

    try {
      if (battle.winner === 'player') {
        if (practice) {
          navigate('/gyms');
          return;
        }
        const updated = await platform.updateState((current) => clearGym(current, gymLevel, defaultRng));
        navigate(updated.pendingReward ? '/lockbox' : '/gyms');
        return;
      }
      await platform.updateState(recordBattleLoss);
      navigate('/defeat', { state: { gymLevel, gymName: gym?.name, practice } });
    } catch (error) {
      terminalResultSaved.current = false;
      dispatch({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not save the battle result.',
      });
    }
  }

  async function winBattleNow() {
    if (!activeBattle || turnInProgress.current || terminalResultSaved.current) return;
    turnInProgress.current = true;
    const winningBattle: BattleState = {
      ...activeBattle,
      phase: 'victory',
      winner: 'player',
    };
    dispatch({ type: 'resolve', battle: winningBattle, events: [] });
    try {
      await finishBattle(winningBattle);
    } finally {
      turnInProgress.current = false;
    }
  }

  async function playEvents(events: BattleEvent[]) {
    for (const event of events) {
      await delay(600);
      if (!aliveRun.current) return;
      dispatch({ type: 'show-event', event });
    }
    if (aliveRun.current) dispatch({ type: 'events-finished' });
  }

  function delay(durationMs: number) {
    return new Promise<void>((resolve) => window.setTimeout(resolve, durationMs));
  }

  function chooseForcedSwitch(toIndex: number) {
    if (!activeBattle) return;
    try {
      const result = applyForcedSwitch(activeBattle, toIndex);
      dispatch({ type: 'resolve', battle: result.battle, events: result.events });
    } catch (error) {
      dispatch({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not switch Locklings.',
      });
    }
  }

  if (!state) return <main className="p-6">Loading your battle...</main>;
  if (!gym) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Gym not found</h1>
        <Link className="mt-4 inline-block underline" to="/gyms">Return to the Gym Map</Link>
      </main>
    );
  }
  if (blockedReason) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Battle unavailable</h1>
        <p>{blockedReason}</p>
        {state.pendingReward && <Link className="underline" to="/lockbox">Open your Lockbox</Link>}
        {state.squad.length === 0 && <Link className="underline" to="/lockdex">Edit your Squad</Link>}
        <Link className="block underline" to="/gyms">Return to the Gym Map</Link>
      </main>
    );
  }
  if (page.error && !activeBattle) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Could not start battle</h1>
        <p role="alert">{page.error}</p>
        <Link className="underline" to="/gyms">Return to the Gym Map</Link>
      </main>
    );
  }
  if (!activeBattle || !player || !enemy) return <main className="focu-card m-6 p-6">Preparing your battle...</main>;

  const locked = page.playingEvents || page.thinking || activeBattle.phase !== 'player_turn';
  const isTerminal = activeBattle.phase === 'victory' || activeBattle.phase === 'defeat';
  const activeMove = page.selectingMove ? MOVES[page.selectingMove] : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 p-5 text-ink">
      <header className="flex items-center justify-between gap-4">
        <div className="focu-panel px-5 py-2">
          <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
            {practice ? 'Practice battle' : `Gym ${gymLevel}`}
          </p>
          <h1 className="font-display text-2xl font-bold">{gym.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {state.settings.demoMode && !practice && !isTerminal && (
            <button
              type="button"
              onClick={() => void winBattleNow()}
              disabled={page.playingEvents || page.thinking || turnInProgress.current}
              className="focu-chip text-sm"
            >
              Dev: win now
            </button>
          )}
          <Link className="focu-pill" to="/gyms">Leave battle</Link>
        </div>
      </header>

      {activeBattle.phase === 'intro' && (
        <section className="focu-card bg-lavender p-5 text-center">
          <p className="font-display text-lg font-semibold">{gym.leader} wants to battle!</p>
          <button
            type="button"
            onClick={() => dispatch({ type: 'resolve', battle: { ...activeBattle, phase: 'player_turn' }, events: [] })}
            className="focu-btn focu-btn--primary mt-4"
          >
            Send out {player.name}
          </button>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Battle teams">
        <CreaturePanel
          label="Your active Lockling"
          creature={player}
          facing="right"
          event={page.currentEvent}
          celebrating={activeBattle.phase === 'victory'}
        />
        <CreaturePanel label="Opponent" creature={enemy} facing="left" event={page.currentEvent} />
      </section>

      <section className="focu-card min-h-24 p-5" aria-live="polite" aria-label="Battle log">
        {page.thinking && <p className="font-semibold">The opponent is thinking...</p>}
        {page.logs.length === 0 && !page.thinking && <p>{gym.leader} is ready. Your Squad acts first.</p>}
        <ul className="mt-2 space-y-1">
          {page.logs.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}
        </ul>
      </section>

      {activeBattle.phase === 'player_forced_switch' && (
        <section className="focu-card bg-points p-5">
          <h2 className="font-display font-semibold">Choose your next Lockling</h2>
          <p className="text-sm">This forced switch does not use your turn.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {activeBattle.player.team.map((creature, index) => index !== activeBattle.player.activeIndex && creature.hp > 0 && (
              <SwitchOption
                key={creature.uid}
                creature={creature}
                enemy={enemy}
                onClick={() => chooseForcedSwitch(index)}
              />
            ))}
          </div>
        </section>
      )}

      {!isTerminal && activeBattle.phase === 'player_turn' && (
        <section className="focu-card p-5">
          {!page.selectingMove && !page.choosingSwitch && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={locked}
                onClick={() => dispatch({ type: 'select-move', moveId: 'fight' })}
                className="focu-btn focu-btn--primary"
              >
                Fight
              </button>
              <button
                type="button"
                disabled={locked}
                onClick={() => dispatch({ type: 'choose-switch', value: true })}
                className="focu-btn focu-btn--secondary"
              >
                Switch
              </button>
              <button
                type="button"
                disabled={locked}
                onClick={() => dispatch({ type: 'confirm-forfeit', value: true })}
                className="focu-btn focu-btn--danger"
              >
                Forfeit
              </button>
            </div>
          )}

          {page.selectingMove && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">Choose a move</h2>
                <button type="button" onClick={() => dispatch({ type: 'select-move', moveId: null })} className="font-bold text-primary underline">
                  Back
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {player.moveIds.map((moveId) => {
                  const move = MOVES[moveId];
                  if (!move) return null;
                  const usesLeft = player.healUsesLeft[moveId];
                  const validHealTargets = activeBattle.player.team
                    .map((creature, index) => ({ creature, index }))
                    .filter(({ creature }) => creature.hp > 0 && creature.hp < MAX_HP);
                  const disabled = move.effect === 'heal'
                    ? (usesLeft ?? 0) <= 0 || validHealTargets.length === 0
                    : false;
                  const effectiveness = move.effect === 'attack'
                    ? typeModifier(move.element, enemy.element)
                    : 1;
                  return (
                    <div key={moveId} className="rounded-2xl border-2 border-ink/20 p-3">
                      <div className="flex items-center gap-2">
                        <MoveButton
                          move={move}
                          usesLeft={move.effect === 'heal' ? usesLeft ?? 0 : undefined}
                          effectiveness={effectiveness === 2 ? 'super' : effectiveness === 0.5 ? 'weak' : null}
                          disabled={disabled || locked}
                          disabledReason={disabled
                            ? (usesLeft ?? 0) <= 0 ? 'No uses remaining' : 'Everyone is at full HP'
                            : undefined}
                          onClick={() => move.effect === 'attack'
                            ? void takeAction(playerActionForMove(moveId))
                            : dispatch({ type: 'select-move', moveId })}
                        />
                        <ElementBadge element={move.element} size="sm" />
                      </div>
                      {disabled && move.effect === 'heal' && (
                        <p className="mt-2 text-sm text-muted">
                          {(usesLeft ?? 0) <= 0 ? 'No uses remaining' : 'No injured Squad members'}
                        </p>
                      )}
                      {move.effect === 'heal' && page.selectingMove === moveId && (
                        <div className="mt-3 border-t-2 border-ink/20 pt-3">
                          <p className="mb-2 text-sm font-semibold">Choose a teammate to heal</p>
                          {activeBattle.player.team.map((creature, index) => (
                            <button
                              key={creature.uid}
                              type="button"
                              disabled={creature.hp <= 0 || creature.hp >= MAX_HP || locked || (usesLeft ?? 0) <= 0}
                              onClick={() => void takeAction(playerActionForMove(moveId, index))}
                              className="focu-chip mr-2 mt-1 text-sm"
                            >
                              {creature.name} · {creature.hp}/{MAX_HP} HP
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {page.choosingSwitch && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">Choose a Lockling to switch in</h2>
                <button type="button" onClick={() => dispatch({ type: 'choose-switch', value: false })} className="font-bold text-primary underline">
                  Back
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {activeBattle.player.team.map((creature, index) => index !== activeBattle.player.activeIndex && (
                  <SwitchOption
                    key={creature.uid}
                    creature={creature}
                    enemy={enemy}
                    disabled={creature.hp <= 0 || locked}
                    onClick={() => void takeAction({ type: 'switch', toIndex: index })}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {page.confirmingForfeit && (
        <div className="focu-modal-overlay fixed inset-0 z-10 flex items-center justify-center p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="forfeit-title" className="focu-modal w-full max-w-md">
            <h2 id="forfeit-title" className="focu-modal__title">Forfeit this battle?</h2>
            <p className="mt-2 text-soft">This counts as a defeat.</p>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-4">
              <button type="button" onClick={() => dispatch({ type: 'confirm-forfeit', value: false })} className="focu-btn focu-btn--primary">
                Keep battling
              </button>
              <button type="button" onClick={() => {
                dispatch({ type: 'confirm-forfeit', value: false });
                void takeAction({ type: 'forfeit' });
              }} className="focu-link-danger min-h-tap px-2">
                Forfeit
              </button>
            </div>
          </section>
        </div>
      )}

      {page.error && <p role="alert" className="focu-card p-3 font-bold text-danger">{page.error}</p>}

      {activeBattle.phase === 'victory' && (
        <section className="focu-card bg-mint-pale p-6 text-center">
          <Confetti fire />
          <VictoryStamp />
          <p className="mt-2">You beat {gym.leader}.</p>
          {practice && <p className="mt-1 text-sm">Practice battles do not change Gym progress or award Lockboxes.</p>}
          <Link to="/gyms" className="focu-btn focu-btn--confirm mt-4">
            Return to the Gym Map
          </Link>
        </section>
      )}
    </main>
  );
}

type BattleCreature = NonNullable<BattlePageState['battle']>['player']['team'][number];

/** A switch candidate: the Lockling, its type, its HP and how it matches up against the opponent. */
function SwitchOption({
  creature,
  enemy,
  disabled = false,
  onClick,
}: {
  creature: BattleCreature;
  enemy: BattleCreature;
  disabled?: boolean;
  onClick: () => void;
}) {
  const modifier = typeModifier(creature.element, enemy.element);
  const matchup = modifier > 1
    ? { text: `Strong against ${enemy.name}`, tone: 'bg-grass' }
    : modifier < 1
      ? { text: `Weak against ${enemy.name}`, tone: 'bg-fire' }
      : { text: `Even match with ${enemy.name}`, tone: 'bg-white' };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`${creature.name}, ${creature.hp} of ${MAX_HP} HP. ${matchup.text}`}
      className={`focu-card flex items-center gap-3 p-3 text-left ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
    >
      <CreatureSprite defId={creature.defId} uid={creature.uid} size={80} state={creature.hp <= 0 ? 'zonedOut' : 'idle'} />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-bold">{creature.name}</span>
          <ElementBadge element={creature.element} size="sm" />
        </span>
        <HpBar hp={creature.hp} maxHp={MAX_HP} />
        <span className={`inline-block rounded-full border-2 border-ink px-3 text-sm font-bold ${matchup.tone}`}>{matchup.text}</span>
      </span>
    </button>
  );
}

function CreaturePanel({
  label,
  creature,
  facing,
  event,
  celebrating = false,
}: {
  label: string;
  creature: NonNullable<BattlePageState['battle']>['player']['team'][number];
  facing: 'left' | 'right';
  event: BattleEvent | null;
  celebrating?: boolean;
}) {
  const damage = event?.type === 'DAMAGE'
    ? Number(event.message.match(/^(.+) took (\d+) damage\.$/)?.[2])
    : 0;
  const healed = event?.type === 'HEALED'
    ? Number(event.message.match(/^(.+) recovered (\d+) HP!$/)?.[2])
    : 0;
  const isTarget = event?.type === 'DAMAGE' || event?.type === 'HEALED'
    ? event.message.startsWith(`${creature.name} `)
    : false;
  const missed = isMissEventForCreature(event, creature.name);
  const sentOut = event?.type === 'SENT_OUT'
    ? event.message.includes(creature.name)
    : event?.type === 'SWITCHED' && event.message.endsWith(`Go, ${creature.name}!`);
  const moveName = event?.type === 'MOVE_USED'
    ? event.message.match(/^.+ used (.+)!$/)?.[1]
    : undefined;
  const move = moveName ? Object.values(MOVES).find((candidate) => candidate.name === moveName) : undefined;
  const acting = event?.type === 'MOVE_USED' && event.message.startsWith(`${creature.name} `);
  const spriteState: SpriteState = celebrating
    ? 'celebrate'
    : creature.hp <= 0 || event?.type === 'ZONED_OUT' && event.message.startsWith(`${creature.name} `)
    ? 'zonedOut'
    : sentOut
      ? 'sentOut'
      : isTarget && event?.type === 'DAMAGE'
        ? 'hit'
        : isTarget && event?.type === 'HEALED'
          ? 'heal'
          : missed
            ? 'miss'
            : acting
              ? move?.effect === 'heal' ? 'heal' : 'attack'
              : 'idle';

  return (
    <article className="focu-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">{label}</p>
          <h2 className="font-display text-xl font-bold">{creature.name}</h2>
          <ElementBadge element={creature.element} size="sm" />
        </div>
        <div className="relative shrink-0">
          <CreatureSprite
            defId={creature.defId}
            uid={creature.uid}
            size={96}
            state={spriteState}
            facing={facing}
            showParticles
          />
          {isTarget && event?.type === 'DAMAGE' && damage > 0 && (
            <span key={`${event.message}-${creature.uid}`} className="absolute inset-x-0 top-0 text-center">
              <FloatingNumber value={`-${damage}`} kind="damage" />
            </span>
          )}
          {isTarget && event?.type === 'HEALED' && healed > 0 && (
            <span key={`${event.message}-${creature.uid}`} className="absolute inset-x-0 top-0 text-center">
              <FloatingNumber value={`+${healed}`} kind="heal" />
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <HpBar hp={creature.hp} maxHp={MAX_HP} />
      </div>
      {creature.hp === 0 && <p className="mt-2 text-sm font-bold text-muted">Zoned out</p>}
    </article>
  );
}
