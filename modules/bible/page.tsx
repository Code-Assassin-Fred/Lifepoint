'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    limit,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import {
    BookOpen,
    Sun,
    BookMarked,
    ChevronRight,
    ChevronLeft,
    Plus,
    Sparkles,
    Send,
    Trash2,
    Lightbulb,
} from 'lucide-react';
import DevotionModal from '@/components/bible/DevotionModal';
import StudyPlanModal from '@/components/bible/StudyPlanModal';

interface Devotion {
    id: string;
    date: string;
    title: string;
    scripture: string;
    content: string;
    prayerPrompt?: string;
}

interface StudyDay {
    dayNumber: number;
    title: string;
    scripture: string;
    content: string;
}

interface StudyPlan {
    id: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    days: StudyDay[];
}

type Tab = 'devotion' | 'plans' | 'ai';

export default function BibleModule() {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('devotion');

    // Modals
    const [isDevotionModalOpen, setIsDevotionModalOpen] = useState(false);
    const [isStudyPlanModalOpen, setIsStudyPlanModalOpen] = useState(false);

    // Data
    const [todayDevotion, setTodayDevotion] = useState<Devotion | null>(null);
    const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
    const [loadingDevotion, setLoadingDevotion] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // Study Plan View
    const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
    const [currentDay, setCurrentDay] = useState(0);

    // AI
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const isAdmin = role === 'admin';

    // Get today's date string
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    // Fetch today's devotion
    useEffect(() => {
        const q = query(collection(db, 'devotions'), orderBy('date', 'desc'), limit(1));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const docData = snapshot.docs[0];
                    setTodayDevotion({ id: docData.id, ...docData.data() } as Devotion);
                } else {
                    setTodayDevotion(null);
                }
                setLoadingDevotion(false);
            },
            () => setLoadingDevotion(false)
        );
        return () => unsubscribe();
    }, []);

    // Fetch study plans
    useEffect(() => {
        const q = query(collection(db, 'studyPlans'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const plans = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as StudyPlan[];
                setStudyPlans(plans);
                setLoadingPlans(false);
            },
            () => setLoadingPlans(false)
        );
        return () => unsubscribe();
    }, []);

    const handleAskAI = async (action: string, content: string, context?: string) => {
        if (!content.trim()) return;
        setAiLoading(true);
        setAiResponse('');

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, content, context }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setAiResponse(data.response);
        } catch {
            setAiResponse('Sorry, I encountered an error. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleDeleteDevotion = async (id: string) => {
        if (!confirm('Delete this devotion?')) return;
        await deleteDoc(doc(db, 'devotions', id));
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Delete this study plan?')) return;
        await deleteDoc(doc(db, 'studyPlans', id));
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'devotion', label: 'Daily Devotion', icon: Sun },
        { id: 'plans', label: 'Study Plans', icon: BookMarked },
        { id: 'ai', label: 'Ask the Word', icon: Sparkles },
    ];

    // Render Study Plan Detail View
    if (selectedPlan) {
        const day = selectedPlan.days[currentDay];
        return (
            <div className="max-w-3xl">
                {/* Back Button */}
                <button
                    onClick={() => {
                        setSelectedPlan(null);
                        setCurrentDay(0);
                        setAiResponse('');
                    }}
                    className="flex items-center gap-2 text-black/60 hover:text-black mb-6"
                >
                    <ChevronLeft size={18} />
                    Back to Study Plans
                </button>

                {/* Plan Header */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 mb-6">
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                        {selectedPlan.category}
                    </span>
                    <h2 className="text-xl font-bold text-black mt-2">{selectedPlan.title}</h2>
                    <p className="text-black/60 text-sm mt-1">{selectedPlan.description}</p>
                </div>

                {/* Day Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => {
                            setCurrentDay(Math.max(0, currentDay - 1));
                            setAiResponse('');
                        }}
                        disabled={currentDay === 0}
                        className="p-2 text-black/60 hover:text-black disabled:opacity-30"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-medium text-black">
                        Day {day.dayNumber} of {selectedPlan.days.length}
                    </span>
                    <button
                        onClick={() => {
                            setCurrentDay(Math.min(selectedPlan.days.length - 1, currentDay + 1));
                            setAiResponse('');
                        }}
                        disabled={currentDay === selectedPlan.days.length - 1}
                        className="p-2 text-black/60 hover:text-black disabled:opacity-30"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Day Content */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
                    <h3 className="font-semibold text-black text-lg">{day.title}</h3>
                    <p className="text-red-600 text-sm mt-1">{day.scripture}</p>
                    {day.content && (
                        <p className="text-black/70 mt-4 leading-relaxed whitespace-pre-wrap">{day.content}</p>
                    )}
                </div>

                {/* Embedded AI - Wisdom from the Word */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb size={20} className="text-amber-600" />
                        <span className="font-semibold text-black">Wisdom from the Word</span>
                    </div>

                    {/* Quick AI Actions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => handleAskAI('explain-scripture', day.scripture, `Study: ${selectedPlan.title}, Day ${day.dayNumber}: ${day.title}`)}
                            disabled={aiLoading}
                            className="px-3 py-1.5 bg-white text-xs font-medium text-black/70 rounded-lg hover:bg-amber-100 disabled:opacity-50 border border-amber-200"
                        >
                            Explain this passage
                        </button>
                        <button
                            onClick={() => handleAskAI('study-insight', day.scripture, `Help me understand: ${day.title}`)}
                            disabled={aiLoading}
                            className="px-3 py-1.5 bg-white text-xs font-medium text-black/70 rounded-lg hover:bg-amber-100 disabled:opacity-50 border border-amber-200"
                        >
                            Deeper insights
                        </button>
                        <button
                            onClick={() => handleAskAI('prayer-guidance', day.scripture)}
                            disabled={aiLoading}
                            className="px-3 py-1.5 bg-white text-xs font-medium text-black/70 rounded-lg hover:bg-amber-100 disabled:opacity-50 border border-amber-200"
                        >
                            Guide my prayer
                        </button>
                    </div>

                    {/* Custom Question */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={aiQuestion}
                            onChange={(e) => setAiQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', `Regarding ${day.scripture}: ${aiQuestion}`)}
                            placeholder="Ask a question about today's study..."
                            className="w-full px-4 py-3 pr-12 bg-white border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        />
                        <button
                            onClick={() => handleAskAI('ask-question', `Regarding ${day.scripture}: ${aiQuestion}`)}
                            disabled={aiLoading || !aiQuestion.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg disabled:opacity-50"
                        >
                            {aiLoading ? (
                                <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                            ) : (
                                <Send size={16} />
                            )}
                        </button>
                    </div>

                    {/* AI Response */}
                    {aiLoading && !aiResponse && (
                        <div className="flex items-center gap-2 text-black/60 text-sm">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="ml-2">Seeking wisdom...</span>
                        </div>
                    )}

                    {aiResponse && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200">
                            <p className="text-black/80 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                        <p className="text-sm text-black/60">Daily devotions, study plans, and wisdom from the Word</p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsDevotionModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-black text-sm rounded-xl font-medium hover:bg-gray-200"
                        >
                            <Plus size={16} />
                            Devotion
                        </button>
                        <button
                            onClick={() => setIsStudyPlanModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700"
                        >
                            <Plus size={16} />
                            Study Plan
                        </button>
                    </div>
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
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive ? 'border-red-600 text-red-600' : 'border-transparent text-black/60 hover:text-black'
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
                        {loadingDevotion ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                            </div>
                        ) : todayDevotion ? (
                            <>
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-red-600 font-medium">{dateString}</p>
                                            <h3 className="text-lg font-bold text-black mt-1">{todayDevotion.title}</h3>
                                            <p className="text-black/70 text-sm mt-1">{todayDevotion.scripture}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button onClick={() => handleDeleteDevotion(todayDevotion.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                                                <Sun size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <p className="text-black/80 leading-relaxed whitespace-pre-wrap">{todayDevotion.content}</p>
                                    {todayDevotion.prayerPrompt && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                            <p className="text-sm font-medium text-black mb-2">Prayer Prompt</p>
                                            <p className="text-black/70 text-sm">{todayDevotion.prayerPrompt}</p>
                                        </div>
                                    )}
                                </div>

                                {/* AI for Devotion */}
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Lightbulb size={20} className="text-amber-600" />
                                        <span className="font-semibold text-black">Wisdom from the Word</span>
                                    </div>
                                    <button
                                        onClick={() => handleAskAI('devotion-reflection', todayDevotion.scripture)}
                                        disabled={aiLoading}
                                        className="w-full py-3 bg-white text-black/70 rounded-xl border border-amber-200 hover:bg-amber-100 disabled:opacity-50 text-sm font-medium"
                                    >
                                        {aiLoading ? 'Seeking wisdom...' : `Get insights on ${todayDevotion.scripture}`}
                                    </button>
                                    {aiResponse && (
                                        <div className="mt-4 bg-white rounded-xl p-4 border border-amber-200">
                                            <p className="text-black/80 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <Sun size={24} className="text-black/40 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-black mb-2">No Devotion Today</h3>
                                <p className="text-black/60 text-sm">{isAdmin ? 'Create a devotion to get started.' : 'Check back soon.'}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Study Plans */}
                {activeTab === 'plans' && (
                    <div className="space-y-3">
                        {loadingPlans ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                            </div>
                        ) : studyPlans.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <BookMarked size={24} className="text-black/40 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-black mb-2">No Study Plans Yet</h3>
                                <p className="text-black/60 text-sm">{isAdmin ? 'Create your first study plan.' : 'Study plans will appear here soon.'}</p>
                            </div>
                        ) : (
                            studyPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-red-200 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">{plan.category}</span>
                                                <span className="text-xs text-black/50">{plan.duration}</span>
                                            </div>
                                            <h4 className="font-medium text-black text-sm">{plan.title}</h4>
                                            <p className="text-xs text-black/60 mt-1">{plan.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <ChevronRight size={18} className="text-black/30" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Ask the Word (Standalone AI) */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Lightbulb size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black">Wisdom from the Word</h3>
                                    <p className="text-xs text-black/60">Your AI-powered scripture study companion</p>
                                </div>
                            </div>
                            <p className="text-black/70 text-sm">
                                I can help you understand scripture with historical context, original language insights,
                                theological connections, and practical applications.
                            </p>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', aiQuestion)}
                                placeholder='Ask about any scripture... e.g., "What does Romans 8:28 mean?"'
                                className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            />
                            <button
                                onClick={() => handleAskAI('ask-question', aiQuestion)}
                                disabled={aiLoading || !aiQuestion.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <div className="w-5 h-5 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>

                        {aiResponse && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <p className="text-black/80 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <DevotionModal isOpen={isDevotionModalOpen} onClose={() => setIsDevotionModalOpen(false)} />
            <StudyPlanModal isOpen={isStudyPlanModalOpen} onClose={() => setIsStudyPlanModalOpen(false)} />
        </div>
    );
}
