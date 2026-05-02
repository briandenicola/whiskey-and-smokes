# Data Model: Desktop Responsive Dashboard

**Feature**: 001-desktop-responsive-dashboard
**Date**: 2025-07-17

## Existing Entities (unchanged)

These entities already exist in the codebase and require no schema changes. Referenced here for context.

### Item (`src/api/Models/Item.cs`)
| Field | Type | Description |
|-------|------|-------------|
| Id | string | Unique identifier |
| UserId | string | Partition key, owner |
| CaptureId | string | Source capture |
| Type | string | Category (e.g., "whiskey", "cocktail", "dessert") |
| Name | string | Item name |
| Brand | string? | Brand/maker |
| Venue | VenueInfo? | Where captured (name, address, venueId) |
| PhotoUrls | List\<string\> | Item photos |
| UserRating | double? | User's rating (0-5) |
| UserNotes | string? | Tasting notes |
| Tags | List\<string\> | User-applied tags |
| Status | string | Item status |
| CreatedAt | DateTime | Creation timestamp |

### Venue (`src/api/Models/Venue.cs`)
| Field | Type | Description |
|-------|------|-------------|
| Id | string | Unique identifier |
| UserId | string | Partition key, owner |
| Name | string | Venue name |
| Type | string | Venue type (Bar, Lounge, Restaurant, Other) |
| Location | GeoLocation? | Lat/lng coordinates for map |
| Address | string? | Street address |
| Rating | double? | Venue rating |
| Labels | List\<string\> | User-applied labels |
| PhotoUrls | List\<string\> | Venue photos |

### GeoLocation (`src/api/Models/Capture.cs`)
| Field | Type | Description |
|-------|------|-------------|
| Latitude | double | Geographic latitude |
| Longitude | double | Geographic longitude |

### Capture (`src/api/Models/Capture.cs`)
| Field | Type | Description |
|-------|------|-------------|
| Id | string | Unique identifier |
| UserId | string | Partition key, owner |
| Photos | List\<string\> | Capture photo URLs |
| Status | string | processing / complete / failed |
| ItemIds | List\<string\> | Resulting item IDs |
| CreatedAt | DateTime | Capture timestamp |
| ProcessingError | string? | Error details if failed |

### Friendship (`src/api/Models/Friendship.cs`)
| Field | Type | Description |
|-------|------|-------------|
| Id | string | Unique identifier |
| UserId | string | Owner |
| FriendId | string | Friend's user ID |
| FriendDisplayName | string | Display name |
| Status | string | Friendship status |

### UserStats (`src/api/Models/UserStats.cs`)
Existing stats response — already includes: overview, typeBreakdown, avgRatingByType, topRated, topVenues, topTags, activityByDay, monthlyTrend, ratingTrend.

---

## New Entities

### DashboardStats (new backend response model)

**Purpose**: Aggregated data for the Dashboard Home view. Combines summary cards, monthly snapshot, and recent activity in a single response to minimize API calls.

**Location**: `src/api/Models/DashboardStats.cs`

```csharp
public class DashboardStats
{
    public DashboardSummary Summary { get; set; }
    public MonthlySnapshot ThisMonth { get; set; }
    public List<RecentActivity> RecentActivity { get; set; }
}

public class DashboardSummary
{
    public int TotalItems { get; set; }
    public int DrinkCount { get; set; }
    public int DessertCount { get; set; }
    public double AvgDrinkRating { get; set; }
    public double AvgDessertRating { get; set; }
    public int WishlistSize { get; set; }
    public int TotalVenues { get; set; }
}

public class MonthlySnapshot
{
    public int NewItemsCaptured { get; set; }
    public int VenuesVisited { get; set; }
    public int WishlistConversions { get; set; }
    public string Month { get; set; }  // "2025-07"
}

public class RecentActivity
{
    public string CaptureId { get; set; }
    public string Status { get; set; }  // "processing" | "complete" | "failed"
    public List<string> ThumbnailUrls { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? VenueName { get; set; }
}
```

**Derivation**:
- `Summary`: Computed from all user items (filtered by type) and wishlist items
- `ThisMonth`: Filtered from items/captures where `CreatedAt` falls in current calendar month
- `RecentActivity`: Last 20 captures ordered by `CreatedAt` descending

**Validation Rules**:
- All counts default to 0 (never null)
- Averages default to 0.0 when no rated items exist
- `RecentActivity` capped at 20 entries server-side
- `Month` formatted as ISO year-month string

---

### RatingDistribution (new backend response model)

**Purpose**: Per-rating-value item counts segmented by category, powering distribution charts on dashboard and stats pages.

**Location**: `src/api/Models/RatingDistribution.cs`

```csharp
public class RatingDistribution
{
    public List<RatingBucket> Buckets { get; set; }
}

public class RatingBucket
{
    public double Rating { get; set; }    // 0.5, 1.0, 1.5, ..., 5.0
    public string Category { get; set; }  // "drink" | "dessert"
    public int Count { get; set; }
}
```

**Derivation**:
- Group all rated items by `UserRating` value and item type category
- Items without ratings are excluded
- Rating values are bucketed at 0.5 increments (matching the existing rating UI)

**Validation Rules**:
- `Rating` must be between 0.5 and 5.0
- `Count` is always >= 0
- `Category` is always "drink" or "dessert"
- Empty collection returns empty `Buckets` list

---

## Frontend View Models (TypeScript interfaces)

### DashboardState (Pinia store)

```typescript
// src/web/src/stores/dashboard.ts
interface DashboardState {
  summary: DashboardSummary | null
  thisMonth: MonthlySnapshot | null
  recentActivity: RecentActivity[]
  ratingDistribution: RatingBucket[]
  isLoading: boolean
  error: string | null
}
```

### Collection Filter State

```typescript
// Used in FilterSidebar.vue / ItemsView.vue
interface CollectionFilters {
  category: string | null      // "drink" | "dessert" | null (all)
  minRating: number | null     // 0.5 - 5.0
  maxRating: number | null
  venueId: string | null
  dateFrom: string | null      // ISO date string
  dateTo: string | null
  labels: string[]             // tag-based filter
}
```

### Venue Map Pin

```typescript
// Used in VenueMap.vue
interface VenuePin {
  id: string
  name: string
  type: string                 // "Bar" | "Lounge" | "Restaurant" | "Other"
  latitude: number
  longitude: number
  itemCount: number
  avgRating: number | null
  visitCount: number
}
```

---

## State Transitions

### Capture Status (existing, displayed in activity timeline)

```
processing → complete
processing → failed
```

Status badges in the activity timeline use these states directly. No new states introduced.

### Collection Detail Panel

```
closed → open (item click)
open → open (different item click, panel updates)
open → closed (close button or Escape key)
```

### Multi-Select Mode

```
inactive → active (toggle button click)
active: items selected/deselected via checkbox
active → bulk action applied → inactive (action complete)
active → inactive (cancel/toggle)
```

---

## Relationships

```
User 1──* Item
User 1──* Venue
User 1──* Capture
User 1──* Friendship
Capture 1──* Item (via ItemIds)
Item *──1 Venue (via VenueInfo.VenueId)
Venue 1──1 GeoLocation (optional)
DashboardStats ← derived from Items + Captures + Venues (no FK)
RatingDistribution ← derived from Items (no FK)
```
