import * as migration_20260920_011009 from './20260920_011009';

export const migrations = [
  {
    up: migration_20260920_011009.up,
    down: migration_20260920_011009.down,
    name: '20260920_011009'
  },
];
