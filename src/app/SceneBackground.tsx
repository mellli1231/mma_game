const COOL_BELOW = 0.33
const WARM_ABOVE = 0.66
const COOL_WASH = 'rgb(191 217 255 / 40%)'
const WARM_WASH = 'rgb(255 158 94 / 42%)'

interface SceneBackgroundProps {
  tone: 'full' | 'dim'
  /** Timer progress 0 to 1. Tints the scene cool at the start and warm near the end. */
  progress?: number
}

/** Fixed painted scene behind every page. Decorative only. */
export default function SceneBackground({ tone, progress }: SceneBackgroundProps) {
  const cool = progress !== undefined && progress < COOL_BELOW
  const warm = progress !== undefined && progress > WARM_ABOVE
  return (
    <div className="scene-background" aria-hidden="true">
      <img className="scene-background__img" src="/assets/backgrounds/background_main.webp" alt="" />
      {tone === 'dim' && <div className="scene-background__layer scene-background__dim" />}
      {progress !== undefined && (
        <>
          <div className="scene-background__layer scene-background__wash" style={{ background: COOL_WASH, opacity: cool ? 1 : 0 }} />
          <div className="scene-background__layer scene-background__wash" style={{ background: WARM_WASH, opacity: warm ? 1 : 0 }} />
        </>
      )}
    </div>
  )
}
