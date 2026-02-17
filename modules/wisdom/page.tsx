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
        h2: ({ children }: any) => <h2 className="text-lg font-bold text-black mt-4 mb-2 first:mt-0">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-base font-semibold text-black mt-3 mb-1">{children}</h3>,
        p: ({ children }: any) => <p className="text-black/80 mb-2 leading-relaxed">{children}</p>,
        ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 text-black/80 space-y-1">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 text-black/80 space-y-1">{children}</ol>,
        li: ({ children }: any) => <li>{children}</li>,
    };

    if (selectedPlan) {
        const day = selectedPlan.days[currentDay];
        return (
            <div className="max-w-3xl">
                <button onClick={() => { setSelectedPlan(null); setCurrentDay(0); setAiResponse(''); }} className="flex items-center gap-2 text-black/60 hover:text-black mb-6">
                    <ChevronLeft size={18} /> Back to Growth Plans
                </button>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 mb-6">
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">{selectedPlan.category}</span>
                    <h2 className="text-xl font-bold text-black mt-2">{selectedPlan.title}</h2>
                    <p className="text-black/60 text-sm mt-1">{selectedPlan.description}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => { setCurrentDay(Math.max(0, currentDay - 1)); setAiResponse(''); }} disabled={currentDay === 0} className="p-2 text-black/60 hover:text-black disabled:opacity-30"><ChevronLeft size={20} /></button>
                    <span className="font-medium text-black">Step {day.dayNumber} of {selectedPlan.days.length}</span>
                    <button onClick={() => { setCurrentDay(Math.min(selectedPlan.days.length - 1, currentDay + 1)); setAiResponse(''); }} disabled={currentDay === selectedPlan.days.length - 1} className="p-2 text-black/60 hover:text-black disabled:opacity-30"><ChevronRight size={20} /></button>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
                    <h3 className="font-semibold text-black text-lg">{day.title}</h3>
                    <p className="text-red-600 text-sm mt-1">{day.scripture}</p>
                    {day.content && <p className="text-black/70 mt-4 leading-relaxed whitespace-pre-wrap">{day.content}</p>}
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb size={20} className="text-amber-600" />
                        <span className="font-semibold text-black">Daily Wisdom</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => handleAskAI('explain-scripture', day.scripture, `Study: ${selectedPlan.title}`)} disabled={aiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-black/70 rounded-lg hover:bg-amber-100 disabled:opacity-50 border border-amber-200">Explain passage</button>
                        <button onClick={() => handleAskAI('study-insight', day.scripture, day.title)} disabled={aiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-black/70 rounded-lg hover:bg-amber-100 disabled:opacity-50 border border-amber-200">Deeper insights</button>
                        <button onClick={() => handleAskAI('prayer-guidance', day.scripture)} disabled={aiLoading} className="px-3 py-1.5 bg-white text-xs font-medium text-black/70 rounded-lg hover:bg-amber-100 disabled:opacity-50 border border-amber-200">Guide my prayer</button>
                    </div>
                    <div className="relative mb-4">
                        <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', `Regarding ${day.scripture}: ${aiQuestion}`)} placeholder="Ask a question about today's study..." className="w-full px-4 py-3 pr-12 bg-white border border-amber-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                        <button onClick={() => handleAskAI('ask-question', `Regarding ${day.scripture}: ${aiQuestion}`)} disabled={aiLoading || !aiQuestion.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg disabled:opacity-50">
                            {aiLoading ? <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                    {aiResponse && <div className="bg-white rounded-xl p-4 border border-amber-200 prose prose-sm max-w-none"><ReactMarkdown components={markdownComponents}>{aiResponse}</ReactMarkdown></div>}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex-none mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><BookOpen size={24} /></div>
                        <div>
                            <h2 className="text-xl font-bold text-black">Knowledge Hub</h2>
                            <p className="text-sm text-black/60">Daily insights, growth plans, and wisdom</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button onClick={() => { setInsightInitialData(null); setIsInsightModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-black text-sm rounded-xl font-medium hover:bg-gray-200"><Plus size={16} /> Insight</button>
                            <button onClick={() => { setGrowthPlanInitialData(null); setIsGrowthPlanModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700"><Plus size={16} /> Growth Plan</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-none border-b border-gray-200 mb-6 overflow-x-auto">
                {[{ id: 'devotion', label: 'Daily Insight', icon: Sun }, { id: 'plans', label: 'Growth Plans', icon: BookMarked }, { id: 'ai', label: 'AI Insight', icon: Sparkles }, { id: 'admin-ai', label: 'Content Assistant', icon: Wand2, adminOnly: true }]
                    .filter(t => !t.adminOnly || isAdmin)
                    .map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-black/60 hover:text-black'}`}>
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {activeTab === 'devotion' && (
                    <div className="space-y-6">
                        {loadingInsight ? <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" /></div> : todayInsight ? (
                            <>
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-red-600 font-medium">{dateString}</p>
                                            <h3 className="text-lg font-bold text-black mt-1">{todayInsight.title}</h3>
                                            <p className="text-black/70 text-sm mt-1">{todayInsight.scripture}</p>
                                        </div>
                                        {isAdmin && <button onClick={() => deleteDoc(doc(db, 'devotions', todayInsight.id))} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>}
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <p className="text-black/80 leading-relaxed whitespace-pre-wrap">{todayInsight.content}</p>
                                    {todayInsight.prayerPrompt && <div className="mt-6 p-4 bg-gray-50 rounded-xl"><p className="text-sm font-medium text-black mb-2">Reflection Prompt</p><p className="text-black/70 text-sm">{todayInsight.prayerPrompt}</p></div>}
                                </div>
                            </>
                        ) : <div className="bg-gray-50 rounded-2xl p-8 text-center"><Sun size={24} className="text-black/40 mx-auto mb-4" /><h3 className="text-lg font-semibold text-black mb-2">No Insight Today</h3></div>}
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="space-y-3">
                        {loadingPlans ? <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" /></div> : growthPlans.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center"><BookMarked size={24} className="text-black/40 mx-auto mb-4" /><h3 className="text-lg font-semibold text-black mb-2">No Growth Plans</h3></div>
                        ) : growthPlans.map((plan) => (
                            <div key={plan.id} onClick={() => setSelectedPlan(plan)} className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-red-200 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">{plan.category}</span>
                                        <h4 className="font-medium text-black text-sm mt-1">{plan.title}</h4>
                                    </div>
                                    <ChevronRight size={18} className="text-black/30" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                            <h3 className="font-bold text-black">Daily Wisdom</h3>
                            <p className="text-black/70 text-sm">Ask any question about wisdom and guidance.</p>
                        </div>
                        <div className="relative">
                            <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', aiQuestion)} placeholder="Ask about scripture..." className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                            <button onClick={() => handleAskAI('ask-question', aiQuestion)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-amber-600"><Send size={20} /></button>
                        </div>
                        {aiResponse && <div className="bg-white rounded-2xl p-6 border border-gray-100 prose prose-sm max-w-none"><ReactMarkdown components={markdownComponents}>{aiResponse}</ReactMarkdown></div>}
                    </div>
                )}

                {/* Admin Content Assistant - Chat Interface */}
                {activeTab === 'admin-ai' && isAdmin && (
                    <div className="flex flex-col h-full">
                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                            {adminMessages.length === 0 && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mx-auto mb-3"><Wand2 size={24} className="text-purple-600" /></div>
                                    <h3 className="font-bold text-black">Content Assistant</h3>
                                    <p className="text-black/70 text-sm max-w-sm mx-auto">I can help you create devotions, study plans, and more. Try a quick starter below or just ask!</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-lg mx-auto">
                                        <button onClick={() => handleQuickAdminAction("Generate a daily devotion about 'Hope in Hard Times'")} className="p-3 bg-white border border-purple-100 rounded-xl text-sm text-black/70 hover:border-purple-300 transition-colors">Generate Devotion: Hope</button>
                                        <button onClick={() => handleQuickAdminAction("Create a 5-day study plan on 'The Fruit of the Spirit'")} className="p-3 bg-white border border-purple-100 rounded-xl text-sm text-black/70 hover:border-purple-300 transition-colors">Study Plan: Fruits</button>
                                    </div>
                                </div>
                            )}

                            {adminMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-black'}`}>
                                        {msg.role === 'assistant' ? (
                                            <div>
                                                <div className="prose prose-sm max-w-none mb-3">
                                                    <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                                                </div>
                                                {/* Action Buttons for AI Responses */}
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                                    <button onClick={() => handleSaveAsInsight(msg.content)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
                                                        <Save size={14} /> Save as Insight
                                                    </button>
                                                    <button onClick={() => handleSaveAsGrowthPlan(msg.content)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                                                        <Save size={14} /> Save as Growth Plan
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {adminAiLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={adminChatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="relative">
                            <input
                                type="text"
                                value={adminInput}
                                onChange={(e) => setAdminInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdminSend()}
                                placeholder="Ask the assistant... (e.g., 'Make it shorter', 'Focus on grace')"
                                className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                                disabled={adminAiLoading}
                            />
                            <button
                                onClick={handleAdminSend}
                                disabled={adminAiLoading || !adminInput.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <InsightModal isOpen={isInsightModalOpen} onClose={() => setIsInsightModalOpen(false)} initialData={insightInitialData} />
            <GrowthPlanModal isOpen={isGrowthPlanModalOpen} onClose={() => setIsGrowthPlanModalOpen(false)} initialData={growthPlanInitialData} />
        </div>
    );
}
