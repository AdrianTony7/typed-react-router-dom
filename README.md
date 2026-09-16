# typed-react-router-dom

A generic, type-safe routing library for **React** + **react-router-dom**.

Define your application routes once and get fully typed navigation, link and route components, hooks, typed query parameters, and a programmatic router service — all with compile-time type safety and zero runtime dependencies.

---

## Features

- 🔒 **Type-safe routes** — `defineRoutes` automatically infers dynamic `:param` segments directly from `path` (no manual key arrays required!)
- 🧭 **`<TypedRoute />` / `<RouteComponent />`** — type-safe route components for React Router's `<Routes>` that guarantee valid paths
- 🔗 **`<TypedLink />` / `<Link />`** — type-safe `<Link />` wrappers that enforce required params and typed query params
- 🪝 **React hooks** — `useTypedNavigate`, `useTypedParams`, `useTypedSearchParams`, `useTypedMatch`
- 🔍 **Typed Query Parameters** — declare `queryType` and get full autocompletion & query setters
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

**Peer dependencies:** `react ^18 || ^19`, `react-dom ^18 || ^19`, `react-router-dom ^6 || ^7 || ^8`

### Using `react-router` directly (skipping `react-router-dom`)

`typed-react-router-dom` imports from `react-router-dom`, but `react-router-dom` is just a thin re-export over the `react-router` core. Everything this library uses (`generatePath`, `<Link />`, `<Route />`, `useNavigate`, `useParams`, `useLocation`, `useSearchParams`, and types) already lives in `react-router`, so you can skip the middleman entirely.

We recommend `react-router@^7` if you want the leanest bundle — `react-router@^8` is also fully supported.

```bash
pnpm add typed-react-router-dom react-router@^7
# or, for v8:
# pnpm add typed-react-router-dom react-router@^8
```

All you need is a Vite coercion so the library's internal `react-router-dom` imports resolve to `react-router`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^react-router-dom$/, replacement: 'react-router' }],
  },
});
```

That's it. In your app code, import from `react-router` instead of `react-router-dom`:

```tsx
// before
import { Routes, useNavigate } from 'react-router-dom';

// after
import { Routes, useNavigate } from 'react-router';
```

> **TypeScript note:** Vite resolves the alias at build/dev time. If you also run `tsc --noEmit`, add a matching path mapping so the library's `react-router-dom` types resolve:
>
> ```json
> // tsconfig.json
> {
>   "compilerOptions": {
>     "paths": {
>       "react-router-dom": ["./node_modules/react-router"]
>     }
>   }
> }
> ```
>
> Other bundlers work the same way — e.g. webpack `resolve.alias: { 'react-router-dom': 'react-router' }`.
>
> Your package manager may still warn about the unmet `react-router-dom` peer dependency when you skip it. That's expected and safe to ignore — the alias satisfies it at runtime/bundle time.

---

## Quick Start

### 1. Define your routes

Dynamic parameters like `:id` are **automatically inferred** from the path string. You can optionally attach a `queryType` for type-safe query parameters.

```ts
// src/routes.ts
import { defineRoutes, createTypedRouter } from 'typed-react-router-dom';

interface UserDetailQuery {
  tab?: 'profile' | 'settings' | 'activity';
  active?: boolean;
  page?: number;
}

export const routes = defineRoutes({
  HOME:        { path: '/',          name: 'Home' },
  ABOUT:       { path: '/about',     name: 'About' },
  // ':id' is automatically inferred as { id: string }
  USER_DETAIL: {
    path: '/users/:id',
    name: 'User Detail',
    queryType: {} as UserDetailQuery,
  },
} as const);

export const router = createTypedRouter(routes);
```

### 2. Render routes with `<TypedRoute />` or `<RouteComponent />`

```tsx
// src/App.tsx
import { Routes } from 'react-router-dom';
import { router, routes } from './routes';
import { HomePage } from './pages/HomePage';
import { UserDetailPage } from './pages/UserDetailPage';

