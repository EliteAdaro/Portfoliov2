// POST /api/submit-score
// Server-side score submission with full validation & anti-cheat
import { supabaseAdmin } from './_supabaseAdmin.js'
import { checkNameServer } from './_profanityFilter.js'

const VALID_DIFFICULTIES = ['easy', 'normal', 'hard', 'expert', 'insane']
const MAX_SCORE = 3970 // (20*20 - 3) * 10

// In-memory rate limiting by IP (resets on cold start, but good enough)
const rateLimitMap = new Map()
const RATE_LIMIT_MS = 15_000 // 15 seconds between submissions
const RATE_LIMIT_CLEANUP = 300_000 // Clean up old entries every 5 min
let lastCleanup = Date.now()

function rateLimit(ip) {
  // Cleanup old entries periodically
  const now = Date.now()
  if (now - lastCleanup > RATE_LIMIT_CLEANUP) {
    for (const [key, time] of rateLimitMap) {
      if (now - time > RATE_LIMIT_MS * 2) rateLimitMap.delete(key)
    }
    lastCleanup = now
  }

  const lastSubmit = rateLimitMap.get(ip)
  if (lastSubmit && now - lastSubmit < RATE_LIMIT_MS) {
    const waitSec = Math.ceil((RATE_LIMIT_MS - (now - lastSubmit)) / 1000)
    return { allowed: false, waitSec }
  }

  rateLimitMap.set(ip, now)
  return { allowed: true }
}

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

  try {
    // Rate limit by IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
    const rl = rateLimit(ip)
    if (!rl.allowed) {
      return res.status(429).json({ error: `Too fast! Wait ${rl.waitSec}s before submitting again` })
    }

    const { name, score, difficulty, gameDuration } = req.body || {}

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
        ip_hash: hashIP(ip),
      }])
      .select('name, score, difficulty, created_at')
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
