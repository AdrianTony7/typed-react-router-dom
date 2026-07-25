import { BarChartIcon, BookOpenIcon, CreditCardIcon, FlaskConicalIcon, HomeIcon, KeyRoundIcon, LayoutGridIcon, LogInIcon, MessageSquareIcon, ShieldCheckIcon, StarIcon, TestTubeIcon, UserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import type { RoutingMap } from "../../src/types";

/**
 * Sample route definitions used for testing and validation.
 */
export const sampleRoutes = {
    INDEX: { path: '/', name: 'Homepage', icon: HomeIcon },
    INDEX2: { path: '/index', name: 'Homepage', icon: HomeIcon },
    LOGIN: { path: '/login', name: 'Login', icon: LogInIcon },
    SIGN_UP: { path: '/sign-up', name: 'Sign-Up', icon: UserPlusIcon },
    FORGOT_PASSWORD: { path: '/forgot-password', name: 'Forgot Password', icon: KeyRoundIcon },
    SERVICES: { path: '/services', name: 'Services', icon: MessageSquareIcon },
    VIEW_SERVICE: { path: '/services/:id', name: 'View Service', parent: '/services', icon: MessageSquareIcon, paramKeys: ['id'] },
    PROJECTS: { path: '/projects', name: 'Projects', icon: BarChartIcon },
    CONTACT: { path: '/contact', name: 'Contact Us', icon: MessageSquareIcon },

    AUTH_DISCORD: { path: '/auth-callback/discord', name: 'Discord Auth Callback' },

    BETA: { path: '/beta', name: 'Betas and Tests', icon: FlaskConicalIcon },
    TEST_PAGE: { path: '/test', name: 'Tests Page', icon: TestTubeIcon },

    MESSAGES: { path: '/messages', name: 'Messages', icon: MessageSquareIcon },
    PROFILE: { path: '/profile', name: 'Profile', parent: '/', icon: UserIcon },

    // Academy Routes
    ACADEMY: { path: '/academy', name: 'Academy', icon: BookOpenIcon },
    ACADEMY_HOME: { path: '/academy', name: 'Home', icon: HomeIcon },
    ACADEMY_COURSES: { path: '/academy/courses', name: 'Courses', parent: '/academy', icon: BookOpenIcon },
    ACADEMY_ACHIEVEMENTS: { path: '/academy/achievements', name: 'Achievements', parent: '/academy', icon: ShieldCheckIcon },
    ACADEMY_FAVORITES: { path: '/academy/favorites', name: 'Favorites', parent: '/academy', icon: StarIcon },
    ACADEMY_APPS: { path: '/academy/apps', name: 'Apps', parent: '/academy', icon: LayoutGridIcon },
    ACADEMY_COURSE: { path: '/academy/courses/:id', name: 'Course', parent: '/academy/courses', icon: BookOpenIcon, paramKeys: ['id'] },
    ACADEMY_COURSE_LESSONS: { path: '/academy/courses/:id/lessons', name: 'Lessons', parent: '/academy/courses', icon: BookOpenIcon, paramKeys: ['id'] },
    ACADEMY_COURSE_LESSON: { path: '/academy/courses/:id/lessons/:lessonId', name: 'Lesson', parent: '/academy/courses', icon: BookOpenIcon, paramKeys: ['id', 'lessonId'] },

    // Admin Routes
    ADMIN_HOME: { path: '/figpe-admin-x4', name: 'Admin Home', icon: HomeIcon },
    ADMIN_VIEW_USERS: { path: '/figpe-admin-x4/users', name: 'User Management', parent: '/figpe-admin-x4', icon: UsersIcon },
    ADMIN_VIEW_USER: { path: "/figpe-admin-x4/users/:id", name: "View User", parent: '/figpe-admin-x4', icon: UserIcon, paramKeys: ["id"] },
    ADMIN_EMAIL_USER: { path: "/figpe-admin-x4/users/:id/email", name: "Email User", parent: '/figpe-admin-x4/users', icon: MessageSquareIcon, paramKeys: ["id"] },
    ADMIN_EMAIL_ALL_USERS: { path: '/figpe-admin-x4/users/email-all', name: 'Email All Users', parent: '/figpe-admin-x4/users', icon: MessageSquareIcon },
    ADMIN_VIEW_PAYMENTS: { path: '/figpe-admin-x4/payments', name: 'Payments', parent: '/figpe-admin-x4', icon: CreditCardIcon },
    ADMIN_VIEW_COURSES: { path: '/figpe-admin-x4/courses', name: 'Courses', parent: '/figpe-admin-x4', icon: BookOpenIcon },
    ADMIN_VIEW_COURSE: { path: "/figpe-admin-x4/view-course/:id", name: "View Course", parent: '/figpe-admin-x4/courses', icon: BookOpenIcon, paramKeys: ["id"] },
    ADMIN_ADD_COURSE: { path: "/figpe-admin-x4/add-course", name: "Add Course", parent: '/figpe-admin-x4/courses', icon: BookOpenIcon },
    ADMIN_EDIT_COURSE: { path: "/figpe-admin-x4/edit-course/:id", name: "Edit Course", parent: '/figpe-admin-x4/courses', icon: BookOpenIcon, paramKeys: ["id"] },
    ADMIN_VIEW_REPORTS: { path: '/figpe-admin-x4/reports', name: 'Reports', parent: '/figpe-admin-x4', icon: BarChartIcon },
} as const satisfies RoutingMap;
