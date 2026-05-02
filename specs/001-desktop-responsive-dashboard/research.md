# Research: Desktop Responsive Dashboard

**Feature**: 001-desktop-responsive-dashboard
**Date**: 2025-07-17

## Research Tasks

### R1: Charting Library Selection

**Context**: The spec requires bar charts (ratings distribution, category breakdown), line charts (rating trends), donut/pie charts (category proportions), and a heatmap calendar (capture frequency). No chart library is currently installed. The existing StatsView.vue uses pure CSS bars.

**Decision**: Apache ECharts via `vue-echarts`

**Rationale**:
- Native calendar heatmap support (required for capture frequency visualization) eliminates the need for a second library
- Tree-shakable: import only required chart types (bar, line, pie, heatmap, calendar) to keep bundle ~60-100KB gzipped
- Rich interactive tooltips out of the box (FR-028 requirement)
- Mature Vue 3 wrapper (`vue-echarts`) with Composition API support
- Declarative option-based API integrates cleanly with Vue's reactive data model
- SVG renderer option for crisp rendering on high-DPI displays

**Alternatives Considered**:
- **Chart.js + vue-chartjs**: Widely used, ~70KB, but no native calendar heatmap support. Would require a separate library (e.g., cal-heatmap) or custom implementation for the capture frequency visualization. Eliminated because two chart libraries increases maintenance burden.
- **Unovis (@unovis/vue)**: Smallest bundle (~30-50KB), has calendar heatmap, but newer ecosystem with smaller community. Documentation is less comprehensive. Eliminated due to maturity risk for a feature with 5+ chart types.
- **Lightweight Charts**: Only ~40KB but focused on financial/time-series data. No categorical bar charts, no heatmaps. Eliminated as insufficient for requirements.

**Integration Approach**:
- Install `echarts` and `vue-echarts` packages
- Create a shared chart theme configuration matching the app's stone/blue/amber color palette
- Use ECharts' built-in `use()` registration to tree-shake unused chart types
- Each chart component wraps `<v-chart>` with feature-specific options

---

### R2: Map Library Selection

**Context**: The Venue Insights page (FR-016 through FR-019) requires an interactive map with color-coded pins by venue type, click-to-detail panels, and a legend. Venue model already includes `GeoLocation` with latitude/longitude.

**Decision**: Leaflet via `@vue-leaflet/vue-leaflet`

**Rationale**:
- Smallest bundle (~40KB gzipped) among mature map libraries
- Free tile provider (OpenStreetMap) requires no API key or billing setup
- Excellent Vue 3 wrapper with declarative component API (`<LMap>`, `<LMarker>`, `<LPopup>`)
- Custom marker icons are straightforward for venue-type color coding
- Well-documented, massive community, battle-tested for simple pin-based maps
- No WebGL requirement (works on all target browsers without GPU concerns)

**Alternatives Considered**:
- **MapLibre GL**: Modern vector tile rendering, smoother zooming, but heavier bundle and requires a tile server or MapTiler API key for styled basemaps. Overkill for static venue pins. Eliminated due to setup complexity and cost.
- **OpenLayers**: Most feature-rich but heaviest bundle, no official Vue wrapper, GIS-oriented API is unnecessarily complex for simple markers. Eliminated as overkill.

**Integration Approach**:
- Install `leaflet` and `@vue-leaflet/vue-leaflet`
- Import Leaflet CSS in the VenueMap component (not globally, to avoid mobile bundle impact)
- Use OpenStreetMap tiles (free, no API key)
- Create custom SVG marker icons color-coded by venue type using Leaflet's `divIcon`
- Map renders only on desktop viewports (lazy-loaded behind `v-if="isDesktop"`)

---

### R3: Responsive Layout Strategy

**Context**: The app currently has a mobile-only layout with bottom-tab navigation in AppLayout.vue. Desktop layout needs a sidebar navigation at 1024px+ (Tailwind v4 `lg` breakpoint) without breaking the mobile experience.

**Decision**: CSS media queries + reactive composable for conditional rendering

**Rationale**:
- Tailwind v4 `lg:` prefix maps directly to the 1024px breakpoint specified in the requirements
- A `useBreakpoint()` composable using `matchMedia` provides a reactive `isDesktop` ref for conditional component rendering in `<script setup>`
- CSS handles layout changes (grid columns, sidebar visibility); JavaScript handles component swaps (render desktop sidebar vs. mobile bottom-tab)
- `matchMedia` listener is more performant than resize event listeners

