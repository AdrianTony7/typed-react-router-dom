# Plan: Transform Typed-React-Router-Dom into a Reusable React & TypeScript Library

This plan outlines the phase-by-phase roadmap to transform the current codebase into a fully typed, reusable library for React projects using `react-router-dom`.

---

## Overview & Objectives
- **Goal**: Convert hardcoded single-app route logic into a generic, type-safe library (`typed-react-router-dom`).
- **Target Audience**: React applications using TypeScript and `react-router-dom` (v6 / v7).
- **Key Features**:
  1. Strongly-typed route definitions (`defineRoutes`).
  2. Type-safe URL construction using `generatePath` from `react-router-dom` (replacing manual string parsing).
  3. Type-safe dynamic parameter extraction & path matching.
  4. Type-safe `<AppLink />` navigation component.
  5. React hooks (`useTypedNavigate`, `useTypedParams`, `useTypedMatch`).
  6. Decoupled `AppRouterService` for programmatic navigation outside of React context.
  7. Dual ESM/CJS build outputs with bundled TypeScript declarations (`.d.ts`).

---

## Phase Breakdown

### Phase 1: Infrastructure & Package Setup
- **Objectives**:
  - Add TypeScript compiler configuration (`tsconfig.json`).
  - Configure `tsup` bundler for generating dual ESM/CJS outputs and `.d.ts` declaration files.
  - Update `package.json`:
    - Configure `main`, `module`, `types`, and `exports`.
    - Define `peerDependencies` (`react`, `react-dom`, `react-router-dom`).
    - Add `devDependencies` (`typescript`, `tsup`, `vitest`, `@types/react`, etc.).
  - Install dependencies using `pnpm`.

### Phase 2: Core Engine & Type Decoupling
- **Objectives**:
  - **`types.ts`**: Make route definitions generic.
    - Define core interfaces: `BaseRoute`, `RouteMap`, `RouteParams<R>`, `DynamicRouteParam<R>`.
    - Provide utility `defineRoutes<T>(routes: T)` to preserve literal string types and param keys.
  - **`RoutingHelper.ts`**: Refactor `RouteHelper` into pure generic methods:
    - **Use `generatePath` from `react-router-dom`**: Replace manual string `.replace(':key', val)` loop in `constructHref` with `generatePath(route.path, params as Record<string, string>)` for robust, standard path building.
    - `constructHref(route, params)`
    - `extractParamsFromPath(route, pathname)`
    - `isRouteMatchByUrl(route, pathname)`
    - `getRouteMatchByUrl(routes, pathname)`
  - **`AppRouterService.ts`**: Decouple `AppRouterService` from hardcoded routes; allow instantiation or dynamic route parameter navigation.

### Phase 3: React Components & Custom Hooks
- **Objectives**:
  - **`<AppLink />`**: Ensure `<AppLink route={...} params={...} />` uses `generatePath` / `constructHref` and provides strict autocompletion for required parameters based on the passed route.
  - **React Hooks**:
    - `useTypedNavigate()`: Type-safe navigation hook wrapping `react-router-dom`'s `useNavigate` and `generatePath`.
    - `useTypedParams(route)`: Type-safe route parameter reader wrapping `useParams`.
    - `useTypedMatch(routes)`: Returns the currently matched route object and its extracted params.
  - **`createTypedRouter(routes)` Factory**:
    - Optional builder pattern returning bound components (`TypedLink`), hooks (`useNavigate`, `useParams`), and router service for zero-boilerplate consumption in user projects.

### Phase 4: Automated Testing & Verification
- **Objectives**:
  - Setup Vitest with `@testing-library/react` and DOM environment (`happy-dom`).
  - Write test suites:
    - Route parameter extraction & path matching with `generatePath` (`RoutingHelper.test.ts`).
    - URL construction for static and dynamic routes.
    - `<AppLink />` rendering and click navigation behavior (`AppLink.test.tsx`).
    - Hook behavior (`useTypedNavigate`, `useTypedParams`).
  - Verify build outputs (`pnpm build`) and validate generated TypeScript declaration files.

### Phase 5: Documentation, Cleanup & Package Readiness
- **Objectives**:
  - Move app-specific route examples from `_RouteDefinitions.ts` into test fixtures / example documentation.
  - Create a comprehensive `README.md` with:
    - Quick Start guide.
    - Defining typed routes (`defineRoutes`).
    - Usage with `<AppLink />`, `useTypedNavigate`, `useTypedParams`, and programmatic navigation.
  - Add repository license, metadata, and prepare package manifest for NPM publishing.

---

## Verification Plan
1. **TypeScript Check**: `pnpm tsc --noEmit` runs with 0 errors.
2. **Build Check**: `pnpm build` creates `dist/index.js`, `dist/index.mjs`, and `dist/index.d.ts`.
3. **Unit Tests**: `pnpm test` passes all route helper, component, and hook tests.
