# Archiving Module — Requirements Spec

> Derived from: `TPH-Archiving Module Application Requirements-180226-114524.pdf` and Figma designs.
> Tech stack: React 18 + Redux Toolkit + RTK Query + Material-UI v6. Follow all patterns in `specs/`.

---

## 1. Overview

The **Archiving** module is a section of the Admin Portal that allows authorised users (Admin / Super-users only) to manage and query historical transaction data stored in monthly partitions.

**Key design principles:**
- Data is partitioned by calendar month; one partition = one month of data
- Partitions are **unmounted by default**; users must explicitly mount before querying
- Maximum **10 simultaneously mounted** partitions
- Least Recently Used (LRU) auto-eviction of non-pinned partitions when limit is reached
- Pinned partitions are immune to LRU eviction
- All mount/unmount/pin actions are **fully auditable** (global activity log)
- Query interface is an **embedded iframe** (PostgreSQL-compatible web query tool)
- Current month is **auto-mounted by System** on startup / month rollover

---

## 2. Navigation & Routing

### 2.1 Sidebar

The Archiving item appears in the left sidebar under **Admin Portal**:

```
Admin Portal
  Billing
  Archiving          ← active state: left border highlight, white text
  IPG Config
  T5 Config
  Recon Config
  STO
  VAS Config
  Lipa Config
```

Use Lineicons icon (e.g. `lni lni-archive`) for the sidebar icon.

### 2.2 Route

```
/archiving           → ArchivingPage (defaults to Partitions tab)
/archiving?tab=queries → ArchivingPage (Queries tab active)
```

### 2.3 Breadcrumb

```
Admin Portal / Archiving
```

---

## 3. Page: ArchivingPage

**File:** `src/features/archiving/ArchivingPage.jsx`

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Archiving                                           (page title)│
│ Admin Portal / Archiving                            (breadcrumb) │
├──────────────────────────────────────────────────────────────┤
│ [ Partitions ] [ Queries ]                          (MUI Tabs) │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Tab content area                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Page title: `"Archiving"`
- Two MUI `Tabs`: **Partitions** (default) and **Queries**
- Active tab indicated by underline (theme primary colour `#00C1FF`)
- Tab change updates URL query param `?tab=`

---

## 4. Partitions Tab

**File:** `src/features/archiving/PartitionsTab.jsx`

The Partitions tab is split into two stacked sections:
1. **Mounted Partitions** — table of currently mounted partitions
2. **Activity Log** — chronological audit log of all actions

---

### 4.1 Mounted Partitions Section

#### 4.1.1 Section Header

```
Mounted Partitions   8 out of 10 Mounted         [ Mount Partition ]
```

| Element | Detail |
|---|---|
| Section title | `"Mounted Partitions"` (typography variant `h6`) |
| Counter | `"N out of 10 Mounted"` — real-time, reads from Redux state |
| Counter colour | Default: theme text; ≥ 9/10 → `warning.main` (orange); 10/10 → `error.main` (red) |
| Mount Partition button | Blue (`primary` variant), opens **Mount Partition Selection Modal** |

#### 4.1.2 Mounted Partitions Table

Columns (in order):

| Column | Description |
|---|---|
| **Partition Date Range** | Display label e.g. `"Jul 2025 (Current Period)"`, `"Jun 2025"` |
| **Last Accessed** | Timestamp: `YYYY-MM-DD HH:mm:ss` format |
| **Mounted By** | Username or `"System"` for auto-mounts |
| **Actions** | Context-sensitive — see below |

**Row Actions column rules:**

| Condition | Displayed actions |
|---|---|
| Mounted by System (current period) | No actions (empty cell) |
| Pinned partition | Pin icon (filled/active), no Unmount button |
| Normal (unpinned) mounted | `[ Unmount ]` button (outlined) + Pin icon (unfilled toggle) |

- **Unmount button**: outlined variant, opens **Unmount Partition Confirmation Modal**
- **Pin icon**: toggle; clicking a pinned partition unpins it (and vice versa); use `lni lni-pin` / filled state; pinned state stored globally (not per-user)
- Clicking Unmount on a **pinned** partition: button is hidden — do not show Unmount for pinned rows

