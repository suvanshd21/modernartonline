"""
WebSocket connection manager for real-time updates.
"""

import json
from typing import Optional
from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections per game."""

    def __init__(self):
        # game_code -> {player_id -> WebSocket}
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, game_code: str, player_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        if game_code not in self.active_connections:
            self.active_connections[game_code] = {}
        self.active_connections[game_code][player_id] = websocket

    def disconnect(self, game_code: str, player_id: str):
        """Remove a WebSocket connection."""
        if game_code in self.active_connections:
            self.active_connections[game_code].pop(player_id, None)
            if not self.active_connections[game_code]:
                del self.active_connections[game_code]

    async def send_personal_message(self, message: dict, game_code: str, player_id: str):
        """Send a message to a specific player."""
        if game_code in self.active_connections:
            websocket = self.active_connections[game_code].get(player_id)
            if websocket:
                await websocket.send_json(message)

    async def broadcast(self, message: dict, game_code: str, exclude_player_id: Optional[str] = None):
        """Broadcast a message to all players in a game."""
        if game_code in self.active_connections:
            for player_id, websocket in self.active_connections[game_code].items():
                if player_id != exclude_player_id:
                    try:
                        await websocket.send_json(message)
                    except Exception:
                        # Connection might be closed
                        pass

    async def broadcast_game_state(self, game_state: dict, game_code: str, private_data: dict[str, dict]):
        """
        Broadcast game state to all players, with private data (hand, money) per player.

        game_state: Public game state
        private_data: {player_id: {"hand": [...], "money": int}}
        """
        if game_code in self.active_connections:
            for player_id, websocket in self.active_connections[game_code].items():
                try:
                    # Merge public state with this player's private data
                    message = {
                        "type": "game_state",
                        "data": {
                            **game_state,
                            "your_hand": private_data.get(player_id, {}).get("hand", []),
                            "your_money": private_data.get(player_id, {}).get("money", 0),
                            "your_player_id": player_id
                        }
                    }
                    await websocket.send_json(message)
                except Exception:
                    pass

    def get_connected_players(self, game_code: str) -> list[str]:
        """Get list of connected player IDs for a game."""
        if game_code in self.active_connections:
            return list(self.active_connections[game_code].keys())
        return []


# Global connection manager instance
manager = ConnectionManager()
