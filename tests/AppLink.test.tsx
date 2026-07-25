import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLink } from '../src/AppLink';
import { defineRoutes } from '../src/types';

const routes = defineRoutes({
    HOME: { path: '/', name: 'Home' },
    USER_DETAIL: { path: '/users/:id', name: 'User Detail', paramKeys: ['id'] as const },
    USER_POST: {
        path: '/users/:userId/posts/:postId',
        name: 'User Post',
        paramKeys: ['userId', 'postId'] as const,
    },
} as const);

function renderInRouter(ui: React.ReactElement) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('<AppLink />', () => {
    it('renders a link to a static route', () => {
        renderInRouter(<AppLink route={routes.HOME}>Home</AppLink>);
        const link = screen.getByRole('link', { name: 'Home' });
        expect(link).toBeDefined();
        expect(link.getAttribute('href')).toBe('/');
    });

    it('renders a link with a single dynamic param resolved', () => {
        renderInRouter(
            <AppLink route={routes.USER_DETAIL} params={{ id: '42' }}>
                View User
            </AppLink>
        );
        const link = screen.getByRole('link', { name: 'View User' });
        expect(link.getAttribute('href')).toBe('/users/42');
    });

    it('renders a link with multiple dynamic params resolved', () => {
        renderInRouter(
            <AppLink route={routes.USER_POST} params={{ userId: '1', postId: '99' }}>
                View Post
            </AppLink>
        );
        const link = screen.getByRole('link', { name: 'View Post' });
        expect(link.getAttribute('href')).toBe('/users/1/posts/99');
    });

    it('forwards additional link props (e.g. className)', () => {
        renderInRouter(
            <AppLink route={routes.HOME} className="nav-link">
                Home
            </AppLink>
        );
        const link = screen.getByRole('link', { name: 'Home' });
        expect(link.className).toBe('nav-link');
    });
});
