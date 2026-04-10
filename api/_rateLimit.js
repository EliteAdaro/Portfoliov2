// Global rate limiting + bot detection for all API routes.
// In-memory per serverless instance — not perfect, but effective against burst floods.

// --- Bot / scanner user-agent blocklist ---
const BOT_PATTERNS = [
  /locust/i,
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /httpclient/i,
  /Apache-HttpClient/i,
  /java\//i,
  /wget/i,
  /curl\//i,
  /siege/i,
  /ab\//i,          // Apache Bench
  /wrk/i,
  /bombardier/i,
  /hey\//i,
  /vegeta/i,
  /k6\//i,
  /artillery/i,
  /gatling/i,
  /jmeter/i,
  /scrapy/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /nuclei/i,
  /httpx/i,
  /headlesschrome/i,
  /phantomjs/i,
]

export function isBot(req) {
  const ua = req.headers['user-agent'] || ''
  if (!ua || ua.length < 5) return true // no UA = suspicious
  return BOT_PATTERNS.some((p) => p.test(ua))
}

// --- IP-based rate limiter ---
// bucketMs = time window, maxHits = max requests in that window
const buckets = new Map()
let lastPurge = Date.now()
const PURGE_INTERVAL = 60_000 // purge stale entries every minute

function purgeStale(bucketMs) {
  const now = Date.now()
  if (now - lastPurge < PURGE_INTERVAL) return
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > bucketMs * 2) buckets.delete(key)
  }
  lastPurge = now
}

/**
 * Rate limit by IP.
 * @param {object} req - Vercel request
 * @param {string} routeKey - unique key per route (e.g. 'highscores', 'submit')
 * @param {number} maxHits - max requests per window
 * @param {number} bucketMs - time window in ms
 * @returns {{ allowed: boolean, remaining: number, retryAfter?: number }}
 */
export function rateLimit(req, routeKey, maxHits = 30, bucketMs = 60_000) {
  purgeStale(bucketMs)

  const ip = getIP(req)
  const key = `${routeKey}:${ip}`
  const now = Date.now()

  let entry = buckets.get(key)
  if (!entry || now - entry.windowStart > bucketMs) {
    entry = { windowStart: now, hits: 0 }
    buckets.set(key, entry)
  }

  entry.hits++

  if (entry.hits > maxHits) {
    const retryAfter = Math.ceil((entry.windowStart + bucketMs - now) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining: maxHits - entry.hits }
}

/**
 * Global rate limit — across all routes per IP.
 * Much more lenient, catches broad floods.
 */
export function globalRateLimit(req) {
  return rateLimit(req, '__global__', 120, 60_000) // 120 req/min across all endpoints
}

export function getIP(req) {
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

/**
 * Common guard: bot check + global rate limit + per-route rate limit.
 * Returns a Response object if blocked, or null if allowed.
 */
export function guard(req, res, routeKey, maxHits = 30, bucketMs = 60_000) {
  // Block bots
  if (isBot(req)) {
    res.setHeader('Retry-After', '3600')
    res.status(403).json({ error: 'Forbidden' })
    return true
  }

  // Global rate limit
  const global = globalRateLimit(req)
  if (!global.allowed) {
    res.setHeader('Retry-After', String(global.retryAfter))
    res.setHeader('X-RateLimit-Remaining', '0')
    res.status(429).json({ error: 'Too many requests. Slow down.' })
    return true
  }

  // Per-route rate limit
  const route = rateLimit(req, routeKey, maxHits, bucketMs)
  if (!route.allowed) {
    res.setHeader('Retry-After', String(route.retryAfter))
    res.setHeader('X-RateLimit-Remaining', '0')
    res.status(429).json({ error: 'Too many requests. Try again later.' })
    return true
  }

  // Set rate limit headers
  res.setHeader('X-RateLimit-Remaining', String(route.remaining))
  return false
}
