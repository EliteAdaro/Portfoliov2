import { useState, useEffect, useRef } from 'react'

// Simon game + free-play piano mode.
// GAME: 4 colored pads, repeat the growing sequence.
// PIANO: 8 pads (C major scale), free play to make music.

const GAME_PADS = [
  { id: 0, color: 'bg-green-500',  active: 'bg-green-300',  freq: 261.63 }, // C4
  { id: 1, color: 'bg-red-500',    active: 'bg-red-300',    freq: 329.63 }, // E4
  { id: 2, color: 'bg-yellow-500', active: 'bg-yellow-300', freq: 392.00 }, // G4
  { id: 3, color: 'bg-blue-500',   active: 'bg-blue-300',   freq: 523.25 }, // C5
]

// C major scale — one octave
const PIANO_PADS = [
  { id: 0, name: 'C',  freq: 261.63, color: 'bg-red-500',     active: 'bg-red-300',     key: 'a' },
  { id: 1, name: 'D',  freq: 293.66, color: 'bg-orange-500',  active: 'bg-orange-300',  key: 's' },
  { id: 2, name: 'E',  freq: 329.63, color: 'bg-yellow-500',  active: 'bg-yellow-300',  key: 'd' },
  { id: 3, name: 'F',  freq: 349.23, color: 'bg-green-500',   active: 'bg-green-300',   key: 'f' },
  { id: 4, name: 'G',  freq: 392.00, color: 'bg-cyan-500',    active: 'bg-cyan-300',    key: 'g' },
  { id: 5, name: 'A',  freq: 440.00, color: 'bg-blue-500',    active: 'bg-blue-300',    key: 'h' },
  { id: 6, name: 'B',  freq: 493.88, color: 'bg-purple-500',  active: 'bg-purple-300',  key: 'j' },
  { id: 7, name: 'C2', freq: 523.25, color: 'bg-pink-500',    active: 'bg-pink-300',    key: 'k' },
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
  const [mode, setMode] = useState('game') // game | piano
  return (
    <div className="bg-navy-light/50 border border-navy-lighter rounded-xl p-6">
      <div className="flex gap-2 justify-center mb-4">
        {['game', 'piano'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 text-[11px] font-mono rounded border transition-all ${
              mode === m ? 'border-primary text-primary bg-primary/10' : 'border-navy-lighter text-slate-400 hover:border-slate-500'
            }`}
          >
            {m === 'game' ? '🎯 Simon' : '🎹 Piano'}
          </button>
        ))}
      </div>
      {mode === 'game' ? <SimonGame /> : <Piano />}
    </div>
  )
}

function SimonGame() {
  const [sequence, setSequence] = useState([])
  const [playerIdx, setPlayerIdx] = useState(0)
  const [activePad, setActivePad] = useState(null)
  const [phase, setPhase] = useState('idle')
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
        playTone(GAME_PADS[id].freq)
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
    playTone(GAME_PADS[id].freq, 200)
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
    <div>
      <div className="flex items-center justify-between mb-4 font-mono text-xs">
        <span className="text-slate-400">Round: <span className="text-primary">{Math.max(0, sequence.length - (phase === 'showing' || phase === 'input' ? 0 : 1))}</span></span>
        <span className="text-slate-400">Best: <span className="text-primary">{best}</span></span>
      </div>

      <div className="grid grid-cols-2 gap-3 w-64 mx-auto">
        {GAME_PADS.map((pad) => (
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

function Piano() {
  const [active, setActive] = useState(null)
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState([])
  const recStartRef = useRef(0)

  const press = (pad) => {
    setActive(pad.id)
    playTone(pad.freq, 400)
    setTimeout(() => setActive((a) => (a === pad.id ? null : a)), 200)
    if (recording) {
      setRecorded((r) => [...r, { id: pad.id, t: performance.now() - recStartRef.current }])
    }
  }

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      const pad = PIANO_PADS.find((p) => p.key === e.key.toLowerCase())
      if (pad && !e.repeat) press(pad)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [recording])

  const toggleRecord = () => {
    if (recording) {
      setRecording(false)
    } else {
      setRecorded([])
      recStartRef.current = performance.now()
      setRecording(true)
    }
  }

  const playback = () => {
    recorded.forEach(({ id, t }) => {
      setTimeout(() => {
        const pad = PIANO_PADS[id]
        setActive(id)
        playTone(pad.freq, 400)
        setTimeout(() => setActive((a) => (a === id ? null : a)), 200)
      }, t)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-4 font-mono text-xs">
        <button
          onClick={toggleRecord}
          className={`px-3 py-1 rounded border ${recording ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-navy-lighter text-slate-400 hover:border-slate-500'}`}
        >
          {recording ? '⏺ Stop' : '⏺ Record'}
        </button>
        <button
          onClick={playback}
          disabled={!recorded.length || recording}
          className="px-3 py-1 rounded border border-navy-lighter text-slate-400 hover:border-slate-500 disabled:opacity-30"
        >
          ▶ Play ({recorded.length})
        </button>
        <button
          onClick={() => setRecorded([])}
          disabled={!recorded.length}
          className="px-3 py-1 rounded border border-navy-lighter text-slate-400 hover:border-slate-500 disabled:opacity-30"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-1.5 justify-center">
        {PIANO_PADS.map((pad) => (
          <button
            key={pad.id}
            onClick={() => press(pad)}
            className={`w-12 h-32 rounded-b-lg flex flex-col items-center justify-end pb-2 transition-all ${
              active === pad.id ? pad.active + ' scale-95' : pad.color + ' opacity-80 hover:opacity-100'
            }`}
          >
            <span className="text-[10px] font-mono font-bold text-white">{pad.name}</span>
            <span className="text-[9px] font-mono text-white/70 uppercase">{pad.key}</span>
          </button>
        ))}
      </div>

      <p className="text-[10px] font-mono text-slate-500 mt-3 text-center">
        Click pads or press A S D F G H J K — record & play back your tunes
      </p>
    </div>
  )
}
