import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import { useGameWebSocket } from './websocket';
import { getGameState } from './api';

function GameWrapper() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  // Get player ID from localStorage
  const playerId = localStorage.getItem(`player_${code}`);

  // Handle WebSocket messages
  const handleMessage = useCallback((message) => {
    console.log('WS message:', message.type, message.data);

    switch (message.type) {
      case 'game_state':
        setGameState(message.data);
        break;
      case 'player_joined':
        setGameState((prev) => prev ? {
          ...prev,
          players: [...prev.players, {
            id: message.data.player_id,
            name: message.data.player_name,
            card_count: 0,
            painting_count: 0,
            turn_order: prev.players.length,
            is_connected: true
          }]
        } : prev);
        break;
      case 'players_reordered':
        setGameState((prev) => prev ? {
          ...prev,
          players: prev.players.map((p) => {
            const updated = message.data.players.find((u) => u.id === p.id);
            return updated ? { ...p, turn_order: updated.turn_order } : p;
          })
        } : prev);
        break;
      case 'player_disconnected':
        setGameState((prev) => prev ? {
          ...prev,
          players: prev.players.map((p) =>
            p.id === message.data.player_id ? { ...p, is_connected: false } : p
          )
        } : prev);
        break;
      case 'player_reconnected':
        setGameState((prev) => prev ? {
          ...prev,
          players: prev.players.map((p) =>
            p.id === message.data.player_id ? { ...p, is_connected: true } : p
          )
        } : prev);
        break;
      case 'card_played':
      case 'waiting_for_double':
      case 'double_auction_ready':
      case 'double_auction_next_offerer':
      case 'double_auction_declined':
      case 'auction_recorded':
      case 'round_ended':
        // For these events, we'll receive a full game_state update after
        // But we can use the event data for notifications/UI feedback
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // Connect WebSocket
  const { isConnected } = useGameWebSocket(code, playerId, handleMessage);

  // If no player ID, redirect to home
  useEffect(() => {
    if (!playerId) {
      navigate(`/?join=${code}`);
    }
  }, [playerId, code, navigate]);

  // Fetch initial state if WebSocket hasn't provided it
  useEffect(() => {
    if (playerId && !gameState) {
      getGameState(code, playerId)
        .then(setGameState)
        .catch((err) => {
          setError(err.message);
          // Clear invalid session
          localStorage.removeItem(`player_${code}`);
          navigate('/');
        });
    }
  }, [code, playerId, gameState, navigate]);

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!gameState) {
    return <div className="loading">Loading game...</div>;
  }

  // Show lobby if game hasn't started
  if (gameState.status === 'lobby') {
    return (
      <Lobby
        gameState={gameState}
        playerId={playerId}
        isConnected={isConnected}
        onGameStarted={() => {}}
      />
    );
  }

  // Show game board
  return (
    <GameBoard
      gameState={gameState}
      playerId={playerId}
      isConnected={isConnected}
    />
  );
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:code" element={<GameWrapper />} />
      </Routes>
    </div>
  );
}

export default App;
