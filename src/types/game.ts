export interface GuessData {
  guessedNumber: string
  correctPositions: number[]
}

export type WsMessage =
  | { action: 'SECRET_SET'; success: boolean; playerTurn: string; players: string[]; playerNames: Record<string, string> }
  | { action: 'POST_GUESS'; playerTurn: string; guessHistory: Record<string, GuessData[]>; playerCode: string; guessedNumber: string; correctPositions: number[]; winner: null }
  | { action: 'GAME_ENDED'; winner: string; guessHistory: Record<string, GuessData[]> }
  | { action: 'ERROR'; message: string }
  | { action: 'GUESS'; success: false; message: string }