**Empty state:** If no partitions are mounted, show centred message: `"No partitions currently mounted."` with a `"Mount Partition"` CTA button.

---

### 4.2 Activity Log Section

**Title:** `"Activity Log"`

#### 4.2.1 Activity Log Table

Columns (in order):

| Column | Description |
|---|---|
| **Date & Time** | ISO timestamp of action start |
| **Partition Date Range** | Month label of the partition acted upon |
| **Mounted By** | Username or `"System"` |
| **Action** | `"Mount"` or `"Unmount"` |
| **Status** | Chip + optional action button — see below |

#### 4.2.2 Status Column Rendering

| Status value | Chip style | Additional element |
|---|---|---|
| `Pending` | Grey outlined chip | `[ Abort ]` button (outlined, red) |
| `In Progress` | Progress bar (`●──── 25%`) | `[ Abort ]` button (outlined, red) |
| `Aborted` | Orange/amber filled chip | `[ Retry ]` button (outlined) |
| `Failed` | Red filled chip (`error`) | `[ Retry ]` button (outlined) — Should priority |
| `Complete` | Green filled chip (`success`) | — |

- **Abort button**: opens **Abort Mounting Partition Confirmation Modal**
- **Retry button**: re-triggers the same mount/unmount operation
- Log is **read-only and immutable** — no edit/delete controls
- Log entries are created by both user actions AND system actions (system entries show `"System"` in Mounted By)
- Sort: chronological, newest first

---

## 5. Queries Tab

**File:** `src/features/archiving/QueriesTab.jsx`

The Queries tab renders a full-page embedded `<iframe>` containing a PostgreSQL-compatible web query tool.

