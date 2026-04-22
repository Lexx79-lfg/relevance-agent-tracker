# Relevance Agent Architecture

## Current Shape
Relevance Agent is a one-page local prototype for a mentor loop:

1. User names the current mission.
2. User chooses a mentor mode.
3. User describes what is happening.
4. App generates short guidance, a helpful phrase, and one next step.
5. User completes the step.
6. App updates token progress and logs the step.

The current goal is to keep this loop working while slowly separating logic into clear, beginner-friendly modules.

The product direction is broader than a one-page utility app. The app should move toward a multi-page mentor ecosystem while keeping the current MVP loop useful during development.

Uncertainty note: the current repo is still a one-page React app. Multi-page structure should be prepared incrementally, not built all at once.

## Current Modules

### App Shell
File: `src/App.tsx`

Owns the page layout and wires the major pieces together:
- mission input
- mentor mode selection
- situation input
- response panel
- quote panel
- rocket progress
- completed steps
- step log
- local app state updates

Keep this file readable. Extract only when a section becomes hard to follow.

### Mentor Engine
File: `src/lib/mentor.ts`

Owns mentor behavior:
- mentor mode metadata
- prompt chips
- mode quotes
- keyword/context matching
- response generation

This is the future integration point for AI-assisted mentor responses. Until then, keep responses rule-based, short, calm, and useful.

The mentor should remain a constant presence across future pages, not only inside one response card.

### Shared Types
File: `src/types/app.ts`

Owns reusable data shapes:
- `MentorMode`
- `MentorResponse`
- `LogEntry`
- `DailyCheckIn`
- `MentorProfile`
- `AppState`

Prefer adding clear types here instead of scattering local type definitions through components.

### App State And Persistence
File: `src/lib/appState.ts`

Owns:
- default app state
- localStorage key
- localStorage load/save helpers
- safe defaults for older saved data

For now, keep persistence local. Do not add backend, auth, database, sync, or accounts unless explicitly requested.

### Daily Check-In
File: `src/components/DailyCheckIn.tsx`

Owns the small daily check-in UI. It should stay lightweight and support the mentor loop without becoming a separate product surface yet.

## Near-Term Boundaries

### Progress System
Current location: mostly `src/App.tsx`

Future extraction target:
- token count
- milestone count
- rocket progress percentage
- completed steps
- reinforcement copy
- countdown state for rocket milestone moments
- theme-ready milestone metadata

Do not extract until the current behavior is stable and the next change needs it.

Progress must preserve functional clarity, emotional resonance, and motivating delight. Tokens and milestones are part of the reward loop, not just counters.

### Log System
Current location: mostly `src/App.tsx`

Future extraction target:
- step log entry creation
- mission history
- timestamp formatting
- later reflection support

Keep the display simple and readable.

### Profile Model
Current location: `src/types/app.ts` and `src/lib/appState.ts`

Future expansion target:
- user name
- preferred tone
- primary challenges
- milestone theme
- relationship support preferences

Do not build a full profile screen until it is needed for the MVP flow.

### Theme And Reward Hooks
Current location: existing sound, celebration, and launch-pad files.

Future extraction target:
- theme name
- milestone theme configuration
- sound profile
- animation hooks
- major milestone sequence hooks

The rocket theme is a core milestone experience. It should support a long-term Earth-to-Mars arc where tokens act as countdown fuel and major milestones can trigger launch, travel, and arrival moments.

The same architecture should later support other themed milestone variants, such as golf or fireworks, without rewriting the mentor loop.

## Future Page Model
Do not build all pages yet. Use this model as a direction for future small changes:

### Mentor Home
Purpose: constant guide, today's focus, next best step, grounding quote.

### Tasks / Priorities
Purpose: task capture, prioritization, due dates, consequence-aware work.

### Calendar / Schedule
Purpose: schedule awareness and future calendar integration.

### Regulation / Support
Purpose: panic, overwhelm, grounding, and Partner/Parent relationship support.

### Milestones / Journey
Purpose: celebration, reward loops, themed milestone experiences, and long-term transformation arcs.

## Design Rules
- Preserve the working mentor loop before improving architecture.
- Prefer small files with obvious names.
- Avoid clever abstractions and dependency-heavy patterns.
- Keep state local unless there is a clear reason to extract it.
- Use localStorage only for now.
- Mentor behavior matters more than visual polish.
- Do not replace useful behavior with placeholder UI.
- Do not mistake simple for emotionally flat.
- Preserve quote, milestone, sound, animation, and theme hooks unless the tradeoff is explicit.

## Safe Refactor Order
1. Extract mentor behavior.
2. Extract shared types.
3. Document architecture boundaries.
4. Add mission history.
5. Improve log usefulness.
6. Extract progress helpers only when needed.
7. Add profile editing only after the model is useful.
8. Prepare page constants/routes before building full pages.
9. Extract milestone/theme helpers before adding major animations.
