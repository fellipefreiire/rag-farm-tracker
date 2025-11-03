// Refine probability calculator utilities

import type {
  ItemType,
  RefineLevel,
  RefineInput,
  RefineAttemptResult,
  RefineSimulationResult,
  MonteCarloResults,
  CumulativeProbability,
  RefineStepProbability,
} from '../types/refine';
import { getSuccessRate, isSafeRefineLevel } from '../data/refineData';

/**
 * Simulate a single refine attempt
 *
 * Rules:
 * - Success: Refine increases, durability stays same
 * - Failure at safe levels (0-3): Nothing happens
 * - Failure at dangerous levels (4+): Lose 1 durability
 * - Item only breaks if: FAIL + durability is already 0
 */
export function simulateSingleAttempt(
  itemType: ItemType,
  currentRefine: RefineLevel,
  currentDurability: number
): RefineAttemptResult {
  const targetRefine = (currentRefine + 1) as RefineLevel;
  const successRate = getSuccessRate(itemType, currentRefine, targetRefine);
  const isSuccess = Math.random() < successRate;
  const isSafeLevel = isSafeRefineLevel(currentRefine);

  if (isSuccess) {
    // Success: increase refine level, keep durability
    return {
      success: true,
      newRefine: targetRefine,
      newDurability: currentDurability,
      itemDestroyed: false,
    };
  } else {
    // Failure
    if (isSafeLevel) {
      // Safe level (0-3): no durability loss, no destruction
      return {
        success: false,
        newRefine: currentRefine,
        newDurability: currentDurability,
        itemDestroyed: false,
      };
    } else {
      // Dangerous level (4+): lose durability
      // Item ONLY breaks if durability is ALREADY 0
      if (currentDurability === 0) {
        // Fail with 0 durability = item destroyed
        return {
          success: false,
          newRefine: currentRefine,
          newDurability: 0,
          itemDestroyed: true,
        };
      } else {
        // Fail with durability > 0: lose 1 durability, item survives
        return {
          success: false,
          newRefine: currentRefine,
          newDurability: currentDurability - 1,
          itemDestroyed: false,
        };
      }
    }
  }
}

/**
 * Get probability info for a single step upgrade
 */
export function getStepProbability(
  itemType: ItemType,
  from: RefineLevel,
  to: RefineLevel
): RefineStepProbability {
  const successRate = getSuccessRate(itemType, from, to);
  return {
    from,
    to,
    successRate,
    failureRate: 1 - successRate,
    losesDurabilityOnFail: !isSafeRefineLevel(from),
  };
}

/**
 * Get all step probabilities from current to target refine
 */
export function getAllStepProbabilities(
  itemType: ItemType,
  currentRefine: RefineLevel,
  targetRefine: RefineLevel
): RefineStepProbability[] {
  const steps: RefineStepProbability[] = [];
  for (let level = currentRefine; level < targetRefine; level++) {
    steps.push(getStepProbability(itemType, level as RefineLevel, (level + 1) as RefineLevel));
  }
  return steps;
}

/**
 * Calculate cumulative probability using dynamic programming
 * This considers all possible paths and durability states
 */
export function calculateCumulativeProbability(input: RefineInput): CumulativeProbability {
  const { itemType, currentRefine, targetRefine, currentDurability } = input;

  // Simple case: direct upgrade (only 1 level)
  if (targetRefine === currentRefine + 1) {
    const successRate = getSuccessRate(itemType, currentRefine, targetRefine);
    return {
      totalProbability: successRate,
      pathways: [],
      averageAttempts: 1,
      destructionProbability: 0, // Can't be destroyed in single attempt
    };
  }

  // State: [refineLevel][durability] -> probability
  type State = Record<number, Record<number, number>>;

  // Initialize states
  let currentStates: State = {
    [currentRefine]: {
      [currentDurability]: 1.0, // 100% probability at start
    },
  };

  let totalAttempts = 0;
  const maxAttempts = 10000; // Safety limit to prevent infinite loops

  // Iterate until we reach target or all paths are destroyed
  while (totalAttempts < maxAttempts) {
    const nextStates: State = {};
    let hasActiveStates = false;

    // Process each current state
    for (const refineStr in currentStates) {
      const refine = parseInt(refineStr) as RefineLevel;

      for (const durStr in currentStates[refine]) {
        const durability = parseInt(durStr);
        const probability = currentStates[refine][durability];

        if (probability <= 0) continue;

        // If already at target, keep this state
        if (refine >= targetRefine) {
          if (!nextStates[refine]) nextStates[refine] = {};
          nextStates[refine][durability] = (nextStates[refine][durability] || 0) + probability;
          hasActiveStates = true;
          continue;
        }

        // Try to upgrade
        const nextRefine = (refine + 1) as RefineLevel;
        const successRate = getSuccessRate(itemType, refine, nextRefine);
        const isSafe = isSafeRefineLevel(refine);

        // Success path
        if (!nextStates[nextRefine]) nextStates[nextRefine] = {};
        nextStates[nextRefine][durability] =
          (nextStates[nextRefine][durability] || 0) + (probability * successRate);

        // Failure path
        if (isSafe) {
          // Safe: stay at same refine with same durability
          if (!nextStates[refine]) nextStates[refine] = {};
          nextStates[refine][durability] =
            (nextStates[refine][durability] || 0) + (probability * (1 - successRate));
        } else {
          // Dangerous: lose durability
          // Item can have durability 0 and still try to refine
          // Only destroyed if fail with durability ALREADY at 0
          if (durability === 0) {
            // Fail with dur=0 -> item destroyed (probability disappears)
            // Don't add to nextStates
          } else {
            // Fail with dur > 0 -> lose 1 durability, item survives
            const newDurability = durability - 1;
            if (!nextStates[refine]) nextStates[refine] = {};
            nextStates[refine][newDurability] =
              (nextStates[refine][newDurability] || 0) + (probability * (1 - successRate));
          }
        }

        hasActiveStates = true;
      }
    }

    if (!hasActiveStates) break;

    currentStates = nextStates;
    totalAttempts++;
  }

  // Calculate results
  let successProbability = 0;
  let destructionProbability = 0;
  let totalProbability = 0;

  // Sum up all states at target refine level
  if (currentStates[targetRefine]) {
    for (const durStr in currentStates[targetRefine]) {
      successProbability += currentStates[targetRefine][durStr];
    }
  }

  // Calculate total probability (including destroyed items)
  for (const refineStr in currentStates) {
    for (const durStr in currentStates[parseInt(refineStr)]) {
      totalProbability += currentStates[parseInt(refineStr)][durStr];
    }
  }

  destructionProbability = 1 - totalProbability;

  return {
    totalProbability: successProbability,
    pathways: [], // Simplified - not tracking individual paths for performance
    averageAttempts: totalAttempts,
    destructionProbability,
  };
}

