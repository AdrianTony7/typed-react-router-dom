import React from 'react';
import type { LinkProps, PathRouteProps } from 'react-router-dom';
import {
    Link as ReactRouterLink,
    Route as ReactRouterRoute,
    useNavigate,
    useParams,
    useLocation,
    useSearchParams,
} from 'react-router-dom';
import { RouteHelper } from './RoutingHelper';
import { AppRouterService } from './AppRouterService';
import type {
    Route,
    RoutingMap,
    RouteParams,
    RouteQueryParams,
    DynamicRouteParam,
} from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScopedAppLinkProps<R extends Route> = Omit<LinkProps, 'to'> & {
    route: R;
    query?: Partial<RouteQueryParams<R>>;
} & DynamicRouteParam<R>;

type ScopedTypedRouteProps<M extends RoutingMap> = Omit<PathRouteProps, 'path'> & {
    path: M[keyof M]['path'];
};

/**
 * The object returned by `createTypedRouter(routes)`.\
 * Contains all components, hooks, and service scoped to your route map.
 */
export interface TypedRouter<M extends RoutingMap> {
    /**
     * Typed `<Link />` component. TypeScript enforces params and typed queries when defined.
     *
     * @example
     * ```tsx
     * <TypedLink route={routes.USER_DETAIL} params={{ id: '42' }} query={{ tab: 'settings' }}>
     *   View User
     * </TypedLink>
     * ```
     */
    TypedLink: <R extends M[keyof M]>(
        props: React.PropsWithChildren<ScopedAppLinkProps<R>>
    ) => React.ReactElement;

    /**
     * Alias for `TypedLink`.
     */
    Link: <R extends M[keyof M]>(
        props: React.PropsWithChildren<ScopedAppLinkProps<R>>
    ) => React.ReactElement;

    /**
     * @deprecated Renamed to `TypedLink`. `AppLink` is retained for backward compatibility.
     */
    AppLink: <R extends M[keyof M]>(
        props: React.PropsWithChildren<ScopedAppLinkProps<R>>
    ) => React.ReactElement;

    /**
     * Typed `<Route />` component strictly typed to your route map's paths.
     *
     * @example
     * ```tsx
     * <Routes>
     *   <router.TypedRoute path={router.routes.USER_DETAIL.path} element={<UserDetailPage />} />
     * </Routes>
     * ```
     */
    TypedRoute: (props: ScopedTypedRouteProps<M>) => React.ReactElement;

    /**
     * Alias for `TypedRoute`.
     */
    RouteComponent: (props: ScopedTypedRouteProps<M>) => React.ReactElement;

    /**
     * Constructs a fully-resolved href string for a given route + params + query.
     */
    getHref: <R extends M[keyof M]>(
        route: R,
        params?: RouteParams<R>,
        query?: Partial<RouteQueryParams<R>>
    ) => string;

    /**
     * Type-safe navigation hook bound to your route map.
     * Returns a navigate function that enforces required params and typed query params.
     *
     * @example
     * ```tsx
     * const goToUser = useTypedNavigate(routes.USER_DETAIL);
     * goToUser({ id: '42' }, { tab: 'profile' });
     * ```
     */
    useTypedNavigate: <R extends M[keyof M]>(
        route: R
    ) => {
        (params: RouteParams<R>, newTab?: boolean): void;
        (params: RouteParams<R>, query?: Partial<RouteQueryParams<R>>, newTab?: boolean): void;
    };

    /**
     * Returns the typed path params for the given route from the current URL.
     */
    useTypedParams: <R extends M[keyof M]>(
        route: R
    ) => RouteParams<R> extends undefined ? Record<string, string | undefined> : RouteParams<R>;

    /**
     * Returns typed query parameters and updater for the current URL.
     */
    useTypedSearchParams: <R extends M[keyof M]>(
        route?: R
    ) => readonly [
        Partial<RouteQueryParams<R>>,
        (
            next:
                | Partial<RouteQueryParams<R>>
                | ((prev: Partial<RouteQueryParams<R>>) => Partial<RouteQueryParams<R>>),
            navigateOptions?: Parameters<ReturnType<typeof useSearchParams>[1]>[1]
        ) => void,
        URLSearchParams
    ];

