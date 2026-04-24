interface HighlightedDigitsProps {
  number: string
  correctPositions: number[]
  isOpponent?: boolean
}

export function HighlightedDigits({ number, correctPositions, isOpponent = false }: HighlightedDigitsProps) {
  if (!number || !correctPositions) return <>{number}</>
  return (
    <>
      {number.split('').map((digit, idx) => (
        <span
          key={idx}
          className={correctPositions[idx] === 1
            ? (isOpponent ? 'digit-correct-opponent' : 'digit-correct')
            : 'digit'}
        >
          {digit}
        </span>
      ))}
    </>
  )
}
