# API Routes Documentation

This document describes all API routes available in the Goal Pilot application.

## Table of Contents

- [AI Routes](#ai-routes)
- [Task Routes](#task-routes)
- [User Routes](#user-routes)
- [Progress Stages Routes](#progress-stages-routes)
- [Calendar Routes](#calendar-routes)

---

## AI Routes

### POST /api/ai/generate-roadmap

Generates a complete learning roadmap with multiple phases using AI.

**Request Body:**

```typescript
{
  goalTitle: string
  goalDescription: string
  targetDate: string
  dailyTimeCommitment: number
}
```

**Response:**

```typescript
{
  overview: string
  roadmap: Array<{
    name: string
    duration: number
    key_activities: string[]
    success_metrics: string[]
  }>
}
```

**Status Codes:**

- `200` - Roadmap generated successfully
- `400` - Invalid request body
- `500` - AI generation failed

---

### POST /api/ai/generate-roadmap-stream

Generates a roadmap using Server-Sent Events (SSE) for real-time streaming.

**Request Body:**

```typescript
{
  goalTitle: string
  goalDescription: string
  targetDate: string
  dailyTimeCommitment: number
}
```

**Response:** Text stream (SSE)

**Status Codes:**

- `200` - Stream started
- `500` - Stream failed

---

### POST /api/ai/generate-overview-fast

Generates a quick overview of the learning path.

**Request Body:**

```typescript
{
  goalTitle: string
  goalDescription?: string
}
```

**Response:**

```typescript
{
  overview: string
}
```

**Status Codes:**

- `200` - Overview generated
- `500` - Generation failed

---

### POST /api/ai/generate-stages-fast

Generates learning stages quickly for a roadmap.

**Request Body:**

```typescript
{
  roadmapId: string
  phaseNumber: number
}
```

**Response:**

```typescript
{
  stages: Array<{
    title: string
    duration: number
    learning_objectives: string[]
  }>
}
```

---

### POST /api/ai/generate-instant

Generates an instant roadmap with default settings.

**Request Body:**

```typescript
{
  goalTitle: string
  goalDescription?: string
}
```

**Response:**

```typescript
{
  roadmap: object
  overview: string
}
```

---

## Task Routes

### GET /api/tasks/[date]

Retrieves all tasks for a specific date.

**URL Parameters:**

- `date` - Date in ISO format (YYYY-MM-DD)

**Response:**

```typescript
{
  tasks: Array<{
    id: string
    title: string
    description: string
    scheduled_date: string
    completed: boolean
    duration_minutes: number
    priority: number
  }>
}
```

**Status Codes:**

- `200` - Tasks retrieved
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/tasks/generate-phase

Generates tasks for a specific learning phase.

**Request Body:**

```typescript
{
  roadmapId: string
  phaseNumber: number
  phaseTitle: string
  dailyTimeCommitment: number
  startDate: string
}
```

**Response:**

```typescript
{
  tasks: Array<{
    id: string
    title: string
    scheduled_date: string
    duration_minutes: number
  }>
}
```

**Status Codes:**

- `200` - Tasks generated
- `400` - Invalid input
- `500` - Generation failed

---

### POST /api/tasks/generate-phase-fast

Fast task generation for a learning phase (optimized).

**Request Body:** Same as `/api/tasks/generate-phase`

**Response:** Same as `/api/tasks/generate-phase`

---

## User Routes

### GET /api/user/profile

Retrieves the current user's profile.

**Response:**

```typescript
{
  id: string
  email: string
  created_at: string
  updated_at: string
}
```

**Status Codes:**

- `200` - Profile retrieved
- `401` - Unauthorized
- `500` - Server error

---

### PUT /api/user/profile

Updates the current user's profile.

**Request Body:**

```typescript
{
  email?: string
  // other profile fields
}
```

**Response:**

```typescript
{
  message: string
  user: object
}
```

**Status Codes:**

- `200` - Profile updated
- `400` - Invalid data
- `401` - Unauthorized
- `500` - Update failed

---

### GET /api/user/preferences

Retrieves user preferences.

**Response:**

```typescript
{
  preferences: {
    theme?: string
    notifications?: boolean
    // other preferences
  }
}
```

---

### PUT /api/user/preferences

Updates user preferences.

**Request Body:**

```typescript
{
  theme?: string
  notifications?: boolean
  // other preferences
}
```

**Response:**

```typescript
{
  message: string
  preferences: object
}
```

---

### DELETE /api/user/delete

Deletes the current user's account.

**Response:**

```typescript
{
  message: string
}
```

**Status Codes:**

- `200` - Account deleted
- `401` - Unauthorized
- `500` - Deletion failed

---

## Progress Stages Routes

### POST /api/progress-stages/auto-create

Automatically creates progress stages for a roadmap phase.

**Request Body:**

```typescript
{
  roadmapId: string
  phaseNumber: number
}
```

**Response:**

```typescript
{
  stages: Array<{
    id: string
    title: string
    roadmap_id: string
    phase_number: number
    stage_number: number
  }>
}
```

**Status Codes:**

- `200` - Stages created
- `400` - Invalid input
- `401` - Unauthorized
- `500` - Creation failed

---

## Calendar Routes

### GET /api/calendar/export

Exports tasks to iCal format for calendar integration.

**Query Parameters:**

- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:** iCal file (text/calendar)

**Status Codes:**

- `200` - Calendar exported
- `401` - Unauthorized
- `500` - Export failed

---

## Authentication

All API routes (except public routes) require authentication. Include the session cookie or authorization header with requests.

**Error Response Format:**

```typescript
{
  error: string
  message: string
  details?: any
}
```

## Rate Limiting

AI generation routes may have rate limits:

- `/api/ai/*` - Limited to prevent abuse
- Other routes - Standard rate limits apply

## CORS

CORS is configured for same-origin requests only. Cross-origin requests are blocked by default.
