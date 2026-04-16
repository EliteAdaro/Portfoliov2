import { useState, useEffect, useCallback, useMemo } from 'react'
import { Delete } from 'lucide-react'

// Progressive Wordle: clear each length from 3 up to 10.
// Fixed 5 guesses per level — stays challenging even at longer lengths,
// which is the whole point of keeping it tight.
// Evaluation follows the standard Wordle duplicate-letter algorithm:
//   1) mark exact-position matches green and consume those target slots;
//   2) remaining guess letters go yellow if an unused target slot holds
//      that letter; otherwise absent.
// Space shortcut: at a position where a previous guess already locked in
// a green letter, pressing space auto-fills it so the player doesn't have
// to re-type known-correct letters every round.

const MAX_GUESSES = 5

const WORDS = {
  en: {
    3: ['cat','dog','sun','run','eat','big','red','box','cup','bus','cow','owl','pig','fox','bee','ant','bat','hat','map','key','ice','jar','joy','kid','leg','lip','net','oak','pen','pot','ram','sea','tea','toy','van','war','web','win','yes','zoo','ace','age','arm','art','bag','bar','bay','bed','boy','bun'],
    4: ['tree','fish','bird','book','door','game','hand','home','king','lamp','moon','nest','note','open','pear','play','rain','road','rock','salt','ship','snow','song','star','time','wind','word','work','year','face','fire','jump','lake','lion','milk','park'],
    5: ['apple','bread','chair','cloud','dance','earth','flame','ghost','happy','light','music','night','ocean','paint','quiet','river','smile','table','under','voice','world','young','zebra','brave','drink','eagle','fruit','plant','sword','tiger'],
    6: ['banana','castle','dragon','flower','garden','hidden','island','jungle','kitten','letter','member','number','orange','planet','rabbit','simple','turtle','unique','window','yellow','silver','coffee','forest','bridge','danger','escape'],
    7: ['biscuit','chicken','diamond','evening','factory','gallery','harvest','journey','kitchen','library','mistake','natural','octopus','picture','quality','rainbow','society','teacher','unicorn','village','mystery','capital','freedom'],
    8: ['airplane','birthday','computer','daughter','elephant','favorite','hospital','internet','language','mountain','november','official','painting','question','research','sandwich','treasure','umbrella','vacation','dinosaur'],
    9: ['adventure','beautiful','chocolate','community','dangerous','education','furniture','happiness','important','knowledge','operation','political','professor','telephone','wonderful','different','breakfast','geography','something','discovery'],
    10: ['background','basketball','experience','friendship','helicopter','incredible','laboratory','management','motorcycle','restaurant','revolution','television','understand','volleyball','playground','strawberry','vegetarian','everything','wilderness'],
  },
  nl: {
    3: ['kat','dak','dag','pen','bed','zon','zee','man','jas','hok','pak','pot','rug','tas','ton','uur','vak','vat','vos','vis','wit','zak','zes','rat','bol','kop','lam','oog','oor','pas','pet','pit','pop','put','sap','tip','nek','nat','hek','gek','lef','mol','rol','rij','rit','rok','sla'],
    4: ['boom','huis','boot','been','vuur','melk','boek','kast','deur','vier','vijf','roos','maan','zand','gras','hout','rood','geel','blad','tand','vlag','bril','held','muur','duin','tijd','paar','leer','slak','berg','kind','hond','zoon','hoed','soep','wolk','tuin','veer','jaar','weer','week','bank','fles'],
    5: ['water','appel','boven','onder','draak','fiets','groen','hemel','licht','maand','paard','regen','stoel','tafel','vader','vrouw','bloem','broer','plein','plant','zomer','avond','schip','vogel','brood','bruin','druif','engel','kroon','lucht','muts','muziek'],
    6: ['banaan','koning','herfst','honing','keizer','kachel','klaver','koffer','liefde','muisje','paleis','rivier','ruimte','verder','tapijt','strand','moeder','winter','school','docent','tijger','wolken','laptop','keuken','koffie','mensen','sprong','dromen','lopen','kussen','trouwen'],
    7: ['weekend','magneet','maandag','vrolijk','zondags','brieven','blijven','dertien','dokters','spreker','dochter','dinsdag','vrijdag','broodje','kappers','kerkhof','meester','nieuwste','natuurs','boekjes','lezende','kijkers'],
    8: ['computer','internet','kinderen','woensdag','zaterdag','gitarist','liederen','voertuig','schilder','tapijten','kamperen','avontuur','bladeren','bergpass','dichters','geleerd','gekregen','opzoeken','vogeltje'],
    9: ['donderdag','onderling','weekenden','politieke','nederland','kleurstof','geboorten','gemiddeld','goedkoper','spannende','studenten','vierkante','vriendjes','zomertijd','basketbal','revolutie','televisie','volleybal','aardbeien','wildernis','brandende','ontbreken','verplicht'],
    10: ['zaterdagen','verjaardag','helikopter','motorfiets','restaurant','waterdicht','huisdieren','landbouwer','onderdelen','tijdperken','uitnodigen','wetenschap'],
  },
}

