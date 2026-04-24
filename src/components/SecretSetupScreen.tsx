import { RoomHeader } from './RoomHeader'

interface SecretSetupScreenProps {
  roomCode: string
  playerName: string
  copied: boolean
  onCopy: () => void
  secretCode: string
  onSecretCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmitSecretCode: () => void
  onKeyDown: (e: React.KeyboardEvent, action: () => void) => void
}

export function SecretSetupScreen({
  roomCode,
  playerName,
  copied,
  onCopy,
  secretCode,
  onSecretCodeChange,
  onSubmitSecretCode,
  onKeyDown,
}: SecretSetupScreenProps) {
  return (
    <div className="game-container">
      <div className="game-card">
        <RoomHeader variant="lobby" roomCode={roomCode} playerName={playerName} copied={copied} onCopy={onCopy} />

        <div className="secret-section">
          <h2>Set Your Secret Code</h2>
          <p className="hint">Choose a number your opponent will try to guess</p>
          <div className="secret-input-group">
            <input
              placeholder="Enter secret number"
              value={secretCode}
              onChange={onSecretCodeChange}
              onKeyDown={(e) => onKeyDown(e, onSubmitSecretCode)}
              className="input input-secret"
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={onSubmitSecretCode}
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
