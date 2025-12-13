'use client';

import { useState } from 'react';
import { BookOpen, Sun, BookMarked, Edit3, ChevronRight } from 'lucide-react';

type Tab = 'devotion' | 'plans' | 'notes';

export default function BibleModule() {
    const [activeTab, setActiveTab] = useState<Tab>('devotion');

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
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <BookOpen size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bible Study</h2>
                    <p className="text-gray-500">Daily devotions, study plans, and personal notes</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${isActive
                                    ? 'border-red-600 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon size={18} />
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
                                    <p className="text-sm text-red-600 font-medium">{dateString}</p>
                                    <h3 className="text-xl font-bold text-gray-900 mt-1">Today&apos;s Devotion</h3>
                                    <p className="text-gray-600 mt-1">Start your day with scripture and reflection</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                                    <Sun size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Placeholder Content */}
                        <div className="bg-gray-50 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Sun size={28} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Daily scripture readings, reflections, and prayer prompts will appear here
                            </p>
                        </div>
                    </div>
                )}

                {/* Study Plans */}
                {activeTab === 'plans' && (
                    <div className="space-y-4">
                        {/* Sample Plans */}
                        {[
                            { title: '21 Days of Faith', progress: 0, duration: '21 days', category: 'Faith' },
                            { title: 'Psalms for Anxiety', progress: 0, duration: '14 days', category: 'Peace' },
                            { title: 'Walking with Jesus', progress: 0, duration: '30 days', category: 'Discipleship' },
                        ].map((plan, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-red-200 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                                                {plan.category}
                                            </span>
                                            <span className="text-xs text-gray-400">{plan.duration}</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                            {plan.title}
                                        </h4>
                                    </div>
                                    <ChevronRight
                                        size={20}
                                        className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* More Coming */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center mt-6">
                            <p className="text-gray-500 text-sm">More study plans coming soon</p>
                        </div>
                    </div>
                )}

                {/* My Notes */}
                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        {/* Empty State */}
                        <div className="bg-gray-50 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                <Edit3 size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notes Yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                Capture your thoughts, insights, and reflections as you study God&apos;s Word
                            </p>
                            <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                                Create Your First Note
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
