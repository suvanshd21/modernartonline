"""
Game action routes: play card, record auction, double auction handling.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Game, Player
from ..schemas import (
    PlayCardRequest,
    AddDoubleRequest,
    DeclineDoubleRequest,
    RecordAuctionRequest,
)
from ..game_logic import (
    play_card,
    add_double_card,
    decline_double,
    record_auction_result,
    end_round,
    get_player_hand,
    get_artist_count_this_round,
)
from ..websocket import manager
from .games import get_game_by_code, build_game_state_response, get_private_data

router = APIRouter(prefix="/api/games", tags=["actions"])


def get_player(game: Game, player_id: str) -> Player:
    """Helper to get player from game or raise 403."""
    player = next((p for p in game.players if p.id == player_id), None)
    if not player:
        raise HTTPException(status_code=403, detail="Not a player in this game")
    return player


@router.post("/{code}/play-card")
async def play_card_route(
    code: str,
    request: PlayCardRequest,
    db: Session = Depends(get_db)
):
    """Play a card from hand."""
    game = get_game_by_code(db, code)
    player = get_player(game, request.player_id)

    if game.status != "in_progress":
        raise HTTPException(status_code=400, detail="Game not in progress")

    if game.current_turn_player_id != player.id:
        raise HTTPException(status_code=400, detail="Not your turn")

    if game.awaiting_auction_result:
        raise HTTPException(status_code=400, detail="Auction result pending")

    if game.double_auction_state:
        raise HTTPException(status_code=400, detail="Double auction in progress")

    try:
        card, is_round_ending, is_double = play_card(db, game, player, request.card_index)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if is_round_ending:
        # Process round end
        round_info = end_round(db, game)

        # Broadcast round ended
        state = build_game_state_response(db, game)
        private = get_private_data(game)

        await manager.broadcast({
            "type": "round_ended",
            "data": {
                "triggering_card": card,
                "played_by": player.name,
                **round_info
            }
        }, game.code)

        # Then send updated state with new hands
        await manager.broadcast_game_state(state, game.code, private)

        return {
            "status": "round_ended",
            "card": card,
            "round_info": round_info
        }

    if is_double:
        # Broadcast waiting for double
        await manager.broadcast({
            "type": "waiting_for_double",
            "data": {
                "card": card,
                "played_by_id": player.id,
                "played_by_name": player.name,
                "current_offerer_id": player.id
            }
        }, game.code)

        # Send full game state to all players
        state = build_game_state_response(db, game)
        private = get_private_data(game)
        await manager.broadcast_game_state(state, game.code, private)

        return {
            "status": "waiting_for_double",
            "card": card
        }

    # Regular auction
    artist_counts = get_artist_count_this_round(db, game)

    await manager.broadcast({
        "type": "card_played",
        "data": {
            "card": card,
            "played_by_id": player.id,
            "played_by_name": player.name,
            "artist_counts": artist_counts,
            "awaiting_auction_result": True
        }
    }, game.code)

    # Send full game state to all players
    state = build_game_state_response(db, game)
    private = get_private_data(game)
    await manager.broadcast_game_state(state, game.code, private)

    return {
        "status": "awaiting_auction",
        "card": card
    }


@router.post("/{code}/add-double")
async def add_double_route(
    code: str,
    request: AddDoubleRequest,
    db: Session = Depends(get_db)
):
    """Add a second card to a double auction."""
    game = get_game_by_code(db, code)
    player = get_player(game, request.player_id)

    if not game.double_auction_state:
        raise HTTPException(status_code=400, detail="No double auction in progress")

    try:
        second_card, is_round_ending = add_double_card(db, game, player, request.card_index)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if is_round_ending:
        round_info = end_round(db, game)

        state = build_game_state_response(db, game)
        private = get_private_data(game)

        await manager.broadcast({
            "type": "round_ended",
            "data": {
                "triggering_card": second_card,
                "played_by": player.name,
                "was_double_auction": True,
                **round_info
            }
        }, game.code)

        await manager.broadcast_game_state(state, game.code, private)

        return {
            "status": "round_ended",
            "card": second_card,
            "round_info": round_info
        }

    # Double auction ready for bidding
    artist_counts = get_artist_count_this_round(db, game)

    await manager.broadcast({
        "type": "double_auction_ready",
        "data": {
            "second_card": second_card,
            "added_by_id": player.id,
            "added_by_name": player.name,
            "artist_counts": artist_counts,
            "awaiting_auction_result": True
        }
    }, game.code)

    # Send full game state to all players
    state = build_game_state_response(db, game)
    private = get_private_data(game)
    await manager.broadcast_game_state(state, game.code, private)

    return {
        "status": "awaiting_auction",
        "card": second_card
    }


@router.post("/{code}/decline-double")
async def decline_double_route(
    code: str,
    request: DeclineDoubleRequest,
    db: Session = Depends(get_db)
):
    """Decline to add a second card to a double auction."""
    game = get_game_by_code(db, code)
    player = get_player(game, request.player_id)
    players = list(game.players)

    if not game.double_auction_state:
        raise HTTPException(status_code=400, detail="No double auction in progress")

    try:
        all_declined = decline_double(db, game, player, players)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if all_declined:
        # Original player got their card free, move to next turn
        state = build_game_state_response(db, game)
        private = get_private_data(game)

        await manager.broadcast({
            "type": "double_auction_declined",
            "data": {
                "all_declined": True
            }
        }, game.code)

        await manager.broadcast_game_state(state, game.code, private)

        return {"status": "all_declined"}

    # Notify next player to offer
    import json
    double_state = json.loads(game.double_auction_state)

    await manager.broadcast({
        "type": "double_auction_next_offerer",
        "data": {
            "current_offerer_id": double_state["current_offerer_id"],
            "declined_by_id": player.id,
            "declined_by_name": player.name
        }
    }, game.code)

    # Send full game state to all players
    state = build_game_state_response(db, game)
    private = get_private_data(game)
    await manager.broadcast_game_state(state, game.code, private)

    return {
        "status": "next_offerer",
        "current_offerer_id": double_state["current_offerer_id"]
    }


@router.post("/{code}/record-auction")
async def record_auction_route(
    code: str,
    request: RecordAuctionRequest,
    db: Session = Depends(get_db)
):
    """Record the result of an auction."""
    game = get_game_by_code(db, code)
    players = list(game.players)

    if not game.awaiting_auction_result:
        raise HTTPException(status_code=400, detail="No auction pending")

    try:
        record_auction_result(db, game, request.winner_id, request.price, players)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Get winner name
    winner_name = None
    if request.winner_id:
        winner = next((p for p in players if p.id == request.winner_id), None)
        winner_name = winner.name if winner else None

    # Broadcast auction result
    state = build_game_state_response(db, game)
    private = get_private_data(game)

    await manager.broadcast({
        "type": "auction_recorded",
        "data": {
            "winner_id": request.winner_id,
            "winner_name": winner_name,
            "price": request.price
        }
    }, game.code)

    await manager.broadcast_game_state(state, game.code, private)

    return {
        "status": "recorded",
        "winner_id": request.winner_id,
        "price": request.price
    }
