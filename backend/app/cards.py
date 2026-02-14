"""
Card deck definition for Modern Art.

70 cards total across 5 artists:
- Manuel Carvalho: 12 cards
- Ramon Martins: 15 cards
- Daniel Melim: 15 cards
- Rafael Silveira: 15 cards
- Sigrid Thaler: 13 cards

Auction types:
- open: Free-form bidding
- once_around: One bid each, clockwise
- hidden: Sealed bid
- fixed_price: Auctioneer sets price
- double: Can pair with another same-artist card

The distribution below is based on typical Modern Art card distributions.
"""

from typing import TypedDict


class CardDict(TypedDict):
    artist: str
    auction_type: str


# Artist names in board order (left to right) - used for tie-breaking
ARTISTS = [
    "Manuel Carvalho",
    "Ramon Martins",
    "Daniel Melim",
    "Rafael Silveira",
    "Sigrid Thaler",
]

# Auction types
AUCTION_TYPES = ["open", "once_around", "hidden", "fixed_price", "double"]

# Cards per artist and their auction type distribution
# Format: (artist, auction_type)
DECK: list[CardDict] = [
    # Manuel Carvalho (12 cards)
    {"artist": "Manuel Carvalho", "auction_type": "open"},
    {"artist": "Manuel Carvalho", "auction_type": "open"},
    {"artist": "Manuel Carvalho", "auction_type": "open"},
    {"artist": "Manuel Carvalho", "auction_type": "once_around"},
    {"artist": "Manuel Carvalho", "auction_type": "once_around"},
    {"artist": "Manuel Carvalho", "auction_type": "hidden"},
    {"artist": "Manuel Carvalho", "auction_type": "hidden"},
    {"artist": "Manuel Carvalho", "auction_type": "fixed_price"},
    {"artist": "Manuel Carvalho", "auction_type": "fixed_price"},
    {"artist": "Manuel Carvalho", "auction_type": "double"},
    {"artist": "Manuel Carvalho", "auction_type": "double"},
    {"artist": "Manuel Carvalho", "auction_type": "double"},
    # Ramon Martins (15 cards)
    {"artist": "Ramon Martins", "auction_type": "open"},
    {"artist": "Ramon Martins", "auction_type": "open"},
    {"artist": "Ramon Martins", "auction_type": "open"},
    {"artist": "Ramon Martins", "auction_type": "once_around"},
    {"artist": "Ramon Martins", "auction_type": "once_around"},
    {"artist": "Ramon Martins", "auction_type": "once_around"},
    {"artist": "Ramon Martins", "auction_type": "hidden"},
    {"artist": "Ramon Martins", "auction_type": "hidden"},
    {"artist": "Ramon Martins", "auction_type": "hidden"},
    {"artist": "Ramon Martins", "auction_type": "fixed_price"},
    {"artist": "Ramon Martins", "auction_type": "fixed_price"},
    {"artist": "Ramon Martins", "auction_type": "fixed_price"},
    {"artist": "Ramon Martins", "auction_type": "double"},
    {"artist": "Ramon Martins", "auction_type": "double"},
    {"artist": "Ramon Martins", "auction_type": "double"},
    # Daniel Melim (15 cards)
    {"artist": "Daniel Melim", "auction_type": "open"},
    {"artist": "Daniel Melim", "auction_type": "open"},
    {"artist": "Daniel Melim", "auction_type": "open"},
    {"artist": "Daniel Melim", "auction_type": "once_around"},
    {"artist": "Daniel Melim", "auction_type": "once_around"},
    {"artist": "Daniel Melim", "auction_type": "once_around"},
    {"artist": "Daniel Melim", "auction_type": "hidden"},
    {"artist": "Daniel Melim", "auction_type": "hidden"},
    {"artist": "Daniel Melim", "auction_type": "hidden"},
    {"artist": "Daniel Melim", "auction_type": "fixed_price"},
    {"artist": "Daniel Melim", "auction_type": "fixed_price"},
    {"artist": "Daniel Melim", "auction_type": "fixed_price"},
    {"artist": "Daniel Melim", "auction_type": "double"},
    {"artist": "Daniel Melim", "auction_type": "double"},
    {"artist": "Daniel Melim", "auction_type": "double"},
    # Rafael Silveira (15 cards)
    {"artist": "Rafael Silveira", "auction_type": "open"},
    {"artist": "Rafael Silveira", "auction_type": "open"},
    {"artist": "Rafael Silveira", "auction_type": "open"},
    {"artist": "Rafael Silveira", "auction_type": "once_around"},
    {"artist": "Rafael Silveira", "auction_type": "once_around"},
    {"artist": "Rafael Silveira", "auction_type": "once_around"},
    {"artist": "Rafael Silveira", "auction_type": "hidden"},
    {"artist": "Rafael Silveira", "auction_type": "hidden"},
    {"artist": "Rafael Silveira", "auction_type": "hidden"},
    {"artist": "Rafael Silveira", "auction_type": "fixed_price"},
    {"artist": "Rafael Silveira", "auction_type": "fixed_price"},
    {"artist": "Rafael Silveira", "auction_type": "fixed_price"},
    {"artist": "Rafael Silveira", "auction_type": "double"},
    {"artist": "Rafael Silveira", "auction_type": "double"},
    {"artist": "Rafael Silveira", "auction_type": "double"},
    # Sigrid Thaler (13 cards)
    {"artist": "Sigrid Thaler", "auction_type": "open"},
    {"artist": "Sigrid Thaler", "auction_type": "open"},
    {"artist": "Sigrid Thaler", "auction_type": "open"},
    {"artist": "Sigrid Thaler", "auction_type": "once_around"},
    {"artist": "Sigrid Thaler", "auction_type": "once_around"},
    {"artist": "Sigrid Thaler", "auction_type": "hidden"},
    {"artist": "Sigrid Thaler", "auction_type": "hidden"},
    {"artist": "Sigrid Thaler", "auction_type": "fixed_price"},
    {"artist": "Sigrid Thaler", "auction_type": "fixed_price"},
    {"artist": "Sigrid Thaler", "auction_type": "double"},
    {"artist": "Sigrid Thaler", "auction_type": "double"},
    {"artist": "Sigrid Thaler", "auction_type": "double"},
    {"artist": "Sigrid Thaler", "auction_type": "once_around"},
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
