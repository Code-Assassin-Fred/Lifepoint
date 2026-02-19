'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { getModuleRoute, getAllModules } from '@/config/modules';
import Link from 'next/link';
import { ArrowRight, Flame, BarChart3, Target, ChevronRight } from 'lucide-react';

export default function UserDashboardPage() {
    const { user, role } = useAuth();
    const modules = getAllModules();

    // Mock Data for "Flux" Style Stats
    const stats = [
        { label: 'Energy Used', value: '4.3k', unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Wellness Index', value: '78', unit: '%', icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Activity', value: '5.8', unit: 'km', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-5 pb-10">
            {/* Header Section - Compact */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                        Heal Overview
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        Take control of your spiritual health today!
                    </p>
                </div>
                <div className="flex bg-white rounded-full p-1 shadow-sm border border-zinc-100/50">
                    <button className="px-4 py-1.5 bg-zinc-900 text-white rounded-full text-[11px] font-bold shadow-sm">Today</button>
                    <button className="px-4 py-1.5 text-zinc-500 hover:text-zinc-900 text-[11px] font-medium transition-colors">Weekly</button>
                </div>
            </div>

            {/* Main Grid Layout - Compact Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left Column: Big Stats Card - Height Reduced */}
                <div className="lg:col-span-1 space-y-5">
                    {/* Energy/Focus Card */}
                    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-zinc-100/50 h-[300px] flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 bg-purple-50 rounded-full -mr-12 -mt-12 z-0" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="p-2 bg-zinc-50 rounded-full">
                                    <Flame size={16} className="text-zinc-900" />
                                </div>
                                <span className="font-bold text-sm text-zinc-700">Focus Score</span>
                            </div>
                            <h3 className="text-4xl font-extrabold text-zinc-900 tracking-tighter">
                                4.3k <span className="text-sm font-bold text-zinc-400">pts</span>
                            </h3>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-[10px]">
                                +5% today
                            </span>
                        </div>

                        {/* Abstract Shapes/Chart Visualization */}
                        <div className="relative h-24 w-full mt-auto">
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply opacity-80 animate-pulse" />
                            <div className="absolute bottom-0 left-12 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply opacity-80" />
                            <div className="absolute bottom-2 left-6 w-16 h-16 bg-green-200 rounded-full mix-blend-multiply opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Grid of Smaller Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Stat Cards - Very Compact */}
                    {stats.slice(1).map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-zinc-100/50 flex flex-col justify-between h-[140px]">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={18} className="text-zinc-900" />
                                        <span className="font-bold text-sm text-zinc-700">{stat.label}</span>
                                    </div>
                                    <button className="text-zinc-300 hover:text-zinc-900">
                                        <div className="w-1 h-1 bg-current rounded-full mb-0.5" />
                                        <div className="w-1 h-1 bg-current rounded-full mb-0.5" />
                                        <div className="w-1 h-1 bg-current rounded-full" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tighter">
                                        {stat.value} <span className="text-[10px] font-bold text-zinc-400">{stat.unit}</span>
                                    </h3>
                                </div>
                            </div>
                        );
                    })}

                    {/* Modules / Journey Section - Compact */}
                    <div className="col-span-1 md:col-span-2 bg-zinc-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-800 rounded-full blur-2xl -mr-10 -mt-10 opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-3">
                            <div>
                                <h3 className="text-lg font-bold mb-0.5">Continue Journey</h3>
                                <p className="text-zinc-400 text-xs">Pick up where you left off.</p>
                            </div>
                            <Link href="/modules" className="px-3.5 py-1.5 bg-white text-zinc-900 rounded-full font-bold text-[11px] hover:bg-zinc-200 transition-colors">
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {modules.slice(0, 2).map((module) => (
                                <Link
                                    key={module.id}
                                    href={getModuleRoute(module.id, role)}
                                    className="group bg-zinc-800/50 rounded-xl p-4 border border-white/5 hover:bg-zinc-800 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <module.icon size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs">{module.label}</h4>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-10 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                                    <div className="w-1/2 h-full bg-green-400 rounded-full" />
                                                </div>
                                                <span className="text-[9px] text-zinc-400 font-bold">50%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <ChevronRight size={12} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
