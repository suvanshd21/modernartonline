"""
Art Auction Game - FastAPI Application
"""

import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import FRONTEND_URL
from .database import get_db, init_db
from .models import Game, Player
from .routes import games, actions
from .routes.games import build_game_state_response, get_private_data
from .websocket import manager

app = FastAPI(title="Art Auction Game", version="1.0.0")

# CORS middleware - allow FRONTEND_URL and localhost for development
cors_origins = [FRONTEND_URL]
if FRONTEND_URL.startswith("http://localhost"):
    # In development, also allow common dev ports
    cors_origins.extend(["http://localhost:5173", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(games.router)
app.include_router(actions.router)


@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "app": "Art Auction Game"}


@app.websocket("/ws/{game_code}/{player_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_code: str,
    player_id: str
):
    """
    WebSocket endpoint for real-time game updates.

    On connect: sends current game state
    On message: handles ping/pong
    Broadcasts: game state changes from API calls
    """
    # Get database session
    db = next(get_db())

    try:
        # Verify game and player exist
        game = db.query(Game).filter(Game.code == game_code.upper()).first()
        if not game:
            await websocket.close(code=4004, reason="Game not found")
            return

        player = next((p for p in game.players if p.id == player_id), None)
        if not player:
            await websocket.close(code=4003, reason="Player not found")
            return

        # Accept connection
        await manager.connect(websocket, game.code, player_id)

        # Mark player as connected
        player.is_connected = True
        db.commit()

        # Send current game state
        state = build_game_state_response(db, game)
        private = get_private_data(game)

        await websocket.send_json({
            "type": "game_state",
            "data": {
                **state,
                "your_hand": private.get(player_id, {}).get("hand", []),
                "your_money": private.get(player_id, {}).get("money", 0),
                "your_player_id": player_id
            }
        })

        # Notify others of reconnection
        await manager.broadcast(
            {
                "type": "player_reconnected",
                "data": {"player_id": player_id, "player_name": player.name}
            },
            game.code,
            exclude_player_id=player_id
        )

        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Handle ping/pong
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        manager.disconnect(game.code, player_id)

        # Mark player as disconnected
        player = db.query(Player).filter(Player.id == player_id).first()
        if player:
            player.is_connected = False
            db.commit()

        # Notify others
        await manager.broadcast(
            {
                "type": "player_disconnected",
                "data": {"player_id": player_id}
            },
            game.code
        )

    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
