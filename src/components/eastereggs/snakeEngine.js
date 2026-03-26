// =============================================
// Snake Game Engine — pure logic, no rendering
// =============================================

export const GRID = 20
export const CELL = 20
export const MAX_SCORE = (GRID * GRID - 3) * 10 // 3970

/**
 * Difficulty presets
 * baseSpeed = starting tick delay (ms), lower = faster
 * minSpeed = fastest possible tick delay (ms)
 * accelRate = ms removed per 50 points scored
 */
export const DIFFICULTIES = {
  easy: {
    key: 'easy',
    name: 'Easy',
    icon: '🟢',
    desc: 'Relaxed pace, gentle speed increase',
    baseSpeed: 180,
    minSpeed: 100,
    accelRate: 5,
  },
  normal: {
    key: 'normal',
    name: 'Normal',
    icon: '🟡',
    desc: 'Balanced speed and acceleration',
    baseSpeed: 140,
    minSpeed: 60,
    accelRate: 10,
  },
  hard: {
    key: 'hard',
    name: 'Hard',
    icon: '🟠',
    desc: 'Fast pace, aggressive acceleration',
    baseSpeed: 110,
    minSpeed: 45,
    accelRate: 12,
  },
  expert: {
    key: 'expert',
    name: 'Expert',
    icon: '🔴',
    desc: 'Very fast, for experienced players',
    baseSpeed: 85,
    minSpeed: 35,
    accelRate: 15,
  },
  insane: {
    key: 'insane',
    name: 'Insane',
    icon: '💀',
    desc: 'Extreme speed from the start',
    baseSpeed: 60,
    minSpeed: 25,
    accelRate: 18,
  },
}

export const DEFAULT_DIFFICULTY = 'normal'

/**
 * Spawn food on a random free cell (not occupied by the snake)
 */
export function spawnFood(snake) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`))
  const free = []
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: 0, y: 0 }
  return free[Math.floor(Math.random() * free.length)]
}

/**
 * Create initial game state
 */
export function createGame() {
  const snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ]
  return { snake, food: spawnFood(snake) }
}

/**
 * Calculate tick speed based on current score and difficulty
 */
export function getSpeed(score, difficultyKey = DEFAULT_DIFFICULTY) {
  const diff = DIFFICULTIES[difficultyKey] || DIFFICULTIES[DEFAULT_DIFFICULTY]
  const speedup = Math.floor(score / 50) * diff.accelRate
  return Math.max(diff.minSpeed, diff.baseSpeed - speedup)
}

/**
 * Process one game tick. Returns result object.
 * @param {object} game - { snake, food }
 * @param {object} direction - { x, y }
 * @returns {{ alive: boolean, ate: boolean, won: boolean, game: object }}
 */
export function tick(game, direction) {
  const head = { ...game.snake[0] }
  head.x += direction.x
  head.y += direction.y

  // Wall collision
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    return { alive: false, ate: false, won: false, game }
  }

  // Self collision
  const willEat = head.x === game.food.x && head.y === game.food.y
  const checkTo = willEat ? game.snake.length : game.snake.length - 1
  for (let i = 0; i < checkTo; i++) {
    if (game.snake[i].x === head.x && game.snake[i].y === head.y) {
      return { alive: false, ate: false, won: false, game }
    }
  }

  game.snake.unshift(head)

  if (willEat) {
    if (game.snake.length >= GRID * GRID) {
      game.food = { x: -1, y: -1 }
      return { alive: true, ate: true, won: true, game }
    }
    game.food = spawnFood(game.snake)
    return { alive: true, ate: true, won: false, game }
  } else {
    game.snake.pop()
    return { alive: true, ate: false, won: false, game }
  }
}
