'use client';

import { Bell, Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
    userName: string;
    userPhoto?: string | null;
    role: string | null;
}

export default function Header({ userName, userPhoto, role }: HeaderProps) {
    return (
        <header className="flex items-center justify-between py-6 px-8 mb-4">
            {/* Left: Branding or Breadcrumb (Empty in inspo 1, but we can put a simple welcome or nothing) */}
            <div className="hidden md:block">
                {/* Placeholder for page title connection if needed, otherwise empty */}
            </div>

            {/* Right: Search & Actions */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                {/* Search Bar - White Pill */}
                <div className="relative group">
                    <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-full shadow-sm w-full md:w-[320px] transition-all focus-within:ring-2 focus-within:ring-zinc-900/5">
                        <Search size={20} className="text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-zinc-700 placeholder:text-zinc-400 w-full text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Notifications - White Circle */}
                <button className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-sm hover:scale-105 transition-transform">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full border border-white" />
                </button>
            </div>
        </header>
    );
}
