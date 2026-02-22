"""
Core game logic for Art Auction Game.

Handles:
- Deck shuffling and dealing
- Money transfers
- Round-end detection
- Artist ranking and value assignment
- Payout calculations
"""

import json
import random
from typing import Optional
from sqlalchemy.orm import Session

from .models import Game, Player, CardInPlay, ArtistValue, Transaction
from .cards import DECK, CARDS_PER_ROUND, ARTISTS, get_deck_copy
from .schemas import Card, DoubleAuctionState


def _log_transaction(db, game, txn_type, amount, description,
                     from_player_id=None, to_player_id=None):
    """Append a Transaction row. Does NOT commit — piggybacks on caller's commit."""
    db.add(Transaction(
        game_id=game.id,
        round=game.current_round,
        txn_type=txn_type,
        amount=amount,
        description=description,
        from_player_id=from_player_id,
        to_player_id=to_player_id,
    ))


def shuffle_deck() -> list[dict]:
    """Shuffle and return a new deck."""
    deck = get_deck_copy()
    random.shuffle(deck)
    return deck


def deal_cards(deck: list[dict], num_cards: int) -> tuple[list[dict], list[dict]]:
    """
    Deal cards from the deck.
    Returns (dealt_cards, remaining_deck).
    """
    dealt = deck[:num_cards]
    remaining = deck[num_cards:]
    return dealt, remaining


def get_cards_to_deal(player_count: int, round_num: int) -> int:
    """Get number of cards to deal for a given player count and round."""
    if player_count not in CARDS_PER_ROUND:
        raise ValueError(f"Invalid player count: {player_count}")
    if round_num < 1 or round_num > 4:
        raise ValueError(f"Invalid round number: {round_num}")
    return CARDS_PER_ROUND[player_count][round_num - 1]


def start_game(db: Session, game: Game) -> None:
    """
    Initialize game state when starting:
    - Shuffle deck
    - Deal initial cards to players
    - Set current round to 1
    - Set first player's turn
    """
    players = sorted(game.players, key=lambda p: p.turn_order or 0)
    player_count = len(players)

    if player_count < 3 or player_count > 5:
        raise ValueError(f"Need 3-5 players, got {player_count}")

    # Shuffle deck
    deck = shuffle_deck()

    # Deal initial cards
    cards_per_player = get_cards_to_deal(player_count, 1)
    for player in players:
        dealt, deck = deal_cards(deck, cards_per_player)
        player.hand = json.dumps(dealt)

    # Update game state
    game.deck = json.dumps(deck)
    game.current_round = 1
    game.status = "in_progress"
    game.current_turn_player_id = players[0].id

    db.commit()


def get_player_hand(player: Player) -> list[dict]:
    """Get player's hand as a list of card dicts."""
    if not player.hand:
        return []
    return json.loads(player.hand)


def set_player_hand(player: Player, hand: list[dict]) -> None:
    """Set player's hand from a list of card dicts."""
    player.hand = json.dumps(hand)


def get_game_deck(game: Game) -> list[dict]:
    """Get remaining deck as a list of card dicts."""
    if not game.deck:
        return []
    return json.loads(game.deck)


def get_artist_count_this_round(db: Session, game: Game) -> dict[str, int]:
    """Count paintings played per artist in the current round."""
    cards = db.query(CardInPlay).filter(
        CardInPlay.game_id == game.id,
        CardInPlay.round == game.current_round
    ).all()

    counts = {artist: 0 for artist in ARTISTS}
    for card in cards:
        counts[card.artist] += 1
    return counts


def check_round_end(db: Session, game: Game, artist: str, cards_being_added: int = 1) -> bool:
    """
    Check if playing card(s) of this artist ends the round.

    Args:
        cards_being_added: Number of cards being added (1 for normal, 2 for double auction)

    Returns True if adding these cards would reach or exceed 5 for this artist.
    """
    counts = get_artist_count_this_round(db, game)
    current_count = counts.get(artist, 0)
    return current_count + cards_being_added >= 5


