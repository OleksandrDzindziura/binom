# Data Table & Filtering System — Implementation Plan

## Overview

Build a production-grade data table system for the admin panel with:
- **Server-side filtering** via `drizzle-filters` (Prisma-like filter objects)
- **Server-side sorting** with multi-column support
- **Server-side pagination** with configurable page sizes
- **URL state persistence** via `nuqs` (type-safe search params)
- **BYOS state management** — nuqs (URL), zustand (client), or in-memory adapters
- **TanStack Table** as the headless table engine
- **shadcn/ui** components for all UI
- **tablecn-inspired UI** — Notion/Airtable advanced filters, Linear command-palette filters, drag-and-drop sort/filter reordering

Design goals: the filter object shape is **shared between web and mobile** (same Zod schemas from `@repo/schemas`), while the UI layer is platform-specific.

---

## Part 1: Backend — Filter Schemas & Service Layer

### 1.1 Install `drizzle-filters`

```bash
cd apps/api && pnpm add drizzle-filters
```

Peer deps (`drizzle-orm`, `zod`) are already installed.

### 1.2 Define Filter Schemas in `@repo/schemas`

Create `packages/schemas/src/filters/` directory with per-module filter schemas.

The `drizzle-filters` library exports Zod schema helpers:
- `stringFilterSchema` — operators: `equals`, `not`, `contains`, `startsWith`, `endsWith`, `in`, `notIn`, `isNull`, `isNotNull`
- `numberFilterSchema` — operators: `equals`, `not`, `lt`, `lte`, `gt`, `gte`, `in`, `notIn`, `isNull`, `isNotNull`
- `dateFilterSchema` — operators: `equals`, `not`, `lt`, `lte`, `gt`, `gte`, `in`, `notIn`, `isNull`, `isNotNull`
- `booleanFilterSchema` — operators: `equals`, `not`, `isNull`, `isNotNull`

Each module gets its own filter schema. Example for fleet:

```ts
// packages/schemas/src/filters/fleet.ts
import { z } from 'zod'
import {
  stringFilterSchema,
  numberFilterSchema,
  dateFilterSchema,
} from 'drizzle-filters/schemas'

export const vehicleFilterSchema = z.object({
  plateNumber:  stringFilterSchema.optional(),
  brand:        stringFilterSchema.optional(),
  model:        stringFilterSchema.optional(),
  year:         numberFilterSchema.optional(),
  seatCount:    numberFilterSchema.optional(),
  status:       stringFilterSchema.optional(),  // enum values use string `equals`/`in`
  type:         stringFilterSchema.optional(),
  createdAt:    dateFilterSchema.optional(),
}).strict()

export const driverFilterSchema = z.object({
  firstName:    stringFilterSchema.optional(),
  lastName:     stringFilterSchema.optional(),
  licenseNumber: stringFilterSchema.optional(),
  isActive:     z.object({ equals: z.boolean() }).optional(),
  createdAt:    dateFilterSchema.optional(),
}).strict()

export type VehicleFilter = z.infer<typeof vehicleFilterSchema>
export type DriverFilter = z.infer<typeof driverFilterSchema>
```

Create similar files for all 9 modules:

```
packages/schemas/src/filters/
├── index.ts           — re-exports all filter schemas
├── fleet.ts           — vehicleFilterSchema, driverFilterSchema
├── routes.ts          — routeFilterSchema, stopFilterSchema, scheduleFilterSchema
├── tickets.ts         — ticketFilterSchema, ticketTypeFilterSchema
├── charter.ts         — charterRequestFilterSchema, charterInvoiceFilterSchema
├── corporate.ts       — corporateClientFilterSchema
├── operations.ts      — driverShiftFilterSchema, fuelLogFilterSchema, expenseFilterSchema
├── cms.ts             — newsArticleFilterSchema, passengerAlertFilterSchema
└── analytics.ts       — routeDailyStatsFilterSchema
```

Re-export from `packages/schemas/src/index.ts`.

### 1.3 Define Shared Sort & Pagination Schemas

```ts
// packages/schemas/src/pagination.ts (already exists, extend it)
import { z } from 'zod'

export const sortItemSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const paginationInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
  sort: z.array(sortItemSchema).optional(),  // multi-sort support
  joinOperator: z.enum(['and', 'or']).default('and'),
})

export const paginatedOutputSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pageCount: z.number(),
    total: z.number(),
  })

export type SortItem = z.infer<typeof sortItemSchema>
export type PaginationInput = z.infer<typeof paginationInputSchema>
```

### 1.4 Update Contracts in `@repo/contract`

Each `list` endpoint gets filter + pagination inputs:

```ts
// packages/contract/src/fleet.ts
import { vehicleFilterSchema, driverFilterSchema } from '@repo/schemas'
import { paginationInputSchema } from '@repo/schemas'

export const fleetContract = {
  vehicle: {
    list: oc
      .input(paginationInputSchema.extend({
        filter: vehicleFilterSchema.optional(),
      }))
      .output(z.object({
        data: z.array(vehicleSchema),
        pageCount: z.number(),
        total: z.number(),
      })),
    // getById, create, update, delete remain unchanged
  },
  driver: {
    list: oc
      .input(paginationInputSchema.extend({
        filter: driverFilterSchema.optional(),
      }))
      .output(z.object({
        data: z.array(driverSchema),
        pageCount: z.number(),
        total: z.number(),
      })),
  },
}
```

