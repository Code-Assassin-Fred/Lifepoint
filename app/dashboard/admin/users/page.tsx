'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    displayName: string;
    role: string;
    country: string;
    onboardingCompletedAt?: string;
    lastActiveAt?: string;
    onboarded: boolean;
    photoURL?: string;
}

import { useAuth } from '@/lib/context/AuthContext';

export default function UserManagementPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const token = await currentUser?.getIdToken();
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!currentUser) return;
        setUpdatingUserId(userId);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, role: newRole }),
            });
            if (response.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error('Failed to update role:', error);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!currentUser) return;
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setUsers(users.filter(u => u.id !== userId));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const filteredUsers = users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20 pt-2 lg:pt-4 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 mb-1 lg:mb-2">
                        User Management
                    </h1>
                    <p className="text-slate-500 font-medium text-xs lg:text-sm">
                        View and manage platform users and their permissions.
                    </p>
                </div>
                <div className="flex gap-2 lg:gap-3">
                    <Link 
                        href="/dashboard/admin"
                        className="px-4 lg:px-6 py-2 bg-white text-slate-700 rounded-lg text-xs lg:text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg 
                            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="flex gap-4 text-xs lg:text-sm text-slate-500">
                        <span>Total: <span className="font-bold text-slate-800">{users.length}</span></span>
                        <span>Found: <span className="font-bold text-slate-800">{filteredUsers.length}</span></span>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-20 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-32 bg-slate-100 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-100 rounded-lg ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        user.displayName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{user.displayName}</div>
                                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updatingUserId === user.id}
                                                className={`text-xs font-bold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all
                                                    ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                                                      user.role === 'mentor' ? 'bg-emerald-100 text-emerald-700' : 
                                                      'bg-slate-100 text-slate-700'}`}
                                            >
                                                <option value="user">User</option>
                                                <option value="mentor">Mentor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {user.country}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                                                ${user.onboarded ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {user.onboarded ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {user.onboardingCompletedAt ? new Date(user.onboardingCompletedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete User"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
