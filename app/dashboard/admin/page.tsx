'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stat[]>([
        { label: 'Total Users', value: '...', change: '+0%', trend: 'up' },
        { label: 'Active Today', value: '...', change: '+0%', trend: 'up' },
        { label: 'New Signups', value: '...', change: '+0%', trend: 'up' },
        { label: 'Engagement', value: '...', change: '+0%', trend: 'up' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    if (data.stats) {
                        setStats(data.stats);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const adminTools = [
        {
            label: 'User Management',
            description: 'Control access, roles, and user lifecycle.',
            route: '/dashboard/admin/users',
            tabColor: 'bg-teal-600',
            bgColor: 'bg-teal-50',
            tabLabel: 'Users'
        },
        {
            label: 'Content Engine',
            description: 'Manage sermons, daily insights, and media.',
            route: '/dashboard/admin/content',
            tabColor: 'bg-sky-600',
            bgColor: 'bg-sky-50',
            tabLabel: 'Media'
        },
        {
            label: 'System Insights',
            description: 'Platform metrics, engagement reports.',
            route: '/dashboard/admin/analytics',
            tabColor: 'bg-slate-700',
            bgColor: 'bg-slate-100',
            tabLabel: 'Reports'
        },
        {
            label: 'Configuration',
            description: 'System-wide settings and API configuration.',
            route: '/dashboard/admin/settings',
            tabColor: 'bg-emerald-600',
            bgColor: 'bg-emerald-50',
            tabLabel: 'Settings'
        },
        {
            label: 'Community Channel',
            description: 'Post announcements and manage official community updates.',
            route: '/dashboard/admin/community',
            tabColor: 'bg-teal-700',
            bgColor: 'bg-teal-50',
            tabLabel: 'Engagement'
        },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20 pt-2 lg:pt-4 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 mb-1 lg:mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-xs lg:text-sm">
                        Platform monitoring and management interface.
                    </p>
                </div>
                <div className="flex gap-2 lg:gap-3">
                    <button className="flex-1 lg:flex-none px-4 lg:px-6 py-2 bg-white text-slate-700 rounded-lg text-xs lg:text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm border border-slate-200">
                        Export
                    </button>
                    <button className="flex-1 lg:flex-none px-4 lg:px-6 py-2 bg-teal-600 text-white rounded-lg text-xs lg:text-sm font-semibold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-colors">
                        New
                    </button>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white p-4 lg:p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between h-[100px] lg:h-[130px]"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] lg:text-sm font-semibold text-slate-500 uppercase tracking-wider lg:normal-case lg:tracking-normal">
                                {stat.label}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xl lg:text-3xl font-bold text-slate-800">
                                {loading ? '...' : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Management Tools */}
            <div className="pt-4 lg:pt-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <h2 className="text-base lg:text-lg font-bold text-slate-700">Active Modules</h2>
                    <div className="flex gap-2">
                        <span className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-teal-600 text-white text-[10px] lg:text-xs font-bold">{adminTools.length}</span>
                    </div>
                </div>

                <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {adminTools.map((tool) => (
                        <Link
                            key={tool.label}
                            href={tool.route}
                            className="block group relative pt-8 transition-transform hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {/* Tab */}
                            <div className={`absolute top-0 left-0 h-8 px-4 lg:px-5 flex items-center justify-center rounded-t-lg font-semibold text-[10px] lg:text-xs text-white ${tool.tabColor} shadow-sm z-10 transition-colors`}>
                                {tool.tabLabel}
                            </div>

                            {/* Card Body */}
                            <div className={`relative z-0 ${tool.bgColor} rounded-xl rounded-tl-none p-5 lg:p-6 shadow-sm border border-black/5 min-h-[140px] lg:min-h-[160px] flex flex-col`}>
                                <div className="flex-1">
                                    <h4 className="text-lg lg:text-xl font-bold text-slate-800 mb-1 lg:mb-2">
                                        {tool.label}
                                    </h4>
                                    <p className="text-slate-600 text-xs lg:text-sm font-medium leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <span className={`text-[10px] lg:text-xs font-bold ${tool.tabColor.replace('bg-', 'text-')} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        Manage
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Status Section */}
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 pt-4 lg:pt-6">
                {/* Status Box 1 */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6 lg:mb-8">
                        <h3 className="text-base lg:text-lg font-bold text-slate-800">System Status</h3>
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ml-2" />
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                        <div className="flex justify-between items-center pb-3 lg:pb-4 border-b border-slate-100">
                            <div>
                                <p className="text-xs lg:text-sm text-slate-500 mb-0.5 lg:mb-1">Database integrity</p>
                                <p className="text-[10px] lg:text-xs text-slate-400">Last checked: Just now</p>
                            </div>
                            <span className="text-base lg:text-lg font-bold text-teal-600 text-right">Secure</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 lg:pb-4 border-b border-slate-100">
                            <div>
                                <p className="text-xs lg:text-sm text-slate-500 mb-0.5 lg:mb-1">Active user sessions</p>
                                <p className="text-[10px] lg:text-xs text-slate-400">Across all platforms</p>
                            </div>
                            <span className="text-base lg:text-lg font-bold text-teal-600 text-right">{loading ? '...' : stats[1]?.value || '0'}</span>
                        </div>
                    </div>
                </div>

                {/* Status Box 2 */}
                <div className="rounded-2xl p-6 lg:p-8 relative overflow-hidden bg-slate-800 text-white min-h-[200px] lg:min-h-[250px] shadow-sm flex flex-col justify-end">
                    {/* Decorative abstract art */}
                    <div className="absolute top-0 right-0 w-48 lg:w-64 h-full bg-teal-600 rounded-l-[100px] opacity-90 transform translate-x-12 -scale-x-100" />
                    <div className="absolute top-0 right-0 w-24 lg:w-32 h-full bg-sky-500 rounded-l-[100px] opacity-90 transform translate-x-4 -scale-x-100" />

                    <div className="relative z-10 w-full lg:w-2/3">
                        <h3 className="text-xs font-semibold text-slate-300 mb-2 lg:mb-4 uppercase tracking-wider">Platform Version</h3>
                        <p className="text-xl lg:text-2xl font-bold tracking-tight mb-1 lg:mb-2 text-teal-50">v2.4.0-stable</p>
                        <p className="text-[10px] lg:text-xs text-slate-400">Lifepoint Ministry Operations</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
