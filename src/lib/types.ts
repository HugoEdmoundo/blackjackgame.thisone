export type Suit = "❤️" | "♣️" | "♠️" | "♦️"
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

export type Card = { rank: Rank; suit: Suit }

export type HandResultType =
  | "player_win" | "dealer_win" | "push"
  | "player_bust" | "dealer_bust"
  | "blackjack_win" | "blackjack_push"
  | "surrender"

export type HandResult = {
  type: HandResultType
  message: string
  payout: number
}

export type Hand = {
  cards: Card[]
  score: number
  bet: number
  isDone: boolean
  isDoubled: boolean
  isSplit: boolean
  isSurrendered: boolean
  result?: HandResult
}

export type PlayerStats = {
  totalGames: number
  totalWins: number
  totalLosses: number
  totalPushes: number
  blackjackCount: number
  currentStreak: number
  bestWinStreak: number
}

export type Player = {
  id: string
  name: string
  hands: Hand[]
  isHost: boolean
  balance: number
  totalBet: number
  insuranceBet: number
  insuranceDecided: boolean
  stats: PlayerStats
}

export type GameStatus = "waiting" | "betting" | "playing" | "finished"

export type GameSettings = {
  minBet: number
  maxBet: number
  maxPlayers: number
  turnTimeout: number
  defaultBet: number
}

export type GameState = {
  id: string
  code: string
  status: GameStatus
  players: Player[]
  dealerHand: Card[]
  dealerScore: number
  currentPlayerIndex: number
  currentHandIndex: number
  deck: Card[]
  createdAt: number
  round: number
  settings: GameSettings
  turnStartedAt: number
  insuranceOffered: boolean
  dealerBlackjack: boolean
  settingsConfigured: boolean
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

export const DEFAULT_SETTINGS: GameSettings = {
  minBet: 10,
  maxBet: 100,
  maxPlayers: 4,
  turnTimeout: 30,
  defaultBet: 10,
}

export const STARTING_BALANCE = 1000
