export interface Skill {
  id: string;
  name: string;
  maxLevel: number;
  description?: string;
  isFixed?: boolean; // Skills that are always level 1 and can't be changed
  prerequisites?: Array<{
    skillId: string;
    level: number;
  }>;
}

// Novice Skills
export const NOVICE_SKILLS: Skill[] = [
  // Editable skills
  {
    id: 'pick_up',
    name: 'Pick Up',
    maxLevel: 5,
    description: `Skill Form: Active
Description: Collects all items within the Area of Effect. Cooldown depends on skill level.
[Lv. 1]: AoE: 5x5, CD: 10s
[Lv. 2]: AoE: 5x5, CD: 5s
[Lv. 3]: AoE: 7x7, CD: 10s
[Lv. 4]: AoE: 7x7, CD: 5s
[Lv. 5]: AoE: 7x7, CD: no`
  },
  {
    id: 'first_aid',
    name: 'First Aid',
    maxLevel: 5,
    description: `Skill Form: Active
Type: Supportive
Target: Self
Cooldown: 5s
Description: Restores Health Points every second for 5s, scaling with Base Level. Has a chance to remove Bleeding at the end of the process, scaling with Vitality, Strength, Base Level and the skill level.
Interrupted when moving, taking damage, or using a skill.
[Lv. 1]: Heal per second: 3 HP
[Lv. 2]: Heal per second: 6 HP
[Lv. 3]: Heal per second: 9 HP
[Lv. 4]: Heal per second: 12 HP
[Lv. 5]: Heal per second: 15 HP`
  },
  {
    id: 'play_dead',
    name: 'Play Dead',
    maxLevel: 5,
    description: `Skill Form: Active
Target: Self
Description: Lie on the ground to avoid incoming attacks and skills.
Can be canceled by Dispell, Taunt, Provoke and Taunting Traps.
Using the skill again also ends it.
No Experience is gained while in this state.
Cooldown scales with the skill level.
[Lv. 1]: Duration: 2s. CD: no
[Lv. 2]: Duration: 4s. CD: 25s
[Lv. 3]: Duration: 6s. CD: 20s
[Lv. 4]: Duration: 8s. CD: 15s
[Lv. 5]: Duration: 10s. CD: 10s`
  },

  // Fixed skills (always level 1, not editable)
  {
    id: 'basic_skill',
    name: 'Basic Skill',
    maxLevel: 1,
    isFixed: true,
    description: `Skill Form: Passive
Description: Enables basic interface features. Allows trading, using emotes, sitting, opening chat rooms, accessing Kafra storage, and joining or creating a party.
Health Points Recovery and Spell Points Recovery occurs faster.`
  },
  {
    id: 'service_provision',
    name: 'Service Provision',
    maxLevel: 1,
    isFixed: true,
    description: `Skill Form: Active
Description: Enables each Job to offer unique services to other players.
Acolyte: Portals to memorized maps
Archer: Arrow production
Swordsman: Not available
Wizard: Gemstone production
Sage: Scrollbending production
Alchemist: Alchemy production
Blacksmith: Reforge, equipment repair
Assassin: Poison production
Rogue: Not available`
  },
  {
    id: 'vending',
    name: 'Vending',
    maxLevel: 1,
    isFixed: true,
    description: `Skill Form: Active
Requirement: 30,000 Zeny, Finish Quest
Description: Opens a custom shop to sell up to 12 items to others.
Quest With: Business Coach`
  },
  {
    id: 'mediumistic_path',
    name: 'Mediumistic Path',
    maxLevel: 1,
    isFixed: true,
    description: `Skill Form: Passive
Requirement: Base Level 20, Finish Quest
Description: Grants the ability to interact with Spirit monsters.
Quest With: Spiritualist Officer`
  }
];