**Implementation Details**:
- `useBreakpoint.ts`: Returns `isDesktop: Ref<boolean>` using `window.matchMedia('(min-width: 1024px)')`
- `AppLayout.vue`: Wraps `<DesktopSidebar v-if="isDesktop">` and `<nav v-else>` (existing bottom-tab)
- Main content area: Uses Tailwind `lg:ml-64` (sidebar width offset) and `lg:pb-0` (remove bottom-tab padding)
- Transition: CSS transition on sidebar width for smooth breakpoint crossing (SC-007: <300ms)

**Alternatives Considered**:
- **Separate route layouts**: Would require duplicating route configuration and maintaining two layout trees. Eliminated as it contradicts the "same codebase" constraint.
- **CSS-only (no JS detection)**: Would work for visibility but can't prevent desktop-only components (map, charts) from mounting on mobile, wasting resources. Eliminated for performance reasons.

---

### R4: Desktop Collection Grid Virtualization

**Context**: The collection page must display items in a multi-column grid on desktop while maintaining smooth scrolling for 1000+ items (SC-005). The project already uses `@tanstack/vue-virtual` for single-column virtualized lists.

**Decision**: Extend existing `@tanstack/vue-virtual` usage with grid-aware row calculation

**Rationale**:
- Already a project dependency; no new library needed
- `useVirtualizer` supports variable-size rows; a multi-column grid is achieved by treating each "row" as containing N items (where N is the column count)
- Column count derived from container width (e.g., 3 columns at `lg`, 4 at `xl`)
- This is the same pattern used in the existing ItemsView.vue and VenuesView.vue

**Implementation Details**:
- Compute `columnsPerRow` reactively based on container width
- Virtual row count = `Math.ceil(items.length / columnsPerRow)`
- Each virtual row renders `columnsPerRow` item cards in a CSS grid
- Existing `estimateSize` adjusted for grid card height (~280px with photo)
- Filter sidebar reduces content width; grid recalculates columns on resize

**Alternatives Considered**:
- **CSS-only grid with overflow scroll**: No virtualization means DOM contains all items; unusable for 1000+ items. Eliminated per SC-005.
- **@tanstack/vue-virtual grid mode**: The library doesn't have a built-in grid virtualizer; the row-based approach achieves the same result with the existing API. No alternative needed.

---

### R5: New Backend Endpoints

**Context**: The existing `GET /api/users/me/stats` provides most data for the stats page but lacks dashboard-specific aggregations (monthly snapshot, wishlist size, recent activity) and rating distribution data needed for the dashboard home charts.

**Decision**: Add two new endpoints to `UsersController`

**Endpoint 1**: `GET /api/users/me/dashboard`
- Returns: `DashboardStats` (summary cards + monthly snapshot + recent activity)
- Data derived from existing items, captures, and venues collections (no schema changes)
- Scoped to authenticated user via partition key

**Endpoint 2**: `GET /api/users/me/stats/ratings-distribution`
- Returns: `RatingDistribution` (per-rating-value counts segmented by category)
- Separated from main stats endpoint to keep payloads focused
- Used by the dashboard home ratings chart and the stats page category breakdown

**Rationale**:
- The existing stats endpoint already queries all items and captures; adding dashboard fields to it would bloat the response for mobile clients that don't need them
- Separate endpoints allow the dashboard to fetch only what it needs
- Both endpoints follow the existing controller pattern (GetUserId(), partition key scoping, [Authorize])

**Alternatives Considered**:
- **Extend existing stats endpoint**: Would add ~500 bytes to every stats response, even for mobile. Monthly snapshot and recent activity add latency for data mobile doesn't display. Eliminated to avoid penalizing mobile performance.
- **Frontend-only aggregation**: Dashboard could compute all stats client-side from items/captures stores. But this requires loading ALL items first, which is paginated (continuation tokens). Eliminated because it would require loading the entire collection before displaying any dashboard data.

---

### R6: Friends Activity Feed Data

**Context**: The friends page needs to show recent captures by friends and highlight shared items/venues. Existing endpoints include `GET /api/friends/{friendId}/items` and `GET /api/friends/{friendId}/venues`.

**Decision**: Use existing endpoints with client-side aggregation

**Rationale**:
- `GET /api/friends` returns the friends list
- `GET /api/friends/{friendId}/items` returns a friend's items (paginated)
- Shared items/venues can be computed client-side by comparing the user's items/venues with each friend's
- No new backend endpoint needed for P3 scope
- Activity feed is constructed from friend items sorted by `createdAt`

**Alternatives Considered**:
- **New activity feed endpoint**: Would aggregate all friends' recent items server-side. More efficient but adds backend complexity for a P3 feature. Can be added later if performance requires it. Deferred.
