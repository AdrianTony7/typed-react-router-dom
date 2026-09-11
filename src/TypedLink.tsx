import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link as ReactRouterLink } from 'react-router-dom';
import { RouteHelper } from './RoutingHelper';
import type { DynamicRouteParam, Route, RouteParams, RouteQueryParams } from './types';

/** All Link props except `to`, which is derived from `route` + `params` + `query`. */
type LinkToProps = Omit<LinkProps, 'to'>;

/**
 * Props for the `<TypedLink />` / `<Link />` component.
 * - `route`: The typed Route object to link to.
 * - `params`: Required params if the route has dynamic segments (type-checked automatically).
 * - `query`: Optional query parameters (type-checked automatically if declared on the route).
 */
export type TypedLinkProps<R extends Route> = LinkToProps & {
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
 * <TypedLink route={routes.HOME}>Home</TypedLink>
 *
 * // Dynamic route with query params
 * <TypedLink
 *   route={routes.USER_DETAIL}
 *   params={{ id: '42' }}
 *   query={{ tab: 'settings' }}
 * >
 *   View User Settings
 * </TypedLink>
 * ```
 */
export function TypedLink<R extends Route>(
    props: React.PropsWithChildren<TypedLinkProps<R>>
) {
    const { children, route, params, query, ...linkProps } = props;
    const href = RouteHelper.constructHref(
        route,
        params as RouteParams<R>,
        query as Partial<RouteQueryParams<R>>
    );
    return (
        <ReactRouterLink to={href} {...linkProps}>
            {children}
        </ReactRouterLink>
    );
}

/**
 * Alias for `TypedLink` that can directly replace React Router's `<Link />` with type safety.
 */
export const Link = TypedLink;
