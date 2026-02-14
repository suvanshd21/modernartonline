import { useState } from 'react';
import Hand from './Hand';
import ArtistBoard from './ArtistBoard';
import PlayerList from './PlayerList';
import AuctionPanel from './AuctionPanel';
import GameEnd from './GameEnd';
import { playCard, addDoubleCard, declineDouble } from '../api';

function GameBoard({ gameState, playerId, isConnected }) {
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const isMyTurn = gameState.current_turn_player_id === playerId;
  const isFinished = gameState.status === 'finished';
  const awaitingAuction = gameState.awaiting_auction_result;
  const doubleAuctionState = gameState.double_auction_state;

  // Find current player's data
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const currentTurnPlayer = gameState.players.find((p) => p.id === gameState.current_turn_player_id);

  const handlePlayCard = async (cardIndex) => {
    setActionInProgress(true);
    setError('');

    try {
      await playCard(gameState.code, playerId, cardIndex);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleAddDouble = async (cardIndex) => {
    setActionInProgress(true);
    setError('');

    try {
      await addDoubleCard(gameState.code, playerId, cardIndex);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeclineDouble = async () => {
    setActionInProgress(true);
    setError('');

    try {
      await declineDouble(gameState.code, playerId);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  // Check if it's my turn to offer a double card
  const isMyDoubleOffer = doubleAuctionState?.current_offerer_id === playerId;

  // Get valid cards for double auction (same artist, non-double)
  const getValidDoubleCards = () => {
    if (!doubleAuctionState) return [];
    const firstArtist = doubleAuctionState.first_card.artist;
    return gameState.your_hand
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => card.artist === firstArtist && card.auction_type !== 'double');
  };

  if (isFinished) {
    return <GameEnd gameState={gameState} playerId={playerId} />;
  }

  return (
    <div className="game-board">
      <header className="game-header">
        <div className="round-info">
          Round {gameState.current_round} / 4
        </div>
        <div className="game-code">
          Code: {gameState.code}
        </div>
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">Connected</span>
          ) : (
            <span className="status-disconnected">Reconnecting...</span>
          )}
        </div>
      </header>

      <div className="game-main">
        <aside className="sidebar">
          <PlayerList
            players={gameState.players}
            currentTurnPlayerId={gameState.current_turn_player_id}
            myPlayerId={playerId}
          />
        </aside>

        <main className="main-content">
          <ArtistBoard
            artistCounts={gameState.artist_counts}
            artistValues={gameState.artist_values}
            cardsInPlay={gameState.cards_in_play}
          />

          {error && <p className="error">{error}</p>}

          {/* Turn indicator */}
          <div className="turn-indicator">
            {awaitingAuction ? (
              <p className="status-text">Auction in progress - record the result below</p>
            ) : doubleAuctionState ? (
              <div className="double-auction-status">
                <p>
                  <strong>Double Auction:</strong> {doubleAuctionState.played_by_name} played a double {doubleAuctionState.first_card.artist} card
                </p>
                {isMyDoubleOffer ? (
                  <div className="double-offer-prompt">
                    <p>You can add a second {doubleAuctionState.first_card.artist} card or decline:</p>
                    {getValidDoubleCards().length > 0 ? (
                      <div className="double-cards">
                        {getValidDoubleCards().map(({ card, index }) => (
                          <button
                            key={index}
                            onClick={() => handleAddDouble(index)}
                            disabled={actionInProgress}
                            className="btn-card"
                          >
                            Add {card.auction_type}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="no-valid-cards">You have no valid cards to add</p>
                    )}
                    <button
                      onClick={handleDeclineDouble}
                      disabled={actionInProgress}
                      className="btn-secondary"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <p>Waiting for {gameState.players.find((p) => p.id === doubleAuctionState.current_offerer_id)?.name} to respond...</p>
                )}
              </div>
            ) : isMyTurn ? (
              <p className="your-turn">Your turn - select a card to play</p>
            ) : (
              <p className="waiting-turn">Waiting for {currentTurnPlayer?.name} to play...</p>
            )}
          </div>

          {/* Auction panel - shown when awaiting auction result */}
          {awaitingAuction && (
            <AuctionPanel
              gameState={gameState}
              playerId={playerId}
            />
          )}
        </main>
      </div>

      <footer className="game-footer">
        <div className="my-info">
          <span className="my-money">{gameState.your_money}k</span>
          <span className="my-name">{myPlayer?.name}</span>
        </div>
        <Hand
          cards={gameState.your_hand}
          onPlayCard={handlePlayCard}
          canPlay={isMyTurn && !awaitingAuction && !doubleAuctionState}
          disabled={actionInProgress}
        />
      </footer>
    </div>
  );
}

export default GameBoard;
