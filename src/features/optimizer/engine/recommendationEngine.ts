import type { AssassinProfile } from '../types/assassin';
import type {
  FarmRecommendation,
  MobScore,
  MobScoreBreakdown,
  Estimates,
  TopDrop,
  RecommendationFilters
} from '../types/recommendation';
import type { Mob } from '../../../types';
import { getElementalModifier, type ElementType } from '../data/elements';
import { FARMING_MAPS } from '../data/maps';

// Hardcoded mob subset for MVP - will be replaced with DB query
// Extended mob type with additional combat stats
interface ExtendedMob extends Mob {
  def?: number;
  flee?: number;
  atk?: number;
}

const SAMPLE_MOBS: ExtendedMob[] = [
  {
    id: 1206,
    name: 'WORM_TAIL',
    jName: 'Cauda de Minhoca',
    sprite: 'WORM_TAIL',
    level: 83,
    hp: 21000,
    baseExp: 15000,
    jobExp: 8000,
    race: 'Insect',
    size: 'Medium',
    element: 'Earth',
    elementLevel: 2,
    def: 28,
    flee: 110,
    atk: 900,
    drops: [
      { itemId: 1064, name: 'Ninhoca', eName: 'Ninhoca', rate: 0.55, slots: 0, type: 0 },
      { itemId: 7006, name: 'Casca de Minhoca', eName: 'Casca de Minhoca', rate: 0.30, slots: 0, type: 0 },
    ]
  },
  {
    id: 1249,
    name: 'STEM_WORM',
    jName: 'Minhoca Gigante',
    sprite: 'STEM_WORM',
    level: 84,
    hp: 32000,
    baseExp: 18500,
    jobExp: 10200,
    race: 'Insect',
    size: 'Medium',
    element: 'Earth',
    elementLevel: 2,
    def: 32,
    flee: 105,
    atk: 980,
    drops: [
      { itemId: 1065, name: 'Perna de Minhoca', eName: 'Perna de Minhoca', rate: 0.60, slots: 0, type: 0 },
      { itemId: 7007, name: 'Cabeça de Minhoca', eName: 'Cabeça de Minhoca', rate: 0.25, slots: 0, type: 0 },
    ]
  }
];

/**
 * Calculate hit rate against a mob
 */
function calculateHitRate(profile: AssassinProfile, mob: ExtendedMob): number {
  const hitChance = 80 + profile.derivedStats.accuracy - (mob.flee || 100);
  return Math.max(20, Math.min(95, hitChance)) / 100; // Clamp between 20% and 95%
}

/**
 * Calculate survivability rating
 */
function calculateSurvivability(profile: AssassinProfile, mob: ExtendedMob): {
  rating: 'safe' | 'moderate' | 'risky';
  hitsCanTake: number;
  score: number;
} {
  const playerHp = profile.derivedStats.hp;
  const mobMaxDamage = mob.atk || 100;
  const playerDef = profile.derivedStats.softPhysicalDefense + profile.derivedStats.hardPhysicalDefense;

  // Simplified damage formula: damage = mobAtk - playerDef (min 1)
  const damagePerHit = Math.max(1, mobMaxDamage - playerDef);
  const hitsCanTake = Math.floor(playerHp / damagePerHit);

  let rating: 'safe' | 'moderate' | 'risky';
  let score: number;

  if (hitsCanTake >= 15) {
    rating = 'safe';
    score = 100;
  } else if (hitsCanTake >= 8) {
    rating = 'moderate';
    score = 70;
  } else {
    rating = 'risky';
    score = 40;
  }

  return { rating, hitsCanTake, score };
}

/**
 * Calculate time to kill (in seconds)
 */
function calculateTimeToKill(profile: AssassinProfile, mob: ExtendedMob, hitRate: number): number {
  const atk = profile.derivedStats.atkSoft + profile.derivedStats.atkHard;
  const { aspd } = profile.derivedStats;

  // Get element effectiveness
  const weaponElement: ElementType = 'Neutral'; // Default, could be enhanced with equipment
  const effectiveness = getElementalModifier(weaponElement, mob.element);

  // Simplified damage: ATK - DEF, with element modifier
  const baseDamage = Math.max(1, atk - (mob.def || 0));
  const damagePerHit = baseDamage * effectiveness * hitRate;

  // Hits needed to kill
  const hitsNeeded = Math.ceil(mob.hp / damagePerHit);

  // ASPD to attacks per second (simplified: ASPD 190 = ~2 attacks/sec)
  const attacksPerSecond = (aspd - 100) / 50;

  return hitsNeeded / attacksPerSecond;
}

