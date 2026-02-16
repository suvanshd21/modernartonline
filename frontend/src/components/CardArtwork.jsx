/**
 * CardArtwork - Displays artwork from National Gallery of Art for each card
 * Each artist has themed artwork from the NGA open access collection
 */

import artworkData from '../data/artwork.json';

function CardArtwork({ artist, artworkId }) {
  // Get artwork for this artist
  const artistData = artworkData[artist];

  if (!artistData || !artistData.artwork) {
    return <div className="artwork-placeholder">No artwork</div>;
  }

  // Get the specific artwork for this card (artwork_id is 1-indexed)
  const index = (artworkId - 1) % artistData.artwork.length;
  const artwork = artistData.artwork[index];

  if (!artwork) {
    return <div className="artwork-placeholder">No artwork</div>;
  }

  // Use IIIF to get a better sized image for the card
  // Format: {iiif_base}/full/!{width},{height}/0/default.jpg
  const imageUrl = `${artwork.iiif_base}/full/!180,240/0/default.jpg`;

  return (
    <div className="card-artwork-container" title={`"${artwork.title}" by ${artwork.artist}`}>
      <img
        src={imageUrl}
        alt={artwork.title}
        className="artwork-image"
        loading="lazy"
        onError={(e) => {
          // Fallback to thumbnail if full image fails
          e.target.src = artwork.thumb_url;
        }}
      />
    </div>
  );
}

export default CardArtwork;
