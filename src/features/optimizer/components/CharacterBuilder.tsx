import { useState, useMemo } from 'react';
import { ASSASSIN_JOB_BONUSES } from '../data/assassin';
import { NOVICE_SKILLS, THIEF_SKILLS, ASSASSIN_SKILLS, ASSASSIN_CROSS_SKILLS, type Skill } from '../data/skills';
import { processDescriptionWithTooltips } from '../data/tooltips';
import type { AssassinProfile, BuildType, Stats, StatBonuses } from '../types/assassin';

interface CharacterBuilderProps {
  onSave: (profile: AssassinProfile) => void;
  onCancel: () => void;
  initialProfile?: AssassinProfile | null;
}

// Calculate how many stat points are needed to go from currentValue to targetValue
function calculateStatPointCost(currentValue: number, targetValue: number): number {
  if (targetValue <= currentValue) return 0;

  let cost = 0;
  let value = currentValue;

  while (value < targetValue) {
    // Every 10 points, the cost per point increases
    const tier = Math.floor((value - 1) / 10);
    const costPerPoint = 2 + tier;

    cost += costPerPoint;
    value++;
  }

  return cost;
}

// Calculate cost to increase a stat by 1 from current value
function getCostForNextPoint(currentValue: number): number {
  if (currentValue >= 100) return 0; // Max stat
  const tier = Math.floor((currentValue - 1) / 10);
  return 2 + tier;
}

