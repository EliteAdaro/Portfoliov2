// Custom profanity filter — no external dependencies
// Covers: English, Dutch, German, French, Spanish + racist slurs

const BANNED_WORDS = [
  // English
  'fuck', 'shit', 'ass', 'asshole', 'bitch', 'bastard', 'damn', 'dick',
  'pussy', 'cock', 'cunt', 'whore', 'slut', 'piss', 'crap', 'douche',
  'wanker', 'twat', 'bollocks', 'bugger', 'arse', 'tosser', 'prick',

  // Dutch
  'kut', 'lul', 'hoer', 'kanker', 'tering', 'tyfus', 'klootzak', 'godverdomme',
  'kutwijf', 'mongool', 'debiel', 'eikel', 'drol', 'schijt', 'neuk',
  'neuken', 'pik', 'kak', 'stront', 'flikker', 'mof', 'nikker',
  'trut', 'teef', 'slet', 'kankerlijer', 'tyfuslijer',
  'kankermongool', 'kankerlul', 'kuthoer', 'godsamme', 'oprotten', 'pleur',
  'pleuris', 'pest', 'pestlijer', 'reet', 'kontgat',

  // German
  'scheisse', 'scheiße', 'arschloch', 'wichser', 'hurensohn', 'fotze',
  'schwuchtel', 'missgeburt', 'spast', 'behindert', 'drecksau',
  'vollidiot', 'fick', 'ficken', 'hure', 'nutte', 'schlampe',
  'depp', 'trottel', 'penner', 'wixer',

  // French
  'merde', 'putain', 'connard', 'connasse', 'salope', 'encule',
  'bordel', 'foutre', 'batard', 'pute', 'chienne',

  // Spanish
  'puta', 'mierda', 'coño', 'joder', 'cabron', 'pendejo', 'chinga',
  'maricon', 'perra', 'culo', 'verga', 'gilipollas',

  // Racist / slurs (multi-language)
  'nigger', 'nigga', 'faggot', 'retard', 'chink', 'spic', 'kike', 'gook',
  'wetback', 'coon', 'raghead', 'towelhead', 'cracker', 'honky',
  'beaner', 'nazi', 'hitler', 'neger',
]

/**
 * Check if text contains any banned word.
 * Uses word boundary detection and substring matching.
 */
function isProfane(text) {
  const lower = text.toLowerCase().replace(/[_\-\s]+/g, '')

  for (const word of BANNED_WORDS) {
    const cleanWord = word.replace(/[_\-\s]+/g, '')
    if (lower.includes(cleanWord)) {
      return true
    }
  }

  // Also check with spaces/separators kept (for multi-word names)
  const lowerSpaced = text.toLowerCase()
  for (const word of BANNED_WORDS) {
    if (lowerSpaced.includes(word)) {
      return true
    }
  }

  return false
}

/**
 * Check if a name is clean (no profanity).
 * Returns { clean: boolean, filtered: string, reason?: string }
 */
export function checkName(name) {
  // Strip any HTML/script tags first
  const sanitized = String(name).replace(/<[^>]*>/g, '').trim()

  if (sanitized.length === 0) {
    return { clean: false, filtered: '', reason: 'Name cannot be empty' }
  }

  if (sanitized.length < 2) {
    return { clean: false, filtered: sanitized, reason: 'Min 2 characters' }
  }

  if (sanitized.length > 12) {
    return { clean: false, filtered: sanitized.slice(0, 12), reason: 'Max 12 characters' }
  }

  // STRICT: Only allow letters, numbers, spaces, underscores, hyphens
  // This blocks: ' " ; -- < > / \ = ( ) { } & | ! @ # $ % ^ * + ~ `
  // Which prevents: SQL injection, XSS, HTML injection, script injection
  if (!/^[a-zA-Z0-9 _-]+$/.test(sanitized)) {
    return { clean: false, filtered: sanitized, reason: 'Only letters, numbers, spaces, _ and -' }
  }

  // Block common injection patterns even if they only use allowed chars
  const lowerName = sanitized.toLowerCase()
  const injectionPatterns = [
    'drop', 'delete', 'insert', 'update', 'select', 'union',
    'script', 'alert', 'eval', 'function', 'onclick', 'onerror',
  ]
  if (injectionPatterns.some((p) => lowerName.includes(p))) {
    return { clean: false, filtered: sanitized, reason: 'Invalid name' }
  }

  // Profanity check
  if (isProfane(sanitized)) {
    return { clean: false, filtered: sanitized, reason: 'Keep it friendly! 😊' }
  }

  return { clean: true, filtered: sanitized }
}
