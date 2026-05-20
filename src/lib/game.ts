import { Card, Rank, Suit, Player, GameState, Hand, HandResultType } from "./types"

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

export function dealerHasBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHand(hand) === 21
}

export function canSplit(hand: Hand): boolean {
  if (hand.cards.length !== 2) return false
  if (hand.isSplit) return false
  const rank1 = hand.cards[0].rank
  const rank2 = hand.cards[1].rank
  return rank1 === rank2
}

export function canDoubleDown(hand: Hand): boolean {
  return hand.cards.length === 2 && !hand.isDoubled && !hand.isSplit
}

export function canSurrender(hand: Hand): boolean {
  return hand.cards.length === 2 && !hand.isSplit && !hand.isDoubled && !hand.isSurrendered
}

export function canTakeInsurance(game: GameState): boolean {
  if (game.insuranceOffered) return false
  if (game.dealerHand.length === 0) return false
  const upcard = game.dealerHand[0]
  return upcard.rank === "A"
}

export function createInitialHand(cards: Card[], bet: number): Hand {
  return {
    cards: [...cards],
    score: calculateHand(cards),
    bet,
    isDone: false,
    isDoubled: false,
    isSplit: false,
    isSurrendered: false,
  }
}

export function dealInitialCards(deck: Card[], playerCount: number): Card[][] {
  const hands: Card[][] = []
  for (let i = 0; i < playerCount; i++) {
    const card1 = deck.pop()
    const card2 = deck.pop()
    hands.push(card1 && card2 ? [card1, card2] : [])
  }
  return hands
}

export function playDealerTurn(deck: Card[], dealerHand: Card[]): void {
  while (dealerShouldHit(dealerHand)) {
    const card = deck.pop()
    if (card) dealerHand.push(card)
  }
}

function calculatePayout(type: HandResultType, bet: number): number {
  switch (type) {
    case "blackjack_win": return bet + Math.floor(bet * 1.5)
    case "player_win":
    case "dealer_bust": return bet * 2
    case "push":
    case "blackjack_push": return bet
    case "surrender": return Math.floor(bet / 2)
    case "player_bust":
    case "dealer_win":
    default: return 0
  }
}

export function determineWinner(
  players: Player[],
  dealerScore: number,
  dealerBlackjack: boolean
): void {
  for (const player of players) {
    for (const hand of player.hands) {
      if (hand.isSurrendered) {
        hand.result = {
          type: "surrender",
          message: `${player.name} Surrender -${Math.floor(hand.bet / 2)}`,
          payout: calculatePayout("surrender", hand.bet),
        }
        continue
      }

      const ps = hand.score
      const ds = dealerScore

      if (ps > 21) {
        hand.result = {
          type: "player_bust",
          message: `${player.name} Bust! -${hand.bet}`,
          payout: calculatePayout("player_bust", hand.bet),
        }
      } else if (ds > 21) {
        hand.result = {
          type: "dealer_bust",
          message: `Dealer Bust! ${player.name} Win! +${hand.bet}`,
          payout: calculatePayout("dealer_bust", hand.bet),
        }
      } else if (dealerBlackjack && ps === 21) {
        hand.result = {
          type: "blackjack_push",
          message: `${player.name}: Both Blackjack! Push 0`,
          payout: calculatePayout("blackjack_push", hand.bet),
        }
      } else if (dealerBlackjack) {
        hand.result = {
          type: "dealer_win",
          message: `Dealer Blackjack! ${player.name} Lose -${hand.bet}`,
          payout: calculatePayout("dealer_win", hand.bet),
        }
      } else if (ps === 21 && hand.cards.length === 2) {
        hand.result = {
          type: "blackjack_win",
          message: `Blackjack! ${player.name} Win! +${Math.floor(hand.bet * 1.5)}`,
          payout: calculatePayout("blackjack_win", hand.bet),
        }
      } else if (ps > ds) {
        hand.result = {
          type: "player_win",
          message: `${player.name} Win! +${hand.bet}`,
          payout: calculatePayout("player_win", hand.bet),
        }
      } else if (ps === ds) {
        hand.result = {
          type: "push",
          message: `${player.name}: Push (${ps}) 0`,
          payout: calculatePayout("push", hand.bet),
        }
      } else {
        hand.result = {
          type: "dealer_win",
          message: `${player.name} Lose -${hand.bet}`,
          payout: calculatePayout("dealer_win", hand.bet),
        }
      }
    }
  }
}

function processInsurancePayout(player: Player, dealerHasBlackjack: boolean): number {
  if (player.insuranceBet === 0) return 0
  if (dealerHasBlackjack) {
    return player.insuranceBet * 3
  }
  return 0
}

export function runDealerSequence(
  deck: Card[],
  players: Player[],
  dealerHand: Card[],
  dealerBlackjack: boolean,
): {
  dealerHand: Card[]
  dealerScore: number
  players: Player[]
} {
  if (!dealerBlackjack) {
    playDealerTurn(deck, dealerHand)
  }

  const dealerScore = calculateHand(dealerHand)
  determineWinner(players, dealerScore, dealerBlackjack)

  for (const player of players) {
    let netPayout = 0
    for (const hand of player.hands) {
      if (hand.result) netPayout += hand.result.payout
    }
    netPayout += processInsurancePayout(player, dealerBlackjack)
    player.balance += netPayout
    player.insuranceBet = 0

    updatePlayerStats(player, dealerBlackjack)
  }

  return {
    dealerHand,
    dealerScore,
    players,
  }
}

function updatePlayerStats(player: Player, _dealerHasBJ: boolean): void {
  player.stats.totalGames++
  let hasWin = false
  let hasPush = false

  for (const hand of player.hands) {
    if (!hand.result) continue
    const rt = hand.result.type
    if (rt === "blackjack_win" || rt === "blackjack_push") {
      player.stats.blackjackCount++
    }
    if (rt === "player_win" || rt === "dealer_bust" || rt === "blackjack_win") {
      hasWin = true
    }
    if (rt === "push" || rt === "blackjack_push") {
      hasPush = true
    }
  }

  if (hasWin) {
    player.stats.totalWins++
    player.stats.currentStreak = Math.max(player.stats.currentStreak, 0) + 1
    player.stats.bestWinStreak = Math.max(player.stats.bestWinStreak, player.stats.currentStreak)
  } else if (hasPush) {
    player.stats.totalPushes++
    player.stats.currentStreak = 0
  } else {
    player.stats.totalLosses++
    player.stats.currentStreak = Math.min(player.stats.currentStreak, 0) - 1
  }
}

export function hasPlayerDoneAllHands(player: Player): boolean {
  return player.hands.every((h) => h.isDone)
}

export function getCurrentHand(player: Player, handIndex: number): Hand | null {
  if (handIndex >= player.hands.length) return null
  return player.hands[handIndex]
}

export function formatHand(hand: Card[]): string {
  return hand.map((c) => `[${c.rank}${c.suit}]`).join(" ")
}