/**
 * Run Monte Carlo simulation with N iterations
 */
export function runMonteCarloSimulation(
  input: RefineInput,
  iterations: number = 10000
): MonteCarloResults {
  const { itemType, currentRefine, targetRefine, currentDurability } = input;

  let successCount = 0;
  let failureCount = 0;
  let destructionCount = 0;
  let totalAttemptsOnSuccess = 0;
  let totalDurabilityOnSuccess = 0;

  const attemptDistribution: Record<number, number> = {};
  const durabilityDistribution: Record<number, number> = {};

  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const result = simulateFullRefine(itemType, currentRefine, targetRefine, currentDurability);

    if (result.success) {
      successCount++;
      totalAttemptsOnSuccess += result.attempts;
      totalDurabilityOnSuccess += result.finalDurability;

      attemptDistribution[result.attempts] = (attemptDistribution[result.attempts] || 0) + 1;
      durabilityDistribution[result.finalDurability] =
        (durabilityDistribution[result.finalDurability] || 0) + 1;
    } else if (result.itemDestroyed) {
      destructionCount++;
      failureCount++;
    } else {
      failureCount++;
    }
  }

  return {
    totalSimulations: iterations,
    successCount,
    failureCount,
    destructionCount,
    successRate: successCount / iterations,
    destructionRate: destructionCount / iterations,
    averageAttempts: (totalAttemptsOnSuccess / iterations) || 0,
    averageAttemptsOnSuccess: successCount > 0 ? totalAttemptsOnSuccess / successCount : 0,
    averageDurabilityOnSuccess: successCount > 0 ? totalDurabilityOnSuccess / successCount : 0,
    attemptDistribution,
    durabilityDistribution,
  };
}

/**
 * Simulate a complete refine process from current to target
 */
function simulateFullRefine(
  itemType: ItemType,
  startRefine: RefineLevel,
  targetRefine: RefineLevel,
  startDurability: number
): RefineSimulationResult {
  let currentRefine = startRefine;
  let currentDurability = startDurability;
  let attempts = 0;
  const path: RefineAttemptResult[] = [];
  const maxAttempts = 100000; // Safety limit

  while (attempts < maxAttempts) {
    if (currentRefine >= targetRefine) {
      // Success!
      return {
        success: true,
        attempts,
        finalRefine: currentRefine,
        finalDurability: currentDurability,
        itemDestroyed: false,
        path,
      };
    }

    // Attempt refine (even with durability 0)
    const result = simulateSingleAttempt(itemType, currentRefine, currentDurability);
    path.push(result);
    attempts++;

    currentRefine = result.newRefine;
    currentDurability = result.newDurability;

    // Only stop if item was actually destroyed (fail with dur=0)
    if (result.itemDestroyed) {
      return {
        success: false,
        attempts,
        finalRefine: currentRefine,
        finalDurability: 0,
        itemDestroyed: true,
        path,
      };
    }
  }

  // Max attempts reached (shouldn't happen normally)
  return {
    success: false,
    attempts,
    finalRefine: currentRefine,
    finalDurability: currentDurability,
    itemDestroyed: false,
    path,
  };
}
