import { describe, it, expect, vi } from 'vitest';
import { RouteHelper } from '../src/RoutingHelper';
import { defineRoutes } from '../src/types';
import { sampleRoutes } from './fixtures/sampleRoutes';

// ---------------------------------------------------------------------------
// Test routes fixtures
// ---------------------------------------------------------------------------

const routes = defineRoutes({
    HOME: { path: '/', name: 'Home' },
    ABOUT: { path: '/about', name: 'About' },
    USER_DETAIL: {
        path: '/users/:id',
        name: 'User Detail',
        queryType: {} as { tab?: 'profile' | 'settings'; page?: number; active?: boolean },
    },
    USER_POST: {
        path: '/users/:userId/posts/:postId',
        name: 'User Post',
    },
    CHILD_PAGE: {
        path: '/about/team',
        name: 'Team',
        parent: '/about',
    },
} as const);

// ---------------------------------------------------------------------------
// extractParamKeysFromPath
// ---------------------------------------------------------------------------

describe('RouteHelper.extractParamKeysFromPath', () => {
    it('returns an empty array for static paths', () => {
        expect(RouteHelper.extractParamKeysFromPath('/')).toEqual([]);
        expect(RouteHelper.extractParamKeysFromPath('/about/team')).toEqual([]);
    });

    it('extracts a single parameter key from path', () => {
        expect(RouteHelper.extractParamKeysFromPath('/users/:id')).toEqual(['id']);
    });

    it('extracts multiple parameter keys from path', () => {
        expect(RouteHelper.extractParamKeysFromPath('/users/:userId/posts/:postId')).toEqual([
            'userId',
            'postId',
        ]);
    });
});

// ---------------------------------------------------------------------------
// constructHref
// ---------------------------------------------------------------------------

describe('RouteHelper.constructHref', () => {
    it('returns the static path for static routes', () => {
        expect(RouteHelper.constructHref(routes.HOME)).toBe('/');
        expect(RouteHelper.constructHref(routes.ABOUT)).toBe('/about');
    });

    it('resolves a single dynamic param (auto-inferred)', () => {
        expect(RouteHelper.constructHref(routes.USER_DETAIL, { id: '42' })).toBe('/users/42');
    });

    it('resolves multiple dynamic params (auto-inferred)', () => {
        expect(
            RouteHelper.constructHref(routes.USER_POST, { userId: '1', postId: '99' })
        ).toBe('/users/1/posts/99');
    });

    it('appends query parameters correctly with string, number, and boolean values', () => {
        expect(
            RouteHelper.constructHref(
                routes.USER_DETAIL,
                { id: '42' },
                { tab: 'profile', page: 2, active: true }
            )
        ).toBe('/users/42?tab=profile&page=2&active=true');
    });

    it('omits undefined and null query parameter values', () => {
        expect(
            RouteHelper.constructHref(
                routes.USER_DETAIL,
                { id: '42' },
                { tab: 'settings', page: undefined }
            )
        ).toBe('/users/42?tab=settings');
    });

    it('logs an error and returns the template path if required params are missing', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const href = RouteHelper.constructHref(routes.USER_DETAIL);
        expect(spy).toHaveBeenCalled();
        expect(href).toBe(routes.USER_DETAIL.path);
        spy.mockRestore();
    });
});

// ---------------------------------------------------------------------------
// extractQueryParams
// ---------------------------------------------------------------------------

describe('RouteHelper.extractQueryParams', () => {
    it('parses empty query string to empty object', () => {
        expect(RouteHelper.extractQueryParams('')).toEqual({});
        expect(RouteHelper.extractQueryParams('?')).toEqual({});
    });

    it('parses search string with question mark', () => {
        expect(RouteHelper.extractQueryParams('?tab=settings&page=2')).toEqual({
            tab: 'settings',
            page: '2',
        });
    });

    it('parses full URL search string', () => {
        expect(RouteHelper.extractQueryParams('/users/42?tab=profile&active=true')).toEqual({
            tab: 'profile',
            active: 'true',
        });
    });
});

// ---------------------------------------------------------------------------
// extractParamsFromPath
// ---------------------------------------------------------------------------

