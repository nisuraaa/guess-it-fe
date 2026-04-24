import type { GuessData } from '../types/game'
import { TrophyIcon, GamepadIcon } from './icons'

interface GameOverScreenProps {
  playerWon: boolean
  myGameHistory: GuessData[]
  opponentGameHistory: GuessData[]
  onReset: () => void
}

export function GameOverScreen({ playerWon, myGameHistory, opponentGameHistory, onReset }: GameOverScreenProps) {
  return (
    <div className="game-container">
      <div className={`game-over-card ${playerWon ? 'win' : 'loss'}`}>
        <div className="game-over-icon">
          {playerWon ? <TrophyIcon /> : <GamepadIcon />}
        </div>
        <h1 className="game-over-title">
          {playerWon ? 'Victory!' : 'Game Over'}
        </h1>
        <p className="game-over-message">
          {playerWon ? 'You cracked the code!' : 'Better luck next time!'}
        </p>
        <div className="game-over-stats">
          <div className="stat">
            <span className="stat-label">Your Guesses</span>
            <span className="stat-value">{myGameHistory.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Opponent Guesses</span>
            <span className="stat-value">{opponentGameHistory.length}</span>
          </div>
        </div>
        <button className="btn btn-primary btn-large" onClick={onReset}>
          Play Again
        </button>
      </div>
    </div>
  )
}
