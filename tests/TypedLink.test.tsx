import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes } from 'react-router-dom';
import { TypedLink, Link } from '../src/TypedLink';
import { TypedRoute, RouteComponent } from '../src/TypedRoute';
import { createTypedRouter } from '../src/createTypedRouter';
import { defineRoutes } from '../src/types';

interface UserQuery {
    tab?: 'profile' | 'settings';
    active?: boolean;
}

const routes = defineRoutes({
    HOME: { path: '/', name: 'Home' },
    ABOUT: { path: '/about', name: 'About' },
    USER_DETAIL: {
        path: '/users/:id',
        name: 'User Detail',
        queryType: {} as UserQuery,
    },
    USER_POST: {
        path: '/users/:userId/posts/:postId',
        name: 'User Post',
    },
} as const);

const router = createTypedRouter(routes);

function renderInRouter(ui: React.ReactElement) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('<TypedLink /> & <Link />', () => {
    it('renders a link to a static route using TypedLink', () => {
        renderInRouter(<TypedLink route={routes.HOME}>Home</TypedLink>);
        const link = screen.getByRole('link', { name: 'Home' });
        expect(link).toBeDefined();
        expect(link.getAttribute('href')).toBe('/');
    });

    it('renders a link to a static route using Link alias', () => {
        renderInRouter(<Link route={routes.HOME}>Home Link</Link>);
        const link = screen.getByRole('link', { name: 'Home Link' });
        expect(link.getAttribute('href')).toBe('/');
    });

    it('renders a link with a single dynamic param resolved', () => {
        renderInRouter(
            <TypedLink route={routes.USER_DETAIL} params={{ id: '42' }}>
                View User
            </TypedLink>
        );
        const link = screen.getByRole('link', { name: 'View User' });
        expect(link.getAttribute('href')).toBe('/users/42');
    });

    it('renders a link with dynamic params and query params resolved', () => {
        renderInRouter(
            <TypedLink
                route={routes.USER_DETAIL}
                params={{ id: '42' }}
                query={{ tab: 'settings', active: true }}
            >
                View User Settings
            </TypedLink>
        );
        const link = screen.getByRole('link', { name: 'View User Settings' });
        expect(link.getAttribute('href')).toBe('/users/42?tab=settings&active=true');
    });

    it('renders a link with multiple dynamic params resolved', () => {
        renderInRouter(
            <TypedLink route={routes.USER_POST} params={{ userId: '1', postId: '99' }}>
                View Post
            </TypedLink>
        );
        const link = screen.getByRole('link', { name: 'View Post' });
        expect(link.getAttribute('href')).toBe('/users/1/posts/99');
    });

    it('forwards additional link props (e.g. className)', () => {
        renderInRouter(
            <TypedLink route={routes.HOME} className="nav-link">
                Home
            </TypedLink>
        );
        const link = screen.getByRole('link', { name: 'Home' });
        expect(link.className).toBe('nav-link');
    });
});

describe('<TypedRoute /> & <RouteComponent />', () => {
    it('renders the component when matched in Routes (standalone TypedRoute)', () => {
        render(
            <MemoryRouter initialEntries={['/users/42']}>
                <Routes>
                    <TypedRoute
                        path={routes.USER_DETAIL.path}
                        element={<div data-testid="user-page">User Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('user-page').textContent).toBe('User Page');
    });

    it('renders the component when matched in Routes (standalone RouteComponent)', () => {
        render(
            <MemoryRouter initialEntries={['/users/99']}>
                <Routes>
                    <RouteComponent
                        path={routes.USER_DETAIL.path}
                        element={<div data-testid="user-page-rc">User Page RC</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('user-page-rc').textContent).toBe('User Page RC');
    });

    it('renders the component via router.TypedRoute and router.RouteComponent', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <router.TypedRoute
                        path={router.routes.HOME.path}
                        element={<div data-testid="home-page">Home Page</div>}
                    />
                    <router.RouteComponent
                        path={router.routes.ABOUT.path}
                        element={<div data-testid="about-page">About Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByTestId('home-page').textContent).toBe('Home Page');
    });
});