describe('RouteHelper.extractParamsFromPath', () => {
    it('extracts a single parameter correctly', () => {
        const result = RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/42');
        expect(result).toEqual({ id: '42' });
    });

    it('extracts multiple parameters correctly', () => {
        const result = RouteHelper.extractParamsFromPath(
            routes.USER_POST,
            '/users/alice/posts/101'
        );
        expect(result).toEqual({ userId: 'alice', postId: '101' });
    });

    it('returns undefined if segment counts do not match', () => {
        const result = RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/users/42/extra');
        expect(result).toBeUndefined();
    });

    it('returns undefined if static segments do not match', () => {
        const result = RouteHelper.extractParamsFromPath(routes.USER_DETAIL, '/accounts/42');
        expect(result).toBeUndefined();
    });

    it('works when passed a string path instead of a Route object', () => {
        const result = RouteHelper.extractParamsFromPath('/items/:itemId', '/items/item-123');
        expect(result).toEqual({ itemId: 'item-123' });
    });
});

// ---------------------------------------------------------------------------
// getRouteMatchByUrl
// ---------------------------------------------------------------------------

describe('RouteHelper.getRouteMatchByUrl', () => {
    it('matches an exact static route', () => {
        const match = RouteHelper.getRouteMatchByUrl(routes, '/');
        expect(match).toBe(routes.HOME);
    });

    it('matches another static route', () => {
        const match = RouteHelper.getRouteMatchByUrl(routes, '/about');
        expect(match).toBe(routes.ABOUT);
    });

    it('matches a dynamic route and resolves to correct Route object', () => {
        const match = RouteHelper.getRouteMatchByUrl(routes, '/users/99');
        expect(match).toBe(routes.USER_DETAIL);
    });

    it('matches dynamic route even if query string is present in pathname', () => {
        const match = RouteHelper.getRouteMatchByUrl(routes, '/users/99?tab=settings');
        expect(match).toBe(routes.USER_DETAIL);
    });

    it('returns undefined when no route matches', () => {
        const match = RouteHelper.getRouteMatchByUrl(routes, '/not/a/real/path');
        expect(match).toBeUndefined();
    });

    it('correctly resolves real fixture routes', () => {
        const match = RouteHelper.getRouteMatchByUrl(sampleRoutes, '/services/branding');
        expect(match).toBe(sampleRoutes.VIEW_SERVICE);
    });
});

// ---------------------------------------------------------------------------
// isRouteMatchByUrl
// ---------------------------------------------------------------------------

describe('RouteHelper.isRouteMatchByUrl', () => {
    it('returns true for an exact static match', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.HOME, '/')).toBe(true);
        expect(RouteHelper.isRouteMatchByUrl(routes.ABOUT, '/about')).toBe(true);
    });

    it('returns false for mismatched static paths', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.HOME, '/dashboard')).toBe(false);
    });

    it('returns true for matching dynamic route', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.USER_DETAIL, '/users/42')).toBe(true);
    });

    it('returns true when query params are present in pathname', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.USER_DETAIL, '/users/42?page=1')).toBe(true);
    });

    it('returns false for non-matching dynamic path segments', () => {
        expect(RouteHelper.isRouteMatchByUrl(routes.USER_DETAIL, '/users/42/settings')).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// getAllRoutesAsArray
// ---------------------------------------------------------------------------

describe('RouteHelper.getAllRoutesAsArray', () => {
    it('returns an array containing all defined routes', () => {
        const arr = RouteHelper.getAllRoutesAsArray(routes);
        expect(arr).toHaveLength(5);
        expect(arr).toContain(routes.HOME);
        expect(arr).toContain(routes.USER_DETAIL);
    });
});

// ---------------------------------------------------------------------------
// isChildOf
// ---------------------------------------------------------------------------

describe('RouteHelper.isChildOf', () => {
    it('returns true when child path is configured with matching parent', () => {
        expect(RouteHelper.isChildOf(routes, '/about/team', '/about')).toBe(true);
    });

    it('returns false when parent does not match', () => {
        expect(RouteHelper.isChildOf(routes, '/about/team', '/')).toBe(false);
    });

    it('returns false when path has no parent configured', () => {
        expect(RouteHelper.isChildOf(routes, '/', '/about')).toBe(false);
    });
});
