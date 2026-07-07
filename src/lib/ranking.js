export function buildRanking(matches = [], players = []) {
  const playerMap = new Map(players.map((player) => [player.id, { ...player, wins: 0, losses: 0, draws: 0, points: 0 }]));

  for (const match of matches) {
    const player1 = playerMap.get(match.player1Id);
    const player2 = playerMap.get(match.player2Id);

    if (!player1 || !player2) continue;

    if (match.winnerId == null) {
      player1.draws += 1;
      player2.draws += 1;
      player1.points += 1;
      player2.points += 1;
      continue;
    }

    if (match.winnerId === player1.id) {
      player1.wins += 1;
      player2.losses += 1;
      player1.points += 3;
    } else if (match.winnerId === player2.id) {
      player2.wins += 1;
      player1.losses += 1;
      player2.points += 3;
    }
  }

  const rankedPlayers = Array.from(playerMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });

  return rankedPlayers.map((player) => ({
    ...player,
    points: player.points || (player.rating ?? 0) / 100
  }));
}
