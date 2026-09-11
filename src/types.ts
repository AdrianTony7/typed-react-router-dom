import type { ComponentType } from "react";

/**
 * Utility type to extract dynamic `:param` segments from a path string literal.
 * E.g., `'/users/:id/posts/:postId'` -> `'id' | 'postId'`
 */
export type ExtractParamKeys<Path extends string> =
    Path extends `${string}:${infer Param}/${infer Rest}`
        ? Param | ExtractParamKeys<`/${Rest}`>
        : Path extends `${string}:${infer Param}`
            ? Param
            : never;

/**
 * Interface representing a single, type-safe route.
 * Each route has a unique path, optional parent route, display title, icon, and optional query parameters type carrier.
 */
export interface Route<
    TPath extends string = string,
    TQuery extends Record<string, any> = Record<string, any>
> {
    /** The path string or pattern (e.g., '/users/:id'). */
    path: TPath;
    /** Human-readable display name for the route. */
    name?: string;
    /** Optional path of the parent route, used for hierarchical navigation or breadcrumbs. */
    parent?: string;
    /** Optional icon component (e.g., from Lucide or any React icon library). */
    icon?: ComponentType<any>;
    /** Optional compile-time type carrier for typed query parameters. */
    queryType?: TQuery;
}

/**
 * Interface defining the structure of a routing configuration dictionary.
 * It maps route identifiers (keys) to their respective Route objects.\
 */
export interface RoutingMap {
    [key: string]: Route;
}

/**
 * Utility type to extract required path parameters from a Route definition.
 * - Automatically infers `:param` tokens from `route.path`.
 * - If no dynamic parameters exist, evaluates to `undefined`.
 */
export type RouteParams<R extends Route> = [ExtractParamKeys<R['path']>] extends [never]
    ? undefined
    : { [K in ExtractParamKeys<R['path']>]: string };

/**
 * Utility type to extract query parameters from a Route definition.
 * - If `queryType` is explicitly provided, it extracts that type.
 * - Otherwise, it evaluates to `Record<string, any>`.
 */
export type RouteQueryParams<R extends Route> = R extends { queryType: infer Q }
    ? Q
    : Record<string, any>;

/**
 * Helper type for arguments requiring dynamic parameters if defined on the route.
 * - If `RouteParams<R>` is `undefined`, `params` is optional/undefined.
 * - If `RouteParams<R>` is an object, `params` is required.
 */
export type DynamicRouteParam<R extends Route> = RouteParams<R> extends undefined
    ? { params?: undefined }
    : { params: RouteParams<R> };

/**
 * Combined properties for type-safe route navigation.
 */
export type TypedNavigationProps<R extends Route> = {
    route: R;
    query?: Partial<RouteQueryParams<R>>;
} & DynamicRouteParam<R>;

/**
 * Navigation options including opening links in a new tab.
 */
export type TypedNavigationPropsWithNewTab<R extends Route> = TypedNavigationProps<R> & {
    newTab?: boolean;
};

/**
 * Helper utility to define routes with literal type preservation and type safety.
 *
 * @example
 * ```ts
 * export const routes = defineRoutes({
 *   HOME: { path: '/', name: 'Home' },
 *   USER_DETAIL: {
 *     path: '/users/:id',
 *     name: 'User Detail',
 *     queryType: {} as { tab?: 'profile' | 'settings'; page?: number }
 *   }
 * } as const);
 * ```
 */
export function defineRoutes<const T extends RoutingMap>(routes: T): T {
    return routes;
}
