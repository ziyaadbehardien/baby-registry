# Archiving Module — API Reference

> Source: `api-docs.json` (OpenAPI 3.1.0)
> Base URL: `https://tier03-archive-v2.uat-tj.com`
> Auth: Bearer JWT (`Authorization: Bearer <token>`) — provided by Keycloak

---

## Endpoints Summary

| Tag | Method | Path | UI Usage |
|---|---|---|---|
| Get Partitions | GET | `/api/v1/partition/page` | All partitions list (mount modal + mounted table) |
| Get Partitions | GET | `/api/v1/partition/range` | Partitions filtered by date range |
| Update Partitions | POST | `/api/v1/partition/update` | Pin / Unpin a partition |
| Schedule Tasks | POST | `/api/v1/task/schedule` | Mount or Unmount a partition |
| Get Tasks | GET | `/api/v1/task/running` | Running tasks + progress (poll for live updates) |
| Get Tasks | GET | `/api/v1/task/running/{id}` | Single running task progress detail |
| Get Tasks | GET | `/api/v1/task/page` | Activity log (paginated task history) |
| Abort Tasks | PUT | `/api/v1/task/abort/{id}` | Abort a single pending/running task |
| Abort Tasks | PUT | `/api/v1/task/abort` | Abort multiple tasks |

---

## Partitions

### `GET /api/v1/partition/page`

Fetch a paginated list of all partitions. Filter client-side by `status` for mounted vs. unmounted.

**Query params:**

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `table` | string | No | `"tj_tran"` | Partition table name |
| `pageable.page` | int | Yes | `0` | Zero-indexed page number |
| `pageable.size` | int | Yes | — | Items per page |
| `pageable.sort` | string[] | No | — | e.g. `["startDate,desc"]` |

**Response:** `PagePartitionMetadataDto`

```json
{
  "content": [ PartitionMetadataDto ],
  "totalPages": 5,
  "totalElements": 48,
  "first": true,
  "last": false,
  "size": 10,
  "number": 0
}
```

**Use for:**
- Mounted Partitions table: filter `content` where `status === "MOUNTED"`
- Mount Partition modal: show all partitions; disable Mount button where `status === "MOUNTED"`
- Mounted count: count items with `status === "MOUNTED"` from `totalElements` (or filter content)

---

### `GET /api/v1/partition/range`

Fetch partitions within a specific date range.

**Query params:**

| Param | Type | Required | Default |
|---|---|---|---|
| `table` | string | No | `"tj_tran"` |
| `startDate` | date (`YYYY-MM-DD`) | Yes | — |
| `endDate` | date (`YYYY-MM-DD`) | Yes | — |
| `pageable.*` | Pageable | Yes | — |

**Response:** `PagePartitionMetadataDto` (same shape as above)

**Use for:** Year filter in Mount Partition modal — pass Jan 1 and Dec 31 of selected year.

---

### `POST /api/v1/partition/update`

Pin or unpin a partition to protect it from LRU eviction.

> **Note:** Request is passed as a **query parameter** (not request body), per the OpenAPI spec.

**Query param:** `request` (serialised as `PartitionUpdateRequest`)

```
POST /api/v1/partition/update?id=42&pinned=true
```

**`PartitionUpdateRequest`:**

```json
{
  "id": 42,
  "pinned": true
}
```

**Response:** `PartitionMetadataDto` — the updated partition.

**Use for:** Pin icon toggle in Mounted Partitions table row.

---

## Tasks (Mount / Unmount Operations)

### `POST /api/v1/task/schedule`

Schedule one or more partition state changes (mount or unmount).

**Request body:** `PartitionChangeRequest`

```json
{
  "changes": [
    { "id": 42, "status": "MOUNTED" }
  ]
}
```

To **mount** a partition: `status: "MOUNTED"`
To **unmount** a partition: `status: "UNMOUNTED"`

**Response:** `PartitionTaskResponseDtoPartitionTaskDto`

```json
{
  "tasks": [ PartitionTaskDto ]
}
```

**Use for:**
- Mount confirmation modal → confirm → POST with `status: "MOUNTED"`
- Unmount confirmation modal → confirm → POST with `status: "UNMOUNTED"`
- Retry button (failed/aborted) → POST with same partition id and target status

