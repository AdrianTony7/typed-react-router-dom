import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RouteHelper } from './RoutingHelper';
import type { DynamicRouteParam, Route, RouteParams, RouteQueryParams } from './types';

/** All Link props except `to`, which is derived from `route` + `params` + `query`. */
type LinkToProps = Omit<LinkProps, 'to'>;

/**
 * Props for the `<AppLink />` component.
 * - `route`: The typed Route object to link to.
 * - `params`: Required params if the route has dynamic segments (type-checked automatically).
 * - `query`: Optional query parameters (type-checked automatically if declared on the route).
 */
export type AppLinkProps<R extends Route> = LinkToProps & {
    /** The Route object to navigate to. */
    route: R;
    /** Optional typed query parameters. */
    query?: Partial<RouteQueryParams<R>>;
} & DynamicRouteParam<R>;

/**
 * A type-safe `<Link />` component that wraps react-router-dom's `Link`.
 * It automatically constructs the `to` href using `generatePath` and query params based on
 * the provided `route`, `params`, and `query`.
 *
 * @example
 * ```tsx
 * // Static route — no params needed
 * <AppLink route={routes.HOME}>Home</AppLink>
 *
 * // Dynamic route with query params
 * <AppLink
 *   route={routes.USER_DETAIL}
 *   params={{ id: '42' }}
 *   query={{ tab: 'settings' }}
 * >
 *   View User Settings
 * </AppLink>
 * ```
 */
export function AppLink<R extends Route>(
    props: React.PropsWithChildren<AppLinkProps<R>>
) {
    const { children, route, params, query, ...linkProps } = props;
    const href = RouteHelper.constructHref(
        route,
        params as RouteParams<R>,
        query as Partial<RouteQueryParams<R>>
    );
    return (
        <Link to={href} {...linkProps}>
            {children}
        </Link>
    );
}
