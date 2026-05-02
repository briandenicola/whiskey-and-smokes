# API Contract: Rating Distribution

**Endpoint**: `GET /api/users/me/stats/ratings-distribution`
**Controller**: `UsersController`
**Authentication**: Required (`[Authorize]`)
**Feature**: 001-desktop-responsive-dashboard

## Request

- **Method**: GET
- **Path**: `/api/users/me/stats/ratings-distribution`
- **Headers**: `Authorization: Bearer {token}` or `X-API-Key: {key}`
- **Query Parameters**: None
- **Request Body**: None

## Response

### 200 OK

```json
{
  "buckets": [
    { "rating": 1.0, "category": "drink", "count": 2 },
    { "rating": 1.5, "category": "drink", "count": 1 },
    { "rating": 2.0, "category": "drink", "count": 3 },
    { "rating": 2.5, "category": "drink", "count": 5 },
    { "rating": 3.0, "category": "drink", "count": 8 },
    { "rating": 3.5, "category": "dessert", "count": 2 },
    { "rating": 4.0, "category": "drink", "count": 7 },
    { "rating": 4.0, "category": "dessert", "count": 4 },
    { "rating": 4.5, "category": "drink", "count": 3 },
    { "rating": 5.0, "category": "dessert", "count": 1 }
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `buckets` | array | Rating counts per category. Only includes buckets with count > 0. |
| `buckets[].rating` | double | Rating value (0.5 increments: 0.5, 1.0, 1.5, ..., 5.0) |
| `buckets[].category` | string | "drink" or "dessert" |
| `buckets[].count` | int | Number of items with this rating in this category |

### Error Responses

| Status | Condition |
|--------|-----------|
| 401 Unauthorized | Missing or invalid authentication |
| 500 Internal Server Error | Structured error code, no stack trace |

## Implementation Notes

- Only items with a non-null `UserRating > 0` are included
- Rating values are grouped at 0.5 increments (matching the frontend rating UI)
- Items are classified as "drink" or "dessert" based on the existing `Type` field mapping
- Empty buckets (count = 0) are omitted from the response
- Queries scoped to authenticated user's partition key
- Empty collection returns `{ "buckets": [] }`
