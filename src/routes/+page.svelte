<script>
  export let data;
  export let form;

  const formatDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  };

  const toInputDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };
</script>

<svelte:head>
  <title>Chess Tournament System</title>
</svelte:head>

<main>
  <div class="hero">
    <div>
      <p class="eyebrow">Chess Tournament Hub</p>
      <h1>Manage players, tournaments, and results with elegance.</h1>
      <p class="subtitle">Create competitions, assign competitors, and generate instant random match outcomes in one clean dashboard.</p>
    </div>
  </div>

  {#if form?.success}
    <p class="success">Action completed successfully.</p>
  {/if}

  <section class="card">
    <div class="section-header">
      <h2>Players</h2>
      <p>Add or update competitors quickly.</p>
    </div>
    <form method="POST" action="?/createPlayer" class="inline-form">
      <input name="name" placeholder="Player name" required />
      <input name="rating" type="number" placeholder="Rating" required />
      <button type="submit">Add Player</button>
    </form>

    <div class="list-grid">
      {#each data.players as player}
        <article class="item-card">
          <div class="item-title-row">
            <strong>{player.name}</strong>
            <span class="badge">Rating {player.rating}</span>
          </div>
          <form method="POST" action="?/updatePlayer" class="compact-form">
            <input type="hidden" name="id" value={player.id} />
            <input name="name" value={player.name} />
            <input name="rating" type="number" value={player.rating} />
            <button type="submit">Save</button>
          </form>
          <form method="POST" action="?/deletePlayer" class="compact-form">
            <input type="hidden" name="id" value={player.id} />
            <button class="danger" type="submit">Delete</button>
          </form>
        </article>
      {/each}
    </div>
  </section>

  <section class="card">
    <div class="section-header">
      <h2>Tournaments</h2>
      <p>Launch matches and follow the leaderboard.</p>
    </div>
    <form method="POST" action="?/createTournament" class="inline-form">
      <input name="name" placeholder="Tournament name" required />
      <input name="location" placeholder="Location" required />
      <input name="startDate" type="date" required />
      <input name="endDate" type="date" required />
      <button type="submit">Create Tournament</button>
    </form>

    <div class="tournament-stack">
      {#each data.tournaments as tournament}
        <article class="item-card tournament-card">
          <div class="item-title-row">
            <div>
              <strong>{tournament.name}</strong>
              <p class="muted">{tournament.location} • {formatDate(tournament.startDate)} to {formatDate(tournament.endDate)}</p>
            </div>
            <span class="badge">{tournament.entries.length} players</span>
          </div>

          <div class="panel-grid">
            <div>
              <h3>Top 3 Rankings</h3>
              <div class="podium">
                {#each tournament.ranking.slice(0, 3) as row, index}
                  <div class={`podium-item rank-${index + 1}`}>
                    <div class={`medal medal-${index + 1}`} aria-hidden="true">
                      {#if index === 0}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4" fill="#FBBF24" />
                          <rect x="9" y="12" width="6" height="9" rx="1.5" fill="#F59E0B" />
                        </svg>
                      {:else if index === 1}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4" fill="#C7C7C7" />
                          <rect x="9" y="12" width="6" height="9" rx="1.5" fill="#9CA3AF" />
                        </svg>
                      {:else}
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4" fill="#CD7F32" />
                          <rect x="9" y="12" width="6" height="9" rx="1.5" fill="#B87333" />
                        </svg>
                      {/if}
                    </div>
                    <span class="rank-badge">{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}</span>
                    <strong>{row.name}</strong>
                    <span>{row.points} pts • {row.wins} wins</span>
                  </div>
                {/each}
              </div>
              <ol class="full-list">
                {#each tournament.ranking as row}
                  <li>{row.name} — {row.points} pts, {row.wins} wins</li>
                {/each}
              </ol>
            </div>

            <div>
              <h3>Recent Matches</h3>
              <ul>
                {#each tournament.matches as match}
                  <li>Round {match.round}: Player {match.player1Id} vs Player {match.player2Id} — Winner {match.winnerId ?? 'TBD'}</li>
                {/each}
              </ul>
            </div>
          </div>

          <form method="POST" action="?/updateTournament" class="compact-form">
            <input type="hidden" name="id" value={tournament.id} />
            <input name="name" value={tournament.name} />
            <input name="location" value={tournament.location} />
            <input name="startDate" type="date" value={toInputDate(tournament.startDate)} />
            <input name="endDate" type="date" value={toInputDate(tournament.endDate)} />
            <button type="submit">Save</button>
          </form>

          <form method="POST" action="?/deleteTournament" class="compact-form">
            <input type="hidden" name="id" value={tournament.id} />
            <button class="danger" type="submit">Delete</button>
          </form>

          <form method="POST" action="?/addPlayerToTournament" class="compact-form">
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <select name="playerId">
              {#each data.players as player}
                <option value={player.id}>{player.name}</option>
              {/each}
            </select>
            <button type="submit">Add Player</button>
          </form>

          <form method="POST" action="?/runRandomMatches" class="compact-form">
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <button type="submit">Run Random Matches</button>
          </form>
        </article>
      {/each}
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    background: linear-gradient(135deg, #0f172a, #1e293b);
    color: #e2e8f0;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 3rem;
  }

  .hero {
    padding: 2rem;
    border-radius: 24px;
    background: rgba(15, 23, 42, 0.8);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.8rem;
    color: #fbbf24;
    margin-bottom: 0.5rem;
  }

  h1 {
    margin: 0 0 0.7rem;
    font-size: 2rem;
  }

  .subtitle {
    margin: 0;
    color: #cbd5e1;
    max-width: 700px;
  }

  .card {
    background: rgba(255,255,255,0.95);
    color: #0f172a;
    border-radius: 20px;
    padding: 1.2rem;
    margin-bottom: 1.2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  }

  .section-header {
    margin-bottom: 0.8rem;
  }

  .section-header h2 {
    margin: 0;
  }

  .section-header p {
    margin: 0.2rem 0 0;
    color: #64748b;
  }

  .inline-form,
  .compact-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin: 0.6rem 0;
  }

  input, select {
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 0.7rem 0.8rem;
    min-width: 140px;
    background: #fff;
  }

  button {
    border: none;
    border-radius: 10px;
    padding: 0.72rem 1rem;
    background: #2563eb;
    color: white;
    cursor: pointer;
    font-weight: 600;
  }

  button:hover {
    background: #1d4ed8;
  }

  .danger {
    background: #dc2626;
  }

  .danger:hover {
    background: #b91c1c;
  }

  .list-grid,
  .tournament-stack {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }

  .item-card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1rem;
    background: #f8fafc;
  }

  .item-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 0.6rem;
  }

  .badge {
    background: #dbeafe;
    color: #1d4ed8;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .muted {
    color: #64748b;
    margin: 0.2rem 0 0;
  }

  .panel-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin: 0.6rem 0 1rem;
  }

  .podium {
    display: grid;
    gap: 0.6rem;
    margin-bottom: 0.8rem;
  }

  .podium-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.7rem 0.8rem;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .medal {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
  }

  .medal svg {
    display: block;
  }

  .rank-1 {
    border-color: #fbbf24;
    background: #fff7d6;
  }

  .rank-2 {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .rank-3 {
    border-color: #cd7f32;
    background: #fdf2e8;
  }

  .rank-badge {
    font-weight: 700;
    color: #0f172a;
  }

  .full-list {
    margin: 0.3rem 0 0 1.2rem;
  }

  .success {
    color: #16a34a;
    background: #ecfdf3;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
  }

  @media (max-width: 760px) {
    .panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
