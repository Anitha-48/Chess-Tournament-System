export async function ensureTournamentPlayer(prisma, { tournamentId, playerId }) {
  const existing = await prisma.tournamentPlayer.findUnique({
    where: {
      playerId_tournamentId: {
        playerId,
        tournamentId
      }
    }
  });

  if (existing) {
    return { created: false, existing };
  }

  const created = await prisma.tournamentPlayer.create({
    data: {
      tournamentId,
      playerId
    }
  });

  return { created: true, createdEntry: created };
}
