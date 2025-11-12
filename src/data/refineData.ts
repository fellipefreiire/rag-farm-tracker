// Refine probability data for weapons and armor

import type { RefineRates, RefineLevel } from '../types/refine';

// Success rates for each refine level upgrade
export const REFINE_RATES: RefineRates = {
  weapon: {
    '0-1': 1.00,   // +0 → +1 (100% but can fail without durability loss)
    '1-2': 1.00,   // +1 → +2
    '2-3': 1.00,   // +2 → +3
    '3-4': 1.00,   // +3 → +4
    '4-5': 0.60,   // +4 → +5 (60%)
    '5-6': 0.50,   // +5 → +6 (50%)
    '6-7': 0.40,   // +6 → +7 (40%)
    '7-8': 0.30,   // +7 → +8 (30%)
    '8-9': 0.30,   // +8 → +9 (30%)
    '9-10': 0.20,  // +9 → +10 (20%)
    '10-11': 0.19, // +10 → +11 (19%)
    '11-12': 0.18, // +11 → +12 (18%)
    '12-13': 0.17, // +12 → +13 (17%)
    '13-14': 0.16, // +13 → +14 (16%)
    '14-15': 0.15, // +14 → +15 (15%)
    '15-16': 0.14, // +15 → +16 (14%)
    '16-17': 0.13, // +16 → +17 (13%)
    '17-18': 0.12, // +17 → +18 (12%)
    '18-19': 0.11, // +18 → +19 (11%)
    '19-20': 0.10, // +19 → +20 (10%)
  },
  armor: {
    '0-1': 1.00,   // +0 → +1 (100% but can fail without durability loss)
    '1-2': 1.00,   // +1 → +2
    '2-3': 1.00,   // +2 → +3
    '3-4': 1.00,   // +3 → +4
    '4-5': 0.60,   // +4 → +5 (60%)
    '5-6': 0.50,   // +5 → +6 (50%)
    '6-7': 0.40,   // +6 → +7 (40%)
    '7-8': 0.30,   // +7 → +8 (30%)
    '8-9': 0.20,   // +8 → +9 (20%)
    '9-10': 0.19,  // +9 → +10 (19%)
    '10-11': 0.18, // +10 → +11 (18%)
    '11-12': 0.17, // +11 → +12 (17%)
    '12-13': 0.16, // +12 → +13 (16%)
    '13-14': 0.15, // +13 → +14 (15%)
    '14-15': 0.14, // +14 → +15 (14%)
    '15-16': 0.13, // +15 → +16 (13%)
    '16-17': 0.12, // +16 → +17 (12%)
    '17-18': 0.11, // +17 → +18 (11%)
    '18-19': 0.10, // +18 → +19 (10%)
    '19-20': 0.09, // +19 → +20 (9%)
  },
};

// Safe refine levels (don't lose durability on fail)
// Only +0 to +3 are safe. From +4 onwards, failures lose durability
export const SAFE_REFINE_LEVELS: RefineLevel[] = [0, 1, 2, 3];

// Check if a refine level is safe (doesn't lose durability on fail)
export function isSafeRefineLevel(level: RefineLevel): boolean {
  return SAFE_REFINE_LEVELS.includes(level);
}

// Get success rate for a specific upgrade
export function getSuccessRate(
  itemType: 'weapon' | 'armor',
  from: RefineLevel,
  to: RefineLevel
): number {
  const key = `${from}-${to}`;
  return REFINE_RATES[itemType][key] || 0;
}

// Get all refine level options
export function getRefineOptions(): RefineLevel[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
}

// Get valid target refine options based on current refine
export function getValidTargets(currentRefine: RefineLevel): RefineLevel[] {
  return getRefineOptions().filter(level => level > currentRefine);
}

// Format refine level for display
export function formatRefineLevel(level: RefineLevel): string {
  return `+${level}`;
}

// Get refine level color based on value (for UI)
export function getRefineColor(level: RefineLevel): string {
  if (level <= 4) return 'text-gray-300';
  if (level <= 7) return 'text-blue-400';
  if (level <= 9) return 'text-purple-400';
  if (level <= 10) return 'text-yellow-400';
  if (level <= 15) return 'text-orange-400';
  return 'text-red-500';
}
