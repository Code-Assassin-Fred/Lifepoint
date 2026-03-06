'use client';

import { useState, useEffect, useRef } from 'react';
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
    where,
    getDocs,
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
    Wand2,
    Save,
    MessageSquare,
    Bot,
    Search,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import InsightModal from '@/components/wisdom/InsightModal';
import GrowthPlanModal from '@/components/wisdom/GrowthPlanModal';

interface Insight {
    id: string;
    date: string;
    title: string;
    scripture: string;
    content: string;
    prayerPrompt?: string;
}

interface GrowthStep {
    dayNumber: number;
    title: string;
    scripture: string;
    content: string;
}

interface GrowthPlan {
    id: string;
    title: string;
    description: string;
    category: string;
    duration: string;
    days: GrowthStep[];
}

type Tab = 'devotion' | 'plans' | 'ai' | 'admin-ai';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function WisdomModule() {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('devotion');

    // Modals & Pre-filled Data
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [isGrowthPlanModalOpen, setIsGrowthPlanModalOpen] = useState(false);
    const [insightInitialData, setInsightInitialData] = useState<any>(null);
    const [growthPlanInitialData, setGrowthPlanInitialData] = useState<any>(null);

    // Data
    const [insights, setInsights] = useState<Insight[]>([]);
    const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // Growth Plan View
    const [selectedPlan, setSelectedPlan] = useState<GrowthPlan | null>(null);
    const [currentDay, setCurrentDay] = useState(0);

    // AI - User Chat
    const [userAiMessages, setUserAiMessages] = useState<Message[]>([]);
    const [userAiInput, setUserAiInput] = useState('');
    const [userAiLoading, setUserAiLoading] = useState(false);

    // AI - Admin Chat
    const [adminMessages, setAdminMessages] = useState<Message[]>([]);
    const [adminInput, setAdminInput] = useState('');
    const [adminAiLoading, setAdminAiLoading] = useState(false);
    const adminChatEndRef = useRef<HTMLDivElement>(null);
    const [aiResponse, setAiResponse] = useState('');

    // Engagement State
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [enrollments, setEnrollments] = useState<Record<string, { completedSteps: number[] }>>({});

    // Search and Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categoriesList = ['All', 'Personal', 'Leadership', 'Knowledge', 'Wisdom', 'Inspiration', 'Growth'];

    const isAdmin = role === 'admin';
    const { user } = useAuth();
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const filteredPlans = growthPlans.filter(plan => {
        const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             plan.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Fetch insights (history)
    useEffect(() => {
        const q = query(collection(db, 'devotions'), orderBy('date', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Insight));
            setInsights(list);
            setLoadingInsights(false);
        }, () => setLoadingInsights(false));
        return () => unsubscribe();
    }, []);

    // Fetch growth plans
    useEffect(() => {
        const q = query(collection(db, 'studyPlans'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const plans = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GrowthPlan[];
            setGrowthPlans(plans);
            setLoadingPlans(false);
        }, () => setLoadingPlans(false));
        return () => unsubscribe();
    }, []);

    // Fetch user-specific engagement (bookmarks, enrollments)
    useEffect(() => {
        if (!user) return;

        // Fetch Bookmarks
        const bq = query(collection(db, 'userBookmarks'), where('userId', '==', user.uid));
        const unsubscribeBookmarks = onSnapshot(bq, (snapshot) => {
            setBookmarks(snapshot.docs.map(d => d.data().insightId));
        });

        // Fetch Enrollments
        const eq = query(collection(db, 'planEnrollments'), where('userId', '==', user.uid));
        const unsubscribeEnrollments = onSnapshot(eq, (snapshot) => {
            const data: Record<string, { completedSteps: number[] }> = {};
            snapshot.docs.forEach(d => {
                const docData = d.data();
                data[docData.planId] = { completedSteps: docData.completedSteps || [] };
            });
            setEnrollments(data);
        });

        return () => {
            unsubscribeBookmarks();
            unsubscribeEnrollments();
        };
    }, [user]);

    // Scroll to bottom of chats
    useEffect(() => {
        if (activeTab === 'admin-ai' || activeTab === 'ai') {
            adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [adminMessages, userAiMessages, activeTab]);

    const handleAskAI = async (action: string, content: string, context?: string) => {
        if (!content.trim() || !user) return;
        
        const newMessage: Message = { role: 'user', content };
        setUserAiMessages(prev => [...prev, newMessage]);
        setUserAiInput('');
        setUserAiLoading(true);

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'chat', 
                    messages: [...userAiMessages, newMessage],
                    context 
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setUserAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch {
            setUserAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setUserAiLoading(false);
        }
    };

    const handleAdminSend = async () => {
        if (!adminInput.trim()) return;

        const newMessage: Message = { role: 'user', content: adminInput };
        setAdminMessages(prev => [...prev, newMessage]);
        setAdminInput('');
        setAdminAiLoading(true);

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    messages: [...adminMessages, newMessage]
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setAdminMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch {
            setAdminMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setAdminAiLoading(false);
        }
    };

    const handleQuickAdminAction = (prompt: string) => {
        setAdminInput(prompt);
        // Optional: auto-send
        // handleAdminSend() would need adminInput updated first, better to just call logic directly
        const newMessage: Message = { role: 'user', content: prompt };
        setAdminMessages(prev => [...prev, newMessage]);
        setAdminInput('');
        setAdminAiLoading(true);

        fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'chat', messages: [...adminMessages, newMessage] }),
        })
            .then(r => r.json())
            .then(data => {
                setAdminMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                setAdminAiLoading(false);
            })
            .catch(() => {
                setAdminMessages(prev => [...prev, { role: 'assistant', content: 'Error getting response.' }]);
                setAdminAiLoading(false);
            });
    };

    // Admin AI - Generate Structured Content
    const handleGenerateContent = async (type: 'insight' | 'plan', prompt: string) => {
        setAdminAiLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: type === 'insight' ? 'generate-insight' : 'generate-plan', 
                    content: prompt,
                    format: 'json'
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            
            if (type === 'insight') {
                setInsightInitialData(data);
                setIsInsightModalOpen(true);
            } else {
                setGrowthPlanInitialData(data);
                setIsGrowthPlanModalOpen(true);
            }
        } catch (err) {
            console.error('Generation error:', err);
            alert('Failed to generate content. Please try again.');
        } finally {
            setAdminAiLoading(false);
        }
    };

    const handleSaveAsInsight = (text: string) => {
        handleGenerateContent('insight', `Based on this conversation, create a devotional: ${text.substring(0, 500)}`);
    };

    const handleSaveAsGrowthPlan = (text: string) => {
        handleGenerateContent('plan', `Based on this conversation, create a multi-day study plan: ${text.substring(0, 500)}`);
    };

    const handleDeleteInsight = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this insight?')) return;
        try {
            await deleteDoc(doc(db, 'devotions', id));
        } catch (err) {
            console.error('Error deleting insight:', err);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this growth plan?')) return;
        try {
            await deleteDoc(doc(db, 'studyPlans', id));
        } catch (err) {
            console.error('Error deleting plan:', err);
        }
    };

    const toggleBookmark = async (insightId: string) => {
        if (!user) return;
        const isBookmarked = bookmarks.includes(insightId);
        try {
            if (isBookmarked) {
                const q = query(collection(db, 'userBookmarks'), where('userId', '==', user.uid), where('insightId', '==', insightId));
                const snap = await getDocs(q);
                snap.forEach(d => deleteDoc(doc(db, 'userBookmarks', d.id)));
            } else {
                await addDoc(collection(db, 'userBookmarks'), {
                    userId: user.uid,
                    insightId,
                    createdAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error('Error toggling bookmark:', err);
        }
    };

    const toggleStepCompletion = async (planId: string, dayNumber: number) => {
        if (!user) return;
        const currentSteps = enrollments[planId]?.completedSteps || [];
        const isCompleted = currentSteps.includes(dayNumber);
        const newSteps = isCompleted 
            ? currentSteps.filter(s => s !== dayNumber)
            : [...currentSteps, dayNumber];

        try {
            const q = query(collection(db, 'planEnrollments'), where('userId', '==', user.uid), where('planId', '==', planId));
            const snap = await getDocs(q);
            
            if (!snap.empty) {
                await updateDoc(doc(db, 'planEnrollments', snap.docs[0].id), {
                    completedSteps: newSteps,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'planEnrollments'), {
                    userId: user.uid,
                    planId,
                    completedSteps: [dayNumber],
                    startedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    };

    const markdownComponents = {
        h2: ({ children }: any) => <h2 className="text-lg font-bold text-zinc-900 mt-4 mb-2 first:mt-0">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-base font-semibold text-zinc-900 mt-3 mb-1">{children}</h3>,
        p: ({ children }: any) => <p className="text-zinc-600 mb-2 leading-relaxed">{children}</p>,
        ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 text-zinc-600 space-y-1">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 text-zinc-600 space-y-1">{children}</ol>,
        li: ({ children }: any) => <li>{children}</li>,
    };

    if (selectedPlan) {
        const day = selectedPlan.days[currentDay];
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <button onClick={() => { setSelectedPlan(null); setCurrentDay(0); setAiResponse(''); }} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
                    <ChevronLeft size={18} /> Back to Growth Plans
                </button>
                <div className="glass-panel rounded-2xl p-8 mb-6 border-l-4 border-l-red-500">
                    <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-bold uppercase tracking-wider">{selectedPlan.category}</span>
                    <h2 className="text-2xl font-bold text-zinc-900 mt-3">{selectedPlan.title}</h2>
                    <p className="text-zinc-500 mt-2 leading-relaxed">{selectedPlan.description}</p>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => { setCurrentDay(Math.max(0, currentDay - 1)); setAiResponse(''); }} disabled={currentDay === 0} className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"><ChevronLeft size={24} /></button>
                    <span className="font-mono text-sm text-zinc-400 uppercase tracking-widest">Step {day.dayNumber} / {selectedPlan.days.length}</span>
                    <button onClick={() => { setCurrentDay(Math.min(selectedPlan.days.length - 1, currentDay + 1)); setAiResponse(''); }} disabled={currentDay === selectedPlan.days.length - 1} className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"><ChevronRight size={24} /></button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 mb-6 relative group">
                    <div className="absolute top-6 right-8">
                        <button 
                            onClick={() => toggleStepCompletion(selectedPlan.id, day.dayNumber)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                (enrollments[selectedPlan.id]?.completedSteps || []).includes(day.dayNumber)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                        >
                            {(enrollments[selectedPlan.id]?.completedSteps || []).includes(day.dayNumber) ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>
                    <h3 className="font-bold text-zinc-900 text-xl mb-2">{day.title}</h3>
                    <p className="text-red-600 font-serif italic text-lg mb-6">{day.scripture}</p>
                    {day.content && <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{day.content}</p>}
                </div>

                <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-3xl p-6 border border-amber-100/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Lightbulb size={18} />
                        </div>
                        <span className="font-bold text-zinc-900">AI Study Companion</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => handleAskAI('explain-scripture', day.scripture, `Study: ${selectedPlan.title}`)} disabled={userAiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-zinc-600 rounded-lg hover:text-amber-700 hover:border-amber-200 border border-transparent shadow-sm transition-all disabled:opacity-50">Explain passage</button>
                        <button onClick={() => handleAskAI('study-insight', day.scripture, day.title)} disabled={userAiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-zinc-600 rounded-lg hover:text-amber-700 hover:border-amber-200 border border-transparent shadow-sm transition-all disabled:opacity-50">Deeper insights</button>
                        <button onClick={() => handleAskAI('prayer-guidance', day.scripture)} disabled={userAiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-zinc-600 rounded-lg hover:text-amber-700 hover:border-amber-200 border border-transparent shadow-sm transition-all disabled:opacity-50">Guide my prayer</button>
                    </div>

                    <div className="relative mb-4">
                        <input type="text" value={userAiInput} onChange={(e) => setUserAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', userAiInput)} placeholder="Ask a question about today's study..." className="w-full px-4 py-3 pr-12 bg-white border border-amber-200/50 rounded-xl text-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" />
                        <button onClick={() => handleAskAI('ask-question', userAiInput)} disabled={userAiLoading || !userAiInput.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50 transition-colors">
                            {userAiLoading ? <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                    {userAiMessages.length > 0 && (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                            {userAiMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-amber-100 text-amber-900' : 'bg-white border border-amber-100 shadow-sm'}`}>
                                        <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            {/* Navigation & Actions */}
            <div className="flex-none mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex p-1 bg-zinc-100/50 rounded-xl w-fit">
                    {[{ id: 'devotion', label: 'Daily Insight', icon: Sun }, { id: 'plans', label: 'Growth Plans', icon: BookMarked }, { id: 'ai', label: 'AI Insight', icon: Sparkles }, { id: 'admin-ai', label: 'Content Assistant', icon: Wand2, adminOnly: true }]
                        .filter(t => !t.adminOnly || isAdmin)
                        .map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-zinc-500 hover:text-red-600 hover:bg-red-50/50'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-red-600' : 'text-zinc-400'} />
                                    {tab.label}
                                </button>
                            );
                        })}
                </div>

                {isAdmin && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setInsightInitialData(null); setIsInsightModalOpen(true); }} 
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm rounded-xl font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
                        >
                            <Plus size={16} /> Insight
                        </button>
                        <button 
                            onClick={() => { setGrowthPlanInitialData(null); setIsGrowthPlanModalOpen(true); }} 
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                        >
                            <Plus size={16} /> Growth Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8">
                {activeTab === 'devotion' && (
                    <div className="max-w-3xl space-y-6">
                        {loadingInsights ? (
                            <div className="space-y-4">
                                <div className="h-48 bg-zinc-100 rounded-3xl animate-pulse" />
                                <div className="h-24 bg-zinc-100 rounded-3xl animate-pulse" />
                            </div>
                        ) : insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <div key={insight.id} className={`animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="glass-panel rounded-3xl p-8 mb-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold mb-3">
                                                    {idx === 0 ? <><Sun size={12} /> Today's Word</> : 'Archive'}
                                                </span>
                                                <h3 className="text-3xl font-bold text-zinc-900 mb-2">{insight.title}</h3>
                                                <p className="text-zinc-500 font-medium">{new Date(insight.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                                <p className="text-red-600 font-serif italic mt-4 text-lg">{insight.scripture}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => toggleBookmark(insight.id)}
                                                    className={`p-2 rounded-xl transition-colors ${
                                                        bookmarks.includes(insight.id) 
                                                        ? 'text-red-600 bg-red-50' 
                                                        : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                                                    }`}
                                                >
                                                    <BookMarked size={18} fill={bookmarks.includes(insight.id) ? "currentColor" : "none"} />
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button 
                                                            onClick={() => { setInsightInitialData(insight); setIsInsightModalOpen(true); }} 
                                                            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteInsight(insight.id)} 
                                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-zinc-100">
                                            <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap text-lg">{insight.content}</p>
                                        </div>

                                        {insight.prayerPrompt && (
                                            <div className="mt-8 bg-zinc-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-16 bg-zinc-800 rounded-full blur-2xl -mr-8 -mt-8 opacity-50 pointer-events-none" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2 text-zinc-400">
                                                        <Sparkles size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Prayer Focus</span>
                                                    </div>
                                                    <p className="text-zinc-200 text-base leading-relaxed italic">"{insight.prayerPrompt}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-zinc-200">
                                <Sun size={32} className="text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Insights Yet</h3>
                                <p className="text-zinc-500 mb-6">Create the first insight to inspire the community.</p>
                                {isAdmin && <button onClick={() => { setInsightInitialData(null); setIsInsightModalOpen(true); }} className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-200">Create Insight</button>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-2">
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search plans by title or description..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                                {categoriesList.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                            selectedCategory === cat
                                            ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                                            : 'bg-white text-zinc-500 border border-zinc-100 hover:border-zinc-200 shadow-sm'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loadingPlans ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-40 bg-zinc-100 rounded-2xl animate-pulse" />
                                ))
                            ) : filteredPlans.length === 0 ? (
                                <div className="col-span-full glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-zinc-200">
                                    <BookMarked size={32} className="text-zinc-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                                        {searchQuery || selectedCategory !== 'All' ? 'No results found' : 'No Growth Plans'}
                                    </h3>
                                    <p className="text-zinc-500">Try adjusting your search or filters.</p>
                                </div>
                            ) : (
                                filteredPlans.map((plan) => (
                                    <div key={plan.id} className="group glass-panel rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-zinc-200 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white" onClick={() => setSelectedPlan(plan)} />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="inline-block px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{plan.category}</span>
                                                {isAdmin && (
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            onClick={() => { setGrowthPlanInitialData(plan); setIsGrowthPlanModalOpen(true); }} 
                                                            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-100"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletePlan(plan.id)} 
                                                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div onClick={() => setSelectedPlan(plan)}>
                                                <h4 className="font-bold text-zinc-900 text-lg mb-2 pr-6">{plan.title}</h4>
                                                <p className="text-zinc-500 text-sm line-clamp-2">{plan.description}</p>
                                                <div className="mt-4 flex flex-col gap-3">
                                                    {enrollments[plan.id] && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                                <span>Progress</span>
                                                                <span>{Math.round((enrollments[plan.id].completedSteps.length / plan.days.length) * 100)}%</span>
                                                            </div>
                                                            <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-green-500 transition-all duration-500" 
                                                                    style={{ width: `${(enrollments[plan.id].completedSteps.length / plan.days.length) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                                            {plan.duration}
                                                            {enrollments[plan.id] && (
                                                                <span className="flex items-center gap-1 text-green-600 ml-2">
                                                                    <Sparkles size={10} /> In Progress
                                                                </span>
                                                            )}
                                                        </div>
                                                        <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="max-w-3xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex-none text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl mx-auto flex items-center justify-center mb-4 text-amber-600 shadow-sm border border-amber-200/50">
                                <Bot size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-zinc-900 text-2xl tracking-tight">The Well</h3>
                            <p className="text-zinc-500 mt-2 text-sm leading-relaxed max-w-sm mx-auto">Draw from the well — ask questions about scripture, faith, or personal growth.</p>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto space-y-6 px-4 pb-4 no-scrollbar">
                            {userAiMessages.length === 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mt-4">
                                    {[
                                        "How do I find peace in stress?",
                                        "Explain the theme of Grace.",
                                        "Scripture for hard decisions",
                                        "Help me with my daily prayer"
                                    ].map((prompt) => (
                                        <button 
                                            key={prompt}
                                            onClick={() => handleAskAI('ask-question', prompt)}
                                            className="p-4 bg-white border border-zinc-100 rounded-2xl text-xs font-bold text-zinc-500 hover:border-amber-200 hover:text-amber-700 transition-all text-left shadow-sm"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userAiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-[1.5rem] p-5 shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-zinc-900 text-white rounded-br-none' 
                                        : 'bg-white border border-zinc-100 text-zinc-900 rounded-bl-none'
                                    }`}>
                                        <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-p:text-zinc-600'}`}>
                                            <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {userAiLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={adminChatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="flex-none p-4 mt-auto">
                            <div className="relative max-w-2xl mx-auto shadow-2xl shadow-zinc-900/5 rounded-2xl overflow-hidden">
                                <input 
                                    type="text" 
                                    value={userAiInput} 
                                    onChange={(e) => setUserAiInput(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', userAiInput)} 
                                    placeholder="Message your companion..." 
                                    className="w-full px-6 py-4 pr-14 bg-white border-none focus:ring-0 text-base placeholder:text-zinc-300 text-zinc-900" 
                                />
                                <button 
                                    onClick={() => handleAskAI('ask-question', userAiInput)}
                                    disabled={userAiLoading || !userAiInput.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                                >
                                    {userAiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Content Assistant - Chat Interface */}
                {activeTab === 'admin-ai' && isAdmin && (
                    <div className="flex flex-col h-full bg-zinc-50 rounded-3xl border border-zinc-200 overflow-hidden">
                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto space-y-6 p-6">
                            {adminMessages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-0 animate-in fade-in duration-500 opacity-100">
                                    <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-4">
                                        <Wand2 size={32} className="text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-zinc-900 text-xl">Content Assistant</h3>
                                    <p className="text-zinc-500 max-w-sm mt-2 mb-8">I can help you create devotions, study plans, and more. Try a quick starter below.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                        <button onClick={() => handleQuickAdminAction("Generate a daily devotion about 'Hope in Hard Times'")} className="p-4 bg-white border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-all font-medium text-left">
                                            <span className="block text-xs uppercase text-zinc-400 font-bold mb-1">Devotion</span>
                                            Hope in Hard Times
                                        </button>
                                        <button onClick={() => handleQuickAdminAction("Create a 5-day study plan on 'The Fruit of the Spirit'")} className="p-4 bg-white border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-600 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-all font-medium text-left">
                                            <span className="block text-xs uppercase text-zinc-400 font-bold mb-1">Study Plan</span>
                                            Fruit of the Spirit
                                        </button>
                                    </div>
                                </div>
                            )}

                            {adminMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-white border border-zinc-100 text-zinc-900 rounded-bl-none'}`}>
                                        {msg.role === 'assistant' ? (
                                            <div>
                                                <div className="prose prose-sm max-w-none mb-3 prose-p:text-zinc-600 prose-headings:text-zinc-900">
                                                    <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                                                </div>
                                                {/* Action Buttons for AI Responses */}
                                                <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-100 mt-2">
                                                    <button onClick={() => handleSaveAsInsight(msg.content)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-100 transition-colors">
                                                        <Save size={14} /> Save Insight
                                                    </button>
                                                    <button onClick={() => handleSaveAsGrowthPlan(msg.content)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 transition-colors">
                                                        <Save size={14} /> Save Plan
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {adminAiLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-sm">
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={adminChatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-zinc-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={adminInput}
                                    onChange={(e) => setAdminInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdminSend()}
                                    placeholder="Message the assistant..."
                                    className="w-full px-4 py-3 pr-12 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-400 text-sm"
                                    disabled={adminAiLoading}
                                />
                                <button
                                    onClick={handleAdminSend}
                                    disabled={adminAiLoading || !adminInput.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <InsightModal isOpen={isInsightModalOpen} onClose={() => setIsInsightModalOpen(false)} initialData={insightInitialData} />
            <GrowthPlanModal isOpen={isGrowthPlanModalOpen} onClose={() => setIsGrowthPlanModalOpen(false)} initialData={growthPlanInitialData} />
        </div>
    );
}