/**
 * Calculate level difference score
 */
function calculateLevelDiffScore(playerLevel: number, mobLevel: number): number {
  const diff = Math.abs(playerLevel - mobLevel);

  if (diff <= 5) return 100; // Perfect range
  if (diff <= 10) return 85;
  if (diff <= 15) return 70;
  if (diff <= 20) return 50;
  return 30; // Too far
}

/**
 * Calculate kill speed score
 */
function calculateKillSpeedScore(timeToKill: number): number {
  if (timeToKill <= 3) return 100; // Very fast
  if (timeToKill <= 5) return 90;
  if (timeToKill <= 8) return 75;
  if (timeToKill <= 12) return 60;
  if (timeToKill <= 20) return 40;
  return 20; // Too slow
}

/**
 * Calculate drop value score
 */
function calculateDropValueScore(mob: ExtendedMob): number {
  // This is a placeholder - in reality you'd use item prices from DB
  const totalValue = mob.drops?.reduce((sum: number, drop) => {
    // Assume average price of 1000z per item, weighted by drop rate
    const estimatedValue = 1000 * drop.rate;
    return sum + estimatedValue;
  }, 0) || 0;

  // Scale: 0-100 based on expected value
  if (totalValue >= 500) return 100;
  if (totalValue >= 300) return 80;
  if (totalValue >= 150) return 60;
  if (totalValue >= 50) return 40;
  return 20;
}

/**
 * Calculate EXP value score
 */
function calculateExpValueScore(mob: ExtendedMob, playerLevel: number): number {
  const baseExpValue = mob.baseExp || 0;
  const jobExpValue = mob.jobExp || 0;

  // Level penalty/bonus
  const levelDiff = mob.level - playerLevel;
  let multiplier = 1.0;
  if (levelDiff < -10) multiplier = 0.5; // Too low level
  if (levelDiff > 10) multiplier = 0.7; // Too high level

  const totalExp = (baseExpValue + jobExpValue) * multiplier;

  // Scale based on expected values for level 85-90
  if (totalExp >= 20000) return 100;
  if (totalExp >= 15000) return 85;
  if (totalExp >= 10000) return 70;
  if (totalExp >= 5000) return 50;
  return 30;
}

/**
 * Calculate size modifier score (Katar vs Dagger effectiveness)
 */
function calculateSizeModifierScore(mobSize: string): number {
  // Katars are best against Medium, Daggers are versatile
  // This is a simplified version
  if (mobSize === 'Medium') return 100;
  if (mobSize === 'Small') return 85;
  if (mobSize === 'Large') return 75;
  return 70;
}

/**
 * Score a single mob for the given profile
 */