### 1.5 Build Shared Filter-to-Drizzle Helper

Create a reusable service helper in the API:

```ts
// apps/api/src/lib/query-helpers.ts
import { FilterBuilder } from 'drizzle-filters'
import { type SQL, sql, asc, desc } from 'drizzle-orm'
import type { PgSelect, PgTable } from 'drizzle-orm/pg-core'

interface FilterMapping {
  filter: unknown
  column: any
  type: 'string' | 'number' | 'date' | 'boolean'
}

interface QueryOptions {
  page: number
  perPage: number
  sort?: { field: string; order: 'asc' | 'desc' }[]
  joinOperator?: 'and' | 'or'
}

/**
 * Apply filters using drizzle-filters FilterBuilder
 */
export function buildWhereClause(mappings: FilterMapping[]): SQL | undefined {
  return FilterBuilder.buildWhere(
    mappings.filter(m => m.filter != null)
  )
}

/**
 * Apply sorting to a query — maps sort field names to table columns
 */
export function applySorting<T extends PgTable>(
  table: T,
  sort?: { field: string; order: 'asc' | 'desc' }[]
): SQL[] {
  if (!sort?.length) return []
  return sort
    .filter(s => s.field in (table as any))
    .map(s => {
      const col = (table as any)[s.field]
      return s.order === 'asc' ? asc(col) : desc(col)
    })
}

/**
 * Apply pagination and return { data, pageCount, total }
 */
export async function paginateQuery<T>(
  baseQuery: PgSelect,
  countQuery: Promise<{ count: number }[]>,
  options: QueryOptions
) {
  const { page, perPage } = options
  const offset = (page - 1) * perPage

  const [data, countResult] = await Promise.all([
    baseQuery.limit(perPage).offset(offset),
    countQuery,
  ])

  const total = Number(countResult[0]?.count ?? 0)
  return {
    data,
    pageCount: Math.ceil(total / perPage),
    total,
  }
}
```

### 1.6 Service Layer Pattern

Each service's `list` method follows this pattern:

```ts
// apps/api/src/modules/fleet/fleet.service.ts
import { FilterBuilder } from 'drizzle-filters'
import { buildWhereClause, applySorting } from '../../lib/query-helpers.js'

async listVehicles(input: VehicleListInput) {
  const { page, perPage, sort, filter, joinOperator } = input

  // Build WHERE clause from filter object
  const where = filter
    ? FilterBuilder.buildWhere([
        { filter: filter.plateNumber, column: vehicles.plateNumber, type: 'string' },
        { filter: filter.brand,       column: vehicles.brand,       type: 'string' },
        { filter: filter.model,       column: vehicles.model,       type: 'string' },
        { filter: filter.year,        column: vehicles.year,        type: 'number' },
        { filter: filter.seatCount,   column: vehicles.seatCount,   type: 'number' },
        { filter: filter.status,      column: vehicles.status,      type: 'string' },
        { filter: filter.type,        column: vehicles.type,        type: 'string' },
        { filter: filter.createdAt,   column: vehicles.createdAt,   type: 'date' },
      ])
    : undefined

  // Build ORDER BY
  const orderBy = applySorting(vehicles, sort)

  // Paginated query
  const offset = (page - 1) * perPage
  const [data, countResult] = await Promise.all([
    this.db
      .select()
      .from(vehicles)
      .where(where)
      .orderBy(...orderBy)
      .limit(perPage)
      .offset(offset),
    this.db
      .select({ count: sql<number>`count(*)` })
      .from(vehicles)
      .where(where),
  ])

  const total = Number(countResult[0]?.count ?? 0)
  return {
    data,
    pageCount: Math.ceil(total / perPage),
    total,
  }
}
```

### 1.7 Apply to All 9 Modules

Repeat the pattern for every module's list endpoints:
- `fleet.vehicle.list`, `fleet.driver.list`
- `routes.list`, `routes.stops.list`
- `tickets.list`, `tickets.types.list`
- `charter.requests.list`, `charter.invoices.list`
- `corporate.list`
- `operations.shifts.list`, `operations.fuelLogs.list`, `operations.expenses.list`
- `cms.articles.list`, `cms.alerts.list`
- `analytics.routeStats.list`

Each gets: filter schema + pagination + multi-sort + total count.

---

## Part 2: Frontend — Data Table Infrastructure

### 2.1 Install Dependencies

```bash
cd apps/web && pnpm add nuqs @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities cmdk date-fns
```

Already installed: `@tanstack/react-table`, `@tanstack/react-query`, shadcn/ui components.

Additional shadcn components needed (install via CLI):
```bash
pnpm dlx shadcn@latest add popover command calendar slider scroll-area toggle-group
```

### 2.2 File Structure

