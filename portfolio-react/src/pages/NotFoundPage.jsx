import { useState } from 'react'
import { motion } from 'framer-motion'
import SnakeGame from '../components/eastereggs/SnakeGame'

export default function NotFoundPage() {
  const [showGame, setShowGame] = useState(false)

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="text-center max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-extrabold text-primary font-mono"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-lightest-slate mt-4"
        >
          Page not found
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-text mt-2 mb-8"
        >
          The page you&apos;re looking for doesn&apos;t exist. But since you&apos;re here...
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {!showGame ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-3 bg-primary text-navy font-mono text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Go Home
              </a>
              <button
                onClick={() => setShowGame(true)}
                className="px-6 py-3 border border-primary text-primary font-mono text-sm rounded-lg hover:bg-primary/10 transition-colors"
              >
                🐍 Play Snake Instead
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <SnakeGame />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/"
                  className="px-6 py-3 bg-primary text-navy font-mono text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  ← Back to Portfolio
                </a>
                <button
                  onClick={() => setShowGame(false)}
                  className="px-6 py-3 border border-primary text-primary font-mono text-sm rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Hide Game
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
