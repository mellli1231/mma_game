import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  fire: boolean
  colors?: string[]
}

const ELEMENT_COLORS = ['#ff7a45', '#3ba3ff', '#3fbf7f']

export function Confetti({ fire, colors = ELEMENT_COLORS }: ConfettiProps) {
  const fired = useRef(false)
  useEffect(() => {
    if (!fire) {
      fired.current = false
      return
    }
    if (fired.current) return
    fired.current = true
    confetti({
      particleCount: 90,
      spread: 78,
      startVelocity: 38,
      gravity: 0.9,
      ticks: 220,
      origin: { x: 0.5, y: 0.62 },
      colors: colors.length ? colors : ELEMENT_COLORS,
      disableForReducedMotion: true,
    })
  }, [fire, colors])
  return null
}
