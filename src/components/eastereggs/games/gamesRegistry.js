// Central registry of all mini-games available in the games hub.
// Each entry: { id, name, emoji, description, component (lazy) }
import { lazy } from 'react'

export const GAMES = [
  {
    id: 'snake',
    name: 'Snake',
    emoji: '🐍',
    description: 'Classic snake. Eat food, grow longer, don\'t hit yourself.',
    component: lazy(() => import('../SnakeGame')),
  },
  {
    id: 'tetris',
    name: 'Tetris',
    emoji: '🧱',
    description: 'Stack falling blocks, clear lines, survive the rising speed.',
    component: lazy(() => import('./Tetris')),
  },
  {
    id: 'pong',
    name: 'Pong',
    emoji: '🏓',
    description: 'First to 7. You vs the AI paddle.',
    component: lazy(() => import('./Pong')),
  },
  {
    id: 'memory',
    name: 'Memory',
    emoji: '🧠',
    description: 'Flip cards, match the pairs. Fewer moves = better.',
    component: lazy(() => import('./Memory')),
  },
  {
    id: '2048',
    name: '2048',
    emoji: '2️⃣',
    description: 'Slide tiles, merge equals, reach 2048.',
    component: lazy(() => import('./Game2048')),
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    emoji: '💣',
    description: 'Reveal cells, flag mines. Numbers show adjacent bombs.',
    component: lazy(() => import('./Minesweeper')),
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    emoji: '⭕',
    description: 'Three in a row vs an unbeatable AI.',
    component: lazy(() => import('./TicTacToe')),
  },
  {
    id: 'flappy',
    name: 'Flappy Bird',
    emoji: '🐦',
    description: 'Tap to flap, dodge the pipes.',
    component: lazy(() => import('./Flappy')),
  },
  {
    id: 'reaction',
    name: 'Reaction Test',
    emoji: '🎯',
    description: 'Click as fast as you can when the screen turns green.',
    component: lazy(() => import('./Reaction')),
  },
  {
    id: 'typing',
    name: 'Typing Test',
    emoji: '⌨️',
    description: '60 seconds. How many words per minute?',
    component: lazy(() => import('./Typing')),
  },
  {
    id: 'simon',
    name: 'Simon Says',
    emoji: '🎨',
    description: 'Watch the pattern, repeat the sequence.',
    component: lazy(() => import('./Simon')),
  },
  {
    id: 'rps',
    name: 'Rock Paper Scissors',
    emoji: '✊',
    description: 'Best of however-many. AI plays random.',
    component: lazy(() => import('./RPS')),
  },
  {
    id: 'guess',
    name: 'Number Guess',
    emoji: '🔢',
    description: 'Guess the number 1-100 in 7 tries.',
    component: lazy(() => import('./NumberGuess')),
  },
]

export function getGame(id) {
  return GAMES.find((g) => g.id === id)
}
