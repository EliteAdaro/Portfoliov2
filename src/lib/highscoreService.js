// Client-side highscore service
// ALL requests go through /api/ server routes — NEVER directly to Supabase
import { checkName } from './profanityFilter'

const API_BASE = '/api'

/**
 * Fetch top highscores via server API
 * @param {number} limit
 * @param {'daily'|'weekly'|'monthly'|'all'} period
 * @param {string|null} difficulty
 * @returns {Promise<Array>}
 */
export async function getHighscores(limit = 10, period = 'all', difficulty = null) {
  try {
    const params = new URLSearchParams({ period, limit: String(limit) })
    if (difficulty) params.set('difficulty', difficulty)

    const res = await fetch(`${API_BASE}/highscores?${params}`)
    if (!res.ok) return []

    const json = await res.json()
    return json.scores || []
  } catch (err) {
    console.error('Failed to fetch highscores:', err.message)
    return []
  }
}

/**
 * Submit a new highscore via server API
 * @param {string} name
 * @param {number} score
 * @param {string} difficulty
 * @param {number} gameDuration - How long the game lasted in ms
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function submitHighscore(name, score, difficulty = 'normal', gameDuration = 0) {
  // Client-side pre-validation (server validates again)
  const nameCheck = checkName(name)
  if (!nameCheck.clean) {
    return { success: false, error: nameCheck.reason }
  }

  if (typeof score !== 'number' || score <= 0 || score % 10 !== 0) {
    return { success: false, error: 'Invalid score' }
  }

  try {
    const res = await fetch(`${API_BASE}/submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameCheck.filtered,
        score,
        difficulty,
        gameDuration,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to submit score' }
    }

    return { success: true, data: json.data }
  } catch (err) {
    console.error('Failed to submit highscore:', err.message)
    return { success: false, error: 'Network error — try again' }
  }
}