function scoreMob(profile: AssassinProfile, mob: ExtendedMob, mapName: string): FarmRecommendation {
  const hitRate = calculateHitRate(profile, mob);
  const survivability = calculateSurvivability(profile, mob);
  const timeToKill = calculateTimeToKill(profile, mob, hitRate);

  // Score breakdown
  const levelDiffScore = calculateLevelDiffScore(profile.baseLevel, mob.level);
  const hitRateScore = hitRate * 100;
  const survivabilityScore = survivability.score;
  const killSpeedScore = calculateKillSpeedScore(timeToKill);
  const sizeModifierScore = calculateSizeModifierScore(mob.size);
  const dropValueScore = calculateDropValueScore(mob);
  const expValueScore = calculateExpValueScore(mob, profile.baseLevel);

  // Weight scores based on user's primary goal
  const weights = {
    levelDiff: 0.15,
    hitRate: 0.15,
    survivability: 0.15,
    killSpeed: 0.15,
    sizeModifier: 0.05,
    dropValue: profile.preferences.primaryGoal === 'zeny' ? 0.25 : 0.10,
    expValue: profile.preferences.primaryGoal === 'exp' ? 0.25 : 0.10,
  };

  const totalScore =
    levelDiffScore * weights.levelDiff +
    hitRateScore * weights.hitRate +
    survivabilityScore * weights.survivability +
    killSpeedScore * weights.killSpeed +
    sizeModifierScore * weights.sizeModifier +
    dropValueScore * weights.dropValue +
    expValueScore * weights.expValue;

  // Calculate estimates
  const killsPerHour = Math.floor(3600 / timeToKill);
  const baseExpPerHour = killsPerHour * (mob.baseExp || 0);
  const jobExpPerHour = killsPerHour * (mob.jobExp || 0);
  const grossZenyPerHour = killsPerHour * 100; // Placeholder
  const consumableCostPerHour = 5000; // Placeholder
  const netProfitPerHour = grossZenyPerHour - consumableCostPerHour;

  const breakdown: MobScoreBreakdown = {
    levelDiff: levelDiffScore,
    hitRate: hitRateScore,
    survivability: survivabilityScore,
    killSpeed: killSpeedScore,
    sizeModifier: sizeModifierScore,
    dropValue: dropValueScore,
    expValue: expValueScore,
  };

  const estimates: Estimates = {
    killsPerHour,
    baseExpPerHour,
    jobExpPerHour,
    grossZenyPerHour,
    consumableCostPerHour,
    netProfitPerHour,
    timeToKill,
    hitRate,
    survivalRating: survivability.rating,
    hitsCanTake: survivability.hitsCanTake,
  };

  const score: MobScore = {
    totalScore: Math.round(totalScore),
    breakdown,
    estimates,
  };

  // Generate strengths, warnings, tips
  const strengths: string[] = [];
  const warnings: string[] = [];
  const tips: string[] = [];

  if (killSpeedScore >= 90) strengths.push('Fast kill time');
  if (hitRateScore >= 90) strengths.push('High hit rate');
  if (survivabilityScore === 100) strengths.push('Very safe');
  if (dropValueScore >= 80) strengths.push('Good drops');
  if (expValueScore >= 80) strengths.push('High EXP yield');

  if (survivability.rating === 'risky') warnings.push('⚠️ Bring healing items');
  if (hitRate < 0.8) warnings.push('⚠️ Consider DEX boost');
  if (mob.elementLevel >= 3) warnings.push(`⚠️ Strong ${mob.element} element`);

  if (profile.buildType.includes('AGI')) tips.push('💡 Use Sonic Blow for burst damage');
  if (profile.buildType.includes('Poison')) tips.push('💡 Apply Enchant Deadly Poison');
  tips.push(`💡 Katar recommended for ${mob.size} size`);

  // Top drops (simplified)
  const topDrops: TopDrop[] = mob.drops?.slice(0, 3).map(drop => ({
    item: {
      id: drop.itemId,
      name: drop.name,
      eName: drop.eName,
    } as any, // Simplified
    dropRate: drop.rate,
    valuePerHour: drop.rate * killsPerHour * 1000, // Placeholder value
  })) || [];

  return {
    rank: 0, // Will be set later
    mob,
    mapName,
    mapId: '', // Will be set later
    score,
    strengths,
    warnings,
    tips,
    topDrops,
  };
}

/**
 * Generate farm recommendations for an Assassin profile
 */
export async function generateAssassinRecommendations(
  profile: AssassinProfile,
  filters?: Partial<RecommendationFilters>
): Promise<FarmRecommendation[]> {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 500));

  // Score all mobs
  const scored = SAMPLE_MOBS.map(mob => {
    // Find map for this mob
    const mapEntry = Object.entries(FARMING_MAPS).find(([_, mapData]) =>
      mapData.mobs.includes(mob.id)
    );
    const mapName = mapEntry ? mapEntry[1].name : 'Unknown';
    const mapId = mapEntry ? mapEntry[0] : '';

    const recommendation = scoreMob(profile, mob, mapName);
    return { ...recommendation, mapId };
  });

  // Sort based on filters
  const sortBy = filters?.sortBy || 'score';
  scored.sort((a, b) => {
    switch (sortBy) {
      case 'zeny':
        return b.score.estimates.netProfitPerHour - a.score.estimates.netProfitPerHour;
      case 'exp':
        return b.score.estimates.baseExpPerHour - a.score.estimates.baseExpPerHour;
      case 'killSpeed':
        return a.score.estimates.timeToKill - b.score.estimates.timeToKill;
      case 'score':
      default:
        return b.score.totalScore - a.score.totalScore;
    }
  });

  // Assign ranks
  scored.forEach((rec, index) => {
    rec.rank = index + 1;
  });

  // Return top 10
  return scored.slice(0, 10);
}
