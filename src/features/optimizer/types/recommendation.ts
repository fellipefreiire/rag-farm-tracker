// Farm Recommendation Types

import type { Mob, Item } from '../../../types';

export interface MobScoreBreakdown {
  levelDiff: number; // 0-100
  hitRate: number; // 0-100
  survivability: number; // 0-100
  killSpeed: number; // 0-100
  sizeModifier: number; // 0-100
  dropValue: number; // 0-100
  expValue: number; // 0-100
}

export interface Estimates {
  killsPerHour: number;
  baseExpPerHour: number;
  jobExpPerHour: number;
  grossZenyPerHour: number;
  consumableCostPerHour: number;
  netProfitPerHour: number;
  timeToKill: number; // seconds
  hitRate: number; // 0-1 (percentage)
  survivalRating: 'safe' | 'moderate' | 'risky';
  hitsCanTake: number; // How many hits before death
}

export interface TopDrop {
  item: Item;
  dropRate: number; // 0-1
  valuePerHour: number;
}

export interface MobScore {
  totalScore: number; // 0-100
  breakdown: MobScoreBreakdown;
  estimates: Estimates;
}

export interface FarmRecommendation {
  rank: number;
  mob: Mob;
  mapName: string;
  mapId: string;

  score: MobScore;

  strengths: string[]; // ["Fast kills", "High drop value"]
  warnings: string[]; // ["Bring SP pots", "Fire element resist needed"]
  tips: string[]; // ["Use Sonic Blow", "Katar recommended"]

  topDrops: TopDrop[];
}

export interface RecommendationFilters {
  // Location filters
  mapFilter?: string;
  regionFilter?: string;

  // Mob characteristics
  elementFilter?: string;
  raceFilter?: string;
  sizeFilter?: string;
  levelRange?: [number, number];

  // Performance filters
  minZenyPerHour?: number;
  minExpPerHour?: number;
  minMatchScore?: number;

  // Safety filters
  maxRisk?: 'safe' | 'moderate' | 'aggressive';

  // Sorting
  sortBy?: 'score' | 'zeny' | 'exp' | 'killSpeed';
}

export interface MapData {
  mapId: string;
  name: string;
  region: string; // "Prontera", "Geffen", "Comodo", etc.
  recommendedLevel: number;
  travelTimeMinutes: number; // From major town
  mobs: number[]; // Mob IDs present
}
