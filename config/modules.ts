'use client';

import {
    Church,
    BookOpen,
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
        id: 'church',
        label: 'Home',
        description: 'Livestreams, sermons, and prayer room',
        icon: Church,
    },
    {
        id: 'bible',
        label: 'Bible Study',
        description: 'Daily devotions, study plans, and personal notes',
        icon: BookOpen,
    },
    {
        id: 'giving',
        label: 'Giving',
        description: 'Tithes, offerings, and donation history',
        icon: Heart,
    },
    {
        id: 'events',
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
        id: 'growth',
        label: 'Growth',
        description: 'Personal development and assessments',
        icon: GraduationCap,
    },
    {
        id: 'mentorship',
        label: 'Mentorship',
        description: 'Find mentors and book coaching sessions',
        icon: UserCheck,
    },
];

// Get route for a module based on role
export function getModuleRoute(moduleId: string, role: string | null): string {
    const baseRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return `${baseRoute}/${moduleId}`;
}

// Helper to get modules for a user based on their selection
export function getModulesForUser(selectedIds: string[]): Module[] {
    return ALL_MODULES.filter((m) => selectedIds.includes(m.id));
}

// Get all modules (for admin view)
export function getAllModules(): Module[] {
    return ALL_MODULES;
}
