import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

// Types
interface GuessData {
  guessedNumber: string
  correctPositions: number[]
}

// Icons as components for better control
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

function App() {
  // Refs
  const wsRef = useRef<WebSocket | null>(null)

  // Player & Room State
  const [playerCode, setPlayerCode] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')

  // Game State
  const [gameStart, setGameStart] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [playerWon, setPlayerWon] = useState(false)
  const [myTurn, setMyTurn] = useState(false)

  // Secret Code State
  const [secretCode, setSecretCode] = useState('')
  const [waitForOtherPlayers, setWaitForOtherPlayers] = useState(false)
  const [secretSubmitted, setSecretSubmitted] = useState(false)

  // Guess State
  const [guess, setGuess] = useState('')
  const [lastGuess, setLastGuess] = useState('')

  // UI State
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  // History State
  const [myGameHistory, setMyGameHistory] = useState<GuessData[]>([])
  const [opponentGameHistory, setOpponentGameHistory] = useState<GuessData[]>([])
  const [opponentPlayerCode, setOpponentPlayerCode] = useState('')

  const copyRoomCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomCode])

  useEffect(() => {
    if (!playerCode) return

    const ws = new WebSocket(import.meta.env.VITE_WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data)

      if (data.action === 'SECRET_SET' && data.success) {
        setWaitForOtherPlayers(false)
        const player = data.players.find((player: any) => player !== playerCode)
        setOpponentPlayerCode(player)
        setGameStart(true)
        setMyTurn(data.playerTurn === playerCode)
      }

      if (data.action === 'POST_GUESS') {
        setMyTurn(data.playerTurn === playerCode)
        const myHistory = data.guessHistory[playerCode] || []
        const oppHistory = data.guessHistory[opponentPlayerCode] || []
        setMyGameHistory(myHistory)
        setOpponentGameHistory(oppHistory)
        
        // Show last guess feedback
        if (myHistory.length > 0) {
          const last = myHistory[myHistory.length - 1]
          setLastGuess(last.guessedNumber)
        }
      }

      if (data.action === 'GAME_ENDED') {
        setGameEnded(true)
        setPlayerWon(data.winner === playerCode)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection error. Please try again.')
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      ws.close()
    }
  }, [playerCode, opponentPlayerCode])

  const createRoom = async () => {
    setError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/room`, { method: 'POST' })
      const data = await response.json()
      setRoomCode(data.roomCode)
      setPlayerCode(data.playerCode)
    } catch {
      setError('Failed to create room. Please try again.')
    }
  }

  const joinRoom = async () => {
    setError('')
    if (!joinRoomCode.trim()) {
      setError('Please enter a room code')
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: joinRoomCode }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
        return
      }
      setRoomCode(joinRoomCode)
      setPlayerCode(data.playerCode)
    } catch {
      setError('Failed to join room. Please try again.')
    }
  }

  const handleSecretCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.value.length > 4) return;
    setSecretCode(e.target.value)
  }

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.value.length > 4) return;
    setGuess(e.target.value)
  }

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinRoomCode(e.target.value.toUpperCase())
  }

  const submitSecretCode = () => {
    if (!secretCode.trim()) return
    setSecretSubmitted(true)
    setWaitForOtherPlayers(true)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'SET_SECRET',
        secretNumber: secretCode,
        playerCode: playerCode,
        roomCode: roomCode
      }))
    }
  }

  const submitGuess = () => {
    if (!guess.trim()) return
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'GUESS',
        guessedNumber: guess,
        playerCode: playerCode,
        roomCode: roomCode
      }))
      setGuess('')
    }
  }

  const resetGame = () => {
    window.location.reload()
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
  }

  // Render digits with correct ones highlighted based on correctPositions array
  const renderHighlightedDigits = (number: string, correctPositions: number[], isOpponent?: boolean) => {
    if (!number || !correctPositions) return number
    return number.split('').map((digit, idx) => (
      <span
        key={idx}
        className={correctPositions[idx] === 1
          ? (isOpponent ? 'digit-correct-opponent' : 'digit-correct')
          : 'digit'}
      >
        {digit}
      </span>
    ))
  }

  // Render game over screen
  if (gameEnded) {
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
          <button className="btn btn-primary btn-large" onClick={resetGame}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  // Render lobby screen
  if (!roomCode || !playerCode) {
    return (
      <div className="game-container">
        <div className="lobby-card">
          <div className="lobby-header">
            <div className="logo">
              <GamepadIcon />
            </div>
            <h1>Thinogie's Guessing Game</h1>

          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="lobby-actions">
            <button className="btn btn-primary btn-large" onClick={createRoom}>
              Create New Room
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="join-section">
              <input
                type="text"
                placeholder="Enter room code"
                value={joinRoomCode}
                onChange={handleRoomCodeChange}
                onKeyDown={(e) => handleKeyDown(e, joinRoom)}
                className="input input-large"
                maxLength={10}
              />
              <button className="btn btn-secondary btn-large" onClick={joinRoom}>
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render waiting for opponent to set secret
  if (!gameStart && !secretSubmitted) {
    return (
      <div className="game-container">
        <div className="game-card">
          <div className="room-header">
            <div className="room-info">
              <span className="room-label">Room Code</span>
              <div className="room-code-display">
                <code className="room-code">{roomCode}</code>
                <button className="btn-icon" onClick={copyRoomCode} title="Copy room code">
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
            <div className="player-badge">
              <UsersIcon />
              <span>Player: {playerCode.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="secret-section">
            <h2>Set Your Secret Code</h2>
            <p className="hint">Choose a number your opponent will try to guess</p>
            <div className="secret-input-group">
              <input
                placeholder="Enter secret number"
                value={secretCode}
                onChange={handleSecretCodeChange}
                onKeyDown={(e) => handleKeyDown(e, submitSecretCode)}
                className="input input-secret"
                autoFocus
              />
              <button
                className="btn btn-primary"
                onClick={submitSecretCode}
                disabled={!secretCode.trim()}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render waiting screen
  if (waitForOtherPlayers) {
    return (
      <div className="game-container">
        <div className="game-card">
          <div className="room-header">
            <div className="room-info">
              <span className="room-label">Room Code</span>
              <div className="room-code-display">
                <code className="room-code">{roomCode}</code>
                <button className="btn-icon" onClick={copyRoomCode} title="Copy room code">
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
            <div className="player-badge">
              <UsersIcon />
              <span>Player: {playerCode.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="waiting-section">
            <div className="spinner" />
            <h2>Waiting for opponent...</h2>
            <p className="hint">Your secret code is set. Game will start when your opponent is ready.</p>
          </div>
        </div>
      </div>
    )
  }

  // Render main game
  return (
    <div className="game-container">
      <div className="game-card game-active">
        <div className="room-header">
          <div className="room-info">
            <span className="room-label">Room Code</span>
            <div className="room-code-display">
              <code className="room-code">{roomCode}</code>
              <button className="btn-icon" onClick={copyRoomCode} title="Copy room code">
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>
          <div className="secret-code-display">
            <span className="room-label">Your Secret</span>
            <code className="secret-code">{secretCode}</code>
          </div>
          <div className="turn-indicator">
            {myTurn ? (
              <span className="turn-badge your-turn">Your Turn</span>
            ) : (
              <span className="turn-badge waiting">
                <ClockIcon />
                Opponent's Turn
              </span>
            )}
          </div>
        </div>

        <div className="game-board">
          {/* Last Guess Feedback */}
          {lastGuess && myGameHistory.length > 0 && (
            <div className="feedback-banner">
              <span className="feedback-guess">Your guess:</span>
              <span className="feedback-guess-highlighted">
                {renderHighlightedDigits(
                  myGameHistory[myGameHistory.length - 1].guessedNumber,
                  myGameHistory[myGameHistory.length - 1].correctPositions
                )}
              </span>
            </div>
          )}

          {/* Guess Input */}
          {myTurn && (
            <div className="guess-section">
              <div className="guess-input-group">
                <input
                  type="text"
                  placeholder="Enter your guess..."
                  value={guess}
                  onChange={handleGuessChange}
                  onKeyDown={(e) => handleKeyDown(e, submitGuess)}
                  className="input input-guess"
                  maxLength={4}
                  autoFocus
                />
                <button
                  className="btn btn-primary"
                  onClick={submitGuess}
                  disabled={!guess.trim()}
                >
                  Guess
                </button>
              </div>
            </div>
          )}

          {/* Game History */}
          <div className="history-section">
            <div className="history-columns">
              {/* Your Guesses */}
              <div className="history-column">
                <h3 className="history-title">Your Guesses</h3>
                {myGameHistory.length === 0 ? (
                  <p className="history-empty">No guesses yet</p>
                ) : (
                  <div className="history-list">
                    {[...myGameHistory].reverse().map((entry, idx) => (
                      <div key={idx} className="history-item">
                        <span className="history-guess">
                          {renderHighlightedDigits(entry.guessedNumber, entry.correctPositions)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Opponent Guesses */}
              <div className="history-column">
                <h3 className="history-title">Opponent's Guesses</h3>
                {opponentGameHistory.length === 0 ? (
                  <p className="history-empty">No guesses yet</p>
                ) : (
                  <div className="history-list">
                    {[...opponentGameHistory].reverse().map((entry, idx) => (
                      <div key={idx} className="history-item opponent">
                        <span className="history-guess">
                          {renderHighlightedDigits(entry.guessedNumber, entry.correctPositions, true)}
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

export default App
