import type { GymDef } from '../types';

export const GYMS: Record<number, GymDef> = {
  1: {
    level: 1,
    name: 'Ping Plaza',
    leader: 'Notification Nell',
    quote: 'Ding! Ding! Did you see my last message?',
    aiBestMoveChance: 0.5,
    team: [{ creatureId: 'MIRROR_STARTER_COMMON', moveIds: ['MIRROR_TIER0'] }],
  },
  2: {
    level: 2,
    name: 'Autoplay Alley',
    leader: 'Autoplay Al',
    quote: 'Next episode starts in 5... 4... 3...',
    aiBestMoveChance: 0.6,
    team: [
      { creatureId: 'tidepup', moveIds: ['water_splash_jab'] },
      { creatureId: 'cindercub', moveIds: ['fire_ember_flick'] },
    ],
  },
  3: {
    level: 3,
    name: 'The Endless Feed',
    leader: 'Doomscroll Dana',
    quote: 'Just one more scroll. Then you can study.',
    aiBestMoveChance: 0.7,
    team: [
      { creatureId: 'mossling', moveIds: ['grass_leaf_nick', 'grass_vine_snap', 'grass_photosynthesize'] },
      { creatureId: 'cindercub', moveIds: ['fire_ember_flick', 'fire_flame_lash'] },
    ],
  },
  4: {
    level: 4,
    name: 'FOMO Fortress',
    leader: 'FOMO Fiona',
    quote: 'Everyone is at the party except you!',
    aiBestMoveChance: 0.8,
    team: [
      { creatureId: 'tidepup', moveIds: ['water_tide_whip', 'water_soothing_mist'] },
      { creatureId: 'mossling', moveIds: ['grass_vine_snap', 'grass_thorn_volley'] },
      { creatureId: 'cindercub', moveIds: ['fire_flame_lash', 'fire_kindle'] },
    ],
  },
  5: {
    level: 5,
    name: 'The Feed Core',
    leader: 'The Algorithm',
    quote: 'I know what you want to watch before you do.',
    aiBestMoveChance: 0.9,
    team: [
      { creatureId: 'pyrowl', moveIds: ['fire_blaze_burst', 'fire_phoenix_rest', 'fire_inferno'] },
      { creatureId: 'marinox', moveIds: ['water_riptide', 'water_spring_renewal', 'water_tsunami'] },
      { creatureId: 'thornback', moveIds: ['grass_thorn_volley', 'grass_bloom_mend', 'grass_verdant_quake'] },
    ],
  },
};

export const GYM_LIST = Object.values(GYMS);
