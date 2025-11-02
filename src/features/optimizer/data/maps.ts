// Farming Maps Database

import type { MapData } from '../types/recommendation';

export const FARMING_MAPS: Record<string, MapData> = {
  // Prontera Area
  prt_fild08: {
    mapId: 'prt_fild08',
    name: 'Prontera Field 08',
    region: 'Prontera',
    recommendedLevel: 10,
    travelTimeMinutes: 2,
    mobs: [1002, 1113, 1031] // Poring, Drops, Poporing
  },

  // Geffen Area
  gef_fild10: {
    mapId: 'gef_fild10',
    name: 'Geffen Field 10',
    region: 'Geffen',
    recommendedLevel: 45,
    travelTimeMinutes: 3,
    mobs: [1023, 1152] // Orc Warrior, Orc Skeleton
  },

  // Comodo Area
  cmd_fild01: {
    mapId: 'cmd_fild01',
    name: 'Comodo Field 01',
    region: 'Comodo',
    recommendedLevel: 83,
    travelTimeMinutes: 5,
    mobs: [1206, 1249] // Anolian, Stem Worm
  },

  cmd_fild02: {
    mapId: 'cmd_fild02',
    name: 'Comodo Field 02',
    region: 'Comodo',
    recommendedLevel: 81,
    travelTimeMinutes: 5,
    mobs: [1386] // Sleeper
  },

  // Einbroch Area
  ein_fild08: {
    mapId: 'ein_fild08',
    name: 'Einbroch Field 08',
    region: 'Einbroch',
    recommendedLevel: 81,
    travelTimeMinutes: 5,
    mobs: [1613, 1390] // Metaling, Geographer
  },

  ein_fild06: {
    mapId: 'ein_fild06',
    name: 'Einbroch Field 06',
    region: 'Einbroch',
    recommendedLevel: 85,
    travelTimeMinutes: 6,
    mobs: [1391, 1392] // Roween, Galion
  },

  // Clock Tower
  c_tower2: {
    mapId: 'c_tower2',
    name: 'Clock Tower 2F',
    region: 'Aldebaran',
    recommendedLevel: 60,
    travelTimeMinutes: 4,
    mobs: [1269, 1148] // Clock, Medusa
  },

  c_tower3: {
    mapId: 'c_tower3',
    name: 'Clock Tower 3F',
    region: 'Aldebaran',
    recommendedLevel: 75,
    travelTimeMinutes: 5,
    mobs: [1270, 1269] // Clock, Clock
  },

  alde_dun03: {
    mapId: 'alde_dun03',
    name: 'Clock Tower B3F',
    region: 'Aldebaran',
    recommendedLevel: 90,
    travelTimeMinutes: 6,
    mobs: [1268, 1271] // High Orc, Alarm
  },

  // Sphinx
  in_sphinx5: {
    mapId: 'in_sphinx5',
    name: 'Sphinx 5F',
    region: 'Morocc',
    recommendedLevel: 85,
    travelTimeMinutes: 7,
    mobs: [1098, 1097, 1296] // Anubis, Requiem, Mimic
  },

  // Glast Heim
  gl_chyard: {
    mapId: 'gl_chyard',
    name: 'Glast Heim Chivalry',
    region: 'Glast Heim',
    recommendedLevel: 75,
    travelTimeMinutes: 8,
    mobs: [1152, 1291] // Orc Skeleton, Zombie Prisoner
  },

  gl_prison: {
    mapId: 'gl_prison',
    name: 'Glast Heim Prison',
    region: 'Glast Heim',
    recommendedLevel: 80,
    travelTimeMinutes: 9,
    mobs: [1293, 1291, 1256] // Zombie Prisoner, Injustice, Cramp
  },

  // Magma Dungeon
  mag_dun01: {
    mapId: 'mag_dun01',
    name: 'Magma Dungeon 1F',
    region: 'Nogg Road',
    recommendedLevel: 75,
    travelTimeMinutes: 10,
    mobs: [1383, 1382] // Lava Golem, Explosion
  },

  // Amatsu Dungeon
  ama_dun02: {
    mapId: 'ama_dun02',
    name: 'Amatsu Dungeon 2F',
    region: 'Amatsu',
    recommendedLevel: 80,
    travelTimeMinutes: 12,
    mobs: [1423, 1424] // Miyabi Doll, Tengu
  },

  // Turtle Island
  tur_dun03: {
    mapId: 'tur_dun03',
    name: 'Turtle Island 3F',
    region: 'Turtle Island',
    recommendedLevel: 75,
    travelTimeMinutes: 15,
    mobs: [1246, 1245] // Permeter, Mi Gao
  },

  // Abyss Lake
  abyss_02: {
    mapId: 'abyss_02',
    name: 'Abyss Lake 2F',
    region: 'Thanatos Tower',
    recommendedLevel: 90,
    travelTimeMinutes: 20,
    mobs: [1997, 1977] // Ferus (Green), Kavach Icarus
  }
};

// Helper function to get map by ID
export function getMapData(mapId: string): MapData | undefined {
  return FARMING_MAPS[mapId];
}

// Helper function to get maps by region
export function getMapsByRegion(region: string): MapData[] {
  return Object.values(FARMING_MAPS).filter(map => map.region === region);
}

// Get all unique regions
export function getAllRegions(): string[] {
  return Array.from(new Set(Object.values(FARMING_MAPS).map(map => map.region)));
}
