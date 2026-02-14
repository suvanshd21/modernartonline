import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createGame, joinGame } from '../api';

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('menu'); // menu, create, join
  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if redirected with a join code
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setGameCode(joinCode);
      setMode('join');
    }
  }, [searchParams]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createGame(name.trim());
      // Store player ID
      localStorage.setItem(`player_${result.game_code}`, result.player_id);
      navigate(`/game/${result.game_code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await joinGame(gameCode.trim().toUpperCase(), name.trim());
      // Store player ID
      localStorage.setItem(`player_${gameCode.trim().toUpperCase()}`, result.player_id);
      navigate(`/game/${gameCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'menu') {
    return (
      <div className="home">
        <h1>Modern Art Online</h1>
        <p className="subtitle">A virtual assistant for playing Modern Art</p>
        <div className="menu-buttons">
          <button onClick={() => setMode('create')} className="btn-primary">
            Create Game
          </button>
          <button onClick={() => setMode('join')} className="btn-secondary">
            Join Game
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="home">
        <h1>Create Game</h1>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              autoFocus
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button type="button" onClick={() => setMode('menu')} className="btn-secondary">
              Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Join mode
  return (
    <div className="home">
      <h1>Join Game</h1>
      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label htmlFor="code">Game Code</label>
          <input
            id="code"
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="Enter game code"
            maxLength={8}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-buttons">
          <button type="button" onClick={() => setMode('menu')} className="btn-secondary">
            Back
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Home;
