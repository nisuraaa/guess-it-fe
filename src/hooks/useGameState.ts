import { useState, useEffect, useRef, useCallback } from 'react'
import type { WsMessage, GuessData } from '../types/game'

export function useGameState() {
  const wsRef = useRef<WebSocket | null>(null)

  const [playerCode, setPlayerCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')
  const [nameInput, setNameInput] = useState('')

  const [gameStart, setGameStart] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [playerWon, setPlayerWon] = useState(false)
  const [myTurn, setMyTurn] = useState(false)

  const [secretCode, setSecretCode] = useState('')
  const [waitForOtherPlayers, setWaitForOtherPlayers] = useState(false)
  const [secretSubmitted, setSecretSubmitted] = useState(false)

  const [guess, setGuess] = useState('')
  const [lastGuess, setLastGuess] = useState('')

  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

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
      if (import.meta.env.DEV) console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as WsMessage

      if (data.action === 'SECRET_SET' && data.success) {
        setWaitForOtherPlayers(false)
        const opponentCode = data.players.find((p) => p !== playerCode) ?? ''
        setOpponentPlayerCode(opponentCode)
        setOpponentName(data.playerNames[opponentCode] ?? opponentCode.slice(0, 8))
        setGameStart(true)
        setMyTurn(data.playerTurn === playerCode)
      }

      if (data.action === 'POST_GUESS') {
        setMyTurn(data.playerTurn === playerCode)
        const myHistory = data.guessHistory[playerCode] || []
        const oppHistory = data.guessHistory[opponentPlayerCode] || []
        setMyGameHistory(myHistory)
        setOpponentGameHistory(oppHistory)

        if (myHistory.length > 0) {
          const last = myHistory[myHistory.length - 1]
          setLastGuess(last.guessedNumber)
        }
      }

      if (data.action === 'GAME_ENDED') {
        setGameEnded(true)
        setPlayerWon(data.winner === playerCode)
        const myHistory = data.guessHistory[playerCode] || []
        const oppHistory = data.guessHistory[opponentPlayerCode] || []
        setMyGameHistory(myHistory)
        setOpponentGameHistory(oppHistory)
      }
    }

    ws.onerror = () => {
      setError('Connection error. Please try again.')
    }

    ws.onclose = () => {
      if (import.meta.env.DEV) console.log('WebSocket disconnected')
    }

    return () => {
      ws.close()
    }
  }, [playerCode, opponentPlayerCode])

  const createRoom = async () => {
    setError('')
    if (!nameInput.trim()) {
      setError('Please enter your name')
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: nameInput.trim() }),
      })
      const data = await response.json()
      setRoomCode(data.roomCode)
      setPlayerCode(data.playerCode)
      setPlayerName(nameInput.trim())
    } catch {
      setError('Failed to create room. Please try again.')
    }
  }

  const joinRoom = async () => {
    setError('')
    if (!nameInput.trim()) {
      setError('Please enter your name')
      return
    }
    if (!joinRoomCode.trim()) {
      setError('Please enter a room code')
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: joinRoomCode, playerName: nameInput.trim() }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
        return
      }
      setRoomCode(joinRoomCode)
      setPlayerCode(data.playerCode)
      setPlayerName(nameInput.trim())
    } catch {
      setError('Failed to join room. Please try again.')
    }
  }

  const handleSecretCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 4) return
    setSecretCode(e.target.value)
  }

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 4) return
    setGuess(e.target.value)
  }

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinRoomCode(e.target.value.toUpperCase())
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value)
  }

  const submitSecretCode = () => {
    if (!secretCode.trim()) return
    setSecretSubmitted(true)
    setWaitForOtherPlayers(true)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'SET_SECRET',
        secretNumber: secretCode,
        playerCode,
        roomCode,
      }))
    }
  }

  const submitGuess = () => {
    if (!guess.trim()) return
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'GUESS',
        guessedNumber: guess,
        playerCode,
        roomCode,
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

  return {
    playerCode,
    playerName,
    opponentName,
    roomCode,
    joinRoomCode,
    nameInput,
    gameStart,
    gameEnded,
    playerWon,
    myTurn,
    secretCode,
    waitForOtherPlayers,
    secretSubmitted,
    guess,
    lastGuess,
    copied,
    error,
    myGameHistory,
    opponentGameHistory,
    copyRoomCode,
    createRoom,
    joinRoom,
    handleSecretCodeChange,
    handleGuessChange,
    handleRoomCodeChange,
    handleNameChange,
    submitSecretCode,
    submitGuess,
    resetGame,
    handleKeyDown,
  }
}
