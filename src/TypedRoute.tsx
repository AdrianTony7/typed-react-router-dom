import type React from 'react';
import type { PathRouteProps } from 'react-router-dom';
import { Route as ReactRouterRoute } from 'react-router-dom';
import type { Route } from './types';

/**
 * Props for the `<TypedRoute />` / `<RouteComponent />` component.
 * Replaces react-router-dom's `<Route />` while binding `path` directly to a type-safe `Route` object.
 * All standard Route props (`element`, `Component`, `children`, `loader`, `action`, etc.) are supported.
 */
export type TypedRouteProps<R extends Route> = Omit<PathRouteProps, 'path'> & {
    /**
     * The type-safe path string derived directly from a `Route` object (e.g. `path={routes.USER_DETAIL.path}`).
     */
    path: R['path'];
};

/**
 * A type-safe `<Route />` component that delegates directly to react-router-dom's `<Route />`.
 *
 * Why this design?
 * React Router's `<Routes>` strictly checks `element.type === Route` at runtime and throws if wrapped.
 * By typing `<TypedRoute />` directly over React Router's `Route`, it preserves exact reference identity
 * while strictly type-checking `path` against your route definitions.
 *
 * @example
 * ```tsx
 * import { Routes } from 'react-router-dom';
 * import { TypedRoute } from 'typed-react-router-dom';
 * import { routes } from './routes';
 *
 * function App() {
 *   return (
 *     <Routes>
 *       <TypedRoute path={routes.HOME.path} element={<HomePage />} />
 *       <TypedRoute path={routes.USER_DETAIL.path} element={<UserDetailPage />} />
 *     </Routes>
 *   );
 * }
 * ```
 */
export const TypedRoute = ReactRouterRoute as unknown as <R extends Route>(
    props: TypedRouteProps<R>
) => React.ReactElement;

/**
 * Alias for `TypedRoute`.
 *
 * @example
 * ```tsx
 * import { Routes } from 'react-router-dom';
 * import { RouteComponent } from 'typed-react-router-dom';
 * import { routes } from './routes';
 *
 * function App() {
 *   return (
 *     <Routes>
 *       <RouteComponent path={routes.HOME.path} element={<HomePage />} />
 *     </Routes>
 *   );
 * }
 * ```
 */
export const RouteComponent = TypedRoute;