// Safety: strip any mis-length entries so a typo in the table can't brick a level.
for (const langKey of Object.keys(WORDS)) {
  for (const k of Object.keys(WORDS[langKey])) {
    const n = Number(k)
    WORDS[langKey][n] = WORDS[langKey][n].filter((w) => w.length === n)
  }
}

const LANGUAGES = [
  { code: 'en', label: 'EN', aria: 'English' },
  { code: 'nl', label: 'NL', aria: 'Nederlands' },
]

const LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10]

const KEY_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['ENTER', ...'ZXCVBNM'.split(''), 'BACKSPACE'],
]

// Strings keyed by language — kept inline rather than threaded through i18n
// because this is the only place in the game that needs translation.
const T = {
  en: {
    triesLeft: (n) => `${n} ${n === 1 ? 'try' : 'tries'} left`,
    level: (c, t) => `Level ${c} / ${t}`,
    needLetters: (n) => `Need ${n} letters`,
    noGreenHere: 'No green letter here yet',
    solved: (w, n) => `Solved ${w} in ${n} ${n === 1 ? 'try' : 'tries'}`,
    nextTo: (n) => `Next: ${n} letters →`,
    outOfTries: 'Out of tries',
    wordWas: 'The word was',
    retryLevel: 'Retry level',
    startOver: 'Start over',
    cleared: 'You cleared all 8 lengths!',
    finalWas: 'Final word was',
    playAgain: 'Play again',
    spaceHint: 'SPACE = fill confirmed letter',
  },
  nl: {
    triesLeft: (n) => `${n} ${n === 1 ? 'poging' : 'pogingen'} over`,
    level: (c, t) => `Level ${c} / ${t}`,
    needLetters: (n) => `${n} letters nodig`,
    noGreenHere: 'Nog geen groene letter hier',
    solved: (w, n) => `${w} opgelost in ${n} ${n === 1 ? 'poging' : 'pogingen'}`,
    nextTo: (n) => `Volgende: ${n} letters →`,
    outOfTries: 'Geen pogingen meer',
    wordWas: 'Het woord was',
    retryLevel: 'Opnieuw',
    startOver: 'Begin opnieuw',
    cleared: 'Je hebt alle 8 lengtes voltooid!',
    finalWas: 'Laatste woord was',
    playAgain: 'Speel opnieuw',
    spaceHint: 'SPATIE = groene letter invullen',
  },
}

function pickWord(langCode, length) {
  const list = WORDS[langCode]?.[length]
  if (!list || list.length === 0) return ''
  return list[Math.floor(Math.random() * list.length)]
}

function evaluate(guess, target) {
  const result = Array(guess.length).fill('absent')
  const used = Array(target.length).fill(false)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct'
      used[i] = true
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue
    for (let j = 0; j < target.length; j++) {
      if (!used[j] && guess[i] === target[j]) {
        result[i] = 'present'
        used[j] = true
        break
      }
    }
  }
  return result
}

// correct beats present beats absent beats unused
const STATE_RANK = { correct: 3, present: 2, absent: 1 }

// Consistent color tokens — used for both tile backgrounds and keyboard.
const TILE_COLOR = {
  correct: 'bg-green-600 border-green-600 text-white',
  present: 'bg-yellow-500 border-yellow-500 text-white',
  absent: 'bg-slate-700 border-slate-700 text-slate-300',
  empty: 'bg-navy border-navy-lighter text-lightest-slate',
  filled: 'bg-navy border-slate-500 text-lightest-slate',
  // Faded green preview — shows where SPACE will auto-fill.
  hint: 'bg-navy border-green-600/30 text-green-600/40',
}

const KEY_COLOR = {
  correct: 'bg-green-600 text-white',
  present: 'bg-yellow-500 text-white',
  absent: 'bg-slate-700 text-slate-400',
  unused: 'bg-slate-400 text-navy hover:bg-slate-300',
}