    /**
     * Matches the current URL to a route in the map and returns the route + extracted params + query.
     */
    useTypedMatch: () => {
        route: M[keyof M] | undefined;
        params: Record<string, string> | undefined;
        query: Record<string, string>;
    };

    /**
     * Pre-configured `AppRouterService` instance for programmatic navigation.
     * Wire it up once using `router.routerService.setNavigator(navigate)`.
     */
    routerService: AppRouterService;

    /** The raw routes map passed to `createTypedRouter`. */
    routes: M;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a scoped typed router bound to your application's route definitions.
 * Returns a set of components, hooks, and a service — all type-checked against your routes.
 *
 * @example
 * ```ts
 * // routes.ts
 * import { defineRoutes, createTypedRouter } from 'typed-react-router-dom';
 *
 * const routes = defineRoutes({
 *   HOME: { path: '/', name: 'Home' },
 *   USER_DETAIL: {
 *     path: '/users/:id',
 *     name: 'User Detail',
 *     queryType: {} as { tab?: 'profile' | 'settings' }
 *   },
 * } as const);
 *
 * export const router = createTypedRouter(routes);
 * export { routes };
 * ```
 */
export function createTypedRouter<M extends RoutingMap>(routesMap: M): TypedRouter<M> {
    const routerService = new AppRouterService();

    // --- TypedLink ---
    function TypedLink<R extends M[keyof M]>(
        props: React.PropsWithChildren<ScopedAppLinkProps<R>>
    ): React.ReactElement {
        const { children, route, params, query, ...linkProps } = props;
        const href = RouteHelper.constructHref(
            route,
            params as RouteParams<R>,
            query as Partial<RouteQueryParams<R>>
        );
        return React.createElement(ReactRouterLink, { to: href, ...linkProps }, children);
    }

    // --- TypedRoute ---
    const TypedRoute = ReactRouterRoute as unknown as (
        props: ScopedTypedRouteProps<M>
    ) => React.ReactElement;

    // --- getHref ---
    function getHref<R extends M[keyof M]>(
        route: R,
        params?: RouteParams<R>,
        query?: Partial<RouteQueryParams<R>>
    ): string {
        return RouteHelper.constructHref(route, params, query);
    }

    // --- useTypedNavigate ---
    function useTypedNavigate<R extends M[keyof M]>(
        route: R
    ): {
        (params: RouteParams<R>, newTab?: boolean): void;
        (params: RouteParams<R>, query?: Partial<RouteQueryParams<R>>, newTab?: boolean): void;
    } {
        const navigate = useNavigate();
        return React.useCallback(
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

    // --- useTypedParams ---
    function useTypedParams<R extends M[keyof M]>(
        _route: R
    ): RouteParams<R> extends undefined ? Record<string, string | undefined> : RouteParams<R> {
        const params = useParams();
        return params as ReturnType<typeof useTypedParams<R>>;
    }

    // --- useTypedSearchParams ---
    function useTypedSearchParams<R extends M[keyof M]>(_route?: R) {
        const [searchParams, setSearchParams] = useSearchParams();

        const query = React.useMemo(() => {
            const result: Record<string, string> = {};
            searchParams.forEach((val, key) => {
                result[key] = val;
            });
            return result as unknown as Partial<RouteQueryParams<R>>;
        }, [searchParams]);

        const setQuery = React.useCallback(
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

    // --- useTypedMatch ---
    function useTypedMatch(): {
        route: M[keyof M] | undefined;
        params: Record<string, string> | undefined;
        query: Record<string, string>;
    } {
        const { pathname, search } = useLocation();
        const route = RouteHelper.getRouteMatchByUrl(routesMap, pathname) as
            | M[keyof M]
            | undefined;
        const params = route
            ? RouteHelper.extractParamsFromPath(route, pathname)
            : undefined;
        const query = RouteHelper.extractQueryParams(search);
        return { route, params, query };
    }

    return {
        TypedLink,
        Link: TypedLink,
        AppLink: TypedLink,
        TypedRoute,
        RouteComponent: TypedRoute,
        getHref,
        useTypedNavigate,
        useTypedParams,
        useTypedSearchParams,
        useTypedMatch,
        routerService,
        routes: routesMap,
    };
}
