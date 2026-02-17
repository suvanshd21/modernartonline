import CardArtwork from './CardArtwork';

function Hand({ cards, onPlayCard, canPlay, disabled }) {
  if (!cards || cards.length === 0) {
    return (
      <div className="hand empty">
        <p>No cards in hand</p>
      </div>
    );
  }

  // Artist order for sorting (matches board order)
  const artistOrder = [
    'Viktor Novak',
    'Marina Costa',
    'Leon Bauer',
    'Flora Vance',
    'Celeste Ruiz',
  ];

  // Group cards by artist for better organization
  const sortedCards = [...cards].sort((a, b) => {
    const aOrder = artistOrder.indexOf(a.artist);
    const bOrder = artistOrder.indexOf(b.artist);
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.auction_type.localeCompare(b.auction_type);
  });

  // Map auction type to display label and icon
  const auctionTypeInfo = {
    open: { label: 'Open', icon: 'eye' },
    once_around: { label: 'Once Around', icon: 'star' },
    hidden: { label: 'Hidden', icon: 'lock' },
    fixed_price: { label: 'Fixed', icon: 'tag' },
    double: { label: 'Double', icon: '2x' },
  };

  // SVG icons for auction types
  const AuctionIcon = ({ type }) => {
    switch (type) {
      case 'eye':
        return (
          <svg viewBox="0 0 24 24" className="auction-icon" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 24 24" className="auction-icon" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'lock':
        return (
          <svg viewBox="0 0 24 24" className="auction-icon" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        );
      case 'tag':
        return (
          <svg viewBox="0 0 24 24" className="auction-icon" fill="currentColor">
            <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
          </svg>
        );
      case '2x':
        return (
          <span className="auction-icon-text">2x</span>
        );
      default:
        return null;
    }
  };

  // Map artist to color class
  const artistColors = {
    'Viktor Novak': 'artist-novak',
    'Marina Costa': 'artist-costa',
    'Leon Bauer': 'artist-bauer',
    'Flora Vance': 'artist-vance',
    'Celeste Ruiz': 'artist-ruiz',
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
              c.artwork_id === card.artwork_id &&
              cards.slice(0, i).filter(
                (prev) => prev.artist === card.artist &&
                          prev.auction_type === card.auction_type &&
                          prev.artwork_id === card.artwork_id
              ).length ===
                sortedCards.slice(0, displayIndex).filter(
                  (prev) => prev.artist === card.artist &&
                            prev.auction_type === card.auction_type &&
                            prev.artwork_id === card.artwork_id
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
              <div className="card-artwork">
                <CardArtwork artist={card.artist} artworkId={card.artwork_id} />
              </div>
              <div className="card-info">
                <span className="card-artist">{card.artist.split(' ')[1]}</span>
                <span className="card-type">
                  <AuctionIcon type={auctionTypeInfo[card.auction_type]?.icon} />
                  {auctionTypeInfo[card.auction_type]?.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="hand-count">{cards.length} cards</div>
    </div>
  );
}

export default Hand;
