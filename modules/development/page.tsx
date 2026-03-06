'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    addDoc,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import {
    BookMarked,
    ChevronRight,
    ChevronLeft,
    Plus,
    Search,
    Trash2,
    Save,
    Sparkles,
    Lightbulb,
    Send
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import GrowthPlanModal from '@/components/wisdom/GrowthPlanModal';

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

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function GrowthModule() {
    const { role, user } = useAuth();
    const isAdmin = role === 'admin';

    // Modals
    const [isGrowthPlanModalOpen, setIsGrowthPlanModalOpen] = useState(false);
    const [growthPlanInitialData, setGrowthPlanInitialData] = useState<any>(null);

    // Data
    const [growthPlans, setGrowthPlans] = useState<GrowthPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [enrollments, setEnrollments] = useState<Record<string, { completedSteps: number[] }>>({});

    // View State
    const [selectedPlan, setSelectedPlan] = useState<GrowthPlan | null>(null);
    const [currentDay, setCurrentDay] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // AI Chat for study
    const [userAiMessages, setUserAiMessages] = useState<Message[]>([]);
    const [userAiInput, setUserAiInput] = useState('');
    const [userAiLoading, setUserAiLoading] = useState(false);

    const categoriesList = ['All', 'Personal', 'Leadership', 'Knowledge', 'Wisdom', 'Inspiration', 'Growth'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, this would be an API call or localized fetch
                const plansSnap = await getDocs(collection(db, 'studyPlans'));
                const plansData = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GrowthPlan));
                setGrowthPlans(plansData);

                if (user) {
                    const enrollSnap = await getDocs(query(collection(db, 'planEnrollments'), where('userId', '==', user.uid)));
                    const enrollData: Record<string, { completedSteps: number[] }> = {};
                    enrollSnap.forEach(doc => {
                        const data = doc.data();
                        enrollData[data.planId] = { completedSteps: data.completedSteps || [] };
                    });
                    setEnrollments(enrollData);
                }
            } catch (error) {
                console.error('Error fetching growth data:', error);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchData();
    }, [user]);

    const filteredPlans = growthPlans.filter(plan => {
        const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             plan.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
            setEnrollments(prev => ({ ...prev, [planId]: { completedSteps: newSteps } }));
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this growth plan?')) return;
        try {
            await deleteDoc(doc(db, 'studyPlans', id));
            setGrowthPlans(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting plan:', err);
        }
    };

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
                <button onClick={() => { setSelectedPlan(null); setCurrentDay(0); setUserAiMessages([]); }} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6 transition-colors font-bold">
                    <ChevronLeft size={18} /> Back to Growth Plans
                </button>
                <div className="glass-panel rounded-2xl p-8 mb-6 border-l-4 border-l-[#ccf381]">
                    <span className="text-xs px-2.5 py-1 bg-[#ccf381] text-black rounded-full font-bold uppercase tracking-wider">{selectedPlan.category}</span>
                    <h2 className="text-2xl font-bold text-zinc-900 mt-3">{selectedPlan.title}</h2>
                    <p className="text-zinc-500 mt-2 leading-relaxed">{selectedPlan.description}</p>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => { setCurrentDay(Math.max(0, currentDay - 1)); }} disabled={currentDay === 0} className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"><ChevronLeft size={24} /></button>
                    <span className="font-mono text-sm text-zinc-400 uppercase tracking-widest">Step {day.dayNumber} / {selectedPlan.days.length}</span>
                    <button onClick={() => { setCurrentDay(Math.min(selectedPlan.days.length - 1, currentDay + 1)); }} disabled={currentDay === selectedPlan.days.length - 1} className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"><ChevronRight size={24} /></button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 mb-6 relative group">
                    <div className="absolute top-6 right-8">
                        <button 
                            onClick={() => toggleStepCompletion(selectedPlan.id, day.dayNumber)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                (enrollments[selectedPlan.id]?.completedSteps || []).includes(day.dayNumber)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                        >
                            {(enrollments[selectedPlan.id]?.completedSteps || []).includes(day.dayNumber) ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>
                    <h3 className="font-bold text-zinc-900 text-xl mb-2">{day.title}</h3>
                    <p className="text-red-600 font-serif italic text-lg mb-6">{day.scripture}</p>
                    {day.content && <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap"><ReactMarkdown components={markdownComponents}>{day.content}</ReactMarkdown></div>}
                </div>

                {/* AI Companion for Growth */}
                <div className="bg-gradient-to-br from-[#ccf381]/20 to-green-50/20 rounded-3xl p-6 border border-[#ccf381]/30">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#ccf381] flex items-center justify-center text-black">
                            <Lightbulb size={18} />
                        </div>
                        <span className="font-bold text-zinc-900">Growth Assistant</span>
                    </div>

                    <div className="relative mb-4">
                        <input type="text" value={userAiInput} onChange={(e) => setUserAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI('ask-question', userAiInput)} placeholder="Ask about this step..." className="w-full px-4 py-3 pr-12 bg-white border border-[#ccf381]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#ccf381]/20 focus:border-[#ccf381] outline-none transition-all" />
                        <button onClick={() => handleAskAI('ask-question', userAiInput)} disabled={userAiLoading || !userAiInput.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-black hover:bg-[#ccf381] rounded-lg disabled:opacity-50 transition-colors">
                            {userAiLoading ? <div className="w-4 h-4 border-2 border-zinc-200 border-t-black rounded-full animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                    {userAiMessages.length > 0 && (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                            {userAiMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-[#ccf381] text-black' : 'bg-white border border-[#ccf381]/20 shadow-sm'}`}>
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
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Personal & Leadership Growth</h1>
                    <p className="text-zinc-500 mt-1">Structured plans to help you reach your full potential.</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => { setGrowthPlanInitialData(null); setIsGrowthPlanModalOpen(true); }} 
                        className="flex items-center gap-2 px-6 py-3 bg-[#ccf381] text-black rounded-[2rem] font-bold hover:shadow-xl transition-all shadow-lg shadow-[#ccf381]/20"
                    >
                        <Plus size={18} /> Create Plan
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="Search plans..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#ccf381]/20 focus:border-[#ccf381] outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {categoriesList.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                selectedCategory === cat
                                ? 'bg-black text-[#ccf381] shadow-lg'
                                : 'bg-white text-zinc-500 border border-zinc-200 hover:border-black shadow-sm'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingPlans ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-100 rounded-3xl animate-pulse" />)
                ) : filteredPlans.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass-panel rounded-[2rem] border-dashed border-2 border-zinc-200">
                        <BookMarked size={48} className="mx-auto text-zinc-300 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-900">No Growth Plans Found</h3>
                        <p className="text-zinc-500 mt-2">Adjust your search or check back later for new programs.</p>
                    </div>
                ) : (
                    filteredPlans.map((plan) => (
                        <div key={plan.id} className="group relative glass-panel rounded-[2rem] p-8 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-[#ccf381]/50 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccf381]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#ccf381]/20 transition-all" />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest">{plan.category}</span>
                                    {isAdmin && (
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { setGrowthPlanInitialData(plan); setIsGrowthPlanModalOpen(true); }} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-xl transition-all"><Save size={16} /></button>
                                            <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                                
                                <h4 className="font-extrabold text-zinc-900 text-xl mb-3 tracking-tight group-hover:text-red-600 transition-colors uppercase">{plan.title}</h4>
                                <p className="text-zinc-500 text-sm line-clamp-3 mb-6 leading-relaxed font-medium">{plan.description}</p>
                                
                                <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                        <div className="w-2 h-2 rounded-full bg-[#ccf381]" />
                                        {plan.days.length} STEPS
                                        {enrollments[plan.id] && <span className="text-green-600">• IN PROGRESS</span>}
                                    </div>
                                    <button onClick={() => setSelectedPlan(plan)} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-bold group-hover:bg-red-600 transition-all">
                                        VIEW PLAN <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isGrowthPlanModalOpen && (
                <GrowthPlanModal 
                    isOpen={isGrowthPlanModalOpen} 
                    onClose={() => setIsGrowthPlanModalOpen(false)} 
                    initialData={growthPlanInitialData} 
                />
            )}
        </div>
    );
}
