/**
 * CardArtwork - Renders unique SVG artwork for each card
 * Each artist has a themed style with variations based on artwork_id
 */

function CardArtwork({ artist, artworkId }) {
  // Generate consistent pseudo-random values based on artwork_id
  const seed = artworkId * 137;
  const variation1 = ((seed * 17) % 100) / 100;
  const variation2 = ((seed * 31) % 100) / 100;
  const variation3 = ((seed * 47) % 100) / 100;

  const renderArtwork = () => {
    switch (artist) {
      case 'Manuel Carvalho':
        // Geometric abstract - shapes and angles
        return (
          <svg viewBox="0 0 100 100" className="artwork-svg geometric">
            <defs>
              <linearGradient id={`geo-grad-${artworkId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#1a1a2e" />
            {/* Main geometric shapes */}
            <polygon
              points={`${20 + variation1 * 20},${10 + variation2 * 10} ${80 - variation2 * 20},${20 + variation3 * 10} ${50 + variation3 * 20},${60 - variation1 * 10}`}
              fill={`url(#geo-grad-${artworkId})`}
              opacity="0.9"
            />
            <rect
              x={15 + variation2 * 20}
              y={50 + variation1 * 10}
              width={30 - variation3 * 10}
              height={30 - variation1 * 10}
              fill="#FFD700"
              opacity="0.7"
              transform={`rotate(${variation1 * 45}, ${30 + variation2 * 20}, ${65 + variation1 * 10})`}
            />
            <circle
              cx={70 - variation3 * 15}
              cy={75 - variation2 * 15}
              r={12 + variation1 * 8}
              fill="#FFA500"
              opacity="0.8"
            />
            {/* Accent lines */}
            <line x1={10 + variation1 * 30} y1="90" x2={90 - variation2 * 30} y2={70 + variation3 * 10} stroke="#FFD700" strokeWidth="2" />
            <line x1={5 + variation3 * 10} y1={30 + variation2 * 20} x2={40 + variation1 * 20} y2={80 - variation3 * 10} stroke="#FFA500" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );

      case 'Sigrid Thaler':
        // Ocean/Marine - waves and flowing forms
        return (
          <svg viewBox="0 0 100 100" className="artwork-svg ocean">
            <defs>
              <linearGradient id={`ocean-grad-${artworkId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0077be" />
                <stop offset="50%" stopColor="#00a8cc" />
                <stop offset="100%" stopColor="#004e92" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#001a33" />
            {/* Waves */}
            <path
              d={`M0,${40 + variation1 * 15} Q${25 + variation2 * 10},${30 + variation3 * 10} 50,${45 + variation1 * 10} T100,${35 + variation2 * 15} V100 H0 Z`}
              fill={`url(#ocean-grad-${artworkId})`}
              opacity="0.8"
            />
            <path
              d={`M0,${55 + variation2 * 10} Q${30 - variation1 * 10},${45 + variation2 * 15} 50,${60 + variation3 * 5} T100,${50 + variation1 * 10} V100 H0 Z`}
              fill="#00a8cc"
              opacity="0.6"
            />
            <path
              d={`M0,${70 + variation3 * 10} Q${35 + variation1 * 15},${65 - variation2 * 10} 50,${75 + variation1 * 8} T100,${68 + variation3 * 10} V100 H0 Z`}
              fill="#40c4ff"
              opacity="0.4"
            />
            {/* Bubbles/circles */}
            <circle cx={20 + variation1 * 15} cy={25 + variation2 * 10} r={3 + variation3 * 2} fill="#ffffff" opacity="0.3" />
            <circle cx={75 - variation2 * 20} cy={20 + variation1 * 15} r={2 + variation1 * 2} fill="#ffffff" opacity="0.4" />
            <circle cx={60 + variation3 * 10} cy={35 - variation2 * 5} r={4 + variation2 * 2} fill="#ffffff" opacity="0.25" />
          </svg>
        );

      case 'Daniel Melim':
        // Urban/Street art - graffiti style
        return (
          <svg viewBox="0 0 100 100" className="artwork-svg urban">
            <defs>
              <linearGradient id={`urban-grad-${artworkId}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B0000" />
                <stop offset="50%" stopColor="#DC143C" />
                <stop offset="100%" stopColor="#FF4500" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#1c1c1c" />
            {/* Building silhouettes */}
            <rect x={5 + variation1 * 5} y={40 + variation2 * 15} width={20 - variation3 * 5} height={60} fill="#2d2d2d" />
            <rect x={30 + variation2 * 5} y={25 + variation1 * 10} width={18 - variation1 * 3} height={75} fill="#3d3d3d" />
            <rect x={55 - variation3 * 5} y={35 + variation3 * 10} width={22 + variation2 * 5} height={65} fill="#2d2d2d" />
            <rect x={80 - variation1 * 5} y={50 - variation2 * 10} width={20} height={50 + variation2 * 10} fill="#3d3d3d" />
            {/* Graffiti splashes */}
            <circle cx={40 + variation1 * 20} cy={50 + variation2 * 20} r={15 + variation3 * 10} fill={`url(#urban-grad-${artworkId})`} opacity="0.8" />
            <polygon
              points={`${20 + variation2 * 30},${60 + variation1 * 15} ${35 + variation3 * 25},${40 + variation2 * 10} ${50 + variation1 * 20},${70 + variation3 * 10}`}
              fill="#FF4500"
              opacity="0.6"
            />
            {/* Neon accents */}
            <line x1={10 + variation1 * 20} y1={30 + variation2 * 15} x2={50 + variation3 * 30} y2={25 + variation1 * 10} stroke="#ff0080" strokeWidth="2" opacity="0.8" />
            <line x1={60 - variation2 * 15} y1={55 + variation3 * 10} x2={95 - variation1 * 10} y2={45 + variation2 * 15} stroke="#00ffff" strokeWidth="1.5" opacity="0.7" />
          </svg>
        );

      case 'Ramon Martins':
        // Botanical - plants and nature
        return (
          <svg viewBox="0 0 100 100" className="artwork-svg botanical">
            <defs>
              <linearGradient id={`botanical-grad-${artworkId}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#004d00" />
                <stop offset="50%" stopColor="#228B22" />
                <stop offset="100%" stopColor="#32CD32" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#0a1f0a" />
            {/* Tree/plant stems */}
            <path
              d={`M${50 + variation1 * 10 - 5},100 Q${45 + variation2 * 10},${70 + variation3 * 10} ${50 + variation1 * 5},${40 + variation2 * 10}`}
              stroke="#4a7c59"
              strokeWidth="4"
              fill="none"
            />
            {/* Leaves */}
            <ellipse
              cx={35 + variation1 * 10}
              cy={30 + variation2 * 15}
              rx={18 - variation3 * 5}
              ry={12 + variation1 * 5}
              fill={`url(#botanical-grad-${artworkId})`}
              transform={`rotate(${-30 + variation2 * 20}, ${35 + variation1 * 10}, ${30 + variation2 * 15})`}
            />
            <ellipse
              cx={65 - variation2 * 10}
              cy={35 + variation1 * 10}
              rx={16 + variation1 * 4}
              ry={10 + variation3 * 3}
              fill="#228B22"
              opacity="0.9"
              transform={`rotate(${30 - variation3 * 25}, ${65 - variation2 * 10}, ${35 + variation1 * 10})`}
            />
            <ellipse
              cx={50 + variation3 * 5}
              cy={20 + variation1 * 10}
              rx={14 + variation2 * 5}
              ry={9 + variation1 * 4}
              fill="#32CD32"
              opacity="0.8"
              transform={`rotate(${variation1 * 15}, ${50 + variation3 * 5}, ${20 + variation1 * 10})`}
            />
            {/* Small decorative elements */}
            <circle cx={25 + variation1 * 15} cy={60 + variation2 * 15} r={4 + variation3 * 2} fill="#90EE90" opacity="0.6" />
            <circle cx={75 - variation3 * 15} cy={55 + variation1 * 20} r={3 + variation2 * 2} fill="#98FB98" opacity="0.5" />
            <circle cx={60 + variation2 * 10} cy={70 - variation1 * 10} r={5 + variation1 * 2} fill="#228B22" opacity="0.4" />
          </svg>
        );

      case 'Rafael Silveira':
        // Cosmic/Space - galaxies and stars
        return (
          <svg viewBox="0 0 100 100" className="artwork-svg cosmic">
            <defs>
              <radialGradient id={`cosmic-grad-${artworkId}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF8C00" />
                <stop offset="40%" stopColor="#FF4500" />
                <stop offset="100%" stopColor="#8B0000" />
              </radialGradient>
              <radialGradient id={`nebula-grad-${artworkId}`} cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#FF6B00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#0a0a1a" />
            {/* Stars */}
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={((artworkId * 17 + i * 37) % 90) + 5}
                cy={((artworkId * 23 + i * 41) % 90) + 5}
                r={0.5 + (((artworkId + i) * 13) % 3) * 0.5}
                fill="#ffffff"
                opacity={0.4 + (((artworkId + i) * 7) % 6) * 0.1}
              />
            ))}
            {/* Nebula/galaxy */}
            <ellipse
              cx={50 + variation1 * 15 - 7}
              cy={50 + variation2 * 15 - 7}
              rx={30 + variation3 * 10}
              ry={20 + variation1 * 8}
              fill={`url(#nebula-grad-${artworkId})`}
              transform={`rotate(${variation2 * 60}, ${50 + variation1 * 15 - 7}, ${50 + variation2 * 15 - 7})`}
            />
            {/* Central star/body */}
            <circle
              cx={50 + variation1 * 10 - 5}
              cy={50 + variation2 * 10 - 5}
              r={8 + variation3 * 5}
              fill={`url(#cosmic-grad-${artworkId})`}
            />
            {/* Glowing ring */}
            <ellipse
              cx={50 + variation1 * 10 - 5}
              cy={50 + variation2 * 10 - 5}
              rx={18 + variation2 * 8}
              ry={6 + variation1 * 3}
              fill="none"
              stroke="#FFD700"
              strokeWidth="1.5"
              opacity="0.6"
              transform={`rotate(${-20 + variation3 * 40}, ${50 + variation1 * 10 - 5}, ${50 + variation2 * 10 - 5})`}
            />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 100 100" className="artwork-svg default">
            <rect x="0" y="0" width="100" height="100" fill="#333" />
            <text x="50" y="55" textAnchor="middle" fill="#999" fontSize="12">Art</text>
          </svg>
        );
    }
  };

  return (
    <div className="card-artwork-container">
      {renderArtwork()}
    </div>
  );
}

export default CardArtwork;
