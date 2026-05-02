# Feature Specification: Desktop Responsive Dashboard

**Feature Branch**: `001-desktop-responsive-dashboard`  
**Created**: 2025-07-17  
**Status**: Draft  
**Input**: User description: "Desktop Responsive Dashboard for Drinks & Desserts application — responsive desktop experience within the same codebase that activates at lg+ breakpoints, focusing on display, statistics, and rich browsing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Navigation Shell (Priority: P1)

A user opens the Drinks & Desserts app on a desktop browser (viewport at or above 1024px wide). Instead of the mobile bottom-tab navigation, they see a persistent sidebar navigation on the left with a spacious main content area on the right. The sidebar shows navigation links to Dashboard Home, Collection, Venue Insights, Friends, and Stats. The mobile bottom-tab navigation remains unchanged for viewports below 1024px.

**Why this priority**: The navigation shell is the foundation for every other desktop feature. Without a responsive layout swap, no desktop-specific content can be delivered. This is the structural prerequisite for all other stories.

**Independent Test**: Can be fully tested by resizing a browser window across the 1024px threshold and verifying the navigation transitions between sidebar and bottom-tab layouts. Delivers a usable desktop navigation experience on its own.

**Acceptance Scenarios**:

1. **Given** a user is viewing the app on a viewport of 1024px or wider, **When** the page loads, **Then** the layout displays a persistent sidebar navigation on the left and the main content area fills the remaining space.
2. **Given** a user is viewing the app on a viewport below 1024px, **When** the page loads, **Then** the existing mobile bottom-tab navigation is displayed unchanged.
3. **Given** a user is on a desktop viewport, **When** they resize the browser below 1024px, **Then** the layout transitions from sidebar to bottom-tab navigation without a page reload.
4. **Given** a user is on a desktop viewport, **When** they click a navigation link in the sidebar, **Then** they are navigated to the corresponding page and the active link is visually highlighted.

---

### User Story 2 - Dashboard Home with Summary and Activity (Priority: P1)

A user lands on the desktop Dashboard Home screen and sees an at-a-glance overview of their collection: summary cards showing total items, counts by category (drinks vs. desserts), average ratings, and wishlist size. Below the summary cards, they see a recent activity timeline showing their latest captures with thumbnail images and status badges indicating whether each capture is processing, complete, or failed. A "This Month" snapshot section shows new items captured, venues visited, and wishlist conversions for the current month.

**Why this priority**: The dashboard home is the desktop landing page and the primary value proposition of the desktop experience. It gives users immediate insight into their collection without requiring them to navigate elsewhere. This is the first thing users see and sets the tone for the desktop experience.

**Independent Test**: Can be fully tested by logging in on a desktop viewport, navigating to the dashboard, and verifying summary cards display accurate counts, the activity timeline shows recent captures with correct statuses, and the monthly snapshot reflects current-month data.

**Acceptance Scenarios**:

1. **Given** an authenticated user with items in their collection, **When** they visit the Dashboard Home on desktop, **Then** they see summary cards displaying total collection count, items by category, average ratings, and wishlist size.
2. **Given** an authenticated user with recent captures, **When** they view the activity timeline, **Then** captures are listed in reverse chronological order with thumbnail images and status badges (processing, complete, or failed).
3. **Given** an authenticated user, **When** they view the "This Month" snapshot, **Then** they see counts for new items captured, venues visited, and wishlist items converted in the current calendar month.
4. **Given** an authenticated user with an empty collection, **When** they visit the Dashboard Home, **Then** they see summary cards with zero counts and a helpful prompt encouraging them to capture their first item via the mobile app.

---

### User Story 3 - Ratings Distribution Charts (Priority: P2)

A user viewing the Dashboard Home sees a visual chart displaying the distribution of their ratings across categories. The chart clearly shows how many items fall into each rating bracket, broken down by drink and dessert categories.

**Why this priority**: Visual statistics are a key differentiator of the desktop experience over mobile. Charts transform raw data into immediately understandable insights and are one of the main reasons users would visit on desktop.

**Independent Test**: Can be fully tested by logging in with a collection containing items with various ratings and verifying the chart accurately reflects the rating distribution data.

**Acceptance Scenarios**:

1. **Given** an authenticated user with rated items across categories, **When** they view the Dashboard Home, **Then** a ratings distribution chart is displayed showing item counts per rating level, segmented by category.
2. **Given** an authenticated user with no rated items, **When** they view the Dashboard Home, **Then** the chart area displays a message indicating no rating data is available yet.
3. **Given** an authenticated user viewing the chart, **When** they hover over or interact with a chart segment, **Then** they see a tooltip or label showing the exact count and percentage for that segment.

---

### User Story 4 - Enhanced Collection Grid with Filters and Preview (Priority: P2)

