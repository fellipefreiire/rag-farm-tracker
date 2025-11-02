export interface TooltipTerm {
  term: string;
  description: string;
}

export const SKILL_TOOLTIPS: Record<string, TooltipTerm> = {
  'Area of Effect': {
    term: 'Area of Effect (AoE)',
    description: 'Area in cells where the effect applies.'
  },
  'Cooldown': {
    term: 'Cooldown (CD)',
    description: 'Prevents reuse of a skill for a set duration after its execution.\nOnly the used skill becomes temporarily unavailable.\nThe cooldown duration varies per skill.'
  },
  'Health Points': {
    term: 'Health Points (HP)',
    description: 'Determines how much damage a character can take before dying.\nHigher Max Health Points means more survivability.'
  },
  'Bleeding': {
    term: 'Bleeding',
    description: 'Bleeding causes HP loss over time, when moving and after using skills.\nAlso prevents HP Recovery.\n\nHP Loss: (Base Lv × 2) + 1% of MaxHP\nHP Loss (while moving): ((Base Lv × 2) + 1% of MaxHP) ÷ 15'
  },
  'Vitality': {
    term: 'Vitality (VIT)',
    description: 'Affects:\nMaxHP: +(VIT)%\nHP Item Healing: +(VIT × 2)%\nS.DEF: +VIT +(VIT ÷ 8)²\nS.MDEF: +(VIT ÷ 5)\nC.DEF: +(VIT ÷ 10)\nHP Recovery: +((VIT ÷ 5)²) ÷ 2'
  },
  'Strength': {
    term: 'Strength (STR)',
    description: 'Affects:\nB.ATK (melee weapons): +1 per STR point\nB.ATK (ranged weapons): +(STR ÷ 5)\nW.ATK (melee weapons): +(STR ÷ 2)%\nWeight Limit: +(STR × 20)'
  },
  'Health Points Recovery': {
    term: 'Health Points Recovery (HP Recovery)',
    description: 'Restores HP passively over time.\nTriggers every 3 seconds while sitting, and every 6 seconds while standing.\nDisabled while moving or in combat.\n\nBase Recovery: (Max HP ÷ 50) + ((VIT ÷ 5)² ÷ 2)\nTotal Recovery: Base × (1 + HP Recovery Mod ÷ 100)'
  },
  'Spell Points Recovery': {
    term: 'Spell Points Recovery (SP Recovery)',
    description: 'Restores SP passively over time.\nTriggers every 4 seconds while sitting, and every 8 seconds while standing.\n\nBase Recovery: (Max SP ÷ 50) + (INT ÷ 6) + 2\nTotal Recovery: Base × (1 + (SP Recovery Mod ÷ 100))'
  },
  'Attack Delay': {
    term: 'Attack Delay (A.Delay)',
    description: 'Defines the time required for attacks to be executed.\n\nA.Delay time (seconds): (4 - (Attack Speed × 0.02))'
  },
  'Physical Damage': {
    term: 'Physical Damage (P.DMG)',
    description: 'Dictates the damage of your physical basic attacks and skills.\n\nDamage calculation: ATK × Skill ATK Multiplier × Damage Multipliers (e.g., Elemental, Size, Race, Class Bonuses)\n\nATK calculation: (B.ATK × 2) + W.ATK + E.ATK + SE ATK + Mastery ATK\n\nB.ATK: Your base physical power, influenced by stats like STR, DEX and LUK.\nW.ATK: The physical power gained from your equipped weapon and its refinements;\nE.ATK: Bonus ATK from equipment, consumables and other effects;\nSE ATK: Temporary ATK boosts from status effects;\nMastery ATK: Special attack power from certain passive skills.'
  },
  'Stun': {
    term: 'Stun',
    description: 'Stuns the target, preventing them from taking actions or flee.'
  },
  'Extra Attack': {
    term: 'Extra Attack (E.ATK)',
    description: 'Attack gained from different sources, such as Equipment, Ammunition, Passive Skills, Status Effects and Consumables.'
  },
  'Hit Chance Multiplier': {
    term: 'Hit Chance Multiplier (HCM)',
    description: 'Multiplies the final Hit Chance of an attack or skill.\n\nHit Chance (%):\n((Attacker ACC - Defender Flee) × HCM) ÷ 100'
  },
  'Flee': {
    term: 'Flee',
    description: 'Reduces the chance of being hit by regular attacks and most physical skills.\n\nChance to avoid a hit:\n(Defender Flee - Attacker Accuracy)%\nThe min chance is 5% and the max is 95%'
  },
  'Walk Delay': {
    term: 'Walk Delay (WD)',
    description: 'Determines how long it takes for a unit to move from one cell to the next. Only the highest Walk Delay bonus from each source type (equipment, skill, or consumable) is applied. Bonuses from different types stack.\n\nCells per second: 1 ÷ (Walk Delay ÷ 1000)\n\nWalk Delay: 1000 ÷ Cells per second'
  },
  'Blind': {
    term: 'Blind',
    description: 'Reduces Accuracy, Flee, Critical and Critical Defense by 30%. Also reduces range visibility.'
  },
  'Weapon Attack': {
    term: 'Weapon Attack (W.ATK)',
    description: 'Attack gained from weapons.'
  },
  'Poison': {
    term: 'Poison',
    description: 'Drains HP every second, reduces Soft Defense and Soft Magic Defense, and disables SP Recovery.\n\nHP Drained (vs Monsters): (Monster HP × 0.005) + (5 + ((Attacker MATK × Base Lv) ÷ 100))\n\nHP Drained (vs Players): (Player HP × 0.01) + (5 + (Base Lv² ÷ 50)) + (5 + ((Attacker MATK × (Base Lv ÷ 2)) ÷ 100))\n\nSoft Defense reduction (%): 30 + ((5 + Attacker Int ÷ 10) for every 5% Defender HP lost)\n\nSoft Magic Defense reduction (%): 15 + ((2.5 + Attacker Int ÷ 20) for every 5% Defender HP lost)'
  },
  'Magical Damage': {
    term: 'Magical Damage (M.DMG)',
    description: 'Dictates the damage of your magic skills\nDamage calculation:\nMATK × Skill MATK Multiplier × Damage Multipliers (e.g., Size, Property, Race Bonuses)\nMATK calculation:\nB.MATK + W.MATK + E.MATK + SE MATK + Mastery MATK\nB.MATK: Your base magical power, influenced by stats like INT and DEX\nW.MATK: The magical power gained from your equipped weapon and its refinements\nE.MATK: Bonus MATK from equipment, consumables, and other effects\nSE MATK: Temporary MATK boosts from status effects\nMastery MATK: Bonus attack power from certain passive skills'
  },
  'Invisibility': {
    term: 'Invisibility',
    description: 'Characters under invisibility are hidden from players and most monsters.\nHowever, some monsters — such as Demons, Insects, or those with the Detector mode — can still detect them.'
  },
  'Spell Points': {
    term: 'Spell Points (SP)',
    description: 'Represents the total resource available to use skills.\nHigher Max Spell Points allows casting more skills before running out.'
  },
  'After Cast Delay': {
    term: 'After Cast Delay (ACD)',
    description: 'Also known as Global Cooldown.\nTemporarily disables the use of all skills after casting one.\nDuring ACD, the character can move and attack, but cannot cast any skill.\nSkill icons remain grayed out during this delay.\n\nFinal ACD:\nBase × (1 - (Rate ÷ 100))\nWhere:\nBase: Skill\'s original ACD\nRate: Sum of all ACD Reduction%'
  },
  'Intelligence': {
    term: 'Intelligence (INT)',
    description: 'Affects:\n\nMax SP: +(INT)%\n\nSP Item Healing: +(INT)%\n\nB.MATK: +((INT × 3) ÷ 2)\n\nS.MDEF: +1 per INT point\n\nVariable Cast Time: -((INT × 100) ÷ 470)%\n\nSP Recovery: +(INT ÷ 6)'
  }
};

