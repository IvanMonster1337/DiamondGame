import { GameState, Side } from '@/common/types/game'
import type { Grid } from '@/common/types/grid'
import { io } from 'socket.io-client'
import { reactive } from 'vue'

type GameStore = {
  clientId: string
  gameId: string
  side: Side | ''
  gameState: GameState | null
  currentPlayer: Side | ''
  winner: Side | ''
  joinError: string
  grid: Grid | null
  hostScore: string
  guestScore: string
  isConnected: boolean
  setClientId(id: string): void
  setGameId(id: string): void
  unsetGameId(): void
  clearGame(): void
}

export const store: GameStore = reactive({
  clientId: localStorage.getItem('clientId') ?? '',
  gameId: localStorage.getItem('gameId') ?? '',
  gameState: null,
  side: '',
  winner: '',
  currentPlayer: '',
  joinError: '',
  grid: null,
  hostScore: '',
  guestScore: '',
  isConnected: false,
  setClientId(id: string) {
    this.clientId = id
    localStorage.setItem('clientId', id)
  },
  setGameId(id: string) {
    this.gameId = id
    localStorage.setItem('gameId', id)
  },
  unsetGameId() {
    this.gameId = ''
    localStorage.removeItem('gameId')
  },
  clearGame() {
    this.unsetGameId()
    this.joinError = ''
    this.gameState = null
    this.side = ''
    this.currentPlayer = ''
    this.grid = null
    this.hostScore = ''
    this.guestScore = ''
    this.winner = ''
  }
})

export const socket = io('http://localhost:3001', {
  query: { clientId: store.clientId, gameId: store.gameId }
})

socket.on('connected', (msg) => {
  const { clientId } = msg
  store.isConnected = true
  store.setClientId(clientId)
})

socket.on('gameStarted', (msg) => {
  const { grid, id, currentPlayer, state, hostScore, guestScore } = msg
  store.grid = grid
  store.gameState = state
  store.currentPlayer = currentPlayer
  store.hostScore = hostScore
  store.guestScore = guestScore
  store.setGameId(id)
})

socket.on('gameUpdated', (msg) => {
  const { grid, currentPlayer, state, hostScore, guestScore } = msg
  store.grid = grid
  store.gameState = state
  store.currentPlayer = currentPlayer
  store.hostScore = hostScore
  store.guestScore = guestScore
})

socket.on('gameFinished', (msg) => {
  const { grid, winner, state, hostScore, guestScore } = msg
  store.grid = grid
  store.gameState = GameState.FINISHED
  store.winner = winner
  store.hostScore = hostScore
  store.guestScore = guestScore
})

socket.on('disconnect', () => {
  store.isConnected = false
})

socket.on('joinError', (msg) => {
  store.joinError = msg
  setTimeout(() => store.clearGame(), 3000)
})

socket.on('gameOutdated', () => {
  store.clearGame()
})

socket.on('gameRejoin', (msg) => {
  const { state, grid, side, currentPlayer, hostScore, guestScore } = msg
  if (state === GameState.IN_PROGRESS) {
    store.grid = grid
    store.side = side
    store.currentPlayer = currentPlayer
    store.hostScore = hostScore
    store.guestScore = guestScore
  }
  store.gameState = state
})
