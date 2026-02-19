'use client';

import Link from 'next/link';
import { getAllModules, getModuleRoute } from '@/config/modules';
import { ArrowRight, Users, FileText, Settings, BarChart3, TrendingUp, Activity, UserPlus, MoreHorizontal } from 'lucide-react';

export default function AdminDashboardPage() {
    const modules = getAllModules();

    const adminTools = [
        {
            label: 'User Management',
            description: 'Manage users, roles...',
            icon: Users,
            route: '/dashboard/admin/users',
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: 'Content',
            description: 'Sermons & Media',
            icon: FileText,
            route: '/dashboard/admin/content',
            color: 'bg-orange-100 text-orange-600',
        },
        {
            label: 'Analytics',
            description: 'Platform Statistics',
            icon: BarChart3,
            route: '/dashboard/admin/analytics',
            color: 'bg-purple-100 text-purple-600',
        },
        {
            label: 'Settings',
            description: 'Configuration',
            icon: Settings,
            route: '/dashboard/admin/settings',
            color: 'bg-zinc-100 text-zinc-600',
        },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-5 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                        Dashboard
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        Welcome back, Admin.
                    </p>
                </div>
                <div className="flex gap-2.5">
                    <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-full text-[11px] font-bold hover:bg-zinc-50 transition-colors shadow-sm">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 text-white rounded-full text-[11px] font-bold shadow-lg hover:bg-zinc-800 transition-colors">
                        Create User
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid - Compact */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: '1,234', change: '+12%', icon: Users },
                    { label: 'Active Today', value: '89', change: '+5%', icon: Activity },
                    { label: 'New Signups', value: '23', change: '+8%', icon: UserPlus },
                    { label: 'Engagement', value: '87%', change: '+2%', icon: TrendingUp },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-zinc-100/50 flex flex-col justify-between h-[140px] hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-zinc-50 rounded-xl text-zinc-900">
                                <stat.icon size={18} />
                            </div>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded-full text-[10px]">
                                {stat.change}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-3xl font-extrabold text-zinc-900 tracking-tighter mt-2">{stat.value}</h3>
                            <p className="text-zinc-500 font-medium mt-0.5 text-xs">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* Admin Tools - Large Card */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100/50">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-zinc-900">Admin Tools</h3>
                        <button className="p-1.5 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-900">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {adminTools.map((tool) => (
                            <Link
                                key={tool.label}
                                href={tool.route}
                                className="group flex items-start gap-3 p-4 rounded-[1.5rem] bg-zinc-50 hover:bg-zinc-900 hover:text-white transition-all duration-300"
                            >
                                <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 group-hover:text-white transition-colors`}>
                                    <tool.icon size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-0.5">{tool.label}</h4>
                                    <p className="text-[11px] opacity-60 font-medium leading-relaxed">{tool.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Module Access - Dark Card */}
                <div className="bg-zinc-900 text-white rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-800 rounded-full blur-3xl -mr-12 -mt-12 opacity-50" />

                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-3">Modules</h3>
                        <div className="space-y-2">
                            {modules.map((module) => (
                                <Link
                                    key={module.id}
                                    href={getModuleRoute(module.id, 'admin')}
                                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <module.icon size={16} className="text-zinc-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-xs">{module.label}</h4>
                                    </div>
                                    <ArrowRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2.5 bg-white text-zinc-900 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-colors">
                            Manage All Modules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
