'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { getModuleRoute, getAllModules } from '@/config/modules';
import Link from 'next/link';
import { ArrowRight, Flame, BarChart3, Target, ChevronRight } from 'lucide-react';

export default function UserDashboardPage() {
    const { user, role } = useAuth();
    const firstName = user?.displayName?.split(' ')[0] || 'Member';
    const modules = getAllModules();

    // Mock Data for "Flux" Style Stats
    const stats = [
        { label: 'Energy Used', value: '4.3k', unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Wellness Index', value: '78', unit: '%', icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Activity', value: '5.8', unit: 'km', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            {/* Header Section - Big Typography */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 mb-2">
                        Heal Overview
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg">
                        Take control of your spiritual health today!
                    </p>
                </div>
                <div className="flex bg-white rounded-full p-1 shadow-sm border border-zinc-100">
                    <button className="px-6 py-2 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-md">Today</button>
                    <button className="px-6 py-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors">Weekly</button>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Big Stats Card */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Energy/Focus Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100/50 h-[400px] flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-purple-50 rounded-full -mr-16 -mt-16 z-0" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-zinc-50 rounded-full">
                                    <Flame size={24} className="text-zinc-900" />
                                </div>
                                <span className="font-bold text-lg">Focus Score</span>
                            </div>
                            <h3 className="text-6xl font-extrabold text-zinc-900 tracking-tighter">
                                4.3k <span className="text-lg font-bold text-zinc-400">pts</span>
                            </h3>
                            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                                +5% today
                            </span>
                        </div>

                        {/* Abstract Shapes/Chart Visualization */}
                        <div className="relative h-32 w-full mt-auto">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply opacity-80 animate-pulse" />
                            <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply opacity-80" />
                            <div className="absolute bottom-4 left-10 w-24 h-24 bg-green-200 rounded-full mix-blend-multiply opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Grid of Smaller Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stat Cards */}
                    {stats.slice(1).map((stat, idx) => { // Skip the first one as it's the big card
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100/50 flex flex-col justify-between h-[180px]">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Icon size={24} className="text-zinc-900" />
                                        <span className="font-bold text-lg text-zinc-900">{stat.label}</span>
                                    </div>
                                    <button className="text-zinc-300 hover:text-zinc-900">
                                        <div className="w-1 h-1 bg-current rounded-full mb-1" />
                                        <div className="w-1 h-1 bg-current rounded-full mb-1" />
                                        <div className="w-1 h-1 bg-current rounded-full" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-5xl font-extrabold text-zinc-900 tracking-tighter">
                                        {stat.value} <span className="text-sm font-bold text-zinc-400">{stat.unit}</span>
                                    </h3>
                                </div>
                            </div>
                        );
                    })}

                    {/* Modules / Journey Section */}
                    <div className="col-span-1 md:col-span-2 bg-zinc-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Continue Journey</h3>
                                <p className="text-zinc-400">Pick up where you left off.</p>
                            </div>
                            <Link href="/modules" className="px-5 py-2.5 bg-white text-zinc-900 rounded-full font-bold text-sm hover:bg-zinc-200 transition-colors">
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {modules.slice(0, 2).map((module) => (
                                <Link
                                    key={module.id}
                                    href={getModuleRoute(module.id, role)}
                                    className="group bg-zinc-800/50 rounded-3xl p-6 border border-white/5 hover:bg-zinc-800 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <module.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{module.label}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                                    <div className="w-1/2 h-full bg-green-400 rounded-full" />
                                                </div>
                                                <span className="text-xs text-zinc-400 font-bold">50%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <ChevronRight size={16} />
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
