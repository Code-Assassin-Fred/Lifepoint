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
    Users,
    MessageSquare,
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
            {/* Branding - Restored Lifepoint but kept clean Flux style */}
            <div className="px-8 pt-10 pb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ccf381] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-white/30 rounded-bl-full group-hover:bg-white/50 transition-colors" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">Lifepoint</span>
            </div>

            {/* Navigation - Hidden Scrollbar */}
            <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                <NavItem
                    href={dashboardRoute}
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={pathname === dashboardRoute}
                />

                {/* Real Modules from Config */}
                {modules.map((module) => (
                    <NavItem
                        key={module.id}
                        href={getModuleRoute(module.id, role)}
                        icon={module.icon}
                        label={module.label}
                        active={isActive(getModuleRoute(module.id, role))}
                    />
                ))}

                {/* Admin Panel Link */}
                {role === 'admin' && (
                    <NavItem
                        href="/dashboard/admin"
                        icon={Shield}
                        label="Admin Console"
                        active={pathname.startsWith('/dashboard/admin') && pathname !== dashboardRoute}
                    />
                )}

                {/* Settings/Profile section */}
                <div className="mt-4 pt-4 border-t border-zinc-800 mx-8 mb-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Account</p>
                </div>
                <NavItem href="/profile" icon={Users} label="Profile" active={pathname === '/profile'} />
            </nav>

            {/* Upgrade Badge (Bottom Left) - Kept generally relevant */}
            <div className="p-6">
                <div className="bg-[#ccf381] rounded-[2rem] p-6 text-black relative group cursor-pointer hover:bg-[#bbe075] transition-colors">
                    <div className="relative z-10">
                        <h4 className="font-extrabold text-xl mb-1">Upgrade Plan</h4>
                        <p className="text-xs font-bold opacity-70 leading-relaxed max-w-[150px]">
                            Unlock premium content and growth plans.
                        </p>
                    </div>
                </div>
            </div>

            {/* User Footer */}
            <div className="px-8 pb-6 pt-2 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                    {userPhoto ? (
                        <img src={userPhoto} alt={userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-800" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="hidden group-hover:block transition-all animate-in fade-in slide-in-from-left-2">
                        <p className="text-sm font-bold text-white truncate max-w-[100px]">{userName}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-zinc-500 hover:text-white transition-colors">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#18181b] text-white p-4 h-16 flex items-center justify-between">
                <span className="font-bold text-lg flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#ccf381]" /> Lifepoint
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
