'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { getModulesForUser, getModuleRoute } from '@/config/modules';
import { ArrowRight, Trophy, Flame, Target, Star } from 'lucide-react';

export default function UserDashboardPage() {
    const { selectedModules, role, user } = useAuth();
    const modules = getModulesForUser(selectedModules);
    const firstName = user?.displayName?.split(' ')[0] || 'Friend';

    // Mock stats for visual demonstration of the new dashboard
    const stats = [
        { label: 'Current Streak', value: '3 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Growth Points', value: '1,250', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        { label: 'Modules Active', value: modules.length.toString(), icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-8 lg:p-12 shadow-2xl shadow-zinc-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                        Ready to grow, {firstName}?
                    </h2>
                    <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                        "The only person you should try to be better than is the person you were yesterday."
                    </p>
                    <button className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-colors shadow-lg shadow-white/10">
                        Continue Learning
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modules Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-zinc-900">Your Journey</h3>
                    <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                        Manage Modules
                    </button>
                </div>

                {modules.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-zinc-200">
                        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                            <Target size={32} className="text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Modules Selected</h3>
                        <p className="text-zinc-500 max-w-md mx-auto mb-6">
                            Start your journey by selecting growth modules that interest you.
                        </p>
                        <button className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors">
                            Explore Modules
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <Link
                                    key={module.id}
                                    href={getModuleRoute(module.id, role)}
                                    className="group relative glass-panel rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-transparent hover:border-zinc-200"
                                >
                                    <div className="absolute top-8 right-8 text-zinc-300 group-hover:text-zinc-900 transition-colors">
                                        <ArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                    </div>

                                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                                        <Icon size={28} />
                                    </div>

                                    <h3 className="text-xl font-bold text-zinc-900 mb-2">
                                        {module.label}
                                    </h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        {module.description}
                                    </p>

                                    <div className="mt-6 w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-zinc-900 h-full w-1/3 rounded-full" />
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-2 font-medium">33% completed</p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
