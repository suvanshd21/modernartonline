import { useState, useRef } from 'react';
import { recordAuction } from '../api';

// Gavel sound as base64 (short gavel hit)
const GAVEL_SOUND = 'data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YXAFAACAgICAgICAgICAgICAgICAgICAgHx4eHyAgICAgICEjJCMhHx0dHR4gISMkJCMhHhwbGxweISQmJiUjIR8dHR0eICEjJCUlJSQjIiEgICAgoSIjJCUlJSUkIyIhHx4eHyAhIiMkJSYmJiUkIyIgHx4dHR4fICEjJSYmJmYlJCMiIB8fHx8gIiMlJiYmJiYlJCMiIB8eHh4fICEjJSYmJiYmJSQjIiAfHh4eHx8gIiQlJiYmJiYlJCMiIB8eHh4fHyAiJCUmJiYmJiYlJCMhIB8eHh8fICAiJCUmJiYmJiYlJCMhIB8eHx8fICAiJCUmJiYmJiYlJCMhIB8fHx8gICAiJCUlJiYmJiYlJCMhIB8fHx8gICAiJCUlJiYmJiUlJCMhIB8fHyAgICAiJCUlJiYmJiUlJCMhIB8fICAgICAiJCUlJSYmJiUlJCMhIB8gICAgICAiJCUlJSYmJSUlJCMhICAgICAgICAiJCQlJSUlJSUkJCMhICAgICAgICAhIyQkJCQkJCQkIyIhICAgICAgICAhIyMjIyMjIyMjIiIhICAgICAgICAhIiIiIiIiIiIiIiEgICAgICAgICAhISEhISEhISEhISAgICAgICAgICAhISEgICAhISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAfX19fX+AgYKDg4OCgYCAfn19fX1/gIKEhoiIiIeFgoB+fHt7fH6BhIiLjo6OjYuHhIB9e3p6fH+DiI2RlJSUko+LhoJ+e3p7foKHjZKXmpqZl5OOiYR/fHt8f4OJkJabnp6dnJiTjoiDf3x7fYGGjZSan6GhoJ2ZlI6Jg398fH6CiI+Wm6CjpKOhnpmUjoiDf3x9f4OJkJedoqWlpKKfm5aNiYN/fH1/g4qRmJ6jpqampaKem5WPioR/fX6Ag4qSmZ+kp6inpqShnpqUjoqEf31+gISLkpqfpKeoqKempKGem5WPioWAf3+AhYuTmp+kp6ioqKaloqCdmZSPi4aBgICBhYyTmqCkp6ioqKelloGdmZWSjoqGgoGBhIiOlZugo6anp6empaOgnpuXk4+LiIWDgoSHi5CWm5+ipKWmpqaloqCenJmWko+MiYaEhIaJjZKXm5+ipKWlpaWkoqCenJqXlJGOi4mHhoaIi4+TmJyfoaOkpKSkpKOioJ6cmpiVko+NioiHh4iLjpKWmp6goqOjo6OjoqKgnp2bmJaSj42LiYiIiYuOkZWYnJ+hoqKioqKioaCfnpyamJWTkI6MioiIiYqNkJOXmp2foKGhoaGhoaCfnp2cmpmXlZKQjoyKiYmKi42QkpWYmp2en5+fnp6dnJuamZiXlZSTkY+OjYuKioqLjI6QkpSWmJmanJycnJuamZiXlpWUk5KQj46NjIuKioqLjI2PkZOVl5mam5ubmpqZmJeWlZSSkZCPjo2Mi4uKioqLjI2OkJGTlJaXmJiYmJeXlpWVlJOSkZCPjo2NjIuLi4uLjI2Oj5CRkpOUlZaWlpaVlZSUk5KRkJCPjo6NjIyLi4uLi4yMjY6PkJCRkpOTlJSUlJOTk5KSkZGQj4+OjY2MjIuLi4uLjIyNjY6Pj5CRkZKSkpKSkpKRkZCQj4+Ojo2NjIyMi4uLi4yMjI2Njo6Pj5CQkZGRkZGRkJCQj4+Ojo6NjY2MjIyLi4uMjIyMjY2Ojo6Pj4+Qj4+Qj4+Pj46Ojo6NjY2NjIyMjIyMi4yMjI2Njo6Ojo6Ojo6Ojo6Ojo6NjY2NjY2MjIyMjIyMjIyMjY2NjY6Ojo6Ojo6Ojo6Ojo2NjY2NjY2NjIyMjIyMjIyMjI2NjY2Njo6Ojo6Ojo6OjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2Ojo6Ojo6OjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2Njo6Ojo6OjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2Njo6Ojo6NjY2NjY2NjY2MjIyMjIyMjIyMjY2NjY2NjY2Ojo6Ojo6NjY2NjY2NjYyMjIyMjIyMjIyNjY2NjY2NjY2Ojo6Ojo2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY6Ojo6NjY2NjY2NjY2MjIyMjIyMjIyNjY2NjY2NjY2Njo6Ojo2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY6Ojo2NjY2NjY2NjYyMjIyMjIyMjI2NjY2NjY2NjY2Ojo6OjY2NjY2NjY2MjIyMjIyMjIyNjY2NjY2NjY2NjY2OjY2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjY2MjIyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2NjIyMjIyMjIyNjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2MjIyMjIyMjY2NjY2NjY2NjY2NjY2NjY2MjIyMjIyMjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyNjY2NjY2NjY2NjY2NjY2NjIyMjIyMjY2NjY2NjY2NjY2NjY2NjYyMjIyMjIyNjY2NjY2NjY2NjY2NjY2MjIyMjIyNjY2NjY2NjY2NjY2NjY2MjIyMjIyNjY2NjY2NjY2NjY2NjYyMjIyMjY2NjY2NjY2NjY2NjY2NjIyMjIyNjY2NjY2NjY2NjY2NjYyMjIyNjY2NjY2NjY2NjY2NjY2MjIyMjY2NjY2NjY2NjY2NjYyMjIyNjY2NjY2NjY2NjY2NjYyMjI2NjY2NjY2NjY2NjY2MjIyNjY2NjY2NjY2NjY2NjIyMjY2NjY2NjY2NjY2NjIyNjY2NjY2NjY2NjY2MjI2NjY2NjY2NjY2NjYyMjY2NjY2NjY2NjY2MjY2NjY2NjY2NjY2MjY2NjY2NjY2NjYyNjY2NjY2NjY2NjY2NjY2NjY2NjYyNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Ng==';

