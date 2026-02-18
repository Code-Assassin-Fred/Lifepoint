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
    ChevronRight,
    Settings,
} from 'lucide-react';
import { Module, getModuleRoute } from '@/config/modules';

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

    const isActive = (moduleId: string) => {
        const route = getModuleRoute(moduleId, role);
        return pathname === route || pathname.startsWith(route + '/');
    };

    const dashboardRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

    const NavItem = ({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) => (
        <Link
            href={href}
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active
                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
        >
            <Icon size={18} className={active ? 'text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'} />
            <span className="font-medium text-sm">{label}</span>
            {active && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/30" />
            )}
        </Link>
    );

    const navContent = (
        <div className="flex flex-col h-full bg-white/50 backdrop-blur-xl">
            {/* Logo & Brand */}
            <div className="p-6 pb-2">
                <Link href={dashboardRoute} className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm border border-zinc-200 group-hover:border-zinc-300 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50" />
                        <img
                            src="/logo.jpg"
                            alt="Lifepoint"
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-zinc-900 leading-none tracking-tight">Lifepoint</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mt-1">Dashboard</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-8">
                {/* Main Section */}
                <div>
                    <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Platform</p>
                    <div className="space-y-1">
                        <NavItem
                            href={dashboardRoute}
                            icon={LayoutDashboard}
                            label="Overview"
                            active={pathname === dashboardRoute}
                        />
                        {role === 'admin' && (
                            <NavItem
                                href="/dashboard/admin"
                                icon={Shield}
                                label="Admin Console"
                                active={pathname === '/dashboard/admin'}
                            />
                        )}
                    </div>
                </div>

                {/* Modules Section */}
                <div>
                    <p className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Growth Modules</p>
                    <div className="space-y-1">
                        {modules.map((module) => {
                            const route = getModuleRoute(module.id, role);
                            return (
                                <NavItem
                                    key={module.id}
                                    href={route}
                                    icon={module.icon}
                                    label={module.label}
                                    active={isActive(module.id)}
                                />
                            );
                        })}
                        {modules.length === 0 && (
                            <div className="px-3 py-4 border border-dashed border-zinc-200 rounded-lg text-center">
                                <p className="text-xs text-zinc-400">No modules active</p>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3 mb-3 px-1">
                    {userPhoto ? (
                        <img
                            src={userPhoto}
                            alt={userName}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{userName}</p>
                        <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 h-16 flex items-center justify-between">
                <Link href={dashboardRoute} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100">
                        <img src="/logo.jpg" alt="Lifepoint" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-zinc-900">Lifepoint</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {navContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-white/80 backdrop-blur-xl border-r border-zinc-200 flex-col z-30">
                {navContent}
            </aside>
        </>
    );
}
