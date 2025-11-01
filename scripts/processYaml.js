import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Processing YAML files...\n');

// Process MobInfo
console.log('Loading DB_MobInfo.yml...');
const mobInfoPath = path.join(__dirname, '../../DB_MobInfo.yml');
const mobInfoRaw = fs.readFileSync(mobInfoPath, 'utf8');
const mobInfoData = yaml.load(mobInfoRaw);

// Transform MobInfo for easier access and reduced size
const mobs = {};
let skippedMobs = 0;

mobInfoData.MobInfo.forEach(mob => {
  // Filter drops - remove any with Unknown name/eName
  const validDrops = (mob.Drops || [])
    .map(drop => ({
      itemId: Number(drop.Item) || 0,
      name: drop.Name || 'Unknown',
      eName: drop.eName || 'Unknown',
      rate: Number(drop.Rate) || 0,
      slots: Number(drop.Slots) || 0,
      type: Number(drop.Type) || 0
    }))
    .filter(drop => drop.name !== 'Unknown' && drop.eName !== 'Unknown');

  // Only include mob if it has at least one valid drop
  if (validDrops.length > 0) {
    mobs[mob.Id] = {
      id: mob.Id,
      name: mob.Name,
      jName: mob.jName,
      sprite: mob.Sprite,
      level: mob.Level,
      hp: mob.Hp,
      baseExp: mob.BaseExp,
      jobExp: mob.JobExp,
      race: mob.Race,
      size: mob.Size,
      element: mob.Element,
      elementLevel: mob.ElementLevel,
      drops: validDrops
    };
  } else {
    skippedMobs++;
  }
});

console.log(`Processed ${Object.keys(mobs).length} mobs (skipped ${skippedMobs} with no valid drops)`);

// Process ItemInfo
console.log('Loading DB_ItemInfo.yml...');
const itemInfoPath = path.join(__dirname, '../../DB_ItemInfo.yml');
const itemInfoRaw = fs.readFileSync(itemInfoPath, 'utf8');
const itemInfoData = yaml.load(itemInfoRaw);

// Transform ItemInfo for easier access
const items = {};
itemInfoData.ItemInfo.forEach(item => {
  items[item.nameid] = {
    id: item.nameid,
    name: item.name,
    eName: item.ename,
    type: item.type,
    subtype: item.subtype,
    weight: item.weight,
    valueBuy: item.value_buy || 0,
    valueSell: item.value_sell || 0,
    slots: item.slots || 0
  };
});

console.log(`Processed ${Object.keys(items).length} items`);

// Save optimized data
const outputDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'mobs.json'),
  JSON.stringify(mobs, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'items.json'),
  JSON.stringify(items, null, 2)
);

// Create a searchable index for mobs
const mobsIndex = Object.values(mobs).map(mob => ({
  id: mob.id,
  name: mob.name,
  jName: mob.jName,
  level: mob.level,
  element: mob.element,
  race: mob.race
}));

fs.writeFileSync(
  path.join(outputDir, 'mobs-index.json'),
  JSON.stringify(mobsIndex, null, 2)
);

console.log('\n✓ Data processing complete!');
console.log(`  - src/data/mobs.json (${Object.keys(mobs).length} mobs)`);
console.log(`  - src/data/items.json (${Object.keys(items).length} items)`);
console.log(`  - src/data/mobs-index.json (searchable index)`);