```
┌──────────────────────────────────────────────────────┐
│  iFrame — Postgres web view of a Query page          │
│  ┌────────────────────────────────────────────────┐  │
│  │  Query  │  Query History                       │  │
│  │  ─────────────────────────────────────────     │  │
│  │  1  SELECT * FROM public.cartoon               │  │
│  │  2                                             │  │
│  │  ─────────────────────────────────────────     │  │
│  │  Data output │ Messages │ Notifications        │  │
│  │  [toolbar icons]                               │  │
│  │  ┌──────────┬──────────┬──────────────┐        │  │
│  │  │cartoonid │ name     │ cartoonimg   │        │  │
│  │  │integer   │ text     │ bytea        │        │  │
│  │  ├──────────┼──────────┼──────────────┤        │  │
│  │  │ 1        │ Casper   │ [binary data]│        │  │
│  │  └──────────┴──────────┴──────────────┘        │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

- iframe `src` comes from environment config / Redux state (API-provided URL)
- iframe should be 100% width and fill remaining viewport height
- The query tool itself provides: SQL editor, Query History tab, Data output / Messages / Notifications sub-tabs, column metadata (data types), binary field rendering as `[binary data]`, sorting
- Only data from currently mounted partitions is queryable (enforced server-side; surface error messages from the iframe tool)
- CSV export is supported by the embedded tool (minimum; Excel/JSON future)

---

## 6. Modals

### 6.1 Mount Partition — Selection Modal

**Trigger:** `[ Mount Partition ]` button on Partitions tab header.
**File:** `src/features/archiving/MountPartitionModal.jsx`

```
┌─────────────────────────────────────────┐
│  Mount Partition                    [×] │
│                                         │
│  Year  [ Select a Year ▼ ]              │
│  ─────────────────────────────────────  │
│  Partition Date Range                   │
│  Jul 2025 (Current Period)  [ Mount ]   │ ← disabled (already mounted)
│  Jun 2025                   [ Mount ]   │ ← disabled (already mounted)
│  May 2025                   [ Mount ]   │
│  Apr 2025                   [ Mount ]   │
│  Mar 2025                   [ Mount ]   │
│  …                                      │
│  (scrollable list)                      │
└─────────────────────────────────────────┘
```

**Behaviour:**
- Year dropdown filters the list to show only partitions from that year
- Partitions already mounted show a **disabled greyed-out `Mount` button**
- Partitions not yet mounted show an **active `Mount` button** (outlined)
- Clicking `Mount` on an available row:
  1. Closes the selection modal
  2. Opens the **Mount Partition Confirmation Modal** for that partition
- Sorted newest → oldest by default
- Current period labelled `"<Month> <Year> (Current Period)"`
- `[×]` closes the modal

### 6.2 Mount Partition — Confirmation Modal

**Trigger:** Clicking `[ Mount ]` on a row in the Selection Modal.
**File:** `src/features/archiving/MountPartitionConfirmModal.jsx`

```
┌───────────────────────────────────────────┐
│  Mount Partition?                     [×] │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Partition Date Range       Apr 2025 │  │
│  └─────────────────────────────────────┘  │
│                                           │
│                      Cancel      [ Mount ]│
└───────────────────────────────────────────┘
```

- `Cancel` is a text link (no button variant)
- `Mount` is a blue filled button (`primary`)
- Confirming dispatches the mount API call and adds a Pending entry to the Activity Log
- `[×]` = Cancel

### 6.3 Unmount Partition — Confirmation Modal

**Trigger:** `[ Unmount ]` button in the Mounted Partitions table row.
**File:** `src/features/archiving/UnmountPartitionConfirmModal.jsx`

```
┌───────────────────────────────────────────┐
│  Unmount Partition?                   [×] │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Partition Date Range       Apr 2025 │  │
│  └─────────────────────────────────────┘  │
│                                           │
│                      Cancel    [ Unmount ]│
└───────────────────────────────────────────┘
```

- `Cancel` is a text link
- `Unmount` is a **red filled button** (`error` colour)
- Only non-pinned partitions can trigger this modal (Unmount button hidden for pinned rows)
- Confirming dispatches unmount API call

### 6.4 Abort Mounting Partition — Confirmation Modal

**Trigger:** `[ Abort ]` button in the Activity Log Status column (Pending or In Progress rows).
**File:** `src/features/archiving/AbortMountConfirmModal.jsx`

```
┌───────────────────────────────────────────┐
│  Abort Mounting Partition?            [×] │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Partition Date Range       May 2024 │  │
│  └─────────────────────────────────────┘  │
│                                           │
│                      Cancel      [ Abort ]│
└───────────────────────────────────────────┘
```

- `Cancel` is a text link
- `Abort` is a **red filled button** (`error` colour)
- Confirming dispatches abort API call; log entry status updates to `Aborted`

---

## 7. Feature Module Structure

```
src/features/archiving/
├── archivingApiSlice.js         # RTK Query endpoints
├── archivingSlice.js            # Redux slice (UI state, modal state)
├── ArchivingPage.jsx            # Page component (tabs)
├── PartitionsTab.jsx            # Partitions tab container
├── MountedPartitionsTable.jsx   # Mounted partitions table
├── ActivityLogTable.jsx         # Activity log table
├── QueriesTab.jsx               # Queries tab (iframe)
├── MountPartitionModal.jsx      # Selection modal (list of available partitions)
├── MountPartitionConfirmModal.jsx
├── UnmountPartitionConfirmModal.jsx
└── AbortMountConfirmModal.jsx
```

---

## 8. Data Models

### 8.1 Partition

```js
{
  id: string,                   // partition identifier
  dateRange: string,            // display label e.g. "Jul 2025"
  isCurrentPeriod: boolean,     // true if this is the current calendar month
  lastAccessed: string,         // ISO timestamp
  mountedBy: string,            // username or "System"
  isPinned: boolean,            // pinned = immune to LRU eviction
  status: 'mounted' | 'unmounted'
}
```

### 8.2 Activity Log Entry

```js
{
  id: string,
  dateTime: string,             // ISO timestamp
  partitionDateRange: string,   // display label
  mountedBy: string,            // username or "System"
  action: 'Mount' | 'Unmount',
  status: 'Pending' | 'InProgress' | 'Complete' | 'Failed' | 'Aborted',
  progress: number | null,      // 0-100 for InProgress; null otherwise
}
```

---

## 9. Redux State Shape & API

### 9.1 `archivingSlice.js`

```js
{
  archiving: {
    activeTab: 0 | 1,            // 0 = Partitions, 1 = Queries
    modal: {
      type: null | 'mountSelect' | 'mountConfirm' | 'unmountConfirm' | 'abortConfirm',
      partition: null | PartitionMetadataDto,  // partition in context
      taskId: null | number        // task id in context (for abort)
    },
    mountPartitionYearFilter: string | null
  }
}
```

All partition and activity log data comes from RTK Query (server state), not Redux slice.

### 9.2 `archivingApiSlice.js` — RTK Query Endpoints

> Full API reference: **[specs/api.md](api.md)**
> Base URL: `https://tier03-archive-v2.uat-tj.com` | Auth: Bearer JWT (Keycloak)