```
apps/web/
├── components/
│   └── data-table/
│       ├── index.ts                           — public exports
│       ├── types.ts                           — all type definitions
│       ├── config.ts                          — operators, variants, constants
│       ├── parsers.ts                         — nuqs parsers for URL state
│       ├── utils.ts                           — shared utilities
│       │
│       │ — Core Components
│       ├── data-table.tsx                     — main table renderer
│       ├── data-table-provider.tsx            — context provider + store adapter
│       ├── data-table-skeleton.tsx            — loading skeleton
│       │
│       │ — Toolbar
│       ├── data-table-toolbar.tsx             — simple toolbar (search + column toggle)
│       ├── data-table-advanced-toolbar.tsx    — advanced toolbar (filters + sorts + view)
│       │
│       │ — Filtering (Notion/Airtable style)
│       ├── data-table-filter-list.tsx         — draggable filter row list
│       ├── data-table-filter-item.tsx         — single filter row (field + operator + value)
│       │
│       │ — Filtering (Linear/Command Palette style)
│       ├── data-table-filter-menu.tsx         — command-palette filter popover
│       │
│       │ — Filter Value Inputs (per variant)
│       ├── data-table-filter-input-text.tsx       — text/search input
│       ├── data-table-filter-input-number.tsx     — number input + range
│       ├── data-table-filter-input-date.tsx       — calendar date picker
│       ├── data-table-filter-input-date-range.tsx — date range picker
│       ├── data-table-filter-input-select.tsx     — single select (faceted)
│       ├── data-table-filter-input-multiselect.tsx — multi select (faceted, with badges)
│       ├── data-table-filter-input-boolean.tsx    — true/false toggle
│       ├── data-table-filter-input-slider.tsx     — range slider (number ranges)
│       │
│       │ — Sorting
│       ├── data-table-sort-list.tsx           — multi-sort popover with drag reorder
│       ├── data-table-column-header.tsx       — click-to-sort column header
│       │
│       │ — Pagination
│       ├── data-table-pagination.tsx          — page nav, rows per page, page info
│       │
│       │ — Column Management
│       ├── data-table-view-options.tsx         — column visibility toggle (searchable)
│       │
│       │ — Bulk Actions
│       └── data-table-action-bar.tsx          — floating action bar for selected rows
│
├── hooks/
│   ├── use-data-table.ts                      — main hook: wires table + URL state + server data
│   └── use-debounced-callback.ts              — debounce utility for filter inputs
│
└── lib/
    └── stores/
        ├── table-store-adapter.ts             — BYOS adapter interface
        ├── table-store-nuqs.ts                — nuqs URL adapter (default for admin)
        ├── table-store-zustand.ts             — zustand adapter (for embedded/modal tables)
        └── table-store-memory.ts              — in-memory adapter (for simple cases)
```

### 2.3 NuqsAdapter Setup

Add `NuqsAdapter` to the app layout:

```tsx
// apps/web/app/(admin)/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function AdminLayout({ children }) {
  return (
    <NuqsAdapter>
      {/* existing layout */}
      {children}
    </NuqsAdapter>
  )
}
```

---

## Part 3: Type System & Configuration

### 3.1 Types (`components/data-table/types.ts`)

```ts
import type { Column, ColumnDef, Table } from '@tanstack/react-table'
import type { DataTableConfig } from './config'
import type { ReactNode } from 'react'

// ─── Filter Operators & Variants ────────────────────────────
export type FilterOperator = DataTableConfig['operators'][number]
export type FilterVariant = DataTableConfig['filterVariants'][number]
export type JoinOperator = 'and' | 'or'

// ─── Column Metadata Extension ──────────────────────────────
// Added via TanStack Table's module augmentation
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // Optional query key overrides for URL state
    queryKeys?: {
      page?: string
      perPage?: string
      sort?: string
      filters?: string
      joinOperator?: string
    }
  }
  interface ColumnMeta<TData, TValue> {
    label?: string                          // human-readable column name
    placeholder?: string                    // filter input placeholder
    variant?: FilterVariant                 // which filter UI to render
    options?: Option[]                      // for select/multiSelect variants
    range?: [number, number]                // for slider/range variants
    unit?: string                           // e.g. "PLN", "km", "seats"
    icon?: React.ComponentType<{ className?: string }>
    serverFilterField?: string              // maps to drizzle-filters field name (if different from column id)
  }
}

// ─── Filter Item (URL-serialized) ───────────────────────────
export interface FilterItemSchema {
  id: string              // column id
  value: string | string[]
  variant: FilterVariant
  operator: FilterOperator
  filterId: string        // unique id for this filter instance (for drag-and-drop)
}

export type ExtendedColumnFilter<TData> = FilterItemSchema & {
  id: keyof TData & string
}

// ─── Sort Item (URL-serialized) ─────────────────────────────
export type ExtendedColumnSort<TData> = {
  id: keyof TData & string
  desc: boolean
}

// ─── Select Option (for faceted filters) ────────────────────
export interface Option {
  label: string
  value: string
  count?: number
  icon?: React.ComponentType<{ className?: string }>
}

// ─── Row Action (for action column) ─────────────────────────
export interface DataTableRowAction<TData> {
  row: TData
  type: 'update' | 'delete' | 'view'
}

// ─── Store Adapter Interface (BYOS) ────────────────────────
export interface TableStoreAdapter {
  // Read state
  getPage(): number
  getPerPage(): number
  getSorting(): ExtendedColumnSort<any>[]
  getFilters(): FilterItemSchema[]
  getJoinOperator(): JoinOperator

  // Write state
  setPage(page: number): void
  setPerPage(perPage: number): void
  setSorting(sorting: ExtendedColumnSort<any>[]): void
  setFilters(filters: FilterItemSchema[]): void
  setJoinOperator(op: JoinOperator): void
}
```

### 3.2 Config (`components/data-table/config.ts`)

