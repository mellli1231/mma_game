export interface GymBackground {
  src: string
  /** CSS object-position for the painting. */
  position: string
  /** Alpha of the cream layer that keeps cards readable. */
  overlay: number
}

// Source data lives in src/data (read-only for the UI skin), so the art mapping lives here.
export const GYM_BACKGROUNDS: Record<number, GymBackground> = {
  1: { src: '/assets/backgrounds/gym-1.webp', position: 'center bottom', overlay: 0.25 },
  2: { src: '/assets/backgrounds/gym-2.webp', position: 'center center', overlay: 0.25 },
  3: { src: '/assets/backgrounds/gym-3.webp', position: 'center bottom', overlay: 0.1 },
  4: { src: '/assets/backgrounds/gym-4.webp', position: 'center bottom', overlay: 0.25 },
  5: { src: '/assets/backgrounds/gym-5.webp', position: 'center bottom', overlay: 0.2 },
}

export function getGymBackground(level: number): GymBackground | undefined {
  return GYM_BACKGROUNDS[level]
}