A user navigates to the Collection page on desktop and sees their items displayed in a multi-column grid layout with larger photo cards than the mobile single-column view. A persistent filter sidebar is visible on the left side of the content area, allowing filtering by category, rating, venue, date range, and labels. When the user clicks an item card, a detail panel slides in from the right side, showing the full item details without navigating away from the grid (split-view pattern).

**Why this priority**: The collection is the core content of the app. An enhanced grid with always-visible filters and inline preview dramatically improves the browsing experience on desktop, making it faster to find and review items.

**Independent Test**: Can be fully tested by navigating to the Collection page on a desktop viewport, applying various filter combinations, verifying the grid updates accordingly, and clicking items to confirm the slide-in detail panel works.

**Acceptance Scenarios**:

1. **Given** an authenticated user on desktop, **When** they navigate to the Collection page, **Then** items are displayed in a multi-column grid with larger photo cards.
2. **Given** a user viewing the Collection on desktop, **When** they look at the page layout, **Then** a filter sidebar is persistently visible showing filter options for category, rating, venue, date range, and labels.
3. **Given** a user on the Collection page, **When** they apply a filter (e.g., category = "cocktails"), **Then** the grid updates to show only items matching the filter criteria.
4. **Given** a user on the Collection page, **When** they click an item card, **Then** a detail panel slides in from the right side showing the full item details while the grid remains visible on the left.
5. **Given** a user with the detail panel open, **When** they click a different item or close the panel, **Then** the detail panel updates to the new item or closes, returning full width to the grid.

---

### User Story 5 - Bulk Actions on Collection (Priority: P3)

A user on the Collection page enters a multi-select mode to select multiple items. Once selected, they can apply bulk actions such as adding tags to all selected items or comparing selected items side-by-side.

**Why this priority**: Bulk actions are a power-user feature that adds significant value for users with large collections but is not essential for the core desktop experience.

**Independent Test**: Can be fully tested by entering multi-select mode, selecting several items, and verifying that bulk tagging and side-by-side comparison work correctly.

**Acceptance Scenarios**:

1. **Given** a user on the Collection page, **When** they activate multi-select mode, **Then** item cards display selection checkboxes and a bulk action toolbar appears.
2. **Given** a user with multiple items selected, **When** they choose the "Tag" bulk action, **Then** they can apply one or more tags to all selected items at once.
3. **Given** a user with 2-4 items selected, **When** they choose the "Compare" action, **Then** the selected items are displayed side-by-side with their key attributes aligned for easy comparison.
4. **Given** a user in multi-select mode with no items selected, **When** they view the bulk action toolbar, **Then** action buttons are disabled until at least one item is selected.

---

### User Story 6 - Venue Insights with Map and Leaderboard (Priority: P2)

A user navigates to the Venue Insights page and sees an interactive map displaying pins for all their visited venues. Pins are color-coded by venue type (Bar, Lounge, Restaurant, Other). Clicking a pin opens a venue detail panel showing all items captured at that venue, the average rating for that venue, and visit frequency. A leaderboard section ranks venues by visit count or average item rating.

**Why this priority**: Venue insights provide a unique spatial perspective on the user's collection that is impossible on mobile. The map and leaderboard transform venue data into an engaging, explorable experience that justifies the desktop layout.

**Independent Test**: Can be fully tested by navigating to Venue Insights, verifying pins appear on the map at correct locations, clicking pins to check detail panels, and confirming the leaderboard ranks venues correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user with venue data, **When** they navigate to Venue Insights, **Then** an interactive map is displayed with pins at each visited venue location.
2. **Given** a user viewing the venue map, **When** they look at the pins, **Then** each pin is color-coded by venue type (Bar, Lounge, Restaurant, Other) with a visible legend.
3. **Given** a user viewing the venue map, **When** they click a venue pin, **Then** a detail panel opens showing all items captured there, average rating, and number of visits.
4. **Given** a user on the Venue Insights page, **When** they view the leaderboard, **Then** venues are ranked by visit count with an option to sort by average item rating instead.
5. **Given** a user with no venue data, **When** they navigate to Venue Insights, **Then** the map area displays a message indicating no venues have been visited yet.

---

### User Story 7 - Friends Activity Feed and Shared Experiences (Priority: P3)

A user navigates to the Friends page and sees an activity feed showing what their friends have been capturing recently. The page also highlights shared experiences: items both the user and a friend have tried, and venues they have both visited.

**Why this priority**: Social features add engagement and discovery value but are not part of the core personal collection experience. They depend on the user having connected friends and are a lower priority than personal dashboard and collection features.

**Independent Test**: Can be fully tested by navigating to the Friends page with at least one connected friend who has activity, and verifying the feed shows recent captures and shared venues/items are highlighted.

