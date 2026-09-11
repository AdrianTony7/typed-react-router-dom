/**
 * @fileoverview typed-react-router-dom
 *
 * A generic, type-safe routing library for React + react-router-dom.
 *
 * ## Quick Start
 * ```ts
 * import { defineRoutes, createTypedRouter } from 'typed-react-router-dom';
 *
 * const routes = defineRoutes({
 *   HOME:        { path: '/',          name: 'Home' },
 *   USER_DETAIL: {
 *     path: '/users/:id',
 *     name: 'User Detail',
 *     queryType: {} as { tab?: 'profile' | 'settings'; page?: number }
 *   },
 * } as const);
 *
 * export const router = createTypedRouter(routes);
 * ```
 */

// Core types
export type {
    Route,
    RoutingMap,
    RouteParams,
    RouteQueryParams,
    DynamicRouteParam,
    TypedNavigationProps,
    TypedNavigationPropsWithNewTab,
    ExtractParamKeys,
} from './types';

// defineRoutes helper
export { defineRoutes } from './types';

// Route helper utilities
export { RouteHelper } from './RoutingHelper';

// TypedLink / Link component
export { TypedLink, Link } from './TypedLink';
export type { TypedLinkProps } from './TypedLink';

// TypedRoute / RouteComponent component
export { TypedRoute, RouteComponent } from './TypedRoute';
export type { TypedRouteProps, RouteComponentProps } from './TypedRoute';

// AppRouterService (singleton + class)
export { AppRouterService, appRouter } from './AppRouterService';

// Standalone hooks
export {
    useTypedNavigate,
    useTypedParams,
    useTypedSearchParams,
    useTypedMatch,
} from './hooks';

// createTypedRouter factory
export { createTypedRouter } from './createTypedRouter';
export type { TypedRouter } from './createTypedRouter';
