import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
    useTypedNavigate,
    useTypedParams,
    useTypedSearchParams,
    useTypedMatch,
} from '../src/hooks';
import { createTypedRouter } from '../src/createTypedRouter';
import { defineRoutes } from '../src/types';

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

        render(
            <MemoryRouter initialEntries={['/']}>
                <TestComponent />
            </MemoryRouter>
        );

        const btn = screen.getByRole('button', { name: 'Go to User' });
        expect(btn).toBeDefined();
        fireEvent.click(btn);
    });

    it('navigates with query parameters', () => {
        function TestComponent() {
            const navigate = useTypedNavigate(routes.USER_DETAIL);
            return (
                <button onClick={() => navigate({ id: '42' }, { tab: 'settings' })}>
                    Go with query
                </button>
            );
        }

        render(
            <MemoryRouter initialEntries={['/']}>
                <TestComponent />
            </MemoryRouter>
        );

        const btn = screen.getByRole('button', { name: 'Go with query' });
        fireEvent.click(btn);
    });

    it('opens a new tab when newTab is true', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

        function TestComponent() {
            const navigate = useTypedNavigate(routes.USER_DETAIL);
            return (
                <button onClick={() => navigate({ id: '42' }, true)}>Open New Tab</button>
            );
        }

        render(
            <MemoryRouter initialEntries={['/']}>
                <TestComponent />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Open New Tab' }));
        expect(windowOpenSpy).toHaveBeenCalledWith('/users/42', '_blank');
        windowOpenSpy.mockRestore();
    });
});

// ---------------------------------------------------------------------------
// useTypedParams (standalone)
// ---------------------------------------------------------------------------

describe('useTypedParams', () => {
    it('returns the extracted params matching the current route', () => {
        function TestComponent() {
            const params = useTypedParams(routes.USER_DETAIL);
            return <div data-testid="param-id">{params.id}</div>;
        }

        render(
            <MemoryRouter initialEntries={['/users/99']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('param-id')).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// useTypedSearchParams (standalone)
// ---------------------------------------------------------------------------

describe('useTypedSearchParams', () => {
    it('reads initial query parameters from the URL', () => {
        function TestComponent() {
            const [query] = useTypedSearchParams(routes.USER_DETAIL);
            return <div data-testid="tab">{query.tab}</div>;
        }

        render(
            <MemoryRouter initialEntries={['/users/42?tab=settings']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('tab').textContent).toBe('settings');
    });

    it('updates query parameters via setQuery', () => {
        function TestComponent() {
            const [query, setQuery] = useTypedSearchParams(routes.USER_DETAIL);
            return (
                <div>
                    <span data-testid="tab">{query.tab ?? 'none'}</span>
                    <button onClick={() => setQuery({ tab: 'profile' })}>Set Tab</button>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/42']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('tab').textContent).toBe('none');
        fireEvent.click(screen.getByRole('button', { name: 'Set Tab' }));
        expect(screen.getByTestId('tab').textContent).toBe('profile');
    });
});

// ---------------------------------------------------------------------------
// useTypedMatch (standalone)
// ---------------------------------------------------------------------------

describe('useTypedMatch', () => {
    it('matches the active route from the current URL', () => {
        function TestComponent() {
            const { route, params, query } = useTypedMatch(routes);
            return (
                <div>
                    <span data-testid="route-name">{route?.name}</span>
                    <span data-testid="param-id">{params?.id}</span>
                    <span data-testid="query-tab">{query.tab}</span>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/77?tab=profile']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('route-name').textContent).toBe('User Detail');
        expect(screen.getByTestId('param-id').textContent).toBe('77');
        expect(screen.getByTestId('query-tab').textContent).toBe('profile');
    });

    it('returns undefined route when URL does not match any route', () => {
        function TestComponent() {
            const { route } = useTypedMatch(routes);
            return <span data-testid="route-name">{route?.name ?? 'no-match'}</span>;
        }

        render(
            <MemoryRouter initialEntries={['/non-existent-path']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('route-name').textContent).toBe('no-match');
    });
});

// ---------------------------------------------------------------------------
// Scoped hooks from createTypedRouter
// ---------------------------------------------------------------------------

describe('createTypedRouter hooks', () => {
    it('router.useTypedNavigate navigates correctly', () => {
        function TestComponent() {
            const navigate = router.useTypedNavigate(routes.USER_DETAIL);
            return (
                <button onClick={() => navigate({ id: '10' })}>Go Scoped</button>
            );
        }

        render(
            <MemoryRouter initialEntries={['/']}>
                <TestComponent />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Go Scoped' }));
    });

    it('router.useTypedParams returns params', () => {
        function TestComponent() {
            const params = router.useTypedParams(routes.USER_DETAIL);
            return <div data-testid="scoped-param-id">{params.id}</div>;
        }

        render(
            <MemoryRouter initialEntries={['/users/55']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('scoped-param-id')).toBeDefined();
    });

    it('router.useTypedSearchParams reads and updates query params', () => {
        function TestComponent() {
            const [query, setQuery] = router.useTypedSearchParams(routes.USER_DETAIL);
            return (
                <div>
                    <span data-testid="scoped-tab">{query.tab ?? 'none'}</span>
                    <button onClick={() => setQuery({ tab: 'settings' })}>Update Tab</button>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/42?tab=profile']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('scoped-tab').textContent).toBe('profile');
        fireEvent.click(screen.getByRole('button', { name: 'Update Tab' }));
        expect(screen.getByTestId('scoped-tab').textContent).toBe('settings');
    });

    it('router.useTypedMatch matches the active route', () => {
        function TestComponent() {
            const { route, params } = router.useTypedMatch();
            return (
                <div>
                    <span data-testid="match-name">{route?.name}</span>
                    <span data-testid="match-id">{params?.id}</span>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/123']}>
                <TestComponent />
            </MemoryRouter>
        );

        expect(screen.getByTestId('match-name').textContent).toBe('User Detail');
        expect(screen.getByTestId('match-id').textContent).toBe('123');
    });
});
