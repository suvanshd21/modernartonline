import uuid
from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


def generate_game_code():
    """Generate an 8-character alphanumeric game code."""
    return uuid.uuid4().hex[:8].upper()


class Game(Base):
    __tablename__ = "games"

    id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String(8), unique=True, nullable=False, default=generate_game_code)
    status = Column(String, nullable=False, default="lobby")  # lobby, in_progress, finished
    current_round = Column(Integer, default=0)
    host_player_id = Column(String, nullable=True)
    deck = Column(Text, nullable=True)  # JSON array of remaining cards
    double_auction_state = Column(Text, nullable=True)  # JSON for pending double auction
    current_turn_player_id = Column(String, nullable=True)  # Who's turn to play a card
    awaiting_auction_result = Column(Boolean, default=False)  # Waiting for auction result input
    created_at = Column(DateTime, default=datetime.utcnow)

    players = relationship("Player", back_populates="game", cascade="all, delete-orphan")
    cards_in_play = relationship("CardInPlay", back_populates="game", cascade="all, delete-orphan")
    artist_values = relationship("ArtistValue", back_populates="game", cascade="all, delete-orphan")


class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, default=generate_uuid)
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    name = Column(String, nullable=False)
    money = Column(Integer, default=100)  # In thousands (k€)
    hand = Column(Text, nullable=True)  # JSON array of cards
    turn_order = Column(Integer, nullable=True)
    is_connected = Column(Boolean, default=True)

    game = relationship("Game", back_populates="players")
    owned_cards = relationship("CardInPlay", back_populates="owner")


class CardInPlay(Base):
    __tablename__ = "cards_in_play"

    id = Column(String, primary_key=True, default=generate_uuid)
    game_id = Column(String, ForeignKey("games.id"), nullable=False)
    round = Column(Integer, nullable=False)
    artist = Column(String, nullable=False)
    auction_type = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("players.id"), nullable=True)  # NULL if unsold
    price_paid = Column(Integer, nullable=True)
    played_by_id = Column(String, nullable=True)  # Who played this card

    game = relationship("Game", back_populates="cards_in_play")
    owner = relationship("Player", back_populates="owned_cards")


class ArtistValue(Base):
    __tablename__ = "artist_values"

    game_id = Column(String, ForeignKey("games.id"), primary_key=True)
    artist = Column(String, primary_key=True)
    round = Column(Integer, primary_key=True)
    value = Column(Integer, nullable=False)

    game = relationship("Game", back_populates="artist_values")


class Transaction(Base):
    __tablename__ = "transactions"

    id             = Column(String,  primary_key=True, default=lambda: str(uuid4()))
    game_id        = Column(String,  ForeignKey("games.id"), nullable=False, index=True)
    round          = Column(Integer, nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow, nullable=False)
    from_player_id = Column(String,  ForeignKey("players.id"), nullable=True)  # NULL = bank
    to_player_id   = Column(String,  ForeignKey("players.id"), nullable=True)  # NULL = bank
    amount         = Column(Integer, nullable=False)  # always >= 0
    txn_type       = Column(String,  nullable=False)
    # txn_type values: "auction_sale" | "self_buy" | "fixed_price_no_sale" | "free_card" | "round_payout"
    description    = Column(String,  nullable=False)

    game        = relationship("Game",   foreign_keys=[game_id], backref="transactions")
    from_player = relationship("Player", foreign_keys=[from_player_id])
    to_player   = relationship("Player", foreign_keys=[to_player_id])
