import { useState, useEffect, useRef } from 'react'

// Standard typing test: show a paragraph, user types, count correct chars,
// calculate WPM = (correct chars / 5) / (time in minutes). 60 second test.

const SAMPLE_WORDS = [
  'the','quick','brown','fox','jumps','over','lazy','dog','code','build','react',
  'design','create','learn','play','write','study','focus','grow','make','think',
  'simple','clean','fast','smart','clear','build','plan','test','ship','iterate',
  'function','variable','object','array','string','number','boolean','null','async',
  'browser','server','client','request','response','data','state','props','hook','effect',
]

function generateText(wordCount = 50) {
  return Array.from({ length: wordCount }, () => SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)]).join(' ')
}

const DURATION_S = 60

export default function Typing() {
  const [target, setTarget] = useState(generateText)
  const [input, setInput] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [timeLeft, setTimeLeft] = useState(DURATION_S)
  const [done, setDone] = useState(false)
  // Cumulative stats — never decrement on backspace
  const [totalTyped, setTotalTyped] = useState(0)
  const [totalErrors, setTotalErrors] = useState(0)
  const prevLenRef = useRef(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!startedAt || done) return
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const left = Math.max(0, DURATION_S - elapsed)
      setTimeLeft(left)
      if (left === 0) {
        setDone(true)
        clearInterval(id)
      }
    }, 200)
    return () => clearInterval(id)
  }, [startedAt, done])

  const handleChange = (e) => {
    if (done) return
    if (!startedAt) setStartedAt(Date.now())
    const newInput = e.target.value
    // Only count NEW chars (don't count on backspace)
    if (newInput.length > prevLenRef.current) {
      let newChars = 0
      let newErrors = 0
      for (let i = prevLenRef.current; i < newInput.length; i++) {
        newChars++
        if (newInput[i] !== target[i]) newErrors++
      }
      setTotalTyped((t) => t + newChars)
      setTotalErrors((e) => e + newErrors)
    }
    prevLenRef.current = newInput.length
    setInput(newInput)
  }

  const reset = () => {
    setTarget(generateText())
    setInput('')
    setStartedAt(null)
    setTimeLeft(DURATION_S)
    setDone(false)
    setTotalTyped(0)
    setTotalErrors(0)
    prevLenRef.current = 0
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Stats — count currently-correct chars for WPM (standard net WPM)
  let correctNow = 0
  for (let i = 0; i < input.length; i++) if (input[i] === target[i]) correctNow++
  const elapsedSec = startedAt ? Math.max(1, (Date.now() - startedAt) / 1000) : DURATION_S
  const minutesElapsed = elapsedSec / 60
  const wpm = Math.round((correctNow / 5) / Math.max(0.05, minutesElapsed))
  const accuracy = totalTyped > 0
    ? Math.max(0, Math.round(((totalTyped - totalErrors) / totalTyped) * 100))
    : 100

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6 max-w-2xl w-full">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center font-mono">
        <div className="bg-navy/40 rounded p-2">
          <div className="text-[10px] text-slate-400">TIME</div>
          <div className="text-lg text-primary">{timeLeft}s</div>
        </div>
        <div className="bg-navy/40 rounded p-2">
          <div className="text-[10px] text-slate-400">WPM</div>
          <div className="text-lg text-primary">{wpm}</div>
        </div>
        <div className="bg-navy/40 rounded p-2">
          <div className="text-[10px] text-slate-400">ACCURACY</div>
          <div className="text-lg text-primary">{accuracy}%</div>
        </div>
      </div>

      {/* Text display */}
      <div className="bg-navy/40 rounded p-4 mb-4 font-mono text-base leading-relaxed select-none break-words">
        {target.split('').map((ch, i) => {
          let cls = 'text-slate-500'
          if (i < input.length) cls = input[i] === ch ? 'text-primary' : 'text-red-400 underline'
          if (i === input.length) cls += ' bg-primary/20'
          return <span key={i} className={cls}>{ch}</span>
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        disabled={done}
        autoFocus
        className="w-full px-3 py-2 bg-navy border border-navy-lighter rounded text-lightest-slate font-mono text-sm focus:outline-none focus:border-primary disabled:opacity-50"
        placeholder="Start typing..."
      />

      {done && (
        <div className="mt-4 text-center">
          <p className="text-green-400 font-mono text-sm mb-2">⏱️ Time! Final: {wpm} WPM @ {accuracy}% accuracy</p>
          <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
            New Test
          </button>
        </div>
      )}
    </div>
  )
}
