<!--
  Sync Impact Report
  Version change: 0.0.0 -> 1.0.0 (initial ratification)
  Added principles:
    - I. Code Quality & Defensive Coding
    - II. Testing Standards
    - III. User Experience Consistency
    - IV. Performance & Reliability
  Added sections:
    - Security Requirements
    - Development Workflow
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check section is dynamic)
    - .specify/templates/spec-template.md ✅ no changes needed (success criteria already support performance)
    - .specify/templates/tasks-template.md ✅ no changes needed (polish phase covers security/perf)
  Follow-up TODOs: none
-->

# Whiskey & Smokes Constitution

## Core Principles

### I. Code Quality & Defensive Coding

All code MUST follow defensive coding practices that prevent
runtime failures and security vulnerabilities.

- Every API endpoint MUST validate all inputs (null checks,
  length limits, type checks) before processing.
- Path operations MUST use canonical path validation
  (`Path.GetFullPath`) and verify results stay within allowed
  directories. String replacement sanitization is prohibited.
- User-supplied data interpolated into AI prompts MUST be wrapped
  in explicit delimiters marked as untrusted input.
- Blob and resource URLs MUST be validated for ownership (user ID
  in path) before allowing modification or deletion.
- Error responses MUST NOT leak stack traces, internal paths, or
  implementation details. Use structured error codes.
- Secrets MUST NOT be committed to source control. Production
  startup MUST fail if required secrets are not configured.
- All `catch` blocks MUST either handle the error meaningfully or
  log it with sufficient context. Empty catch blocks are prohibited.
- Fire-and-forget operations MUST log failures at Warning level.
- String comparisons on security-sensitive values (hashes, tokens)
  MUST use constant-time comparison functions.

**Rationale**: This application handles user photos, personal
tasting notes, and API keys. Defensive coding prevents data
leakage, unauthorized access, and silent failures that erode
trust in the system.

### II. Testing Standards

All features MUST be verified through build and type-check gates
before merging. Manual testing supplements automated checks.

- The .NET API MUST compile with zero errors and zero warnings
  under `dotnet build -c Release`.
- The Vue frontend MUST pass `vue-tsc --noEmit` type checking
  with zero errors.
- The Vite production build MUST succeed without errors.
- CI (`ci.yml`) MUST run API build and frontend type-check on
  every pull request. PRs with build failures MUST NOT be merged.
- AI workflow parsing MUST reject unparseable responses rather
  than auto-approving malformed data. Best-effort fallback is
  acceptable only when a valid JSON array can be extracted.
- New API endpoints MUST be manually verified with curl or the
  frontend before committing.
- Security-critical paths (authentication, file uploads, blob
  operations) SHOULD have integration tests as coverage expands.

**Rationale**: The project currently has no automated test suite.
Build and type-check gates are the primary quality safety net.
As the project matures, integration tests for security-critical
paths will be added incrementally.

### III. User Experience Consistency

The application MUST deliver a consistent, polished experience
across all platforms, with PWA on iOS as the primary target.

- No emojis in application UI text. Icons and visual indicators
  MUST use SVG or CSS-based rendering.
- All interactive elements MUST have hover/active states and
  appropriate touch targets (minimum 44x44px on mobile).
- Modals and overlays MUST be centered using `fixed inset-0` with
  flexbox centering. Navigation elements MUST NOT shift content
  layout (use absolute positioning for overlays on narrow screens).
- Form inputs MUST use consistent styling: `bg-stone-800`,
  `border-stone-700`, `rounded-xl`, amber accent for focus states.
- The bottom navigation bar MUST maintain consistent ordering:
  Collection, History, Capture (raised FAB), Stats, Profile.
- Loading states MUST be indicated. Empty states MUST show
  helpful text (not blank screens).
- Edit mode MUST use icon-based actions (pencil/trash for
  view mode, checkmark/X for edit mode) in the top toolbar,
  not bottom button bars.
- Pinch-to-zoom is disabled globally in PWA mode. Image zoom
  is handled via the lightbox modal with explicit zoom controls.

