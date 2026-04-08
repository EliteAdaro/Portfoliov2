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

// Note frequencies (chromatic, A3–E5)
const NOTE = {
  A3: 220.00, As3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63, F4: 349.23,
  Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, As4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25,
}
// Map note → pad index by pitch group (low / mid-low / mid-high / high)
const NOTE_TO_PAD = {
  A3: 0, As3: 0, B3: 0, C4: 0, Cs4: 0, D4: 0, Ds4: 0,
  E4: 1, F4: 1, Fs4: 1,
  G4: 2, Gs4: 2, A4: 2, As4: 2,
  B4: 3, C5: 3, Cs5: 3, D5: 3, Ds5: 3, E5: 3,
}

// Recognizable hooks from popular 2010-2024 hits (approximate transcriptions).
const SONGS = [
  { name: 'Blinding Lights — The Weeknd', notes: ['Fs4','Fs4','B4','Fs4','E4','Fs4','B4','Cs5','B4','Fs4','E4','Ds4','Cs4','B3','Fs4','Fs4','B4','Fs4','E4','Fs4','B4','Cs5','D5','Cs5','B4','A4','Fs4'] },
  { name: 'Bad Guy — Billie Eilish',      notes: ['G4','G4','G4','G4','G4','G4','Fs4','G4','B4','G4','G4','G4','G4','G4','G4','Fs4','G4','C5','G4','G4','G4','G4','G4','G4','Fs4','G4','D5'] },
  { name: 'Shape of You — Ed Sheeran',    notes: ['Cs5','Cs5','Cs5','B4','A4','B4','Cs5','Cs5','B4','A4','Fs4','A4','B4','Cs5','B4','A4','Fs4','E4','Fs4','A4','B4','Cs5','B4','A4'] },
  { name: 'Levitating — Dua Lipa',        notes: ['B4','A4','G4','A4','B4','D5','B4','A4','G4','A4','B4','D5','E5','D5','B4','A4','G4','E4','G4','A4','B4','A4','G4'] },
  { name: 'Animals — Martin Garrix',      notes: ['B4','B4','D5','B4','A4','B4','D5','E5','B4','B4','D5','B4','A4','G4','Fs4','E4','B4','B4','D5','B4','A4','B4','D5','E5'] },
  { name: 'Faded — Alan Walker',          notes: ['Fs4','E4','Cs4','B3','Cs4','E4','Fs4','A4','Fs4','E4','Cs4','B3','A3','B3','Cs4','E4','Fs4','A4','B4','A4','Fs4','E4','Cs4'] },
  { name: 'Shake It Off — Taylor Swift',  notes: ['B4','B4','B4','A4','B4','G4','B4','B4','B4','A4','B4','G4','E4','G4','A4','B4','A4','G4','E4','G4','A4','G4','E4'] },
  { name: 'Roar — Katy Perry',            notes: ['C4','C4','C4','C4','A4','G4','C4','C4','C4','D4','C4','A4','G4','E4','D4','C4','C4','C4','D4','E4','G4','A4','G4'] },
  { name: 'Despacito — Luis Fonsi',       notes: ['B4','A4','Fs4','D4','Fs4','A4','B4','A4','Fs4','D4','E4','Fs4','G4','Fs4','E4','D4','E4','Fs4','G4','A4','B4','A4','G4','Fs4','E4'] },
  { name: 'Believer — Imagine Dragons',   notes: ['A4','A4','C5','A4','A4','G4','A4','A4','C5','A4','A4','G4','E4','A4','A4','C5','D5','C5','A4','G4','E4','D4','E4','G4','A4'] },
]

