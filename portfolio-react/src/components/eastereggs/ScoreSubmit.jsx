import { useState } from 'react'
import { checkName } from '../../lib/profanityFilter'
import { submitHighscore } from '../../lib/highscoreService'

export default function ScoreSubmit({ score, onSubmitted, onSkip }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const result = checkName(name)
    if (!result.clean) {
      setError(result.reason)
      return
    }

    setSubmitting(true)
    const { success, error: submitError } = await submitHighscore(result.filtered, score)
    setSubmitting(false)

    if (success) {
      onSubmitted()
    } else {
      setError(submitError || 'Failed to submit score')
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-navy/90 rounded-lg z-10">
      <div className="text-center p-6 max-w-xs">
        <p className="text-2xl font-bold text-primary mb-1">Game Over!</p>
        <p className="text-lightest-slate font-mono text-sm mb-4">
          Score: <span className="text-primary font-bold">{score}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="Enter your name..."
              maxLength={12}
              autoFocus
              className="w-full px-3 py-2 bg-navy-lighter border border-navy-lighter rounded-md text-lightest-slate font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
            />
            {error && (
              <p className="text-red-400 text-xs font-mono mt-1">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || name.trim().length === 0}
              className="flex-1 px-4 py-2 bg-primary text-navy font-mono text-sm font-semibold rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 border border-slate-500 text-slate-400 font-mono text-sm rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