export function App() {
  return (
    <Routes>
      <router.TypedRoute path={routes.HOME.path} element={<HomePage />} />
      <router.RouteComponent path={routes.USER_DETAIL.path} element={<UserDetailPage />} />
    </Routes>
  );
}
```

### 3. Wire up programmatic navigation (optional)

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

Preserves literal string types and infers path parameters automatically:

```ts
const routes = defineRoutes({
  HOME:        { path: '/', name: 'Home' },
  USER_DETAIL: {
    path: '/users/:id',
    name: 'User Detail',
    queryType: {} as { tab?: 'profile' | 'settings'; page?: number },
  },
} as const);
```

### `createTypedRouter(routes)`

Factory returning components, hooks, a `getHref` helper, and an `AppRouterService` — all scoped to your routes.

```ts
const router = createTypedRouter(routes);
```

| Member | Description |
|---|---|
| `router.TypedRoute` / `router.RouteComponent` | Type-safe `<Route />` component strictly typed to your route map's paths |
| `router.TypedLink` / `router.Link` | Type-safe `<Link />` component supporting `params` & `query` |
| `router.getHref(route, params?, query?)` | Constructs a URL string using `generatePath` + query string serialization |
| `router.useTypedNavigate(route)` | Returns a typed navigation callback accepting `(params, query?, newTab?)` |
| `router.useTypedParams(route)` | Returns typed path params from the current URL |
| `router.useTypedSearchParams(route?)` | Returns `[query, setQuery, searchParams]` for typed query params |
| `router.useTypedMatch()` | Returns matched route + path params + parsed query record for the current URL |
| `router.routerService` | `AppRouterService` instance for programmatic navigation |
| `router.routes` | The original routes map |

---

### `<TypedLink />` / `<Link />`

Type-safe `<Link />` component with required params and optional query params.

```tsx
import { TypedLink, Link } from 'typed-react-router-dom';
import { routes } from './routes';

// Static route — no params needed
<TypedLink route={routes.HOME}>Home</TypedLink>

// Dynamic route with typed path & query parameters
<TypedLink
  route={routes.USER_DETAIL}
  params={{ id: '42' }}
  query={{ tab: 'settings', active: true }}
>
  View User Settings
</TypedLink>
```

---

### `<TypedRoute />` / `<RouteComponent />`

Type-safe replacement for `react-router-dom`'s `<Route />`. Guarantees that the route path matches defined routes.

```tsx
import { Routes } from 'react-router-dom';
import { TypedRoute, RouteComponent } from 'typed-react-router-dom';
import { routes } from './routes';

<Routes>
  <TypedRoute path={routes.HOME.path} element={<Home />} />
  <RouteComponent path={routes.USER_DETAIL.path} element={<UserDetail />} />
</Routes>
```

---

### `useTypedSearchParams(route)`

```tsx
import { useTypedSearchParams } from 'typed-react-router-dom';
import { routes } from './routes';

function UserDetail() {
  const [query, setQuery] = useTypedSearchParams(routes.USER_DETAIL);

  return (
    <div>
      <p>Current Tab: {query.tab}</p>
      <button onClick={() => setQuery({ tab: 'settings' })}>
        Switch to Settings
      </button>
    </div>
  );
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
  const { route, params, query } = useTypedMatch(routes);
  return (
    <div>
      <span>{route?.name ?? 'Unknown'}</span>
      <span>{query.tab}</span>
    </div>
  );
}
```

---

### `AppRouterService` (programmatic navigation)

```ts
import { appRouter } from 'typed-react-router-dom';
import { routes } from './routes';

// Navigate from outside a React component (e.g., in an API service):
appRouter.navigateToRoute(routes.USER_DETAIL, { id: '42' }, { tab: 'profile' });
appRouter.navigateToURL('/some-path', /* newTab */ true);
```

---

### `RouteHelper` (low-level utilities)

```ts
import { RouteHelper } from 'typed-react-router-dom';

RouteHelper.constructHref(routes.USER_DETAIL, { id: '42' }, { tab: 'settings' });  // '/users/42?tab=settings'
RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/99');                 // { id: '99' }
RouteHelper.extractParamKeysFromPath('/users/:id/posts/:postId');                   // ['id', 'postId']
RouteHelper.extractQueryParams('?tab=settings&page=2');                             // { tab: 'settings', page: '2' }
RouteHelper.getRouteMatchByUrl(routes, '/users/5');                                 // routes.USER_DETAIL
RouteHelper.getAllRoutesAsArray(routes);                                            // Route[]
RouteHelper.isChildOf(routes, '/profile', '/');                                     // true | false
```

---

## Route Interface

```ts
interface Route<TPath extends string = string, TQuery extends Record<string, any> = Record<string, any>> {
  path: TPath;                    // Route path pattern (e.g., '/users/:id')
  name?: string;                  // Human-readable display name
  parent?: string;                // Parent route path for breadcrumbs / nesting
  icon?: ComponentType<any>;      // Optional icon component
  queryType?: TQuery;             // Type carrier for compile-time query params
}
```

---

## License

MIT
