"""
Game management routes: create, join, get state, start.
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Game, Player
from ..schemas import (
    CreateGameRequest,
    JoinGameRequest,
    GameStateResponse,
    GameCreatedResponse,
    JoinedGameResponse,
    PlayerPublic,
    CardInPlayResponse,
    ArtistValueResponse,
)
from ..game_logic import (
    start_game,
    get_player_hand,
    get_artist_count_this_round,
    get_artist_values_by_round,
    get_cumulative_artist_values,
    get_double_auction_state,
)
from ..cards import ARTISTS
from ..websocket import manager

router = APIRouter(prefix="/api/games", tags=["games"])


def get_game_by_code(db: Session, code: str) -> Game:
    """Helper to get game by code or raise 404."""
    game = db.query(Game).filter(Game.code == code.upper()).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


def build_game_state_response(db: Session, game: Game) -> dict:
    """Build the public game state response."""
    players = list(game.players)

    # Build player list with public info
    player_list = []
    for p in sorted(players, key=lambda x: x.turn_order or 0):
        # Count paintings owned this round
        painting_count = len([
            c for c in game.cards_in_play
            if c.owner_id == p.id and c.round == game.current_round
        ])
        player_list.append(PlayerPublic(
            id=p.id,
            name=p.name,
            card_count=len(get_player_hand(p)),
            painting_count=painting_count,
            turn_order=p.turn_order or 0,
            is_connected=p.is_connected
        ))

    # Artist counts this round
    artist_counts = get_artist_count_this_round(db, game)

    # Artist values
    values_by_round = get_artist_values_by_round(db, game)
    cumulative = get_cumulative_artist_values(db, game)
    artist_values = [
        ArtistValueResponse(
            artist=artist,
            values_by_round=values_by_round.get(artist, {}),
            cumulative_value=cumulative.get(artist, 0)
        )
        for artist in ARTISTS
    ]

    # Cards in play this round
    cards = [
        CardInPlayResponse(
            id=c.id,
            round=c.round,
            artist=c.artist,
            auction_type=c.auction_type,
            owner_id=c.owner_id,
            owner_name=next((p.name for p in players if p.id == c.owner_id), None),
            price_paid=c.price_paid
        )
        for c in game.cards_in_play
        if c.round == game.current_round
    ]

    # Double auction state if any
    double_state = get_double_auction_state(game)

    return {
        "id": game.id,
        "code": game.code,
        "status": game.status,
        "current_round": game.current_round,
        "host_player_id": game.host_player_id,
        "current_turn_player_id": game.current_turn_player_id,
        "awaiting_auction_result": game.awaiting_auction_result,
        "players": [p.model_dump() for p in player_list],
        "artist_counts": artist_counts,
        "artist_values": [av.model_dump() for av in artist_values],
        "cards_in_play": [c.model_dump() for c in cards],
        "double_auction_state": double_state.model_dump() if double_state else None,
        "created_at": game.created_at.isoformat()
    }


def get_private_data(game: Game) -> dict[str, dict]:
    """Get private data (hand, money) for each player."""
    return {
        p.id: {
            "hand": get_player_hand(p),
            "money": p.money
        }
        for p in game.players
    }


@router.post("", response_model=GameCreatedResponse)
async def create_game(request: CreateGameRequest, db: Session = Depends(get_db)):
    """Create a new game and join as host."""
    # Create game
    game = Game()
    db.add(game)
    db.flush()

    # Create host player
    player = Player(
        game_id=game.id,
        name=request.host_name,
        turn_order=0
    )
    db.add(player)
    db.flush()

    # Set host
    game.host_player_id = player.id
    db.commit()

    return GameCreatedResponse(game_code=game.code, player_id=player.id)


@router.get("/{code}")
async def get_game(code: str, player_id: str, db: Session = Depends(get_db)):
    """Get game state. Requires player_id to get private data."""
    game = get_game_by_code(db, code)

    # Verify player is in game
    player = next((p for p in game.players if p.id == player_id), None)
    if not player:
        raise HTTPException(status_code=403, detail="Not a player in this game")

    state = build_game_state_response(db, game)
    private = get_private_data(game)

    return {
        **state,
        "your_hand": private.get(player_id, {}).get("hand", []),
        "your_money": private.get(player_id, {}).get("money", 0),
        "your_player_id": player_id
    }


@router.post("/{code}/join", response_model=JoinedGameResponse)
async def join_game(code: str, request: JoinGameRequest, db: Session = Depends(get_db)):
    """Join an existing game."""
    game = get_game_by_code(db, code)

    if game.status != "lobby":
        raise HTTPException(status_code=400, detail="Game already started")

    if len(game.players) >= 5:
        raise HTTPException(status_code=400, detail="Game is full")

    # Check for duplicate name
    if any(p.name.lower() == request.player_name.lower() for p in game.players):
        raise HTTPException(status_code=400, detail="Name already taken")

    # Create player
    turn_order = len(game.players)
    player = Player(
        game_id=game.id,
        name=request.player_name,
        turn_order=turn_order
    )
    db.add(player)
    db.commit()

    # Broadcast to other players
    await manager.broadcast(
        {"type": "player_joined", "data": {"player_id": player.id, "player_name": player.name}},
        game.code
    )

    return JoinedGameResponse(player_id=player.id)


@router.post("/{code}/randomize-order")
async def randomize_order(code: str, player_id: str, db: Session = Depends(get_db)):
    """Randomize player turn order (host only, lobby only)."""
    import random

    game = get_game_by_code(db, code)

    if game.host_player_id != player_id:
        raise HTTPException(status_code=403, detail="Only host can randomize order")

    if game.status != "lobby":
        raise HTTPException(status_code=400, detail="Can only randomize in lobby")

    # Shuffle turn order
    players = list(game.players)
    random.shuffle(players)
    for i, player in enumerate(players):
        player.turn_order = i

    db.commit()

    # Broadcast updated player list
    await manager.broadcast({
        "type": "players_reordered",
        "data": {
            "players": [{"id": p.id, "name": p.name, "turn_order": p.turn_order} for p in players]
        }
    }, game.code)

    return {"status": "randomized"}


@router.post("/{code}/start")
async def start_game_route(code: str, player_id: str, db: Session = Depends(get_db)):
    """Start the game (host only)."""
    game = get_game_by_code(db, code)

    if game.host_player_id != player_id:
        raise HTTPException(status_code=403, detail="Only host can start the game")

    if game.status != "lobby":
        raise HTTPException(status_code=400, detail="Game already started")

    if len(game.players) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 players")

    # Start the game
    start_game(db, game)

    # Broadcast game started with full state
    state = build_game_state_response(db, game)
    private = get_private_data(game)
    await manager.broadcast_game_state(state, game.code, private)

    return {"status": "started"}