| RTK Query endpoint | HTTP | API path | Notes |
|---|---|---|---|
| `getPartitions` | GET | `/api/v1/partition/page` | All partitions; filter by `status` client-side |
| `getPartitionsByRange` | GET | `/api/v1/partition/range` | Year filter in mount modal |
| `updatePartition` | POST | `/api/v1/partition/update` | Pin/Unpin — params sent as query string |
| `schedulePartitionChange` | POST | `/api/v1/task/schedule` | Mount (`MOUNTED`) or Unmount (`UNMOUNTED`) |
| `getTaskLog` | GET | `/api/v1/task/page` | Activity log — paginated, sort `startTime,desc` |
| `getRunningTasks` | GET | `/api/v1/task/running` | Live progress — **poll every 5s** |
| `abortTask` | PUT | `/api/v1/task/abort/{id}` | Abort a single task |

**Key field mappings:**
- Mounted partitions table: `getPartitions` → filter `content` where `status === "MOUNTED"`
- Mounted count: count `MOUNTED` items from `totalElements`
- Mount modal list: `getPartitions` full list; disable Mount button where `status === "MOUNTED"`
- Year filter in mount modal: use `getPartitionsByRange` with `startDate=YYYY-01-01`, `endDate=YYYY-12-31`
- Activity log: `getTaskLog` → filter `type` to `MOUNT` and `UNMOUNT` only
- Progress bars: merge `progressPercentage` from `getRunningTasks` into matching task log rows by `taskId`
- Retry: call `schedulePartitionChange` again with same partition `id` and original `targetPartitionStatus`
- `mountedBy` (username): resolved from the associated `PartitionTaskDto` on the task log (not in `PartitionMetadataDto` directly)

**Polling strategy:** Enable `pollingInterval: 5000` on `getRunningTasks` and `getTaskLog` whenever any task has status `PENDING`, `SCHEDULED`, or `RUNNING`. Stop polling when all tasks are terminal (`COMPLETED`, `FAILED`, `ABORTED`).

---

## 10. Non-Functional Requirements

| ID | Category | Requirement | Target |
|---|---|---|---|
| NF1 | Performance | Mount operation (typical month) | < 45 seconds (95th percentile) |
| NF2 | Concurrency | Concurrent users mount/unmount/query | ≥ 15 users, no data loss |
| NF3 | Security | Role-based access via Keycloak | Admin / Super-user roles only |
| NF4 | Auditability | All actions logged with user identity + timestamp | Retained ≥ 7 years |
| NF5 | Availability | Service available during business hours | 99.5% uptime |
| NF6 | Browser | Chrome, Edge, Firefox, Safari (macOS) | Latest versions |

---

## 11. MVP User Stories (Phase 1)

1. As an admin user, I can see which partitions are currently mounted so I know which historical data is immediately queryable.
2. As an admin user, I can mount older partitions to investigate historical transactions.
3. As an admin user, the system automatically manages the 10-partition limit by unloading the LRU non-pinned partition when I mount a new one.
4. As a compliance officer, I can pin partitions so they are immune to LRU eviction.
5. As a support analyst, I can see a complete audit trail of who mounted/unmounted which partitions and when, including system actions.
6. As a data analyst, I can write and execute SQL queries against mounted archive data.
7. As a system administrator, I can see long-running mount operations with progress indication and abort them if necessary.

---

## 12. Future / Out of Scope (Phase 2+)

- Multi-select mount of several partitions at once
- Search / filter / sort on partitions list
- Estimated size / row count per partition
- Automatic unmount after X hours of inactivity (configurable)
- Partition retention policy & deletion workflow
- Cross-partition queries (requires data mart / materialised views)
- Excel and JSON export from query results

