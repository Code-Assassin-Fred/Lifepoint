'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import {
    GraduationCap,
    ChevronRight,
    BookMarked,
    Users,
    Trophy,
    Calendar,
    Settings,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Users2,
    CalendarDays,
    Settings2,
    Map,
    MessageCircle,
    Star,
    Flame
} from 'lucide-react';
import GrowthPlanModal from '@/components/wisdom/GrowthPlanModal';
import MentorshipRequestModal from '@/components/development/MentorshipRequestModal';
import ScheduleSessionModal from '@/components/development/ScheduleSessionModal';

export default function GrowthModule() {
    const { role, user } = useAuth();
    const isAdmin = role === 'admin';
    const [activeTab, setActiveTab] = useState<string>('journey');
    const [journeyData, setJourneyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [mentors, setMentors] = useState<any[]>([]);

    const refreshData = () => setRefreshTrigger(prev => prev + 1);

    const tabs = isAdmin ? [
        { id: 'dashboard', label: 'Admin Feed', icon: Trophy },
        { id: 'requests', label: 'Mentorship Requests', icon: MessageCircle },
        { id: 'sessions', label: 'Schedule Sessions', icon: CalendarDays },
        { id: 'plans', label: 'Manage Plans', icon: BookMarked },
    ] : [
        { id: 'journey', label: 'My Journey', icon: Trophy },
        { id: 'plans', label: 'Growth Plans', icon: BookMarked },
        { id: 'mentorship', label: 'Mentorship', icon: Users },
    ];

    useEffect(() => {
        if (isAdmin && activeTab === 'journey') {
            setActiveTab('dashboard');
        }
    }, [isAdmin]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch Journey Data
                const journeyRes = await fetch(`/api/user/development?userId=${user.uid}`);
                if (journeyRes.ok) {
                    const data = await journeyRes.json();
                    setJourneyData(data);
                }

                // Fetch Plans
                const plansRes = await fetch('/api/development/plans');
                if (plansRes.ok) {
                    const data = await plansRes.json();
                    setPlans(data);
                }

                // Fetch Sessions
                const sessionsRes = await fetch(`/api/development/sessions?userId=${user.uid}&role=${role}`);
                if (sessionsRes.ok) {
                    const data = await sessionsRes.json();
                    setSessions(data);
                }

                // Fetch Requests (if admin)
                if (isAdmin) {
                    const requestsRes = await fetch(`/api/development/requests?role=admin`);
                    if (requestsRes.ok) {
                        const data = await requestsRes.json();
                        setRequests(data);
                    }
                }

                // Fetch Mentors
                const mentorsRes = await fetch('/api/development/mentors');
                if (mentorsRes.ok) {
                    const data = await mentorsRes.json();
                    setMentors(data);
                }
            } catch (error) {
                console.error('Failed to fetch development data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, role, activeTab, refreshTrigger]);

    const handleRequestAction = async (requestId: string, status: 'approved' | 'declined') => {
        try {
            const res = await fetch('/api/development/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, status })
            });
            if (res.ok) {
                refreshData();
            }
        } catch (error) {
            console.error('Failed to update request:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                        Growth & Mentorship
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        Chart your spiritual course and find guidance for the journey.
                    </p>
                </div>
                <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-3xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-white text-black shadow-lg shadow-black/5'
                                    : 'text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Admin Dashboard / Feed */}
            {activeTab === 'dashboard' && isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 animate-in fade-in duration-500">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Bishop's Oversight</h2>
                            <p className="text-zinc-400 font-bold mb-6">Manage spiritual growth and mentorship across the community.</p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <Users2 size={16} className="text-[#ccf381]" />
                                    <span className="text-xs font-black">{requests.filter(r => r.status === 'pending').length} PENDING REQUESTS</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <CalendarDays size={16} className="text-[#ccf381]" />
                                    <span className="text-xs font-black">{sessions.length} UPCOMING SESSIONS</span>
                                </div>
                            </div>
                        </div>

                        <div className="py-6">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Active Mentorships</h3>
                                <button className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest hover:underline">View All</button>
                            </div>
                            <div className="space-y-6">
                                {requests.filter(r => r.status === 'approved').slice(0, 5).map((req, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#ccf381] flex items-center justify-center text-black font-black">
                                                {req.userName?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-zinc-900">{req.userName}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{req.area}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">
                                            View Progress
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="py-6 border-b border-zinc-100">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 border-b border-zinc-50 pb-4">Bishop's Actions</h3>
                            <div className="space-y-4">
                                <button onClick={() => setIsScheduling(true)} className="w-full p-4 bg-zinc-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                                    <CalendarDays size={18} />
                                    SCHEDULE SESSION
                                </button>
                                <button onClick={() => setIsPlanModalOpen(true)} className="w-full p-4 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-2xl font-black text-xs tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3">
                                    <Plus size={18} />
                                    CREATE GROWTH PLAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'journey' && !isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 animate-in fade-in duration-500">
                    {/* Left: Journey Map */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Status Card */}
                        <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccf381]/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-32 h-32 rounded-full border-4 border-[#ccf381] flex items-center justify-center relative">
                                    <span className="text-4xl font-black">{Math.round((journeyData.xp / (journeyData.xp + journeyData.xpNeeded)) * 100)}%</span>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ccf381] text-black rounded-full flex items-center justify-center">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black mb-2 tracking-tight">Level {journeyData.level}: {journeyData.levelName}</h2>
                                    <p className="text-zinc-400 font-bold mb-6">Next Milestone: {journeyData.nextMilestone} ({journeyData.xpNeeded} XP needed)</p>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                            <Flame size={16} className="text-[#ccf381]" />
                                            <span className="text-xs font-black">{journeyData.streak} DAY STREAK</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                            <Trophy size={16} className="text-[#ccf381]" />
                                            <span className="text-xs font-black">{journeyData.badges} BADGES</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Journey Map Visualization */}
                        <div className="py-6">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-10">Pathway Overview</h3>

                            <div className="relative">
                                {/* Connection Line */}
                                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-zinc-100" />

                                <div className="space-y-12">
                                    {journeyData.steps.map((step: any, i: number) => {
                                        const Icon = step.icon === 'CheckCircle2' ? CheckCircle2 : step.icon === 'Clock' ? Clock : step.icon === 'Settings' ? Settings : Users;
                                        return (
                                            <div key={i} className="relative flex items-center gap-8 pl-20 group">
                                                <div className={`absolute left-0 w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all z-10 ${step.status === 'completed' ? 'bg-[#ccf381] border-[#ccf381] text-black' :
                                                        step.status === 'active' ? 'bg-white border-[#0d9488] text-[#0d9488]' :
                                                            'bg-zinc-50 border-zinc-100 text-zinc-300'
                                                    }`}>
                                                    <Icon size={28} />
                                                </div>

                                                <div className="flex-1 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group-hover:bg-[#ccf381]/5 transition-all">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className={`font-black text-lg ${step.status === 'locked' ? 'text-zinc-400' : 'text-zinc-900'}`}>{step.title}</h4>
                                                        {step.status === 'active' && <span className="px-3 py-1 bg-[#0d9488] text-white text-[10px] font-black rounded-lg">IN PROGRESS</span>}
                                                    </div>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{step.dur}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Daily Habits & Quick Actions */}
                    <div className="space-y-8">
                        <div className="py-6">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 border-b border-zinc-50 pb-4">Daily Habits</h3>
                            <div className="space-y-4">
                                {journeyData.habits.map((habit: any, i: number) => {
                                    const Icon = habit.icon === 'BookMarked' ? BookMarked : habit.icon === 'Flame' ? Flame : habit.icon === 'CheckCircle2' ? CheckCircle2 : Clock;
                                    return (
                                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${habit.done ? 'bg-zinc-50 border-zinc-100 text-zinc-400' : 'bg-white border-zinc-100 text-zinc-900 hover:border-[#ccf381]'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${habit.done ? 'bg-zinc-200' : 'bg-[#ccf381]/20 text-[#0d9488]'}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className="text-sm font-bold">{habit.label}</span>
                                            </div>
                                            <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${habit.done ? 'bg-[#ccf381] border-[#ccf381] text-black' : 'border-zinc-200 hover:border-[#ccf381]'
                                                }`}>
                                                {habit.done && <CheckCircle2 size={12} fill="currentColor" />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-[#0d9488] rounded-[3rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Mentorship Activity</h4>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex -space-x-3">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-200 border-4 border-[#0d9488] overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?u=1" alt="Mentor" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-black">Pastor David Miller</p>
                                    <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Spiritual Mentor</p>
                                </div>
                            </div>
                            <div className="p-4 bg-black/10 rounded-2xl border border-white/5 mb-6">
                                <p className="text-[10px] font-black text-teal-200 uppercase tracking-widest mb-1">Next Session</p>
                                <p className="text-sm font-bold">Tomorrow, 4:00 PM</p>
                            </div>
                            <button className="w-full py-4 bg-[#ccf381] text-black rounded-[2rem] font-bold text-sm tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2">
                                <MessageCircle size={18} />
                                SEND MESSAGE
                            </button>
                        </div>
                    </div>
                </div>
            )}

                    {activeTab === 'mentorship' && !isAdmin && (
                <div className="px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="py-6">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black mb-2">My Sessions</h3>
                                    <p className="text-zinc-500 font-bold mb-8">Upcoming spiritual guidance sessions.</p>
                                </div>
                                <button 
                                    onClick={() => setIsRequesting(true)}
                                    className="px-6 py-3 bg-[#0d9488] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#0d9488]/20 hover:bg-[#0f766e] transition-all"
                                >
                                    Request Mentorship
                                </button>
                            </div>

                            <div className="space-y-4">
                                {sessions.length > 0 ? sessions.map((session, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-zinc-900 text-[#ccf381] rounded-2xl flex items-center justify-center">
                                                <CalendarDays size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-zinc-900">{session.title}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                    {new Date(session.scheduledAt).toLocaleString()} • {session.type}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                            Join
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 opacity-50">No upcoming sessions.</div>
                                )}
                            </div>
                        </div>

                        <div className="py-6">
                            <h3 className="text-2xl font-black mb-2">Mentors</h3>
                            <p className="text-zinc-500 font-bold mb-8">Connect with experienced guides.</p>

                            <div className="space-y-4">
                                {mentors.length > 0 ? mentors.map((mentor, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <img src={mentor.photoURL} className="w-14 h-14 rounded-2xl object-cover" alt={mentor.displayName} />
                                            <div>
                                                <h4 className="font-black text-zinc-900">{mentor.displayName}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{mentor.role}</p>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-white text-zinc-400 group-hover:bg-[#ccf381] group-hover:text-black rounded-xl transition-all">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 opacity-50 font-bold">No mentors available yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'requests' && isAdmin && (
                <div className="px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="py-6">
                        <h3 className="text-2xl font-black mb-8 tracking-tight">Mentorship Requests</h3>
                        <div className="divide-y divide-zinc-100">
                            {requests.map((req, i) => (
                                <div key={i} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 text-xl font-black border border-zinc-200">
                                            {req.userName?.[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-black text-zinc-900">{req.userName}</h4>
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    req.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-500 mb-2">{req.reason}</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Target Area: {req.area}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {req.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleRequestAction(req.id, 'approved')}
                                                    className="px-6 py-3 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleRequestAction(req.id, 'declined')}
                                                    className="px-6 py-3 bg-white border border-zinc-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sessions' && isAdmin && (
                <div className="px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="py-6">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black tracking-tight">Mentor Sessions</h3>
                            <button 
                                onClick={() => setIsScheduling(true)}
                                className="flex items-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-[2rem] text-xs font-black tracking-widest hover:bg-black transition-all"
                            >
                                <Plus size={18} />
                                SCHEDULE NEW SESSION
                            </button>
                        </div>
                        <div className="grid gap-6">
                            {sessions.map((session, i) => (
                                <div key={i} className="flex items-center justify-between p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 hover:border-[#ccf381] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-zinc-900 text-[#ccf381] flex items-center justify-center">
                                            <CalendarDays size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-zinc-900 mb-1">{session.title}</h4>
                                            <p className="text-sm font-bold text-zinc-500">{new Date(session.scheduledAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Participants</p>
                                            <p className="text-sm font-black text-zinc-900">{session.participants?.length || 0} Attending</p>
                                        </div>
                                        <button className="p-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl hover:bg-zinc-100">
                                            <Settings2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <div className="px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {isAdmin && (
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={() => setIsPlanModalOpen(true)}
                                className="px-8 py-4 bg-[#0d9488] text-white rounded-[2rem] font-black text-xs tracking-widest hover:bg-[#0f766e] transition-all flex items-center gap-3"
                            >
                                <Plus size={18} />
                                NEW GROWTH PLAN
                            </button>
                        </div>
                    )}
                    {plans.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {plans.map((plan, i) => (
                                <div key={i} className="group py-8 relative overflow-hidden border-b border-zinc-100 last:border-0">
                                    <span className="px-4 py-1.5 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 inline-block">{plan.category}</span>
                                    <h3 className="text-2xl font-black text-zinc-900 mb-4 leading-tight">{plan.title}</h3>
                                    <p className="text-sm font-bold text-zinc-500 mb-8 line-clamp-2">{plan.description}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{plan.duration}</span>
                                        <button className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center hover:bg-[#0d9488] transition-all">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                <BookMarked size={40} className="text-zinc-200" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3 uppercase tracking-tight">No Growth Plans Yet</h3>
                            <p className="text-zinc-500 mb-8 max-w-sm font-medium text-sm">
                                The Bishop hasn't uploaded any growth plans for this community yet. Check back soon for guided spiritual paths.
                            </p>
                        </div>
                    )}
                </div>
            )}
            <GrowthPlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
            <MentorshipRequestModal isOpen={isRequesting} onClose={() => setIsRequesting(false)} onSuccess={refreshData} />
            <ScheduleSessionModal isOpen={isScheduling} onClose={() => setIsScheduling(false)} onSuccess={refreshData} />
        </div>
    );
}
