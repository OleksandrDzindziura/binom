# Implementation Plan: Single Source of Truth + oRPC Contract-First

## Context

- All enums duplicated 42+ times across 4 layers (schemas, Drizzle, routers, frontend)
- Web app imports types directly from API source (`../../../apps/api/src/app.router`)
- No `.output()` schemas on oRPC procedures
- PostGIS geometry handled as raw `{x, y}` with no GeoJSON types for frontend
- Drizzle stays in `apps/api` (one API, no reason to extract)

---

## Phase 1: Shared Constants (`as const` enums)

**Goal:** Single source of truth for all enum values.

### 1.1 Create `packages/schemas/src/constants/` directory

Create one file per domain, each exporting `as const` arrays + derived TS types:

**`constants/auth.ts`**
```typescript
export const USER_ROLES = ['admin', 'dispatcher', 'driver', 'corporate_client', 'passenger'] as const;
export const LANGUAGES = ['pl', 'en', 'de', 'ua'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type Language = (typeof LANGUAGES)[number];
```

**`constants/fleet.ts`**
```typescript
export const VEHICLE_TYPES = ['minibus', 'midi', 'standard', 'premium'] as const;
export const VEHICLE_STATUSES = ['active', 'maintenance', 'retired'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];
```

**`constants/tickets.ts`**
```typescript
export const SALE_CHANNELS = ['driver_cash', 'office_cash', 'office_card', 'office_blik', 'online_card', 'online_blik'] as const;
export const PAYMENT_STATUSES = ['paid', 'pending', 'refunded'] as const;
export const PAYMENT_PROVIDERS = ['przelewy24', 'stripe', 'blik_direct'] as const;
export const ONLINE_PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
export type SaleChannel = (typeof SALE_CHANNELS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
export type OnlinePaymentStatus = (typeof ONLINE_PAYMENT_STATUSES)[number];
```

**`constants/charter.ts`**
```typescript
export const CHARTER_STATUSES = ['new', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'] as const;
export const CHARTER_SOURCES = ['website_form', 'phone', 'email', 'corporate_portal', 'walk_in'] as const;
export const CHARTER_VEHICLE_TYPES = ['minibus', 'midi', 'standard', 'premium', 'any'] as const;
export const CHARTER_INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
export type CharterStatus = (typeof CHARTER_STATUSES)[number];
export type CharterSource = (typeof CHARTER_SOURCES)[number];
export type CharterInvoiceStatus = (typeof CHARTER_INVOICE_STATUSES)[number];
```

**`constants/operations.ts`**
```typescript
export const SHIFT_STATUSES = ['in_progress', 'submitted', 'verified', 'disputed'] as const;
export const EXPENSE_CATEGORIES = ['toll', 'parking', 'fuel', 'repair', 'cleaning', 'fine', 'other'] as const;
export type ShiftStatus = (typeof SHIFT_STATUSES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
```

**`constants/cms.ts`**
```typescript
export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const;
export const NOTIFICATION_CHANNELS = ['push', 'sms', 'email'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
```

**`constants/routes.ts`**
- Extract any route-specific enums (schedule types, day of week, etc.) if they exist.

**`constants/index.ts`**
- Re-export everything from all constant files.

### 1.2 Update `packages/schemas/src/index.ts`

Add `export * from './constants/index.js';`

### 1.3 Update Zod schemas in `packages/schemas/src/`

Refactor each domain file to import from `./constants/` instead of inline arrays:

- `fleet.ts`: `vehicleTypeEnum = z.enum(VEHICLE_TYPES)` instead of `z.enum(['minibus', ...])`
- `tickets.ts`: `saleChannelEnum = z.enum(SALE_CHANNELS)` etc.
- `charter.ts`: `charterStatusEnum = z.enum(CHARTER_STATUSES)` etc.
- `operations.ts`: `shiftStatusEnum = z.enum(SHIFT_STATUSES)` etc.
- `cms.ts`: `alertSeverityEnum = z.enum(ALERT_SEVERITIES)` etc.
- `auth.ts`: `z.enum(LANGUAGES)` for preferredLanguage

### 1.4 Build and verify

```bash
cd packages/schemas && pnpm build
pnpm check-types
```

---

