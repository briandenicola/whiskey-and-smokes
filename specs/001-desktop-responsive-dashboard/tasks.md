# Tasks: Desktop Responsive Dashboard

**Input**: Design documents from `/specs/001-desktop-responsive-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `src/api/` (.NET 10 / C#)
- **Frontend**: `src/web/src/` (Vue 3 / TypeScript / Tailwind CSS 4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and create shared utility modules required by multiple user stories

- [ ] T001 Install ECharts frontend dependencies: `echarts` and `vue-echarts` in src/web/package.json
- [ ] T002 [P] Install Leaflet frontend dependencies: `leaflet` and `@vue-leaflet/vue-leaflet` in src/web/package.json
- [ ] T003 Create reactive viewport composable `useBreakpoint.ts` in src/web/src/composables/useBreakpoint.ts returning `isDesktop: Ref<boolean>` using `window.matchMedia('(min-width: 1024px)')`
- [ ] T004 [P] Create desktop layout state composable `useDesktopLayout.ts` in src/web/src/composables/useDesktopLayout.ts managing sidebar collapsed state and active navigation link
- [ ] T005 [P] Create shared ECharts theme configuration composable `useChartTheme.ts` in src/web/src/composables/useChartTheme.ts with stone/blue (#96BEE6)/amber color palette

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend endpoints and Pinia store that MUST be complete before dashboard and stats stories can be implemented

**CRITICAL**: No user story work (except US1 navigation shell) can begin until this phase is complete

- [ ] T006 Create `DashboardStats` response model with `DashboardSummary`, `MonthlySnapshot`, and `RecentActivity` classes in src/api/Models/DashboardStats.cs per data-model.md
- [ ] T007 [P] Create `RatingDistribution` response model with `RatingBucket` class in src/api/Models/RatingDistribution.cs per data-model.md
- [ ] T008 Implement `GET /api/users/me/dashboard` endpoint in src/api/Controllers/UsersController.cs per contracts/dashboard-stats.md (scoped to authenticated user, partition key, 20 recent captures max)
- [ ] T009 [P] Implement `GET /api/users/me/stats/ratings-distribution` endpoint in src/api/Controllers/UsersController.cs per contracts/rating-distribution.md (0.5 increment buckets, drink/dessert segmentation)
- [ ] T010 Create dashboard Pinia store in src/web/src/stores/dashboard.ts with `DashboardState` interface, actions to fetch dashboard stats and rating distribution, loading/error state management

**Checkpoint**: Foundation ready — backend endpoints respond correctly, dashboard store fetches data. User story implementation can now begin.

---

## Phase 3: User Story 1 — Desktop Navigation Shell (Priority: P1) MVP

**Goal**: Replace mobile bottom-tab navigation with a persistent sidebar at 1024px+ viewports; mobile experience unchanged below 1024px.

**Independent Test**: Resize browser across 1024px threshold. Sidebar appears/disappears smoothly (<300ms). All nav links (Dashboard Home, Collection, Venue Insights, Friends, Stats) navigate correctly with active state highlight. Mobile bottom tabs remain unchanged.

### Implementation for User Story 1

- [ ] T011 [US1] Create `DesktopSidebar.vue` component in src/web/src/components/common/DesktopSidebar.vue with navigation links (Dashboard Home, Collection, Venue Insights, Friends, Stats), active link highlighting via Vue Router, and stone/amber styling
- [ ] T012 [US1] Modify `AppLayout.vue` in src/web/src/components/common/AppLayout.vue to conditionally render `<DesktopSidebar v-if="isDesktop">` or existing mobile bottom-tab `<nav v-else>` using the `useBreakpoint()` composable
- [ ] T013 [US1] Add responsive main content area styling in src/web/src/components/common/AppLayout.vue with Tailwind `lg:ml-64` sidebar offset, `lg:pb-0` bottom-tab padding removal, and CSS transition for smooth breakpoint crossing (<300ms per SC-007)

**Checkpoint**: Desktop navigation shell is fully functional. Users see sidebar at 1024px+, bottom tabs below. All navigation links work.

---

## Phase 4: User Story 2 — Dashboard Home with Summary and Activity (Priority: P1) MVP

**Goal**: Desktop landing page with summary cards, recent activity timeline, and monthly snapshot providing at-a-glance collection overview.

**Independent Test**: Log in on desktop, navigate to Dashboard Home. Verify summary cards show correct counts (total items, drinks, desserts, avg ratings, wishlist, venues). Activity timeline shows recent captures with thumbnails and status badges. Monthly snapshot reflects current month data. Empty collection shows zero counts with helpful prompt.

### Implementation for User Story 2

- [ ] T014 [US2] Create `DashboardView.vue` in src/web/src/views/DashboardView.vue as the desktop home view, wiring dashboard store fetch on mount and displaying loading/error states
- [ ] T015 [US2] Register Dashboard Home route in src/web/src/router (or equivalent routing config) pointing to DashboardView.vue as the desktop default landing page
- [ ] T016 [P] [US2] Create `SummaryCards.vue` in src/web/src/components/dashboard/SummaryCards.vue displaying total collection count, drink count, dessert count, average ratings, wishlist size, and total venues in a responsive card grid
- [ ] T017 [P] [US2] Create `ActivityTimeline.vue` in src/web/src/components/dashboard/ActivityTimeline.vue showing recent captures in reverse chronological order with thumbnail images (placeholder on load failure), status badges (processing/complete/failed), item count, venue name, and timestamp
- [ ] T018 [P] [US2] Create `MonthlySnapshot.vue` in src/web/src/components/dashboard/MonthlySnapshot.vue displaying new items captured, venues visited, and wishlist conversions for the current calendar month
- [ ] T019 [US2] Integrate SummaryCards, ActivityTimeline, and MonthlySnapshot into src/web/src/views/DashboardView.vue layout with empty state messaging when collection is empty (FR-027)

**Checkpoint**: Dashboard Home is fully functional with live data. Summary cards, activity timeline, and monthly snapshot all render correctly.

---

## Phase 5: User Story 3 — Ratings Distribution Charts (Priority: P2)

**Goal**: Visual chart on Dashboard Home showing rating distribution across drink and dessert categories.

**Independent Test**: Log in with a collection containing rated items. Verify the chart renders with correct bar counts per rating level segmented by category. Hover tooltips show exact count and percentage. Empty collection shows "no rating data" message.

### Implementation for User Story 3

- [ ] T020 [US3] Create `RatingsChart.vue` in src/web/src/components/dashboard/RatingsChart.vue using vue-echarts `<v-chart>` with bar chart type, drink/dessert series from rating distribution store data, shared chart theme, interactive tooltips (FR-028), and SVG renderer
- [ ] T021 [US3] Integrate RatingsChart into src/web/src/views/DashboardView.vue below the summary section with empty state when no rated items exist (FR-027), ensuring chart renders within 3s (SC-004)

**Checkpoint**: Ratings distribution chart renders on Dashboard Home with accurate data and interactive tooltips.

---

## Phase 6: User Story 4 — Enhanced Collection Grid with Filters and Preview (Priority: P2)

**Goal**: Multi-column virtualized grid on desktop Collection page with persistent filter sidebar and slide-in detail panel (split-view pattern).

**Independent Test**: Navigate to Collection on desktop. Verify multi-column grid displays. Apply filters (category, rating, venue, date, labels) and confirm grid updates. Click an item and verify detail panel slides in from the right. Scroll through 1000+ items without jank.

### Implementation for User Story 4

- [ ] T022 [P] [US4] Create `CollectionFilters` TypeScript interface and filter state management in src/web/src/composables/useCollectionFilters.ts with reactive filter state for category, rating range, venue, date range, and labels
- [ ] T023 [P] [US4] Create `FilterSidebar.vue` in src/web/src/components/collection/FilterSidebar.vue with persistent filter controls for category, rating, venue, date range, and labels (FR-011)
- [ ] T024 [US4] Create `CollectionGrid.vue` in src/web/src/components/collection/CollectionGrid.vue using @tanstack/vue-virtual with row-based virtualization, reactive column count (3 at lg, 4 at xl), ~280px row height, and smooth scrolling for 1000+ items (SC-005)
- [ ] T025 [US4] Create `DetailPanel.vue` in src/web/src/components/collection/DetailPanel.vue as a slide-in panel from the right showing full item details (photos, rating, notes, venue, tags) with close button and Escape key support (FR-012)
- [ ] T026 [US4] Modify `ItemsView.vue` in src/web/src/views/ItemsView.vue to conditionally render desktop layout (FilterSidebar + CollectionGrid + DetailPanel split-view) when `isDesktop` is true, preserving existing mobile list below 1024px (FR-030)

**Checkpoint**: Desktop Collection page has multi-column virtualized grid, working filters, and slide-in detail panel. Mobile collection is unchanged.

---

## Phase 7: User Story 5 — Bulk Actions on Collection (Priority: P3)

**Goal**: Multi-select mode with bulk tagging and side-by-side item comparison on the desktop Collection page.

**Independent Test**: Activate multi-select mode on Collection. Select multiple items via checkboxes. Apply bulk tag action and verify tags are applied. Select 2-4 items and compare side-by-side. Verify toolbar disables actions when nothing is selected.

### Implementation for User Story 5

- [ ] T027 [P] [US5] Create `BulkToolbar.vue` in src/web/src/components/collection/BulkToolbar.vue with multi-select toggle, selection count, bulk tag action button, compare action button (enabled for 2-4 selections), and cancel button (FR-013, FR-014)
- [ ] T028 [P] [US5] Create `CompareView.vue` in src/web/src/components/collection/CompareView.vue displaying 2-4 items side-by-side with aligned key attributes (name, rating, category, venue, tags, photos) for easy comparison (FR-015)
- [ ] T029 [US5] Integrate BulkToolbar and CompareView into src/web/src/views/ItemsView.vue desktop layout, adding selection checkbox rendering on item cards in multi-select mode, selection state management, and bulk tag application logic

**Checkpoint**: Bulk selection, tagging, and comparison work on desktop Collection. Non-multi-select browsing is unaffected.

---

## Phase 8: User Story 6 — Venue Insights with Map and Leaderboard (Priority: P2)

**Goal**: Interactive map with color-coded venue pins, click-to-detail panels, and venue leaderboard ranked by visits or rating.

**Independent Test**: Navigate to Venue Insights on desktop. Verify map renders with pins at correct locations, color-coded by type with legend. Click a pin and verify detail panel shows items, rating, visits. Verify leaderboard ranks correctly. Empty state shown when no venues exist.

### Implementation for User Story 6

- [ ] T030 [P] [US6] Create `VenuePin` TypeScript interface and venue map data composable in src/web/src/composables/useVenueMap.ts computing VenuePin array from venues store (id, name, type, lat/lng, itemCount, avgRating, visitCount), skipping venues with invalid coordinates
- [ ] T031 [US6] Create `VenueMap.vue` in src/web/src/components/venues/VenueMap.vue using @vue-leaflet/vue-leaflet with OpenStreetMap tiles, custom SVG divIcon markers color-coded by venue type (Bar, Lounge, Restaurant, Other), legend overlay, lazy-loaded behind `v-if="isDesktop"` (FR-016, FR-017)
- [ ] T032 [P] [US6] Create `VenueDetailPanel.vue` in src/web/src/components/venues/VenueDetailPanel.vue showing items captured at selected venue, average rating, visit frequency, and venue metadata on pin click (FR-018)
- [ ] T033 [P] [US6] Create `VenueLeaderboard.vue` in src/web/src/components/venues/VenueLeaderboard.vue ranking venues by visit count with toggle to sort by average item rating (FR-019)
- [ ] T034 [US6] Modify `VenuesView.vue` in src/web/src/views/VenuesView.vue to conditionally render desktop layout (VenueMap + VenueDetailPanel + VenueLeaderboard) when `isDesktop` is true, with empty state for no venue data (FR-027), preserving mobile list below 1024px (FR-030)

**Checkpoint**: Venue Insights page shows interactive map with color-coded pins, detail panels, and leaderboard. Mobile venue list is unchanged.

---

## Phase 9: User Story 7 — Friends Activity Feed and Shared Experiences (Priority: P3)

**Goal**: Desktop friends page showing activity feed of friends' recent captures and highlighting shared items/venues.

**Independent Test**: Navigate to Friends page with connected friends. Verify activity feed shows recent friend captures with thumbnails and timestamps. Verify shared items show "You both tried this" indicator. Verify shared venues are highlighted. Empty state shown when no friends connected.

### Implementation for User Story 7

- [ ] T035 [P] [US7] Create `ActivityFeed.vue` in src/web/src/components/friends/ActivityFeed.vue displaying friends' recent captures aggregated from existing friend endpoints, sorted by createdAt descending, with thumbnails and timestamps (FR-020)
- [ ] T036 [P] [US7] Create `SharedExperiences.vue` in src/web/src/components/friends/SharedExperiences.vue computing shared items and shared venues by comparing user's data with friend's data client-side, displaying "You both tried this" indicators (FR-021) and shared venue highlights (FR-022)
- [ ] T037 [US7] Modify `FriendsView.vue` in src/web/src/views/FriendsView.vue to conditionally render desktop layout (ActivityFeed + SharedExperiences) when `isDesktop` is true, with empty state for no friends (FR-027), preserving mobile layout below 1024px (FR-030)

**Checkpoint**: Friends page shows activity feed and shared experiences on desktop. Mobile friends view is unchanged.

---

## Phase 10: User Story 8 — Stats Deep Dive with Charts and Visualizations (Priority: P2)

**Goal**: Rich stats page with category breakdown charts, rating trend line chart, capture frequency heatmap calendar, and top items/venues leaderboards.

**Independent Test**: Navigate to Stats page on desktop. Verify category breakdown donut/bar charts render with correct proportions. Verify rating trend line chart shows average over time. Verify heatmap calendar shows capture activity by day. Verify leaderboards list top items and venues. All charts have tooltips. Empty states for insufficient data.

### Implementation for User Story 8

- [ ] T038 [P] [US8] Create `CategoryBreakdown.vue` in src/web/src/components/stats/CategoryBreakdown.vue using vue-echarts with donut chart for category proportions and bar chart for type breakdown, shared theme, interactive tooltips (FR-023, FR-028)
- [ ] T039 [P] [US8] Create `RatingTrends.vue` in src/web/src/components/stats/RatingTrends.vue using vue-echarts with line chart showing average rating over time from existing ratingTrend store data, shared theme, interactive tooltips (FR-024, FR-028)
- [ ] T040 [P] [US8] Create `CaptureHeatmap.vue` in src/web/src/components/stats/CaptureHeatmap.vue using vue-echarts calendar heatmap showing capture frequency by day from existing activityByDay store data, shared theme (FR-025, FR-028)
- [ ] T041 [P] [US8] Create `StatsLeaderboards.vue` in src/web/src/components/stats/StatsLeaderboards.vue displaying top-rated items and most-visited venues from existing stats store data (FR-026)
- [ ] T042 [US8] Modify `StatsView.vue` in src/web/src/views/StatsView.vue to conditionally render desktop layout (CategoryBreakdown + RatingTrends + CaptureHeatmap + StatsLeaderboards) when `isDesktop` is true, with empty states per chart (FR-027), ensuring charts render within 3s (SC-004), preserving mobile stats below 1024px (FR-030)

**Checkpoint**: Stats page shows all chart visualizations and leaderboards on desktop. Mobile stats view is unchanged.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T043 [P] Add placeholder image fallback for broken thumbnails across ActivityTimeline.vue, CollectionGrid.vue, and ActivityFeed.vue (edge case: image load failures)
- [ ] T044 [P] Add loading skeleton states to DashboardView.vue, ItemsView.vue, VenuesView.vue, StatsView.vue, and FriendsView.vue for data-fetching transitions (edge case: navigation during loading)
- [ ] T045 [P] Audit all new components for no-emoji compliance (FR-029) — verify SVG icons and CSS indicators only
- [ ] T046 Verify mobile regression: confirm all views below 1024px render identically to pre-feature baseline (FR-030, SC-008)
- [ ] T047 [P] Run frontend type-check `npx vue-tsc --noEmit` in src/web/ and fix any errors
- [ ] T048 [P] Run backend build `dotnet build -c Release` in src/api/ and fix any errors or warnings
- [ ] T049 Run quickstart.md validation: follow all steps in specs/001-desktop-responsive-dashboard/quickstart.md end-to-end and confirm successful setup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: T006-T007 (models) can start immediately; T008-T009 (endpoints) depend on T006-T007; T010 (store) depends on T008-T009 being defined
- **US1 Navigation Shell (Phase 3)**: Depends on Phase 1 (T003, T004) only — can start in parallel with Phase 2
- **US2 Dashboard Home (Phase 4)**: Depends on Phase 2 (T010 dashboard store) and Phase 3 (T011-T013 navigation shell)
- **US3 Ratings Chart (Phase 5)**: Depends on Phase 4 (T014 DashboardView exists) and Phase 2 (T009, T010 rating distribution data)
- **US4 Collection Grid (Phase 6)**: Depends on Phase 1 (T003 breakpoint) and Phase 3 (navigation shell) — no backend dependency
- **US5 Bulk Actions (Phase 7)**: Depends on Phase 6 (T024, T026 collection grid exists)
- **US6 Venue Insights (Phase 8)**: Depends on Phase 1 (T002 Leaflet, T003 breakpoint) and Phase 3 (navigation shell)
- **US7 Friends Feed (Phase 9)**: Depends on Phase 1 (T003 breakpoint) and Phase 3 (navigation shell) — uses existing endpoints
- **US8 Stats Charts (Phase 10)**: Depends on Phase 1 (T001 ECharts, T003 breakpoint, T005 chart theme) and Phase 3 (navigation shell)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — can start after Phase 1
- **US2 (P1)**: Depends on US1 (navigation shell) and Phase 2 (backend endpoints)
- **US3 (P2)**: Depends on US2 (DashboardView exists)
- **US4 (P2)**: Independent of US2/US3 — can start after US1
- **US5 (P3)**: Depends on US4 (collection grid)
- **US6 (P2)**: Independent of US2/US3/US4 — can start after US1
- **US7 (P3)**: Independent of all other user stories — can start after US1
- **US8 (P2)**: Independent of US2/US3/US4 — can start after US1

### Within Each User Story

- Models/interfaces before components that consume them
- Data composables before presentation components
- Individual components before view integration
- Core implementation before polish

### Parallel Opportunities

- **Phase 1**: T001 + T002 (npm installs); T003 + T004 + T005 (composables)
- **Phase 2**: T006 + T007 (models); T008 + T009 (endpoints)
- **Phase 4**: T016 + T017 + T018 (dashboard sub-components)
- **Phase 6**: T022 + T023 (filter interface + sidebar); T032 + T033 (venue sub-components)
- **Phase 8**: T030 + T032 + T033 (venue sub-components after T031)
- **Phase 9**: T035 + T036 (friends sub-components)
- **Phase 10**: T038 + T039 + T040 + T041 (all stats chart components)
- **After US1**: US4, US6, US7, US8 can all start in parallel

---

## Parallel Example: User Story 2 (Dashboard Home)

```bash
# Launch all dashboard sub-components together:
Task: "Create SummaryCards.vue in src/web/src/components/dashboard/SummaryCards.vue"
Task: "Create ActivityTimeline.vue in src/web/src/components/dashboard/ActivityTimeline.vue"
Task: "Create MonthlySnapshot.vue in src/web/src/components/dashboard/MonthlySnapshot.vue"
```

## Parallel Example: User Story 8 (Stats Charts)

```bash
# Launch all stats chart components together:
Task: "Create CategoryBreakdown.vue in src/web/src/components/stats/CategoryBreakdown.vue"
Task: "Create RatingTrends.vue in src/web/src/components/stats/RatingTrends.vue"
Task: "Create CaptureHeatmap.vue in src/web/src/components/stats/CaptureHeatmap.vue"
Task: "Create StatsLeaderboards.vue in src/web/src/components/stats/StatsLeaderboards.vue"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (dependency installs + composables)
2. Complete Phase 2: Foundational (backend endpoints + dashboard store)
3. Complete Phase 3: US1 — Navigation Shell
4. Complete Phase 4: US2 — Dashboard Home
5. **STOP and VALIDATE**: Test navigation + dashboard independently
6. Deploy/demo if ready — users get a functional desktop experience

