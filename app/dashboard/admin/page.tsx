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
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20 pt-4 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Platform monitoring and management interface.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm border border-slate-200">
                        Export Data
                    </button>
                    <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-colors">
                        New Entity
                    </button>
                </div>
            </div>

            {/* Top Metrics Grid (Image 2 style) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 px-2">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between h-[130px]"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-semibold text-slate-500">
                                {stat.label}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-slate-800">
                                {loading ? '...' : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Management Tools (Image 1 Folder-Tab style) */}
            <div className="px-2 pt-6">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-700">Currently active modules</h2>
                    <div className="flex gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold">4</span>
                        <span className="text-sm text-teal-600 font-medium">Tools</span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {adminTools.map((tool) => (
                        <Link
                            key={tool.label}
                            href={tool.route}
                            className="block group relative pt-8 transition-transform hover:-translate-y-1"
                        >
                            {/* Tab */}
                            <div className={`absolute top-0 left-0 h-8 px-5 flex items-center justify-center rounded-t-lg font-semibold text-xs text-white ${tool.tabColor} shadow-sm z-10 transition-colors`}>
                                {tool.tabLabel}
                            </div>

                            {/* Card Body */}
                            <div className={`relative z-0 ${tool.bgColor} rounded-xl rounded-tl-none p-6 shadow-sm border border-black/5 min-h-[160px] flex flex-col`}>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">
                                        {tool.label}
                                    </h4>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <span className={`text-xs font-bold ${tool.tabColor.replace('bg-', 'text-')} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        Manage
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Status Section (Inspired by Image 1 Bank Account / Current Balance style) */}
            <div className="grid md:grid-cols-2 gap-6 px-2 pt-6">
                {/* Status Box 1 */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-8">
                        <h3 className="text-lg font-bold text-slate-800">System Status</h3>
                        <div className="w-3 h-3 rounded-full bg-teal-500 ml-2" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Database integrity</p>
                                <p className="text-xs text-slate-400">Last checked: Just now</p>
                            </div>
                            <span className="text-lg font-bold text-teal-600">Secure</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Active user sessions</p>
                                <p className="text-xs text-slate-400">Across all platforms</p>
                            </div>
                            <span className="text-lg font-bold text-teal-600">{loading ? '...' : stats[1].value}</span>
                        </div>
                    </div>
                </div>

                {/* Status Box 2 (Abstract decorative like Image 1 Bank Account card) */}
                <div className="rounded-2xl p-8 relative overflow-hidden bg-slate-800 text-white min-h-[250px] shadow-sm flex flex-col justify-end">
                    {/* Decorative abstract art */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-teal-600 rounded-l-[100px] opacity-90 transform translate-x-12 -scale-x-100" />
                    <div className="absolute top-0 right-0 w-32 h-full bg-sky-500 rounded-l-[100px] opacity-90 transform translate-x-4 -scale-x-100" />

                    <div className="relative z-10 w-2/3">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">Platform Version</h3>
                        <p className="text-2xl font-bold tracking-tight mb-2 text-teal-50">v2.4.0-stable</p>
                        <p className="text-xs text-slate-400">Lifepoint Ministry Operations</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