def play_card(
    db: Session,
    game: Game,
    player: Player,
    card_index: int
) -> tuple[dict, bool, bool]:
    """
    Play a card from player's hand.

    Returns: (card_played, is_round_ending, is_double_auction)
    """
    hand = get_player_hand(player)
    if card_index < 0 or card_index >= len(hand):
        raise ValueError("Invalid card index")

    card = hand.pop(card_index)
    set_player_hand(player, hand)

    # Check if this will end the round
    is_round_ending = check_round_end(db, game, card["artist"])

    # Check if it's a double auction
    is_double = card["auction_type"] == "double"

    if is_round_ending:
        # Card ends the round - not auctioned, no owner
        card_in_play = CardInPlay(
            game_id=game.id,
            round=game.current_round,
            artist=card["artist"],
            auction_type=card["auction_type"],
            owner_id=None,  # Unsold
            price_paid=None,
            played_by_id=player.id
        )
        db.add(card_in_play)
        db.commit()
        return card, True, False

    if is_double:
        # Start double auction state
        double_state = {
            "first_card": card,
            "played_by_id": player.id,
            "played_by_name": player.name,
            "current_offerer_id": player.id,  # Original player gets first chance
            "second_card": None,
            "second_card_player_id": None,
            "declined_player_ids": []
        }
        game.double_auction_state = json.dumps(double_state)
        db.commit()
        return card, False, True

    # Regular auction - add card to play, await auction result
    card_in_play = CardInPlay(
        game_id=game.id,
        round=game.current_round,
        artist=card["artist"],
        auction_type=card["auction_type"],
        owner_id=None,  # Will be set after auction
        price_paid=None,
        played_by_id=player.id
    )
    db.add(card_in_play)
    game.awaiting_auction_result = True
    db.commit()

    return card, False, False


def get_double_auction_state(game: Game) -> Optional[DoubleAuctionState]:
    """Get the current double auction state if any."""
    if not game.double_auction_state:
        return None
    state = json.loads(game.double_auction_state)
    return DoubleAuctionState(
        first_card=Card(**state["first_card"]),
        played_by_id=state["played_by_id"],
        played_by_name=state["played_by_name"],
        current_offerer_id=state.get("current_offerer_id"),
        second_card=Card(**state["second_card"]) if state.get("second_card") else None,
        second_card_player_id=state.get("second_card_player_id")
    )


def add_double_card(
    db: Session,
    game: Game,
    player: Player,
    card_index: int
) -> tuple[dict, bool]:
    """
    Add a second card to a double auction.

    Returns: (card_added, is_round_ending)
    """
    if not game.double_auction_state:
        raise ValueError("No double auction in progress")

    state = json.loads(game.double_auction_state)
    first_card = state["first_card"]

    hand = get_player_hand(player)
    if card_index < 0 or card_index >= len(hand):
        raise ValueError("Invalid card index")

    second_card = hand[card_index]

    # Validate: must be same artist, cannot be another double
    if second_card["artist"] != first_card["artist"]:
        raise ValueError("Second card must be same artist")
    if second_card["auction_type"] == "double":
        raise ValueError("Cannot use another double card")

    # Remove from hand
    hand.pop(card_index)
    set_player_hand(player, hand)

    # Check if adding BOTH cards ends the round (first double card + second card = 2 cards)
    is_round_ending = check_round_end(db, game, second_card["artist"], cards_being_added=2)

    if is_round_ending:
        # Both cards are unsold
        for card_data in [first_card, second_card]:
            card_in_play = CardInPlay(
                game_id=game.id,
                round=game.current_round,
                artist=card_data["artist"],
                auction_type=card_data["auction_type"],
                owner_id=None,
                price_paid=None,
                played_by_id=player.id if card_data == second_card else state["played_by_id"]
            )
            db.add(card_in_play)

        game.double_auction_state = None
        db.commit()
        return second_card, True

    # Add both cards to play (auction will happen)
    for card_data, played_by in [(first_card, state["played_by_id"]), (second_card, player.id)]:
        card_in_play = CardInPlay(
            game_id=game.id,
            round=game.current_round,
            artist=card_data["artist"],
            auction_type=card_data["auction_type"],
            owner_id=None,
            price_paid=None,
            played_by_id=played_by
        )
        db.add(card_in_play)

    # Clear double state, set awaiting auction
    # The player who added the second card becomes the "auctioneer" for payment purposes
    state["second_card"] = second_card
    state["second_card_player_id"] = player.id
    game.double_auction_state = json.dumps(state)
    game.awaiting_auction_result = True
    db.commit()

    return second_card, False


