import React from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link, generatePath, useNavigate, useParams, useLocation } from 'react-router-dom';
import { RouteHelper } from './RoutingHelper';
import { AppRouterService } from './AppRouterService';
import type {
    Route,
    RoutingMap,
    RouteParams,
    DynamicRouteParam,
    TypedNavigationPropsWithNewTab,
} from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScopedAppLinkProps<R extends Route> = Omit<LinkProps, 'to'> & {
    route: R;
} & DynamicRouteParam<R>;

/**
 * The object returned by `createTypedRouter(routes)`.
 * Contains all components, hooks, and service scoped to your route map.
 */
export interface TypedRouter<M extends RoutingMap> {
    /**
     * Typed `<Link />` component. TypeScript enforces params when the route requires them.
     *
     * @example
     * ```tsx
     * <TypedLink route={routes.USER_DETAIL} params={{ id: '42' }}>View User</TypedLink>
     * ```
     */
    TypedLink: <R extends M[keyof M]>(
        props: React.PropsWithChildren<ScopedAppLinkProps<R>>
    ) => React.ReactElement;

    /**
     * Constructs a fully-resolved href string for a given route + params.
     * Delegates to `generatePath` from react-router-dom.
     */
    getHref: <R extends M[keyof M]>(route: R, params?: RouteParams<R>) => string;

    /**
     * Type-safe navigation hook bound to your route map.
     * Returns a navigate function that enforces required params.
     *
     * @example
     * ```tsx
     * const goToUser = useTypedNavigate(routes.USER_DETAIL);
     * goToUser({ id: '42' });
     * ```
     */
    useTypedNavigate: <R extends M[keyof M]>(route: R) => (params: RouteParams<R>, newTab?: boolean) => void;

    /**
     * Returns the typed path params for the given route from the current URL.
     */
    useTypedParams: <R extends M[keyof M]>(
        route: R
    ) => RouteParams<R> extends undefined ? Record<string, string | undefined> : RouteParams<R>;

    /**
     * Matches the current URL to a route in the map and returns the route + extracted params.
     */
    useTypedMatch: () => {
        route: M[keyof M] | undefined;
        params: Record<string, string> | undefined;
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
 *   USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
 * } as const);
 *
 * export const router = createTypedRouter(routes);
 * export { routes };
 * ```
 *
 * ```tsx
 * // App.tsx
 * import { router } from './routes';
 *
 * function NavigationSetter() {
 *   const navigate = useNavigate();
 *   useEffect(() => { router.routerService.setNavigator(navigate); }, [navigate]);
 *   return null;
 * }
 *
 * function UserCard({ id }: { id: string }) {
 *   return (
 *     <router.TypedLink route={router.routes.USER_DETAIL} params={{ id }}>
 *       View Profile
 *     </router.TypedLink>
 *   );
 * }
 * ```
 */
export function createTypedRouter<M extends RoutingMap>(routesMap: M): TypedRouter<M> {
    const routerService = new AppRouterService();

    // --- TypedLink ---
    function TypedLink<R extends M[keyof M]>(
        props: React.PropsWithChildren<ScopedAppLinkProps<R>>
    ): React.ReactElement {
        const { children, route, params, ...linkProps } = props;
        const href = RouteHelper.constructHref(route, params as RouteParams<R>);
        return React.createElement(Link, { to: href, ...linkProps }, children);
    }

    // --- getHref ---
    function getHref<R extends M[keyof M]>(route: R, params?: RouteParams<R>): string {
        return RouteHelper.constructHref(route, params);
    }

    // --- useTypedNavigate ---
    function useTypedNavigate<R extends M[keyof M]>(
        route: R
    ): (params: RouteParams<R>, newTab?: boolean) => void {
        const navigate = useNavigate();
        return React.useCallback(
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

    // --- useTypedParams ---
    function useTypedParams<R extends M[keyof M]>(
        _route: R
    ): RouteParams<R> extends undefined ? Record<string, string | undefined> : RouteParams<R> {
        const params = useParams();
        return params as ReturnType<typeof useTypedParams<R>>;
    }

    // --- useTypedMatch ---
    function useTypedMatch(): {
        route: M[keyof M] | undefined;
        params: Record<string, string> | undefined;
    } {
        const { pathname } = useLocation();
        const route = RouteHelper.getRouteMatchByUrl(routesMap, pathname) as
            | M[keyof M]
            | undefined;
        const params = route
            ? RouteHelper.extractParamsFromPath(route, pathname)
            : undefined;
        return { route, params };
    }

    return {
        TypedLink,
        getHref,
        useTypedNavigate,
        useTypedParams,
        useTypedMatch,
        routerService,
        routes: routesMap,
    };
}
