import { useState } from 'react';
import { recordAuction } from '../api';

function AuctionPanel({ gameState, playerId }) {
  const [winnerId, setWinnerId] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
