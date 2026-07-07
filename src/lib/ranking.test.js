import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRanking } from './ranking.js';

test('ranks players by rating when no matches exist yet', () => {
  const players = [
    { id: 1, name: 'Alice', rating: 1200 },
    { id: 2, name: 'Bob', rating: 1500 },
    { id: 3, name: 'Cara', rating: 1300 }
  ];

  const ranking = buildRanking([], players);

  assert.deepEqual(
    ranking.map((row) => row.name),
    ['Bob', 'Cara', 'Alice']
  );
});