Defines all operators per filter variant. Adapted from tablecn:

```ts
export const dataTableConfig = {
  operators: [
    'iLike', 'notILike',           // text pattern matching
    'eq', 'ne',                     // equality
    'lt', 'lte', 'gt', 'gte',      // comparison
    'inArray', 'notInArray',        // array membership
    'isBetween',                    // range (number or date)
    'isRelativeToToday',            // date relative (e.g. "last 7 days")
    'isEmpty', 'isNotEmpty',        // null/empty checks
  ] as const,

  filterVariants: [
    'text',        // free text search (iLike, notILike, eq, ne, isEmpty, isNotEmpty)
    'number',      // numeric (eq, ne, lt, lte, gt, gte, isBetween, isEmpty, isNotEmpty)
    'range',       // slider range (isBetween)
    'date',        // single date (eq, ne, lt, gt, lte, gte, isBetween, isRelativeToToday, isEmpty, isNotEmpty)
    'dateRange',   // date range (isBetween)
    'boolean',     // true/false (eq, ne)
    'select',      // single enum value (eq, ne, isEmpty, isNotEmpty)
    'multiSelect', // multiple enum values (inArray, notInArray, isEmpty, isNotEmpty)
  ] as const,

  joinOperators: ['and', 'or'] as const,
  sortOrders: ['asc', 'desc'] as const,
} as const

export type DataTableConfig = typeof dataTableConfig

/**
 * Maps each filter variant to its allowed operators
 */
export const operatorsByVariant: Record<FilterVariant, FilterOperator[]> = {
  text:        ['iLike', 'notILike', 'eq', 'ne', 'isEmpty', 'isNotEmpty'],
  number:      ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'isBetween', 'isEmpty', 'isNotEmpty'],
  range:       ['isBetween'],
  date:        ['eq', 'ne', 'lt', 'gt', 'lte', 'gte', 'isBetween', 'isRelativeToToday', 'isEmpty', 'isNotEmpty'],
  dateRange:   ['isBetween'],
  boolean:     ['eq', 'ne'],
  select:      ['eq', 'ne', 'isEmpty', 'isNotEmpty'],
  multiSelect: ['inArray', 'notInArray', 'isEmpty', 'isNotEmpty'],
}

/**
 * Human-readable labels for operators (i18n keys)
 */
export const operatorLabels: Record<FilterOperator, string> = {
  iLike:             'contains',
  notILike:          'does not contain',
  eq:                'is',
  ne:                'is not',
  lt:                'less than',
  lte:               'at most',
  gt:                'greater than',
  gte:               'at least',
  inArray:           'is any of',
  notInArray:        'is none of',
  isBetween:         'is between',
  isRelativeToToday: 'relative to today',
  isEmpty:           'is empty',
  isNotEmpty:        'is not empty',
}
```

### 3.3 URL Parsers (`components/data-table/parsers.ts`)

Custom nuqs parsers for serializing filter/sort state to URL:

```ts
import { createParser } from 'nuqs'
import { z } from 'zod'
import type { ExtendedColumnSort, FilterItemSchema } from './types'

/**
 * nuqs parser for sorting state — serializes to URL as JSON
 * Example: ?sort=[{"id":"year","desc":true},{"id":"brand","desc":false}]
 */
export function getSortingStateParser<TData>() {
  return createParser<ExtendedColumnSort<TData>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value)
        return z.array(z.object({
          id: z.string(),
          desc: z.boolean(),
        })).parse(parsed)
      } catch { return null }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  })
}

/**
 * nuqs parser for filter state — serializes to URL as JSON
 * Example: ?filters=[{"id":"status","value":"active","variant":"select","operator":"eq","filterId":"f1"}]
 */
export function getFiltersStateParser<TData>() {
  return createParser<FilterItemSchema[]>({
    parse: (value) => {
      try {
        return JSON.parse(value)
      } catch { return null }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  })
}
```

---

## Part 4: Core Hook — `useDataTable`

### 4.1 Hook Design (`hooks/use-data-table.ts`)

The central hook that wires everything together:

```
useDataTable({
  columns,              // TanStack column defs with meta
  data,                 // server response data array
  pageCount,            // from server response
  total,                // from server response
  defaultSort,          // initial sort state
  defaultPerPage,       // default rows per page (20)
  storeAdapter,         // 'nuqs' | 'zustand' | 'memory' (default: 'nuqs')
  debounceMs,           // filter input debounce (default: 300)
  queryKeys,            // custom URL param names
})
```

Returns:
```
{
  table,                // TanStack Table instance (fully configured)
  filters,              // current filter state
  setFilters,           // update filters
  sorting,              // current sort state
  setSorting,           // update sorting
  joinOperator,         // 'and' | 'or'
  setJoinOperator,      // update join operator
  page, setPage,
  perPage, setPerPage,
}
```

**Key behavior:**
- With `nuqs` adapter: all state synced to URL params (`?page=2&perPage=20&sort=...&filters=...&joinOp=and`)
- With `zustand` adapter: state in a zustand store (for embedded tables, modals, sidesheets)
- With `memory` adapter: plain React state (for simple, throwaway tables)
- Filter changes debounced (300ms default) before triggering URL update
- Page resets to 1 when filters or sorting change
- Row selection and column visibility are always local state (never URL)

### 4.2 Filter-to-oRPC Conversion

