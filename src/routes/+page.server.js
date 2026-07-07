import prisma from '$lib/prisma';
import { buildRanking } from '$lib/ranking';
import { ensureTournamentPlayer } from '$lib/tournamentPlayers';

export async function load() {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } });
  const tournaments = await prisma.tournament.findMany({ orderBy: { startDate: 'asc' } });
  const tournamentPlayers = await prisma.tournamentPlayer.findMany({ include: { player: true } });
  const matches = await prisma.match.findMany();

  const enrichedTournaments = await Promise.all(tournaments.map(async (tournament) => {
    const entries = tournamentPlayers.filter((entry) => entry.tournamentId === tournament.id);
    const tournamentMatches = matches.filter((match) => match.tournamentId === tournament.id);
    const ranking = buildRanking(tournamentMatches, entries.map((entry) => entry.player));

    return {
      ...tournament,
      entries,
      matches: tournamentMatches,
      ranking
    };
  }));

  return { players, tournaments: enrichedTournaments };
}

export const actions = {
  createPlayer: async ({ request }) => {
    const data = await request.formData();
    await prisma.player.create({
      data: {
        name: String(data.get('name')),
        rating: Number(data.get('rating'))
      }
    });

    return { success: true };
  },

  updatePlayer: async ({ request }) => {
    const data = await request.formData();
    await prisma.player.update({
      where: { id: Number(data.get('id')) },
      data: {
        name: String(data.get('name')),
        rating: Number(data.get('rating'))
      }
    });

    return { success: true };
  },

  deletePlayer: async ({ request }) => {
    const data = await request.formData();
    await prisma.player.delete({ where: { id: Number(data.get('id')) } });
    return { success: true };
  },

  createTournament: async ({ request }) => {
    const data = await request.formData();
    await prisma.tournament.create({
      data: {
        name: String(data.get('name')),
        location: String(data.get('location')),
        startDate: new Date(String(data.get('startDate'))),
        endDate: new Date(String(data.get('endDate')))
      }
    });

    return { success: true };
  },

  updateTournament: async ({ request }) => {
    const data = await request.formData();
    await prisma.tournament.update({
      where: { id: Number(data.get('id')) },
      data: {
        name: String(data.get('name')),
        location: String(data.get('location')),
        startDate: new Date(String(data.get('startDate'))),
        endDate: new Date(String(data.get('endDate')))
      }
    });

    return { success: true };
  },

  deleteTournament: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));

    try {
      // remove dependent records first to avoid foreign key constraint errors
      await prisma.match.deleteMany({ where: { tournamentId: id } });
      await prisma.tournamentPlayer.deleteMany({ where: { tournamentId: id } });
      await prisma.tournament.delete({ where: { id } });

      return { success: true };
    } catch (err) {
      console.error('Failed to delete tournament', err);
      return { success: false, error: String(err) };
    }
  },

  addPlayerToTournament: async ({ request }) => {
    const data = await request.formData();
    const tournamentId = Number(data.get('tournamentId'));
    const playerId = Number(data.get('playerId'));

    await ensureTournamentPlayer(prisma, { tournamentId, playerId });

    return { success: true };
  },

  runRandomMatches: async ({ request }) => {
    const data = await request.formData();
    const tournamentId = Number(data.get('tournamentId'));
    const players = await prisma.tournamentPlayer.findMany({
      where: { tournamentId },
      include: { player: true }
    });

    const ids = players.map((entry) => entry.player.id);
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    const matches = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const player1 = shuffled[i];
      const player2 = shuffled[i + 1];
      if (!player2) break;
      const winnerId = Math.random() > 0.5 ? player1 : player2;
      matches.push({
        tournamentId,
        round: 1,
        player1Id: player1,
        player2Id: player2,
        winnerId
      });
    }

    await prisma.match.createMany({ data: matches });
    return { success: true };
  }
};
