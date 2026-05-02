# Implementation Plan: Desktop Responsive Dashboard

**Branch**: `001-desktop-responsive-dashboard` | **Date**: 2025-07-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-desktop-responsive-dashboard/spec.md`

## Summary

Add a responsive desktop experience (1024px+ viewports) to the existing Drinks & Desserts PWA. The desktop layout replaces the mobile bottom-tab navigation with a persistent sidebar, introduces a dashboard home with summary cards and activity timeline, enhanced collection browsing with multi-column grid and split-view detail panel, interactive venue map with leaderboard, friends activity feed, and rich stats visualizations (charts, heatmap calendar). The mobile PWA experience below 1024px remains completely unchanged. New frontend dependencies: Apache ECharts (charts/heatmap) and Leaflet (venue map). Two new backend endpoints provide dashboard-specific aggregations and rating distributions.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), C# / .NET 10 (backend)
**Primary Dependencies**: Vue 3.5, Pinia, Vue Router, Tailwind CSS 4, Vite 8, @tanstack/vue-virtual, Apache ECharts (vue-echarts), Leaflet (vue-leaflet)
**Storage**: Azure CosmosDB (existing, no schema changes)
**Testing**: vue-tsc --noEmit (frontend type-check), dotnet build -c Release (backend build gate)
**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Safari, Edge) at 1024px+; existing iOS PWA unchanged
**Project Type**: Web application (Vue 3 SPA + ASP.NET Core API)
**Performance Goals**: Layout render <2s, charts interactive <3s, smooth scrolling for 1000+ item grids, breakpoint transition <300ms
**Constraints**: No emojis in UI, same codebase (no separate desktop app), no separate routes or deployment, existing mobile experience must have zero regressions
**Scale/Scope**: Single-user personal collection app, ~8 new/modified views, 2 new API endpoints, 3 new frontend dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Code Quality & Defensive Coding | PASS | New API endpoints will validate all inputs; error responses use structured codes; no secrets involved in this feature |
| II. Testing Standards | PASS | Frontend changes verified via vue-tsc --noEmit; backend via dotnet build -c Release; new endpoints manually verified with curl before commit |
| III. User Experience Consistency | PASS | No emojis (FR-029); SVG/CSS icons only; touch targets maintained on mobile; empty states for all sections (FR-027); consistent stone/amber styling; bottom nav unchanged below 1024px |
| IV. Performance & Reliability | PASS | Charts render <3s (SC-004); virtualized grid for 1000+ items (SC-005); graceful empty states for missing data; map skips invalid coordinates |
| Security Requirements | PASS | New endpoints use [Authorize]; data scoped to authenticated user via GetUserId(); no new secrets required |
| Development Workflow | PASS | Build before commit; docs updated; descriptive commit messages |

**Gate Result: PASS** - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-desktop-responsive-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: entities and view models
├── quickstart.md        # Phase 1: developer setup guide
├── contracts/           # Phase 1: new API endpoint contracts
│   ├── dashboard-stats.md
│   └── rating-distribution.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── Controllers/
│   │   └── UsersController.cs          # Extended: 2 new endpoints
│   └── Models/
│       └── UserStats.cs                # Extended: DashboardStats, RatingDistribution
├── web/
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   │   ├── AppLayout.vue       # Modified: responsive sidebar/bottom-tab swap
│       │   │   └── DesktopSidebar.vue  # NEW: persistent sidebar navigation
│       │   ├── dashboard/
│       │   │   ├── SummaryCards.vue     # NEW: collection overview cards
│       │   │   ├── ActivityTimeline.vue # NEW: recent captures timeline
│       │   │   ├── MonthlySnapshot.vue  # NEW: "This Month" section
│       │   │   └── RatingsChart.vue     # NEW: ratings distribution chart
│       │   ├── collection/
│       │   │   ├── CollectionGrid.vue   # NEW: multi-column desktop grid
│       │   │   ├── FilterSidebar.vue    # NEW: persistent filter panel
│       │   │   ├── DetailPanel.vue      # NEW: slide-in item detail
│       │   │   ├── BulkToolbar.vue      # NEW: multi-select actions
│       │   │   └── CompareView.vue      # NEW: side-by-side comparison
│       │   ├── venues/
│       │   │   ├── VenueMap.vue         # NEW: Leaflet map with pins
│       │   │   ├── VenueDetailPanel.vue # NEW: pin click detail panel
│       │   │   └── VenueLeaderboard.vue # NEW: ranked venue list
│       │   ├── friends/
│       │   │   ├── ActivityFeed.vue     # NEW: friends captures feed
│       │   │   └── SharedExperiences.vue# NEW: shared items/venues
│       │   └── stats/
│       │       ├── CategoryBreakdown.vue# NEW: donut/bar charts
│       │       ├── RatingTrends.vue     # NEW: line chart
│       │       ├── CaptureHeatmap.vue   # NEW: calendar heatmap
│       │       └── StatsLeaderboards.vue# NEW: top items/venues
│       ├── composables/
│       │   ├── useBreakpoint.ts         # NEW: reactive viewport detection
│       │   └── useDesktopLayout.ts      # NEW: layout state management
│       ├── stores/
│       │   └── dashboard.ts             # NEW: dashboard-specific state
│       └── views/
│           ├── DashboardView.vue        # NEW: desktop home view
│           ├── ItemsView.vue            # Modified: responsive grid/list swap
│           ├── VenuesView.vue           # Modified: responsive map/list swap
│           ├── StatsView.vue            # Modified: enhanced desktop charts
│           └── FriendsView.vue          # Modified: desktop activity feed
```

**Structure Decision**: Follows the existing web application pattern with `src/api/` for backend and `src/web/src/` for frontend. New components are organized into feature-specific subdirectories under `components/`. No new top-level directories created. Desktop-specific components are conditionally rendered based on viewport width, not routed separately.

## Complexity Tracking

> No Constitution violations identified. Table intentionally left empty.
