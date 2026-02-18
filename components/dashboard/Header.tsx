'use client';

import { Bell, Search } from 'lucide-react';

interface HeaderProps {
    userName: string;
    userPhoto?: string | null;
    role: string | null;
}

export default function Header({ userName, userPhoto, role }: HeaderProps) {
    const firstName = userName.split(' ')[0];

    return (
        <header className="sticky top-0 z-20 h-16 px-6 lg:px-8 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-white/20">
            {/* Welcome Message */}
            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                        Hello, {firstName}
                    </h1>
                    {role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white uppercase tracking-wider">
                            Admin
                        </span>
                    )}
                </div>
                <p className="text-xs text-zinc-500 font-medium">Let's grow together today.</p>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Search Bar (Visual Only) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-zinc-200 rounded-lg focus-within:ring-2 focus-within:ring-zinc-900/10 focus-within:border-zinc-300 transition-all">
                    <Search size={14} className="text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-32 placeholder:text-zinc-400 text-zinc-700"
                    />
                    <div className="text-[10px] font-mono text-zinc-300 border border-zinc-200 px-1 rounded">/</div>
                </div>

                {/* Notifications */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

                {/* User Avatar - Minimal */}
                <div className="flex items-center gap-2 cursor-pointer group">
                    {userPhoto ? (
                        <img
                            src={userPhoto}
                            alt={userName}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-zinc-200 transition-all"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm group-hover:ring-zinc-200 transition-all">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
