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
    const { user, loading, role, selectedModules, onboardingComplete } = useAuth();
    const [notificationCount, setNotificationCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const modules = getModulesForUser(selectedModules, role);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/auth');
    };

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/auth');
            } else if (!onboardingComplete && role !== 'admin') {
                // If not onboarded and not an admin (admins might bypass), go to onboarding
                router.replace('/onboarding');
            } else if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
                router.replace('/dashboard');
            } else if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/admin') && role === 'admin') {
                router.replace('/dashboard/admin');
            } else if (pathname === '/dashboard') {
                router.replace(role === 'admin' ? '/dashboard/admin' : '/dashboard');
            }
        }
    }, [user, loading, role, onboardingComplete, router, pathname]);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!user) return;
            
            // Fetch unread messages for all users
            try {
                const msgRes = await fetch(`/api/messages/unread?userId=${user.uid}`);
                if (msgRes.ok) {
                    const data = await msgRes.json();
                    setUnreadMessagesCount(data.count || 0);
                }
            } catch (e) {
                console.error('Failed to fetch message count');
            }

            // Fetch admin notifications if applicable
            if (role === 'admin') {
                try {
                    const notifyRes = await fetch('/api/admin/notifications/unread-count');
                    if (notifyRes.ok) {
                        const data = await notifyRes.json();
                        setNotificationCount(data.count);
                    }
                } catch (e) {
                    console.error('Failed to fetch admin notifications');
                }
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // 30s interval
        return () => clearInterval(interval);
    }, [user, role]);

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
                unreadMessagesCount={unreadMessagesCount}
            />

            <div className="lg:pl-[240px]">
                <div className="h-16 lg:hidden" />
                <Header 
                    userName={userName} 
                    userPhoto={userPhoto} 
                    role={role} 
                    adminNotificationCount={notificationCount}
                    messageUnreadCount={unreadMessagesCount}
                />
                <main className="px-4 pb-6 lg:px-8 lg:pb-8 pt-0">{children}</main>
            </div>
        </div>
    );
}
