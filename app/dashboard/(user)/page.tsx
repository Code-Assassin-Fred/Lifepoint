'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { getModuleRoute, getAllModules } from '@/config/modules';
import Link from 'next/link';
import { useState, useEffect } from 'react';


interface Stat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
}

interface DevelopmentData {
    level: string;
    levelName: string;
    xp: number;
    nextMilestone: string;
    xpNeeded: number;
    streak: number;
    badges: number;
    steps: any[];
    pathways: any[];
    mentor: any | null;
}

export default function UserDashboardPage() {
    const { user, loading: authLoading, role, selectedModules } = useAuth();
    const allModules = getAllModules();
    
    const [stats, setStats] = useState<Stat[]>([]);
    const [devData, setDevData] = useState<DevelopmentData | null>(null);
    const [enrollments, setEnrollments] = useState<Record<string, any>>({});
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            
            try {
                const [statsRes, devRes, wisdomRes] = await Promise.all([
                    fetch(`/api/user/stats?userId=${user.uid}`),
                    fetch(`/api/user/development?userId=${user.uid}`),
                    fetch(`/api/wisdom?userId=${user.uid}`)
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (devRes.ok) {
                    const developmentData = await devRes.json();
                    setDevData(developmentData);
                }

                if (wisdomRes.ok) {
                    const wisdomData = await wisdomRes.json();
                    setEnrollments(wisdomData.enrollments || {});
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setDataLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchDashboardData();
        }
    }, [user, authLoading]);

    // We filter modules to show as "Active Programs"
    const activePrograms = allModules
        .filter(m => selectedModules.includes(m.id))
        .map((module, idx) => {
            const colors = [
                { tabColor: 'bg-teal-600', bgColor: 'bg-teal-50', tabLabel: 'Health' },
                { tabColor: 'bg-sky-600', bgColor: 'bg-sky-50', tabLabel: 'Growth' },
                { tabColor: 'bg-slate-700', bgColor: 'bg-slate-100', tabLabel: 'Focus' },
                { tabColor: 'bg-emerald-600', bgColor: 'bg-emerald-50', tabLabel: 'Journey' },
                { tabColor: 'bg-teal-700', bgColor: 'bg-teal-50', tabLabel: 'Sync' }
            ];

            // Real progress calculation for 'wisdom'
            let progress = 0;
            if (module.id === 'wisdom' && Object.keys(enrollments).length > 0) {
                const planIds = Object.keys(enrollments);
                if (planIds.length > 0) {
                    // Average progress across enrolled plans
                    const totalProgress = planIds.reduce((sum, id) => {
                        const e = enrollments[id];
                        const pct = e.totalSteps > 0 ? (e.completedSteps?.length || 0) / e.totalSteps : 0;
                        return sum + pct;
                    }, 0);
                    progress = (totalProgress / planIds.length) * 100;
                }
            } else if (module.id === 'development') {
                // Use level/XP for growth progress
                progress = devData ? (devData.xp / devData.xpNeeded) * 100 : 0;
            }

            return {
                ...module,
                ...colors[idx % colors.length],
                progress: Math.min(Math.round(progress), 100)
            };
        });

    if (authLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
                    <p className="mt-4 text-slate-500 text-sm font-medium">Preparing your dashboard...</p>
                </div>
            </div>
        );
    }

    // Find specific stats for the summary boxes
    const bibleEngagement = stats.find(s => s.label.toLowerCase().includes('bible'))?.value || '0%';
    const prayerStreak = stats.find(s => s.label.toLowerCase().includes('prayer'))?.value || '0 Days';
    const growthPoints = stats.find(s => s.label.toLowerCase().includes('growth'))?.value || '0';

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20 pt-2 lg:pt-4 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 mb-1 lg:mb-2">
                        Overview
                    </h1>
                    <p className="text-slate-500 font-medium text-xs lg:text-sm">
                        Your journey with Christ, visualized.
                    </p>
                </div>
                <div className="flex gap-2 lg:gap-3">
                    <button className="flex-1 lg:flex-none px-4 lg:px-6 py-2 bg-white text-slate-700 rounded-lg text-xs lg:text-sm font-semibold hover:bg-slate-100 transition-colors shadow-sm border border-slate-200">
                        Weekly
                    </button>
                    <button className="flex-1 lg:flex-none px-4 lg:px-6 py-2 bg-teal-600 text-white rounded-lg text-xs lg:text-sm font-semibold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-colors">
                        Today
                    </button>
                </div>
            </div>


            {/* Active Programs (Folder-Tab style) */}
            <div className="pt-4 lg:pt-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <h2 className="text-base lg:text-lg font-bold text-slate-700">Continue Journey</h2>
                    <div className="flex gap-2">
                        <span className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-teal-600 text-white text-[10px] lg:text-xs font-bold">{activePrograms.length}</span>
                    </div>

                    <Link href="/dashboard" className="ml-auto text-xs lg:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                        View All
                    </Link>
                </div>

                <div className="grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {activePrograms.map((program) => (
                        <Link
                            key={program.id}
                            href={getModuleRoute(program.id, role)}
                            className="block group relative pt-8 transition-transform hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {/* Tab */}
                            <div className={`absolute top-0 left-0 h-8 px-4 lg:px-5 flex items-center justify-center rounded-t-lg font-semibold text-[10px] lg:text-xs text-white ${program.tabColor} shadow-sm z-10 transition-colors`}>
                                {program.tabLabel}
                            </div>

                            {/* Card Body */}
                            <div className={`relative z-0 ${program.bgColor} rounded-xl rounded-tl-none p-5 lg:p-6 shadow-sm border border-black/5 min-h-[140px] lg:min-h-[160px] flex flex-col`}>
                                <div className="flex-1">
                                    <h4 className="text-lg lg:text-xl font-bold text-slate-800 mb-1 lg:mb-2">
                                        {program.label}
                                    </h4>
                                    <p className="text-slate-600 text-xs lg:text-sm font-medium leading-relaxed">
                                        Pick up where you left off.
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    {/* Real Progress Bar */}
                                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${program.tabColor} rounded-full opacity-80 transition-all duration-500`} 
                                            style={{ width: `${program.progress || 0}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            {program.progress > 0 ? `${program.progress}% Progress` : 'Getting Started'}
                                        </span>
                                        <span className={`text-[10px] lg:text-xs font-bold ${program.tabColor.replace('bg-', 'text-')} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                            {program.progress > 0 ? 'Resume Path' : 'Start Journey'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom Status Section (Real Data Integration) */}
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 pt-4 lg:pt-6">
                {/* Status Box 1: Growth Summary */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base lg:text-lg font-bold text-slate-800">Spiritual Vitality</h3>
                            <div className={`w-2 h-2 rounded-full ${parseInt(bibleEngagement) > 0 ? 'bg-teal-500' : 'bg-slate-300'} ml-2`} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 my-4">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bible Engagement</p>
                                <p className="text-2xl font-black text-slate-800">{bibleEngagement}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prayer Streak</p>
                                <p className="text-2xl font-black text-slate-800">{prayerStreak}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-xs lg:text-sm leading-relaxed mb-6 font-medium">
                            {parseInt(bibleEngagement) > 20 
                                ? 'Excellent work! Your consistency in the Word is showing in your growth map.' 
                                : 'Keep going! Regular engagement with devotions builds a strong spiritual foundation.'}
                        </p>
                    </div>

                    <button className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs lg:text-sm font-semibold hover:bg-slate-200 transition-colors self-start">
                        Full Statistics
                    </button>
                </div>

                {/* Status Box 2: Growth Milestone */}
                <div className="rounded-2xl p-6 lg:p-8 relative overflow-hidden bg-slate-800 text-white min-h-[200px] lg:min-h-[250px] shadow-sm flex flex-col justify-end">
                    {/* Decorative abstract art matching admin dashboard */}
                    <div className="absolute top-0 right-0 w-48 lg:w-64 h-full bg-teal-600 rounded-l-[100px] opacity-90 transform translate-x-12 -scale-x-100" />
                    <div className="absolute top-0 right-0 w-24 lg:w-32 h-full bg-sky-500 rounded-l-[100px] opacity-90 transform translate-x-4 -scale-x-100" />

                    <div className="relative z-10 w-full lg:w-2/3">
                        <h3 className="text-xs font-semibold text-slate-300 mb-2 lg:mb-4 uppercase tracking-wider">Current Milestone</h3>
                        <p className="text-xl lg:text-3xl font-bold tracking-tight mb-1 lg:mb-2 text-teal-50">
                            {devData?.levelName || 'Seeker'}
                        </p>
                        <div className="flex items-center gap-3 mb-3">
                             <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-teal-400 rounded-full" 
                                    style={{ width: `${Math.min(((devData?.xp || 0) / (devData?.xpNeeded || 100)) * 100, 100)}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-black text-teal-400">{devData?.xp || 0} XP</span>
                        </div>
                        <p className="text-[10px] lg:text-xs text-slate-400 font-medium">
                            {devData?.nextMilestone ? `Next: ${devData.nextMilestone}` : 'Continue your journey to unlock more.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

