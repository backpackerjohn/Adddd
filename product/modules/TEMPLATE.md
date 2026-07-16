# Module: <Name>

> Common specification template. Every module spec in this directory uses exactly these sections, in this order. Terminology must match `product/brief.md` (the single source of truth). Do not reinvent object names, navigation, or states defined elsewhere — link to them.

## 1. Purpose
One paragraph: why this module exists, which validated pain point(s) it serves (link to `research/pain-points.md` cluster), and what "working" means for the user.

## 2. User goals
Bulleted, in the user's voice ("I want to … so that …"). Ordered by importance.

## 3. Objects
Every entity this module owns or touches. For each: name (canonical, from the object model), fields, relationships, ownership (which module is source of truth).

## 4. Lifecycle
For each owned object: creation → active states → archival/deletion/recovery. Include retention rules and what the user sees at each stage.

## 5. Actions
Every user-initiated and system-initiated action. For each: trigger, preconditions, effect, feedback shown, undo/redo behavior.

## 6. States
Screen/component states: empty, loading, ideal, partial, error, offline, degraded-AI (AI unavailable), and any module-specific states. What the user sees and can do in each.

## 7. Workflows
End-to-end flows (happy path + recovery paths) as numbered steps, referencing screens in `design/wireframes/`. Include cross-module workflows.

## 8. AI behavior
What the AI does here, when it triggers, inputs it may read, outputs it may produce, tone rules, confidence handling, what it must NEVER do, fallback when the model is unavailable, and the explicit list of features in this module that deliberately do NOT use AI (and why).

## 9. Scale
Expected object counts at 1 / 1,000 / 100,000 users; hot paths; pagination/virtualization needs; cost drivers (esp. AI calls); rate limits; caching.

## 10. Errors
Failure modes ranked by likelihood × harm. For each: detection, user-facing message, recovery path, data-loss guarantee.

## 11. Permissions
Who can see/do what (user, household/partner share, coach share if any, admin/support). Privacy notes for sensitive data (health info).

## 12. Dependencies
Modules, external services, device capabilities (notifications, calendar, location), and platform differences (web vs mobile) this module relies on.