// List of field names where the value should NOT have a tooltip
const FIELD_NAMES_WITHOUT_TOOLTIP = [
  'Element',
  'Type',
  'Target',
  'Skill Form'
];

// Helper function to find and mark terms that need tooltips
export function processDescriptionWithTooltips(description: string): Array<{
  text: string;
  tooltip?: TooltipTerm;
}> {
  const parts: Array<{ text: string; tooltip?: TooltipTerm }> = [];

  // Split by lines to handle [Lv. X] sections separately
  const lines = description.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line is a level description (starts with [Lv.)
    const isLevelLine = line.trim().startsWith('[Lv.');

    if (isLevelLine) {
      // Don't apply tooltips to level description lines
      parts.push({ text: line });
    } else {
      // Apply tooltips to non-level lines
      const sortedTerms = Object.keys(SKILL_TOOLTIPS).sort((a, b) => b.length - a.length);

      let currentPos = 0;

      while (currentPos < line.length) {
        let earliestMatch: { index: number; term: string; length: number } | null = null;

        // Find the earliest matching term in the remaining text
        for (const term of sortedTerms) {
          const searchText = line.substring(currentPos);
          const lowerText = searchText.toLowerCase();
          const lowerTerm = term.toLowerCase();
          const index = lowerText.indexOf(lowerTerm);

          if (index !== -1) {
            // Check if it's a whole word match (not part of another word)
            const absoluteIndex = currentPos + index;
            const charBefore = absoluteIndex > 0 ? line[absoluteIndex - 1] : ' ';
            const charAfter = absoluteIndex + term.length < line.length ? line[absoluteIndex + term.length] : ' ';

            // Word boundaries: space, punctuation, or start/end of string
            const beforeOk = /[\s.,;!?()\[\]{}]/.test(charBefore) || absoluteIndex === 0;
            const afterOk = /[\s.,;!?()\[\]{}]/.test(charAfter) || absoluteIndex + term.length === line.length;

            // Don't add tooltip if the term is a value of specific fields
            // Example: "Element: Poison" - NO tooltip on Poison
            // Example: "After Cast Delay: Attack Delay - 0.26s" - HAS tooltip on Attack Delay
            const textBeforeTerm = line.substring(0, absoluteIndex);
            const lastColonIndex = textBeforeTerm.lastIndexOf(':');

            let isFieldValue = false;
            if (lastColonIndex !== -1) {
              const textAfterColon = line.substring(lastColonIndex + 1, absoluteIndex);
              const trimmedAfterColon = textAfterColon.trim();

              // Check if term is the first thing after the colon
              const isFirstAfterColon = trimmedAfterColon === '';

              if (isFirstAfterColon) {
                // Check if the field name (before colon) is in the exclusion list
                const textBeforeColon = line.substring(0, lastColonIndex).trim();
                const isExcludedField = FIELD_NAMES_WITHOUT_TOOLTIP.some(fieldName =>
                  textBeforeColon.toLowerCase().endsWith(fieldName.toLowerCase())
                );

                isFieldValue = isExcludedField;
              }
            }

            if (beforeOk && afterOk && !isFieldValue) {
              if (!earliestMatch || index < earliestMatch.index) {
                earliestMatch = { index, term, length: term.length };
              }
            }
          }
        }

        if (earliestMatch) {
          // Add text before the match
          const absoluteIndex = currentPos + earliestMatch.index;
          if (absoluteIndex > currentPos) {
            parts.push({ text: line.substring(currentPos, absoluteIndex) });
          }

          // Add the matched term with tooltip
          const matchedText = line.substring(absoluteIndex, absoluteIndex + earliestMatch.length);
          parts.push({
            text: matchedText,
            tooltip: SKILL_TOOLTIPS[earliestMatch.term]
          });

          // Move past this match
          currentPos = absoluteIndex + earliestMatch.length;
        } else {
          // No more matches, add the rest of the line
          parts.push({ text: line.substring(currentPos) });
          break;
        }
      }
    }

    // Add newline between lines (except for the last line)
    if (i < lines.length - 1) {
      parts.push({ text: '\n' });
    }
  }

  return parts;
}