def decline_double(db: Session, game: Game, player: Player, players: list[Player]) -> bool:
    """
    Player declines to add a second card to double auction.
    Returns True if all players declined (original player gets card free).
    """
    if not game.double_auction_state:
        raise ValueError("No double auction in progress")

    state = json.loads(game.double_auction_state)
    declined = state.get("declined_player_ids", [])
    declined.append(player.id)
    state["declined_player_ids"] = declined

    # Find next player clockwise who hasn't declined
    sorted_players = sorted(players, key=lambda p: p.turn_order or 0)
    original_player_order = next(
        (p.turn_order for p in sorted_players if p.id == state["played_by_id"]),
        0
    )

    # Start from player after original, go around
    for i in range(1, len(sorted_players) + 1):
        idx = (original_player_order + i) % len(sorted_players)
        candidate = sorted_players[idx]
        if candidate.id not in declined and candidate.id != state["played_by_id"]:
            # Check if candidate has a valid card to add
            hand = get_player_hand(candidate)
            has_valid = any(
                c["artist"] == state["first_card"]["artist"] and c["auction_type"] != "double"
                for c in hand
            )
            if has_valid:
                state["current_offerer_id"] = candidate.id
                game.double_auction_state = json.dumps(state)
                db.commit()
                return False

    # All declined or no valid cards - original player gets their card free
    first_card = state["first_card"]
    original_player_name = next(
        (p.name for p in players if p.id == state["played_by_id"]),
        state["played_by_id"]
    )
    _log_transaction(db, game, "free_card", 0,
        f"{original_player_name} received {first_card['artist']} (double) "
        f"for free — all others declined",
        from_player_id=None, to_player_id=state["played_by_id"])
    card_in_play = CardInPlay(
        game_id=game.id,
        round=game.current_round,
        artist=first_card["artist"],
        auction_type=first_card["auction_type"],
        owner_id=state["played_by_id"],  # Original player gets it
        price_paid=0,
        played_by_id=state["played_by_id"]
    )
    db.add(card_in_play)
    game.double_auction_state = None

    # Move to next turn
    advance_turn(db, game, players)
    db.commit()

    return True


def record_auction_result(
    db: Session,
    game: Game,
    winner_id: Optional[str],
    price: int,
    players: list[Player]
) -> None:
    """
    Record the result of an auction.

    - Transfer money from winner to auctioneer (or bank if auctioneer won)
    - Assign card ownership
    - Advance turn
    """
    # Get the most recent unowned card(s) - could be 2 for double auction
    cards = db.query(CardInPlay).filter(
        CardInPlay.game_id == game.id,
        CardInPlay.round == game.current_round,
        CardInPlay.owner_id.is_(None)
    ).order_by(CardInPlay.id.desc()).all()

    if not cards:
        raise ValueError("No pending auction")

    # Determine who played the card (auctioneer)
    double_state = json.loads(game.double_auction_state) if game.double_auction_state else None

    if double_state and double_state.get("second_card"):
        # Double auction - the person who added second card is the "auctioneer"
        auctioneer_id = double_state["second_card_player_id"]
    else:
        # Regular auction - the person who played the card
        auctioneer_id = cards[0].played_by_id

    auctioneer = next((p for p in players if p.id == auctioneer_id), None)

    if winner_id:
        winner = next((p for p in players if p.id == winner_id), None)
        if not winner:
            raise ValueError("Winner not found")

        if price > winner.money:
            raise ValueError("Winner cannot afford this price")

        # Transfer money
        if winner_id == auctioneer_id:
            # Auctioneer bought their own - pay to bank
            winner.money -= price
            _log_transaction(db, game, "self_buy", price,
                f"{winner.name} self-bought {cards[0].artist} ({cards[0].auction_type}) "
                f"for {price}k (paid to bank)",
                from_player_id=winner_id, to_player_id=None)
        else:
            # Pay to auctioneer
            winner.money -= price
            if auctioneer:
                auctioneer.money += price
            _log_transaction(db, game, "auction_sale", price,
                f"{winner.name} bought {cards[0].artist} "
                f"({'double ' if len(cards) > 1 else ''}{cards[0].auction_type}) "
                f"from {auctioneer.name if auctioneer else 'unknown'} for {price}k",
                from_player_id=winner_id, to_player_id=auctioneer_id)

        # Assign cards to winner
        for card in cards:
            card.owner_id = winner_id
            card.price_paid = price // len(cards)  # Split price if double
    else:
        # No winner - auctioneer gets free (except fixed price)
        # For fixed price, auctioneer must pay their own price
        if cards[0].auction_type == "fixed_price":
            if auctioneer and price > 0:
                if price > auctioneer.money:
                    raise ValueError("Auctioneer cannot afford their own price")
                auctioneer.money -= price
                _log_transaction(db, game, "fixed_price_no_sale", price,
                    f"{auctioneer.name if auctioneer else 'unknown'} paid {price}k to bank "
                    f"(fixed-price unsold: {cards[0].artist})",
                    from_player_id=auctioneer_id, to_player_id=None)
        else:
            _log_transaction(db, game, "free_card", 0,
                f"{auctioneer.name if auctioneer else 'unknown'} received "
                f"{cards[0].artist} ({cards[0].auction_type}) for free (no bids)",
                from_player_id=None, to_player_id=auctioneer_id)

        for card in cards:
            card.owner_id = auctioneer_id
            card.price_paid = 0

    # Clear auction state
    game.awaiting_auction_result = False
    game.double_auction_state = None

    # Advance turn from the auctioneer (for double auctions, this is the second card player)
    game.current_turn_player_id = auctioneer_id
    advance_turn(db, game, players)
    db.commit()


