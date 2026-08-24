import { generatePath } from 'react-router-dom';
import type { Route, RoutingMap, RouteParams, RouteQueryParams } from './types';

/**
 * A generic helper class for working with any typed routing map.
 * All methods are static and operate purely on the provided route definitions.
 */
export class RouteHelper {
    /**
     * Constructs a fully-resolved URL string for a given route, including path and query parameters.
     * Delegates to react-router-dom's `generatePath` for path interpolation and formats query parameters.
     *
     * @param route - The Route object (e.g., `routes.USER_DETAIL`).
     * @param params - Required parameters for dynamic routes (e.g., `{ id: '123' }`).
     * @param query - Optional query parameters (e.g., `{ tab: 'profile', page: 2 }`).
     * @returns The fully constructed URL string.
     */
    public static constructHref<R extends Route>(
        route: R,
        params?: RouteParams<R>,
        query?: Partial<RouteQueryParams<R>>
    ): string {
        if (route.paramKeys && route.paramKeys.length > 0 && !params) {
            console.error(
                `[typed-react-router-dom] Route '${route.name ?? route.path}' requires parameters: ${route.paramKeys.join(', ')}, but none were provided.`
            );
            return route.path;
        }
        let url = generatePath(route.path, (params ?? {}) as Record<string, string>);

        if (query) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined && value !== null) {
                    searchParams.set(key, String(value));
                }
            }
            const qs = searchParams.toString();
            if (qs) {
                url += `?${qs}`;
            }
        }

        return url;
    }

    /**
     * Extracts dynamic path parameters from a concrete URL pathname, given a route template.
     *
     * @example
     *   route.path = '/users/:id/posts/:postId'
     *   pathname   = '/users/42/posts/7'
     *   returns    → { id: '42', postId: '7' }
     *
     * @param routeOrPath - A Route object or a raw path pattern string.
     * @param pathname - The concrete URL pathname to extract params from.
     * @returns A `Record<string, string>` of extracted params, or `undefined` if the path does not match.
     */
    public static extractParamsFromPath(
        routeOrPath: Route | string,
        pathname: string
    ): Record<string, string> | undefined {
        const routePath = typeof routeOrPath === 'string' ? routeOrPath : routeOrPath.path;
        const normPathname = pathname.endsWith('/') && pathname.length > 1
            ? pathname.slice(0, -1)
            : pathname;
        const normRoute = routePath.endsWith('/') && routePath.length > 1
            ? routePath.slice(0, -1)
            : routePath;

        const routeSegments = normRoute.split('/').filter(Boolean);
        const pathSegments = normPathname.split('/').filter(Boolean);

        if (routeSegments.length !== pathSegments.length) return undefined;

        const params: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSeg = routeSegments[i];
            const pathSeg = pathSegments[i];

            if (!pathSeg) return undefined;

            if (routeSeg.startsWith(':')) {
                params[routeSeg.slice(1)] = pathSeg;
            } else if (routeSeg !== pathSeg) {
                return undefined; // static segment mismatch
            }
        }

        return params;
    }

    /**
     * Extracts query parameters from a URL search string or full URL into a key-value record.
     *
     * @param searchOrUrl - A search query string (e.g. `?tab=profile&page=2`) or a full URL.
     * @returns A `Record<string, string>` of parsed query parameters.
     */
    public static extractQueryParams(searchOrUrl: string): Record<string, string> {
        if (!searchOrUrl) return {};
        const queryIndex = searchOrUrl.indexOf('?');
        if (
            queryIndex === -1 &&
            (searchOrUrl.startsWith('/') ||
                searchOrUrl.startsWith('http://') ||
                searchOrUrl.startsWith('https://'))
        ) {
            return {};
        }
        const search =
            queryIndex !== -1
                ? searchOrUrl.slice(queryIndex + 1)
                : searchOrUrl.startsWith('?')
                ? searchOrUrl.slice(1)
                : searchOrUrl;

        if (!search) return {};
        const searchParams = new URLSearchParams(search);
        const result: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * Finds the route object in a RoutingMap that matches the given URL pathname.
     * Handles both static and dynamic path matching.
     *
     * @param routesMap - The routing map to search through.
     * @param pathname - The URL pathname string (e.g., `/users/123`).
     * @returns The matching `Route` object, or `undefined` if not found.
     */
    public static getRouteMatchByUrl<M extends RoutingMap>(
        routesMap: M,
        pathname: string
    ): M[keyof M] | undefined {
        const routes = Object.values(routesMap) as M[keyof M][];
        return routes.find((route) => this.isRouteMatchByUrl(route, pathname));
    }

    /**
     * Determines if a given route matches a URL pathname.
     * Supports both exact static matching and dynamic segment matching.
     *
     * @param route - The Route object to test.
     * @param pathname - The URL pathname to match.
     * @returns `true` if the route matches, `false` otherwise.
     */
    public static isRouteMatchByUrl(route: Route, pathname: string): boolean {
        // Strip query string if present
        const cleanPathname = pathname.split('?')[0];

        if (route.path === cleanPathname) return true;

        const extracted = this.extractParamsFromPath(route, cleanPathname);
        if (!extracted) return false;

        if (route.paramKeys && route.paramKeys.length > 0) {
            const hasAll = route.paramKeys.every((k) => k in extracted);
            if (!hasAll) return false;
            // Verify round-trip: reconstructing the path from extracted params should match
            try {
                return generatePath(route.path, extracted) === cleanPathname;
            } catch {
                return false;
            }
        }
        return false;
    }

    /**
     * Returns all routes in a RoutingMap as an array.
     *
     * @param routesMap - The routing map to convert.
     * @returns An array of all Route objects in the map.
     */
    public static getAllRoutesAsArray<M extends RoutingMap>(routesMap: M): M[keyof M][] {
        return Object.values(routesMap) as M[keyof M][];
    }

    /**
     * Checks whether a given pathname corresponds to a child of a given parent path.
     *
     * @param routesMap - The routing map to look up the current route.
     * @param currentPath - The pathname to check.
     * @param parentPath - The potential parent pathname.
     * @returns `true` if `currentPath` belongs to `parentPath`, `false` otherwise.
     */
    public static isChildOf(
        routesMap: RoutingMap,
        currentPath: string,
        parentPath: string
    ): boolean {
        const route = this.getRouteMatchByUrl(routesMap, currentPath);
        return route?.parent === parentPath;
    }
}
