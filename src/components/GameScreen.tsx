import type { GuessData } from '../types/game'
import { RoomHeader } from './RoomHeader'
import { HighlightedDigits } from './HighlightedDigits'

interface GameScreenProps {
  roomCode: string
  playerName: string
  opponentName: string
  secretCode: string
  myTurn: boolean
  copied: boolean
  onCopy: () => void
  guess: string
  lastGuess: string
  myGameHistory: GuessData[]
  opponentGameHistory: GuessData[]
  onGuessChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmitGuess: () => void
  onKeyDown: (e: React.KeyboardEvent, action: () => void) => void
}

export function GameScreen({
  roomCode,
  playerName,
  opponentName,
  secretCode,
  myTurn,
  copied,
  onCopy,
  guess,
  lastGuess,
  myGameHistory,
  opponentGameHistory,
  onGuessChange,
  onSubmitGuess,
  onKeyDown,
}: GameScreenProps) {
  return (
    <div className="game-container">
      <div className="game-card game-active">
        <RoomHeader
          variant="game"
          roomCode={roomCode}
          copied={copied}
          onCopy={onCopy}
          secretCode={secretCode}
          myTurn={myTurn}
          opponentName={opponentName}
        />

        <div className="game-board">
          {lastGuess && myGameHistory.length > 0 && (
            <div className="feedback-banner">
              <span className="feedback-guess">Your guess:</span>
              <span className="feedback-guess-highlighted">
                <HighlightedDigits
                  number={myGameHistory[myGameHistory.length - 1].guessedNumber}
                  correctPositions={myGameHistory[myGameHistory.length - 1].correctPositions}
                />
              </span>
            </div>
          )}

          {myTurn && (
            <div className="guess-section">
              <div className="guess-input-group">
                <input
                  type="text"
                  placeholder="Enter your guess..."
                  value={guess}
                  onChange={onGuessChange}
                  onKeyDown={(e) => onKeyDown(e, onSubmitGuess)}
                  className="input input-guess"
                  maxLength={4}
                  autoFocus
                />
                <button
                  className="btn btn-primary"
                  onClick={onSubmitGuess}
                  disabled={!guess.trim()}
                >
                  Guess
                </button>
              </div>
            </div>
          )}

          <div className="history-section">
            <div className="history-columns">
              <div className="history-column">
                <h3 className="history-title">{playerName ? `${playerName}'s Guesses` : 'Your Guesses'}</h3>
                {myGameHistory.length === 0 ? (
                  <p className="history-empty">No guesses yet</p>
                ) : (
                  <div className="history-list">
                    {[...myGameHistory].reverse().map((entry, idx) => (
                      <div key={idx} className="history-item">
                        <span className="history-guess">
                          <HighlightedDigits number={entry.guessedNumber} correctPositions={entry.correctPositions} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="history-column">
                <h3 className="history-title">{opponentName ? `${opponentName}'s Guesses` : "Opponent's Guesses"}</h3>
                {opponentGameHistory.length === 0 ? (
                  <p className="history-empty">No guesses yet</p>
                ) : (
                  <div className="history-list">
                    {[...opponentGameHistory].reverse().map((entry, idx) => (
                      <div key={idx} className="history-item opponent">
                        <span className="history-guess">
                          <HighlightedDigits number={entry.guessedNumber} correctPositions={entry.correctPositions} isOpponent />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
