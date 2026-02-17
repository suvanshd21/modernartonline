"""
Card deck definition for Art Auction Game.

70 cards total across 5 artists (left to right on board):
- Viktor Novak: 12 cards (Yellow) - Abstract Geometric
- Marina Costa: 13 cards (Blue) - Ocean/Marine
- Leon Bauer: 14 cards (Red) - Urban/Street Art
- Flora Vance: 15 cards (Green) - Botanical/Nature
- Celeste Ruiz: 16 cards (Orange) - Cosmic/Space

Auction types:
- open: Free-form bidding
- once_around: One bid each, clockwise
- hidden: Sealed bid
- fixed_price: Auctioneer sets price
- double: Can pair with another same-artist card
"""

from typing import TypedDict


class CardDict(TypedDict):
    artist: str
    auction_type: str
    artwork_id: int


# Artist names in board order (left to right) - used for tie-breaking
ARTISTS = [
    "Viktor Novak",
    "Marina Costa",
    "Leon Bauer",
    "Flora Vance",
    "Celeste Ruiz",
]

# Artist colors for frontend
ARTIST_COLORS = {
    "Viktor Novak": "yellow",
    "Marina Costa": "blue",
    "Leon Bauer": "red",
    "Flora Vance": "green",
    "Celeste Ruiz": "orange",
}

# Auction types
AUCTION_TYPES = ["open", "once_around", "hidden", "fixed_price", "double"]

# Artwork themes for each artist (used by frontend to display art)
# Each artist has unique artwork pieces
ARTWORK_THEMES = {
    "Viktor Novak": {
        # Abstract Geometric - Bold shapes, primary colors
        "theme": "geometric",
        "pieces": [
            {"id": 1, "name": "Prismatic Shift", "icon": "prism"},
            {"id": 2, "name": "Golden Ratio", "icon": "spiral"},
            {"id": 3, "name": "Cubic Dreams", "icon": "cube"},
            {"id": 4, "name": "Triangle Symphony", "icon": "triangles"},
            {"id": 5, "name": "Circle of Light", "icon": "circles"},
            {"id": 6, "name": "Hexagonal Harmony", "icon": "hexagon"},
            {"id": 7, "name": "Diamond Cascade", "icon": "diamond"},
            {"id": 8, "name": "Square Root", "icon": "squares"},
            {"id": 9, "name": "Parallel Lines", "icon": "lines"},
            {"id": 10, "name": "Fractal Vision", "icon": "fractal"},
            {"id": 11, "name": "Tessellation", "icon": "tessellation"},
            {"id": 12, "name": "Abstract Unity", "icon": "unity"},
        ]
    },
    "Marina Costa": {
        # Ocean/Marine - Waves, underwater scenes
        "theme": "ocean",
        "pieces": [
            {"id": 1, "name": "Deep Blue", "icon": "waves"},
            {"id": 2, "name": "Coral Garden", "icon": "coral"},
            {"id": 3, "name": "Jellyfish Dance", "icon": "jellyfish"},
            {"id": 4, "name": "Whale Song", "icon": "whale"},
            {"id": 5, "name": "Tidal Pool", "icon": "pool"},
            {"id": 6, "name": "Seahorse Dreams", "icon": "seahorse"},
            {"id": 7, "name": "Ocean Floor", "icon": "floor"},
            {"id": 8, "name": "Moonlit Waves", "icon": "moonwave"},
            {"id": 9, "name": "Dolphin Arc", "icon": "dolphin"},
            {"id": 10, "name": "Kelp Forest", "icon": "kelp"},
            {"id": 11, "name": "Pearl Depths", "icon": "pearl"},
            {"id": 12, "name": "Storm Surge", "icon": "storm"},
            {"id": 13, "name": "Bioluminescence", "icon": "glow"},
        ]
    },
    "Leon Bauer": {
        # Urban/Street Art - Graffiti, cityscapes
        "theme": "urban",
        "pieces": [
            {"id": 1, "name": "Neon Nights", "icon": "neon"},
            {"id": 2, "name": "Brick Canvas", "icon": "brick"},
            {"id": 3, "name": "Subway Dreams", "icon": "subway"},
            {"id": 4, "name": "Rooftop View", "icon": "rooftop"},
            {"id": 5, "name": "Street Corner", "icon": "corner"},
            {"id": 6, "name": "Fire Escape", "icon": "escape"},
            {"id": 7, "name": "Alley Art", "icon": "alley"},
            {"id": 8, "name": "City Pulse", "icon": "pulse"},
            {"id": 9, "name": "Urban Jungle", "icon": "jungle"},
            {"id": 10, "name": "Concrete Poetry", "icon": "concrete"},
            {"id": 11, "name": "Spray Paint Sky", "icon": "spray"},
            {"id": 12, "name": "Window Reflections", "icon": "window"},
            {"id": 13, "name": "Electric Grid", "icon": "grid"},
            {"id": 14, "name": "Stencil Stories", "icon": "stencil"},
        ]
    },
    "Flora Vance": {
        # Botanical/Nature - Plants, forests, gardens
        "theme": "botanical",
        "pieces": [
            {"id": 1, "name": "Emerald Canopy", "icon": "canopy"},
            {"id": 2, "name": "Wild Orchid", "icon": "orchid"},
            {"id": 3, "name": "Fern Spiral", "icon": "fern"},
            {"id": 4, "name": "Moss Garden", "icon": "moss"},
            {"id": 5, "name": "Bamboo Grove", "icon": "bamboo"},
            {"id": 6, "name": "Lotus Pond", "icon": "lotus"},
            {"id": 7, "name": "Vine Tangle", "icon": "vine"},
            {"id": 8, "name": "Mushroom Ring", "icon": "mushroom"},
            {"id": 9, "name": "Fallen Leaves", "icon": "leaves"},
            {"id": 10, "name": "Ancient Oak", "icon": "oak"},
            {"id": 11, "name": "Wildflower Field", "icon": "wildflower"},
            {"id": 12, "name": "Tropical Rain", "icon": "rain"},
            {"id": 13, "name": "Sunlit Clearing", "icon": "clearing"},
            {"id": 14, "name": "Root System", "icon": "roots"},
            {"id": 15, "name": "Garden Path", "icon": "path"},
        ]
    },
    "Celeste Ruiz": {
        # Cosmic/Space - Galaxies, nebulae, celestial
        "theme": "cosmic",
        "pieces": [
            {"id": 1, "name": "Supernova", "icon": "supernova"},
            {"id": 2, "name": "Spiral Galaxy", "icon": "galaxy"},
            {"id": 3, "name": "Nebula Dreams", "icon": "nebula"},
            {"id": 4, "name": "Event Horizon", "icon": "horizon"},
            {"id": 5, "name": "Cosmic Dust", "icon": "dust"},
            {"id": 6, "name": "Solar Flare", "icon": "flare"},
            {"id": 7, "name": "Asteroid Belt", "icon": "asteroid"},
            {"id": 8, "name": "Lunar Eclipse", "icon": "eclipse"},
            {"id": 9, "name": "Star Cluster", "icon": "cluster"},
            {"id": 10, "name": "Wormhole", "icon": "wormhole"},
            {"id": 11, "name": "Rings of Saturn", "icon": "rings"},
            {"id": 12, "name": "Comet Trail", "icon": "comet"},
            {"id": 13, "name": "Dark Matter", "icon": "dark"},
            {"id": 14, "name": "Pulsar Rhythm", "icon": "pulsar"},
            {"id": 15, "name": "Celestial Dance", "icon": "dance"},
            {"id": 16, "name": "Infinite Void", "icon": "void"},
        ]
    },
}

