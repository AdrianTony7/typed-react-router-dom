import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RouteHelper } from './RoutingHelper';
import type { DynamicRouteParam, Route, RouteParams } from './types';

/** All Link props except `to`, which is derived from `route` + `params`. */
type LinkToProps = Omit<LinkProps, 'to'>;

/**
 * Props for the `<AppLink />` component.
 * - `route`: The typed Route object to link to.
 * - `params`: Required params if the route has dynamic segments (type-checked automatically).
 */
export type AppLinkProps<R extends Route> = LinkToProps & {
    /** The Route object to navigate to. */
    route: R;
} & DynamicRouteParam<R>;

/**
 * A type-safe `<Link />` component that wraps react-router-dom's `Link`.
 * It automatically constructs the `to` href using `generatePath` based on
 * the provided `route` and `params`.
 *
 * @example
 * ```tsx
 * // Static route — no params needed
 * <AppLink route={routes.HOME}>Home</AppLink>
 *
 * // Dynamic route — TypeScript enforces that `params` is provided
 * <AppLink route={routes.USER_DETAIL} params={{ id: '42' }}>View User</AppLink>
 * ```
 */
export function AppLink<R extends Route>(
    props: React.PropsWithChildren<AppLinkProps<R>>
) {
    const { children, route, params, ...linkProps } = props;
    const href = RouteHelper.constructHref(route, params as RouteParams<R>);
    return (
        <Link to={href} {...linkProps}>
            {children}
        </Link>
    );
}