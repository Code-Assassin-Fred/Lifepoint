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
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg">
                        Welcome back, Admin.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-full text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm">
                        Download Report
                    </button>
                    <button className="px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-zinc-800 transition-colors">
                        Create User
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Users', value: '1,234', change: '+12%', icon: Users },
                    { label: 'Active Today', value: '89', change: '+5%', icon: Activity },
                    { label: 'New Signups', value: '23', change: '+8%', icon: UserPlus },
                    { label: 'Engagement', value: '87%', change: '+2%', icon: TrendingUp },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100/50 flex flex-col justify-between h-[200px] hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-900">
                                <stat.icon size={24} />
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-700 font-bold rounded-full text-xs">
                                {stat.change}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-5xl font-extrabold text-zinc-900 tracking-tighter mt-4">{stat.value}</h3>
                            <p className="text-zinc-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Admin Tools - Large Card */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-zinc-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-zinc-900">Admin Tools</h3>
                        <button className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-900">
                            <MoreHorizontal />
                        </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {adminTools.map((tool) => (
                            <Link
                                key={tool.label}
                                href={tool.route}
                                className="group flex items-start gap-5 p-6 rounded-[2rem] bg-zinc-50 hover:bg-zinc-900 hover:text-white transition-all duration-300"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 group-hover:text-white transition-colors`}>
                                    <tool.icon size={26} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{tool.label}</h4>
                                    <p className="text-sm opacity-60 font-medium leading-relaxed">{tool.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Module Access - Dark Card */}
                <div className="bg-zinc-900 text-white rounded-[2.5rem] p-10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-6">Modules</h3>
                        <div className="space-y-3">
                            {modules.map((module) => (
                                <Link
                                    key={module.id}
                                    href={getModuleRoute(module.id, 'admin')}
                                    className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/5"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <module.icon size={20} className="text-zinc-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm">{module.label}</h4>
                                    </div>
                                    <ArrowRight size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-white text-zinc-900 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                            Manage All Modules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
