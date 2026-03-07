'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    limit,
    where,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    serverTimestamp,
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
    scripture?: string;
    content: string;
    prayerPrompt?: string;
}

type Tab = 'devotion' | 'study' | 'ai' | 'admin-ai';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function WisdomModule() {
    const { user, role } = useAuth();
    const isAdmin = role === 'admin';
    const [activeTab, setActiveTab] = useState<Tab>('devotion');

    // Modals & Pre-filled Data
    const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
    const [insightInitialData, setInsightInitialData] = useState<any>(null);
    const [isGrowthPlanModalOpen, setIsGrowthPlanModalOpen] = useState(false);
    const [growthPlanInitialData, setGrowthPlanInitialData] = useState<any>(null);

    // Selected Growth Plan State
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [currentDay, setCurrentDay] = useState(0);

    // Data
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loadingInsights, setLoadingInsights] = useState(true);

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

    // Fetch wisdom and engagement data
    useEffect(() => {
        const fetchWisdomData = async () => {
            try {
                const url = user ? `/api/wisdom?userId=${user.uid}` : '/api/wisdom';
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch wisdom data');
                const data = await response.json();

                setInsights(data.insights || []);
                if (data.bookmarks) setBookmarks(data.bookmarks);
            } catch (error) {
                console.error('Error in Wisdom data fetching:', error);
            } finally {
                setLoadingInsights(false);
            }
        };

        fetchWisdomData();
    }, [user]);

    const todayDateStr = new Date().toISOString().split('T')[0];
    const todaysInsight = insights.find(i => i.date === todayDateStr);
    const pastInsights = insights.filter(i => i.date !== todayDateStr);

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

    const handleDeleteInsight = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this insight?')) return;
        try {
            await deleteDoc(doc(db, 'devotions', id));
            setInsights(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error('Error deleting insight:', err);
        }
    };

    const toggleStepCompletion = async (planId: string, dayNumber: number) => {
        if (!user) return;
        const currentEnrollment = enrollments[planId] || { completedSteps: [] };
        const isCompleted = currentEnrollment.completedSteps.includes(dayNumber);

        const newSteps = isCompleted
            ? currentEnrollment.completedSteps.filter(s => s !== dayNumber)
            : [...currentEnrollment.completedSteps, dayNumber];

        setEnrollments(prev => ({
            ...prev,
            [planId]: { ...currentEnrollment, completedSteps: newSteps }
        }));

        // Persist to Firebase if needed
    };

    const handleSaveAsGrowthPlan = (text: string) => {
        handleGenerateContent('plan', `Based on this conversation, create a growth plan: ${text.substring(0, 500)}`);
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${(enrollments[selectedPlan.id]?.completedSteps || []).includes(day.dayNumber)
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
            <div className="flex-none mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex p-1 bg-zinc-100/50 rounded-xl w-fit">
                    {[{ id: 'devotion', label: 'Daily Insight', icon: Sun }, { id: 'study', label: 'Bible Study', icon: BookOpen }, { id: 'ai', label: 'Ask Word', icon: Sparkles }, { id: 'admin-ai', label: 'Admin Helper', icon: Wand2, adminOnly: true }]
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
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm rounded-full font-bold hover:shadow-xl transition-all shadow-lg shadow-red-200"
                        >
                            <Plus size={16} /> New Insight
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-8">
                {activeTab === 'devotion' && (
                    <div className="max-w-4xl space-y-12">
                        {/* Today's Insight Section */}
                        <section>
                            <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <div className="w-8 h-[1px] bg-zinc-200" />
                                Today's Connection
                                <div className="w-8 h-[1px] bg-zinc-200" />
                            </h2>

                            {loadingInsights ? (
                                <div className="h-64 bg-zinc-100 rounded-[2rem] animate-pulse" />
                            ) : todaysInsight ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="glass-panel rounded-[2rem] p-10 relative overflow-hidden group border border-red-100/50">
                                        <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                        <div className="relative z-10 flex flex-col md:flex-row gap-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-red-200">Featured</span>
                                                    <p className="text-zinc-500 font-bold text-sm">{new Date(todaysInsight.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                                <h3 className="text-2xl font-extrabold text-zinc-900 mb-4 tracking-tight leading-tight uppercase">{todaysInsight.title}</h3>
                                                {todaysInsight.scripture && <p className="text-red-600 font-serif italic text-lg mb-6 border-l-4 border-red-500 pl-4 py-1">{todaysInsight.scripture}</p>}
                                                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap text-base font-medium mb-8">{todaysInsight.content}</p>

                                                {todaysInsight.prayerPrompt && (
                                                    <div className="bg-zinc-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800 rounded-full blur-2xl -mr-10 -mt-10 opacity-50" />
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 mb-2 text-red-500">
                                                                <Sparkles size={14} />
                                                                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">Prayer Focus</span>
                                                            </div>
                                                            <p className="text-zinc-200 text-sm leading-relaxed italic font-medium">"{todaysInsight.prayerPrompt}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="md:w-px h-full md:bg-zinc-100 flex-shrink-0" />

                                            <div className="flex flex-col gap-3">
                                                {isAdmin && (
                                                    <button onClick={() => handleDeleteInsight(todaysInsight.id)} className="flex items-center justify-center w-12 h-12 bg-white text-zinc-400 border border-zinc-100 rounded-xl hover:border-red-600 hover:text-red-600 transition-all shadow-sm"><Trash2 size={18} /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-panel rounded-[2rem] p-16 text-center border-dashed border-2 border-zinc-200 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                        <Sun size={40} className="text-zinc-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-3 uppercase tracking-tight">No insights from the bishop today</h3>
                                    <p className="text-zinc-500 mb-8 max-w-sm font-medium text-sm">While you wait for today's word, feel free to explore our archive or ask the AI for spiritual guidance.</p>
                                    {isAdmin && <button onClick={() => { setInsightInitialData(null); setIsInsightModalOpen(true); }} className="px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:shadow-xl transition-all shadow-lg shadow-red-200">UPLOAD TODAY'S WORD</button>}
                                </div>
                            )}
                        </section>

                        {/* Archive Section */}
                        {pastInsights.length > 0 && (
                            <section>
                                <h2 className="text-xs font-extrabold text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <div className="w-8 h-[1px] bg-zinc-200" />
                                    The Archive
                                    <div className="w-8 h-[1px] bg-zinc-200" />
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pastInsights.map((insight) => (
                                        <div key={insight.id} className="glass-panel rounded-3xl p-6 hover:shadow-xl transition-all group cursor-pointer border-transparent hover:border-red-500/20" onClick={() => { setInsightInitialData(insight); setActiveTab('devotion'); }}>
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(insight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                <div className="flex gap-2">
                                                    <BookMarked size={14} className={bookmarks.includes(insight.id) ? 'text-red-500' : 'text-zinc-300'} />
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-zinc-900 group-hover:text-red-500 transition-colors uppercase leading-tight mb-2 line-clamp-1 text-base">{insight.title}</h4>
                                            <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{insight.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {activeTab === 'study' && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight uppercase">Bible Study</h2>
                            <p className="text-zinc-500 mt-2 font-medium text-sm">Deepen your understanding through structured topical and character studies.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "Spiritual Disciplines", desc: "Prayer, Fasting, and Meditation", icon: "✨" },
                                { title: "Parables of Jesus", desc: "Understanding the Kingdom of Heaven", icon: "📖" },
                                { title: "The Armor of God", desc: "Standing firm in spiritual warfare", icon: "🛡️" },
                                { title: "Women of the Bible", desc: "Stories of faith and courage", icon: "🌸" },
                                { title: "Old Testament Kings", desc: "Leadership and its consequences", icon: "👑" },
                                { title: "The Fruit of the Spirit", desc: "Living a life of character", icon: "🍇" }
                            ].map((study, idx) => (
                                <div key={idx} className="glass-panel rounded-[2rem] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border border-transparent hover:border-red-500/20">
                                    <div className="text-4xl mb-6">{study.icon}</div>
                                    <h3 className="text-lg font-bold mb-2 uppercase tracking-tight group-hover:text-red-600 transition-colors">{study.title}</h3>
                                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">{study.desc}</p>
                                    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 w-fit px-3 py-1 rounded-full">
                                        Coming Soon
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="max-w-3xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex-none text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl mx-auto flex items-center justify-center mb-4 text-amber-600 shadow-sm border border-amber-200/50">
                                <Bot size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-zinc-900 text-xl tracking-tight">The Well</h3>
                            <p className="text-zinc-500 mt-2 text-xs leading-relaxed max-w-sm mx-auto">Draw from the well — ask questions about scripture, faith, or personal growth.</p>
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
                                    <div className={`max-w-[85%] rounded-[1.5rem] p-5 shadow-sm ${msg.role === 'user'
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
                                    <h3 className="font-bold text-zinc-900 text-lg">Content Assistant</h3>
                                    <p className="text-zinc-500 max-w-sm mt-2 mb-8 text-xs">I can help you create devotions, Bible studies, and spiritual content. Try a quick starter below.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                                        <button onClick={() => handleQuickAdminAction("Generate a daily devotion about 'Hope in Hard Times'")} className="p-4 bg-white border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-600 hover:border-red-400 hover:text-red-700 hover:bg-red-50 transition-all font-medium text-left">
                                            <span className="block text-xs uppercase text-zinc-400 font-bold mb-1">Devotion</span>
                                            Hope in Hard Times
                                        </button>
                                        <button onClick={() => handleQuickAdminAction("Outline a Bible study on 'The Armor of God'")} className="p-4 bg-white border border-dashed border-zinc-300 rounded-xl text-sm text-zinc-600 hover:border-red-400 hover:text-red-700 hover:bg-red-50 transition-all font-medium text-left">
                                            <span className="block text-xs uppercase text-zinc-400 font-bold mb-1">Bible Study</span>
                                            Armor of God
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
