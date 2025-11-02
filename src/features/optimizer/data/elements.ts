// Element Effectiveness Matrix
// [Attacker Element][Defender Element] = Damage Multiplier

export type ElementType =
  | 'Neutral'
  | 'Water'
  | 'Earth'
  | 'Fire'
  | 'Wind'
  | 'Poison'
  | 'Holy'
  | 'Shadow'
  | 'Ghost'
  | 'Undead';

export const ELEMENT_MATRIX: Record<ElementType, Record<ElementType, number>> = {
  Neutral: {
    Neutral: 1.0,
    Water: 1.0,
    Earth: 1.0,
    Fire: 1.0,
    Wind: 1.0,
    Poison: 1.0,
    Holy: 1.0,
    Shadow: 1.0,
    Ghost: 0.5,
    Undead: 1.0
  },
  Water: {
    Neutral: 1.0,
    Water: 0.5,
    Earth: 1.0,
    Fire: 2.0, // Strong against Fire
    Wind: 0.5,
    Poison: 1.0,
    Holy: 0.75,
    Shadow: 1.0,
    Ghost: 0.5,
    Undead: 1.0
  },
  Earth: {
    Neutral: 1.0,
    Water: 0.5,
    Earth: 0.5,
    Fire: 1.0,
    Wind: 2.0, // Strong against Wind
    Poison: 1.25,
    Holy: 0.75,
    Shadow: 1.0,
    Ghost: 0.5,
    Undead: 1.0
  },
  Fire: {
    Neutral: 1.0,
    Water: 0.5,
    Earth: 2.0, // Strong against Earth
    Fire: 0.5,
    Wind: 1.0,
    Poison: 1.0,
    Holy: 0.75,
    Shadow: 1.0,
    Ghost: 0.5,
    Undead: 1.25
  },
  Wind: {
    Neutral: 1.0,
    Water: 2.0, // Strong against Water
    Earth: 0.5,
    Fire: 1.0,
    Wind: 0.5,
    Poison: 1.0,
    Holy: 0.75,
    Shadow: 1.0,
    Ghost: 0.5,
    Undead: 1.0
  },
  Poison: {
    Neutral: 1.0,
    Water: 1.0,
    Earth: 0.5,
    Fire: 1.0,
    Wind: 1.0,
    Poison: 0.25,
    Holy: 0.5,
    Shadow: 1.25,
    Ghost: 0.5,
    Undead: 0.5
  },
  Holy: {
    Neutral: 1.0,
    Water: 0.75,
    Earth: 0.75,
    Fire: 0.75,
    Wind: 0.75,
    Poison: 0.75,
    Holy: 0.5,
    Shadow: 2.0, // Strong against Shadow
    Ghost: 1.0,
    Undead: 2.0 // Strong against Undead
  },
  Shadow: {
    Neutral: 1.0,
    Water: 1.0,
    Earth: 1.0,
    Fire: 1.0,
    Wind: 1.0,
    Poison: 0.75,
    Holy: 0.5,
    Shadow: 0.5,
    Ghost: 1.0,
    Undead: 1.0
  },
  Ghost: {
    Neutral: 0.5,
    Water: 1.0,
    Earth: 1.0,
    Fire: 1.0,
    Wind: 1.0,
    Poison: 1.25,
    Holy: 1.0,
    Shadow: 1.0,
    Ghost: 2.0, // Strong against Ghost
    Undead: 1.0
  },
  Undead: {
    Neutral: 1.0,
    Water: 1.0,
    Earth: 1.0,
    Fire: 0.75,
    Wind: 1.0,
    Poison: 0.25,
    Holy: 0.5,
    Shadow: 1.0,
    Ghost: 1.0,
    Undead: 0.5
  }
};

// Get elemental effectiveness multiplier
export function getElementalModifier(
  attackerElement: ElementType | undefined,
  defenderElement: string | undefined
): number {
  if (!attackerElement || !defenderElement) return 1.0;

  const normalizedDefender = defenderElement.split(' ')[0] as ElementType;

  return ELEMENT_MATRIX[attackerElement]?.[normalizedDefender] ?? 1.0;
}

// Check if element is strong against defender
export function isStrongAgainst(
  attackerElement: ElementType | undefined,
  defenderElement: string | undefined
): boolean {
  return getElementalModifier(attackerElement, defenderElement) >= 1.5;
}

// Check if element is weak against defender
export function isWeakAgainst(
  attackerElement: ElementType | undefined,
  defenderElement: string | undefined
): boolean {
  return getElementalModifier(attackerElement, defenderElement) <= 0.75;
}
