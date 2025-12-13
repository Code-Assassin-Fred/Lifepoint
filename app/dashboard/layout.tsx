'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/context/AuthContext';
import { getModulesForUser, getAllModules } from '@/config/modules';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

// ============================================
// HARDCODED FOR TESTING - REMOVE IN PRODUCTION
// ============================================
const FAKE_SELECTED_MODULES = ['church', 'bible'];
const FAKE_ROLE = 'admin'; // Change to 'user' to test user view
// ============================================

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, loading, role: authRole } = useAuth();

    // Use hardcoded values for testing
    const role = FAKE_ROLE;
    const selectedModules = FAKE_SELECTED_MODULES;

    // Get modules based on selection (or all for admin)
    const modules =
        role === 'admin'
            ? getAllModules()
            : getModulesForUser(selectedModules);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/auth');
    };

    // Protect route
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/auth');
        }
    }, [user, loading, router]);

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

    if (!user) {
        return null;
    }

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
            />

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Spacer for mobile header */}
                <div className="h-16 lg:hidden" />

                <Header userName={userName} userPhoto={userPhoto} role={role} />

                <main className="p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
