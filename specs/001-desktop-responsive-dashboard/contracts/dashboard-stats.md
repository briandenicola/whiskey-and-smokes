# API Contract: Dashboard Stats

**Endpoint**: `GET /api/users/me/dashboard`
**Controller**: `UsersController`
**Authentication**: Required (`[Authorize]`)
**Feature**: 001-desktop-responsive-dashboard

## Request

- **Method**: GET
- **Path**: `/api/users/me/dashboard`
- **Headers**: `Authorization: Bearer {token}` or `X-API-Key: {key}`
- **Query Parameters**: None
- **Request Body**: None

## Response

### 200 OK

```json
{
  "summary": {
    "totalItems": 47,
    "drinkCount": 35,
    "dessertCount": 12,
    "avgDrinkRating": 3.8,
    "avgDessertRating": 4.1,
    "wishlistSize": 5,
    "totalVenues": 12
  },
  "thisMonth": {
    "newItemsCaptured": 3,
    "venuesVisited": 2,
    "wishlistConversions": 1,
    "month": "2025-07"
  },
  "recentActivity": [
    {
      "captureId": "cap-abc123",
      "status": "complete",
      "thumbnailUrls": ["https://blob.../thumb1.jpg"],
      "itemCount": 2,
      "createdAt": "2025-07-15T14:30:00Z",
      "venueName": "The Whiskey Bar"
    },
    {
      "captureId": "cap-def456",
      "status": "processing",
      "thumbnailUrls": ["https://blob.../thumb2.jpg"],
      "itemCount": 0,
      "createdAt": "2025-07-15T13:00:00Z",
      "venueName": null
    }
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `summary.totalItems` | int | Total items in collection (excludes wishlist) |
| `summary.drinkCount` | int | Items where type is a drink category |
| `summary.dessertCount` | int | Items where type is a dessert category |
| `summary.avgDrinkRating` | double | Average rating of rated drink items (0.0 if none) |
| `summary.avgDessertRating` | double | Average rating of rated dessert items (0.0 if none) |
| `summary.wishlistSize` | int | Items in wishlist status |
| `summary.totalVenues` | int | Unique venues with at least one item |
| `thisMonth.newItemsCaptured` | int | Items created in current calendar month |
| `thisMonth.venuesVisited` | int | Distinct venues from items captured this month |
| `thisMonth.wishlistConversions` | int | Wishlist items converted to collection this month |
| `thisMonth.month` | string | Current month in ISO format (YYYY-MM) |
| `recentActivity[].captureId` | string | Capture identifier |
| `recentActivity[].status` | string | "processing", "complete", or "failed" |
| `recentActivity[].thumbnailUrls` | string[] | Photo URLs from the capture (max 3) |
| `recentActivity[].itemCount` | int | Number of items produced by this capture |
| `recentActivity[].createdAt` | string | ISO 8601 timestamp |
| `recentActivity[].venueName` | string? | Venue name if capture has location context |

### Error Responses

| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Missing or invalid authentication |
| 500 Internal Server Error | Structured error code, no stack trace |

## Implementation Notes

- Data is computed from the authenticated user's items, captures, and venues containers
- All queries scoped to user's partition key
- `recentActivity` limited to 20 most recent captures
- Thumbnail URLs limited to first 3 photos per capture
- Drink/dessert classification uses the existing item `Type` field mapping
- Empty collection returns all zero counts with empty `recentActivity` array
