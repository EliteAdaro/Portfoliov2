// Profanity filter using 'obscenity' package + custom non-English word list
// Obscenity handles: leet speak, unicode, character substitution, repetition
// We add: Dutch, German, French, Spanish + extra separator stripping
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity'

// Obscenity matcher for English (handles all evasion tricks automatically)
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
})

// Non-English words that obscenity doesn't cover
const EXTRA_BANNED = [
  // Dutch
  'kut','kutje','lul','hoer','kanker','tering','tyfus','klootzak','godverdomme',
  'kutwijf','mongool','debiel','eikel','drol','schijt','neuk','neuken','pik',
  'kak','stront','flikker','mof','nikker','trut','teef','slet','kankerlijer',
  'tyfuslijer','kankermongool','kankerlul','kuthoer','godsamme','oprotten',
  'pleur','pleuris','pest','pestlijer','reet','kontgat','pikkie','homo','cancer',
  // German
  'scheisse','arschloch','wichser','hurensohn','fotze','schwuchtel','missgeburt',
  'spast','behindert','drecksau','vollidiot','fick','ficken','hure','nutte',
  'schlampe','depp','trottel','penner','wixer',
  // French
  'merde','putain','connard','connasse','salope','encule','bordel','foutre',
  'batard','pute','chienne','nique',
  // Spanish
  'puta','mierda','joder','cabron','pendejo','chinga','maricon','perra',
  'culo','verga','gilipollas',
  // Extra slurs
  'neger','nazi','hitler',
]

const LEET_MAP = {
  '0':'o','1':'i','2':'z','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g',
  '@':'a','!':'i','$':'s','+':'t','|':'i',
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .split('')
    .map(c => LEET_MAP[c] || c)
    .join('')
}

function dedupAggressive(text) {
  return text.replace(/(.)\1+/g, '$1')
}

/**
 * Check non-English words with evasion detection
 */
function checkExtraWords(text) {
  const variants = [
    text.toLowerCase().replace(/[^a-z]/g, ''),  // strip non-letters
    normalize(text),                               // leet speak
    dedupAggressive(normalize(text)),             // leet + dedup
    text.toLowerCase().replace(/[_\-.\s]/g, ''),  // strip separators only
  ]

  for (const variant of variants) {
    for (const word of EXTRA_BANNED) {
      if (variant.includes(word)) return true
    }
  }
  return false
}

/**
 * Check if a name is clean (no profanity).
 * Returns { clean: boolean, filtered: string, reason?: string }
 */
export function checkName(name) {
  const sanitized = String(name).replace(/<[^>]*>/g, '').trim()

  if (sanitized.length === 0) return { clean: false, filtered: '', reason: 'Name cannot be empty' }
  if (sanitized.length < 2) return { clean: false, filtered: sanitized, reason: 'Min 2 characters' }
  if (sanitized.length > 12) return { clean: false, filtered: sanitized.slice(0, 12), reason: 'Max 12 characters' }

  // Only allow safe characters
  if (!/^[a-zA-Z0-9 _-]+$/.test(sanitized)) {
    return { clean: false, filtered: sanitized, reason: 'Only letters, numbers, spaces, _ and -' }
  }

  // Block injection patterns
  const lower = sanitized.toLowerCase()
  const injectionPatterns = ['drop','delete','insert','update','select','union','script','alert','eval','function','onclick','onerror']
  if (injectionPatterns.some(p => lower.includes(p))) {
    return { clean: false, filtered: sanitized, reason: 'Invalid name' }
  }

  // Check 1: Obscenity package (English, handles leet/unicode/evasion)
  if (matcher.hasMatch(sanitized)) {
    return { clean: false, filtered: sanitized, reason: 'Keep it friendly! 😊' }
  }

  // Check 2: Separator-stripped version through obscenity (catches f_u_c_k)
  const stripped = sanitized.replace(/[_\-\s]/g, '')
  if (stripped !== sanitized && matcher.hasMatch(stripped)) {
    return { clean: false, filtered: sanitized, reason: 'Keep it friendly! 😊' }
  }

  // Check 3: Non-English words with evasion detection
  if (checkExtraWords(sanitized)) {
    return { clean: false, filtered: sanitized, reason: 'Keep it friendly! 😊' }
  }

  return { clean: true, filtered: sanitized }
}
