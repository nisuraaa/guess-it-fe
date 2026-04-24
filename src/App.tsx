import './App.css'
import { useGameState } from './hooks/useGameState'
import { LobbyScreen } from './components/LobbyScreen'
import { SecretSetupScreen } from './components/SecretSetupScreen'
import { WaitingScreen } from './components/WaitingScreen'
import { GameScreen } from './components/GameScreen'
import { GameOverScreen } from './components/GameOverScreen'

function App() {
  const {
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
  } = useGameState()

  if (gameEnded) {
    return (
      <GameOverScreen
        playerWon={playerWon}
        myGameHistory={myGameHistory}
        opponentGameHistory={opponentGameHistory}
        onReset={resetGame}
      />
    )
  }

  if (!roomCode || !playerCode) {
    return (
      <LobbyScreen
        nameInput={nameInput}
        joinRoomCode={joinRoomCode}
        error={error}
        onNameChange={handleNameChange}
        onRoomCodeChange={handleRoomCodeChange}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onKeyDown={handleKeyDown}
      />
    )
  }

  if (!gameStart && !secretSubmitted) {
    return (
      <SecretSetupScreen
        roomCode={roomCode}
        playerName={playerName}
        copied={copied}
        onCopy={copyRoomCode}
        secretCode={secretCode}
        onSecretCodeChange={handleSecretCodeChange}
        onSubmitSecretCode={submitSecretCode}
        onKeyDown={handleKeyDown}
      />
    )
  }

  if (waitForOtherPlayers) {
    return (
      <WaitingScreen
        roomCode={roomCode}
        playerName={playerName}
        copied={copied}
        onCopy={copyRoomCode}
      />
    )
  }

  return (
    <GameScreen
      roomCode={roomCode}
      playerName={playerName}
      opponentName={opponentName}
      secretCode={secretCode}
      myTurn={myTurn}
      copied={copied}
      onCopy={copyRoomCode}
      guess={guess}
      lastGuess={lastGuess}
      myGameHistory={myGameHistory}
      opponentGameHistory={opponentGameHistory}
      onGuessChange={handleGuessChange}
      onSubmitGuess={submitGuess}
      onKeyDown={handleKeyDown}
    />
  )
}

export default App
