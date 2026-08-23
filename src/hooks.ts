import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Route, RouteParams, RoutingMap } from './types';
import { RouteHelper } from './RoutingHelper';

// ---------------------------------------------------------------------------
// useTypedNavigate
// ---------------------------------------------------------------------------

/**
 * Returns a type-safe navigation function bound to a specific route.
 * Uses react-router-dom's `useNavigate` under the hood.
 *
 * @example
 * ```tsx
 * const goToUser = useTypedNavigate(routes.USER_DETAIL);
 * goToUser({ id: '42' });           // required params are enforced by TypeScript
 * goToUser({ id: '42' }, true);     // navigate in a new tab
 * ```
 */
export function useTypedNavigate<R extends Route>(
    route: R
): (params: RouteParams<R>, newTab?: boolean) => void {
    const navigate = useNavigate();
    return useCallback(
        (params: RouteParams<R>, newTab: boolean = false) => {
            const href = RouteHelper.constructHref(route, params);
            if (newTab) {
                window.open(href, '_blank');
            } else {
                navigate(href);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [navigate, route.path]
    );
}

// ---------------------------------------------------------------------------
// useTypedParams
// ---------------------------------------------------------------------------

/**
 * Returns the typed path parameters for the current route.
 * Wraps react-router-dom's `useParams` and casts to the correct type.
 *
 * @example
 * ```tsx
 * // If the current URL is /users/42 and route.path is '/users/:id'
 * const { id } = useTypedParams(routes.USER_DETAIL);
 * // id is typed as `string`
 * ```
 */
export function useTypedParams<R extends Route>(
    _route: R
): RouteParams<R> extends undefined ? Record<string, string | undefined> : RouteParams<R> {
    // useParams always returns Record<string, string | undefined> at runtime.
    // We cast to the inferred typed params for the caller's convenience.
    const params = useParams();
    return params as ReturnType<typeof useTypedParams<R>>;
}

// ---------------------------------------------------------------------------
// useTypedMatch
// ---------------------------------------------------------------------------

/**
 * Matches the current URL pathname against a routing map and returns the
 * matching route (if any) along with extracted path params.
 *
 * @example
 * ```tsx
 * const { route, params } = useTypedMatch(routes);
 * if (route === routes.USER_DETAIL) {
 *   console.log(params?.id); // string
 * }
 * ```
 */
export function useTypedMatch<M extends RoutingMap>(routesMap: M): {
    route: M[keyof M] | undefined;
    params: Record<string, string> | undefined;
} {
    const { pathname } = useLocation();
    const route = RouteHelper.getRouteMatchByUrl(routesMap, pathname) as M[keyof M] | undefined;
    const params = route ? RouteHelper.extractParamsFromPath(route, pathname) : undefined;
    return { route, params };
}