**Rationale**: The primary user experience is through the iOS
PWA. Layout consistency and touch-friendly interactions are
essential since the app competes with native apps for the user's
attention and trust.

### IV. Performance & Reliability

The application MUST remain responsive under normal usage and
degrade gracefully when external services are unavailable.

- AI service calls MUST have a timeout (currently 3 minutes).
  No call to an external service may use `CancellationToken.None`.
- The AI pipeline MUST produce a maximum of 3 items per capture.
  A hard cap in `ConvertToItems` enforces this regardless of AI
  output.
- When AI Foundry is unavailable, the system MUST fall back to
  keyword-based local extraction. Capture processing MUST NOT
  fail entirely due to AI unavailability.
- Photo uploads MUST validate file type (allowlisted image
  extensions only) and size (15MB per file) on the server.
  Client-side validation is supplementary, not sufficient.
- Background processing (capture queue) MUST use a bounded
  retry strategy. Failed captures MUST be logged with sufficient
  detail for debugging.
- The PWA service worker MUST precache the application shell for
  offline loading. API failures MUST show user-friendly error
  states, not blank screens or unhandled exceptions.
- Database queries MUST be scoped to the authenticated user's
  partition key. Cross-partition queries are acceptable only for
  admin operations and authentication lookups.

**Rationale**: The app depends on Azure AI Foundry, CosmosDB, and
Blob Storage. Any of these can experience latency or outages.
Timeouts, fallbacks, and graceful degradation ensure the user can
always interact with the app even when backend services struggle.

## Security Requirements

Security is a cross-cutting concern that applies to all
principles above. These requirements are non-negotiable.

- All controllers MUST use `[Authorize]` unless explicitly
  documented as public (e.g., health checks, static file serving).
- All data operations MUST scope to the authenticated user via
  `GetUserId()` and partition key. No endpoint may return or
  modify another user's data.
- JWT secrets MUST be provided via environment variables.
  Production startup MUST fail if the secret is missing or
  uses a known default value.
- Entra ID token exchange MUST validate the token signature,
  issuer, audience, and lifetime using OIDC discovery. Parse-only
  token reading is prohibited.
- API key hashes MUST use SHA256. Comparison MUST use
  `CryptographicOperations.FixedTimeEquals`.
- File upload endpoints MUST validate file extensions against an
  allowlist and enforce per-file size limits on the server.
- CORS MUST be configured with explicit allowed origins. Wildcard
  origins are prohibited in production.

## Development Workflow

All changes follow this workflow to maintain quality and
traceability.

- **Build before commit**: Run `dotnet build` (API) and `vue-tsc`
  (frontend) before committing. Both MUST pass with zero errors.
- **Commit messages**: Use descriptive multi-line commit messages.
  Include a summary line, blank line, then bullet points describing
  what changed and why. Include `Co-authored-by` trailer when
  AI-assisted.
- **Branch strategy**: Development happens on `main` for this
  single-developer project. CI runs on pull requests when used.
- **Documentation**: README and docs/ MUST be updated when adding
  new features, endpoints, configuration options, or deployment
  methods. Documentation is part of the definition of done.
- **Prompt changes**: AI agent prompts in `src/AgentInitiator/Prompts/`
  only affect new deployments. Existing deployments require prompt
  updates via the admin UI or database re-seeding.

## Governance

This constitution is the authoritative source for development
standards in the Whiskey & Smokes project. All code changes,
reviews, and architectural decisions MUST comply with these
principles.

- **Amendments**: Any principle may be amended by updating this
  document. Amendments MUST include a version bump and updated
  amendment date.
- **Versioning**: The constitution follows semantic versioning.
  MAJOR for principle removals or incompatible redefinitions,
  MINOR for new principles or material expansions, PATCH for
  clarifications and wording fixes.
- **Compliance**: The plan template's Constitution Check gate
  MUST verify alignment with these principles before feature
  implementation begins.
- **Exceptions**: Deviations from any principle MUST be documented
  in the Complexity Tracking table of the relevant plan document
  with justification and rejected alternatives.

**Version**: 1.0.0 | **Ratified**: 2026-04-03 | **Last Amended**: 2026-04-03
