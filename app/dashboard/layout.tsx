'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/context/AuthContext';
import { getModulesForUser, getAllModules } from '@/config/modules';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, role, selectedModules } = useAuth();
    const [notificationCount, setNotificationCount] = useState(0);

    const modules = getModulesForUser(selectedModules, role);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/auth');
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/auth');
            } else if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
                router.replace('/dashboard/user');
            } else if (pathname.startsWith('/dashboard/user') && role === 'admin') {
                router.replace('/dashboard/admin');
            } else if (pathname === '/dashboard') {
                router.replace(role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
            }
        }
    }, [user, loading, role, router, pathname]);

    useEffect(() => {
        if (role === 'admin') {
            const fetchNotifications = async () => {
                try {
                    const res = await fetch('/api/admin/notifications/unread-count');
                    if (res.ok) {
                        const data = await res.json();
                        setNotificationCount(data.count);
                    }
                } catch (e) {
                    console.error('Failed to fetch notifications');
                }
            };
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [role]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const userName = user.displayName || 'User';
    const userEmail = user.email || '';
    const userPhoto = user.photoURL;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                modules={modules}
                userName={userName}
                userEmail={userEmail}
                userPhoto={userPhoto}
                role={role}
                onLogout={handleLogout}
                notificationCount={notificationCount}
            />

            <div className="lg:pl-[240px]">
                <div className="h-16 lg:hidden" />
                <Header userName={userName} userPhoto={userPhoto} role={role} />
                <main className="px-6 pb-6 lg:px-8 lg:pb-8 pt-0">{children}</main>
            </div>
        </div>
    );
}
