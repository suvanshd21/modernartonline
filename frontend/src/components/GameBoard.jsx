import { useState, useEffect, useRef } from 'react';
import Hand from './Hand';
import ArtistBoard from './ArtistBoard';
import PlayerList from './PlayerList';
import AuctionPanel from './AuctionPanel';
import GameEnd from './GameEnd';
import { playCard, addDoubleCard, declineDouble } from '../api';

// Auction type display names and descriptions
const AUCTION_INFO = {
  open: {
    name: 'Open Auction',
    description: 'Free bidding - anyone can bid anytime, highest wins'
  },
  once_around: {
    name: 'Once Around',
    description: 'One bid each, clockwise from auctioneer\'s left'
  },
  hidden: {
    name: 'Hidden Bid',
    description: 'Everyone secretly picks amount, reveal simultaneously'
  },
  fixed_price: {
    name: 'Fixed Price',
    description: 'Auctioneer sets price, others accept or pass'
  },
  double: {
    name: 'Double Auction',
    description: 'Can pair with another card of same artist'
  }
};

// Gavel sound as base64
const GAVEL_SOUND = 'data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YXAFAACAgICAgICAgICAgICAgICAgICAgHx4eHyAgICAgICEjJCMhHx0dHR4gISMkJCMhHhwbGxweISQmJiUjIR8dHR0eICEjJCUlJSQjIiEgICAgoSIjJCUlJSUkIyIhHx4eHyAhIiMkJSYmJiUkIyIgHx4dHR4fICEjJSYmJmYlJCMiIB8fHx8gIiMlJiYmJiYlJCMiIB8eHh4fICEjJSYmJiYmJSQjIiAfHh4eHx8gIiQlJiYmJiYlJCMiIB8eHh4fHyAiJCUmJiYmJiYlJCMhIB8eHh8fICAiJCUmJiYmJiYlJCMhIB8eHx8fICAiJCUmJiYmJiYlJCMhIB8fHx8gICAiJCUlJiYmJiYlJCMhIB8fHx8gICAiJCUlJiYmJiUlJCMhIB8fHyAgICAiJCUlJiYmJiUlJCMhIB8gICAgICAiJCUlJSYmJiUlJCMhIB8gICAgICAiJCUlJSYmJSUlJCMhICAgICAgICAiJCQlJSUlJSUkJCMhICAgICAgICAhIyQkJCQkJCQkIyIhICAgICAgICAhIyMjIyMjIyMjIiIhICAgICAgICAhIiIiIiIiIiIiIiEgICAgICAgICAhISEhISEhISEhISAgICAgICAgICAhISEgICAhISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAfX19fX+AgYKDg4OCgYCAfn19fX1/gIKEhoiIiIeFgoB+fHt7fH6BhIiLjo6OjYuHhIB9e3p6fH+DiI2RlJSUko+LhoJ+e3p7foKHjZKXmpqZl5OOiYR/fHt8f4OJkJabnp6dnJiTjoiDf3x7fYGGjZSan6GhoJ2ZlI6Jg398fH6CiI+Wm6CjpKOhnpmUjoiDf3x9f4OJkJedoqWlpKKfm5aNiYN/fH1/g4qRmJ6jpqampaKem5WPioR/fX6Ag4qSmZ+kp6inpqShnpqUjoqEf31+gISLkpqfpKeoqKempKGem5WPioWAf3+AhYuTmp+kp6ioqKelloGdmZSPi4aBgICBhYyTmqCkp6ioqKelloGdmZWSjoqGgoGBhIiOlZugo6anp6empaOgnpuXk4+LiIWDgoSHi5CWm5+ipKWmpqaloqCenJmWko+MiYaEhIaJjZKXm5+ipKWlpaWkoqCenJqXlJGOi4mHhoaIi4+TmJyfoaOkpKSkpKOioJ6cmpiVko+NioiHh4iLjpKWmp6goqOjo6OjoqKgnp2bmJaSj42LiYiIiYuOkZWYnJ+hoqKioqKioaCfnpyamJWTkI6MioiIiYqNkJOXmp2foKGhoaGhoaCfnp2cmpmXlZKQjoyKiYmKi42QkpWYmp2en5+fnp6dnJuamZiXlZSTkY+OjYuKioqLjI6QkpSWmJmanJycnJuamZiXlpWUk5KQj46NjIuKioqLjI2PkZOVl5mam5ubmpqZmJeWlZSSkZCPjo2Mi4uKioqLjI2Oj5CRkpOUlZaWlpaVlZSUk5KRkJCPjo6NjIyLi4uLi4yMjY6PkJCRkpOTlJSUlJOTk5KSkZGQj4+OjY2MjIuLi4uLjIyNjY6Pj5CRkZKSkpKSkpKRkZCQj4+Ojo2NjIyMi4uLi4yMjI2Njo6Pj5CQkZGRkZGRkJCQj4+Ojo6NjY2MjIyLi4uMjIyMjY2Ojo6Pj4+Qj4+Qj4+Pj46Ojo6NjY2NjIyMjIyMi4yMjI2Njo6Ojo6Ojo6Ojo6Ojo6NjY2NjY2MjIyMjIyMjIyMjY2NjY6Ojo6Ojo6Ojo6Ojo2NjY2NjY2NjIyMjIyMjIyMjI2NjY2Njo6Ojo6Ojo6OjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2Ojo6Ojo6OjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2Njo6Ojo6OjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2Njo6Ojo6NjY2NjY2NjY2MjIyMjIyMjIyMjY2NjY2NjY2Ojo6Ojo6NjY2NjY2NjYyMjIyMjIyMjIyNjY2NjY2NjY2Ojo6Ojo2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY6Ojo6NjY2NjY2NjY2MjIyMjIyMjIyNjY2NjY2NjY2Njo6Ojo2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY6Ojo2NjY2NjY2NjYyMjIyMjIyMjI2NjY2NjY2NjY2Ojo6OjY2NjY2NjY2MjIyMjIyMjIyNjY2NjY2NjY2NjY2OjY2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjY2MjIyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyNjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2MjIyMjIyMjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyNjY2NjY2NjY2NjY2NjY2NjIyMjIyMjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyNjY2NjY2NjY2NjY2NjY2MjIyMjIyNjY2NjY2NjY2NjY2NjY2MjIyMjIyNjY2NjY2NjY2NjY2NjYyMjIyMjY2NjY2NjY2NjY2NjY2NjIyMjIyNjY2NjY2NjY2NjY2NjYyMjIyNjY2NjY2NjY2NjY2NjY2MjIyMjY2NjY2NjY2NjY2NjYyMjIyNjY2NjY2NjY2NjY2NjYyMjI2NjY2NjY2NjY2NjY2MjIyNjY2NjY2NjY2NjY2NjIyMjY2NjY2NjY2NjY2NjIyNjY2NjY2NjY2NjY2MjI2NjY2NjY2NjY2NjYyMjY2NjY2NjY2NjY2MjY2NjY2NjY2NjY2MjY2NjY2NjY2NjYyNjY2NjY2NjY2NjY2NjY2NjY2NjYyNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Ng==';

