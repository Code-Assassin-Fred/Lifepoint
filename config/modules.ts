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
    ClipboardList,
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
    {
        id: 'research',
        label: 'Research and Prep',
        description: 'Manage research materials and preparation guides',
        icon: ClipboardList,
        adminOnly: true,
    },
    {
        id: 'give',
        label: 'Give',
        description: 'Support the mission and see your impact',
        icon: Heart,
    },
];

// Get route for a module based on role
export function getModuleRoute(moduleId: string, role: string | null): string {
    if (moduleId === 'give') return '/dashboard/user/support';
    const baseRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return `${baseRoute}/${moduleId}`;
}

// Helper to get modules for a user based on their selection
export function getModulesForUser(selectedIds: string[], role: string | null): Module[] {
    const idMap: Record<string, string> = {
        church: 'home',
        bible: 'wisdom',
        giving: 'give',
        growth: 'development',
        mentorship: 'development',
        events: 'workshops',
    };

    const normalizedIds = Array.from(new Set(selectedIds.map((id) => idMap[id] || id)));
    let modules = ALL_MODULES.filter((m) => normalizedIds.includes(m.id));

    // Ensure 'give' is always present for all users
    if (!modules.some(m => m.id === 'give')) {
        const giveModule = ALL_MODULES.find(m => m.id === 'give');
        if (giveModule) modules.push(giveModule);
    }

    if (role === 'admin') {
        const adminSpecific = ALL_MODULES.filter(m => m.adminOnly);
        return Array.from(new Set([...modules, ...adminSpecific]));
    }

    return modules;
}

// Get all modules (for admin view)
export function getAllModules(): Module[] {
    return ALL_MODULES;
}