## Phase 2: Drizzle Schemas Import Shared Enums

**Goal:** Eliminate inline enum arrays from all Drizzle table definitions.

### 2.1 Update each Drizzle schema file to import from `@repo/schemas`

**`apps/api/src/database/schema/auth.ts`**
```typescript
import { USER_ROLES, LANGUAGES } from '@repo/schemas';
// role: text('role', { enum: USER_ROLES }).notNull().default('passenger')
// preferredLanguage: text('preferred_language', { enum: LANGUAGES }).default('pl')
```

**`apps/api/src/database/schema/fleet.ts`**
```typescript
import { VEHICLE_TYPES, VEHICLE_STATUSES } from '@repo/schemas';
// type: text('type', { enum: VEHICLE_TYPES }).notNull()
// status: text('status', { enum: VEHICLE_STATUSES }).notNull().default('active')
```

**`apps/api/src/database/schema/tickets.ts`**
```typescript
import { SALE_CHANNELS, PAYMENT_STATUSES, PAYMENT_PROVIDERS, ONLINE_PAYMENT_STATUSES } from '@repo/schemas';
```

**`apps/api/src/database/schema/charter.ts`**
```typescript
import { CHARTER_STATUSES, CHARTER_SOURCES, CHARTER_VEHICLE_TYPES, CHARTER_INVOICE_STATUSES } from '@repo/schemas';
```

**`apps/api/src/database/schema/operations.ts`**
```typescript
import { SHIFT_STATUSES, EXPENSE_CATEGORIES } from '@repo/schemas';
```

**`apps/api/src/database/schema/cms.ts`**
```typescript
import { ALERT_SEVERITIES, NOTIFICATION_CHANNELS } from '@repo/schemas';
```

### 2.2 Remove `VehicleStatus` type export from Drizzle schema

Currently in `fleet.ts`:
```typescript
export type VehicleStatus = NonNullable<typeof vehicles.$inferSelect['status']>;
```
Replace usages with `import { VehicleStatus } from '@repo/schemas'` — the type from constants.

### 2.3 Verify DB schema unchanged

```bash
cd apps/api && pnpm db:generate
```
Should produce NO new migration (schema is identical, only source of enum values changed).

### 2.4 Type check

```bash
pnpm check-types
```

---

## Phase 3: Fix Inline Enum Duplication in Routers & Context

**Goal:** Remove all hardcoded enum strings from API routers and oRPC context.

### 3.1 `apps/api/src/orpc/orpc.context.ts`

Replace hardcoded role union:
```typescript
// Before
role: 'admin' | 'dispatcher' | 'driver' | 'corporate_client' | 'passenger';

// After
import type { UserRole } from '@repo/schemas';
role: UserRole;
```

### 3.2 `apps/api/src/orpc/orpc.base.ts`

Replace inline role arrays in procedure guards:
```typescript
import { USER_ROLES } from '@repo/schemas';
// Or keep the specific checks but reference the type
```

Note: The role checks like `['admin', 'dispatcher'].includes(context.user.role)` are authorization logic, not enum definitions. These can stay as-is since they're intentional subsets. But the `context.user.role` type should come from `UserRole`.

### 3.3 `apps/api/src/modules/fleet/fleet.router.ts`

Replace inline enum in vehicle.list input:
```typescript
// Before
.input(z.object({ status: z.enum(['active', 'maintenance', 'retired']).optional() }))

// After
import { vehicleStatusEnum } from '@repo/schemas';
.input(z.object({ status: vehicleStatusEnum.optional() }))
```

### 3.4 `apps/api/src/modules/tickets/tickets.router.ts`

Check for any inline `z.enum(['przelewy24', ...])` and replace with shared enum.

### 3.5 Scan all other routers for inline enums

Grep for `z.enum(\[` in `apps/api/src/modules/` and replace each with the shared import.

### 3.6 Type check

```bash
pnpm check-types
```

---

## Phase 4: Fix Frontend/Mobile Enum Duplication

**Goal:** Remove hardcoded enums from web and mobile apps.

### 4.1 `apps/web/app/(admin)/admin/fleet/page.tsx`

```typescript
// Remove:
type VehicleStatus = 'active' | 'maintenance' | 'retired';

// Replace with:
import { VEHICLE_STATUSES, type VehicleStatus } from '@repo/schemas';
```

