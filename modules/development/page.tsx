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
    Flame,
    MessageCircle,
    Star,
    ArrowUpRight
} from 'lucide-react';

export default function GrowthModule() {
    const { role, user } = useAuth();
    const isAdmin = role === 'admin';
    const [activeTab, setActiveTab] = useState<'journey' | 'plans' | 'mentorship'>('journey');

    const tabs = [
        { id: 'journey', label: 'My Journey', icon: Trophy },
        { id: 'plans', label: 'Growth Plans', icon: BookMarked },
        { id: 'mentorship', label: 'Mentorship', icon: Users },
    ];

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

            {activeTab === 'journey' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 animate-in fade-in duration-500">
                    {/* Left: Journey Map */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Status Card */}
                        <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccf381]/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-32 h-32 rounded-full border-4 border-[#ccf381] flex items-center justify-center relative">
                                    <span className="text-4xl font-black">72%</span>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#ccf381] text-black rounded-full flex items-center justify-center">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black mb-2 tracking-tight">Level 4: Foundation Builder</h2>
                                    <p className="text-zinc-400 font-bold mb-6">Next Milestone: Leadership Essentials (800 XP needed)</p>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                            <Flame size={16} className="text-[#ccf381]" />
                                            <span className="text-xs font-black">12 DAY STREAK</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                            <Trophy size={16} className="text-[#ccf381]" />
                                            <span className="text-xs font-black">24 BADGES</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Journey Map Visualization */}
                        <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-10">Pathway Overview</h3>

                            <div className="relative">
                                {/* Connection Line */}
                                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-zinc-100" />

                                <div className="space-y-12">
                                    {[
                                        { status: 'completed', title: 'Believers Foundation', dur: '4 Weeks', icon: CheckCircle2 },
                                        { status: 'completed', title: 'Life in Community', dur: '3 Weeks', icon: CheckCircle2 },
                                        { status: 'active', title: 'Spiritual Gifts Discovery', dur: '2 Weeks', icon: Clock },
                                        { status: 'locked', title: 'Leadership Level 1', dur: '6 Weeks', icon: Settings },
                                        { status: 'locked', title: 'Mentorship Initiation', dur: 'Ongoing', icon: Users }
                                    ].map((step, i) => (
                                        <div key={i} className="relative flex items-center gap-8 pl-20 group">
                                            <div className={`absolute left-0 w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all z-10 ${step.status === 'completed' ? 'bg-[#ccf381] border-[#ccf381] text-black' :
                                                    step.status === 'active' ? 'bg-white border-[#0d9488] text-[#0d9488]' :
                                                        'bg-zinc-50 border-zinc-100 text-zinc-300'
                                                }`}>
                                                <step.icon size={28} />
                                            </div>

                                            <div className="flex-1 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group-hover:bg-[#ccf381]/5 transition-all">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className={`font-black text-lg ${step.status === 'locked' ? 'text-zinc-400' : 'text-zinc-900'}`}>{step.title}</h4>
                                                    {step.status === 'active' && <span className="px-3 py-1 bg-[#0d9488] text-white text-[10px] font-black rounded-lg">IN PROGRESS</span>}
                                                </div>
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{step.dur}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Daily Habits & Quick Actions */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] p-8 border border-zinc-100 shadow-sm">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 border-b border-zinc-50 pb-4">Daily Habits</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Scripture Reading', icon: BookMarked, done: true },
                                    { label: 'Morning Prayer', icon: Flame, done: true },
                                    { label: 'Devotional Entry', icon: CheckCircle2, done: false },
                                    { label: 'Evening Reflection', icon: Clock, done: false }
                                ].map((habit, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${habit.done ? 'bg-zinc-50 border-zinc-100 text-zinc-400' : 'bg-white border-zinc-100 text-zinc-900 hover:border-[#ccf381]'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${habit.done ? 'bg-zinc-200' : 'bg-[#ccf381]/20 text-[#0d9488]'}`}>
                                                <habit.icon size={16} />
                                            </div>
                                            <span className="text-sm font-bold">{habit.label}</span>
                                        </div>
                                        <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${habit.done ? 'bg-[#ccf381] border-[#ccf381] text-black' : 'border-zinc-200 hover:border-[#ccf381]'
                                            }`}>
                                            {habit.done && <CheckCircle2 size={12} fill="currentColor" />}
                                        </button>
                                    </div>
                                ))}
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

            {activeTab === 'mentorship' && (
                <div className="px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                            <h3 className="text-2xl font-black mb-2">Find a Mentor</h3>
                            <p className="text-zinc-500 font-bold mb-8">Connect with experienced guides who can help you navigate your spiritual walk.</p>

                            <div className="space-y-4">
                                {[
                                    { name: 'Dr. John Wilson', role: 'Theology & Leadership', img: 'https://i.pravatar.cc/150?u=2' },
                                    { name: 'Sarah Adams', role: 'Family & Fellowship', img: 'https://i.pravatar.cc/150?u=3' },
                                    { name: 'Mark Evans', role: 'Youth Ministry', img: 'https://i.pravatar.cc/150?u=4' }
                                ].map((mentor, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <img src={mentor.img} className="w-14 h-14 rounded-2xl object-cover" alt={mentor.name} />
                                            <div>
                                                <h4 className="font-black text-zinc-900">{mentor.name}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{mentor.role}</p>
                                            </div>
                                        </div>
                                        <button className="p-3 bg-white text-zinc-400 group-hover:bg-[#ccf381] group-hover:text-black rounded-xl transition-all">
                                            <ArrowUpRight size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-zinc-900 rounded-[3rem] p-10 text-white relative group">
                                <h3 className="text-2xl font-black mb-10">Application Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <p className="text-zinc-400 font-bold">Approved Mentors</p>
                                        <p className="text-3xl font-black text-[#ccf381]">12</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-zinc-400 font-bold">Active Mentorships</p>
                                        <p className="text-3xl font-black text-[#ccf381]">84</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-zinc-400 font-bold">Waitlisted</p>
                                        <p className="text-3xl font-black text-red-400">03</p>
                                    </div>
                                </div>
                                <button className="mt-10 w-full py-5 bg-white text-black rounded-[2.5rem] font-bold text-sm tracking-widest hover:bg-[#ccf381] transition-all">
                                    BECOME A MENTOR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* The existing plans library would go into the 'plans' tab */}
            {activeTab === 'plans' && (
                <div className="px-4 text-center py-20 bg-white rounded-[3rem] border border-dashed border-zinc-200">
                    <BookMarked size={48} className="mx-auto text-zinc-200 mb-6" />
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Growth Plan Library</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto font-medium">Browse our extensive collection of study plans and interactive spiritual programs.</p>
                </div>
            )}
        </div>
    );
}
