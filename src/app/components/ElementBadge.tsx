import type { ElementType } from '@/types'

const LABEL: Record<ElementType, { icon: string; text: string; className: string }> = {
  fire: { icon: '🔥', text: 'Fire', className: 'bg-fire text-ink' },
  water: { icon: '💧', text: 'Water', className: 'bg-water text-ink' },
  grass: { icon: '🌿', text: 'Grass', className: 'bg-grass text-ink' },
}

interface ElementBadgeProps {
  element: ElementType
  size?: 'sm' | 'md'
}

export function ElementBadge({ element, size = 'md' }: ElementBadgeProps) {
  const { icon, text, className } = LABEL[element]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill font-display ${className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      {text}
    </span>
  )
}
