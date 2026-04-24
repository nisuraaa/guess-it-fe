import { CopyIcon, CheckIcon, UsersIcon, ClockIcon } from './icons'

type RoomHeaderProps =
  | {
      variant: 'lobby'
      roomCode: string
      playerName: string
      copied: boolean
      onCopy: () => void
    }
  | {
      variant: 'game'
      roomCode: string
      secretCode: string
      myTurn: boolean
      opponentName: string
      copied: boolean
      onCopy: () => void
    }

export function RoomHeader(props: RoomHeaderProps) {
  const { roomCode, copied, onCopy } = props

  return (
    <div className="room-header">
      <div className="room-info">
        <span className="room-label">Room Code</span>
        <div className="room-code-display">
          <code className="room-code">{roomCode}</code>
          <button className="btn-icon" onClick={onCopy} title="Copy room code">
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>

      {props.variant === 'lobby' ? (
        <div className="player-badge">
          <UsersIcon />
          <span>{props.playerName}</span>
        </div>
      ) : (
        <>
          <div className="secret-code-display">
            <span className="room-label">Your Secret</span>
            <code className="secret-code">{props.secretCode}</code>
          </div>
          <div className="turn-indicator">
            {props.myTurn ? (
              <span className="turn-badge your-turn">Your Turn</span>
            ) : (
              <span className="turn-badge waiting">
                <ClockIcon />
                {props.opponentName ? `${props.opponentName}'s Turn` : "Opponent's Turn"}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
