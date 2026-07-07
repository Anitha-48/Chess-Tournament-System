import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureTournamentPlayer } from './tournamentPlayers.js';

test('does not create a duplicate tournament-player row when one already exists', async () => {
  let createCalls = 0;
  const prisma = {
    tournamentPlayer: {
      findUnique: async () => ({ id: 1, tournamentId: 7, playerId: 3 }),
      create: async () => {
        createCalls += 1;
        return { id: 2, tournamentId: 7, playerId: 3 };
      }
    }
  };

  const result = await ensureTournamentPlayer(prisma, { tournamentId: 7, playerId: 3 });

  assert.equal(result.created, false);
  assert.equal(createCalls, 0);
});
