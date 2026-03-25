// =============================================
// Snake April Fools Pranks — active on April 1st
// =============================================
// Each prank is a modifier that hooks into the game loop.
// Pranks are randomly selected and applied per tick or event.

import { spawnFood, GRID, CELL } from './snakeEngine'

/**
 * Check if today is April 1st
 */
export function isAprilFools() {
  const now = new Date()
  return now.getMonth() === 3 && now.getDate() === 1 // month is 0-indexed
}

/**
 * Create April Fools state tracker
 */
export function createAprilFoolsState() {
  return {
    active: isAprilFools(),
    foodDodgeCount: 0,       // how many times food has dodged
    invertedUntil: 0,        // timestamp when inverted controls end
    speedPrankUntil: 0,      // timestamp when speed prank ends
    mirrorUntil: 0,          // timestamp when mirror drawing ends
    shakeUntil: 0,           // timestamp when screen shake ends
    fakeFoodPos: null,        // ghost food position (decoy)
    prankCooldown: 0,        // ticks until next prank can trigger
    totalPranks: 0,          // pranks triggered this session
    messageUntil: 0,         // timestamp when message disappears
    message: '',             // current prank message
  }
}

/**
 * List of available pranks with their weights (higher = more likely)
 */
const PRANKS = [
  { id: 'foodDodge', weight: 25, name: 'Food Dodge' },
  { id: 'speedBurst', weight: 20, name: 'Speed Burst' },
  { id: 'speedSlow', weight: 15, name: 'Slow Motion' },
  { id: 'invertControls', weight: 12, name: 'Inverted Controls' },
  { id: 'screenShake', weight: 15, name: 'Screen Shake' },
  { id: 'fakeFood', weight: 13, name: 'Fake Food' },
]

/**
 * Pick a random prank based on weights
 */
function pickRandomPrank() {
  const totalWeight = PRANKS.reduce((sum, p) => sum + p.weight, 0)
  let roll = Math.random() * totalWeight
  for (const prank of PRANKS) {
    roll -= prank.weight
    if (roll <= 0) return prank
  }
  return PRANKS[0]
}

// Prank messages
const MESSAGES = {
  foodDodge: ['Oops! The food ran away! 🏃', 'Catch me if you can! 🍎💨', 'Not so fast! 😏'],
  speedBurst: ['TURBO MODE! 🚀', 'Gotta go fast! ⚡', 'Speed boost! 💨'],
  speedSlow: ['Slow-mo activated 🐌', 'Matrix mode... 🕶️', 'Time warp! ⏳'],
  invertControls: ['Controls inverted! 🔄', 'Left is right! ↔️', 'Upside down! 🙃'],
  screenShake: ['Earthquake! 🌋', 'Shaky cam! 📹', 'Hold on tight! 😵'],
  fakeFood: ['Which one is real? 👀', 'Double trouble! 🎭', 'Trust your instincts! 🤔'],
}

function getRandomMessage(prankId) {
  const msgs = MESSAGES[prankId] || ['April Fools! 🎉']
  return msgs[Math.floor(Math.random() * msgs.length)]
}

/**
 * Maybe trigger a prank. Called each tick.
 * Returns modified aprilState.
 * @param {object} aprilState
 * @param {object} game - { snake, food }
 * @param {number} score
 * @returns {object} updated aprilState
 */
export function maybeTriggerPrank(aprilState, game, score) {
  if (!aprilState.active) return aprilState

  // Decrease cooldown
  if (aprilState.prankCooldown > 0) {
    aprilState.prankCooldown--
    return aprilState
  }

  // 3% chance per tick to trigger a prank (roughly every 2-4 seconds)
  if (Math.random() > 0.03) return aprilState

  // Don't prank too early (let player get started)
  if (score < 20) return aprilState

  const prank = pickRandomPrank()
  const now = Date.now()

  aprilState.prankCooldown = 40 // ~5 seconds between pranks
  aprilState.totalPranks++
  aprilState.message = getRandomMessage(prank.id)
  aprilState.messageUntil = now + 2000

  switch (prank.id) {
    case 'foodDodge':
      // Food teleports away (but only first time per food)
      if (aprilState.foodDodgeCount === 0) {
        game.food = spawnFood(game.snake)
        aprilState.foodDodgeCount = 1
      }
      break

    case 'speedBurst':
      // Temporarily speed up (2.5 seconds)
      aprilState.speedPrankUntil = now + 2500
      aprilState.speedMultiplier = 0.5 // half the delay = double speed
      break

    case 'speedSlow':
      // Temporarily slow down (3 seconds)
      aprilState.speedPrankUntil = now + 3000
      aprilState.speedMultiplier = 2.5 // 2.5x delay = very slow
      break

    case 'invertControls':
      // Invert controls for 3 seconds
      aprilState.invertedUntil = now + 3000
      break

    case 'screenShake':
      // Shake the canvas for 1.5 seconds
      aprilState.shakeUntil = now + 1500
      break

    case 'fakeFood':
      // Show a decoy food
      aprilState.fakeFoodPos = spawnFood([...game.snake, game.food])
      setTimeout(() => { aprilState.fakeFoodPos = null }, 4000)
      break
  }

  return aprilState
}

/**
 * Handle food eaten — reset dodge counter
 */
export function onFoodEaten(aprilState) {
  aprilState.foodDodgeCount = 0
  return aprilState
}

/**
 * Get speed modifier (returns multiplier for tick delay)
 */
export function getSpeedModifier(aprilState) {
  if (!aprilState.active) return 1
  if (Date.now() < aprilState.speedPrankUntil) {
    return aprilState.speedMultiplier || 1
  }
  return 1
}

/**
 * Apply inverted controls to a direction
 */
export function applyInvertedControls(aprilState, direction) {
  if (!aprilState.active) return direction
  if (Date.now() < aprilState.invertedUntil) {
    return { x: -direction.x, y: -direction.y }
  }
  return direction
}

/**
 * Get canvas transform offset for screen shake
 */
export function getShakeOffset(aprilState) {
  if (!aprilState.active) return { x: 0, y: 0 }
  if (Date.now() < aprilState.shakeUntil) {
    return {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    }
  }
  return { x: 0, y: 0 }
}

/**
 * Get current prank message (or null if expired)
 */
export function getPrankMessage(aprilState) {
  if (!aprilState.active) return null
  if (Date.now() < aprilState.messageUntil) return aprilState.message
  return null
}

/**
 * Draw April Fools extras on canvas (fake food, message)
 */
export function drawAprilFoolsExtras(ctx, aprilState, drawFoodFn, cellSize, settings) {
  if (!aprilState.active) return

  // Draw fake food (slightly transparent)
  if (aprilState.fakeFoodPos) {
    ctx.save()
    ctx.globalAlpha = 0.7
    drawFoodFn(
      ctx,
      aprilState.fakeFoodPos.x * cellSize,
      aprilState.fakeFoodPos.y * cellSize,
      cellSize,
      settings,
    )
    ctx.globalAlpha = 1.0
    ctx.restore()
  }
}
