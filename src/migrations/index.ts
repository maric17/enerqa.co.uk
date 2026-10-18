import * as migration_20260920_011009 from './20260920_011009';
import * as migration_20260926_020023 from './20260926_020023';
import * as migration_20260926_041431 from './20260926_041431';

export const migrations = [
  {
    up: migration_20260920_011009.up,
    down: migration_20260920_011009.down,
    name: '20260920_011009',
  },
  {
    up: migration_20260926_020023.up,
    down: migration_20260926_020023.down,
    name: '20260926_020023',
  },
  {
    up: migration_20260926_041431.up,
    down: migration_20260926_041431.down,
    name: '20260926_041431'
  },
];
