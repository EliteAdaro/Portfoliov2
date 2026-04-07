import { useState, useEffect, useRef } from 'react'

// Standard Simon: 4 colored buttons. Each round adds 1 step to the sequence.
// Player must repeat the full sequence. Wrong button = game over.

const PADS = [
  { id: 0, color: 'bg-green-500',  active: 'bg-green-300',  freq: 261.63 }, // C4
  { id: 1, color: 'bg-red-500',    active: 'bg-red-300',    freq: 329.63 }, // E4
  { id: 2, color: 'bg-yellow-500', active: 'bg-yellow-300', freq: 392.00 }, // G4
  { id: 3, color: 'bg-blue-500',   active: 'bg-blue-300',   freq: 523.25 }, // C5
]

let audioCtx = null
function playTone(freq, duration = 300) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.frequency.value = freq
    o.type = 'sine'
    o.connect(g)
    g.connect(audioCtx.destination)
    g.gain.setValueAtTime(0.15, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000)
    o.start()
    o.stop(audioCtx.currentTime + duration / 1000)
  } catch {}
}

export default function Simon() {
  const [sequence, setSequence] = useState([])
  const [playerIdx, setPlayerIdx] = useState(0)
  const [activePad, setActivePad] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | showing | input | gameover
  const [best, setBest] = useState(() => parseInt(localStorage.getItem('simon-best') || '0', 10))
  const timeoutsRef = useRef([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  const showSequence = (seq) => {
    setPhase('showing')
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    seq.forEach((id, i) => {
      const onT = setTimeout(() => {
        setActivePad(id)
        playTone(PADS[id].freq)
      }, i * 600 + 400)
      const offT = setTimeout(() => setActivePad(null), i * 600 + 700)
      timeoutsRef.current.push(onT, offT)
    })
    const doneT = setTimeout(() => {
      setPhase('input')
      setPlayerIdx(0)
    }, seq.length * 600 + 500)
    timeoutsRef.current.push(doneT)
  }

  const start = () => {
    const first = [Math.floor(Math.random() * 4)]
    setSequence(first)
    showSequence(first)
  }

  const handlePad = (id) => {
    if (phase !== 'input') return
    setActivePad(id)
    playTone(PADS[id].freq, 200)
    setTimeout(() => setActivePad(null), 200)

    if (id !== sequence[playerIdx]) {
      setPhase('gameover')
      const score = sequence.length - 1
      if (score > best) {
        setBest(score)
        localStorage.setItem('simon-best', String(score))
      }
      return
    }

    if (playerIdx + 1 === sequence.length) {
      // Round complete — add new step
      const next = [...sequence, Math.floor(Math.random() * 4)]
      setSequence(next)
      setTimeout(() => showSequence(next), 600)
    } else {
      setPlayerIdx(playerIdx + 1)
    }
  }

  const reset = () => {
    setSequence([])
    setPlayerIdx(0)
    setActivePad(null)
    setPhase('idle')
  }

  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 font-mono text-xs">
        <span className="text-slate-400">Round: <span className="text-primary">{Math.max(0, sequence.length - (phase === 'showing' || phase === 'input' ? 0 : 1))}</span></span>
        <span className="text-slate-400">Best: <span className="text-primary">{best}</span></span>
      </div>

      <div className="grid grid-cols-2 gap-3 w-64">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            onClick={() => handlePad(pad.id)}
            disabled={phase !== 'input'}
            className={`w-28 h-28 rounded-lg transition-all ${
              activePad === pad.id ? pad.active + ' scale-95' : pad.color + ' opacity-70 hover:opacity-100'
            } ${phase !== 'input' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        {phase === 'idle' && (
          <button onClick={start} className="px-4 py-2 bg-primary text-navy font-mono text-sm font-semibold rounded hover:bg-primary-dark">
            Start
          </button>
        )}
        {phase === 'showing' && <p className="text-xs font-mono text-slate-400">Watch the pattern...</p>}
        {phase === 'input' && <p className="text-xs font-mono text-primary">Your turn — repeat it</p>}
        {phase === 'gameover' && (
          <>
            <p className="text-red-400 font-mono text-sm mb-2">💀 Game Over — score: {sequence.length - 1}</p>
            <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