**Acceptance Scenarios**:

1. **Given** an authenticated user with friends, **When** they navigate to the Friends page on desktop, **Then** they see an activity feed showing recent captures by their friends with thumbnails and timestamps.
2. **Given** a user viewing a friend's activity, **When** both the user and the friend have tried the same item, **Then** the interface highlights these shared items with a "You both tried this" indicator.
3. **Given** a user viewing a friend's profile, **When** both the user and the friend have visited the same venue, **Then** shared venues are highlighted with visit details for each user.
4. **Given** a user with no friends connected, **When** they navigate to the Friends page, **Then** a message is displayed explaining how to connect with friends.

---

### User Story 8 - Stats Deep Dive with Charts and Visualizations (Priority: P2)

A user navigates to the Stats page on desktop and sees a rich set of visualizations: category breakdown charts showing proportions of drink types and dessert types, a rating trend line chart showing how their average rating has changed over time, a capture frequency calendar (heatmap-style, similar to a contribution graph) showing which days/weeks they were most active, and lists of top-rated items and most-visited venues.

**Why this priority**: The Stats page is a flagship desktop feature that provides deep analytical value not possible on mobile. It transforms the existing basic stats view into a comprehensive, visually rich experience.

**Independent Test**: Can be fully tested by navigating to the Stats page and verifying each chart type renders with accurate data from the user's collection.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a diverse collection, **When** they navigate to the Stats page, **Then** they see category breakdown charts showing proportions of drink types and dessert types.
2. **Given** a user with rating history, **When** they view the rating trends chart, **Then** a line chart displays the average rating over time, with data points corresponding to their rating activity.
3. **Given** a user with capture history, **When** they view the capture frequency section, **Then** a heatmap-style calendar shows capture activity by day, with darker shading for more active days.
4. **Given** a user with collection data, **When** they view the leaderboard sections, **Then** they see a list of their top-rated items and most-visited venues.
5. **Given** a new user with minimal data, **When** they navigate to the Stats page, **Then** charts display gracefully with available data and empty states where data is insufficient.

---

### Edge Cases

- What happens when the user rapidly resizes the browser across the 1024px breakpoint? The layout must transition smoothly without layout flicker, content loss, or navigation state reset.
- What happens when a user has thousands of items in their collection and views the desktop grid? The grid must maintain smooth scrolling performance using virtualization.
- What happens when the stats endpoint returns partial or empty data? Charts must display meaningful empty states rather than broken visualizations.
- What happens when venue location data is missing or invalid? The map must skip invalid coordinates and display only venues with valid location data, with a count of venues that could not be mapped.
- What happens when image thumbnails fail to load in the activity timeline or collection grid? Placeholder images must be shown instead of broken image icons.
- What happens when a user has no friends? Social pages must show helpful empty states rather than blank screens.
- What happens when the user navigates between desktop views while data is loading? Loading states must be visible and navigation must not be blocked.

## Requirements *(mandatory)*

### Functional Requirements

#### Layout and Navigation
- **FR-001**: System MUST display a persistent sidebar navigation with main content area when the viewport is 1024px or wider.
- **FR-002**: System MUST display the existing mobile bottom-tab navigation when the viewport is below 1024px.
- **FR-003**: System MUST transition between sidebar and bottom-tab navigation responsively as the viewport crosses the 1024px threshold, without requiring a page reload.
- **FR-004**: The sidebar navigation MUST include links to Dashboard Home, Collection, Venue Insights, Friends, and Stats pages.
- **FR-005**: The sidebar navigation MUST visually indicate which page is currently active.

#### Dashboard Home
- **FR-006**: System MUST display summary cards on the Dashboard Home showing: total collection count, items by category (drinks and desserts), average ratings, and wishlist size.
- **FR-007**: System MUST display a recent activity timeline on the Dashboard Home showing captures in reverse chronological order with thumbnail images and status badges (processing, complete, failed).
- **FR-008**: System MUST display a "This Month" snapshot showing new items captured, venues visited, and wishlist conversions for the current calendar month.
- **FR-009**: System MUST display a ratings distribution chart on the Dashboard Home segmented by category.

#### Collection
- **FR-010**: System MUST display items in a multi-column grid layout on the Collection page when viewport is 1024px or wider.
- **FR-011**: System MUST display a persistent filter sidebar on the Collection page with filters for: category, rating, venue, date range, and labels.
- **FR-012**: System MUST display a slide-in detail panel from the right when a user clicks an item card, showing full item details without navigating away (split-view pattern).
- **FR-013**: System MUST support multi-select mode on the Collection page allowing users to select multiple items.
- **FR-014**: System MUST support bulk tagging of selected items in multi-select mode.
- **FR-015**: System MUST support side-by-side comparison of 2 to 4 selected items.

