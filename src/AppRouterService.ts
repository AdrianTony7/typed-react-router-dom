import type { NavigateFunction } from 'react-router-dom';
import { RouteHelper } from './RoutingHelper';
import type { Route, RouteParams, RouteQueryParams, TypedNavigationPropsWithNewTab } from './types';

/**
 * A generic, decoupled service for programmatic navigation in React Router applications.
 * Must be initialized with a `NavigateFunction` (from `useNavigate`) before navigating.
 *
 * @example
 * ```tsx
 * // In a root layout component:
 * function NavigationSetter() {
 *   const navigate = useNavigate();
 *   useEffect(() => { appRouter.setNavigator(navigate); }, [navigate]);
 *   return null;
 * }
 *
 * // Anywhere in the app (outside React tree too):
 * appRouter.navigateToRoute(routes.USER_DETAIL, { id: '42' }, { tab: 'profile' });
 * ```
 */
export class AppRouterService {
    private _navigateFn: NavigateFunction | null = null;

    /**
     * Registers the navigate function from `useNavigate()`.\
     * Call this early in your component tree, e.g. inside a layout or root component.
     */
    setNavigator(navigator: NavigateFunction): void {
        this._navigateFn = navigator;
    }

    /**
     * Navigates to a route using a typed object with `route`, `params`, and optional `query`.
     */
    navigateTo<R extends Route>(props: TypedNavigationPropsWithNewTab<R>): void {
        const { route, params, query, newTab } = props;
        this.navigateToStrict(route, params as RouteParams<R>, query, newTab);
    }

    /**
     * Navigates to a route object directly with optional typed params and query params.
     * Throws if required params are missing.
     */
    navigateToRoute<R extends Route>(
        route: R,
        params?: RouteParams<R>,
        queryOrNewTab?: Partial<RouteQueryParams<R>> | boolean,
        newTab: boolean = false
    ): void {
        const expectedKeys = route.paramKeys && route.paramKeys.length > 0
            ? (route.paramKeys as readonly string[])
            : RouteHelper.extractParamKeysFromPath(route.path);

        if (!params && expectedKeys.length > 0) {
            throw new Error(
                `[typed-react-router-dom] Route '${route.name ?? route.path}' requires params: ${expectedKeys.join(', ')}`
            );
        }
        let query: Partial<RouteQueryParams<R>> | undefined;
        let openNewTab = newTab;

        if (typeof queryOrNewTab === 'boolean') {
            openNewTab = queryOrNewTab;
        } else if (queryOrNewTab && typeof queryOrNewTab === 'object') {
            query = queryOrNewTab;
        }

        const href = RouteHelper.constructHref(route, params, query);
        this.navigateToURL(href, openNewTab);
    }

    /**
     * Navigates to a route with strictly typed params and optional query params.
     */
    navigateToStrict<R extends Route>(
        route: R,
        params: RouteParams<R>,
        query?: Partial<RouteQueryParams<R>>,
        newTab: boolean = false
    ): void {
        const href = RouteHelper.constructHref(route, params, query);
        this.navigateToURL(href, newTab);
    }

    /**
     * Navigates to any arbitrary URL string.
     * Opens in a new tab if `newTab` is true.
     *
     * @throws if `setNavigator` has not been called yet.
     */
    navigateToURL(url: string, newTab: boolean = false): void {
        if (!this._navigateFn) {
            throw new Error(
                '[typed-react-router-dom] Navigator not set. Call appRouter.setNavigator(navigate) first.'
            );
        }
        if (newTab) {
            window.open(url, '_blank');
        } else {
            this._navigateFn(url);
        }
    }
}

/**
 * A singleton AppRouterService instance for applications that prefer global navigation.
 * Wire it up once with `appRouter.setNavigator(navigate)` and use anywhere.
 */
export const appRouter = new AppRouterService();
