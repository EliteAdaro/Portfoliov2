// =============================================
// Snake Chaos Mode
// =============================================
// Picks N random "chaos features" at game start. Only those features can
// trigger during the game. New game = new random selection.
//
// (This file kept its old name `snakeAprilFools` for import stability.)

import { spawnFood } from './snakeEngine'

/**
 * Check if today is April 1st (used to default Chaos Mode on).
 */
export function isAprilFools() {
  const now = new Date()
  return now.getMonth() === 3 && now.getDate() === 1
}

/**
 * All available chaos features.
 */
export const CHAOS_FEATURES = [
  { id: 'foodDodge',      name: 'Food Dodge',        emoji: '🏃' },
  { id: 'speedBurst',     name: 'Speed Burst',       emoji: '🚀' },
  { id: 'speedSlow',      name: 'Slow Motion',       emoji: '🐌' },
  { id: 'invertControls', name: 'Inverted Controls', emoji: '🔄' },
  { id: 'screenShake',    name: 'Screen Shake',      emoji: '🌋' },
  { id: 'fakeFood',       name: 'Fake Food',         emoji: '🎭' },
]

const FEATURE_IDS = CHAOS_FEATURES.map((f) => f.id)

/**
 * Pick `count` unique random features from the pool.
 * count >= pool size → all features.
 */
function pickFeatures(count) {
  const pool = [...FEATURE_IDS]
  if (count >= pool.length) return pool
  const picked = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

/**
 * Create chaos state. If chaosCount is 0/falsy, chaos is inactive.
 */
export function createChaosState(chaosCount = 0) {
  const active = chaosCount > 0
  const enabled = active ? pickFeatures(chaosCount) : []
  return {
    active,
    enabled,                  // Set of enabled feature ids for this game
    enabledSet: new Set(enabled),
    foodDodgeCount: 0,
    invertedUntil: 0,
    speedPrankUntil: 0,
    speedMultiplier: 1,
    shakeUntil: 0,
    fakeFoodPos: null,
    prankCooldown: 0,
    totalPranks: 0,
    messageUntil: 0,
    message: '',
  }
}

// Backwards-compat: old name still exported, returns inactive state by default.
export function createAprilFoolsState() {
  return createChaosState(0)
}

const MESSAGES = {
  foodDodge: ['Oops! The food ran away! 🏃', 'Catch me if you can! 🍎💨', 'Not so fast! 😏'],
  speedBurst: ['TURBO MODE! 🚀', 'Gotta go fast! ⚡', 'Speed boost! 💨'],
  speedSlow: ['Slow-mo activated 🐌', 'Matrix mode... 🕶️', 'Time warp! ⏳'],
  invertControls: ['Controls inverted! 🔄', 'Left is right! ↔️', 'Upside down! 🙃'],
  screenShake: ['Earthquake! 🌋', 'Shaky cam! 📹', 'Hold on tight! 😵'],
  fakeFood: ['Which one is real? 👀', 'Double trouble! 🎭', 'Trust your instincts! 🤔'],
}

function getRandomMessage(id) {
  const msgs = MESSAGES[id] || ['Chaos! 🎉']
  return msgs[Math.floor(Math.random() * msgs.length)]
}

function pickEnabledFeature(state) {
  if (state.enabled.length === 0) return null
  return state.enabled[Math.floor(Math.random() * state.enabled.length)]
}

/**
 * Maybe trigger a chaos feature. Called each tick.
 */
export function maybeTriggerPrank(state, game, score) {
  if (!state.active || state.enabled.length === 0) return state

  if (state.prankCooldown > 0) {
    state.prankCooldown--
    return state
  }

  if (Math.random() > 0.03) return state
  if (score < 20) return state

  const id = pickEnabledFeature(state)
  if (!id) return state

  const now = Date.now()
  state.prankCooldown = 40
  state.totalPranks++
  state.message = getRandomMessage(id)
  state.messageUntil = now + 2000

  switch (id) {
    case 'foodDodge':
      if (state.foodDodgeCount === 0) {
        game.food = spawnFood(game.snake)
        state.foodDodgeCount = 1
      }
      break
    case 'speedBurst':
      state.speedPrankUntil = now + 2500
      state.speedMultiplier = 0.5
      break
    case 'speedSlow':
      state.speedPrankUntil = now + 3000
      state.speedMultiplier = 2.5
      break
    case 'invertControls':
      state.invertedUntil = now + 3000
      break
    case 'screenShake':
      state.shakeUntil = now + 1500
      break
    case 'fakeFood':
      state.fakeFoodPos = spawnFood([...game.snake, game.food])
      setTimeout(() => { state.fakeFoodPos = null }, 4000)
      break
  }

  return state
}

export function onFoodEaten(state) {
  state.foodDodgeCount = 0
  return state
}

export function getSpeedModifier(state) {
  if (!state.active) return 1
  if (Date.now() < state.speedPrankUntil) return state.speedMultiplier || 1
  return 1
}

export function applyInvertedControls(state, direction) {
  if (!state.active) return direction
  if (Date.now() < state.invertedUntil) return { x: -direction.x, y: -direction.y }
  return direction
}

export function getShakeOffset(state) {
  if (!state.active) return { x: 0, y: 0 }
  if (Date.now() < state.shakeUntil) {
    return { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 }
  }
  return { x: 0, y: 0 }
}

export function getPrankMessage(state) {
  if (!state.active) return null
  if (Date.now() < state.messageUntil) return state.message
  return null
}

export function drawAprilFoolsExtras(ctx, state, drawFoodFn, cellSize, settings) {
  if (!state.active) return
  if (state.fakeFoodPos) {
    ctx.save()
    ctx.globalAlpha = 0.7
    drawFoodFn(ctx, state.fakeFoodPos.x * cellSize, state.fakeFoodPos.y * cellSize, cellSize, settings)
    ctx.globalAlpha = 1.0
    ctx.restore()
  }
}
