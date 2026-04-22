# BUILD MENTOR CONTRACT
# BUILD MENTOR CONTRACT
# BUILD MENTOR CONTRACT

This document defines the non-negotiable product and system rules for Relevance Agent.

All implementation decisions MUST align with this.

If code conflicts with this document, the document wins.

---

# BUILD MENTOR: RELEVANCE AGENT

## CORE PRODUCT PURPOSE

Relevance Agent is not a task manager.

It is a system that helps users:

- understand what matters
- take meaningful action
- feel real progress
- stay emotionally grounded

Every feature must support this.

---

## CORE EXPERIENCE PRINCIPLE

The app must always feel like:

“Press → system responds → I moved forward → this mattered.”

NOT:

“tap → checkbox → list updated”

---

## PRIMARY SYSTEMS

### 1. Mentor System

- Guides the user with calm, human language
- Provides the right level of support at the right time
- Never overwhelms or over-explains
- Avoids judgment, urgency, or pressure

### 2. Task System

- Tasks represent meaningful action, not busywork
- Tasks must connect to goals, milestones, or real-life relevance
- Completing a task should feel acknowledged and valuable

### 3. Reward / Journey System (CRITICAL)

This is a phase-based progression system, not an animation system.

Generic phases:

- grounded
- actionReady (e.g., launchReady)
- inProgress (e.g., inFlight)
- arrivalReady (e.g., landingReady)
- arrived

Rules:

- Progress fills toward unlocking a major action
- Major actions (Launch, Land, Swing, etc.) are user-triggered
- Do NOT auto-trigger major events on normal task completion
- Milestones must create REAL state progression, not temporary animation

The system must ensure:

- Progress is durable
- The app state reflects advancement
- The user never feels like progress resets or is fake

---

## ARCHITECTURE RULES

1. Separate logic from presentation

- Reward logic must be generic
- Themes (rocket, golf, etc.) must be adapters
- Core system must NOT contain theme-specific logic

2. Preserve reusability

- Build systems so new themes can be added without rewriting logic

Example themes:

- rocket (launch / land)
- golf (swing / putt)
- calm (breathe / arrive)

3. Use event-driven feedback

- task_complete
- progress_nudge
- milestone_reached
- major_action_available
- major_action_triggered

4. Do not mix ephemeral UI state with persistent logic

- animations = temporary
- progression = stored state

---

## INTERACTION DESIGN RULES

Every interaction should follow:

1. Input (press)
2. Acknowledgement (immediate feedback)
3. System response (visible effect)
4. Resolution (calm completion)

Keep interactions:

- fast
- clear
- satisfying
- not flashy

---

## SENSORY DESIGN

The app should feel:

“alive but calm”

NOT:

- arcade-like
- noisy
- overwhelming

Use:

- subtle animation
- soft sound (later stage)
- light haptics (for major actions)

Reserve strong feedback for:

- Launch
- Land
- major milestones

---

## QUOTES / REFLECTION

Quotes are optional and must be:

- rare
- tied to meaningful moments
- grounded and action-based

Never:

- show quotes frequently
- turn the app into a quote feed

---

## SUPPORT SYSTEM

Support must follow:

“Right help → right intensity → right moment”

Levels:

1. Reset (calm, grounding)
2. Decide (clarity, next step)
3. Reach out (human connection)

Do NOT:

- escalate too quickly
- overwhelm with options

---

## AI / PERSONALIZATION

The system should:

- learn gradually from user behavior
- ask simple, well-timed questions
- use calendar and tasks to create relevance

Do NOT:

- constantly interrupt
- over-collect input
- simulate intelligence without value

---

## PRODUCT CONSTRAINTS

ALWAYS:

- prefer simple over complex
- prefer shippable over perfect
- preserve emotional clarity
- protect the core loop

NEVER:

- add features that break focus
- over-engineer systems early
- mix theme logic into core systems
- sacrifice clarity for cleverness

---

## WHEN UNSURE

Default to:

“What is the smallest change that makes this feel more real, connected, and meaningful?”

---

## CURRENT BUILD PRIORITY

Focus on:

1. Phase-based reward progression
2. One complete “magic loop” (rocket)
3. Clear cause → effect between tasks and progression
4. Strong, intentional major actions (Launch / Land)
5. Minimal but meaningful sensory feedback

Do NOT expand into multiple themes or complex AI until this loop feels right.

---

## OUTPUT EXPECTATION

When implementing:

- Keep changes minimal and targeted
- Preserve existing good work
- Explain what changed and why
- Identify any uncertainty or risks

---

## FINAL GOAL

Build something that users don’t just use…

…but feel.
---

## CORE PRODUCT PURPOSE

Relevance Agent is not a task manager.

It is a system that helps users:

* understand what matters
* take meaningful action
* feel real progress
* stay emotionally grounded

Every feature must support this.

---

## CORE EXPERIENCE PRINCIPLE

The app must always feel like:

“Press → system responds → I moved forward → this mattered.”

NOT:
“tap → checkbox → list updated”

---

## PRIMARY SYSTEMS

### 1. Mentor System

* Guides the user with calm, human language
* Provides the right level of support at the right time
* Never overwhelms or over-explains
* Avoids judgment, urgency, or pressure

### 2. Task System

* Tasks represent meaningful action, not busywork
* Tasks must connect to goals, milestones, or real-life relevance
* Completing a task should feel acknowledged and valuable

### 3. Reward / Journey System (CRITICAL)

This is a phase-based progression system, not an animation system.

Generic phases:

* grounded
* actionReady (e.g., launchReady)
* inProgress (e.g., inFlight)
* arrivalReady (e.g., landingReady)
* arrived

Rules:

* Progress fills toward unlocking a major action
* Major actions (Launch, Land, Swing, etc.) are user-triggered
* Do NOT auto-trigger major events on normal task completion
* Milestones must create REAL state progression, not temporary animation

The system must ensure:

* Progress is durable
* The app state reflects advancement
* The user never feels like progress resets or is fake

---

## ARCHITECTURE RULES

1. Separate logic from presentation

* Reward logic must be generic
* Themes (rocket, golf, etc.) must be adapters
* Core system must NOT contain theme-specific logic

2. Preserve reusability

* Build systems so new themes can be added without rewriting logic
* Example themes:

  * rocket (launch / land)
  * golf (swing / putt)
  * calm (breathe / arrive)

3. Use event-driven feedback

* task_complete
* progress_nudge
* milestone_reached
* major_action_available
* major_action_triggered

4. Do not mix ephemeral UI state with persistent logic

* animations = temporary
* progression = stored state

---

## INTERACTION DESIGN RULES

Every interaction should follow:

1. Input (press)
2. Acknowledgement (immediate feedback)
3. System response (visible effect)
4. Resolution (calm completion)

Keep interactions:

* fast
* clear
* satisfying
* not flashy

---

## SENSORY DESIGN (IMPORTANT)

The app should feel:

“alive but calm”

NOT:

* arcade-like
* noisy
* overwhelming

Use:

* subtle animation
* soft sound (later stage)
* light haptics (for major actions)

Reserve strong feedback for:

* Launch
* Land
* major milestones

---

## QUOTES / REFLECTION

Quotes are optional and must be:

* rare
* tied to meaningful moments
* grounded and action-based

Never:

* show quotes frequently
* turn the app into a quote feed

---

## SUPPORT SYSTEM

Support must follow:

“Right help → right intensity → right moment”

Levels:

1. Reset (calm, grounding)
2. Decide (clarity, next step)
3. Reach out (human connection)

Do NOT:

* escalate too quickly
* overwhelm with options

---

## AI / PERSONALIZATION

The system should:

* learn gradually from user behavior
* ask simple, well-timed questions
* use calendar and tasks to create relevance

Do NOT:

* constantly interrupt
* over-collect input
* simulate intelligence without value

---

## PRODUCT CONSTRAINTS

ALWAYS:

* prefer simple over complex
* prefer shippable over perfect
* preserve emotional clarity
* protect the core loop

NEVER:

* add features that break focus
* over-engineer systems early
* mix theme logic into core systems
* sacrifice clarity for cleverness

---

## WHEN UNSURE

Default to:

“What is the smallest change that makes this feel more real, connected, and meaningful?”

---

## CURRENT BUILD PRIORITY

Focus on:

1. Phase-based reward progression
2. One complete “magic loop” (rocket)
3. Clear cause → effect between tasks and progression
4. Strong, intentional major actions (Launch / Land)
5. Minimal but meaningful sensory feedback

Do NOT expand into multiple themes or complex AI until this loop feels right.

---

## OUTPUT EXPECTATION

When implementing:

* Keep changes minimal and targeted
* Preserve existing good work
* Explain what changed and why
* Identify any uncertainty or risks

---

Goal:

Build something that users don’t just use…

…but feel.
