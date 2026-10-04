import { STRONG_AGAINST, TYPE_STRONG, TYPE_WEAK } from '../data/config';
import type { ElementType } from '../types';

export function typeModifier(atk: ElementType, def: ElementType): 0.5 | 1 | 2 {
  if (STRONG_AGAINST[atk] === def) return TYPE_STRONG;
  if (STRONG_AGAINST[def] === atk) return TYPE_WEAK;
  return 1;
}
