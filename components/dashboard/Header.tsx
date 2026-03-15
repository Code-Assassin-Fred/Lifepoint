'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

interface HeaderProps {
    userName: string;
    userPhoto?: string | null;
    role: string | null;
    adminNotificationCount?: number;
}

export default function Header({ userName, userPhoto, role, adminNotificationCount = 0 }: HeaderProps) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestSenderId, setLatestSenderId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchUnread = async () => {
            if (!user) return;
            try {
                const res = await fetch(`/api/messages/unread?userId=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count || 0);
                    setLatestSenderId(data.latestSenderId || null);
                }
            } catch (error) {
                console.error("Failed to fetch unread count", error);
            }
        };

        if (user) {
            fetchUnread();
            intervalId = setInterval(fetchUnread, 15000); // Check every 15s
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user]);

    const totalUnread = unreadCount + adminNotificationCount;

    return (
        <header className="flex items-center justify-between pt-6 pb-2 px-8">
            <div className="hidden md:block">
            </div>

            <div className="flex items-center gap-3 justify-end w-full">
                {/* Notifications & Messages */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-sm hover:scale-105 transition-transform"
                    >
                        <Bell size={20} />
                        {totalUnread > 0 && (
                            <span className="absolute top-2 right-2 flex min-w-4 h-4 items-center justify-center px-1 bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white">
                                {totalUnread}
                            </span>
                        )}
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-zinc-100 overflow-hidden z-50">
                            <div className="p-4 border-b border-zinc-50 flex items-center justify-between">
                                <h3 className="font-bold text-zinc-900">Notifications</h3>
                                {totalUnread > 0 && (
                                    <span className="bg-[#ccf381]/20 text-green-800 text-xs font-bold px-2 py-1 rounded-md">{totalUnread} new</span>
                                )}
                            </div>
                            <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-50">
                                {adminNotificationCount > 0 && (
                                    <Link 
                                        href="/dashboard/admin/workshops"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-start gap-4 p-4 hover:bg-zinc-50 transition-colors"
                                    >
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#0d9488]/10 text-[#0d9488] flex items-center justify-center">
                                            <Users size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{adminNotificationCount} New Registration{adminNotificationCount > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-zinc-500 mt-1 font-medium">New attendees have joined your gatherings.</p>
                                        </div>
                                    </Link>
                                )}
                                {unreadCount > 0 && (
                                    <Link 
                                        href={`/dashboard/${role === 'admin' ? 'admin' : 'user'}/messages${latestSenderId ? `?open=${latestSenderId}` : ''}`}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-start gap-4 p-4 hover:bg-zinc-50 transition-colors"
                                    >
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#ccf381]/20 text-green-800 flex items-center justify-center">
                                            <MessageSquare size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">You have {unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-zinc-500 mt-1 font-medium">Click to open your inbox and reply.</p>
                                        </div>
                                    </Link>
                                )}
                                {totalUnread === 0 && (
                                    <div className="py-10 px-4 text-center">
                                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-3">
                                            <Bell size={20} className="text-zinc-300" />
                                        </div>
                                        <h4 className="text-sm font-bold text-zinc-900">All caught up!</h4>
                                        <p className="text-xs text-zinc-500 mt-1 font-medium">No new notifications right now.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
