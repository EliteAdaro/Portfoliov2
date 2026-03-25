import Filter from 'bad-words'

const filter = new Filter()

// Dutch swear words
const dutchWords = [
  'kut', 'lul', 'hoer', 'kanker', 'tering', 'tyfus', 'klootzak', 'godverdomme',
  'kutwijf', 'mongool', 'debiel', 'eikel', 'sukkel', 'drol', 'schijt', 'neuk',
  'neuken', 'pik', 'kak', 'stront', 'flikker', 'mof', 'neger', 'nikker',
  'homo', 'trut', 'teef', 'slet', 'bitch', 'kankerlijer', 'tyfuslijer',
  'kankermongool', 'kankerlul', 'kuthoer', 'godsamme', 'oprotten', 'pleur',
  'pleuris', 'pest', 'pestlijer', 'reet', 'kontgat',
]

// German swear words
const germanWords = [
  'scheiße', 'scheisse', 'arschloch', 'wichser', 'hurensohn', 'fotze',
  'schwuchtel', 'missgeburt', 'spast', 'behindert', 'neger', 'drecksau',
  'vollidiot', 'fick', 'ficken', 'hure', 'nutte', 'schlampe', 'bastard',
  'depp', 'trottel', 'idiot', 'penner', 'wixer',
]

// French swear words
const frenchWords = [
  'merde', 'putain', 'connard', 'connasse', 'salope', 'enculé', 'nique',
  'bordel', 'foutre', 'batard', 'pute', 'chienne', 'fils de pute',
]

// Spanish swear words
const spanishWords = [
  'puta', 'mierda', 'coño', 'joder', 'cabron', 'pendejo', 'chinga',
  'maricón', 'perra', 'culo', 'verga', 'hijo de puta', 'gilipollas',
]

// Racist / slur terms (multi-language)
const slurs = [
  'nigger', 'nigga', 'faggot', 'retard', 'chink', 'spic', 'kike', 'gook',
  'wetback', 'coon', 'raghead', 'towelhead', 'cracker', 'honky', 'gringo',
  'beaner', 'nazi', 'hitler', 'holocaust',
]

filter.addWords(
  ...dutchWords,
  ...germanWords,
  ...frenchWords,
  ...spanishWords,
  ...slurs,
)

/**
 * Check if a name is clean (no profanity).
 * Returns { clean: boolean, filtered: string }
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

  try {
    if (filter.isProfane(sanitized)) {
      const censored = filter.clean(sanitized)
      return { clean: false, filtered: censored, reason: 'Keep it friendly! 😊' }
    }
  } catch {
    // Filter error — block to be safe
    return { clean: false, filtered: sanitized, reason: 'Could not validate name' }
  }

  return { clean: true, filtered: sanitized }
}