#### Venue Insights
- **FR-016**: System MUST display an interactive map on the Venue Insights page showing venue locations as pins.
- **FR-017**: Venue pins on the map MUST be color-coded by venue type (Bar, Lounge, Restaurant, Other) with a visible legend.
- **FR-018**: System MUST display a venue detail panel when a user clicks a map pin, showing items captured at that venue, average rating, and visit frequency.
- **FR-019**: System MUST display a venue leaderboard ranked by visit count, with an option to sort by average item rating.

#### Friends
- **FR-020**: System MUST display an activity feed on the Friends page showing friends' recent captures with thumbnails and timestamps.
- **FR-021**: System MUST highlight shared items (items both the user and a friend have tried) with a visible indicator.
- **FR-022**: System MUST highlight shared venues (venues both the user and a friend have visited).

#### Stats
- **FR-023**: System MUST display category breakdown charts showing proportions of drink types and dessert types.
- **FR-024**: System MUST display a rating trends chart showing average rating over time as a line chart.
- **FR-025**: System MUST display a capture frequency heatmap calendar showing activity by day.
- **FR-026**: System MUST display leaderboard lists of top-rated items and most-visited venues.

#### Cross-Cutting
- **FR-027**: All desktop layouts MUST display graceful empty states when data is unavailable or the user's collection is empty.
- **FR-028**: All chart visualizations MUST display tooltips or labels when users interact with data points.
- **FR-029**: System MUST NOT display emojis in any UI text.
- **FR-030**: The mobile PWA experience MUST remain completely unchanged for viewports below 1024px.

### Key Entities

- **Dashboard Summary**: Aggregated statistics for a user's collection including total counts, category breakdowns, average ratings, and wishlist size. Derived from existing item and capture data.
- **Activity Entry**: A record of a recent capture event including timestamp, associated item thumbnail, and processing status. Sourced from the existing captures data.
- **Monthly Snapshot**: A time-bounded summary of user activity for the current calendar month including new captures, venue visits, and wishlist conversions. Derived from existing data.
- **Venue Pin**: A map-displayable representation of a venue including geographic coordinates, venue type classification, and aggregated statistics (item count, average rating, visit frequency).
- **Rating Distribution**: An aggregate grouping of items by their rating value, segmented by category (drinks vs. desserts). Used to power distribution charts.
- **Capture Frequency**: A per-day aggregation of capture activity over time, used to power the heatmap calendar visualization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users on desktop viewports (1024px or wider) see the sidebar navigation layout within 2 seconds of page load.
- **SC-002**: Users can browse their full collection in the desktop grid, apply filters, and preview item details without navigating away from the collection page.
- **SC-003**: Dashboard Home summary cards display accurate, up-to-date statistics that match the user's actual collection data (zero discrepancy).
- **SC-004**: All chart visualizations render and become interactive within 3 seconds of navigating to their respective pages.
- **SC-005**: The desktop collection grid maintains smooth scrolling (no visible jank or frame drops) for collections of 1,000+ items.
- **SC-006**: Users can identify their top venues, rating trends, and capture patterns from the Stats page within 30 seconds of viewing.
- **SC-007**: Layout transitions across the 1024px breakpoint occur within 300 milliseconds with no content loss or navigation state reset.
- **SC-008**: 100% of existing mobile PWA functionality remains unaffected — no regressions in mobile layout, navigation, or interactions.
- **SC-009**: Empty states are displayed for every section when a user has no data, providing guidance on how to populate their collection via the mobile PWA.
- **SC-010**: The venue map displays all venues with valid location data, and users can click any pin to see venue details within 1 second.

## Assumptions

- The existing user stats endpoint (`GET /api/users/me/stats`) provides sufficient data for dashboard summary cards; if additional aggregations are needed (e.g., monthly snapshots, rating distributions), new backend endpoints will be created without database schema changes.
- Venue data includes geographic coordinates (latitude/longitude) for map display; venues without valid coordinates will be excluded from the map but still appear in leaderboards.
- The desktop layout is a responsive enhancement of the same single-page application — no separate desktop app, no separate routes, and no separate deployment.
- A charting library will be added to the frontend dependencies to support the required visualizations (bar charts, donut charts, line charts, heatmap calendars).
- The existing virtual scrolling solution will be extended to support the multi-column desktop grid layout.
- All existing API endpoints provide sufficient data for the desktop views; only stats-oriented aggregation endpoints may need to be added on the backend.
- The friends feature depends on the user having connected friends through the existing friends system; no changes to friend connection flows are in scope.
- The sidebar navigation replaces (not augments) the bottom-tab navigation at the 1024px breakpoint — both are never shown simultaneously.
- Users access the desktop experience through modern evergreen browsers (Chrome, Firefox, Safari, Edge) at their latest stable versions.