### Incremental Delivery

1. Complete Setup + Foundational + US1 + US2 → MVP desktop experience
2. Add US3 (Ratings Chart) → Dashboard enriched with visualizations
3. Add US4 (Collection Grid) → Enhanced browsing → Deploy/Demo
4. Add US6 (Venue Insights) → Map experience → Deploy/Demo
5. Add US8 (Stats Charts) → Full analytics → Deploy/Demo
6. Add US5 (Bulk Actions) → Power-user features → Deploy/Demo
7. Add US7 (Friends Feed) → Social features → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Developer A: US1 (Navigation Shell) — everyone needs this first
3. Once US1 is done:
   - Developer A: US2 (Dashboard Home) → US3 (Ratings Chart)
   - Developer B: US4 (Collection Grid) → US5 (Bulk Actions)
   - Developer C: US6 (Venue Insights) + US8 (Stats Charts)
   - Developer D: US7 (Friends Feed)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No emojis anywhere in UI (FR-029) — SVG/CSS icons only
- All desktop components gated behind `v-if="isDesktop"` to avoid mobile bundle/rendering impact
- Leaflet CSS imported locally in VenueMap.vue only (not global)
- ECharts tree-shaken: import only bar, line, pie, heatmap, calendar types
- Existing mobile experience must have zero regressions (FR-030, SC-008)
