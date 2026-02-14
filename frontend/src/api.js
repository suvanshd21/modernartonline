/**
 * API helper functions for Modern Art Online
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

// Game management
export async function createGame(hostName) {
  return request('/games', {
    method: 'POST',
    body: JSON.stringify({ host_name: hostName }),
  });
}

export async function joinGame(code, playerName) {
  return request(`/games/${code}/join`, {
    method: 'POST',
    body: JSON.stringify({ player_name: playerName }),
  });
}

export async function getGameState(code, playerId) {
  return request(`/games/${code}?player_id=${playerId}`);
}

export async function startGame(code, playerId) {
  return request(`/games/${code}/start?player_id=${playerId}`, {
    method: 'POST',
  });
}

// Game actions
export async function playCard(code, playerId, cardIndex) {
  return request(`/games/${code}/play-card`, {
    method: 'POST',
    body: JSON.stringify({ player_id: playerId, card_index: cardIndex }),
  });
}

export async function addDoubleCard(code, playerId, cardIndex) {
  return request(`/games/${code}/add-double`, {
    method: 'POST',
    body: JSON.stringify({ player_id: playerId, card_index: cardIndex }),
  });
}

export async function declineDouble(code, playerId) {
  return request(`/games/${code}/decline-double`, {
    method: 'POST',
    body: JSON.stringify({ player_id: playerId }),
  });
}

export async function recordAuction(code, winnerId, price) {
  return request(`/games/${code}/record-auction`, {
    method: 'POST',
    body: JSON.stringify({ winner_id: winnerId, price: price }),
  });
}
