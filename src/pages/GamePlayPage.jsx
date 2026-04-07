import { useParams, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { getGame } from '../components/eastereggs/games/gamesRegistry'
import GameWrapper from '../components/eastereggs/games/GameWrapper'

export default function GamePlayPage() {
  const { id } = useParams()
  const game = getGame(id)

  if (!game) return <Navigate to="/games" replace />

  const GameComponent = game.component

  return (
    <GameWrapper title={game.name} emoji={game.emoji}>
      <Suspense fallback={<div className="text-primary font-mono">Loading {game.name}...</div>}>
        <GameComponent />
      </Suspense>
    </GameWrapper>
  )
}
