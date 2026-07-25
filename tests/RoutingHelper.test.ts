import { describe, it, expect, vi } from 'vitest';
import { RouteHelper } from '../src/RoutingHelper';
import { defineRoutes } from '../src/types';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const routes = defineRoutes({
    HOME: { path: '/', name: 'Home' },
    ABOUT: { path: '/about', name: 'About' },
    USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
    USER_POST: {
        path: '/users/:userId/posts/:postId',
        name: 'User Post',
        paramKeys: ['userId', 'postId'] as const,
    },
    PROFILE: { path: '/profile', name: 'Profile', parent: '/' },
} as const);

// ---------------------------------------------------------------------------
// constructHref
// ---------------------------------------------------------------------------

describe('RouteHelper.constructHref', () => {
    it('returns the static path for routes without paramKeys', () => {
        expect(RouteHelper.constructHref(routes.HOME)).toBe('/');
        expect(RouteHelper.constructHref(routes.ABOUT)).toBe('/about');
    });

    it('resolves a single dynamic param', () => {
        expect(RouteHelper.constructHref(routes.USER_DETAIL, { id: '42' })).toBe('/users/42');
    });

    it('resolves multiple dynamic params', () => {
        expect(
            RouteHelper.constructHref(routes.USER_POST, { userId: '1', postId: '99' })
        ).toBe('/users/1/posts/99');
    });

    it('logs an error and returns the template path when required params are missing', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        // params is typed as optional at runtime to allow RouteHelper to guard gracefully
        const result = RouteHelper.constructHref(routes.USER_DETAIL, undefined as never);
        expect(result).toBe('/users/:id');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});

// ---------------------------------------------------------------------------
// extractParamsFromPath
// ---------------------------------------------------------------------------

describe('RouteHelper.extractParamsFromPath', () => {
    it('returns undefined for static routes that do not match', () => {
        expect(RouteHelper.extractParamsFromPath(routes.HOME, '/about')).toBeUndefined();
    });

    it('returns an empty object for a static exact match', () => {
        expect(RouteHelper.extractParamsFromPath(routes.ABOUT, '/about')).toEqual({});
    });

    it('extracts a single param', () => {
        expect(RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/42')).toEqual({
            id: '42',
        });
    });

    it('extracts multiple params', () => {
        expect(
            RouteHelper.extractParamsFromPath(routes.USER_POST, '/users/1/posts/99')
        ).toEqual({ userId: '1', postId: '99' });
    });

    it('returns undefined if segment count differs', () => {
        expect(
            RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/42/extra')
        ).toBeUndefined();
    });

    it('accepts a raw string path pattern', () => {
        expect(RouteHelper.extractParamsFromPath('/items/:id', '/items/7')).toEqual({ id: '7' });
    });
});

// ---------------------------------------------------------------------------
// isRouteMatchByUrl
// ---------------------------------------------------------------------------

describe('RouteHelper.isRouteMatchByUrl', () => {
    it('matches a static route exactly', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.ABOUT, '/about')).toBe(true);
    });

    it('does not match a static route with wrong path', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.ABOUT, '/home')).toBe(false);
    });

    it('matches a dynamic route with correct params', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.USER_DETAIL, '/users/42')).toBe(true);
    });

    it('does not match a dynamic route with wrong structure', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.USER_DETAIL, '/users')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// getRouteMatchByUrl
// ---------------------------------------------------------------------------

describe('RouteHelper.getRouteMatchByUrl', () => {
    it('finds a static route', () => {
        expect(RouteHelper.getRouteMatchByUrl(routes, '/about')).toBe(routes.ABOUT);
    });

    it('finds a dynamic route', () => {
        expect(RouteHelper.getRouteMatchByUrl(routes, '/users/42')).toBe(routes.USER_DETAIL);
    });

    it('returns undefined when no route matches', () => {
        expect(RouteHelper.getRouteMatchByUrl(routes, '/not-found')).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// getAllRoutesAsArray
// ---------------------------------------------------------------------------

describe('RouteHelper.getAllRoutesAsArray', () => {
    it('returns an array with all routes', () => {
        const arr = RouteHelper.getAllRoutesAsArray(routes);
        expect(arr).toHaveLength(Object.keys(routes).length);
        expect(arr).toContain(routes.HOME);
        expect(arr).toContain(routes.USER_DETAIL);
    });
});

// ---------------------------------------------------------------------------
// isChildOf
// ---------------------------------------------------------------------------

describe('RouteHelper.isChildOf', () => {
    it('returns true when a route is a child of the given parent', () => {
        expect(RouteHelper.isChildOf(routes, '/profile', '/')).toBe(true);
    });

    it('returns false when a route is not a child of the given parent', () => {
        expect(RouteHelper.isChildOf(routes, '/about', '/')).toBe(false);
    });
});