The hook also provides a `getServerInput()` helper that converts the UI filter state into the drizzle-filters-compatible object for the oRPC call:

```ts
// Converts FilterItemSchema[] (UI state) → drizzle-filters schema object
// Example: [{ id: 'status', value: 'active', operator: 'eq', variant: 'select' }]
// Becomes: { status: { equals: 'active' } }
function filtersToServerInput(filters: FilterItemSchema[]): Record<string, any> {
  const result: Record<string, any> = {}
  for (const f of filters) {
    const field = f.id
    switch (f.operator) {
      case 'eq':       result[field] = { equals: f.value }; break
      case 'ne':       result[field] = { not: f.value }; break
      case 'iLike':    result[field] = { contains: f.value }; break
      case 'notILike': result[field] = { not: { contains: f.value } }; break
      case 'gt':       result[field] = { gt: f.value }; break
      case 'gte':      result[field] = { gte: f.value }; break
      case 'lt':       result[field] = { lt: f.value }; break
      case 'lte':      result[field] = { lte: f.value }; break
      case 'inArray':  result[field] = { in: f.value }; break
      case 'notInArray': result[field] = { notIn: f.value }; break
      case 'isEmpty':  result[field] = { isNull: true }; break
      case 'isNotEmpty': result[field] = { isNotNull: true }; break
      case 'isBetween': result[field] = { gte: f.value[0], lte: f.value[1] }; break
    }
  }
  return result
}
```

---

## Part 5: UI Components — Detailed Specifications

### 5.1 `<DataTable>` — Main Table Component

The root component that renders the full table.

**Props:**
- `table` — TanStack Table instance (from `useDataTable`)
- `actionBar?` — ReactNode for floating bulk action bar
- `children?` — rendered above table (toolbar area)
- `className?` — custom styling

**Features:**
- Renders `<Table>` with header groups, body rows, empty state
- Column pinning support (sticky left/right columns) with proper shadow borders
- Selected row highlighting (`data-state="selected"`)
- Loading skeleton via `<DataTableSkeleton>` (configurable rows/columns count)
- Empty state: "No results." centered message

### 5.2 `<DataTableAdvancedToolbar>` — Advanced Toolbar Layout

Container component that composes filter controls.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ [FilterList/FilterMenu] [SortList]          [ViewOptions]    │
│ Where [status] [is] [active]  ∧  [Sort ↕ 2]  [View ⚙]      │
│  and  [brand]  [contains] [Mercedes]                         │
│  [+ Add filter]                                              │
└──────────────────────────────────────────────────────────────┘
```

**Props:**
- `table` — TanStack Table instance
- `children` — slot for filter/sort controls (flexible left side)

**Features:**
- `role="toolbar"` + `aria-orientation="horizontal"` for accessibility
- Right side always has `<DataTableViewOptions>`
- Responsive: wraps on mobile

### 5.3 `<DataTableFilterList>` — Notion/Airtable-Style Filters

The primary filter UI. A vertical list of filter rows, each representing one filter condition.

**Layout per row:**
```
[Where/And/Or ▾] [Column Name ▾] [Operator ▾] [Value Input] [✕] [⠿]
```

**Features:**
- **Join operator toggle**: First row shows "Where", subsequent rows show "and"/"or" dropdown
- **Column picker**: Searchable popover listing all filterable columns (grouped by variant)
- **Operator dropdown**: Dynamically populated based on column's variant (text→contains/eq/ne, number→eq/gt/lt/between, etc.)
- **Value input**: Renders the appropriate input based on variant (see §5.7-5.14)
- **Delete button**: Remove individual filter, with keyboard shortcut (Backspace/Delete)
- **Drag handle**: Reorder filters via drag-and-drop (`@dnd-kit/sortable`)
- **Add filter button**: Appends new filter row with first available column
- **Reset button**: Clear all filters
- **Keyboard shortcut**: `Ctrl+Shift+F` / `Cmd+Shift+F` toggles filter panel
- **Auto-reset values**: When changing column or operator, dependent fields reset
- **Debounced updates**: Value changes debounced (300ms) before URL/state update

**Drag-and-drop:**
Uses `@dnd-kit/sortable` with `<Sortable>` wrapper. Each filter row is a `<SortableItem>` with a grip handle. Reordering updates the filters array.

### 5.4 `<DataTableFilterMenu>` — Linear/Command-Palette-Style Filters

Alternative filter UI for command-palette UX. More compact, progressive disclosure.

**Layout:**
```
┌────────────────────────────────────────────┐
│ [status: active ✕] [brand: contains Merc ✕] │  ← active filter badges
│ [+ Filter ▾]                                │  ← trigger button
└────────────────────────────────────────────┘
        │
        ▼ (popover)
┌────────────────────┐
│ 🔍 Search fields...│
│ ─────────────────  │
│ Status             │
│ Brand              │
│ Year               │
│ Seat Count         │
│ Created At         │
└────────────────────┘
```

**Features:**
- **Active filters as badges**: Compact removable badges showing field+operator+value
- **Command popover**: Search through available columns via `<Command>` (cmdk)
- **Progressive disclosure**: Select field → select operator → enter value (3-step)
- **Same keyboard shortcut**: `Ctrl+Shift+F` / `Cmd+Shift+F`
- **Same filter state**: Uses identical `FilterItemSchema[]` as FilterList (switchable!)

Both filter UIs can be offered — tablecn lets users choose their preferred style. Configuration via a prop on the toolbar:
```tsx
<DataTableAdvancedToolbar filterVariant="list" /> // or "menu"
```

### 5.5 `<DataTableSortList>` — Multi-Sort Popover

**Layout:**
```
[Sort ↕ 2] ← badge shows active sort count
    │
    ▼ (popover)