export const THIEF_SKILLS: Skill[] = [
  {
    id: 'throw_stone',
    name: 'Throw Stone',
    maxLevel: 10,
    description: `Skill Form: Active
Type: Physical
Target: Enemy
Element: Neutral
After Cast Delay: Attack Delay - 0.26s
Cooldown: Attack Delay + 0.36s
Range: 7
Hits: 1
SP Cost: 4
Description: Deals ranged Physical Damage to the target, scaling with Strength. Has a chance to inflict Stun for 4.5s. Also deals 30% increased Physical Damage to stunned enemies.
[Lv. 1]: ATK 110%. Stun Chance: 12%
[Lv. 2]: ATK 140%. Stun Chance: 14%
[Lv. 3]: ATK 160%. Stun Chance: 16%
[Lv. 4]: ATK 180%. Stun Chance: 18%
[Lv. 5]: ATK 200%. Stun Chance: 20%
[Lv. 6]: ATK 220%. Stun Chance: 22%
[Lv. 7]: ATK 240%. Stun Chance: 24%
[Lv. 8]: ATK 260%. Stun Chance: 26%
[Lv. 9]: ATK 280%. Stun Chance: 28%
[Lv.10]: ATK 300%. Stun Chance: 30%`
  },
  {
    id: 'double_attack',
    name: 'Double Attack',
    maxLevel: 10,
    description: `Skill Form: Passive
Description: Grants a chance for basic attacks to hit twice while wielding a Dagger. Also grants Extra Attack and increases the Hit Chance Multiplier from basic attacks and skills for all weapons. Works with Bows if Vulture's Eyes is learned, and with One-Handed Swords if One-Handed Sword Mastery is learned.
[Lv. 1]: Chance: 7%. E.ATK +1. HCM +1%
[Lv. 2]: Chance: 14%. E.ATK +2. HCM +2%
[Lv. 3]: Chance: 21%. E.ATK +3. HCM +3%
[Lv. 4]: Chance: 28%. E.ATK +4. HCM +4%
[Lv. 5]: Chance: 35%. E.ATK +5. HCM +5%
[Lv. 6]: Chance: 42%. E.ATK +6. HCM +6%
[Lv. 7]: Chance: 49%. E.ATK +7. HCM +7%
[Lv. 8]: Chance: 56%. E.ATK +8. HCM +8%
[Lv. 9]: Chance: 63%. E.ATK +9. HCM +9%
[Lv. 10]: Chance: 70%. E.ATK +10. HCM +10%`
  },
  {
    id: 'improve_dodge',
    name: 'Improve Dodge',
    maxLevel: 10,
    description: `Skill Form: Passive
Description: Increases Flee and reduces Walk Delay.
[Lv. 1]: FLEE +3. WD -1%
[Lv. 2]: FLEE +6. WD -2%
[Lv. 3]: FLEE +9. WD -3%
[Lv. 4]: FLEE +12. WD -4%
[Lv. 5]: FLEE +15. WD -5%
[Lv. 6]: FLEE +18. WD -6%
[Lv. 7]: FLEE +21. WD -7%
[Lv. 8]: FLEE +24. WD -8%
[Lv. 9]: FLEE +27. WD -9%
[Lv. 10]: FLEE +30. WD -10%`
  },
  {
    id: 'steal',
    name: 'Steal',
    maxLevel: 10,
    description: `Skill Form: Active
Type: Supportive
Target: Enemy
After Cast Delay: Attack Delay - 0.26s
Cooldown: Attack Delay
Range: 1
Description: Has a chance to steal an item from normal monsters. Success chance scales with the level difference between user and monster.
[Lv. 1]: Steal Chance: 6%
[Lv. 2]: Steal Chance: 12%
[Lv. 3]: Steal Chance: 18%
[Lv. 4]: Steal Chance: 24%
[Lv. 5]: Steal Chance: 30%
[Lv. 6]: Steal Chance: 36%
[Lv. 7]: Steal Chance: 42%
[Lv. 8]: Steal Chance: 48%
[Lv. 9]: Steal Chance: 54%
[Lv. 10]: Steal Chance: 60%`
  },
  {
    id: 'sprinkle_sand',
    name: 'Sprinkle Sand',
    maxLevel: 10,
    description: `Skill Form: Active
Type: Physical
Target: Enemy
Element: Earth
After Cast Delay: Attack Delay - 0.26s
Cooldown: Attack Delay + 1s
Range: 3
Description: Deals Physical Damage to enemies within a 3x3 Area of Effect. Has a 20% chance to inflict Blind on them for 20s. Also increases Weapon Attack by 20% as Earth property temporarily.
[Lv. 1]: ATK 120%. SP Cost: 5
[Lv. 2]: ATK 140%. SP Cost: 6
[Lv. 3]: ATK 160%. SP Cost: 7
[Lv. 4]: ATK 180%. SP Cost: 7
[Lv. 5]: ATK 200%. SP Cost: 8
[Lv. 6]: ATK 220%. SP Cost: 8
[Lv. 7]: ATK 240%. SP Cost: 9
[Lv. 8]: ATK 260%. SP Cost: 9
[Lv. 9]: ATK 280%. SP Cost: 10
[Lv. 10]: ATK 300%. SP Cost: 10`
  },
  {
    id: 'envenom',
    name: 'Envenom',
    maxLevel: 10,
    description: `Skill Form: Active
Type: Magical
Target: Enemy
Element: Poison
After Cast Delay: Attack Delay - 0.26s
Cooldown: Attack Delay
Range: 2 + Weapon's range
Hits: 1
Description: Deals Magical Damage to the target, scaling with Base Level. Has a chance to inflict Poison for 60s.
[Lv. 1]: MATK 120%. SP Cost: 7 Poison Chance: 14%
[Lv. 2]: MATK 140%. SP Cost: 8 Poison Chance: 18%
[Lv. 3]: MATK 160%. SP Cost: 9 Poison Chance: 22%
[Lv. 4]: MATK 180%. SP Cost: 10 Poison Chance: 26%
[Lv. 5]: MATK 200%. SP Cost: 11 Poison Chance: 30%
[Lv. 6]: MATK 220%. SP Cost: 12 Poison Chance: 34%
[Lv. 7]: MATK 240%. SP Cost: 13 Poison Chance: 38%
[Lv. 8]: MATK 260%. SP Cost: 14 Poison Chance: 42%
[Lv. 9]: MATK 280%. SP Cost: 15 Poison Chance: 46%
[Lv. 10]: MATK 300%. SP Cost: 16 Poison Chance: 50%`
  },
  {
    id: 'hiding',
    name: 'Hiding',
    maxLevel: 10,
    description: `Skill Form: Toggle
Type: Supportive
Target: Self
SP Cost: 10
Requirement: Steal Lv. 4
Description: Enters Invisibility and avoids enemy attacks. Prevents any action and drains 1 Spell Points while is active. After Cast Delay scales with the skill level.
[Lv. 1]: ACD: 1.00s. SP Drain: every 1s Duration: 30s
[Lv. 2]: ACD: 0.90s. SP Drain: every 2s Duration: 60s
[Lv. 3]: ACD: 0.80s. SP Drain: every 3s Duration: 90s
[Lv. 4]: ACD: 0.70s. SP Drain: every 4s Duration: 120s
[Lv. 5]: ACD: 0.60s. SP Drain: every 5s Duration: 150s
[Lv. 6]: ACD: 0.50s. SP Drain: every 6s Duration: 180s
[Lv. 7]: ACD: 0.40s. SP Drain: every 7s Duration: 210s
[Lv. 8]: ACD: 0.30s. SP Drain: every 8s Duration: 240s
[Lv. 9]: ACD: 0.20s. SP Drain: every 9s Duration: 270s
[Lv.10]: ACD: 0.10s. SP Drain: every 10s Duration: 300s`,
    prerequisites: [{ skillId: 'steal', level: 4 }]
  },
  {
    id: 'detoxify',
    name: 'Detoxify',
    maxLevel: 1,
    description: `Skill Form: Active
Type: Supportive
Range: 9
After Cast Delay: 1s
Cooldown: 3s
SP Cost: 10
Requirement: Envenom Lv. 3
Description: Attempts to clear Poison status.
The chance scales with Intelligence and Base Level, and the target's Vitality and its Base Level.
Grants +20% resistance to Poison in a successful attempt.`,
    prerequisites: [{ skillId: 'envenom', level: 3 }]
  }
];

