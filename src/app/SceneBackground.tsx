import { GYM_BACKGROUNDS, getGymBackground } from './gymBackgrounds'

const COOL_BELOW = 0.33
const WARM_ABOVE = 0.66
const COOL_WASH = 'rgb(191 217 255 / 40%)'
const WARM_WASH = 'rgb(255 158 94 / 42%)'

interface SceneBackgroundProps {
  tone: 'full' | 'dim'
  /** Timer progress 0 to 1. Tints the scene cool at the start and warm near the end. */
  progress?: number
  /** Gym 1 to 5. When it has a painting, that replaces the default meadow. */
  gymLevel?: number
}

/**
 * Fixed painted scene behind every page. Decorative only.
 * All gym paintings stay mounted and cross-fade by opacity, which also preloads them.
 */
export default function SceneBackground({ tone, progress, gymLevel }: SceneBackgroundProps) {
  const cool = progress !== undefined && progress < COOL_BELOW
  const warm = progress !== undefined && progress > WARM_ABOVE
  const gym = gymLevel === undefined ? undefined : getGymBackground(gymLevel)
  const activeLevel = gym ? gymLevel : undefined
  return (
    <div className="scene-background" aria-hidden="true">
      <img
        className="scene-background__img scene-background__fade"
        style={{ opacity: gym ? 0 : 1 }}
        src="/assets/backgrounds/background_main.webp"
        alt=""
      />
      {Object.entries(GYM_BACKGROUNDS).map(([level, entry]) => (
        <img
          key={level}
          className="scene-background__img scene-background__fade"
          style={{ objectPosition: entry.position, opacity: Number(level) === activeLevel ? 1 : 0 }}
          src={entry.src}
          alt=""
        />
      ))}
      <div
        className="scene-background__layer scene-background__dim scene-background__fade"
        style={{ opacity: !gym && tone === 'dim' ? 1 : 0 }}
      />
      <div
        className="scene-background__layer scene-background__cream scene-background__fade"
        style={{ opacity: gym ? gym.overlay : 0 }}
      />
      {progress !== undefined && (
        <>
          <div className="scene-background__layer scene-background__wash" style={{ background: COOL_WASH, opacity: cool ? 1 : 0 }} />
          <div className="scene-background__layer scene-background__wash" style={{ background: WARM_WASH, opacity: warm ? 1 : 0 }} />
        </>
      )}
    </div>
  )
}
