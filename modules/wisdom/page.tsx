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
    const [todayInsight, setTodayInsight] = useState<Insight | null>(null);
    const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
    const [loadingInsight, setLoadingInsight] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // Growth Plan View
    const [selectedPlan, setSelectedPlan] = useState<GrowthPlan | null>(null);
    const [currentDay, setCurrentDay] = useState(0);

    // AI
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Admin AI Chat
    const [adminInput, setAdminInput] = useState('');
    const [adminMessages, setAdminMessages] = useState<Message[]>([]);
    const [adminAiLoading, setAdminAiLoading] = useState(false);
    const adminChatEndRef = useRef<HTMLDivElement>(null);

    const isAdmin = role === 'admin';
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Fetch insight
    useEffect(() => {
        const q = query(collection(db, 'devotions'), orderBy('date', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docData = snapshot.docs[0];
                setTodayInsight({ id: docData.id, ...docData.data() } as Insight);
            } else {
                setTodayInsight(null);
            }
            setLoadingInsight(false);
        }, () => setLoadingInsight(false));
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

    // Scroll to bottom of admin chat
    useEffect(() => {
        if (activeTab === 'admin-ai') {
            adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [adminMessages, activeTab]);

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

    // Simple parsers to extract data from AI response
    const parseInsight = (text: string) => {
        // This is a naive parser based on the prompt structure
        const titleMatch = text.match(/## Title\s*([\s\S]*?)(?=##|$)/);
        const scriptureMatch = text.match(/## Reference\s*([\s\S]*?)(?=##|$)/);
        const contentMatch = text.match(/## Insight Content\s*([\s\S]*?)(?=##|$)/);
        const prayerMatch = text.match(/## Reflection Prompt\s*([\s\S]*?)(?=##|$)/);

        return {
            title: titleMatch ? titleMatch[1].trim() : '',
            scripture: scriptureMatch ? scriptureMatch[1].trim() : '',
            content: contentMatch ? contentMatch[1].trim() : '',
            prayerPrompt: prayerMatch ? prayerMatch[1].trim() : '',
        };
    };

    const parseGrowthPlan = (text: string) => {
        const lines = text.split('\n');
        let title = '';
        const days: GrowthStep[] = [];

        // Attempt to extract title/desc
        const titleLine = lines.find(l => l.includes('Plan Title:')) || '';
        if (titleLine) title = titleLine.replace('Plan Title:', '').trim();

        return {
            title: title || 'New Growth Plan',
            description: text.substring(0, 200) + '...', // First 200 chars as placeholder
        };
    };

    const handleSaveAsInsight = (text: string) => {
        const data = parseInsight(text);
        setInsightInitialData(data);
        setIsInsightModalOpen(true);
    };

    const handleSaveAsGrowthPlan = (text: string) => {
        setGrowthPlanInitialData({ description: 'Generated plan:\n' + text.substring(0, 100) + '...' });
        setIsGrowthPlanModalOpen(true);
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

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 mb-6">
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
                        <button onClick={() => handleAskAI('explain-scripture', day.scripture, `Study: ${selectedPlan.title}`)} disabled={aiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-zinc-600 rounded-lg hover:text-amber-700 hover:border-amber-200 border border-transparent shadow-sm transition-all disabled:opacity-50">Explain passage</button>
                        <button onClick={() => handleAskAI('study-insight', day.scripture, day.title)} disabled={aiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-zinc-600 rounded-lg hover:text-amber-700 hover:border-amber-200 border border-transparent shadow-sm transition-all disabled:opacity-50">Deeper insights</button>
                        <button onClick={() => handleAskAI('prayer-guidance', day.scripture)} disabled={aiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-zinc-600 rounded-lg hover:text-amber-700 hover:border-amber-200 border border-transparent shadow-sm transition-all disabled:opacity-50">Guide my prayer</button>
                    </div>

                    <div className="relative mb-4">
                        <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', `Regarding ${day.scripture}: ${aiQuestion}`)} placeholder="Ask a question about today's study..." className="w-full px-4 py-3 pr-12 bg-white border border-amber-200/50 rounded-xl text-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 outline-none transition-all" />
                        <button onClick={() => handleAskAI('ask-question', `Regarding ${day.scripture}: ${aiQuestion}`)} disabled={aiLoading || !aiQuestion.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg disabled:opacity-50 transition-colors">
                            {aiLoading ? <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                    {aiResponse && <div className="bg-white rounded-xl p-6 border border-amber-100 shadow-sm prose prose-sm max-w-none"><ReactMarkdown components={markdownComponents}>{aiResponse}</ReactMarkdown></div>}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex-none mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="glass-panel w-14 h-14 rounded-2xl flex items-center justify-center text-zinc-900 shadow-sm">
                            <BookOpen size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Knowledge Hub</h2>
                            <p className="text-zinc-500">Manage daily insights and growth plans</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-3">
                            <button onClick={() => { setInsightInitialData(null); setIsInsightModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm rounded-xl font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"><Plus size={16} /> Insight</button>
                            <button onClick={() => { setGrowthPlanInitialData(null); setIsGrowthPlanModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"><Plus size={16} /> Growth Plan</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-none mb-6">
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
                                            ? 'bg-white text-zinc-900 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-zinc-900' : 'text-zinc-400'} />
                                    {tab.label}
                                </button>
                            );
                        })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8">
                {activeTab === 'devotion' && (
                    <div className="max-w-3xl space-y-6">
                        {loadingInsight ? (
                            <div className="space-y-4">
                                <div className="h-48 bg-zinc-100 rounded-3xl animate-pulse" />
                                <div className="h-24 bg-zinc-100 rounded-3xl animate-pulse" />
                            </div>
                        ) : todayInsight ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="glass-panel rounded-3xl p-8 mb-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                    <div className="flex items-start justify-between relative z-10">
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-semibold mb-3">
                                                <Sun size={12} /> Today's Wisdom
                                            </span>
                                            <h3 className="text-3xl font-bold text-zinc-900 mb-2">{todayInsight.title}</h3>
                                            <p className="text-zinc-500 font-medium">{dateString}</p>
                                            <p className="text-red-600 font-serif italic mt-4 text-lg">{todayInsight.scripture}</p>
                                        </div>
                                        {isAdmin && <button onClick={() => deleteDoc(doc(db, 'devotions', todayInsight.id))} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>}
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-zinc-100">
                                        <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap text-lg">{todayInsight.content}</p>
                                    </div>
                                </div>

                                {todayInsight.prayerPrompt && (
                                    <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-24 bg-zinc-800 rounded-full blur-2xl -mr-12 -mt-12 opacity-50 pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-3 text-zinc-400">
                                                <Sparkles size={16} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Reflection</span>
                                            </div>
                                            <p className="text-zinc-200 text-lg leading-relaxed italic">"{todayInsight.prayerPrompt}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-zinc-200">
                                <Sun size={32} className="text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Insight Today</h3>
                                <p className="text-zinc-500 mb-6">Create a new insight to inspire the community.</p>
                                {isAdmin && <button onClick={() => { setInsightInitialData(null); setIsInsightModalOpen(true); }} className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors">Create Insight</button>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingPlans ? [1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 rounded-2xl animate-pulse" />) : growthPlans.length === 0 ? (
                            <div className="col-span-full glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-zinc-200">
                                <BookMarked size={32} className="text-zinc-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Growth Plans</h3>
                            </div>
                        ) : growthPlans.map((plan) => (
                            <div key={plan.id} onClick={() => setSelectedPlan(plan)} className="group glass-panel rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-zinc-200 relative">
                                <div className="absolute top-6 right-6 text-zinc-300 group-hover:text-zinc-900 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                                <span className="inline-block px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3">{plan.category}</span>
                                <h4 className="font-bold text-zinc-900 text-lg mb-2 pr-6">{plan.title}</h4>
                                <p className="text-zinc-500 text-sm line-clamp-2">{plan.description}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                    {plan.duration}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl mx-auto flex items-center justify-center mb-4 text-amber-600 shadow-sm">
                                <Bot size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-zinc-900 text-2xl">Daily Wisdom Companion</h3>
                            <p className="text-zinc-500 mt-2">Ask questions about scripture, faith, or personal growth.</p>
                        </div>

                        <div className="glass-panel rounded-3xl p-2 shadow-lg shadow-zinc-900/5">
                            <div className="relative">
                                <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', aiQuestion)} placeholder="Ask about scripture..." className="w-full px-6 py-4 pr-14 bg-transparent border-none focus:ring-0 text-lg placeholder:text-zinc-300 text-zinc-900" />
                                <button onClick={() => handleAskAI('ask-question', aiQuestion)} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20">
                                    {aiLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>

                        {aiResponse && <div className="glass-panel rounded-3xl p-8 prose prose-zinc max-w-none shadow-sm"><ReactMarkdown components={markdownComponents}>{aiResponse}</ReactMarkdown></div>}
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