Keep `statusColors` mapping but type it against `VehicleStatus`.

### 4.2 `apps/mobile/app/(driver)/expenses.tsx`

```typescript
// Import categories array from schemas instead of hardcoding
import { EXPENSE_CATEGORIES } from '@repo/schemas';

// The label mapping (Polish translations) stays in mobile code
// but references the shared array for values
```

### 4.3 Scan web/mobile for other hardcoded enums

Grep for common enum values like `'active'`, `'maintenance'`, `'minibus'` etc. in frontend code to find other inline definitions.

### 4.4 Build all apps

```bash
pnpm build
```

---

## Phase 5: GeoJSON Types in Shared Schemas

**Goal:** Proper geo types for frontend map rendering. Drizzle stays `{x, y}`. Services convert.

### 5.1 Create `packages/schemas/src/geo.ts`

```typescript
import { z } from 'zod';

export const coordinateSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});

export const geoJsonPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
});

export const geoJsonLineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
});

export type Coordinate = z.infer<typeof coordinateSchema>;
export type GeoJsonPoint = z.infer<typeof geoJsonPointSchema>;
export type GeoJsonLineString = z.infer<typeof geoJsonLineStringSchema>;
```

### 5.2 Update route/stop schemas

**`packages/schemas/src/routes.ts`**
```typescript
import { coordinateSchema, geoJsonPointSchema } from './geo.js';

// Input DTO — user submits coordinates
export const createStopSchema = z.object({
  name: z.string().min(1),
  location: coordinateSchema,       // { lng, lat }
  address: z.string().optional(),
});

// Output DTO — API returns GeoJSON for maps
export const stopSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  location: geoJsonPointSchema,     // { type: "Point", coordinates: [lng, lat] }
  address: z.string().nullable(),
});
```

### 5.3 Update charter schemas

**`packages/schemas/src/charter.ts`**
```typescript
// charterEstimateSchema — keep as separate lng/lat fields or switch to coordinateSchema
export const charterEstimateSchema = z.object({
  pickup: coordinateSchema,
  destination: coordinateSchema,
  passengerCount: z.number().int().min(1),
  vehicleType: z.enum(CHARTER_VEHICLE_TYPES).default('any'),
  isRoundTrip: z.boolean().default(false),
});
```

### 5.4 Update services to convert between Drizzle `{x,y}` and GeoJSON

**`apps/api/src/modules/routes/routes.service.ts`**
```typescript
// Helper (in service or a shared util within apps/api)
function toGeoJsonPoint(xy: { x: number; y: number }): GeoJsonPoint {
  return { type: 'Point', coordinates: [xy.x, xy.y] };
}

function toXY(coord: Coordinate): { x: number; y: number } {
  return { x: coord.lng, y: coord.lat };
}
```

### 5.5 Update `packages/schemas/src/index.ts`

Add `export * from './geo.js';`

### 5.6 Build and verify

```bash
cd packages/schemas && pnpm build
pnpm check-types
```

Note: This phase changes the API response shape for stops/charter. Frontend components consuming these responses will need updates to match the new GeoJSON format. Coordinate with frontend changes.

---

## Phase 6: Output Schemas (DTOs for API responses)

**Goal:** Define what the API returns, not just what it accepts. Required for contracts.

### 6.1 Add output schemas to each domain in `packages/schemas/src/`

For each domain, add a "select/response" schema alongside the existing create/update schemas:

**`fleet.ts`** — add `vehicleSchema`, `driverSchema`
**`routes.ts`** — add `routeSchema`, `stopSchema`, `scheduleSchema`
**`tickets.ts`** — add `ticketSchema`, `ticketTypeSchema`
**`charter.ts`** — add `charterRequestSchema`, `charterInvoiceSchema`
**`corporate.ts`** — add `corporateClientSchema`
**`operations.ts`** — add `driverShiftSchema`, `fuelLogSchema`, `expenseSchema`
**`cms.ts`** — add `newsArticleSchema`, `passengerAlertSchema`
**`analytics.ts`** — add `routeDailyStatsSchema`

These match what the API actually returns (what the service `.returning()` calls produce), not the DB entity shape.

