function PlayerList({ players, currentTurnPlayerId, myPlayerId }) {
  return (
    <div className="player-list-panel">
      <h2>Players</h2>
      <ul className="players">
        {players.map((player) => {
          const isMe = player.id === myPlayerId;
          const isTurn = player.id === currentTurnPlayerId;

          return (
            <li
              key={player.id}
              className={`player ${isMe ? 'is-me' : ''} ${isTurn ? 'is-turn' : ''} ${!player.is_connected ? 'disconnected' : ''}`}
            >
              <div className="player-info">
                <span className="player-name">
                  {player.name}
                  {isMe && ' (You)'}
                </span>
                <span className={`connection-dot ${player.is_connected ? 'online' : 'offline'}`} />
              </div>
              <div className="player-stats">
                <span className="stat" title="Cards in hand">
                  {player.card_count} cards
                </span>
                <span className="stat" title="Paintings owned this round">
                  {player.painting_count} paintings
                </span>
              </div>
              {isTurn && <span className="turn-indicator-badge">Playing</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PlayerList;
