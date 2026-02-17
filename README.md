# Art Auction Game

A web app for playing art auction games virtually with friends over video call.

The app handles card dealing, money tracking, round management, and scoring — while you and your friends run the auctions live over Zoom/Google Meet.

## How It Works

1. One person creates a game and shares the code
2. Friends join using the code
3. Everyone connects via video call
4. On your turn, click a card to play it
5. Run the auction verbally over video
6. Enter the auction result (winner + price) in the app
7. App automatically tracks money, calculates artist values, and handles round endings

## Prerequisites

- **Python 3.11+**
- **Poetry** (Python package manager)
- **Node.js 18+** and npm

### Install Prerequisites (macOS)

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install Node.js
brew install node
```

## Quick Start

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd art-auction-game
```

### 2. Start the Backend

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

### 3. Start the Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

Go to **http://localhost:5173**

## Playing the Game

### Setup
1. One player clicks **Create Game** and enters their name
2. Share the game code (or link) with friends
3. Friends click **Join Game** and enter the code + their name
4. Host clicks **Start Game** when 3-5 players have joined

### Gameplay
- Cards appear at the bottom of your screen
- On your turn, click a card to play it
- The card's auction type is shown
- Run the auction over video call
- Anyone can enter the result: select the winner and price, then click **Record Result**
- The app handles money transfers and tracks everything

## Project Structure

```
art-auction-game/
├── backend/           # Python FastAPI server
│   ├── app/
│   │   ├── main.py        # Entry point
│   │   ├── models.py      # Database models
│   │   ├── game_logic.py  # Game logic
│   │   ├── routes/        # API endpoints
│   │   └── websocket.py   # Real-time updates
│   └── pyproject.toml
├── frontend/          # React application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/    # UI components
│   │   └── websocket.js   # WebSocket hook
│   └── package.json
└── README.md
```

## Tech Stack

- **Backend**: Python, FastAPI, SQLite, WebSockets
- **Frontend**: React, Vite
- **Real-time**: WebSocket for live updates

## Sharing Over the Internet

To play with friends not on your local network, you can use **ngrok**:

```bash
# Install ngrok
brew install ngrok

# Create account at ngrok.com and add auth token
ngrok config add-authtoken YOUR_TOKEN

# Expose your app (run this while backend & frontend are running)
ngrok http 5173
```

Share the ngrok URL with your friends!

## License

MIT
