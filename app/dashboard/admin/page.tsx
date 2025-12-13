'use client';

import Link from 'next/link';
import { getAllModules, getModuleRoute } from '@/config/modules';
import { ArrowRight, Users, FileText, Settings, BarChart3 } from 'lucide-react';

export default function AdminDashboardPage() {
    const modules = getAllModules();

    const adminTools = [
        {
            label: 'User Management',
            description: 'Manage users, roles, and permissions',
            icon: Users,
            route: '/dashboard/admin/users',
        },
        {
            label: 'Content Management',
            description: 'Sermons, devotions, and media',
            icon: FileText,
            route: '/dashboard/admin/content',
        },
        {
            label: 'Analytics',
            description: 'Usage stats and engagement metrics',
            icon: BarChart3,
            route: '/dashboard/admin/analytics',
        },
        {
            label: 'Settings',
            description: 'Platform configuration',
            icon: Settings,
            route: '/dashboard/admin/settings',
        },
    ];

    return (
        <div className="max-w-6xl">
            {/* Page Title */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-black">Admin Dashboard</h2>
                <p className="text-black/60 text-sm mt-1">
                    Manage content and monitor platform activity
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {[
                    { label: 'Total Users', value: '1,234', change: '+12%' },
                    { label: 'Active Today', value: '89', change: '+5%' },
                    { label: 'New Signups', value: '23', change: '+8%' },
                    { label: 'Sermons', value: '156', change: '+2' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl p-5 border border-gray-100"
                    >
                        <p className="text-sm text-black/60">{stat.label}</p>
                        <p className="text-2xl font-bold text-black mt-1">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                    </div>
                ))}
            </div>

            {/* Admin Tools */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold text-black mb-4">Admin Tools</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {adminTools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <Link
                                key={tool.label}
                                href={tool.route}
                                className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-red-200 hover:shadow-md transition-all"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gray-100 text-black/60 flex items-center justify-center mb-3 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                    <Icon size={20} />
                                </div>
                                <h4 className="font-medium text-black group-hover:text-red-600 transition-colors">
                                    {tool.label}
                                </h4>
                                <p className="text-xs text-black/50 mt-1">{tool.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* All Modules */}
            <div>
                <h3 className="text-lg font-semibold text-black mb-4">All Modules</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        const route = getModuleRoute(module.id, 'admin');
                        return (
                            <Link
                                key={module.id}
                                href={route}
                                className="group flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-red-200 transition-all"
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-black text-sm truncate">
                                        {module.label}
                                    </h4>
                                </div>
                                <ArrowRight
                                    size={16}
                                    className="text-black/30 group-hover:text-red-500 transition-colors"
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
