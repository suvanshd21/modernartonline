from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Card schema
class Card(BaseModel):
    artist: str
    auction_type: str  # open, once_around, hidden, fixed_price, double


# Request schemas
class CreateGameRequest(BaseModel):
    host_name: str


class JoinGameRequest(BaseModel):
    player_name: str


class PlayCardRequest(BaseModel):
    player_id: str
    card_index: int  # Index in player's hand


class AddDoubleRequest(BaseModel):
    player_id: str
    card_index: int  # Index in player's hand for second card


class DeclineDoubleRequest(BaseModel):
    player_id: str


class RecordAuctionRequest(BaseModel):
    winner_id: Optional[str] = None  # None if no one bought (auctioneer gets free for non-fixed)
    price: int = 0


# Response schemas
class PlayerPublic(BaseModel):
    id: str
    name: str
    card_count: int  # How many cards in hand
    painting_count: int  # How many paintings owned this round
    turn_order: int  # Position in turn sequence
    is_connected: bool

    class Config:
        from_attributes = True


class PlayerPrivate(BaseModel):
    id: str
    name: str
    money: int
    hand: list[Card]
    painting_count: int
    is_connected: bool

    class Config:
        from_attributes = True


class CardInPlayResponse(BaseModel):
    id: str
    round: int
    artist: str
    auction_type: str
    owner_id: Optional[str]
    owner_name: Optional[str]
    price_paid: Optional[int]

    class Config:
        from_attributes = True


class ArtistValueResponse(BaseModel):
    artist: str
    values_by_round: dict[int, int]  # round -> value
    cumulative_value: int


class DoubleAuctionState(BaseModel):
    first_card: Card
    played_by_id: str
    played_by_name: str
    current_offerer_id: Optional[str]  # Who's turn to offer second card
    second_card: Optional[Card] = None
    second_card_player_id: Optional[str] = None


class GameStateResponse(BaseModel):
    id: str
    code: str
    status: str
    current_round: int
    host_player_id: str
    current_turn_player_id: Optional[str]
    awaiting_auction_result: bool
    players: list[PlayerPublic]
    artist_counts: dict[str, int]  # Artist -> count this round
    artist_values: list[ArtistValueResponse]
    cards_in_play: list[CardInPlayResponse]
    double_auction_state: Optional[DoubleAuctionState]
    created_at: datetime

    class Config:
        from_attributes = True


class GameCreatedResponse(BaseModel):
    game_code: str
    player_id: str


class JoinedGameResponse(BaseModel):
    player_id: str


class RoundEndInfo(BaseModel):
    rankings: list[dict]  # [{"artist": ..., "count": ..., "value": ...}]
    payouts: list[dict]  # [{"player_id": ..., "player_name": ..., "amount": ...}]
    new_values: dict[str, int]  # Artist -> new value tile this round


# WebSocket message schemas
class WSMessage(BaseModel):
    type: str
    data: dict
