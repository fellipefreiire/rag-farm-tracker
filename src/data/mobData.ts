export type ElementName = 'Neutral' | 'Fire' | 'Earth' | 'Wind' | 'Water' | 'Poison' | 'Holy' | 'Shadow' | 'Ghost' | 'Corrupt';

export interface MobDrop {
  item: string;
  name: string;
  rate: number;
  value: number; // Valor de venda em zeny
}

export interface MobData {
  id: number;
  name: string;
  level: number;
  hp: number;
  baseExp: number;
  jobExp: number;
  element: ElementName;
  elementLevel: number;
  race: string;
  size: string;
  def: number;
  mdef: number;
  drops: MobDrop[];
  averageZenyPerKill: number; // Média de zeny por kill considerando drop rates
}

// Dados de mobs populares para farm
export const FARM_MOBS: MobData[] = [
  {
    id: 1002,
    name: 'Poring',
    level: 1,
    hp: 50,
    baseExp: 18,
    jobExp: 9,
    element: 'Water',
    elementLevel: 1,
    race: 'Plant',
    size: 'Medium',
    def: 2,
    mdef: 5,
    drops: [
      { item: 'Jellopy', name: 'Jellopy', rate: 70, value: 6 },
      { item: 'Sticky_Mucus', name: 'Sticky Mucus', rate: 40, value: 70 },
      { item: 'Apple', name: 'Apple', rate: 10, value: 15 },
    ],
    averageZenyPerKill: 50
  },
  {
    id: 1007,
    name: 'Fabre',
    level: 6,
    hp: 72,
    baseExp: 38,
    jobExp: 20,
    element: 'Earth',
    elementLevel: 1,
    race: 'Insect',
    size: 'Small',
    def: 5,
    mdef: 0,
    drops: [
      { item: 'Feather', name: 'Feather', rate: 80, value: 10 },
      { item: 'Fluff', name: 'Fluff', rate: 50, value: 20 },
      { item: 'Clover', name: 'Clover', rate: 30, value: 10 },
    ],
    averageZenyPerKill: 35
  },
  {
    id: 1063,
    name: 'Lunatic',
    level: 8,
    hp: 90,
    baseExp: 50,
    jobExp: 27,
    element: 'Neutral',
    elementLevel: 3,
    race: 'Brute',
    size: 'Small',
    def: 7,
    mdef: 20,
    drops: [
      { item: 'Clover', name: 'Clover', rate: 55, value: 10 },
      { item: 'Feather', name: 'Feather', rate: 35, value: 10 },
      { item: 'Carrot', name: 'Carrot', rate: 20, value: 15 },
    ],
    averageZenyPerKill: 40
  },
  {
    id: 1001,
    name: 'Scorpion',
    level: 16,
    hp: 192,
    baseExp: 103,
    jobExp: 65,
    element: 'Fire',
    elementLevel: 1,
    race: 'Insect',
    size: 'Small',
    def: 16,
    mdef: 5,
    drops: [
      { item: "Scorpion's_Tail", name: "Scorpion's Tail", rate: 55, value: 100 },
      { item: 'Fine_Grit', name: 'Fine Grit', rate: 10, value: 500 },
      { item: 'Solid_Shell', name: 'Solid Shell', rate: 2.1, value: 1000 },
    ],
    averageZenyPerKill: 180
  },
  {
    id: 1113,
    name: 'Drops',
    level: 3,
    hp: 55,
    baseExp: 28,
    jobExp: 15,
    element: 'Fire',
    elementLevel: 1,
    race: 'Plant',
    size: 'Medium',
    def: 3,
    mdef: 3,
    drops: [
      { item: 'Jellopy', name: 'Jellopy', rate: 75, value: 6 },
      { item: 'Sticky_Mucus', name: 'Sticky Mucus', rate: 45, value: 70 },
      { item: 'Apple_Juice', name: 'Apple Juice', rate: 5, value: 20 },
    ],
    averageZenyPerKill: 45
  },
  {
    id: 1011,
    name: 'Chonchon',
    level: 5,
    hp: 63,
    baseExp: 33,
    jobExp: 18,
    element: 'Wind',
    elementLevel: 1,
    race: 'Insect',
    size: 'Small',
    def: 5,
    mdef: 0,
    drops: [
      { item: 'Shell', name: 'Shell', rate: 70, value: 14 },
      { item: 'Jellopy', name: 'Jellopy', rate: 50, value: 6 },
      { item: 'Fly_Wing', name: 'Fly Wing', rate: 1, value: 60 },
    ],
    averageZenyPerKill: 30
  },
  {
    id: 1031,
    name: 'Poporing',
    level: 14,
    hp: 200,
    baseExp: 88,
    jobExp: 56,
    element: 'Poison',
    elementLevel: 1,
    race: 'Plant',
    size: 'Medium',
    def: 14,
    mdef: 15,
    drops: [
      { item: 'Sticky_Mucus', name: 'Sticky Mucus', rate: 80, value: 70 },
      { item: 'Garlet', name: 'Garlet', rate: 9, value: 50 },
      { item: 'Green_Herb', name: 'Green Herb', rate: 7, value: 10 },
    ],
    averageZenyPerKill: 85
  },
  {
    id: 1040,
    name: 'Golem',
    level: 25,
    hp: 920,
    baseExp: 233,
    jobExp: 148,
    element: 'Neutral',
    elementLevel: 3,
    race: 'Formless',
    size: 'Large',
    def: 40,
    mdef: 5,
    drops: [
      { item: 'Scell', name: 'Scell', rate: 50, value: 160 },
      { item: 'Zargon', name: 'Zargon', rate: 30, value: 480 },
      { item: 'Coal', name: 'Coal', rate: 3, value: 500 },
    ],
    averageZenyPerKill: 300
  },
  {
    id: 1150,
    name: 'Orc Warrior',
    level: 24,
    hp: 690,
    baseExp: 218,
    jobExp: 139,
    element: 'Earth',
    elementLevel: 1,
    race: 'Demi-Human',
    size: 'Medium',
    def: 32,
    mdef: 5,
    drops: [
      { item: 'Orcish_Voucher', name: 'Orcish Voucher', rate: 55, value: 58 },
      { item: 'Banana_Juice', name: 'Banana Juice', rate: 5.5, value: 20 },
      { item: 'Scimitar', name: 'Scimitar', rate: 0.02, value: 10000 },
    ],
    averageZenyPerKill: 120
  },
  {
    id: 1103,
    name: 'Sword Fish',
    level: 18,
    hp: 280,
    baseExp: 125,
    jobExp: 79,
    element: 'Water',
    elementLevel: 2,
    race: 'Fish',
    size: 'Medium',
    def: 18,
    mdef: 15,
    drops: [
      { item: 'Gill', name: 'Gill', rate: 60, value: 36 },
      { item: 'Fin', name: 'Fin', rate: 35, value: 412 },
      { item: 'Sharp_Scale', name: 'Sharp Scale', rate: 5, value: 250 },
    ],
    averageZenyPerKill: 180
  },
  {
    id: 1188,
    name: 'Bongun',
    level: 32,
    hp: 1200,
    baseExp: 488,
    jobExp: 310,
    element: 'Shadow',
    elementLevel: 1,
    race: 'Undead',
    size: 'Medium',
    def: 42,
    mdef: 10,
    drops: [
      { item: 'Manacles', name: 'Manacles', rate: 48, value: 658 },
      { item: 'Sword_Mace', name: 'Sword Mace', rate: 0.5, value: 50000 },
    ],
    averageZenyPerKill: 550
  },
  {
    id: 1197,
    name: 'Zombie',
    level: 15,
    hp: 220,
    baseExp: 95,
    jobExp: 60,
    element: 'Shadow',
    elementLevel: 1,
    race: 'Undead',
    size: 'Medium',
    def: 18,
    mdef: 10,
    drops: [
      { item: 'Decayed_Nail', name: 'Decayed Nail', rate: 90, value: 82 },
      { item: 'Cardinal_Jewel', name: 'Cardinal Jewel', rate: 0.5, value: 2000 },
    ],
    averageZenyPerKill: 95
  },
  {
    id: 1242,
    name: 'Sting',
    level: 26,
    hp: 700,
    baseExp: 245,
    jobExp: 156,
    element: 'Earth',
    elementLevel: 1,
    race: 'Formless',
    size: 'Medium',
    def: 35,
    mdef: 15,
    drops: [
      { item: 'Bee_Sting', name: 'Bee Sting', rate: 45, value: 106 },
      { item: 'Grasshopper_Doll', name: 'Grasshopper Doll', rate: 5, value: 500 },
    ],
    averageZenyPerKill: 130
  },
  {
    id: 1015,
    name: 'Zombie Mushroom',
    level: 14,
    hp: 180,
    baseExp: 88,
    jobExp: 56,
    element: 'Shadow',
    elementLevel: 1,
    race: 'Plant',
    size: 'Medium',
    def: 14,
    mdef: 10,
    drops: [
      { item: 'Poison_Spore', name: 'Poison Spore', rate: 70, value: 114 },
      { item: 'Karvodailnirol', name: 'Karvodailnirol', rate: 1, value: 2000 },
    ],
    averageZenyPerKill: 110
  },
  {
    id: 1058,
    name: 'Metaller',
    level: 26,
    hp: 750,
    baseExp: 255,
    jobExp: 162,
    element: 'Fire',
    elementLevel: 1,
    race: 'Insect',
    size: 'Medium',
    def: 38,
    mdef: 5,
    drops: [
      { item: 'Iron', name: 'Iron', rate: 40, value: 100 },
      { item: 'Iron_Ore', name: 'Iron Ore', rate: 20, value: 50 },
      { item: 'Elunium_Stone', name: 'Rough Elunium', rate: 1.5, value: 500 },
    ],
    averageZenyPerKill: 160
  },
];
