import { useNavigate } from 'react-router-dom';

function GameEnd({ gameState, playerId }) {
  const navigate = useNavigate();

  // Sort players by money (descending)
  const rankedPlayers = [...gameState.players].sort((a, b) => {
    // We need to get money from somewhere - for the current player we have it
    // For others, we'd need to fetch it or have it in game state
    // For now, we'll show a simpler view
    return 0;
  });

  // Find the winner(s) - highest money
  // Since we don't have all players' money in the public state,
  // we'll need to show what we have

  const handleNewGame = () => {
    navigate('/');
  };

  return (
    <div className="game-end">
      <h1>Game Over!</h1>

      <div className="final-results">
        <h2>Final Standings</h2>

        <div className="your-result">
          <p>Your final balance:</p>
          <span className="final-money">{gameState.your_money}k</span>
        </div>

        <div className="all-players">
          <h3>All Players</h3>
          <p className="note">
            (Compare your totals via video call to determine the winner!)
          </p>
          <ul className="final-standings">
            {gameState.players.map((player) => (
              <li key={player.id} className={player.id === playerId ? 'is-me' : ''}>
                <span className="player-name">{player.name}</span>
                {player.id === playerId && (
                  <span className="player-money">{gameState.your_money}k</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="artist-final-values">
          <h3>Final Artist Values</h3>
          <ul className="artist-values-list">
            {gameState.artist_values
              .filter((av) => av.cumulative_value > 0)
              .sort((a, b) => b.cumulative_value - a.cumulative_value)
              .map((av) => (
                <li key={av.artist}>
                  <span className="artist-name">{av.artist}</span>
                  <span className="artist-total">{av.cumulative_value}k</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="game-end-actions">
        <button onClick={handleNewGame} className="btn-primary btn-large">
          New Game
        </button>
      </div>
    </div>
  );
}

export default GameEnd;
