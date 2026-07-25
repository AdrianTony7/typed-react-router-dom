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
 *   USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
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
    DynamicRouteParam,
    TypedNavigationProps,
    TypedNavigationPropsWithNewTab,
} from './types';

// defineRoutes helper
export { defineRoutes } from './types';

// Route helper utilities
export { RouteHelper } from './RoutingHelper';

// AppLink component
export { AppLink } from './AppLink';
export type { AppLinkProps } from './AppLink';

// AppRouterService (singleton + class)
export { AppRouterService, appRouter } from './AppRouterService';

// Standalone hooks
export { useTypedNavigate, useTypedParams, useTypedMatch } from './hooks';

// createTypedRouter factory
export { createTypedRouter } from './createTypedRouter';
export type { TypedRouter } from './createTypedRouter';
