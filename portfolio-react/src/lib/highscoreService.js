import { supabase } from './supabase'
import { checkName } from './profanityFilter'

// Rate limiting — 1 submit per 30 seconds
let lastSubmitTime = 0
const RATE_LIMIT_MS = 30_000

// Max realistic score (20x20 grid minus 3 start segments = 397 food × 10 pts)
const MAX_SCORE = 3970

// Valid difficulty keys
const VALID_DIFFICULTIES = ['easy', 'normal', 'hard', 'expert', 'insane']

/**
 * Get ISO date string for a time period offset from now
 */
function getPeriodStart(period) {
  if (period === 'all') return null
  const now = new Date()
  if (period === 'daily') now.setHours(0, 0, 0, 0)
  else if (period === 'weekly') now.setDate(now.getDate() - 7)
  else if (period === 'monthly') now.setMonth(now.getMonth() - 1)
  return now.toISOString()
}

/**
 * Fetch top highscores, optionally filtered by time period and difficulty
 * @param {number} limit
 * @param {'daily'|'weekly'|'monthly'|'all'} period
 * @param {string|null} difficulty - filter by difficulty, null = all
 * @returns {Promise<Array>}
 */
export async function getHighscores(limit = 10, period = 'all', difficulty = null) {
  if (!supabase) return []

  let query = supabase
    .from('snake_highscores')
    .select('id, name, score, difficulty, created_at')
    .order('score', { ascending: false })
    .limit(limit)

  const periodStart = getPeriodStart(period)
  if (periodStart) {
    query = query.gte('created_at', periodStart)
  }

  if (difficulty && VALID_DIFFICULTIES.includes(difficulty)) {
    query = query.eq('difficulty', difficulty)
  }

  const { data, error } = await query

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
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function submitHighscore(name, score, difficulty = 'normal') {
  if (!supabase) {
    return { success: false, error: 'Database not connected' }
  }

  // Rate limiting
  const now = Date.now()
  if (now - lastSubmitTime < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000)
    return { success: false, error: `Wait ${waitSec}s before submitting again` }
  }

  // Validate score
  if (typeof score !== 'number' || !Number.isInteger(score) || score <= 0) {
    return { success: false, error: 'Invalid score' }
  }
  if (score > MAX_SCORE) {
    return { success: false, error: 'Score exceeds maximum possible' }
  }
  if (score % 10 !== 0) {
    return { success: false, error: 'Invalid score' }
  }

  // Validate difficulty
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    difficulty = 'normal'
  }

  // Re-validate name
  const nameCheck = checkName(name)
  if (!nameCheck.clean) {
    return { success: false, error: nameCheck.reason }
  }

  lastSubmitTime = now

  const { data, error } = await supabase
    .from('snake_highscores')
    .insert([{ name: nameCheck.filtered, score, difficulty }])
    .select()
    .single()

  if (error) {
    console.error('Failed to submit highscore:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
