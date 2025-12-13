'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { BookOpen, Sun, BookMarked, Edit3, ChevronRight, Settings } from 'lucide-react';

type Tab = 'devotion' | 'plans' | 'notes';

export default function BibleModule() {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('devotion');

    const isAdmin = role === 'admin';

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'devotion', label: 'Daily Devotion', icon: Sun },
        { id: 'plans', label: 'Study Plans', icon: BookMarked },
        { id: 'notes', label: 'My Notes', icon: Edit3 },
    ];

    // Get current date for devotion
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-5xl">
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-black">Bible Study</h2>
                        <p className="text-sm text-black/70">Daily devotions, study plans, and personal notes</p>
                    </div>
                </div>

                {/* Admin Manage Content Button */}
                {isAdmin && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-black text-sm rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        <Settings size={16} />
                        Manage Content
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-black/60 hover:text-black'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div>
                {/* Daily Devotion */}
                {activeTab === 'devotion' && (
                    <div className="space-y-6">
                        {/* Today's Card */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-red-600 font-medium">{dateString}</p>
                                    <h3 className="text-lg font-bold text-black mt-1">Today&apos;s Devotion</h3>
                                    <p className="text-black/70 text-sm mt-1">Start your day with scripture and reflection</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                                    <Sun size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Placeholder Content */}
                        <div className="bg-gray-50 rounded-2xl p-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Sun size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-black mb-2">Coming Soon</h3>
                            <p className="text-black/60 text-sm max-w-md mx-auto">
                                Daily scripture readings, reflections, and prayer prompts will appear here
                            </p>
                        </div>
                    </div>
                )}

                {/* Study Plans */}
                {activeTab === 'plans' && (
                    <div className="space-y-3">
                        {/* Sample Plans */}
                        {[
                            { title: '21 Days of Faith', progress: 0, duration: '21 days', category: 'Faith' },
                            { title: 'Psalms for Anxiety', progress: 0, duration: '14 days', category: 'Peace' },
                            { title: 'Walking with Jesus', progress: 0, duration: '30 days', category: 'Discipleship' },
                        ].map((plan, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-red-200 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                                                {plan.category}
                                            </span>
                                            <span className="text-xs text-black/50">{plan.duration}</span>
                                        </div>
                                        <h4 className="font-medium text-black text-sm group-hover:text-red-600 transition-colors">
                                            {plan.title}
                                        </h4>
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className="text-black/30 group-hover:text-red-500 group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* More Coming */}
                        <div className="bg-gray-50 rounded-xl p-4 text-center mt-4">
                            <p className="text-black/60 text-sm">More study plans coming soon</p>
                        </div>
                    </div>
                )}

                {/* My Notes */}
                {activeTab === 'notes' && (
                    <div>
                        {/* Empty State */}
                        <div className="bg-gray-50 rounded-2xl p-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                <Edit3 size={24} className="text-black/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-black mb-2">No Notes Yet</h3>
                            <p className="text-black/60 text-sm max-w-md mx-auto mb-6">
                                Capture your thoughts, insights, and reflections as you study God&apos;s Word
                            </p>
                            <button className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-colors">
                                Create Your First Note
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
