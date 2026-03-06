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

                {/* Profile Link - Avatar only */}
                <Link 
                    href="/profile"
                    className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm hover:scale-105 transition-transform border border-zinc-100/50 overflow-hidden"
                >
                    <div className="w-full h-full flex items-center justify-center text-zinc-900">
                        {userPhoto ? (
                            <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
