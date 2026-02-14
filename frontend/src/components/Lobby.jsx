import { useState } from 'react';
import { startGame } from '../api';

function Lobby({ gameState, playerId, isConnected }) {
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const isHost = gameState.host_player_id === playerId;
  const canStart = gameState.players.length >= 3 && gameState.players.length <= 5;

  const handleStart = async () => {
    setStarting(true);
    setError('');

    try {
      await startGame(gameState.code, playerId);
      // WebSocket will receive game_state update
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(gameState.code);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/game/${gameState.code}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="lobby">
      <h1>Game Lobby</h1>

      <div className="game-code-section">
        <p>Share this code with your friends:</p>
        <div className="code-display">
          <span className="code">{gameState.code}</span>
          <button onClick={copyCode} className="btn-small">Copy Code</button>
          <button onClick={copyLink} className="btn-small">Copy Link</button>
        </div>
      </div>

      <div className="connection-status">
        {isConnected ? (
          <span className="status-connected">Connected</span>
        ) : (
          <span className="status-disconnected">Reconnecting...</span>
        )}
      </div>

      <div className="players-section">
        <h2>Players ({gameState.players.length}/5)</h2>
        <ul className="player-list">
          {gameState.players.map((player) => (
            <li key={player.id} className={`player-item ${!player.is_connected ? 'disconnected' : ''}`}>
              <span className="player-name">
                {player.name}
                {player.id === gameState.host_player_id && ' (Host)'}
                {player.id === playerId && ' (You)'}
              </span>
              <span className={`connection-dot ${player.is_connected ? 'online' : 'offline'}`} />
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="error">{error}</p>}

      {isHost ? (
        <div className="host-controls">
          {!canStart && (
            <p className="info">Need 3-5 players to start (currently {gameState.players.length})</p>
          )}
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="btn-primary btn-large"
          >
            {starting ? 'Starting...' : 'Start Game'}
          </button>
        </div>
      ) : (
        <p className="waiting">Waiting for host to start the game...</p>
      )}
    </div>
  );
}

export default Lobby;