---

### `GET /api/v1/task/running`

Get all currently running tasks with full progress detail. **Poll this every 5 seconds** to update progress bars in the Activity Log.

**Response:** `PartitionTaskResponseDtoPartitionTaskDetailDto`

```json
{
  "tasks": [ PartitionTaskDetailDto ]
}
```

**Use for:** Live progress bars in Activity Log — merge `progressPercentage` into task log entries where `status === "RUNNING"`.

---

### `GET /api/v1/task/running/{id}`

Get progress detail for a single running task.

**Path param:** `id` (int64) — task ID

**Response:** `PartitionTaskDetailDto`

**Use for:** Targeted refresh of a single in-progress row (optional optimisation).

---

### `GET /api/v1/task/page`

Fetch paginated task history — this is the **Activity Log**.

**Query params:** `pageable` (page, size, sort)

Recommended sort: `startTime,desc` (newest first).

**Response:** `PagePartitionTaskDto`

```json
{
  "content": [ PartitionTaskDto ],
  "totalPages": 10,
  "totalElements": 97,
  ...
}
```

Filter `content` to only show `type: "MOUNT"` and `type: "UNMOUNT"` tasks. (`ARCHIVE` and `CREATE` types are system-internal and not shown in UI.)

**Use for:** Activity Log table — paginated, newest first.

---

### `PUT /api/v1/task/abort/{id}`

Abort a single running/pending task.

**Path param:** `id` (int64) — task ID

**Response:** `PartitionTaskResponseDtoPartitionTaskDto`

**Use for:** Abort confirmation modal → confirm.

---

### `PUT /api/v1/task/abort`

Abort multiple tasks at once.

**Query param:** `ids` (array of int64, unique)

```
PUT /api/v1/task/abort?ids=1&ids=2&ids=3
```

**Response:** `PartitionTaskResponseDtoPartitionTaskDto`

**Use for:** Bulk abort (future feature).

---

## Schemas

### `PartitionMetadataDto`

```ts
{
  id: number;                               // int64 — use as key
  archived: boolean;
  pinned: boolean;                          // true = immune to LRU eviction
  tableName: string;                        // e.g. "tj_tran"
  partitionName: string;                    // e.g. "tj_tran_2025_07"
  status: "MOUNTED" | "UNMOUNTED" | "CREATING";
  fileName: string;
  startDate: string;                        // "YYYY-MM-DD"
  endDate: string;                          // "YYYY-MM-DD"
  created: string;                          // ISO datetime
  updated: string;                          // ISO datetime — use as "Last Accessed" proxy
}
```

**UI display mapping:**

| API field | UI label | Notes |
|---|---|---|
| `startDate` / `endDate` | Partition Date Range | Format as `"MMM YYYY"`, flag current month as `"(Current Period)"` |
| `updated` | Last Accessed | Format as `YYYY-MM-DD HH:mm:ss` |
| `pinned` | Pin icon state | Filled icon when `true` |
| `status` | (determines row actions) | `MOUNTED` = show Unmount + pin; `UNMOUNTED` = not shown in mounted table |

> **Note:** `PartitionMetadataDto` does not include a `mountedBy` field. "Mounted By" must be resolved from the most recent `COMPLETED` `MOUNT` task for that partition in the task log, or from `PartitionTaskDto.partitionMetadata` on the associated task.

---

### `PartitionTaskDto`

```ts
{
  id: number;                               // int64 — task ID
  type: "ARCHIVE" | "CREATE" | "MOUNT" | "UNMOUNT";
  status: "ABORTED" | "COMPLETED" | "FAILED" | "PENDING" | "RESTORING" | "RUNNING" | "SCHEDULED";
  targetPartitionStatus: "MOUNTED" | "UNMOUNTED" | "CREATING";
  partitionMetadata: PartitionMetadataDto;  // nested partition info
  executionCount: number;                   // int32 — retry count
  startTime: string;                        // ISO datetime
  endTime: string;                          // ISO datetime | null if still running
}
```

**Status → UI mapping:**

