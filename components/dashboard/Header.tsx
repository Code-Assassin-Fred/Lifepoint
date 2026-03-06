'use client';

import { Bell, User } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
    userName: string;
    userPhoto?: string | null;
    role: string | null;
}

export default function Header({ userName, userPhoto, role }: HeaderProps) {
    return (
        <header className="flex items-center justify-between pt-6 pb-2 px-8">
            <div className="hidden md:block">
            </div>

            <div className="flex items-center gap-3 justify-end w-full">
                {/* Notifications */}
                <button className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-sm hover:scale-105 transition-transform">
                    <Bell size={20} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full border border-white" />
                </button>

                {/* Profile Link */}
                <Link 
                    href="/profile"
                    className="flex items-center gap-3 h-12 pl-2 pr-4 bg-white rounded-full shadow-sm hover:scale-105 transition-transform border border-zinc-100/50"
                >
                    <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white overflow-hidden shadow-inner ring-2 ring-zinc-50">
                        {userPhoto ? (
                            <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <span className="text-sm font-bold text-zinc-900 hidden sm:block">{userName}</span>
                </Link>
            </div>
        </header>
    );
}