export const ASSASSIN_SKILLS: Skill[] = [
  { id: 'dual_wield', name: 'Dual Wield', maxLevel: 10 },
  { id: 'katar_mastery', name: 'Katar Mastery', maxLevel: 10 },
  { id: 'cloaking', name: 'Cloaking', maxLevel: 10 },
  { id: 'poison_weapon', name: 'Poison Weapon', maxLevel: 5 },
  { id: 'poisoner', name: 'Poisoner', maxLevel: 1 },
  { id: 'grimtooth', name: 'Grimtooth', maxLevel: 5 },
  { id: 'sonic_blow', name: 'Sonic Blow', maxLevel: 2 },
  { id: 'poison_react', name: 'Poison React', maxLevel: 5 },
  { id: 'venom_splasher', name: 'Venom Splasher', maxLevel: 1 },
  { id: 'venom_dust', name: 'Venom Dust', maxLevel: 1 }
];

export const ASSASSIN_CROSS_SKILLS: Skill[] = [
  { id: 'meteor_assault', name: 'Meteor Assault', maxLevel: 10 },
  { id: 'cross_legged', name: 'Cross Legged', maxLevel: 5 },
  { id: 'soul_destroyer', name: 'Soul Destroyer', maxLevel: 10 },
  { id: 'vs_ancient', name: 'V.S. Ancient', maxLevel: 1 },
  { id: 'advanced_katar', name: 'Advanced Katar', maxLevel: 5 }
];
