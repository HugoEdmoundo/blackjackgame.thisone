export type Suit = "❤️" | "♣️" | "♠️" | "♦️"
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

export type Card = { rank: Rank; suit: Suit }

export type Player = {
  id: string
  name: string
  hand: Card[]
  score: number
  isDone: boolean
  isHost: boolean
  result?: GameResult
}

export type GameStatus = "waiting" | "playing" | "finished"

export type GameResult = {
  type: "player_win" | "dealer_win" | "push" | "player_bust" | "dealer_bust" | "blackjack_win" | "blackjack_push"
  message: string
}

export type GameState = {
  id: string
  code: string
  status: GameStatus
  players: Player[]
  dealerHand: Card[]
  dealerScore: number
  currentPlayerIndex: number
  deck: Card[]
  result: GameResult | null
  createdAt: number
}

export type Room = {
  id: string
  code: string
  game: GameState
}

export type ActionResponse = {
  success: boolean
  error?: string
  game?: GameState
}
