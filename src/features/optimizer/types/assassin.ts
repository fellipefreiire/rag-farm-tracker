// Assassin Character Profile Types

export type BuildType = 'agi-crit' | 'poison' | 'custom';

export type FarmingGoal = 'zeny' | 'exp' | 'balanced' | 'item-hunt';

export type RiskTolerance = 'safe' | 'moderate' | 'aggressive';

export type SessionDuration = 'short' | 'medium' | 'long';

// Allocated stat points (user-controlled via sliders)
export interface Stats {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
}

// Bonus stats from equipment
export interface StatBonuses {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
}

// Job bonuses (fixed by class and job level)
export interface JobBonuses {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
}

// Derived stats showing soft + hard values where applicable
export interface DerivedStats {
  // HP/SP (shown first)
  hp: number;
  sp: number;

  // ATK format: soft + hard (e.g., 40 + 25)
  atkSoft: number;
  atkHard: number;

  // MATK format: soft + hard (e.g., 46 + 0)
  matkSoft: number;
  matkHard: number;

  // Accuracy (renamed from hit)
  accuracy: number;

  // Attack Range
  attackRange: number;

  // Critical stats
  critical: number;
  criticalDefense: number;

  // Defense stats (separate soft and hard, physical and magical)
  softPhysicalDefense: number;
  hardPhysicalDefense: number;
  softMagicalDefense: number;
  hardMagicalDefense: number;

  // Evasion stats
  flee: number;
  perfectFlee: number;

  // Speed stats
  aspd: number;
  walkDelay: number;
}

export interface EquipmentItem {
  itemId: number;
  itemName: string;
  atk?: number;
  matk?: number;
  def?: number;
  slots?: number;
  cards?: CardEffect[];
}

export interface CardEffect {
  cardId: number;
  cardName: string;
  atkBonus?: number;
  atkPercentBonus?: number; // e.g., +20% vs Demi-human
  targetRace?: string; // 'Demi-Human', 'Undead', etc.
  targetSize?: string; // 'Small', 'Medium', 'Large'
}

export interface Equipment {
  upperHeadgear?: EquipmentItem;
  middleHeadgear?: EquipmentItem;
  lowerHeadgear?: EquipmentItem;
  armor?: EquipmentItem;
  rightWeapon?: EquipmentItem; // Main hand
  leftWeapon?: EquipmentItem; // Off hand (dual-wield)
  garment?: EquipmentItem;
  shoes?: EquipmentItem;
  rightAccessory?: EquipmentItem;
  leftAccessory?: EquipmentItem;
}

export interface Skill {
  skillId: string;
  skillName: string;
  level: number;
  isAoE: boolean;
  element?: string;
  spCost: number;
  damageMultiplier?: number;
}

export interface FarmingPreferences {
  primaryGoal: FarmingGoal;
  sessionDuration: SessionDuration;
  riskTolerance: RiskTolerance;
  targetItems?: number[]; // Item IDs for item-hunt goal
  preferredMaps?: string[];
  avoidMaps?: string[];
}

export interface AssassinProfile {
  id: string;
  name: string;

  // Basic Info
  class: 'Assassin';
  baseLevel: number;
  jobLevel: number;

  // Build
  buildType: BuildType;
  stats: Stats; // Allocated points
  statBonuses: StatBonuses; // Equipment bonuses
  derivedStats: DerivedStats;

  // Equipment
  equipment: Equipment;

  // Skills
  skills: Skill[];
  hasEnchantDeadlyPoison: boolean; // EDP buff active

  // Preferences
  preferences: FarmingPreferences;

  // Metadata
  createdAt: number;
  updatedAt: number;
}
