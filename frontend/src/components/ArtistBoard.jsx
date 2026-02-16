// Artist order (left to right on board) - matches backend
const ARTISTS = [
  'Manuel Carvalho',   // Yellow - Geometric
  'Sigrid Thaler',     // Blue - Ocean
  'Daniel Melim',      // Red - Urban
  'Ramon Martins',     // Green - Botanical
  'Rafael Silveira',   // Orange - Cosmic
];

const artistColors = {
  'Manuel Carvalho': 'artist-carvalho',
  'Ramon Martins': 'artist-martins',
  'Daniel Melim': 'artist-melim',
  'Rafael Silveira': 'artist-silveira',
  'Sigrid Thaler': 'artist-thaler',
};

function ArtistBoard({ artistCounts, artistValues, cardsInPlay }) {
  // Get cumulative value for each artist
  const getCumulativeValue = (artist) => {
    const artistData = artistValues.find((av) => av.artist === artist);
    return artistData?.cumulative_value || 0;
  };

  // Get values by round for each artist
  const getValuesByRound = (artist) => {
    const artistData = artistValues.find((av) => av.artist === artist);
    return artistData?.values_by_round || {};
  };

  return (
    <div className="artist-board">
      <h2>Artists</h2>
      <div className="artist-grid">
        {ARTISTS.map((artist) => {
          const count = artistCounts[artist] || 0;
          const cumulativeValue = getCumulativeValue(artist);
          const valuesByRound = getValuesByRound(artist);
          const shortName = artist.split(' ')[1];

          return (
            <div key={artist} className={`artist-column ${artistColors[artist]}`}>
              <div className="artist-header">
                <span className="artist-name">{shortName}</span>
                {cumulativeValue > 0 && (
                  <span className="artist-value">{cumulativeValue}k</span>
                )}
              </div>

              <div className="artist-values">
                {[1, 2, 3, 4].map((round) => (
                  <div key={round} className="value-slot">
                    {valuesByRound[round] ? (
                      <span className="value-tile">{valuesByRound[round]}</span>
                    ) : (
                      <span className="value-empty">-</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="artist-count">
                <span className="count-number">{count}</span>
                <span className="count-label">/ 5</span>
              </div>

              {/* Show cards played for this artist */}
              <div className="artist-cards">
                {cardsInPlay
                  .filter((card) => card.artist === artist)
                  .map((card) => (
                    <div
                      key={card.id}
                      className={`mini-card ${card.owner_id ? 'owned' : 'unsold'}`}
                      title={card.owner_name ? `Owned by ${card.owner_name}` : 'Unsold'}
                    >
                      {card.owner_name ? card.owner_name.charAt(0) : '?'}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ArtistBoard;
