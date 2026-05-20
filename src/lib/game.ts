import { Card, Rank, Suit, Player, GameState, GameResult } from "./types"

const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const SUITS: Suit[] = ["❤️", "♣️", "♠️", "♦️"]

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function calculateHand(hand: Card[]): number {
  let total = 0
  let aces = 0
  for (const card of hand) {
    if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
      total += 10
    } else if (card.rank === "A") {
      total += 11
      aces++
    } else {
      total += parseInt(card.rank)
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

export function dealerShouldHit(dealerHand: Card[]): boolean {
  return calculateHand(dealerHand) < 17
}

export function determineWinner(players: Player[], dealerScore: number): GameResult[] {
  return players.map((player) => {
    const ps = player.score
    if (ps > 21 && dealerScore > 21) {
      return { type: "dealer_win", message: `${player.name} bust! Dealer Win!` }
    }
    if (ps > 21) {
      return { type: "player_bust", message: `${player.name} bust! Dealer Win!` }
    }
    if (dealerScore > 21) {
      return { type: "dealer_bust", message: `Dealer bust! ${player.name} Win!` }
    }
    if (ps === dealerScore) {
      if (ps === 21 && player.hand.length === 2 && dealerScore === 21) {
        return { type: "blackjack_push", message: `${player.name}: Both Blackjack! Push` }
      }
      return { type: "push", message: `${player.name}: Push (${ps})` }
    }
    if (ps === 21 && player.hand.length === 2) {
      return { type: "blackjack_win", message: `Blackjack! ${player.name} Win!` }
    }
    if (ps > dealerScore) {
      return { type: "player_win", message: `${player.name} Win! (${ps} vs ${dealerScore})` }
    }
    return { type: "dealer_win", message: `Dealer Win! ${player.name} lose (${ps} vs ${dealerScore})` }
  })
}

export function playDealerTurn(deck: Card[], dealerHand: Card[]): void {
  while (dealerShouldHit(dealerHand)) {
    const card = deck.pop()
    if (card) dealerHand.push(card)
  }
}

export function dealInitialCards(deck: Card[], hands: Card[][]): void {
  for (const hand of hands) {
    const card1 = deck.pop()
    const card2 = deck.pop()
    if (card1 && card2) {
      hand.push(card1, card2)
    }
  }
}

export function runDealerSequence(deck: Card[], players: Player[]): {
  dealerHand: Card[]
  dealerScore: number
  players: Player[]
} {
  const dealerHand: Card[] = []
  const card1 = deck.pop()
  const card2 = deck.pop()
  if (card1 && card2) dealerHand.push(card1, card2)
  playDealerTurn(deck, dealerHand)
  const dealerScore = calculateHand(dealerHand)
  const results = determineWinner(players, dealerScore)
  return {
    dealerHand,
    dealerScore,
    players: players.map((p, i) => ({ ...p, result: results[i] })),
  }
}

export function formatHand(hand: Card[]): string {
  return hand.map((c) => `[${c.rank}${c.suit}]`).join(" ")
}
