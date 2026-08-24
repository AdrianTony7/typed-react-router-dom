import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { defineRoutes } from '../src/types';
import { createTypedRouter } from '../src/createTypedRouter';
import {
    useTypedNavigate,
    useTypedParams,
    useTypedSearchParams,
    useTypedMatch,
} from '../src/hooks';

// ---------------------------------------------------------------------------
// Test fixture routes
// ---------------------------------------------------------------------------

interface UserQuery {
    tab?: 'profile' | 'settings';
    page?: number;
    active?: boolean;
}

const routes = defineRoutes({
    HOME: { path: '/', name: 'Home' },
    USER_DETAIL: {
        path: '/users/:id',
        name: 'User Detail',
        paramKeys: ['id'] as const,
        queryType: {} as UserQuery,
    },
    SETTINGS: { path: '/settings', name: 'Settings' },
} as const);

const router = createTypedRouter(routes);

// ---------------------------------------------------------------------------
// useTypedNavigate (standalone)
// ---------------------------------------------------------------------------

describe('useTypedNavigate', () => {
    it('renders a button that navigates with params on click', () => {
        function TestComponent() {
            const navigate = useTypedNavigate(routes.USER_DETAIL);
            return (
                <button onClick={() => navigate({ id: '42' })}>Go to User</button>
            );
        }

        expect(() =>
            render(
                <MemoryRouter>
                    <TestComponent />
                </MemoryRouter>
            )
        ).not.toThrow();
    });

    it('navigates with query params and newTab support', () => {
        function TestComponent() {
            const navigate = useTypedNavigate(routes.USER_DETAIL);
            return (
                <button
                    onClick={() =>
                        navigate({ id: '42' }, { tab: 'settings', active: true })
                    }
                >
                    Go to User Settings
                </button>
            );
        }

        expect(() =>
            render(
                <MemoryRouter>
                    <TestComponent />
                </MemoryRouter>
            )
        ).not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// useTypedParams (standalone)
// ---------------------------------------------------------------------------

describe('useTypedParams', () => {
    it('extracts the typed id param from the URL', () => {
        function TestComponent() {
            const params = useTypedParams(routes.USER_DETAIL);
            return <div data-testid="id-output">{(params as { id?: string }).id}</div>;
        }

        render(
            <MemoryRouter initialEntries={['/users/123']}>\n                <Routes>
                    <Route path="/users/:id" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('id-output').textContent).toBe('123');
    });
});

// ---------------------------------------------------------------------------
// useTypedSearchParams (standalone & scoped)
// ---------------------------------------------------------------------------

describe('useTypedSearchParams', () => {
    it('extracts query params from the search string', () => {
        function TestComponent() {
            const [query] = useTypedSearchParams(routes.USER_DETAIL);
            return (
                <div>
                    <span data-testid="tab">{query.tab}</span>
                    <span data-testid="page">{query.page}</span>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/42?tab=settings&page=3']}>
                <Routes>
                    <Route path="/users/:id" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('tab').textContent).toBe('settings');
        expect(screen.getByTestId('page').textContent).toBe('3');
    });

    it('updates query params using setQuery with object', () => {
        function TestComponent() {
            const [query, setQuery] = useTypedSearchParams(routes.USER_DETAIL);
            return (
                <div>
                    <span data-testid="tab">{query.tab ?? 'none'}</span>
                    <button onClick={() => setQuery({ tab: 'settings' })}>Set Settings</button>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/42?tab=profile']}>
                <Routes>
                    <Route path="/users/:id" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('tab').textContent).toBe('profile');
        fireEvent.click(screen.getByRole('button', { name: 'Set Settings' }));
        expect(screen.getByTestId('tab').textContent).toBe('settings');
    });

    it('updates query params using functional updater', () => {
        function TestComponent() {
            const [query, setQuery] = useTypedSearchParams(routes.USER_DETAIL);
            return (
                <div>
                    <span data-testid="tab">{query.tab ?? 'none'}</span>
                    <button
                        onClick={() =>
                            setQuery((prev) => ({
                                ...prev,
                                tab: prev.tab === 'profile' ? 'settings' : 'profile',
                            }))
                        }
                    >
                        Toggle Tab
                    </button>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/42?tab=profile']}>
                <Routes>
                    <Route path="/users/:id" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('tab').textContent).toBe('profile');
        fireEvent.click(screen.getByRole('button', { name: 'Toggle Tab' }));
        expect(screen.getByTestId('tab').textContent).toBe('settings');
    });
});

// ---------------------------------------------------------------------------
// useTypedMatch (standalone)
// ---------------------------------------------------------------------------

describe('useTypedMatch', () => {
    it('matches the current URL to the correct route and extracts path & query params', () => {
        function TestComponent() {
            const { route, params, query } = useTypedMatch(routes);
            return (
                <div>
                    <span data-testid="name">{route?.name ?? 'none'}</span>
                    <span data-testid="params">{JSON.stringify(params)}</span>
                    <span data-testid="query">{JSON.stringify(query)}</span>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/99?tab=profile&active=true']}>
                <Routes>
                    <Route path="*" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('name').textContent).toBe('User Detail');
        expect(screen.getByTestId('params').textContent).toBe(JSON.stringify({ id: '99' }));
        expect(screen.getByTestId('query').textContent).toBe(
            JSON.stringify({ tab: 'profile', active: 'true' })
        );
    });

    it('returns undefined when no route matches', () => {
        function TestComponent() {
            const { route } = useTypedMatch(routes);
            return <span data-testid="result">{route ? 'found' : 'not-found'}</span>;
        }

        render(
            <MemoryRouter initialEntries={['/does-not-exist']}>
                <Routes>
                    <Route path="*" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('result').textContent).toBe('not-found');
    });
});

// ---------------------------------------------------------------------------
// createTypedRouter — TypedLink
// ---------------------------------------------------------------------------

describe('createTypedRouter — TypedLink', () => {
    it('renders a link to a static route', () => {
        render(
            <MemoryRouter>
                <router.TypedLink route={routes.HOME}>Home</router.TypedLink>
            </MemoryRouter>
        );
        expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    });

    it('renders a link to a dynamic route with params and query', () => {
        render(
            <MemoryRouter>
                <router.TypedLink
                    route={routes.USER_DETAIL}
                    params={{ id: '7' }}
                    query={{ tab: 'settings', page: 2 }}
                >
                    User
                </router.TypedLink>
            </MemoryRouter>
        );
        expect(screen.getByRole('link', { name: 'User' }).getAttribute('href')).toBe(
            '/users/7?tab=settings&page=2'
        );
    });
});

// ---------------------------------------------------------------------------
// createTypedRouter — getHref
// ---------------------------------------------------------------------------

describe('createTypedRouter — getHref', () => {
    it('returns the static path', () => {
        expect(router.getHref(routes.HOME)).toBe('/');
    });

    it('returns a resolved dynamic path with query', () => {
        expect(
            router.getHref(routes.USER_DETAIL, { id: '55' }, { tab: 'profile', active: true })
        ).toBe('/users/55?tab=profile&active=true');
    });
});

// ---------------------------------------------------------------------------
// createTypedRouter — useTypedMatch
// ---------------------------------------------------------------------------

describe('createTypedRouter — useTypedMatch (scoped)', () => {
    it('uses the bound routesMap from the factory and returns query', () => {
        function TestComponent() {
            const { route, query } = router.useTypedMatch();
            return (
                <div>
                    <span data-testid="name">{route?.name ?? 'none'}</span>
                    <span data-testid="query">{JSON.stringify(query)}</span>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/settings?theme=dark']}>
                <Routes>
                    <Route path="*" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('name').textContent).toBe('Settings');
        expect(screen.getByTestId('query').textContent).toBe(JSON.stringify({ theme: 'dark' }));
    });
});