### 6.2 Handle Drizzle-to-DTO differences

Key areas where DB entity differs from response DTO:
- **Geometry columns**: `{x, y}` in DB → GeoJSON `{type: "Point", coordinates: [lng, lat]}` in DTO
- **Money columns**: stored as integers (grosze) → returned as integers, formatted on frontend with `formatPLN()`
- **Timestamps**: Drizzle returns `Date` objects → DTO uses `z.coerce.date()` or `z.string().datetime()`
- **Relations**: DTO may include joined data (driver with vehicle name, route with stops)

### 6.3 Build and verify

```bash
cd packages/schemas && pnpm build
pnpm check-types
```

---

## Phase 7: oRPC Contract Package

**Goal:** Clean package boundaries, output type safety, eliminate cross-app imports.

### 7.1 Create `packages/contract/` package

```
packages/contract/
  package.json
  tsconfig.json
  src/
    index.ts
    fleet.ts
    routes.ts
    tickets.ts
    charter.ts
    corporate.ts
    operations.ts
    cms.ts
    analytics.ts
    upload.ts
```

**`package.json`**
```json
{
  "name": "@repo/contract",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": { "build": "tsc" },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "dependencies": {
    "@orpc/contract": "^1.13.6",
    "@repo/schemas": "workspace:*",
    "zod": "^4.1.3"
  }
}
```

### 7.2 Define contracts for each domain

Each file wraps the Zod DTOs from `@repo/schemas` into oRPC contract procedures:

**`src/fleet.ts`** (example)
```typescript
import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  vehicleStatusEnum, createVehicleSchema, updateVehicleSchema,
  vehicleSchema, driverSchema, createDriverSchema, updateDriverSchema,
  assignVehicleSchema, unassignVehicleSchema,
} from '@repo/schemas';

export const fleetContract = {
  vehicle: {
    list: oc
      .input(z.object({ status: vehicleStatusEnum.optional() }))
      .output(z.array(vehicleSchema)),
    getById: oc
      .input(z.object({ id: z.number().int() }))
      .output(vehicleSchema),
    create: oc
      .input(createVehicleSchema)
      .output(vehicleSchema),
    update: oc
      .input(z.object({ id: z.number().int(), data: updateVehicleSchema }))
      .output(vehicleSchema),
    delete: oc
      .input(z.object({ id: z.number().int() }))
      .output(z.object({ success: z.boolean() })),
  },
  driver: {
    // same pattern...
  },
};
```

**`src/index.ts`**
```typescript
import { fleetContract } from './fleet.js';
import { routesContract } from './routes.js';
import { ticketsContract } from './tickets.js';
import { charterContract } from './charter.js';
import { corporateContract } from './corporate.js';
import { operationsContract } from './operations.js';
import { cmsContract } from './cms.js';
import { analyticsContract } from './analytics.js';
import { uploadContract } from './upload.js';

export const contract = {
  fleet: fleetContract,
  routes: routesContract,
  tickets: ticketsContract,
  charter: charterContract,
  corporate: corporateContract,
  operations: operationsContract,
  cms: cmsContract,
  analytics: analyticsContract,
  upload: uploadContract,
};

export type { contract };
export * from './fleet.js';
export * from './routes.js';
// ... etc
```

### 7.3 Install and build

```bash
pnpm install
cd packages/contract && pnpm build
```

---

## Phase 8: API Routers Use `implement(contract)`

**Goal:** Server enforces contract compliance at compile time.

### 8.1 Update each router to use `implement(contract)`

**Before** (`fleet.router.ts`):
```typescript
import { os } from '@orpc/server';

get router() {
  return os.router({
    vehicle: os.router({
      list: os.input(...).handler(...)
    })
  });
}
```

**After**:
```typescript
import { implement } from '@orpc/server';
import { contract } from '@repo/contract';

const os = implement(contract);

get router() {
  return {
    vehicle: {
      list: os.fleet.vehicle.list.handler(async ({ input }) => {
        return this.service.listVehicles(input.status);
        // TypeScript enforces return matches vehicleSchema
      }),
    },
  };
}
```

### 8.2 Repeat for all 9 routers

