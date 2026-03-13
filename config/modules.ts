'use client';

import {
    Home,
    Library,
    Heart,
    Calendar,
    Users,
    Tv,
    GraduationCap,
    UserCheck,
    type LucideIcon,
} from 'lucide-react';

export interface Module {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    adminOnly?: boolean;
    premium?: boolean;
}

export const ALL_MODULES: Module[] = [
    {
        id: 'home',
        label: 'Home',
        description: 'Live sessions, insights, and prayer room',
        icon: Home,
    },
    {
        id: 'wisdom',
        label: 'The Well',
        description: 'Daily insights, bible study, and spiritual nourishment',
        icon: Library,
    },
    {
        id: 'support',
        label: 'Support',
        description: 'Contributions, giving, and donation history',
        icon: Heart,
    },
    {
        id: 'workshops',
        label: 'Events',
        description: 'Upcoming gatherings and registrations',
        icon: Calendar,
    },
    {
        id: 'community',
        label: 'Community',
        description: 'Connect with groups and forums',
        icon: Users,
    },
    {
        id: 'media',
        label: 'Media',
        description: 'Videos, podcasts, and guest speakers',
        icon: Tv,
    },
    {
        id: 'development',
        label: 'Growth & Mentorship',
        description: 'Personal development, assessments, and mentorship guidance',
        icon: GraduationCap,
    },
];

// Get route for a module based on role
export function getModuleRoute(moduleId: string, role: string | null): string {
    const baseRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return `${baseRoute}/${moduleId}`;
}

// Helper to get modules for a user based on their selection
export function getModulesForUser(selectedIds: string[]): Module[] {
    const idMap: Record<string, string> = {
        church: 'home',
        bible: 'wisdom',
        giving: 'support',
        growth: 'development',
        mentorship: 'development',
        events: 'workshops',
    };

    const normalizedIds = Array.from(new Set(selectedIds.map((id) => idMap[id] || id)));
    return ALL_MODULES.filter((m) => normalizedIds.includes(m.id));
}

// Get all modules (for admin view)
export function getAllModules(): Module[] {
    return ALL_MODULES.filter(m => m.id !== 'support');
}
