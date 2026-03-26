// GET /api/highscores?period=all&difficulty=normal&limit=10
// Server-side endpoint — client never touches the database directly
import { supabaseAdmin } from './_supabaseAdmin.js'

const VALID_PERIODS = ['all', 'daily', 'weekly', 'monthly']
const VALID_DIFFICULTIES = ['easy', 'normal', 'hard', 'expert', 'insane']
const MAX_LIMIT = 50

function getPeriodStart(period) {
  if (period === 'all') return null
  const now = new Date()
  if (period === 'daily') now.setHours(0, 0, 0, 0)
  else if (period === 'weekly') now.setDate(now.getDate() - 7)
  else if (period === 'monthly') now.setMonth(now.getMonth() - 1)
  return now.toISOString()
}

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://kayneneyens.nl')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  try {
    const { period = 'all', difficulty, limit: limitParam } = req.query

    // Validate period
    const safePeriod = VALID_PERIODS.includes(period) ? period : 'all'

    // Validate difficulty
    const safeDifficulty = difficulty && VALID_DIFFICULTIES.includes(difficulty)
      ? difficulty
      : null

    // Validate limit
    let safeLimit = parseInt(limitParam, 10)
    if (isNaN(safeLimit) || safeLimit < 1) safeLimit = 10
    if (safeLimit > MAX_LIMIT) safeLimit = MAX_LIMIT

    // Build query — only return name, score, difficulty, created_at (NEVER id or internal fields)
    let query = supabaseAdmin
      .from('snake_highscores')
      .select('name, score, difficulty, created_at')
      .order('score', { ascending: false })
      .limit(safeLimit)

    const periodStart = getPeriodStart(safePeriod)
    if (periodStart) {
      query = query.gte('created_at', periodStart)
    }

    if (safeDifficulty) {
      query = query.eq('difficulty', safeDifficulty)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase fetch error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch scores' })
    }

    // Cache for 30 seconds to reduce DB hits
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ scores: data || [] })
  } catch (err) {
    console.error('Highscores API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