function GameBoard({ gameState, playerId, isConnected }) {
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [confirmCard, setConfirmCard] = useState(null); // Card index to confirm
  const [prevMoney, setPrevMoney] = useState(gameState.your_money);
  const [moneyChange, setMoneyChange] = useState(null);
  const prevTurnRef = useRef(gameState.current_turn_player_id);
  const prevAuctionRef = useRef(gameState.awaiting_auction_result);
  const audioRef = useRef(null);
  const gavelRef = useRef(null);

  const isMyTurn = gameState.current_turn_player_id === playerId;
  const isFinished = gameState.status === 'finished';
  const awaitingAuction = gameState.awaiting_auction_result;
  const doubleAuctionState = gameState.double_auction_state;

  // Find current player's data
  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const currentTurnPlayer = gameState.players.find((p) => p.id === gameState.current_turn_player_id);

  // Get the current card being auctioned
  const pendingCards = gameState.cards_in_play.filter((c) => c.owner_id === null);
  const currentAuctionCard = pendingCards.length > 0 ? pendingCards[0] : null;

  // Play sound when it becomes your turn
  useEffect(() => {
    if (gameState.current_turn_player_id === playerId &&
        prevTurnRef.current !== playerId &&
        !awaitingAuction) {
      // Play ding sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {}); // Ignore autoplay errors
      }
    }
    prevTurnRef.current = gameState.current_turn_player_id;
  }, [gameState.current_turn_player_id, playerId, awaitingAuction]);

  // Play gavel sound when auction completes (for all players)
  useEffect(() => {
    if (prevAuctionRef.current === true && gameState.awaiting_auction_result === false) {
      // Auction just completed - play gavel sound
      if (gavelRef.current) {
        gavelRef.current.currentTime = 0;
        gavelRef.current.play().catch(() => {}); // Ignore autoplay errors
      }
    }
    prevAuctionRef.current = gameState.awaiting_auction_result;
  }, [gameState.awaiting_auction_result]);

  // Track money changes
  useEffect(() => {
    const currentMoney = gameState.your_money;
    if (currentMoney !== prevMoney) {
      const change = currentMoney - prevMoney;
      setMoneyChange(change);
      setPrevMoney(currentMoney);

      // Clear the change indicator after 3 seconds
      const timer = setTimeout(() => setMoneyChange(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.your_money, prevMoney]);

  const handlePlayCard = async (cardIndex) => {
    // Show confirmation dialog
    setConfirmCard(cardIndex);
  };

  const confirmPlayCard = async () => {
    if (confirmCard === null) return;

    setActionInProgress(true);
    setError('');

    try {
      await playCard(gameState.code, playerId, confirmCard);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionInProgress(false);
      setConfirmCard(null);
    }
  };

  const cancelPlayCard = () => {
    setConfirmCard(null);
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

  // Get card to confirm
  const cardToConfirm = confirmCard !== null ? gameState.your_hand[confirmCard] : null;

  if (isFinished) {
    return <GameEnd gameState={gameState} playerId={playerId} />;
  }

  return (
    <div className="game-board">
      {/* Audio element for turn notification */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkpONgXBkYW96ipOVkYZ5bmVhbH2Lk5aShHdtZWNwgI2UlpGEd25lZHCAjZSWkYR3bmVkcICNlJaRhHduZWRwgI2UlZCDdm1kY3CAjZOUkIN2bGNjcICNk5SQg3ZsY2NwgI2TlJCDdmxjY3CAjZOUkIN2bGNjcH+Nk5SQg3ZsY2NwgI2TlJCDdmxjY3CAjZOUkIN2bWRkcICNlJWRhHduZWVxgY6VlpKFd25mZnKCj5aXkoV4b2dncYGPl5eShXlwaGhyg5CYmJOGem9paXKDkJmZlIh7cGpqc4SRmZmUiXxxamtzhJGZmZSJfHFqa3OEkZmZlIl8cWprc4SRmZmUiXxxamtzhJGZmZSJfHBqanOEkZiYk4h6b2lpc4ORmJiTiHpvaWlygo+Xl5KFeG9nZ3GBj5aXkoV4b2dncYGOlZaRhHduZWRwgI2UlZGEd21kZHB/jJOUkIN2bGNjb36Mko+OgHNqZmZvfIuPj4B0a2VlbnuKjo5/c2plZG17iY2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2lkZG17iY2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2lkZG58io2Nf3NqZWVvfIuPj4B0a2ZmbnyLj4+AdGtmZm58i4+PgHRrZmZufIuPj4B0a2ZmbnyLj4+AdGtmZm58i4+PgHRrZmZufIuPj4B0a2ZmbnyLj4+AdGtmZm58i4+PgHRrZmZufIuPj4B0a2ZmbnyLj4+AdGtmZm58i4+PgHRrZmZufIuPj4B0a2ZmbnyLj4+AdGtmZm58io2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2lkZG17iY2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2lkZG17iY2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2lkZG17iY2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2lkZG17iY2Nf3NpZGRte4mNjX9zaWRkbXuJjY1/c2pkZW58io2OfnRqZWVufIqOjn90amVlbnyKjo5/dGplZW58io6Of3RqZWVufIqOjn90amVlbnyKjo5/dGplZW58io6Of3RqZWVufIqOjn90amVlbnyKjo5/dGplZW58io6Of3RqZWVufIqOjn90amVlbnyKjo5/dGplZW58io6Of3RqZWVufIqOjn90amVl" type="audio/wav" />
      </audio>
      {/* Gavel sound for auction completion */}
      <audio ref={gavelRef} preload="auto" src={GAVEL_SOUND} />

      {/* Confirmation modal */}
      {confirmCard !== null && cardToConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Play this card?</h3>
            <div className="confirm-card-preview">
              <span className="confirm-artist">{cardToConfirm.artist}</span>
              <span className="confirm-type">{AUCTION_INFO[cardToConfirm.auction_type]?.name}</span>
            </div>
            <p className="confirm-description">
              {AUCTION_INFO[cardToConfirm.auction_type]?.description}
            </p>
            <div className="confirm-buttons">
              <button onClick={cancelPlayCard} className="btn-secondary">Cancel</button>
              <button onClick={confirmPlayCard} disabled={actionInProgress} className="btn-primary">
                {actionInProgress ? 'Playing...' : 'Play Card'}
              </button>
            </div>
          </div>
        </div>
      )}

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

          {/* Prominent auction type banner */}
          {awaitingAuction && currentAuctionCard && (
            <div className={`auction-banner auction-${currentAuctionCard.auction_type}`}>
              <div className="auction-banner-content">
                <span className="auction-artist">{currentAuctionCard.artist}</span>
                <span className="auction-type-name">
                  {AUCTION_INFO[currentAuctionCard.auction_type]?.name}
                </span>
                <span className="auction-type-desc">
                  {AUCTION_INFO[currentAuctionCard.auction_type]?.description}
                </span>
                {pendingCards.length > 1 && (
                  <span className="auction-double-note">Double auction - 2 cards!</span>
                )}
              </div>
            </div>
          )}

          {/* Turn indicator */}
          <div className={`turn-indicator ${isMyTurn && !awaitingAuction && !doubleAuctionState ? 'my-turn-highlight' : ''}`}>
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
          <span className="my-money">
            {gameState.your_money}k
            {moneyChange !== null && (
              <span className={`money-change ${moneyChange >= 0 ? 'positive' : 'negative'}`}>
                {moneyChange >= 0 ? '+' : ''}{moneyChange}k
              </span>
            )}
          </span>
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
