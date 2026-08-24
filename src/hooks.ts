import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Route, RouteParams, RouteQueryParams, RoutingMap } from './types';
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
 * goToUser({ id: '42' });                                 // required params enforced
 * goToUser({ id: '42' }, { tab: 'profile' });             // with typed query params
 * goToUser({ id: '42' }, { tab: 'profile' }, true);       // navigate in a new tab
 * goToUser({ id: '42' }, true);                           // directly open new tab
 * ```
 */
export function useTypedNavigate<R extends Route>(
    route: R
): {
    (params: RouteParams<R>, newTab?: boolean): void;
    (params: RouteParams<R>, query?: Partial<RouteQueryParams<R>>, newTab?: boolean): void;
} {
    const navigate = useNavigate();
    return useCallback(
        (
            params: RouteParams<R>,
            queryOrNewTab?: Partial<RouteQueryParams<R>> | boolean,
            newTab: boolean = false
        ) => {
            let query: Partial<RouteQueryParams<R>> | undefined;
            let openNewTab = newTab;

            if (typeof queryOrNewTab === 'boolean') {
                openNewTab = queryOrNewTab;
            } else if (queryOrNewTab && typeof queryOrNewTab === 'object') {
                query = queryOrNewTab;
            }

            const href = RouteHelper.constructHref(route, params, query);
            if (openNewTab) {
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
// useTypedSearchParams
// ---------------------------------------------------------------------------

/**
 * Returns typed query parameters and an updater function for the current URL.
 * Wraps react-router-dom's `useSearchParams`.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useTypedSearchParams(routes.USER_DETAIL);
 * console.log(query.tab); // access typed query keys
 * setQuery({ tab: 'settings' });
 * ```
 */
export function useTypedSearchParams<R extends Route>(_route?: R) {
    const [searchParams, setSearchParams] = useSearchParams();

    const query = useMemo(() => {
        const result: Record<string, string> = {};
        searchParams.forEach((val, key) => {
            result[key] = val;
        });
        return result as unknown as Partial<RouteQueryParams<R>>;
    }, [searchParams]);

    const setQuery = useCallback(
        (
            next:
                | Partial<RouteQueryParams<R>>
                | ((prev: Partial<RouteQueryParams<R>>) => Partial<RouteQueryParams<R>>),
            navigateOptions?: Parameters<typeof setSearchParams>[1]
        ) => {
            setSearchParams((prev) => {
                const current: Record<string, string> = {};
                prev.forEach((v, k) => {
                    current[k] = v;
                });
                const resolved =
                    typeof next === 'function'
                        ? next(current as unknown as Partial<RouteQueryParams<R>>)
                        : next;
                const updated = new URLSearchParams();
                if (resolved) {
                    for (const [k, v] of Object.entries(resolved)) {
                        if (v !== undefined && v !== null) {
                            updated.set(k, String(v));
                        }
                    }
                }
                return updated;
            }, navigateOptions);
        },
        [setSearchParams]
    );

    return [query, setQuery, searchParams] as const;
}

// ---------------------------------------------------------------------------
// useTypedMatch
// ---------------------------------------------------------------------------

/**
 * Matches the current URL pathname against a routing map and returns the
 * matching route (if any) along with extracted path params and query params.
 *
 * @example
 * ```tsx
 * const { route, params, query } = useTypedMatch(routes);
 * if (route === routes.USER_DETAIL) {
 *   console.log(params?.id); // string
 * }
 * ```
 */
export function useTypedMatch<M extends RoutingMap>(routesMap: M): {
    route: M[keyof M] | undefined;
    params: Record<string, string> | undefined;
    query: Record<string, string>;
} {
    const { pathname, search } = useLocation();
    const route = RouteHelper.getRouteMatchByUrl(routesMap, pathname) as M[keyof M] | undefined;
    const params = route ? RouteHelper.extractParamsFromPath(route, pathname) : undefined;
    const query = RouteHelper.extractQueryParams(search);
    return { route, params, query };
}