| API `status` | UI Status chip | UI actions |
|---|---|---|
| `PENDING` | Pending (grey outlined chip) | Abort button |
| `SCHEDULED` | Pending (treat same as PENDING) | Abort button |
| `RUNNING` | Progress bar (% from running task detail) | Abort button |
| `RESTORING` | Progress bar (treat same as RUNNING) | Abort button |
| `COMPLETED` | Complete (green chip) | — |
| `FAILED` | Failed (red chip) | Retry button |
| `ABORTED` | Aborted (amber chip) | Retry button |

---

### `PartitionTaskDetailDto`

Extended task info for **running** tasks — includes progress.

```ts
{
  taskId: number;                           // int64
  size: number;                             // int64 — total bytes
  millisElapsed: number;
  millisRemaining: number;
  progressPercentage: number;               // float 0–100 — use for progress bar
  processingSpeed: string;                  // e.g. "1.2 MB/s"
  taskType: "ARCHIVE" | "CREATE" | "MOUNT" | "UNMOUNT";
  targetPartitionStatus: "MOUNTED" | "UNMOUNTED" | "CREATING";
  partitionTaskStatus: "ABORTED" | "COMPLETED" | "FAILED" | "PENDING" | "RESTORING" | "RUNNING" | "SCHEDULED";
  partitionMetadata: PartitionMetadataDto;
}
```

**Use:** Merge `progressPercentage` into the corresponding Activity Log row when rendering `RUNNING` status.

---

### `PartitionChangeRequest`

```ts
{
  changes: Array<{
    id: number;      // partition id
    status: "MOUNTED" | "UNMOUNTED" | "CREATING";
  }>;
}
```

---

### `PartitionUpdateRequest`

```ts
{
  id: number;        // partition id
  pinned: boolean;
}
```

Sent as query params to `POST /api/v1/partition/update`.

---

### Pageable

```ts
{
  page: number;      // int32, min 0
  size: number;      // int32, min 1
  sort: string[];    // e.g. ["startDate,desc"]
}
```

---

## RTK Query Slice Implementation Notes

```js
// archivingApiSlice.js
const archivingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Partition list — used by both mount modal and mounted table
    getPartitions: builder.query({
      query: ({ table = 'tj_tran', page = 0, size = 50, sort = ['startDate,desc'] }) => ({
        url: '/api/v1/partition/page',
        params: { table, 'pageable.page': page, 'pageable.size': size, 'pageable.sort': sort },
      }),
      providesTags: ['Partitions'],
    }),

    // Partitions filtered by year (for mount modal year filter)
    getPartitionsByRange: builder.query({
      query: ({ startDate, endDate, table = 'tj_tran', page = 0, size = 12 }) => ({
        url: '/api/v1/partition/range',
        params: { table, startDate, endDate, 'pageable.page': page, 'pageable.size': size },
      }),
      providesTags: ['Partitions'],
    }),

    // Pin / Unpin — note: uses query params not body
    updatePartition: builder.mutation({
      query: ({ id, pinned }) => ({
        url: '/api/v1/partition/update',
        method: 'POST',
        params: { id, pinned },
      }),
      invalidatesTags: ['Partitions'],
    }),

    // Mount or Unmount (schedule task)
    schedulePartitionChange: builder.mutation({
      query: (changes) => ({
        url: '/api/v1/task/schedule',
        method: 'POST',
        body: { changes },
      }),
      invalidatesTags: ['Partitions', 'Tasks'],
    }),

    // Activity log (task history) — paginated
    getTaskLog: builder.query({
      query: ({ page = 0, size = 20 }) => ({
        url: '/api/v1/task/page',
        params: { 'pageable.page': page, 'pageable.size': size, 'pageable.sort': ['startTime,desc'] },
      }),
      providesTags: ['Tasks'],
    }),

    // Running tasks — poll for progress updates
    getRunningTasks: builder.query({
      query: () => '/api/v1/task/running',
      providesTags: ['RunningTasks'],
    }),

    // Abort single task
    abortTask: builder.mutation({
      query: (id) => ({
        url: `/api/v1/task/abort/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Tasks', 'RunningTasks'],
    }),

  }),
});
```

**Polling:** Use RTK Query `pollingInterval` on `getRunningTasks` and `getTaskLog`:
```js
const { data } = useGetRunningTasksQuery(undefined, { pollingInterval: 5000 });
```

Stop polling when no tasks have `RUNNING` or `PENDING` status.
