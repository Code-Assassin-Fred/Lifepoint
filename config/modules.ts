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
    MessageSquare,
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
        id: 'messages',
        label: 'Messages',
        description: 'Direct communication with mentors and community leadership',
        icon: MessageSquare,
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
    {
        id: 'users',
        label: 'Users',
        description: 'Manage platform users and roles',
        icon: UserCheck,
        adminOnly: true,
    },
];

// Get route for a module based on role
export function getModuleRoute(moduleId: string, role: string | null): string {
    if (moduleId === 'give') return '/dashboard/support';
    const baseRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard';
    return `${baseRoute}/${moduleId}`;
}

// Helper to get modules for a user based on their selection
export function getModulesForUser(selectedIds: string[], role: string | null = null): Module[] {
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

    // Ensure 'give' is always present for regular users (not admins)
    if (role !== 'admin' && !modules.some(m => m.id === 'give')) {
        const giveModule = ALL_MODULES.find(m => m.id === 'give');
        if (giveModule) modules.push(giveModule);
    }

    // Ensure 'development' (Growth & Mentorship) is always present
    if (!modules.some(m => m.id === 'development')) {
        const devModule = ALL_MODULES.find(m => m.id === 'development');
        if (devModule) modules.push(devModule);
    }

    // Ensure 'messages' is always present for all users
    if (!modules.some(m => m.id === 'messages')) {
        const msgModule = ALL_MODULES.find(m => m.id === 'messages');
        if (msgModule) modules.push(msgModule);
    }

    if (role === 'admin') {
        const adminSpecific = ALL_MODULES.filter(m => m.adminOnly);
        // Filter out 'give' for admin — giving is not automated, admins check accounts directly
        const combined = Array.from(new Set([...modules, ...adminSpecific]));
        return combined.filter(m => m.id !== 'give');
    }

    return modules;
}

// Get all modules (for admin view)
export function getAllModules(): Module[] {
    return ALL_MODULES;
}
