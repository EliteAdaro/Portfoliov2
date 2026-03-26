import { useState } from 'react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from './snakeEngine'

const COLOR_PRESETS = [
  { name: 'Classic Green', snake: '#64ffda', snakeAlt: '#4fd1b0', label: 'green' },
  { name: 'Neon Blue', snake: '#60a5fa', snakeAlt: '#3b82f6', label: 'blue' },
  { name: 'Hot Pink', snake: '#f472b6', snakeAlt: '#ec4899', label: 'pink' },
  { name: 'Golden', snake: '#fbbf24', snakeAlt: '#f59e0b', label: 'gold' },
  { name: 'Purple', snake: '#a78bfa', snakeAlt: '#8b5cf6', label: 'purple' },
  { name: 'Orange', snake: '#fb923c', snakeAlt: '#f97316', label: 'orange' },
  { name: 'Red', snake: '#f87171', snakeAlt: '#ef4444', label: 'red' },
  { name: 'White', snake: '#e2e8f0', snakeAlt: '#cbd5e1', label: 'white' },
]

const BOARD_PRESETS = [
  { name: 'Navy', bg: '#0a192f', grid: '#112240', label: 'navy' },
  { name: 'Dark', bg: '#111111', grid: '#222222', label: 'dark' },
  { name: 'Forest', bg: '#0d1f0d', grid: '#1a3a1a', label: 'forest' },
  { name: 'Midnight', bg: '#0f0a2e', grid: '#1a1440', label: 'midnight' },
  { name: 'Charcoal', bg: '#1a1a2e', grid: '#2a2a4e', label: 'charcoal' },
]

const FOOD_STYLES = [
  { name: 'Simple', value: 'simple', desc: 'Red dot', emoji: '🔴' },
  { name: 'Apple', value: 'apple', desc: 'Classic apple', emoji: '🍎' },
  { name: 'Cherry', value: 'cherry', desc: 'Double cherry', emoji: '🍒' },
  { name: 'Orange', value: 'orange', desc: 'Orange fruit', emoji: '🍊' },
  { name: 'Grape', value: 'grape', desc: 'Grape cluster', emoji: '🍇' },
  { name: 'Melon', value: 'watermelon', desc: 'Watermelon slice', emoji: '🍉' },
  { name: 'Lemon', value: 'lemon', desc: 'Lemon', emoji: '🍋' },
  { name: 'Random', value: 'random', desc: 'Random fruit each time', emoji: '🎲' },
]

const HEAD_STYLES = [
  { name: 'Simple', value: 'simple', desc: 'Plain square' },
  { name: 'Medium', value: 'medium', desc: 'With eyes' },
  { name: 'Advanced', value: 'advanced', desc: 'Eyes + tongue' },
]

const TAIL_STYLES = [
  { name: 'Simple', value: 'simple', desc: 'Plain square' },
  { name: 'Medium', value: 'medium', desc: 'Rounded end' },
  { name: 'Advanced', value: 'advanced', desc: 'Tapered shape' },
]

export const DEFAULT_SETTINGS = {
  snakeColor: '#64ffda',
  snakeAltColor: '#4fd1b0',
  boardBg: '#0a192f',
  boardGrid: '#112240',
  headStyle: 'advanced',
  tailStyle: 'advanced',
  foodStyle: 'apple',
  difficulty: DEFAULT_DIFFICULTY,
}

export default function SnakeSettings({ settings, onChange }) {
  const [open, setOpen] = useState(false)

  const update = (key, value) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="w-full max-w-[400px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-primary border border-navy-lighter rounded hover:border-primary/40 transition-colors"
      >
        <Settings size={14} />
        Options
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="mt-2 p-4 bg-navy-light border border-navy-lighter rounded-lg space-y-4">
          {/* Difficulty */}
          <div>
            <label className="text-xs font-mono text-slate-300 mb-2 block">Difficulty</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(DIFFICULTIES).map((diff) => (
                <button
                  key={diff.key}
                  onClick={() => update('difficulty', diff.key)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-mono rounded border transition-all ${
                    settings.difficulty === diff.key
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-navy-lighter text-slate-400 hover:border-slate-500'
                  }`}
                  title={diff.desc}
                >
                  <span>{diff.icon}</span>
                  <span>{diff.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              {DIFFICULTIES[settings.difficulty]?.desc}
            </p>
          </div>

          {/* Snake Color */}
          <div>
            <label className="text-xs font-mono text-slate-300 mb-2 block">Snake Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onChange({ ...settings, snakeColor: preset.snake, snakeAltColor: preset.snakeAlt })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    settings.snakeColor === preset.snake
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-white/40'
                  }`}
                  style={{ backgroundColor: preset.snake }}
                  title={preset.name}
                />
              ))}
            </div>
            {/* Custom color picker */}
            <div className="flex items-center gap-2 mt-2">
              <label className="text-[10px] font-mono text-slate-500">Custom:</label>
              <input
                type="color"
                value={settings.snakeColor}
                onChange={(e) => {
                  const hex = e.target.value
                  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 20)
                  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 20)
                  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 20)
                  onChange({ ...settings, snakeColor: hex, snakeAltColor: `rgb(${r},${g},${b})` })
                }}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>

          {/* Board Color */}
          <div>
            <label className="text-xs font-mono text-slate-300 mb-2 block">Board</label>
            <div className="flex flex-wrap gap-2">
              {BOARD_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onChange({ ...settings, boardBg: preset.bg, boardGrid: preset.grid })}
                  className={`w-7 h-7 rounded border-2 transition-all ${
                    settings.boardBg === preset.bg
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-white/40'
                  }`}
                  style={{ backgroundColor: preset.bg }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Food Style */}
          <div>
            <label className="text-xs font-mono text-slate-300 mb-2 block">Food</label>
            <div className="flex flex-wrap gap-1.5">
              {FOOD_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => update('foodStyle', style.value)}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded border transition-all ${
                    settings.foodStyle === style.value
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-navy-lighter text-slate-400 hover:border-slate-500'
                  }`}
                  title={style.desc}
                >
                  <span>{style.emoji}</span>
                  <span>{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Head Style */}
          <div>
            <label className="text-xs font-mono text-slate-300 mb-2 block">Head Style</label>
            <div className="flex gap-2">
              {HEAD_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => update('headStyle', style.value)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-all ${
                    settings.headStyle === style.value
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-navy-lighter text-slate-400 hover:border-slate-500'
                  }`}
                  title={style.desc}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tail Style */}
          <div>
            <label className="text-xs font-mono text-slate-300 mb-2 block">Tail Style</label>
            <div className="flex gap-2">
              {TAIL_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => update('tailStyle', style.value)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-all ${
                    settings.tailStyle === style.value
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-navy-lighter text-slate-400 hover:border-slate-500'
                  }`}
                  title={style.desc}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange({ ...DEFAULT_SETTINGS })}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors underline"
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  )
}