# Cards per artist and their auction type distribution
# Format: (artist, auction_type, artwork_id)
DECK: list[CardDict] = [
    # Viktor Novak (12 cards - Yellow - Geometric)
    {"artist": "Viktor Novak", "auction_type": "open", "artwork_id": 1},
    {"artist": "Viktor Novak", "auction_type": "open", "artwork_id": 2},
    {"artist": "Viktor Novak", "auction_type": "once_around", "artwork_id": 3},
    {"artist": "Viktor Novak", "auction_type": "once_around", "artwork_id": 4},
    {"artist": "Viktor Novak", "auction_type": "hidden", "artwork_id": 5},
    {"artist": "Viktor Novak", "auction_type": "hidden", "artwork_id": 6},
    {"artist": "Viktor Novak", "auction_type": "fixed_price", "artwork_id": 7},
    {"artist": "Viktor Novak", "auction_type": "fixed_price", "artwork_id": 8},
    {"artist": "Viktor Novak", "auction_type": "double", "artwork_id": 9},
    {"artist": "Viktor Novak", "auction_type": "double", "artwork_id": 10},
    {"artist": "Viktor Novak", "auction_type": "double", "artwork_id": 11},
    {"artist": "Viktor Novak", "auction_type": "open", "artwork_id": 12},

    # Marina Costa (13 cards - Blue - Ocean)
    {"artist": "Marina Costa", "auction_type": "open", "artwork_id": 1},
    {"artist": "Marina Costa", "auction_type": "open", "artwork_id": 2},
    {"artist": "Marina Costa", "auction_type": "open", "artwork_id": 3},
    {"artist": "Marina Costa", "auction_type": "once_around", "artwork_id": 4},
    {"artist": "Marina Costa", "auction_type": "once_around", "artwork_id": 5},
    {"artist": "Marina Costa", "auction_type": "once_around", "artwork_id": 6},
    {"artist": "Marina Costa", "auction_type": "hidden", "artwork_id": 7},
    {"artist": "Marina Costa", "auction_type": "hidden", "artwork_id": 8},
    {"artist": "Marina Costa", "auction_type": "fixed_price", "artwork_id": 9},
    {"artist": "Marina Costa", "auction_type": "fixed_price", "artwork_id": 10},
    {"artist": "Marina Costa", "auction_type": "double", "artwork_id": 11},
    {"artist": "Marina Costa", "auction_type": "double", "artwork_id": 12},
    {"artist": "Marina Costa", "auction_type": "double", "artwork_id": 13},

    # Leon Bauer (14 cards - Red - Urban)
    {"artist": "Leon Bauer", "auction_type": "open", "artwork_id": 1},
    {"artist": "Leon Bauer", "auction_type": "open", "artwork_id": 2},
    {"artist": "Leon Bauer", "auction_type": "open", "artwork_id": 3},
    {"artist": "Leon Bauer", "auction_type": "once_around", "artwork_id": 4},
    {"artist": "Leon Bauer", "auction_type": "once_around", "artwork_id": 5},
    {"artist": "Leon Bauer", "auction_type": "once_around", "artwork_id": 6},
    {"artist": "Leon Bauer", "auction_type": "hidden", "artwork_id": 7},
    {"artist": "Leon Bauer", "auction_type": "hidden", "artwork_id": 8},
    {"artist": "Leon Bauer", "auction_type": "hidden", "artwork_id": 9},
    {"artist": "Leon Bauer", "auction_type": "fixed_price", "artwork_id": 10},
    {"artist": "Leon Bauer", "auction_type": "fixed_price", "artwork_id": 11},
    {"artist": "Leon Bauer", "auction_type": "double", "artwork_id": 12},
    {"artist": "Leon Bauer", "auction_type": "double", "artwork_id": 13},
    {"artist": "Leon Bauer", "auction_type": "double", "artwork_id": 14},

    # Flora Vance (15 cards - Green - Botanical)
    {"artist": "Flora Vance", "auction_type": "open", "artwork_id": 1},
    {"artist": "Flora Vance", "auction_type": "open", "artwork_id": 2},
    {"artist": "Flora Vance", "auction_type": "open", "artwork_id": 3},
    {"artist": "Flora Vance", "auction_type": "once_around", "artwork_id": 4},
    {"artist": "Flora Vance", "auction_type": "once_around", "artwork_id": 5},
    {"artist": "Flora Vance", "auction_type": "once_around", "artwork_id": 6},
    {"artist": "Flora Vance", "auction_type": "hidden", "artwork_id": 7},
    {"artist": "Flora Vance", "auction_type": "hidden", "artwork_id": 8},
    {"artist": "Flora Vance", "auction_type": "hidden", "artwork_id": 9},
    {"artist": "Flora Vance", "auction_type": "fixed_price", "artwork_id": 10},
    {"artist": "Flora Vance", "auction_type": "fixed_price", "artwork_id": 11},
    {"artist": "Flora Vance", "auction_type": "fixed_price", "artwork_id": 12},
    {"artist": "Flora Vance", "auction_type": "double", "artwork_id": 13},
    {"artist": "Flora Vance", "auction_type": "double", "artwork_id": 14},
    {"artist": "Flora Vance", "auction_type": "double", "artwork_id": 15},

    # Celeste Ruiz (16 cards - Orange - Cosmic)
    {"artist": "Celeste Ruiz", "auction_type": "open", "artwork_id": 1},
    {"artist": "Celeste Ruiz", "auction_type": "open", "artwork_id": 2},
    {"artist": "Celeste Ruiz", "auction_type": "open", "artwork_id": 3},
    {"artist": "Celeste Ruiz", "auction_type": "open", "artwork_id": 4},
    {"artist": "Celeste Ruiz", "auction_type": "once_around", "artwork_id": 5},
    {"artist": "Celeste Ruiz", "auction_type": "once_around", "artwork_id": 6},
    {"artist": "Celeste Ruiz", "auction_type": "once_around", "artwork_id": 7},
    {"artist": "Celeste Ruiz", "auction_type": "hidden", "artwork_id": 8},
    {"artist": "Celeste Ruiz", "auction_type": "hidden", "artwork_id": 9},
    {"artist": "Celeste Ruiz", "auction_type": "hidden", "artwork_id": 10},
    {"artist": "Celeste Ruiz", "auction_type": "fixed_price", "artwork_id": 11},
    {"artist": "Celeste Ruiz", "auction_type": "fixed_price", "artwork_id": 12},
    {"artist": "Celeste Ruiz", "auction_type": "fixed_price", "artwork_id": 13},
    {"artist": "Celeste Ruiz", "auction_type": "double", "artwork_id": 14},
    {"artist": "Celeste Ruiz", "auction_type": "double", "artwork_id": 15},
    {"artist": "Celeste Ruiz", "auction_type": "double", "artwork_id": 16},
]

# Cards to deal per round based on player count
CARDS_PER_ROUND = {
    3: [10, 6, 6, 0],  # Round 1, 2, 3, 4
    4: [9, 4, 4, 0],
    5: [8, 3, 3, 0],
}


def get_deck_copy() -> list[CardDict]:
    """Return a copy of the full deck."""
    return [card.copy() for card in DECK]