function AuctionPanel({ gameState, playerId }) {
  const [winnerId, setWinnerId] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const gavelAudioRef = useRef(null);

  // Get the most recent card(s) that need auction result
  const pendingCards = gameState.cards_in_play.filter((c) => c.owner_id === null);
  const isDoubleAuction = pendingCards.length === 2;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceNum = parseInt(price, 10) || 0;

    if (winnerId && priceNum < 0) {
      setError('Price cannot be negative');
      return;
    }

    // Check if winner can afford it
    if (winnerId) {
      const winner = gameState.players.find((p) => p.id === winnerId);
      // We don't have access to other players' money, so we'll let the server validate
    }

    setSubmitting(true);
    setError('');

    try {
      await recordAuction(
        gameState.code,
        winnerId || null,
        priceNum
      );
      // Play gavel sound on successful auction
      if (gavelAudioRef.current) {
        gavelAudioRef.current.currentTime = 0;
        gavelAudioRef.current.play().catch(() => {}); // Ignore autoplay errors
      }
      // Reset form
      setWinnerId('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Find who played the card (auctioneer)
  const auctioneer = gameState.players.find(
    (p) => p.id === pendingCards[0]?.played_by_id ||
      (gameState.double_auction_state?.second_card_player_id === p.id)
  );

  return (
    <div className="auction-panel">
      {/* Gavel sound effect */}
      <audio ref={gavelAudioRef} preload="auto" src={GAVEL_SOUND} />

      <h3>Record Auction Result</h3>

      {pendingCards.length > 0 && (
        <div className="auction-cards">
          <p>Cards being auctioned:</p>
          <div className="pending-cards">
            {pendingCards.map((card) => (
              <span key={card.id} className="pending-card">
                {card.artist.split(' ')[1]} ({card.auction_type.replace('_', ' ')})
              </span>
            ))}
          </div>
          {isDoubleAuction && <p className="double-note">This is a double auction - both cards go to the winner</p>}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="winner">Winner</label>
          <select
            id="winner"
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
          >
            <option value="">No one (auctioneer gets free)</option>
            {gameState.players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
                {player.id === playerId && ' (You)'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (k)</label>
          <input
            id="price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Recording...' : 'Record Result'}
        </button>
      </form>

      <div className="auction-help">
        <p><strong>Tip:</strong> Run the auction via video call, then enter the result here.</p>
        <ul>
          <li>If no one bids, select "No one" - auctioneer gets the card free</li>
          <li>If the auctioneer wins their own auction, they pay to the bank</li>
          <li>For fixed-price auctions, if no one buys, auctioneer must pay their stated price</li>
        </ul>
      </div>
    </div>
  );
}

export default AuctionPanel;
