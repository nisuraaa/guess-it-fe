import { GamepadIcon } from './icons'

interface LobbyScreenProps {
  nameInput: string
  joinRoomCode: string
  error: string
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRoomCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCreateRoom: () => void
  onJoinRoom: () => void
  onKeyDown: (e: React.KeyboardEvent, action: () => void) => void
}

export function LobbyScreen({
  nameInput,
  joinRoomCode,
  error,
  onNameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onKeyDown,
}: LobbyScreenProps) {
  return (
    <div className="game-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <div className="logo">
            <GamepadIcon />
          </div>
          <h1>Guessing Game</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="lobby-actions">
          <div className="name-section">
            <input
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={onNameChange}
              onKeyDown={(e) => onKeyDown(e, onCreateRoom)}
              className="input input-large"
              maxLength={20}
              autoFocus
            />
          </div>

          <button className="btn btn-primary btn-large" onClick={onCreateRoom}>
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
              onChange={onRoomCodeChange}
              onKeyDown={(e) => onKeyDown(e, onJoinRoom)}
              className="input input-large"
              maxLength={10}
            />
            <button className="btn btn-secondary btn-large" onClick={onJoinRoom}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
