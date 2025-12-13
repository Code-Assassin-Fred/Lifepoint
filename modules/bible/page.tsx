'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    where,
    limit,
    deleteDoc,
    doc,
} from 'firebase/firestore';
import {
    BookOpen,
    Sun,
    BookMarked,
    Edit3,
    ChevronRight,
    Plus,
    Sparkles,
    Send,
    Trash2,
    X,
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

interface StudyPlan {
    id: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    days: { dayNumber: number; title: string; scripture: string; content: string }[];
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

    // AI Chat
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedScripture, setSelectedScripture] = useState('');

    const isAdmin = role === 'admin';

    // Get today's date string
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    // Fetch today's devotion
    useEffect(() => {
        const q = query(
            collection(db, 'devotions'),
            orderBy('date', 'desc'),
            limit(1)
        );
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    setTodayDevotion({ id: doc.id, ...doc.data() } as Devotion);
                } else {
                    setTodayDevotion(null);
                }
                setLoadingDevotion(false);
            },
            (error) => {
                console.error('Error fetching devotion:', error);
                setLoadingDevotion(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Fetch study plans
    useEffect(() => {
        const q = query(collection(db, 'studyPlans'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const plans = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as StudyPlan[];
                setStudyPlans(plans);
                setLoadingPlans(false);
            },
            (error) => {
                console.error('Error fetching study plans:', error);
                setLoadingPlans(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleAskAI = async (action: string, content: string) => {
        if (!content.trim()) return;

        setAiLoading(true);
        setAiResponse('');

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, content }),
            });

            if (!res.ok) throw new Error('Failed to get AI response');

            const data = await res.json();
            setAiResponse(data.response);
        } catch (error) {
            console.error('AI error:', error);
            setAiResponse('Sorry, I encountered an error. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleDeleteDevotion = async (id: string) => {
        if (!confirm('Delete this devotion?')) return;
        try {
            await deleteDoc(doc(db, 'devotions', id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Delete this study plan?')) return;
        try {
            await deleteDoc(doc(db, 'studyPlans', id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'devotion', label: 'Daily Devotion', icon: Sun },
        { id: 'plans', label: 'Study Plans', icon: BookMarked },
        { id: 'ai', label: 'AI Study Guide', icon: Sparkles },
    ];

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
                        <p className="text-sm text-black/60">Daily devotions, study plans, and AI-powered insights</p>
                    </div>
                </div>

                {/* Admin Buttons */}
                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsDevotionModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-black text-sm rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            <Plus size={16} />
                            Devotion
                        </button>
                        <button
                            onClick={() => setIsStudyPlanModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-colors"
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
                        {loadingDevotion ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                            </div>
                        ) : todayDevotion ? (
                            <>
                                {/* Header Card */}
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-red-600 font-medium">{dateString}</p>
                                            <h3 className="text-lg font-bold text-black mt-1">{todayDevotion.title}</h3>
                                            <p className="text-black/70 text-sm mt-1">{todayDevotion.scripture}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteDevotion(todayDevotion.id)}
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                                                <Sun size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <p className="text-black/80 leading-relaxed whitespace-pre-wrap">
                                        {todayDevotion.content}
                                    </p>

                                    {todayDevotion.prayerPrompt && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                            <p className="text-sm font-medium text-black mb-2">Prayer Prompt</p>
                                            <p className="text-black/70 text-sm">{todayDevotion.prayerPrompt}</p>
                                        </div>
                                    )}

                                    {/* AI Insight Button */}
                                    <button
                                        onClick={() => {
                                            setActiveTab('ai');
                                            setSelectedScripture(todayDevotion.scripture);
                                            handleAskAI('explain-scripture', todayDevotion.scripture);
                                        }}
                                        className="mt-6 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        <Sparkles size={16} />
                                        Get AI insights on {todayDevotion.scripture}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                    <Sun size={24} className="text-black/40" />
                                </div>
                                <h3 className="text-lg font-semibold text-black mb-2">No Devotion Today</h3>
                                <p className="text-black/60 text-sm max-w-md mx-auto">
                                    {isAdmin ? 'Create a devotion to get started.' : 'Check back soon for today\'s devotion.'}
                                </p>
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
                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                    <BookMarked size={24} className="text-black/40" />
                                </div>
                                <h3 className="text-lg font-semibold text-black mb-2">No Study Plans Yet</h3>
                                <p className="text-black/60 text-sm max-w-md mx-auto">
                                    {isAdmin ? 'Create your first study plan.' : 'Study plans will appear here soon.'}
                                </p>
                            </div>
                        ) : (
                            studyPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-red-200 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                                                    {plan.category}
                                                </span>
                                                <span className="text-xs text-black/50">{plan.duration}</span>
                                            </div>
                                            <h4 className="font-medium text-black text-sm">{plan.title}</h4>
                                            <p className="text-xs text-black/60 mt-1">{plan.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeletePlan(plan.id)}
                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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

                {/* AI Study Guide */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        {/* AI Header */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Sparkles size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black">Dr. Emmanuel</h3>
                                    <p className="text-xs text-black/60">PhD Theology Professor & Study Guide</p>
                                </div>
                            </div>
                            <p className="text-black/70 text-sm">
                                Ask me anything about scripture. I'll provide deep insights, historical context,
                                original language meanings, and practical applications.
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAskAI('explain-scripture', aiQuestion || 'John 3:16')}
                                disabled={aiLoading}
                                className="p-4 bg-white rounded-xl border border-gray-100 hover:border-red-200 text-left transition-all disabled:opacity-50"
                            >
                                <p className="font-medium text-black text-sm">Explain Scripture</p>
                                <p className="text-xs text-black/60 mt-1">Deep dive into a passage</p>
                            </button>
                            <button
                                onClick={() => handleAskAI('prayer-guidance', aiQuestion || 'Psalm 23')}
                                disabled={aiLoading}
                                className="p-4 bg-white rounded-xl border border-gray-100 hover:border-red-200 text-left transition-all disabled:opacity-50"
                            >
                                <p className="font-medium text-black text-sm">Prayer Guidance</p>
                                <p className="text-xs text-black/60 mt-1">How to pray this scripture</p>
                            </button>
                        </div>

                        {/* Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', aiQuestion)}
                                placeholder="Ask about any scripture or biblical topic..."
                                className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <button
                                onClick={() => handleAskAI('ask-question', aiQuestion)}
                                disabled={aiLoading || !aiQuestion.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                                {aiLoading ? (
                                    <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>

                        {/* Response */}
                        {aiResponse && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Sparkles size={14} className="text-purple-600" />
                                    </div>
                                    <span className="font-medium text-black text-sm">Dr. Emmanuel</span>
                                </div>
                                <div className="text-black/80 text-sm leading-relaxed whitespace-pre-wrap">
                                    {aiResponse}
                                </div>
                            </div>
                        )}

                        {aiLoading && !aiResponse && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Sparkles size={14} className="text-purple-600" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
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
