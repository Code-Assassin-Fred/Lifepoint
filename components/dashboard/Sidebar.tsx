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
    PieChart,
    Users,
    MessageSquare,
    Utensils,
    Home
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

    const isActive = (route: string) => {
        return pathname === route || pathname.startsWith(route + '/');
    };

    const dashboardRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

    const NavItem = ({ href, icon: Icon, label, active, badge }: { href: string; icon: any; label: string; active?: boolean; badge?: string | number }) => (
        <Link
            href={href}
            className={`flex items-center justify-between px-6 py-4 mb-1 transition-all duration-300 font-medium text-[16px] ${active
                    ? 'bg-white text-black rounded-[2rem] mx-4 shadow-lg shadow-black/20'
                    : 'text-zinc-400 hover:text-white px-10'
                }`}
        >
            <div className="flex items-center gap-4">
                <Icon size={22} className={active ? 'text-black' : 'text-zinc-400 group-hover:text-white'} strokeWidth={2} />
                <span>{label}</span>
            </div>
            {badge && (
                <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${active
                        ? 'bg-[#ccf381] text-black'
                        : 'bg-[#ccf381] text-black'
                    }`}>
                    {badge}
                </span>
            )}
        </Link>
    );

    const navContent = (
        <div className="flex flex-col h-full bg-[#18181b] text-white overflow-hidden">
            {/* Logo Area */}
            <div className="px-8 pt-10 pb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ccf381] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-white/30 rounded-bl-full" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">flux</span>
            </div>

            {/* Navigation - Hidden Scrollbar */}
            <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                <NavItem
                    href={dashboardRoute}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={pathname === dashboardRoute}
                    badge="3"
                />

                <NavItem
                    href="/dashboard/user/home"
                    icon={Home}
                    label="Home"
                    active={pathname === '/dashboard/user/home'}
                />

                <NavItem
                    href="/dashboard/user/wisdom"
                    icon={Utensils}
                    label="Nutrition"
                    active={pathname === '/dashboard/user/wisdom'}
                />

                <NavItem
                    href="/dashboard/user/reports"
                    icon={PieChart}
                    label="Reports"
                    active={pathname === '/dashboard/user/reports'}
                    badge="1"
                />

                <NavItem href="/users" icon={Users} label="Users" active={pathname === '/users'} />
                <NavItem href="/messages" icon={MessageSquare} label="Messages" active={pathname === '/messages'} />

                {/* Dynamic Modules Section */}
                {role === 'admin' && (
                    <NavItem
                        href="/dashboard/admin"
                        icon={Shield}
                        label="Admin"
                        active={pathname === '/dashboard/admin'}
                    />
                )}
                {modules.map((module) => (
                    <NavItem
                        key={module.id}
                        href={getModuleRoute(module.id, role)}
                        icon={module.icon}
                        label={module.label}
                        active={isActive(getModuleRoute(module.id, role))}
                    />
                ))}
            </nav>

            {/* Upgrade Badge (Bottom Left) - Exact Match */}
            <div className="p-6">
                <div className="bg-[#ccf381] rounded-[2rem] p-6 text-black relative group cursor-pointer hover:bg-[#bbe075] transition-colors">
                    <div className="relative z-10">
                        <h4 className="font-extrabold text-xl mb-1">Upgrade to Pro</h4>
                        <p className="text-xs font-bold opacity-70 leading-relaxed max-w-[150px]">
                            Upgrade your account for a fuller experience.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#18181b] text-white p-4 h-16 flex items-center justify-between">
                <span className="font-bold text-lg flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#ccf381]" /> flux
                </span>
                <button onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 bg-[#18181b] lg:hidden">
                    <div className="absolute top-4 right-4 text-white" onClick={() => setMobileOpen(false)}>
                        <X />
                    </div>
                    <div className="h-full pt-16">
                        {navContent}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-[280px] z-30 bg-[#18181b]">
                {navContent}
            </aside>

            {/* Nav content shim */}
            <div className="hidden lg:block w-[280px] flex-shrink-0" />
        </>
    );
}
