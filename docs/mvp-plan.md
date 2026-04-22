# MVP Plan

## Smallest Usable Prototype Flow
1. User opens the app and sees a calm greeting.
2. User chooses or edits one current mission.
3. User selects how they need support:
   - Regulation
   - Execution
   - Strategy
   - Partner/Parent
4. App gives one short mentor response.
5. App gives one clear next action.
6. User completes the action and earns a token.
7. User optionally writes a short log.
8. App saves progress locally and shows a simple history.

## Screens / Components Needed
- Dashboard shell
- Mission input
- Mentor mode selector
- Mentor response card
- Next action card
- Add Token / Remove Token controls
- Progress / milestone visual
- Log input
- Recent history panel
- Basic sound and visual feedback controls

## In Scope Now
- One-page prototype
- Local state and `localStorage`
- Four mentor modes as simple selectable modes
- Static or rule-based mentor prompts/responses
- One current mission
- One next action at a time
- Tokens, milestones, streak, and logs
- Calm Starshooter-style progress feedback

## Out Of Scope For Now
- Backend
- Login/accounts
- AI API integration
- Full personalization engine
- Full settings screen
- User-defined milestone spacing
- Multiple themes/skins beyond the current Starshooter direction
- Calendar integrations
- Notifications
- Team/couple shared accounts
- Clinical or medical claims

## Acceptance Criteria For First Working Mentor Loop
- User can enter or edit a mission.
- User can choose one of the four mentor modes.
- App shows a short mentor response appropriate to that mode.
- App shows one clear next action.
- User can earn a token after acting.
- Token count, streak, mission, and logs persist after refresh.
- The UI remains calm, readable, and low-friction.
- The prototype works without a backend.
