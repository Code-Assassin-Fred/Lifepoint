'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { getModuleRoute, getAllModules } from '@/config/modules';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Using the same Stat interface style as admin, without the change/trend
interface Stat {
    label: string;
    value: string;
    unit: string;
}

export default function UserDashboardPage() {
    const { user, loading: authLoading, role, selectedModules } = useAuth();
    const allModules = getAllModules();
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(true);

    // We filter modules to show as "Active Programs"
    // Using default background colors mapped from the admin tab style
    const activePrograms = allModules
        .filter(m => selectedModules.includes(m.id))
        .map((module, idx) => {
            const colors = [
                { tabColor: 'bg-teal-600', bgColor: 'bg-teal-50', tabLabel: 'Health' },
                { tabColor: 'bg-sky-600', bgColor: 'bg-sky-50', tabLabel: 'Growth' },
                { tabColor: 'bg-slate-700', bgColor: 'bg-slate-100', tabLabel: 'Focus' },
                { tabColor: 'bg-emerald-600', bgColor: 'bg-emerald-50', tabLabel: 'Journey' },
                { tabColor: 'bg-teal-700', bgColor: 'bg-teal-50', tabLabel: 'Sync' }
            ];
            return {
                ...module,
                ...colors[idx % colors.length]
            };
        });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const response = await fetch(`/api/user/stats?userId=${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    // Map API stats to dashboard Stat interface
                    const mapped: Stat[] = data.map((s: any) => ({
                        label: s.label,
                        value: s.value.replace(/[^\d]/g, ''),
                        unit: s.value.includes('%') ? '%' : s.value.replace(/[\d]/g, '').trim() || (s.label.includes('XP') ? 'pts' : '')
                    }));
                    setStats(mapped);
                }
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20 pt-4 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
                        Spiritual Overview
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Your journey with Christ, visualized.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm border border-slate-200">
                        Weekly
                    </button>
                    <button className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-colors">
                        Today
                    </button>
                </div>
            </div>

            {/* Top Metrics Grid (Clean layout, no percentages) */}
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
                                {stat.value} <span className="text-sm font-semibold text-slate-400">{stat.unit}</span>
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Programs (Folder-Tab style) */}
            <div className="px-2 pt-6">
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-700">Continue Journey</h2>
                    <div className="flex gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold">{activePrograms.length}</span>
                        <span className="text-sm text-teal-600 font-medium">Active Paths</span>
                    </div>

                    <Link href="/dashboard" className="ml-auto text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                        View All
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {activePrograms.map((program) => (
                        <Link
                            key={program.id}
                            href={getModuleRoute(program.id, role)}
                            className="block group relative pt-8 transition-transform hover:-translate-y-1"
                        >
                            {/* Tab */}
                            <div className={`absolute top-0 left-0 h-8 px-5 flex items-center justify-center rounded-t-lg font-semibold text-xs text-white ${program.tabColor} shadow-sm z-10 transition-colors`}>
                                {program.tabLabel}
                            </div>

                            {/* Card Body */}
                            <div className={`relative z-0 ${program.bgColor} rounded-xl rounded-tl-none p-6 shadow-sm border border-black/5 min-h-[160px] flex flex-col`}>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">
                                        {program.label}
                                    </h4>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                        Pick up where you left off.
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    {/* Abstract Progress Bar */}
                                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                                        <div className={`w-1/2 h-full ${program.tabColor} rounded-full opacity-80`} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                                        <span className={`text-xs font-bold ${program.tabColor.replace('bg-', 'text-')} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                            Resume Path
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Status Section (Abstract / Daily Insight) */}
            <div className="grid md:grid-cols-2 gap-6 px-2 pt-6">
                {/* Status Box 1: Wellness Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-800">Growth Insight</h3>
                            <div className="w-2 h-2 rounded-full bg-teal-500 ml-2" />
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            Your Bible engagement is up 20% this week. Great job staying consistent with the "Foundation" series! Check out the new media library for more resources.
                        </p>
                    </div>

                    <button className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors self-start">
                        View Growth Map
                    </button>
                </div>

                {/* Status Box 2: Abstract Decorative Card */}
                <div className="rounded-2xl p-8 relative overflow-hidden bg-slate-800 text-white min-h-[250px] shadow-sm flex flex-col justify-end">
                    {/* Decorative abstract art matching admin dashboard */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-teal-600 rounded-l-[100px] opacity-90 transform translate-x-12 -scale-x-100" />
                    <div className="absolute top-0 right-0 w-32 h-full bg-sky-500 rounded-l-[100px] opacity-90 transform translate-x-4 -scale-x-100" />

                    <div className="relative z-10 w-2/3">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">Current Milestone</h3>
                        <p className="text-2xl font-bold tracking-tight mb-2 text-teal-50">Foundation Phase</p>
                        <p className="text-xs text-slate-400">Step 3 of your spiritual journey.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