---

## 13. UI / Styling Notes

Reference: `assets/theme.js` and `specs/ui/design-system.md` for full tokens.

### Colours (from `theme.js`)

| Token | Hex | Usage |
|---|---|---|
| `tjDarkBlue` | `#034EA2` | Primary buttons (Mount), contained actions |
| `tjNavyBlue` | `#011731` | Sidebar background, `primary.main` |
| `tjLightBlue` | `#00C1FF` | Tab indicator, `secondary.main` |
| `textWeakGrey` | `#1C2938A6` | Table body text, secondary text |
| `strokeWeak` | `#354E6B1A` | Table row borders, dividers |
| `background.default` | `#F2F5F9` | Page background |
| White | `#FFFFFF` | Cards, modal backgrounds, paper |

### Theme Gaps to Address

The existing `theme.js` **does not define** `palette.error`, `palette.warning`, or `palette.success`. These must be added for status chips and destructive buttons:

```js
// Add to createTheme palette:
error: { main: '#D22A1E' },      // matches redMetricBg in theme.js
warning: { main: '#F48738' },    // orange
success: { main: '#1FC544' },    // green
```

### Tab Width Override

`MuiTabs` sets `minWidth: 25%` (designed for 4-tab layouts). The Archiving page has **2 tabs** — override with `minWidth: 'auto'` or `minWidth: '160px'` for the ArchivingPage tabs specifically.

### Modal Dialog Actions

`MuiDialogActions` is globally styled `justifyContent: flex-start`. The Figma designs show modal buttons **right-aligned**. Override locally on the archiving modals:
```jsx
<DialogActions sx={{ justifyContent: 'flex-end', p: '1rem 1.5rem 1.5rem' }}>
```

### Element Reference

| Element | Style |
|---|---|
| Page background | `#F2F5F9` (`background.default`) |
| Sidebar (active item) | `borderLeft: 4px solid #00C1FF` (from theme Drawer override) |
| Primary button (Mount) | `variant="contained"` → `#034EA2` bg, white text, `borderRadius: 0.5rem` |
| Destructive button (Unmount/Abort) | `variant="contained" color="error"` → red bg |
| Cancel action | `<Button variant="text">` or MUI `<Link>` — no button border |
| Counter: normal | `textWeakGrey` |
| Counter: warning (9/10) | `color="warning"` → `#F48738` |
| Counter: danger (10/10) | `color="error"` → `#D22A1E` |
| Status chip — Complete | `<Chip color="success" />` → green |
| Status chip — Failed | `<Chip color="error" />` → red |
| Status chip — Aborted | `<Chip color="warning" />` → orange |
| Status chip — Pending | `<Chip variant="outlined" />` → grey outlined |
| Progress bar (in-progress) | `<LinearProgress variant="determinate" />` with `%` label alongside |
| Tab indicator (active) | `#034EA2` (`tjDarkBlue`) — from theme `MuiTabs.indicator.backgroundColor` |
| Table | MUI `Table` components (standard MRT tables per rest of portal) |
| Modal | `<Dialog maxWidth="sm">`, `borderRadius: 1rem`, white bg — from theme `MuiDialog` |
| Confirmation info row | `border: 1px solid #D9D9D9`, `borderRadius: 0.5rem`, label left / value right |

### Icons (Lineicons Pro — confirmed available)

| Usage | Icon class |
|---|---|
| Archiving sidebar nav item | `lni lni-database-1` |
| Pin (unpinned) | `lni lni-pin` (grey) |
| Pin (pinned / active) | `lni lni-pin` (with `color: tjDarkBlue`) |
| Abort / stop action | `lni lni-stop` |
| Retry action | `lni lni-undo` |
| Loading spinner | `lni lni-spinner-1 lni-is-spinning` |
| Activity log section | `lni lni-history-vertical` |
| Close modal (×) | `lni lni-xmark` |

> **Note:** No solid (`lnis-*`) variant of `lni-pin` exists in the icon set. Use colour (`tjDarkBlue` vs grey) to indicate pinned vs unpinned state.
