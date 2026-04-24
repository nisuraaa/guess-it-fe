import { RoomHeader } from './RoomHeader'

interface WaitingScreenProps {
  roomCode: string
  playerName: string
  copied: boolean
  onCopy: () => void
}

export function WaitingScreen({ roomCode, playerName, copied, onCopy }: WaitingScreenProps) {
  return (
    <div className="game-container">
      <div className="game-card">
        <RoomHeader variant="lobby" roomCode={roomCode} playerName={playerName} copied={copied} onCopy={onCopy} />

        <div className="waiting-section">
          <div className="spinner" />
          <h2>Waiting for opponent...</h2>
          <p className="hint">Your secret code is set. Game will start when your opponent is ready.</p>
        </div>
      </div>
    </div>
  )
}
