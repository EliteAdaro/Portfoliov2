// POST /api/submit-score
// Server-side score submission with full validation & anti-cheat
import { supabaseAdmin } from './_supabaseAdmin.js'
import { checkNameServer } from './_profanityFilter.js'
import { guard, getIP } from './_rateLimit.js'

const VALID_DIFFICULTIES = ['easy', 'normal', 'hard', 'expert', 'insane']
const MAX_SCORE = 3970 // (20*20 - 3) * 10

// Minimum game duration estimates (ms) based on difficulty and score
// At minimum, each food takes ~2 ticks to reach at the fastest possible speed
const DIFFICULTY_MIN_SPEED = {
  easy: 100,
  normal: 60,
  hard: 45,
  expert: 35,
  insane: 25,
}

function estimateMinGameDuration(score, difficulty) {
  const foodCount = score / 10
  const minTickMs = DIFFICULTY_MIN_SPEED[difficulty] || 60
  // Very conservative: each food needs at least 2 ticks at the fastest speed
  return foodCount * 2 * minTickMs
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://kayneneyens.nl')
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://kayneneyens.nl')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Bot detection + rate limit: 4 submissions/min per IP
  if (guard(req, res, 'submit', 4, 60_000)) return

  try {
    const ip = getIP(req)

    const { name, score, difficulty, gameDuration, chaosCount } = req.body || {}

    // === VALIDATE CHAOS COUNT ===
    const VALID_CHAOS = [0, 1, 2, 3, 6]
    const safeChaosCount = VALID_CHAOS.includes(chaosCount) ? chaosCount : 0

    // === VALIDATE NAME ===
    const nameCheck = checkNameServer(name)
    if (!nameCheck.clean) {
      return res.status(400).json({ error: nameCheck.reason })
    }

    // === VALIDATE SCORE ===
    if (typeof score !== 'number' || !Number.isInteger(score) || score <= 0) {
      return res.status(400).json({ error: 'Invalid score' })
    }
    if (score > MAX_SCORE) {
      return res.status(400).json({ error: 'Score exceeds maximum possible' })
    }
    if (score % 10 !== 0) {
      return res.status(400).json({ error: 'Invalid score format' })
    }

    // === VALIDATE DIFFICULTY ===
    const safeDifficulty = VALID_DIFFICULTIES.includes(difficulty) ? difficulty : 'normal'

    // === ANTI-CHEAT: Check game duration ===
    if (typeof gameDuration === 'number' && gameDuration > 0) {
      const minDuration = estimateMinGameDuration(score, safeDifficulty)
      if (gameDuration < minDuration * 0.8) { // 20% tolerance
        console.warn(`Suspicious score: ${score} in ${gameDuration}ms (min expected: ${minDuration}ms) from IP: ${ip}`)
        return res.status(400).json({ error: 'Score rejected — game duration too short' })
      }
    }

    // === ANTI-CHEAT: Check for duplicate recent scores from same IP ===
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentScores } = await supabaseAdmin
      .from('snake_highscores')
      .select('score')
      .eq('ip_hash', hashIP(ip))
      .gte('created_at', fiveMinAgo)

    if (recentScores && recentScores.length >= 5) {
      return res.status(429).json({ error: 'Too many submissions. Try again later.' })
    }

    // === INSERT SCORE ===
    const { data, error } = await supabaseAdmin
      .from('snake_highscores')
      .insert([{
        name: nameCheck.filtered,
        score,
        difficulty: safeDifficulty,
        chaos_count: safeChaosCount,
        ip_hash: hashIP(ip),
      }])
      .select('name, score, difficulty, chaos_count, created_at')
      .single()

    if (error) {
      console.error('Supabase insert error:', error.message)
      return res.status(500).json({ error: 'Failed to save score' })
    }

    return res.status(201).json({ success: true, data })
  } catch (err) {
    console.error('Submit score API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Simple IP hashing for rate limiting (never store raw IPs)
function hashIP(ip) {
  let hash = 0
  const str = `snake_salt_2024_${ip}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}
