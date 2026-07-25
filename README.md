# typed-react-router-dom

A generic, type-safe routing library for **React** + **react-router-dom**.

Define your application routes once and get fully typed navigation, link components, hooks, and a programmatic router service — all with zero runtime overhead.

---

## Features

- 🔒 **Type-safe routes** — `defineRoutes` preserves literal path types and param keys
- 🔗 **`<AppLink />`** — a typed `<Link />` wrapper that enforces required params at compile time
- 🪝 **React hooks** — `useTypedNavigate`, `useTypedParams`, `useTypedMatch`
- 🏭 **`createTypedRouter(routes)`** — a factory for zero-boilerplate per-app routers
- 🚀 **Programmatic navigation** — `AppRouterService` for navigating outside the React tree
- 📦 **Dual ESM/CJS** build with bundled TypeScript declarations

---

## Installation

```bash
pnpm add typed-react-router-dom react-router-dom
# or
npm install typed-react-router-dom react-router-dom
```

**Peer dependencies:** `react ^18 || ^19`, `react-dom ^18 || ^19`, `react-router-dom ^6 || ^7`

---

## Quick Start

### 1. Define your routes

```ts
// src/routes.ts
import { defineRoutes, createTypedRouter } from 'typed-react-router-dom';

export const routes = defineRoutes({
  HOME:        { path: '/',          name: 'Home' },
  ABOUT:       { path: '/about',     name: 'About' },
  USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
} as const);

export const router = createTypedRouter(routes);
```

### 2. Wire up programmatic navigation (optional)

```tsx
// src/NavigationSetter.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { router } from './routes';

export function NavigationSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    router.routerService.setNavigator(navigate);
  }, [navigate]);
  return null;
}
```

---

## API Reference

### `defineRoutes(map)`

Preserves literal string types and `paramKeys` tuples on your route map.

```ts
const routes = defineRoutes({
  HOME:        { path: '/', name: 'Home' },
  USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
} as const);
```

### `createTypedRouter(routes)`

Factory returning components, hooks, a `getHref` helper, and an `AppRouterService` — all scoped to your routes.

```ts
const router = createTypedRouter(routes);
```

| Member | Description |
|---|---|
| `router.TypedLink` | Type-safe `<Link />` component |
| `router.getHref(route, params?)` | Constructs a URL string using `generatePath` |
| `router.useTypedNavigate(route)` | Returns a typed navigation callback |
| `router.useTypedParams(route)` | Returns typed path params from the current URL |
| `router.useTypedMatch()` | Returns matched route + params for the current URL |
| `router.routerService` | `AppRouterService` instance for programmatic navigation |
| `router.routes` | The original routes map |

---

### `<AppLink route params? ...LinkProps>`

```tsx
import { AppLink } from 'typed-react-router-dom';
import { routes } from './routes';

// Static route — no params needed
<AppLink route={routes.HOME}>Home</AppLink>

// Dynamic route — TypeScript enforces params
<AppLink route={routes.USER_DETAIL} params={{ id: '42' }}>View User</AppLink>
```

---

### `useTypedNavigate(route)`

```tsx
import { useTypedNavigate } from 'typed-react-router-dom';
import { routes } from './routes';

function UserButton({ id }: { id: string }) {
  const goToUser = useTypedNavigate(routes.USER_DETAIL);
  return <button onClick={() => goToUser({ id })}>View Profile</button>;
}
```

---

### `useTypedParams(route)`

```tsx
import { useTypedParams } from 'typed-react-router-dom';
import { routes } from './routes';

function UserDetail() {
  const { id } = useTypedParams(routes.USER_DETAIL);
  return <p>User ID: {id}</p>;
}
```

---

### `useTypedMatch(routesMap)`

```tsx
import { useTypedMatch } from 'typed-react-router-dom';
import { routes } from './routes';

function Breadcrumb() {
  const { route, params } = useTypedMatch(routes);
  return <span>{route?.name ?? 'Unknown'}</span>;
}
```

---

### `AppRouterService` (programmatic navigation)

```ts
import { appRouter } from 'typed-react-router-dom';
import { routes } from './routes';

// Navigate from outside a React component (e.g., in an API service):
appRouter.navigateToRoute(routes.USER_DETAIL, { id: '42' });
appRouter.navigateToURL('/some-path', /* newTab */ true);
```

---

### `RouteHelper` (low-level utilities)

```ts
import { RouteHelper } from 'typed-react-router-dom';

RouteHelper.constructHref(routes.USER_DETAIL, { id: '42' });  // '/users/42'
RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/99');  // { id: '99' }
RouteHelper.getRouteMatchByUrl(routes, '/users/5');  // routes.USER_DETAIL
RouteHelper.getAllRoutesAsArray(routes);  // Route[]
RouteHelper.isChildOf(routes, '/profile', '/');  // true | false
```

---

## Route Interface

```ts
interface Route {
  path: string;                   // Route path pattern (e.g., '/users/:id')
  name?: string;                  // Human-readable display name
  parent?: string;                // Parent route path for breadcrumbs / nesting
  icon?: ComponentType<any>;      // Optional icon component
  paramKeys?: readonly string[];  // Required dynamic segment keys
}
```

---

## License

MIT
