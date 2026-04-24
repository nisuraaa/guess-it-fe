# Frontend Coding Guidelines

## Stack
- React 19, TypeScript 6, Vite, ESLint (`typescript-eslint` + `react-hooks` plugin)

## File & Folder Structure
```
src/
├── components/      # Reusable UI components (one file per component)
├── hooks/           # Custom React hooks
├── types/           # Shared TypeScript interfaces and types
├── assets/          # Static assets
├── App.tsx          # Root component — routing/layout only, minimal state
└── main.tsx         # Entry point — do not add logic here
```

`App.tsx` must not contain inline SVG icons, large state blocks, or render logic for multiple distinct screens. Split each screen (Lobby, SecretSetup, Waiting, Game, GameOver) into its own component file.

## Components
- One component per file. File name matches the component name: `LobbyScreen.tsx` exports `LobbyScreen`.
- Components are functions, never classes.
- Extract inline SVG icons into `components/icons/` or a shared `icons.tsx` file.
- Props interfaces are named `[ComponentName]Props` and defined in the same file.

```tsx
interface GuessInputProps {
  onSubmit: (value: string) => void
  disabled: boolean
}

export function GuessInput({ onSubmit, disabled }: GuessInputProps) { ... }
```

## TypeScript
- No `any`. Use `unknown` when the type is genuinely unknown, then narrow it.
- WebSocket message payloads must be typed — define a discriminated union for all incoming message shapes.

```ts
type WsMessage =
  | { action: 'SECRET_SET'; success: boolean; playerTurn: string; players: string[] }
  | { action: 'POST_GUESS'; playerTurn: string; guessHistory: GuessHistory }
  | { action: 'GAME_ENDED'; winner: string }
  | { action: 'ERROR'; message: string }
```

- Types shared across files go in `src/types/`. Keep component-local types in the component file.
- Prefer `interface` for object shapes; use `type` for unions, intersections, and aliases.

## Custom Hooks
Extract stateful logic out of components into custom hooks in `src/hooks/`. The WebSocket connection, game state, and guess history are natural hook responsibilities.

```ts
// src/hooks/useGameSocket.ts
export function useGameSocket(playerCode: string, roomCode: string) {
  // manages ws lifecycle, dispatches parsed messages
  return { gameState, sendGuess, sendSecret }
}
```

A component that manages more than ~3 pieces of `useState` or contains a `useEffect` over 10 lines is a signal to extract a hook.

## State Management
- Keep state as close to where it is used as possible. Lift only when siblings need to share it.
- Group related state in a single object when the fields always change together.
- `useCallback` is only needed when a function is a dependency of `useEffect` or a prop of a memoized child. Don't add it reflexively.

## Event Handlers
Prefix handler functions with `handle`: `handleGuessChange`, `handleKeyDown`, `handleSubmit`.

## Environment Variables
Access env vars only through `import.meta.env`. Never hard-code URLs or hostnames.
All required vars must be documented in `.env.example`.

## Naming Conventions
| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `GameBoard` |
| Hooks | camelCase, `use` prefix | `useGameSocket` |
| Regular functions | camelCase | `renderHighlightedDigits` |
| Types / Interfaces | PascalCase | `GuessData`, `WsMessage` |
| Constants | UPPER_SNAKE_CASE | `MAX_DIGITS` |
| CSS class names | kebab-case | `game-card`, `turn-badge` |

## Styling
- All styles go in CSS files — no inline `style` props except for truly dynamic values (e.g., computed widths).
- Class names are scoped per component to avoid collisions. Consider CSS Modules when the project grows.
- Do not use `!important`.

## Error Handling
- Show user-facing error messages in the UI, not in `console.error` alone.
- Catch `fetch` rejections and WebSocket errors; set an error state that renders a visible message.
- Use proper TypeScript narrowing inside `catch` blocks — do not assume the caught value is an `Error`.

```ts
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error'
  setError(message)
}
```

## Key Prop
Never use array index as `key` for lists that can reorder or grow. Use a stable, unique identifier from the data. In guess history, use the guess number or a combination of player + index until IDs are added to the model.

## General
- No `console.log` in committed code. Use conditional logging gated on `import.meta.env.DEV`.
- `window.location.reload()` to reset game state is acceptable for now; replace with proper state reset when routing is added.
- Run `npm run lint` and fix all warnings before committing.
- Run `npm run build` to confirm no TypeScript errors before pushing.