- `fleet.router.ts`
- `routes.router.ts`
- `tickets.router.ts`
- `charter.router.ts`
- `corporate.router.ts`
- `operations.router.ts`
- `cms.router.ts`
- `analytics.router.ts`
- `upload.router.ts`

### 8.3 Update `app.router.ts` if needed

The shape should match the contract structure. Verify `AppRouter.router` aligns with `contract`.

### 8.4 Handle context

The `implement()` call needs context typing:
```typescript
const os = implement(contract).$context<ORPCContext>();
```

If procedures need protected/admin middleware, chain `.use()` middleware on the implementer.

Note: This is the most complex phase. The current routers use `baseProcedure`, `protectedProcedure`, `adminProcedure` etc. from `orpc.base.ts`. With `implement(contract)`, middleware needs to be applied differently — likely via `.use()` on the implementer or per-procedure. Research the exact pattern from oRPC docs before implementing.

### 8.5 Type check

```bash
pnpm check-types
```

---

## Phase 9: Client Uses Contract Types

**Goal:** Remove cross-app import, web/mobile depend only on `@repo/contract`.

### 9.1 Update `apps/web/lib/orpc.ts`

```typescript
// Before
import type { AppRouter } from '../../../apps/api/src/app.router';
type AppRouterClient = RouterClient<AppRouter['router']>;

// After
import type { ContractRouterClient } from '@orpc/contract';
import type { contract } from '@repo/contract';
type AppClient = ContractRouterClient<typeof contract>;
const client = createORPCClient(link) as unknown as AppClient;
```

### 9.2 Update `apps/web/package.json`

Add `"@repo/contract": "workspace:*"` to dependencies.

### 9.3 Update `apps/mobile/` (if using oRPC client)

Same pattern as web.

### 9.4 Remove the relative import path

Delete or verify no remaining `../../../apps/api/` imports in web/mobile.

### 9.5 Verify type inference works

Check that `orpc.fleet.vehicle.list.useQuery(...)` etc. have correct input/output types in web components.

### 9.6 Full build

```bash
pnpm build
```

---

## Phase 10 (Optional): JIT Transpilation for `@repo/schemas`

**Goal:** Eliminate "must rebuild schemas after changes" friction.

### 10.1 Update `packages/schemas/package.json`

```json
{
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    }
  }
}
```

Remove `"build": "tsc"` script (or keep for CI).

### 10.2 Ensure consumers can transpile `.ts`

- **Next.js** (`apps/web`): Add `transpilePackages: ['@repo/schemas']` in `next.config.ts` if not auto-detected.
- **NestJS** (`apps/api`): Uses SWC — should handle `.ts` from workspace packages. May need tsconfig path adjustments.
- **Expo** (`apps/mobile`): Configure `metro.config.js` `watchFolders` if needed.

### 10.3 Same for `@repo/contract`

Apply JIT to contract package as well.

### 10.4 Update CLAUDE.md

Remove "must rebuild shared schemas" instruction.

---

## Execution Order & Dependencies

```
Phase 1 (constants)
  ↓
Phase 2 (Drizzle imports)  ←  can run parallel with Phase 3, 4
Phase 3 (router/context fixes)
Phase 4 (frontend fixes)
  ↓
Phase 5 (geo types)
  ↓
Phase 6 (output schemas/DTOs)  ←  required before Phase 7
  ↓
Phase 7 (contract package)
  ↓
Phase 8 (implement(contract))  ←  most complex phase
  ↓
Phase 9 (client uses contract)
  ↓
Phase 10 (JIT — optional)
```

**Phases 1-4:** Fix the immediate duplication problem. ~1-2 sessions.
**Phase 5:** Add geo types. ~1 session.
**Phase 6:** Add output DTOs. ~1-2 sessions (needs careful mapping of what each endpoint returns).
**Phases 7-9:** Contract-first architecture. ~2-3 sessions.
**Phase 10:** Optional DX improvement. ~30 min.

## Verification Checklist

After each phase:
- [ ] `cd packages/schemas && pnpm build` (until JIT is enabled)
- [ ] `pnpm check-types` (all apps)
- [ ] `cd apps/api && pnpm db:generate` — should produce NO new migration (Phase 2)
- [ ] `pnpm build` (full build)
- [ ] Manual test: start API + web, verify fleet page loads, vehicle CRUD works
