'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Shield,
} from 'lucide-react';
import { Module } from '@/config/modules';

interface SidebarProps {
    modules: Module[];
    userName: string;
    userEmail: string;
    userPhoto?: string | null;
    role: string | null;
    onLogout: () => void;
}

export default function Sidebar({
    modules,
    userName,
    userEmail,
    userPhoto,
    role,
    onLogout,
}: SidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (route: string) => pathname === route || pathname.startsWith(route + '/');

    const dashboardRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

    const navContent = (
        <>
            {/* Logo & Brand */}
            <div className="p-6 border-b border-gray-100">
                <Link href={dashboardRoute} className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 shrink-0"
                        style={{
                            clipPath:
                                'polygon(29.3% 0%, 70.7% 0%, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0% 70.7%, 0% 29.3%)',
                        }}
                    >
                        <img
                            src="/logo.jpg"
                            alt="Lifepoint"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Lifepoint</span>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {userPhoto ? (
                        <img
                            src={userPhoto}
                            alt={userName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                {/* Dashboard Link */}
                <Link
                    href={dashboardRoute}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${pathname === dashboardRoute
                            ? 'bg-red-50 text-red-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* Modules Section */}
                <div className="mt-6">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Modules
                    </p>
                    <div className="space-y-1">
                        {modules.map((module) => {
                            const Icon = module.icon;
                            const active = isActive(module.route);
                            return (
                                <Link
                                    key={module.id}
                                    href={module.route}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                            ? 'bg-red-50 text-red-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{module.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Admin Link (if admin) */}
                {role === 'admin' && (
                    <div className="mt-6">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Admin
                        </p>
                        <Link
                            href="/dashboard/admin"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/dashboard/admin')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Shield size={20} />
                            <span className="font-medium">Admin Panel</span>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
                <Link href={dashboardRoute} className="flex items-center gap-2">
                    <div
                        className="w-10 h-10"
                        style={{
                            clipPath:
                                'polygon(29.3% 0%, 70.7% 0%, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0% 70.7%, 0% 29.3%)',
                        }}
                    >
                        <img src="/logo.jpg" alt="Lifepoint" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-gray-900">Lifepoint</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {navContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-gray-200 flex-col z-30">
                {navContent}
            </aside>
        </>
    );
}
