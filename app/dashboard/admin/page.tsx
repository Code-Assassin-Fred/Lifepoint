'use client';

import Link from 'next/link';
import { getAllModules, getModuleRoute } from '@/config/modules';
import { ArrowRight, Users, FileText, Settings, BarChart3, TrendingUp, Activity, UserPlus } from 'lucide-react';

export default function AdminDashboardPage() {
    const modules = getAllModules();

    const adminTools = [
        {
            label: 'User Management',
            description: 'Manage users, roles, and permissions',
            icon: Users,
            route: '/dashboard/admin/users',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Content Management',
            description: 'Sermons, devotions, and media',
            icon: FileText,
            route: '/dashboard/admin/content',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Analytics',
            description: 'Usage stats and engagement metrics',
            icon: BarChart3,
            route: '/dashboard/admin/analytics',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
        {
            label: 'Settings',
            description: 'Platform configuration',
            icon: Settings,
            route: '/dashboard/admin/settings',
            color: 'text-zinc-600',
            bg: 'bg-zinc-50',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-zinc-500 mt-1">
                        Welcome back, Admin. Here's what's happening today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20">
                        Create User
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-600' },
                    { label: 'Active Today', value: '89', change: '+5%', icon: Activity, color: 'text-green-600' },
                    { label: 'New Signups', value: '23', change: '+8%', icon: UserPlus, color: 'text-purple-600' },
                    { label: 'Engagement', value: '87%', change: '+2%', icon: TrendingUp, color: 'text-amber-600' },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-zinc-300 transition-colors"
                        >
                            <div className="absolute top-0 right-0 p-12 bg-zinc-50 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />

                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg bg-white shadow-sm ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full mt-auto">
                                <TrendingUp size={12} />
                                {stat.change}
                                <span className="text-zinc-400 font-normal ml-1">last 30 days</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Admin Tools */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Settings size={20} className="text-zinc-400" />
                        Admin Tools
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {adminTools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                                <Link
                                    key={tool.label}
                                    href={tool.route}
                                    className="group glass-panel p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-transparent hover:border-zinc-200"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${tool.bg} ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={24} />
                                    </div>
                                    <h4 className="font-bold text-zinc-900 text-lg group-hover:text-zinc-700 transition-colors">
                                        {tool.label}
                                    </h4>
                                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{tool.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* All Modules */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <FileText size={20} className="text-zinc-400" />
                        Module Access
                    </h3>
                    <div className="glass-panel rounded-2xl p-2 space-y-1">
                        {modules.map((module) => {
                            const Icon = module.icon;
                            const route = getModuleRoute(module.id, 'admin');
                            return (
                                <Link
                                    key={module.id}
                                    href={route}
                                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300">
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-zinc-900 text-sm truncate group-hover:text-zinc-700 transition-colors">
                                            {module.label}
                                        </h4>
                                        <p className="text-xs text-zinc-400 truncate">Manage content</p>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-zinc-300 group-hover:text-zinc-900 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    />
                                </Link>
                            );
                        })}
                        <div className="pt-2 mt-2 border-t border-zinc-100">
                            <button className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors">
                                View All Modules
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