┌────────────────────────────────────────┐
│ [Column Name ▾] [Ascending ▾]  [✕] [⠿]│
│ [Column Name ▾] [Descending ▾] [✕] [⠿]│
│ [+ Add sort]            [Reset sorting]│
└────────────────────────────────────────┘
```

**Features:**
- **Multi-column sorting**: Add multiple sort criteria in priority order
- **Drag-and-drop reorder**: Change sort priority by dragging (`@dnd-kit/sortable`)
- **Direction toggle**: Ascending/Descending per column
- **Column picker**: Searchable, excludes already-sorted columns
- **Reset**: Restore initial/default sorting
- **Keyboard shortcut**: `Ctrl+Shift+S` / `Cmd+Shift+S`
- **Badge count**: Shows number of active sorts on trigger button

### 5.6 `<DataTableColumnHeader>` — Sortable Column Header

Replaces default `<th>` content with an interactive header.

**Features:**
- **Click to cycle sort**: unsorted → ascending → descending → unsorted
- **Sort direction indicator**: ChevronUp (asc), ChevronDown (desc), ChevronsUpDown (none)
- **Dropdown menu** (on click of chevron/header):
  - Sort ascending
  - Sort descending
  - Clear sort
  - Hide column
- **Only for sortable columns**: Falls back to plain text if `column.getCanSort()` is false

### 5.7-5.14 Filter Value Input Components

Each filter variant gets a dedicated input component:

#### 5.7 `<DataTableFilterInputText>`
- Standard `<Input>` for text values
- Used with operators: iLike, notILike, eq, ne
- Disabled/hidden for isEmpty, isNotEmpty
- Placeholder from column meta

#### 5.8 `<DataTableFilterInputNumber>`
- Numeric `<Input type="number">`
- For `isBetween`: renders two inputs (min–max) side by side
- Step attribute support for decimals
- Unit suffix from column meta (e.g., "PLN", "km")

#### 5.9 `<DataTableFilterInputDate>`
- Calendar popover (`<Calendar>` from shadcn)
- Single date picker for eq, ne, lt, gt, lte, gte
- Formats display with `date-fns`

#### 5.10 `<DataTableFilterInputDateRange>`
- Dual calendar for `isBetween`
- Start date + end date selection
- Preset ranges: "Today", "Last 7 days", "Last 30 days", "This month", "This year"
- For `isRelativeToToday`: dropdown with offset units (days/weeks/months) + direction (ago/from now)

#### 5.11 `<DataTableFilterInputSelect>`
- Searchable popover with radio-style selection
- Options from column meta (`meta.options`)
- Shows option icons if provided
- For eq/ne operators

#### 5.12 `<DataTableFilterInputMultiSelect>`
- Searchable popover with checkbox-style selection
- Multiple selection with badge count display
- "Select all" / "Clear" buttons
- Faceted counts (shows how many rows match each option)
- For inArray/notInArray operators

#### 5.13 `<DataTableFilterInputBoolean>`
- Simple two-option select: True / False
- For eq, ne operators

#### 5.14 `<DataTableFilterInputSlider>`
- Range slider (`<Slider>` from shadcn)
- Min/max from column meta (`meta.range`)
- Shows current value labels
- For `isBetween` on number columns

### 5.15 `<DataTablePagination>` — Pagination Controls

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 5 of 120 row(s) selected    Rows per page [20 ▾]  Page 2 of 6  │
│                              [«] [‹] [›] [»]                    │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**
- **Selection count**: "X of Y row(s) selected" (left side)
- **Rows per page**: Dropdown with options [10, 20, 30, 40, 50]
- **Page indicator**: "Page N of M"
- **Navigation buttons**: First, Previous, Next, Last
- **Disabled states**: Buttons disable when at boundary
- **Responsive**: On mobile, hides first/last buttons and selection count
- **Accessible**: aria-labels on all buttons

### 5.16 `<DataTableViewOptions>` — Column Visibility Toggle

**Layout:**
```
[View ⚙] ← trigger button
    │
    ▼ (popover)
