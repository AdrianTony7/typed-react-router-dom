import { generatePath } from 'react-router-dom';
import type { Route, RoutingMap, RouteParams, RouteQueryParams } from './types';

/**
 * Utility class providing static helper methods for working with typed Route definitions.
 * All methods are static and operate purely on the provided route definitions.
 */
export class RouteHelper {
    /**
     * Extracts expected parameter key names from a route path string.
     * E.g. `'/users/:id/posts/:postId'` -> `['id', 'postId']`.
     *
     * @param path - The route path template.
     * @returns An array of parameter key strings.
     */
    public static extractParamKeysFromPath(path: string): string[] {
        const segments = path.split('/').filter(Boolean);
        const keys: string[] = [];
        for (const seg of segments) {
            if (seg.startsWith(':')) {
                // Handle possible optional params like :id? or wildcards if any
                const key = seg.slice(1).replace(/\?$/, '');
                if (key) {
                    keys.push(key);
                }
            }
        }
        return keys;
    }

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
        const expectedKeys = this.extractParamKeysFromPath(route.path);

        if (expectedKeys.length > 0 && !params) {
            console.error(
                `[typed-react-router-dom] Route '${route.name ?? route.path}' requires parameters: ${expectedKeys.join(', ')}, but none were provided.`
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
     * Extracts query parameters from a search string or full URL.
     * Returns a simple key-value record of string values.
     *
     * @param searchOrUrl - A URL search string (e.g. `'?tab=profile&page=1'`) or a full URL path.
     * @returns A record containing parsed query parameters.
     */
    public static extractQueryParams(searchOrUrl: string): Record<string, string> {
        if (!searchOrUrl) return {};
        const queryString = searchOrUrl.includes('?')
            ? searchOrUrl.slice(searchOrUrl.indexOf('?') + 1)
            : searchOrUrl.startsWith('?')
                ? searchOrUrl.slice(1)
                : '';
        if (!queryString) return {};

        const searchParams = new URLSearchParams(queryString);
        const result: Record<string, string> = {};
        searchParams.forEach((val, key) => {
            result[key] = val;
        });
        return result;
    }

    /**
     * Extracts dynamic parameter values from a URL pathname given a Route definition or path template.
     *
     * @param routeOrPath - A Route object or a path string pattern with `:param` placeholders.
     * @param pathname - The actual pathname to extract parameters from.
     * @returns An object of key-value pairs representing extracted params, or `undefined` if the path doesn't match.
     *
     * @example
     * ```ts
     * RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/123'); // { id: '123' }
     * ```
     */
    public static extractParamsFromPath(
        routeOrPath: Route | string,
        pathname: string
    ): Record<string, string> | undefined {
        const routePath = typeof routeOrPath === 'string' ? routeOrPath : routeOrPath.path;
        const routeSegments = routePath.split('/').filter(Boolean);
        const pathSegments = pathname.split('/').filter(Boolean);

        if (routeSegments.length !== pathSegments.length) {
            return undefined;
        }

        const params: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSeg = routeSegments[i];
            const pathSeg = pathSegments[i];

            if (!pathSeg) return undefined;

            if (routeSeg.startsWith(':')) {
                const key = routeSeg.slice(1).replace(/\?$/, '');
                params[key] = pathSeg;
            } else if (routeSeg !== pathSeg) {
                return undefined; // static segment mismatch
            }
        }

        return params;
    }

    /**
     * Finds the Route object in a `RoutingMap` that matches a given URL pathname.
     * Checks static routes first (exact match), then dynamic routes.
     *
     * @param routesMap - The map of routes to search within.
     * @param pathname - The URL pathname to match against.
     * @returns The matching Route object, or `undefined` if no match is found.
     *
     * @example
     * ```ts
     * const route = RouteHelper.getRouteMatchByUrl(routes, '/users/123');
     * // route === routes.USER_DETAIL
     * ```
     */
    public static getRouteMatchByUrl<M extends RoutingMap>(
        routesMap: M,
        pathname: string
    ): M[keyof M] | undefined {
        // Strip query string if present
        const cleanPathname = pathname.split('?')[0];

        // 1. Check exact static match first
        for (const key of Object.keys(routesMap)) {
            const route = routesMap[key];
            if (route && route.path === cleanPathname) {
                return route as M[keyof M];
            }
        }

        // 2. Check dynamic matches
        for (const key of Object.keys(routesMap)) {
            const route = routesMap[key];
            if (route && this.isRouteMatchByUrl(route, cleanPathname)) {
                return route as M[keyof M];
            }
        }

        return undefined;
    }

    /**
     * Checks whether a given URL pathname matches a Route definition.
     * Supports both static and dynamic routes.
     *
     * @param route - The Route object to check against.
     * @param pathname - The URL pathname to match.
     * @returns `true` if the route matches, `false` otherwise.\
     */
    public static isRouteMatchByUrl(route: Route, pathname: string): boolean {
        // Strip query string if present
        const cleanPathname = pathname.split('?')[0];

        if (route.path === cleanPathname) return true;

        const extracted = this.extractParamsFromPath(route, cleanPathname);
        if (!extracted) return false;

        const expectedKeys = this.extractParamKeysFromPath(route.path);

        if (expectedKeys.length > 0) {
            const hasAll = expectedKeys.every((k) => k in extracted);
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
     * Uses the `parent` property defined on Route objects in the map.
     *
     * @param routesMap - The map of routes to check within.
     * @param childPathname - The pathname of the suspected child.
     * @param parentPathname - The pathname of the parent.
     * @returns `true` if the route corresponding to `childPathname` has its `parent` set to `parentPathname`.
     */
    public static isChildOf(
        routesMap: RoutingMap,
        childPathname: string,
        parentPathname: string
    ): boolean {
        const route = this.getRouteMatchByUrl(routesMap, childPathname);
        return route?.parent === parentPathname;
    }
}
