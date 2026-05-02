# Quickstart: Desktop Responsive Dashboard

**Feature**: 001-desktop-responsive-dashboard
**Date**: 2025-07-17

## Prerequisites

- Node.js 20+ and npm
- .NET 10 SDK
- Git

## Getting Started

### 1. Clone and checkout the feature branch

```bash
git checkout 001-desktop-responsive-dashboard
```

### 2. Install frontend dependencies

```bash
cd src/web
npm install
```

This installs the existing dependencies plus the new ones added by this feature:
- `echarts` + `vue-echarts` - charting library for stats visualizations
- `leaflet` + `@vue-leaflet/vue-leaflet` - interactive map for venue insights

### 3. Start the backend API

```bash
cd src/api
dotnet run
```

The API starts on `http://localhost:5062`. Ensure your environment variables are configured for CosmosDB connection and authentication secrets.

### 4. Start the frontend dev server

```bash
cd src/web
npm run dev
```

The frontend starts on `http://localhost:5173` with API proxy to the backend.

### 5. View the desktop layout

Open `http://localhost:5173` in a browser window at least **1024px wide**. You should see:
- A persistent sidebar navigation on the left (replacing the mobile bottom tabs)
- The Dashboard Home as the landing page with summary cards and activity timeline

To verify the responsive behavior, resize the browser below 1024px and confirm the mobile bottom-tab navigation reappears.

## Build Verification

### Frontend type-check

```bash
cd src/web
npx vue-tsc --noEmit
```

Must pass with zero errors before committing.

### Backend build

```bash
cd src/api
dotnet build -c Release
```

Must pass with zero errors and zero warnings before committing.

## Key Development Notes

### Responsive breakpoint

The desktop layout activates at **1024px** (Tailwind v4 `lg` breakpoint). All desktop-specific components use the `useBreakpoint()` composable to conditionally render.

### Chart theming

All ECharts instances should use the shared theme from `src/web/src/composables/useChartTheme.ts` to maintain visual consistency with the app's color palette (stone backgrounds, blue accent `#96BEE6`, amber highlights).

### Virtualized grid

The desktop collection grid uses `@tanstack/vue-virtual` (already installed) with a row-based virtualization strategy where each virtual row contains multiple grid columns. Column count is reactive based on container width.

### Map tiles

The venue map uses OpenStreetMap tiles (free, no API key required). Leaflet CSS is imported only in the VenueMap component to avoid affecting the mobile bundle.

### No emojis

Per project constitution, no emojis in any UI text. Use SVG icons and CSS-based indicators only.

## File Locations

| Artifact | Path |
|----------|------|
| Feature spec | `specs/001-desktop-responsive-dashboard/spec.md` |
| Implementation plan | `specs/001-desktop-responsive-dashboard/plan.md` |
| Research decisions | `specs/001-desktop-responsive-dashboard/research.md` |
| Data model | `specs/001-desktop-responsive-dashboard/data-model.md` |
| API contracts | `specs/001-desktop-responsive-dashboard/contracts/` |
| Desktop sidebar | `src/web/src/components/common/DesktopSidebar.vue` |
| Dashboard view | `src/web/src/views/DashboardView.vue` |
| Dashboard store | `src/web/src/stores/dashboard.ts` |
| Breakpoint composable | `src/web/src/composables/useBreakpoint.ts` |