┌────────────────────────┐
│ 🔍 Search columns...   │
│ ☑ Plate Number         │
│ ☑ Brand                │
│ ☑ Model                │
│ ☐ Year (hidden)        │
│ ☑ Status               │
│ ☐ Created At (hidden)  │
└────────────────────────┘
```

**Features:**
- **Searchable**: Filter columns by name
- **Toggle checkmarks**: Click to show/hide columns
- **Only hideable columns**: Respects `column.getCanHide()`
- **Labels from meta**: Uses `column.columnDef.meta?.label` with fallback to column ID
- **Hidden on mobile**: `hidden lg:flex`

### 5.17 `<DataTableActionBar>` — Floating Bulk Action Bar

Appears when rows are selected. Slides up from bottom.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  3 rows selected    [Export ↓] [Delete 🗑] [More... ▾]  [✕]  │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- **Selection count**: Shows how many rows are selected
- **Action buttons**: Customizable per-table (export, delete, status change, etc.)
- **Clear selection**: X button deselects all
- **Slide-up animation**: Appears/disappears with transition
- **Sticky positioning**: Fixed to bottom of table viewport

### 5.18 `<DataTableSkeleton>` — Loading State

**Features:**
- Configurable row count (default: `perPage` value)
- Configurable column count (from column defs)
- Shows skeleton header + skeleton rows
- Optional toolbar skeleton
- Matches table dimensions for no layout shift

---

## Part 6: BYOS Store Adapters

### 6.1 Adapter Interface

```ts
// lib/stores/table-store-adapter.ts
export interface TableStoreAdapter {
  usePageState(defaultValue: number): [number, (v: number) => void]
  usePerPageState(defaultValue: number): [number, (v: number) => void]
  useSortingState(defaultValue: any[]): [any[], (v: any[]) => void]
  useFiltersState(defaultValue: any[]): [any[], (v: any[]) => void]
  useJoinOperatorState(defaultValue: string): [string, (v: string) => void]
}
```

### 6.2 nuqs Adapter (Default for Admin Pages)

```ts
// lib/stores/table-store-nuqs.ts
// Uses useQueryState / useQueryStates from nuqs
// All state serialized to URL: ?page=2&perPage=20&sort=[...]&filters=[...]&joinOp=and
// Benefits: bookmarkable, shareable, back-button friendly
// Used for: all admin list pages
```

### 6.3 zustand Adapter

```ts
// lib/stores/table-store-zustand.ts
// Creates a zustand store per table instance
// State lives in client memory, not URL
// Benefits: no URL pollution, works in modals/sidesheets/embedded tables
// Used for: modal tables, nested tables, picker dialogs
```

### 6.4 Memory Adapter

```ts
// lib/stores/table-store-memory.ts
// Plain React useState
// Simplest adapter, no persistence
// Used for: simple display tables, read-only views, quick prototypes
```

---

## Part 7: Page-Level Integration Pattern

### 7.1 Example: Fleet Vehicles Page

Shows the full integration from page to API:

```tsx
// app/(admin)/admin/fleet/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { DataTable } from '@/components/data-table'
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar'
import { DataTableFilterList } from '@/components/data-table/data-table-filter-list'
import { DataTableSortList } from '@/components/data-table/data-table-sort-list'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { useDataTable } from '@/hooks/use-data-table'
import { getVehicleColumns } from './columns'

