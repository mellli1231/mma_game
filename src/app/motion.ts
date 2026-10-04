export const ease = {
  airy: [0.22, 1, 0.36, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  breathe: [0.45, 0, 0.55, 1] as const,
}

export const spring = {
  soft: { type: 'spring' as const, stiffness: 180, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 320, damping: 14 },
}

export const dur = {
  micro: 0.15,
  short: 0.3,
  medium: 0.5,
  long: 0.9,
  idle: 2.8,
  idleAdventure: 3.2,
}

export const stagger = 0.06
