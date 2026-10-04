const ICON_PX = { sm: 72, lg: 96 }

/** Icon, name and tagline. The icon is decorative; the text carries the name. */
export default function BrandLockup({ size }: { size: 'sm' | 'lg' }) {
  const px = ICON_PX[size]
  const nameClass = `font-display font-bold leading-none text-primary ${size === 'lg' ? 'text-[58px]' : 'text-[44px]'}`
  return (
    <div className={`focu-panel flex items-center px-4 py-2 ${size === 'lg' ? 'flex-col gap-3 text-center' : 'gap-3 px-6 py-3'}`}>
      <img
        src="/icon128.png"
        alt=""
        width={px}
        height={px}
        className="animate-[sprite-idle_3s_ease-in-out_infinite]"
      />
      <div>
        {/* The large lockup is the page title on the welcome step; Home has its own h1. */}
        {size === 'lg' ? <h1 className={nameClass}>Focu</h1> : <span className={`block ${nameClass}`}>Focu</span>}
        <p className={`font-bold text-soft ${size === 'lg' ? 'text-sm' : 'text-base'}`}>Lock in. Level up.</p>
      </div>
    </div>
  )
}
