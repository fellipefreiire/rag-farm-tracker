// Assassin Class Data

import type { Skill, JobBonuses } from '../types/assassin';

// Job bonuses for Assassin at Job Level 70
// These are fixed bonuses that every Assassin gets at this job level
export const ASSASSIN_JOB_BONUSES: JobBonuses = {
  str: 9,
  agi: 15,
  vit: 3,
  int: 0,
  dex: 10,
  luk: 8
};

export const ASSASSIN_SKILLS: Record<string, Omit<Skill, 'level'>> = {
  sonic_blow: {
    skillId: 'sonic_blow',
    skillName: 'Sonic Blow',
    isAoE: false,
    spCost: 16,
    damageMultiplier: 8.0, // 8 hits
    element: undefined
  },
  grimtooth: {
    skillId: 'grimtooth',
    skillName: 'Grimtooth',
    isAoE: true,
    element: 'Poison',
    spCost: 3,
    damageMultiplier: 1.2
  },
  envenom: {
    skillId: 'envenom',
    skillName: 'Envenom',
    isAoE: false,
    element: 'Poison',
    spCost: 15,
    damageMultiplier: 1.5
  },
  cloaking: {
    skillId: 'cloaking',
    skillName: 'Cloaking',
    isAoE: false,
    spCost: 0,
    damageMultiplier: 0, // Utility skill
  },
  enchant_deadly_poison: {
    skillId: 'enchant_deadly_poison',
    skillName: 'Enchant Deadly Poison',
    isAoE: false,
    spCost: 40,
    damageMultiplier: 0, // Buff skill
  },
  katar_mastery: {
    skillId: 'katar_mastery',
    skillName: 'Katar Mastery',
    isAoE: false,
    spCost: 0,
    damageMultiplier: 0, // Passive
  },
  lefthand_mastery: {
    skillId: 'lefthand_mastery',
    skillName: 'Lefthand Mastery',
    isAoE: false,
    spCost: 0,
    damageMultiplier: 0, // Passive
  },
  advanced_katar_mastery: {
    skillId: 'advanced_katar_mastery',
    skillName: 'Advanced Katar Mastery',
    isAoE: false,
    spCost: 0,
    damageMultiplier: 0, // Passive
  }
};

export const ASSASSIN_CLASS_DATA = {
  className: 'Assassin',
  damageType: 'physical' as const,
  attackType: 'melee' as const,
  hasAoE: true, // Grimtooth
  isTanky: false,
  isMobile: true,

  // Base stat modifiers (used for HP/SP calculation)
  hpModifier: 1.0, // Low HP
  spModifier: 1.0,

  // ASPD calculation base (190 is cap with high AGI)
  aspdBase: 150,

  // Typical stat allocation
  primaryStats: ['AGI', 'STR', 'LUK'],
  secondaryStats: ['DEX', 'VIT'],
  dumpStats: ['INT']
};

// Common weapon types and their size modifiers
export const WEAPON_SIZE_MODIFIERS = {
  dagger: {
    Small: 1.00,
    Medium: 0.75,
    Large: 0.50
  },
  katar: {
    Small: 0.75,
    Medium: 1.00,
    Large: 1.25
  }
};

// Common Assassin equipment (for autocomplete/suggestions)
export const POPULAR_ASSASSIN_WEAPONS = [
  { id: 1251, name: 'Jur [3]', type: 'katar', atk: 125 },
  { id: 1253, name: 'Katar of Raging Blaze [2]', type: 'katar', atk: 130, element: 'Fire' },
  { id: 1254, name: 'Jamadhar [0]', type: 'katar', atk: 165 },
  { id: 1255, name: 'Katar of Frozen Icicle [3]', type: 'katar', atk: 105, element: 'Water' },
  { id: 1258, name: 'Bloody Roar [2]', type: 'katar', atk: 120 },
  { id: 13000, name: 'Jur [4]', type: 'katar', atk: 125 },
  { id: 13002, name: 'Infiltrator [0]', type: 'katar', atk: 140 },
  { id: 1220, name: 'Gladius [3]', type: 'dagger', atk: 105 },
  { id: 1221, name: 'Damascus [1]', type: 'dagger', atk: 118 },
  { id: 1224, name: 'Sword Breaker [0]', type: 'dagger', atk: 70 }
];

// Common cards for Assassins
export const POPULAR_ASSASSIN_CARDS = [
  { id: 4082, name: 'Desert Wolf Card', atkBonus: 20, description: '+20 ATK' },
  { id: 4131, name: 'Hydra Card', atkPercentBonus: 20, targetRace: 'Demi-Human', description: '+20% vs Demi-Human' },
  { id: 4305, name: 'Turtle General Card', atkPercentBonus: 20, targetRace: 'All', description: '+20 ATK, +2% to all' },
  { id: 4118, name: 'Flora Card', atkPercentBonus: 10, targetRace: 'Fish', description: '+10% vs Fish' },
  { id: 4115, name: 'Sandman Card', atkPercentBonus: 15, targetRace: 'Insect', description: '+15% vs Insect' }
];
