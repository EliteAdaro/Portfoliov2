// =============================================
// Snake Game Engine — pure logic, no rendering
// =============================================

export const GRID = 20
export const CELL = 20
export const BASE_SPEED = 140
export const MIN_SPEED = 60

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
 * Calculate tick speed based on current score
 */
export function getSpeed(score) {
  const speedup = Math.floor(score / 50) * 10
  return Math.max(MIN_SPEED, BASE_SPEED - speedup)
}

/**
 * Process one game tick. Returns result object.
 * @param {object} game - { snake, food }
 * @param {object} direction - { x, y }
 * @returns {{ alive: boolean, ate: boolean, game: object }}
 */
export function tick(game, direction) {
  const head = { ...game.snake[0] }
  head.x += direction.x
  head.y += direction.y

  // Wall collision
  if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
    return { alive: false, ate: false, game }
  }

  // Self collision
  const willEat = head.x === game.food.x && head.y === game.food.y
  const checkTo = willEat ? game.snake.length : game.snake.length - 1
  for (let i = 0; i < checkTo; i++) {
    if (game.snake[i].x === head.x && game.snake[i].y === head.y) {
      return { alive: false, ate: false, game }
    }
  }

  game.snake.unshift(head)

  if (willEat) {
    game.food = spawnFood(game.snake)
    return { alive: true, ate: true, game }
  } else {
    game.snake.pop()
    return { alive: true, ate: false, game }
  }
}