function SimonGame() {
  const [variant, setVariant] = useState('classic') // classic | melody
  const [song, setSong] = useState(SONGS[0])
  const [randomSeq, setRandomSeq] = useState([]) // for classic mode
  const [round, setRound] = useState(0)
  const [playerIdx, setPlayerIdx] = useState(0)
  const [activePad, setActivePad] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [best, setBest] = useState(() => parseInt(localStorage.getItem('simon-best') || '0', 10))
  const timeoutsRef = useRef([])

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  // For melody mode get pad from note. For classic mode item is just a pad id.
  const getStep = (i, mode, s, seq) => {
    if (mode === 'melody') {
      const note = s.notes[i]
      return { pad: NOTE_TO_PAD[note], freq: NOTE[note] }
    }
    const pad = seq[i]
    return { pad, freq: GAME_PADS[pad].freq }
  }

  const showSequence = (len, mode = variant, s = song, seq = randomSeq) => {
    setPhase('showing')
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    for (let i = 0; i < len; i++) {
      const { pad, freq } = getStep(i, mode, s, seq)
      const onT = setTimeout(() => {
        setActivePad(pad)
        playTone(freq, 380)
      }, i * 480 + 400)
      const offT = setTimeout(() => setActivePad(null), i * 480 + 720)
      timeoutsRef.current.push(onT, offT)
    }
    const doneT = setTimeout(() => {
      setPhase('input')
      setPlayerIdx(0)
    }, len * 480 + 500)
    timeoutsRef.current.push(doneT)
  }

  const start = () => {
    if (variant === 'melody') {
      const s = SONGS[Math.floor(Math.random() * SONGS.length)]
      setSong(s)
      setRound(1)
      showSequence(1, 'melody', s, [])
    } else {
      const seq = [Math.floor(Math.random() * 4)]
      setRandomSeq(seq)
      setRound(1)
      showSequence(1, 'classic', song, seq)
    }
  }

  const handlePad = (id) => {
    if (phase !== 'input') return
    const { pad: expectedPad, freq } = getStep(playerIdx, variant, song, randomSeq)
    setActivePad(id)
    playTone(freq, 200)
    setTimeout(() => setActivePad(null), 200)

    if (id !== expectedPad) {
      setPhase('gameover')
      const score = round - 1
      if (score > best) {
        setBest(score)
        localStorage.setItem('simon-best', String(score))
      }
      return
    }

    if (playerIdx + 1 === round) {
      // Round complete
      if (variant === 'melody' && round >= song.notes.length) {
        setPhase('won')
        if (round > best) {
          setBest(round)
          localStorage.setItem('simon-best', String(round))
        }
        return
      }
      const nextRound = round + 1
      setRound(nextRound)
      if (variant === 'classic') {
        const newSeq = [...randomSeq, Math.floor(Math.random() * 4)]
        setRandomSeq(newSeq)
        setTimeout(() => showSequence(nextRound, 'classic', song, newSeq), 600)
      } else {
        setTimeout(() => showSequence(nextRound, 'melody', song, randomSeq), 600)
      }
    } else {
      setPlayerIdx(playerIdx + 1)
    }
  }

  const reset = () => {
    setRound(0)
    setPlayerIdx(0)
    setActivePad(null)
    setRandomSeq([])
    setPhase('idle')
  }

  const switchVariant = (v) => {
    if (phase !== 'idle' && phase !== 'gameover' && phase !== 'won') return
    setVariant(v)
    reset()
  }

  // Reveal song name after 10 notes (when player likely recognizes it)
  const revealSong = round >= 10

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3">
        {[
          { id: 'classic', label: '🔵 Classic' },
          { id: 'melody',  label: '🎵 Melody' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => switchVariant(v.id)}
            className={`px-3 py-1 text-[10px] font-mono rounded border transition-all ${
              variant === v.id ? 'border-primary text-primary bg-primary/10' : 'border-navy-lighter text-slate-400 hover:border-slate-500'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2 font-mono text-xs">
        <span className="text-slate-400">Round: <span className="text-primary">{round}</span></span>
        <span className="text-slate-400">Best: <span className="text-primary">{best}</span></span>
      </div>
      <div className="text-center mb-3 font-mono text-[11px] h-4">
        {variant === 'melody' && phase !== 'idle' && (
          revealSong
            ? <span className="text-primary">🎵 {song.name}</span>
            : <span className="text-slate-500">🎵 ??? — keep going to recognize it</span>
        )}
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
        {phase === 'won' && (
          <>
            <p className="text-green-400 font-mono text-sm mb-2">🏆 You played the whole song! ({song.name})</p>
            <button onClick={reset} className="px-4 py-2 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10">
              Play Again
            </button>
          </>
        )}
        {phase === 'gameover' && (
          <>
            <p className="text-red-400 font-mono text-sm mb-1">💀 Game Over — score: {round - 1}</p>
            {variant === 'melody' && (
              <p className="text-slate-400 font-mono text-[11px] mb-2">Song was: <span className="text-primary">{song.name}</span></p>
            )}
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
