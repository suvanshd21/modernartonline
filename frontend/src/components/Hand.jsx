function Hand({ cards, onPlayCard, canPlay, disabled }) {
  if (!cards || cards.length === 0) {
    return (
      <div className="hand empty">
        <p>No cards in hand</p>
      </div>
    );
  }

  // Group cards by artist for better organization
  const sortedCards = [...cards].sort((a, b) => {
    if (a.artist !== b.artist) {
      return a.artist.localeCompare(b.artist);
    }
    return a.auction_type.localeCompare(b.auction_type);
  });

  // Map auction type to display label
  const auctionTypeLabels = {
    open: 'Open',
    once_around: 'Once Around',
    hidden: 'Hidden',
    fixed_price: 'Fixed Price',
    double: 'Double',
  };

  // Map artist to color class
  const artistColors = {
    'Manuel Carvalho': 'artist-carvalho',
    'Ramon Martins': 'artist-martins',
    'Daniel Melim': 'artist-melim',
    'Rafael Silveira': 'artist-silveira',
    'Sigrid Thaler': 'artist-thaler',
  };

  return (
    <div className="hand">
      <div className="hand-cards">
        {sortedCards.map((card, displayIndex) => {
          // Find the original index in the unsorted cards array
          const originalIndex = cards.findIndex(
            (c, i) =>
              c.artist === card.artist &&
              c.auction_type === card.auction_type &&
              cards.slice(0, i).filter(
                (prev) => prev.artist === card.artist && prev.auction_type === card.auction_type
              ).length ===
                sortedCards.slice(0, displayIndex).filter(
                  (prev) => prev.artist === card.artist && prev.auction_type === card.auction_type
                ).length
          );

          return (
            <button
              key={displayIndex}
              className={`card ${artistColors[card.artist]} ${canPlay ? 'playable' : ''}`}
              onClick={() => canPlay && onPlayCard(originalIndex)}
              disabled={disabled || !canPlay}
              title={canPlay ? 'Click to play this card' : 'Not your turn'}
            >
              <span className="card-artist">{card.artist.split(' ')[1]}</span>
              <span className="card-type">{auctionTypeLabels[card.auction_type]}</span>
            </button>
          );
        })}
      </div>
      <div className="hand-count">{cards.length} cards</div>
    </div>
  );
}

export default Hand;
