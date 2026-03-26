// Server-side profanity filter (mirrors client — defense in depth)
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity'

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
})

const EXTRA_BANNED = [
  'kut','kutje','lul','hoer','kanker','tering','tyfus','klootzak','godverdomme',
  'kutwijf','mongool','debiel','eikel','drol','schijt','neuk','neuken','pik',
  'kak','stront','flikker','mof','nikker','trut','teef','slet','kankerlijer',
  'tyfuslijer','kankermongool','kankerlul','kuthoer','godsamme','oprotten',
  'pleur','pleuris','pest','pestlijer','reet','kontgat','pikkie','homo','cancer',
  'scheisse','arschloch','wichser','hurensohn','fotze','schwuchtel','missgeburt',
  'spast','behindert','drecksau','vollidiot','fick','ficken','hure','nutte',
  'schlampe','depp','trottel','penner','wixer',
  'merde','putain','connard','connasse','salope','encule','bordel','foutre',
  'batard','pute','chienne','nique',
  'puta','mierda','joder','cabron','pendejo','chinga','maricon','perra',
  'culo','verga','gilipollas',
  'neger','nazi','hitler',
]

const LEET_MAP = {
  '0':'o','1':'i','2':'z','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g',
  '@':'a','!':'i','$':'s','+':'t','|':'i',
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g,'').split('').map(c=>LEET_MAP[c]||c).join('')
}

function dedupAggressive(text) { return text.replace(/(.)\1+/g,'$1') }

function checkExtraWords(text) {
  const variants = [
    text.toLowerCase().replace(/[^a-z]/g,''),
    normalize(text),
    dedupAggressive(normalize(text)),
    text.toLowerCase().replace(/[_\-.\s]/g,''),
  ]
  for (const v of variants) for (const w of EXTRA_BANNED) if (v.includes(w)) return true
  return false
}

const NAME_REGEX = /^[a-zA-Z0-9 _-]+$/
const INJECTION = ['drop','delete','insert','update','select','union','script','alert','eval','function','onclick','onerror']

export function checkNameServer(name) {
  if (!name || typeof name !== 'string') return { clean: false, reason: 'Name is required' }
  const sanitized = name.replace(/<[^>]*>/g, '').trim()

  if (sanitized.length < 2) return { clean: false, reason: 'Name too short (min 2)' }
  if (sanitized.length > 12) return { clean: false, reason: 'Name too long (max 12)' }
  if (!NAME_REGEX.test(sanitized)) return { clean: false, reason: 'Letters, numbers, spaces, _ and - only' }

  const lower = sanitized.toLowerCase()
  if (INJECTION.some(p => lower.includes(p))) return { clean: false, reason: 'Invalid name' }

  if (matcher.hasMatch(sanitized)) return { clean: false, reason: 'Keep it friendly!' }
  const stripped = sanitized.replace(/[_\-\s]/g, '')
  if (stripped !== sanitized && matcher.hasMatch(stripped)) return { clean: false, reason: 'Keep it friendly!' }
  if (checkExtraWords(sanitized)) return { clean: false, reason: 'Keep it friendly!' }

  return { clean: true, filtered: sanitized }
}