export default function FleetVehiclesPage() {
  const columns = getVehicleColumns({ /* row action handlers */ })

  const {
    table, filters, sorting, page, perPage, joinOperator,
    getServerInput,  // ← converts UI state to oRPC input
  } = useDataTable({
    columns,
    defaultSort: [{ id: 'createdAt', desc: true }],
    defaultPerPage: 20,
    storeAdapter: 'nuqs',
  })

  // Server query — uses filter/sort/pagination from URL state
  const { data, isLoading } = useQuery(
    orpc.fleet.vehicle.list.queryOptions({
      input: {
        ...getServerInput(),  // { page, perPage, sort, filter, joinOperator }
      },
    })
  )

  if (isLoading) return <DataTableSkeleton columnCount={7} rowCount={20} />

  return (
    <DataTable table={table} data={data?.data} pageCount={data?.pageCount}>
      <DataTableAdvancedToolbar table={table}>
        <DataTableFilterList table={table} />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
```

### 7.2 Column Definition Pattern

```tsx
// app/(admin)/admin/fleet/columns.tsx
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { VEHICLE_STATUSES, VEHICLE_TYPES } from '@repo/schemas'

export function getVehicleColumns(): ColumnDef<Vehicle>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => <Checkbox ... />,
      cell: ({ row }) => <Checkbox ... />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'plateNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plate Number" />,
      meta: {
        label: 'Plate Number',
        variant: 'text',
        placeholder: 'Search plates...',
      },
    },
    {
      accessorKey: 'brand',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" />,
      meta: {
        label: 'Brand',
        variant: 'text',
      },
    },
    {
      accessorKey: 'year',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
      meta: {
        label: 'Year',
        variant: 'number',
        range: [2000, 2026],
      },
    },
    {
      accessorKey: 'seatCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Seats" />,
      meta: {
        label: 'Seats',
        variant: 'number',
        unit: 'seats',
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge>{row.getValue('status')}</Badge>,
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: VEHICLE_STATUSES.map(s => ({ label: s, value: s })),
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      meta: {
        label: 'Type',
        variant: 'select',
        options: VEHICLE_TYPES.map(t => ({ label: t, value: t })),
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
      meta: {
        label: 'Created At',
        variant: 'date',
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <RowActions row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
```

---

## Part 8: Mobile Considerations

### 8.1 Shared Filter Types

Mobile uses the **same Zod filter schemas** from `@repo/schemas`. The filter object shape is identical:

```ts
// Shared (works on both web and mobile)
const filter = { status: { equals: 'active' }, year: { gte: 2020 } }
client.fleet.vehicle.list({ page: 1, perPage: 20, filter })
```

### 8.2 Mobile-Specific UI

Mobile does NOT use TanStack Table or the data-table components. Instead:
- **FlatList** for rendering rows
- **Bottom sheet** for filter panel (react-native-bottom-sheet)
- **Filter chips** at top of list (horizontal scroll)
- **Picker/Select** for enum filters
- **Date picker** for date filters
- **Simple text input** for text search
- **Pull-to-refresh** + infinite scroll for pagination

The mobile filter state management is simpler — just React state or zustand, no URL persistence needed.

### 8.3 What's Shared vs. Platform-Specific

| Layer | Shared | Web-Specific | Mobile-Specific |
|-------|--------|-------------|-----------------|
| Filter Zod schemas | ✅ `@repo/schemas` | | |
| Pagination schema | ✅ `@repo/schemas` | | |
| Sort schema | ✅ `@repo/schemas` | | |
| Contract inputs | ✅ `@repo/contract` | | |
| oRPC client call | ✅ same API | | |
| Table engine | | TanStack Table | FlatList |
| Filter UI | | data-table components | Bottom sheet + chips |
| State persistence | | nuqs (URL) | zustand/useState |
| Sorting UI | | Column headers + sort list | Simple sort picker |
| Pagination UI | | Page nav controls | Infinite scroll |

---

## Part 9: Implementation Order

### Phase 1: Backend Foundation
1. Install `drizzle-filters` in `apps/api`
2. Create `packages/schemas/src/filters/` with filter schemas for all modules
3. Create `packages/schemas/src/pagination.ts` with shared pagination/sort schemas
4. Update all contracts in `@repo/contract` — add filter + pagination inputs to all list endpoints
5. Create `apps/api/src/lib/query-helpers.ts` — shared buildWhere + pagination helpers
6. Update all services — implement server-side filtering, sorting, pagination with total counts
7. Build packages: `cd packages/schemas && pnpm build && cd ../contract && pnpm build`
8. Test with manual API calls / Drizzle Studio

### Phase 2: Data Table Core
9. Install web deps: `nuqs`, `@dnd-kit/*`, `cmdk`, `date-fns`
10. Install missing shadcn components: `popover`, `command`, `calendar`, `slider`, `scroll-area`, `toggle-group`
11. Add `NuqsAdapter` to admin layout
12. Create `components/data-table/types.ts` — all type definitions
13. Create `components/data-table/config.ts` — operators, variants, labels
14. Create `components/data-table/parsers.ts` — nuqs parsers
15. Create `components/data-table/utils.ts` — shared utilities
16. Create BYOS store adapters (nuqs, zustand, memory)
17. Create `hooks/use-data-table.ts` — main hook
18. Create `hooks/use-debounced-callback.ts`

### Phase 3: Table Components
19. Create `<DataTable>` — main table renderer
20. Create `<DataTableSkeleton>` — loading state
21. Create `<DataTableColumnHeader>` — sortable headers
22. Create `<DataTablePagination>` — page controls
23. Create `<DataTableViewOptions>` — column visibility

### Phase 4: Filter Components
24. Create all filter value input components (text, number, date, date-range, select, multiselect, boolean, slider)
25. Create `<DataTableFilterList>` — Notion-style filter rows with drag-and-drop
26. Create `<DataTableFilterMenu>` — Command-palette filter badges
27. Create `<DataTableSortList>` — Multi-sort popover with drag-and-drop
28. Create `<DataTableAdvancedToolbar>` — toolbar layout
29. Create `<DataTableActionBar>` — floating bulk actions

### Phase 5: Integration
30. Convert Fleet page to use new data table (proof of concept)
31. Create column definitions for fleet vehicles and drivers
32. Test full flow: URL state → oRPC call → server filter → paginated response → table render
33. Convert remaining 8 modules to new data table pattern
34. Remove old `components/ui/data-table.tsx` after all migrations complete

### Phase 6: Polish
35. Keyboard shortcuts (Ctrl+Shift+F for filters, Ctrl+Shift+S for sort)
36. Responsive design — mobile admin (compact toolbar, drawer filters)
37. i18n — translate operator labels, "No results", pagination text
38. Export functionality (CSV/Excel) from filtered/sorted data
39. Persist column visibility per-user (localStorage)

---

## Part 10: Key Design Decisions

### Why tablecn-inspired, not tablecn directly?
tablecn is a full Next.js app (clone-and-adapt), not a library. It's tightly coupled to its own server actions + Drizzle setup. We take its UI design and component architecture but adapt it to our oRPC + contract-first architecture.

### Why BYOS adapters from data-table-filters?
The adapter pattern lets us use URL state for admin pages (shareable, bookmarkable) and zustand for modals/embedded tables. This flexibility is important for a complex admin panel.

### Why nuqs for URL state?
nuqs is the de facto standard for type-safe URL search params in Next.js App Router. No real alternative exists. It provides the closest equivalent to TanStack Router's type-safe search params. Next.js has NO built-in type-safe search params — `useSearchParams()` returns untyped strings.

### Why drizzle-filters for backend?
Prisma-like DX, Zod-native (fits our contract-first architecture), handles AND/OR/NOT nesting, tiny footprint. The filter schemas can be used in `@repo/schemas` without any Drizzle dependency — they're just Zod objects. Only the `FilterBuilder` (service layer) needs Drizzle.

### Filter state format: UI vs Server
UI state uses `FilterItemSchema[]` (array of {id, value, operator, variant, filterId}) for flexibility in the UI layer. This gets converted to drizzle-filters format `{ fieldName: { operator: value } }` before the oRPC call. This separation keeps the UI free to add/remove/reorder filters without coupling to the backend schema shape.
