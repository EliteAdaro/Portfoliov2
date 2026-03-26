import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import SnakeGame from '../components/eastereggs/SnakeGame'

export default function NotFoundPage() {
  const location = useLocation()
  const [showGame, setShowGame] = useState(location.state?.startGame === true)

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-xl">
        {!showGame && (
          <>
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
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showGame ? 0 : 0.6 }}
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
            <div className="space-y-4">
              <p className="text-sm font-mono text-primary">🐍 404 Snake</p>
              <SnakeGame />
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/"
                  className="px-5 py-2 bg-primary text-navy font-mono text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  ← Back to Portfolio
                </a>
                <button
                  onClick={() => setShowGame(false)}
                  className="px-5 py-2 border border-primary text-primary font-mono text-sm rounded-lg hover:bg-primary/10 transition-colors"
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