export default function Wordle() {
  const [lang, setLang] = useState('en')
  const [lengthIdx, setLengthIdx] = useState(0)
  const [target, setTarget] = useState(() => pickWord('en', 3))
  const [guesses, setGuesses] = useState([]) // [{ word, result }]
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState('playing') // playing | wonLevel | lost | complete
  const [flashMsg, setFlashMsg] = useState('')
  const [shake, setShake] = useState(false)

  const length = LENGTHS[lengthIdx]
  const maxGuesses = MAX_GUESSES
  const t = T[lang]

  const flash = useCallback((msg) => {
    setFlashMsg(msg)
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setTimeout(() => setFlashMsg(''), 1400)
  }, [])

  // Aggregate best known state per letter across all submitted guesses.
  const keyStates = useMemo(() => {
    const states = {}
    for (const { word, result } of guesses) {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i].toUpperCase()
        const next = result[i]
        const prev = states[letter]
        if (!prev || STATE_RANK[next] > STATE_RANK[prev]) states[letter] = next
      }
    }
    return states
  }, [guesses])

  // Confirmed green positions aggregated across guesses — drives both the
  // space-to-fill shortcut and the faded hint rendered in the in-progress row.
  const greenAt = useMemo(() => {
    const map = {}
    for (const { word, result } of guesses) {
      for (let i = 0; i < word.length; i++) {
        if (result[i] === 'correct') map[i] = word[i].toUpperCase()
      }
    }
    return map
  }, [guesses])

  const submitGuess = useCallback(() => {
    if (current.length !== length) {
      flash(t.needLetters(length))
      return
    }
    const lower = current.toLowerCase()
    const result = evaluate(lower, target)
    const nextGuesses = [...guesses, { word: lower, result }]
    setGuesses(nextGuesses)
    setCurrent('')

    if (lower === target) {
      if (lengthIdx === LENGTHS.length - 1) setStatus('complete')
      else setStatus('wonLevel')
    } else if (nextGuesses.length >= maxGuesses) {
      setStatus('lost')
    }
  }, [current, length, target, guesses, lengthIdx, maxGuesses, flash, t])

  const handleKey = useCallback((key) => {
    if (status !== 'playing') return
    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrent((c) => c.slice(0, -1))
    } else if (key === 'SPACE') {
      // Space at a locked-green slot auto-fills that letter. We never move
      // past an unsolved slot — that would break the "one letter per slot"
      // mental model and scramble how guesses read back.
      const filled = greenAt[current.length]
      if (current.length >= length) return
      if (filled) setCurrent((c) => c + filled)
      else flash(t.noGreenHere)
    } else if (/^[A-Z]$/.test(key)) {
      setCurrent((c) => (c.length < length ? c + key : c))
    }
  }, [status, length, submitGuess, greenAt, current.length, flash, t])

  useEffect(() => {
    const listener = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // preventDefault stops keystrokes from leaking into the CommandPalette
      // terminal input that sits behind the game modal — without this, typing
      // feeds the terminal and never reaches the Wordle board.
      if (e.key === 'Enter') { e.preventDefault(); handleKey('ENTER') }
      else if (e.key === 'Backspace') { e.preventDefault(); handleKey('BACKSPACE') }
      else if (e.key === ' ') { e.preventDefault(); handleKey('SPACE') }
      else if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); handleKey(e.key.toUpperCase()) }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [handleKey])

  const nextLevel = () => {
    const next = lengthIdx + 1
    setLengthIdx(next)
    setTarget(pickWord(lang, LENGTHS[next]))
    setGuesses([])
    setCurrent('')
    setStatus('playing')
  }

  const retryLevel = () => {
    setTarget(pickWord(lang, length))
    setGuesses([])
    setCurrent('')
    setStatus('playing')
  }

  const restart = () => {
    setLengthIdx(0)
    setTarget(pickWord(lang, 3))
    setGuesses([])
    setCurrent('')
    setStatus('playing')
  }

  // Switching language wipes progress and restarts from the 3-letter level so
  // the in-flight target and on-screen state match the new word list.
  const changeLang = (next) => {
    if (next === lang) return
    setLang(next)
    setLengthIdx(0)
    setTarget(pickWord(next, 3))
    setGuesses([])
    setCurrent('')
    setStatus('playing')
  }

  // Build the fixed-size grid: submitted rows, then the in-progress row, then blanks.
  const rows = []
  for (let r = 0; r < maxGuesses; r++) {
    if (r < guesses.length) {
      rows.push({ type: 'submitted', data: guesses[r] })
    } else if (r === guesses.length && status === 'playing') {
      rows.push({ type: 'current', data: current })
    } else {
      rows.push({ type: 'empty' })
    }
  }

  const hasGreens = Object.keys(greenAt).length > 0

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-4 sm:p-6 max-w-xl w-full">
      {/* Header: level, language picker, tries */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          {t.level(lengthIdx + 1, LENGTHS.length)}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-navy-lighter/60 rounded p-0.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                aria-label={l.aria}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-colors ${
                  lang === l.code
                    ? 'bg-primary text-navy'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {length}L · {t.triesLeft(maxGuesses - guesses.length)}
          </div>
        </div>
      </div>

      {/* Level pips */}
      <div className="flex justify-center gap-1 mb-4">
        {LENGTHS.map((len, i) => (
          <div
            key={len}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < lengthIdx ? 'bg-green-500' : i === lengthIdx ? 'bg-primary' : 'bg-navy-lighter'
            }`}
            title={`${len} letters`}
          />
        ))}
      </div>

      {/* Flash message */}
      <div className="h-6 text-center mb-1">
        {flashMsg && (
          <span className="inline-block px-3 py-1 bg-slate-800 text-white text-xs font-mono rounded">
            {flashMsg}
          </span>
        )}
      </div>

      {/* Board */}
      <div className={`flex flex-col items-center gap-1.5 mb-3 ${shake ? 'animate-[shake_0.3s]' : ''}`}>
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5">
            {Array.from({ length }).map((_, cIdx) => {
              let letter = ''
              let cls = TILE_COLOR.empty
              if (row.type === 'submitted') {
                letter = row.data.word[cIdx].toUpperCase()
                cls = TILE_COLOR[row.data.result[cIdx]]
              } else if (row.type === 'current') {
                const typed = row.data[cIdx] || ''
                if (typed) {
                  letter = typed
                  cls = TILE_COLOR.filled
                } else if (greenAt[cIdx]) {
                  // Faded preview of the letter space will auto-fill here.
                  letter = greenAt[cIdx]
                  cls = TILE_COLOR.hint
                }
              }
              // Tile size shrinks as the word grows so 10 still fits on mobile.
              const size = length <= 5 ? 'w-11 h-11 text-xl' : length <= 7 ? 'w-9 h-9 text-lg' : 'w-7 h-7 text-sm'
              return (
                <div
                  key={cIdx}
                  className={`${size} flex items-center justify-center font-bold font-mono uppercase border-2 rounded ${cls} transition-colors`}
                >
                  {letter}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Space hint — only surface it once a green is actually locked in. */}
      <div className="h-4 text-center mb-2 text-[9px] font-mono text-slate-500 tracking-wide">
        {hasGreens && status === 'playing' ? t.spaceHint : ''}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-1.5">
        {KEY_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const isAction = key === 'ENTER' || key === 'BACKSPACE'
              const state = isAction ? 'unused' : (keyStates[key] || 'unused')
              const color = KEY_COLOR[state]
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  disabled={status !== 'playing'}
                  className={`${isAction ? 'px-2 text-[10px]' : 'w-7 sm:w-8 text-xs'} h-10 flex items-center justify-center font-mono font-bold rounded uppercase transition-colors disabled:opacity-60 ${color}`}
                  aria-label={key}
                >
                  {key === 'BACKSPACE' ? <Delete className="w-4 h-4" /> : key === 'ENTER' ? 'Enter' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* End-of-level overlays */}
      {status === 'wonLevel' && (
        <div className="mt-5 text-center">
          <p className="text-green-400 font-mono text-sm mb-3">
            ✅ {t.solved(target.toUpperCase(), guesses.length)}
          </p>
          <button
            onClick={nextLevel}
            className="px-5 py-2 bg-primary text-navy font-mono text-sm font-bold rounded hover:bg-primary-dark"
          >
            {t.nextTo(LENGTHS[lengthIdx + 1])}
          </button>
        </div>
      )}
      {status === 'lost' && (
        <div className="mt-5 text-center">
          <p className="text-red-400 font-mono text-sm mb-1">💀 {t.outOfTries}</p>
          <p className="text-slate-400 font-mono text-xs mb-3">
            {t.wordWas} <span className="text-primary uppercase">{target}</span>
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={retryLevel} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
              {t.retryLevel}
            </button>
            <button onClick={restart} className="px-4 py-2 border border-slate-500 text-slate-400 font-mono text-sm rounded hover:bg-slate-500/10">
              {t.startOver}
            </button>
          </div>
        </div>
      )}
      {status === 'complete' && (
        <div className="mt-5 text-center">
          <p className="text-green-400 font-mono text-sm mb-1">🏆 {t.cleared}</p>
          <p className="text-slate-400 font-mono text-xs mb-3">
            {t.finalWas} <span className="text-primary uppercase">{target}</span>
          </p>
          <button onClick={restart} className="px-5 py-2 bg-primary text-navy font-mono text-sm font-bold rounded hover:bg-primary-dark">
            {t.playAgain}
          </button>
        </div>
      )}

      {/* Inline keyframes for shake feedback on invalid submit */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          20% { transform: translateX(-6px) }
          40% { transform: translateX(6px) }
          60% { transform: translateX(-4px) }
          80% { transform: translateX(4px) }
        }
      `}</style>
    </div>
  )
}