export function CharacterBuilder({ onSave, onCancel, initialProfile }: CharacterBuilderProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills'>('stats');
  const [profileId] = useState(initialProfile?.id || Date.now().toString());
  const [selectedClass, setSelectedClass] = useState(initialProfile?.name.replace(' Build', '') || 'Assassin Cross');
  const [baseLevel, setBaseLevel] = useState(initialProfile?.baseLevel || 100);
  const [jobLevel, setJobLevel] = useState(initialProfile?.jobLevel || 70);
  const [buildType] = useState<BuildType>(initialProfile?.buildType || 'custom');

  // Allocated stat points (user-controlled)
  const [stats, setStats] = useState<Stats>(initialProfile?.stats || {
    str: 1,
    agi: 1,
    vit: 1,
    int: 1,
    dex: 1,
    luk: 1
  });

  // Equipment bonuses (will be populated later when equipment system is added)
  const [statBonuses] = useState<StatBonuses>(initialProfile?.statBonuses || {
    str: 0,
    agi: 0,
    vit: 0,
    int: 0,
    dex: 0,
    luk: 0
  });

  // Equipment state
  const [equipment, setEquipment] = useState({
    upperHeadgear: '',
    middleHeadgear: '',
    lowerHeadgear: '',
    armor: '',
    rightWeapon: '',
    leftWeapon: '',
    garment: '',
    shoes: '',
    rightAccessory: '',
    leftAccessory: ''
  });

  // Skills state - organized by class tree
  const [skills, setSkills] = useState(() => {
    // Initialize fixed Novice skills to level 1
    const initialNoviceSkills: Record<string, number> = {};
    NOVICE_SKILLS.forEach(skill => {
      if (skill.isFixed) {
        initialNoviceSkills[skill.id] = 1;
      }
    });

    const initialSkills = {
      novice: initialNoviceSkills,
      thief: {} as Record<string, number>,
      assassin: {} as Record<string, number>,
      assassinCross: {} as Record<string, number>
    };

    // Load skills from initialProfile if editing
    if (initialProfile?.skills) {
      const allSkills = [...NOVICE_SKILLS, ...THIEF_SKILLS, ...ASSASSIN_SKILLS, ...ASSASSIN_CROSS_SKILLS];

      initialProfile.skills.forEach((skillData: any) => {
        const skill = allSkills.find(s => s.id === skillData.id);
        if (!skill) return;

        // Find which tree this skill belongs to
        if (NOVICE_SKILLS.find(s => s.id === skillData.id)) {
          initialSkills.novice[skillData.id] = skillData.level;
        } else if (THIEF_SKILLS.find(s => s.id === skillData.id)) {
          initialSkills.thief[skillData.id] = skillData.level;
        } else if (ASSASSIN_SKILLS.find(s => s.id === skillData.id)) {
          initialSkills.assassin[skillData.id] = skillData.level;
        } else if (ASSASSIN_CROSS_SKILLS.find(s => s.id === skillData.id)) {
          initialSkills.assassinCross[skillData.id] = skillData.level;
        }
      });
    }

    return initialSkills;
  });

  // Skill tree expansion state
  const [expandedTree, setExpandedTree] = useState({
    novice: true,
    thief: false,
    assassin: false,
    assassinCross: false
  });

  // Skill description expansion state
  const [expandedSkillDesc, setExpandedSkillDesc] = useState<Record<string, boolean>>({});

  // Calculate total stat points used
  const totalStatsUsed = useMemo(() => {
    let total = 0;
    const statKeys: (keyof Stats)[] = ['str', 'agi', 'vit', 'int', 'dex', 'luk'];

    for (const key of statKeys) {
      total += calculateStatPointCost(1, stats[key]);
    }

    return total;
  }, [stats]);

  // Max stat points at level 100 = 1368
  const maxStatPoints = 1368;
  const remainingPoints = maxStatPoints - totalStatsUsed;

  // Calculate total skill points used per tree (excluding fixed skills)
  const skillPointsUsed = useMemo(() => {
    const countPoints = (tree: Record<string, number>, skillList: Skill[]) => {
      return Object.entries(tree).reduce((sum, [skillId, level]) => {
        const skill = skillList.find(s => s.id === skillId);
        // Don't count fixed skills
        if (skill?.isFixed) return sum;
        return sum + level;
      }, 0);
    };

    const novicePoints = countPoints(skills.novice, NOVICE_SKILLS);
    const thiefPoints = countPoints(skills.thief, THIEF_SKILLS);
    const assassinPoints = countPoints(skills.assassin, ASSASSIN_SKILLS);
    const assassinCrossPoints = countPoints(skills.assassinCross, ASSASSIN_CROSS_SKILLS);

    return {
      novice: novicePoints,
      thief: thiefPoints,
      assassin: assassinPoints,
      assassinCross: assassinCrossPoints,
      total: novicePoints + thiefPoints + assassinPoints + assassinCrossPoints
    };
  }, [skills]);

  // Check if a skill tree is unlocked
  const isTreeUnlocked = (tree: 'novice' | 'thief' | 'assassin' | 'assassinCross'): boolean => {
    if (tree === 'novice') return true;
    if (tree === 'thief') return true; // Remove bloqueio
    if (tree === 'assassin') return true; // Remove bloqueio
    if (tree === 'assassinCross') return true; // No restriction
    return false;
  };


  const handleSave = () => {
    if (remainingPoints < 0) {
      alert('Você ultrapassou o limite de stat points!');
      return;
    }

    if (skillPointsUsed.total > 130) {
      alert('Você ultrapassou o limite de 130 skill points!');
      return;
    }

    // Convert skills state to array format
    const skillsArray: Array<{id: string, level: number}> = [];
    const allTrees: Array<'novice' | 'thief' | 'assassin' | 'assassinCross'> = ['novice', 'thief', 'assassin', 'assassinCross'];

    for (const tree of allTrees) {
      const treeSkills = skills[tree];
      for (const [skillId, level] of Object.entries(treeSkills)) {
        if (level > 0) {
          skillsArray.push({ id: skillId, level });
        }
      }
    }

    const profile: AssassinProfile = {
      id: profileId,
      name: `${selectedClass} Build`,
      class: 'Assassin',
      baseLevel,
      jobLevel,
      buildType,
      stats,
      statBonuses,
      derivedStats: {
        hp: 0,
        sp: 0,
        atkSoft: 0,
        atkHard: 0,
        matkSoft: 0,
        matkHard: 0,
        accuracy: 0,
        attackRange: 1,
        critical: 0,
        criticalDefense: 0,
        softPhysicalDefense: 0,
        hardPhysicalDefense: 0,
        softMagicalDefense: 0,
        hardMagicalDefense: 0,
        flee: 0,
        perfectFlee: 0,
        aspd: 0,
        walkDelay: 0
      },
      equipment: {},
      skills: skillsArray as any,
      hasEnchantDeadlyPoison: false,
      preferences: {
        primaryGoal: 'balanced',
        sessionDuration: 'medium',
        riskTolerance: 'safe',
      },
      createdAt: initialProfile?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(profile);
  };

  const increaseStat = (stat: keyof Stats) => {
    const currentValue = stats[stat];
    if (currentValue >= 100) return; // Max stat

    const cost = getCostForNextPoint(currentValue);
    if (cost > remainingPoints) return; // Not enough points

    setStats(prev => ({ ...prev, [stat]: currentValue + 1 }));
  };

  const decreaseStat = (stat: keyof Stats) => {
    const currentValue = stats[stat];
    if (currentValue <= 1) return; // Min stat

    setStats(prev => ({ ...prev, [stat]: currentValue - 1 }));
  };

  const setStatDirect = (stat: keyof Stats, value: string) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.max(1, Math.min(100, numValue));
    setStats(prev => ({ ...prev, [stat]: clampedValue }));
  };

  const getNextCost = (stat: keyof Stats): number => {
    return getCostForNextPoint(stats[stat]);
  };

  const renderStatRow = (stat: keyof Stats, label: string, color: string) => (
    <div className="flex items-center gap-3 py-2 border-b border-gray-700/50 last:border-b-0">
      <span className={`${color} font-bold w-12`}>{label}</span>
      <button
        onClick={() => decreaseStat(stat)}
        disabled={stats[stat] <= 1}
        className="w-7 h-7 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded font-bold transition-colors"
      >−</button>
      <input
        type="number"
        value={stats[stat]}
        onChange={(e) => setStatDirect(stat, e.target.value)}
        min="1"
        max="100"
        className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={() => increaseStat(stat)}
        disabled={stats[stat] >= 100 || getNextCost(stat) > remainingPoints}
        className="w-7 h-7 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded font-bold transition-colors"
      >+</button>
      <div className="flex-1 text-center">
        <span className="text-green-400 text-sm">+{ASSASSIN_JOB_BONUSES[stat] + statBonuses[stat]}</span>
      </div>
      <div className="text-xs text-gray-500 w-16 text-right">
        Custo: {stats[stat] < 100 ? getNextCost(stat) : 'MAX'}
      </div>
    </div>
  );

  const renderEquipmentSelect = (slot: string, label: string) => (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/30">
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <select
        value={equipment[slot as keyof typeof equipment]}
        onChange={(e) => setEquipment(prev => ({ ...prev, [slot]: e.target.value }))}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Vazio</option>
        <option value="placeholder">Item de exemplo</option>
      </select>
    </div>
  );

  // Helper to get all skills from a tree
  const getSkillList = (tree: 'novice' | 'thief' | 'assassin' | 'assassinCross'): Skill[] => {
    switch (tree) {
      case 'novice': return NOVICE_SKILLS;
      case 'thief': return THIEF_SKILLS;
      case 'assassin': return ASSASSIN_SKILLS;
      case 'assassinCross': return ASSASSIN_CROSS_SKILLS;
    }
  };

  // Helper to find which tree a skill belongs to
  const findSkillTree = (skillId: string): 'novice' | 'thief' | 'assassin' | 'assassinCross' | null => {
    if (NOVICE_SKILLS.find(s => s.id === skillId)) return 'novice';
    if (THIEF_SKILLS.find(s => s.id === skillId)) return 'thief';
    if (ASSASSIN_SKILLS.find(s => s.id === skillId)) return 'assassin';
    if (ASSASSIN_CROSS_SKILLS.find(s => s.id === skillId)) return 'assassinCross';
    return null;
  };

  // Helper to apply prerequisites recursively
  const applyPrerequisites = (skillsState: typeof skills, tree: 'novice' | 'thief' | 'assassin' | 'assassinCross', skillId: string): typeof skills => {
    const skillList = getSkillList(tree);
    const skill = skillList.find(s => s.id === skillId);

    if (!skill?.prerequisites) return skillsState;

    let newState = { ...skillsState };

    for (const prereq of skill.prerequisites) {
      const prereqTree = findSkillTree(prereq.skillId);
      if (!prereqTree) continue;

      const currentLevel = newState[prereqTree][prereq.skillId] || 0;
      if (currentLevel < prereq.level) {
        // Need to add points to prerequisite
        newState = {
          ...newState,
          [prereqTree]: {
            ...newState[prereqTree],
            [prereq.skillId]: prereq.level
          }
        };

        // Recursively apply prerequisites of the prerequisite
        newState = applyPrerequisites(newState, prereqTree, prereq.skillId);
      }
    }

    return newState;
  };

  // Helper to find all skills that depend on this skill
  const findDependentSkills = (skillId: string, tree: 'novice' | 'thief' | 'assassin' | 'assassinCross'): Array<{tree: typeof tree, skillId: string}> => {
    const dependents: Array<{tree: typeof tree, skillId: string}> = [];

    const allTrees: Array<'novice' | 'thief' | 'assassin' | 'assassinCross'> = ['novice', 'thief', 'assassin', 'assassinCross'];

    for (const checkTree of allTrees) {
      const skillList = getSkillList(checkTree);
      for (const skill of skillList) {
        if (skill.prerequisites) {
          for (const prereq of skill.prerequisites) {
            if (prereq.skillId === skillId) {
              dependents.push({ tree: checkTree, skillId: skill.id });
            }
          }
        }
      }
    }

    return dependents;
  };

  // Skill management functions
  const increaseSkill = (tree: 'novice' | 'thief' | 'assassin' | 'assassinCross', skillId: string, maxLevel: number) => {
    setSkills(prev => {
      const currentLevel = prev[tree][skillId] || 0;
      if (currentLevel >= maxLevel) return prev;

      // Check if we would exceed 130 skill points
      const newTotal = skillPointsUsed.total + 1;
      if (newTotal > 130) return prev;

      let newState = {
        ...prev,
        [tree]: {
          ...prev[tree],
          [skillId]: currentLevel + 1
        }
      };

      // Apply prerequisites
      newState = applyPrerequisites(newState, tree, skillId);

      // Check again if total exceeds 130 after prerequisites
      const allTrees: Array<'novice' | 'thief' | 'assassin' | 'assassinCross'> = ['novice', 'thief', 'assassin', 'assassinCross'];
      let totalPoints = 0;
      for (const t of allTrees) {
        const treeSkills = getSkillList(t);
        totalPoints += Object.entries(newState[t]).reduce((sum, [sId, level]) => {
          const s = treeSkills.find(sk => sk.id === sId);
          if (s?.isFixed) return sum;
          return sum + level;
        }, 0);
      }

      if (totalPoints > 130) return prev;

      return newState;
    });
  };

  const decreaseSkill = (tree: 'novice' | 'thief' | 'assassin' | 'assassinCross', skillId: string) => {
    setSkills(prev => {
      const currentLevel = prev[tree][skillId] || 0;
      if (currentLevel <= 0) return prev;

      let newState = {
        ...prev,
        [tree]: {
          ...prev[tree],
          [skillId]: currentLevel - 1
        }
      };

      // Find skills that depend on this one
      const newLevel = currentLevel - 1;

      // Find all dependent skills and check if they need to be reduced
      const dependents = findDependentSkills(skillId, tree);

      for (const dep of dependents) {
        const depSkill = getSkillList(dep.tree).find(s => s.id === dep.skillId);
        if (!depSkill?.prerequisites) continue;

        const depCurrentLevel = newState[dep.tree][dep.skillId] || 0;
        if (depCurrentLevel > 0) {
          // Check if prerequisite is still met
          for (const prereq of depSkill.prerequisites) {
            if (prereq.skillId === skillId && newLevel < prereq.level) {
              // Remove this dependent skill
              newState = {
                ...newState,
                [dep.tree]: {
                  ...newState[dep.tree],
                  [dep.skillId]: 0
                }
              };
            }
          }
        }
      }

      return newState;
    });
  };

  const setSkillLevel = (tree: 'novice' | 'thief' | 'assassin' | 'assassinCross', skillId: string, value: string, maxLevel: number) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(maxLevel, numValue));
    setSkills(prev => ({
      ...prev,
      [tree]: {
        ...prev[tree],
        [skillId]: clampedValue
      }
    }));
  };

  const toggleSkillDescription = (skillId: string) => {
    setExpandedSkillDesc(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  // Component to render description with tooltips
  const DescriptionWithTooltips = ({ description }: { description: string }) => {
    const parts = processDescriptionWithTooltips(description);

    return (
      <>
        {parts.map((part, index) => {
          if (part.tooltip) {
            return (
              <span key={index} className="group relative inline-block">
                <span className="underline decoration-dotted cursor-help text-purple-300">
                  {part.text}
                </span>
                <span className="invisible group-hover:visible absolute left-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg border border-purple-500/30 min-w-[300px] max-w-2xl pointer-events-none" style={{ zIndex: 9999 }}>
                  <div className="font-semibold whitespace-nowrap">{part.tooltip.term}</div>
                  <div className="text-gray-300 whitespace-pre-line">{part.tooltip.description}</div>
                </span>
              </span>
            );
          }
          return <span key={index}>{part.text}</span>;
        })}
      </>
    );
  };

  const renderSkill = (tree: 'novice' | 'thief' | 'assassin' | 'assassinCross', skill: Skill) => {
    const currentLevel = skills[tree][skill.id] || 0;
    const isFixed = skill.isFixed || false;
    const isDescExpanded = expandedSkillDesc[skill.id] || false;

    // Fixed skills are displayed but not editable
    if (isFixed) {
      return (
        <div key={skill.id} className="border-b border-gray-700/50 last:border-b-0">
          <div className="flex items-center gap-3 py-2 opacity-60">
            <button
              onClick={() => toggleSkillDescription(skill.id)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isDescExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-gray-300 flex-1">{skill.name}</span>
            <span className="text-gray-500 text-sm px-3">Fixed Level</span>
            <span className="text-gray-400 text-sm w-16 text-right">{currentLevel}/{skill.maxLevel}</span>
          </div>
          {isDescExpanded && skill.description && (
            <div className="px-8 pb-2 text-sm text-gray-400 bg-gray-900/30 rounded whitespace-pre-line overflow-visible">
              <DescriptionWithTooltips description={skill.description} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={skill.id} className="border-b border-gray-700/50 last:border-b-0">
        <div className="flex items-center gap-3 py-2">
          <button
            onClick={() => toggleSkillDescription(skill.id)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isDescExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-white flex-1">{skill.name}</span>
          <button
            onClick={() => decreaseSkill(tree, skill.id)}
            disabled={currentLevel <= 0}
            className="w-7 h-7 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded font-bold transition-colors"
          >−</button>
          <input
            type="number"
            value={currentLevel}
            onChange={(e) => setSkillLevel(tree, skill.id, e.target.value, skill.maxLevel)}
            min="0"
            max={skill.maxLevel}
            className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => increaseSkill(tree, skill.id, skill.maxLevel)}
            disabled={currentLevel >= skill.maxLevel}
            className="w-7 h-7 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded font-bold transition-colors"
          >+</button>
          <span className="text-gray-400 text-sm w-16 text-right">{currentLevel}/{skill.maxLevel}</span>
        </div>
        {isDescExpanded && skill.description && (
          <div className="px-8 pb-2 text-sm text-gray-400 bg-gray-900/30 rounded whitespace-pre-line overflow-visible">
            <DescriptionWithTooltips description={skill.description} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-2xl p-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-purple-500/30">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'stats'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Status e Itens
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'skills'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Skills
          </button>
        </div>

        {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Basic Info & Stats */}
          <div className="space-y-6">
            {/* Class Selector */}
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                Classe
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Lord Knight">Lord Knight</option>
                <option value="Paladin">Paladin</option>
                <option value="High Wizard">High Wizard</option>
                <option value="Professor">Professor</option>
                <option value="Sniper">Sniper</option>
                <option value="Clown">Clown</option>
                <option value="Gipsy">Gipsy</option>
                <option value="High Priest">High Priest</option>
                <option value="Champion">Champion</option>
                <option value="Whitesmith">Whitesmith</option>
                <option value="Creator">Creator</option>
                <option value="Assassin Cross">Assassin Cross</option>
                <option value="Stalker">Stalker</option>
              </select>
            </div>

            {/* Levels */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Base Level
                </label>
                <input
                  type="number"
                  value={baseLevel}
                  onChange={(e) => setBaseLevel(Math.min(100, Math.max(1, Number(e.target.value))))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Job Level
                </label>
                <input
                  type="number"
                  value={jobLevel}
                  onChange={(e) => setJobLevel(Math.min(70, Math.max(1, Number(e.target.value))))}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="70"
                />
              </div>
            </div>

            {/* Stat Allocation */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30 space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-purple-300">Atributos</h3>
                <div className="text-right">
                  <div className="text-sm text-purple-300">Stat Points</div>
                  <div className="text-2xl font-bold text-white">{remainingPoints}</div>
                  <div className="text-xs text-gray-400">de {maxStatPoints}</div>
                </div>
              </div>

              {renderStatRow('str', 'STR', 'text-red-400')}
              {renderStatRow('agi', 'AGI', 'text-green-400')}
              {renderStatRow('vit', 'VIT', 'text-orange-400')}
              {renderStatRow('int', 'INT', 'text-blue-400')}
              {renderStatRow('dex', 'DEX', 'text-yellow-400')}
              {renderStatRow('luk', 'LUK', 'text-pink-400')}
            </div>
          </div>

          {/* Right Column: Equipment Slots */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">Equipamentos</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                {renderEquipmentSelect('upperHeadgear', 'Upper Headgear')}
                {renderEquipmentSelect('lowerHeadgear', 'Lower Headgear')}
                {renderEquipmentSelect('rightWeapon', 'Right Weapon')}
                {renderEquipmentSelect('garment', 'Garment')}
                {renderEquipmentSelect('rightAccessory', 'Right Accessory')}
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {renderEquipmentSelect('middleHeadgear', 'Middle Headgear')}
                {renderEquipmentSelect('armor', 'Armor')}
                {renderEquipmentSelect('leftWeapon', 'Left Weapon')}
                {renderEquipmentSelect('shoes', 'Shoes')}
                {renderEquipmentSelect('leftAccessory', 'Left Accessory')}
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'skills' && (
          <div className="max-w-4xl mx-auto">
            {/* Skill Points Counter */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 font-semibold">Skill Points</span>
                <span className={`text-2xl font-bold ${skillPointsUsed.total > 130 ? 'text-red-400' : 'text-white'}`}>
                  {skillPointsUsed.total} / 130
                </span>
              </div>
              {skillPointsUsed.total > 130 && (
                <div className="mt-2 text-red-400 text-sm">
                  ⚠️ Você excedeu o limite de skill points!
                </div>
              )}
            </div>

            {/* Skill Trees */}
            <div className="space-y-4">
              {/* Novice */}
              <div className="bg-gray-800/50 rounded-lg border border-purple-500/30 overflow-visible">
                <button
                  onClick={() => setExpandedTree(prev => ({ ...prev, novice: !prev.novice }))}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">Novice</span>
                    <span className="text-sm text-purple-300">
                      {skillPointsUsed.novice}/10 points
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedTree.novice ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTree.novice && (
                  <div className="p-4 border-t border-gray-700/50 space-y-1">
                    {NOVICE_SKILLS.map(skill => renderSkill('novice', skill))}
                  </div>
                )}
              </div>

              {/* Thief */}
              <div className={`bg-gray-800/50 rounded-lg border overflow-visible ${
                isTreeUnlocked('thief') ? 'border-purple-500/30' : 'border-gray-700/50 opacity-50'
              }`}>
                <button
                  onClick={() => isTreeUnlocked('thief') && setExpandedTree(prev => ({ ...prev, thief: !prev.thief }))}
                  disabled={!isTreeUnlocked('thief')}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-700/30 transition-colors disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">Thief</span>
                    <span className="text-sm text-purple-300">
                      {skillPointsUsed.thief}/50 points
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedTree.thief ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTree.thief && isTreeUnlocked('thief') && (
                  <div className="p-4 border-t border-gray-700/50 space-y-1">
                    {THIEF_SKILLS.map(skill => renderSkill('thief', skill))}
                  </div>
                )}
              </div>

              {/* Assassin */}
              <div className={`bg-gray-800/50 rounded-lg border overflow-visible ${
                isTreeUnlocked('assassin') ? 'border-purple-500/30' : 'border-gray-700/50 opacity-50'
              }`}>
                <button
                  onClick={() => isTreeUnlocked('assassin') && setExpandedTree(prev => ({ ...prev, assassin: !prev.assassin }))}
                  disabled={!isTreeUnlocked('assassin')}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-700/30 transition-colors disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">Assassin</span>
                    <span className="text-sm text-purple-300">
                      {skillPointsUsed.assassin} points
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedTree.assassin ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTree.assassin && isTreeUnlocked('assassin') && (
                  <div className="p-4 border-t border-gray-700/50 space-y-1">
                    {ASSASSIN_SKILLS.map(skill => renderSkill('assassin', skill))}
                  </div>
                )}
              </div>

              {/* Assassin Cross */}
              <div className="bg-gray-800/50 rounded-lg border border-purple-500/30 overflow-visible">
                <button
                  onClick={() => setExpandedTree(prev => ({ ...prev, assassinCross: !prev.assassinCross }))}
                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-white">Assassin Cross</span>
                    <span className="text-sm text-purple-300">
                      {skillPointsUsed.assassinCross} points
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedTree.assassinCross ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTree.assassinCross && (
                  <div className="p-4 border-t border-gray-700/50 space-y-1">
                    {ASSASSIN_CROSS_SKILLS.map(skill => renderSkill('assassinCross', skill))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Salvar Build
          </button>
        </div>
      </div>
    </div>
  );
}