def advance_turn(db: Session, game: Game, players: list[Player]) -> None:
    """Move to the next player's turn."""
    sorted_players = sorted(players, key=lambda p: p.turn_order or 0)
    current_idx = next(
        (i for i, p in enumerate(sorted_players) if p.id == game.current_turn_player_id),
        0
    )
    next_idx = (current_idx + 1) % len(sorted_players)
    game.current_turn_player_id = sorted_players[next_idx].id


def end_round(db: Session, game: Game, round_ending_player_id: str = None) -> dict:
    """
    Process end of round:
    - Rank artists by paintings sold
    - Assign value tiles
    - Calculate and distribute payouts
    - Deal new cards for next round

    Args:
        round_ending_player_id: The player who played the round-ending card.
                               Next round's turn goes to the player after them.

    Returns info about the round end.
    """
    players = list(game.players)
    player_count = len(players)

    # Count paintings per artist this round
    counts = get_artist_count_this_round(db, game)

    # Rank artists (ties broken by board position - leftmost wins)
    ranked = sorted(
        [(artist, count) for artist, count in counts.items() if count > 0],
        key=lambda x: (-x[1], ARTISTS.index(x[0]))
    )

    # Assign values: 1st=30, 2nd=20, 3rd=10
    values = [30, 20, 10]
    rankings = []
    new_values = {}

    for i, (artist, count) in enumerate(ranked[:3]):
        value = values[i]
        av = ArtistValue(
            game_id=game.id,
            artist=artist,
            round=game.current_round,
            value=value
        )
        db.add(av)
        rankings.append({"artist": artist, "count": count, "value": value})
        new_values[artist] = value

    db.flush()

    # Calculate cumulative values for each artist
    cumulative = get_cumulative_artist_values(db, game)

    # Calculate payouts
    payouts = []
    cards_this_round = db.query(CardInPlay).filter(
        CardInPlay.game_id == game.id,
        CardInPlay.round == game.current_round,
        CardInPlay.owner_id.isnot(None)
    ).all()

    for player in players:
        player_cards = [c for c in cards_this_round if c.owner_id == player.id]
        total_payout = sum(cumulative.get(c.artist, 0) for c in player_cards if c.artist in new_values)
        player.money += total_payout
        if total_payout > 0:
            card_summary = ", ".join(
                f"{c.artist} ({cumulative.get(c.artist, 0)}k)"
                for c in player_cards if c.artist in new_values
            )
            _log_transaction(db, game, "round_payout", total_payout,
                f"Round {game.current_round} payout to {player.name}: "
                f"{total_payout}k [{card_summary}]",
                from_player_id=None, to_player_id=player.id)
            payouts.append({
                "player_id": player.id,
                "player_name": player.name,
                "amount": total_payout
            })

    # Check if game is over
    if game.current_round >= 4:
        game.status = "finished"
        db.commit()
        return {
            "rankings": rankings,
            "payouts": payouts,
            "new_values": new_values,
            "cumulative_values": cumulative,
            "game_over": True
        }

    # Deal new cards for next round
    game.current_round += 1
    cards_to_deal = get_cards_to_deal(player_count, game.current_round)

    if cards_to_deal > 0:
        deck = get_game_deck(game)
        for player in players:
            dealt, deck = deal_cards(deck, cards_to_deal)
            current_hand = get_player_hand(player)
            current_hand.extend(dealt)
            set_player_hand(player, current_hand)
        game.deck = json.dumps(deck)

    # Advance turn to next player after whoever played the round-ending card
    sorted_players = sorted(players, key=lambda p: p.turn_order or 0)
    if round_ending_player_id:
        # Find the player who ended the round and advance from them
        game.current_turn_player_id = round_ending_player_id
        advance_turn(db, game, players)
    else:
        # Fallback: start with first player
        game.current_turn_player_id = sorted_players[0].id

    db.commit()

    return {
        "rankings": rankings,
        "payouts": payouts,
        "new_values": new_values,
        "cumulative_values": cumulative,
        "game_over": False
    }


def get_cumulative_artist_values(db: Session, game: Game) -> dict[str, int]:
    """Get total value for each artist across all rounds."""
    values = db.query(ArtistValue).filter(ArtistValue.game_id == game.id).all()
    cumulative = {artist: 0 for artist in ARTISTS}
    for av in values:
        cumulative[av.artist] += av.value
    return cumulative


def get_artist_values_by_round(db: Session, game: Game) -> dict[str, dict[int, int]]:
    """Get artist values organized by round."""
    values = db.query(ArtistValue).filter(ArtistValue.game_id == game.id).all()
    result = {artist: {} for artist in ARTISTS}
    for av in values:
        result[av.artist][av.round] = av.value
    return result
