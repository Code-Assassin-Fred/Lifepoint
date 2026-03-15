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
    notificationCount?: number;
    unreadMessagesCount?: number;
}

export default function Sidebar({
    modules,
    userName,
    userEmail,
    userPhoto,
    role,
    onLogout,
    notificationCount = 0,
    unreadMessagesCount = 0,
}: SidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const totalNotifications = notificationCount + unreadMessagesCount;

    const isActive = (route: string) => {
        return pathname === route || pathname.startsWith(route + '/');
    };

    const dashboardRoute = role === 'admin' ? '/dashboard/admin' : '/dashboard';

    const NavItem = ({ href, icon: Icon, label, active, badge }: { href: string; icon: any; label: string; active?: boolean; badge?: string | number }) => (
        <Link
            href={href}
            className={`flex items-center justify-between px-6 py-2.5 mb-1 transition-all duration-300 font-medium text-sm ${active
                ? 'bg-white text-black rounded-[2rem] mx-4 shadow-lg shadow-black/20'
                : 'text-zinc-400 hover:text-white px-10'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className={active ? 'text-black' : 'text-zinc-400 group-hover:text-white'} strokeWidth={2} />
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
            {/* Branding - Removed dot for cleaner look */}
            <div className="px-8 pt-8 pb-6 flex items-center">
                <span className="text-xl font-bold tracking-tight text-white">Lifepoint</span>
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

                {/* Admin Panel Link - Styled as text, not a button */}
                {role === 'admin' && (
                    <Link
                        href="/dashboard/admin"
                        className={`flex items-center gap-3 px-10 py-2.5 mb-1 transition-all duration-300 font-bold text-sm ${pathname.startsWith('/dashboard/admin') && pathname !== dashboardRoute
                            ? 'text-[#0d9488]'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Shield size={20} strokeWidth={2} />
                        <span>Admin Console</span>
                    </Link>
                )}
            </nav>



            {/* User Footer - Show first name and logout only */}
            <div className="px-10 pb-6 pt-4 flex items-center justify-between group border-t border-zinc-800 mx-4">
                <p className="text-sm font-bold text-white truncate max-w-[120px]">
                    {userName.split(' ')[0]}
                </p>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-all font-medium text-sm group/logout"
                    title="Logout"
                >
                    <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header - Fixed at top */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#18181b] text-white px-5 h-16 flex items-center justify-between shadow-lg">
                <Link href={dashboardRoute} className="font-bold text-lg tracking-tight">
                    Lifepoint
                </Link>
                <div className="flex items-center gap-4">
                    {/* Compact Notifications Trigger for Mobile */}
                    <div className="relative p-2">
                        <Link href={`/dashboard/${role === 'admin' ? 'admin' : 'user'}/messages`}>
                            <MessageSquare size={20} className="text-zinc-400 hover:text-white transition-colors" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-1 right-1 flex w-4 h-4 items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full">
                                    {totalNotifications}
                                </span>
                            )}
                        </Link>
                    </div>

                    <Link href="/profile" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
                        {userPhoto ? (
                            <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-bold">{userName.charAt(0).toUpperCase()}</span>
                        )}
                    </Link>

                    <button 
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 ml-1 bg-zinc-800 rounded-lg text-white"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[60] bg-[#18181b] lg:hidden animate-in fade-in slide-in-from-right duration-300">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                            <span className="font-bold text-lg">Menu</span>
                            <button onClick={() => setMobileOpen(false)} className="p-2 bg-zinc-800 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-6" onClick={() => setMobileOpen(false)}>
                            {navContent}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-[240px] z-30 bg-[#18181b]">
                {navContent}
            </aside>

            {/* Nav content shim */}
            <div className="hidden lg:block w-[240px] flex-shrink-0" />
        </>
    );
}
