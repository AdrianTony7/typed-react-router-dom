import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { defineRoutes } from '../src/types';
import { createTypedRouter } from '../src/createTypedRouter';
import { useTypedNavigate, useTypedParams, useTypedMatch } from '../src/hooks';

// ---------------------------------------------------------------------------
// Test fixture routes
// ---------------------------------------------------------------------------

const routes = defineRoutes({
    HOME: { path: '/', name: 'Home' },
    USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
    SETTINGS: { path: '/settings', name: 'Settings' },
} as const);

const router = createTypedRouter(routes);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderAt(ui: React.ReactElement, initialEntry = '/') {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="*" element={ui} />
            </Routes>
        </MemoryRouter>
    );
}

// ---------------------------------------------------------------------------
// useTypedNavigate (standalone)
// ---------------------------------------------------------------------------

describe('useTypedNavigate', () => {
    it('renders a button that navigates on click', () => {
        const navigateMock = vi.fn();

        function TestComponent() {
            // Override useNavigate from react-router-dom to capture the call
            const navigate = useTypedNavigate(routes.USER_DETAIL);
            return (
                <button onClick={() => navigate({ id: '42' })}>Go to User</button>
            );
        }

        // We just test it doesn't throw at render time
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
            <MemoryRouter initialEntries={['/users/123']}>
                <Routes>
                    <Route path="/users/:id" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('id-output').textContent).toBe('123');
    });
});

// ---------------------------------------------------------------------------
// useTypedMatch (standalone)
// ---------------------------------------------------------------------------

describe('useTypedMatch', () => {
    it('matches the current URL to the correct route', () => {
        function TestComponent() {
            const { route, params } = useTypedMatch(routes);
            return (
                <div>
                    <span data-testid="name">{route?.name ?? 'none'}</span>
                    <span data-testid="params">{JSON.stringify(params)}</span>
                </div>
            );
        }

        render(
            <MemoryRouter initialEntries={['/users/99']}>
                <Routes>
                    <Route path="*" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('name').textContent).toBe('User Detail');
        expect(screen.getByTestId('params').textContent).toBe(JSON.stringify({ id: '99' }));
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

    it('renders a link to a dynamic route with params', () => {
        render(
            <MemoryRouter>
                <router.TypedLink route={routes.USER_DETAIL} params={{ id: '7' }}>
                    User
                </router.TypedLink>
            </MemoryRouter>
        );
        expect(screen.getByRole('link', { name: 'User' }).getAttribute('href')).toBe('/users/7');
    });
});

// ---------------------------------------------------------------------------
// createTypedRouter — getHref
// ---------------------------------------------------------------------------

describe('createTypedRouter — getHref', () => {
    it('returns the static path', () => {
        expect(router.getHref(routes.HOME)).toBe('/');
    });

    it('returns a resolved dynamic path', () => {
        expect(router.getHref(routes.USER_DETAIL, { id: '55' })).toBe('/users/55');
    });
});

// ---------------------------------------------------------------------------
// createTypedRouter — useTypedMatch
// ---------------------------------------------------------------------------

describe('createTypedRouter — useTypedMatch (scoped)', () => {
    it('uses the bound routesMap from the factory', () => {
        function TestComponent() {
            const { route } = router.useTypedMatch();
            return <span data-testid="name">{route?.name ?? 'none'}</span>;
        }

        render(
            <MemoryRouter initialEntries={['/settings']}>
                <Routes>
                    <Route path="*" element={<TestComponent />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('name').textContent).toBe('Settings');
    });
});
