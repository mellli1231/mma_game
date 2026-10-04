import type { ElementType } from '@/types'

const LABEL: Record<ElementType, { icon: string; text: string; className: string }> = {
  fire: { icon: '🔥', text: 'Fire', className: 'focu-badge--fire' },
  water: { icon: '💧', text: 'Water', className: 'focu-badge--water' },
  grass: { icon: '🌿', text: 'Grass', className: 'focu-badge--grass' },
}

interface ElementBadgeProps {
  element: ElementType
  size?: 'sm' | 'md'
}

export function ElementBadge({ element, size = 'md' }: ElementBadgeProps) {
  const { icon, text, className } = LABEL[element]
  return (
    <span className={`focu-badge ${className} ${size === 'sm' ? 'text-[13px]' : ''}`}>
      <span aria-hidden="true">{icon}</span>
      {text}
    </span>
  )
}
