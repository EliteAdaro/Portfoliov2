import { supabase } from './supabase'
import { checkName } from './profanityFilter'

// Rate limiting — 1 submit per 30 seconds
let lastSubmitTime = 0
const RATE_LIMIT_MS = 30_000

// Max realistic score (20x20 grid minus 3 start segments = 397 food × 10 pts)
const MAX_SCORE = 3970

/**
 * Fetch top highscores
 * @param {number} limit - Number of scores to fetch
 * @returns {Promise<Array>} - Array of { id, name, score, created_at }
 */
export async function getHighscores(limit = 10) {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('snake_highscores')
    .select('id, name, score, created_at')
    .order('score', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch highscores:', error.message)
    return []
  }

  return data || []
}

/**
 * Submit a new highscore with full validation
 * @param {string} name - Player name
 * @param {number} score - Player score
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function submitHighscore(name, score) {
  if (!supabase) {
    return { success: false, error: 'Database not connected' }
  }

  // Rate limiting
  const now = Date.now()
  if (now - lastSubmitTime < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000)
    return { success: false, error: `Wait ${waitSec}s before submitting again` }
  }

  // Validate score is a positive integer within realistic bounds
  if (typeof score !== 'number' || !Number.isInteger(score) || score <= 0) {
    return { success: false, error: 'Invalid score' }
  }

  if (score > MAX_SCORE) {
    return { success: false, error: 'Score exceeds maximum possible' }
  }

  // Score must be a multiple of 10 (each food = 10 points)
  if (score % 10 !== 0) {
    return { success: false, error: 'Invalid score' }
  }

  // Re-validate name server-side (defense in depth)
  const nameCheck = checkName(name)
  if (!nameCheck.clean) {
    return { success: false, error: nameCheck.reason }
  }

  lastSubmitTime = now

  const { data, error } = await supabase
    .from('snake_highscores')
    .insert([{ name: nameCheck.filtered, score }])
    .select()
    .single()

  if (error) {
    console.error('Failed to submit highscore:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
