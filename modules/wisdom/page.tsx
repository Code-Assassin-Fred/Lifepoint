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
    Plus,
    Calendar,
    Trash2,
    Save,
    Search,
    CheckCircle2,
    AlertCircle,
    Info,
    X,
    Lock,
    FileText,
    LayoutGrid,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
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

interface WeeklySession {
    id: string;
    theme: string;
    summary: string;
    weekStarting: string;
    lessons: {
        dayNumber: number;
        title: string;
        scripture: string;
        content: string;
        reflectionQuestions: string[];
        prayerPoint: string;
    }[];
}

type Tab = 'devotion' | 'study';



const markdownComponents = {
    p: ({ children }: any) => <p className="mb-4 last:mb-0 leading-relaxed text-zinc-600 font-medium">{children}</p>,
    strong: ({ children }: any) => <span className="font-bold text-zinc-900">{children}</span>,
    em: ({ children }: any) => <span className="italic">{children}</span>,
    ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
    li: ({ children }: any) => <li className="leading-relaxed text-zinc-600 font-medium">{children}</li>,
    h1: ({ children }: any) => <h1 className="text-2xl font-black text-zinc-900 mb-6 uppercase tracking-tight">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-black text-zinc-900 mb-4 uppercase tracking-tight">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-black text-zinc-900 mb-3 uppercase tracking-tight">{children}</h3>,
};

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
    const [weeklySession, setWeeklySession] = useState<WeeklySession | null>(null);
    const [activeLessonDay, setActiveLessonDay] = useState(1);
    const [loadingWeekly, setLoadingWeekly] = useState(true);





    // UI Feedback
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmDeleteWeekly, setConfirmDeleteWeekly] = useState<string | null>(null);
    const [pastSessions, setPastSessions] = useState<WeeklySession[]>([]);
    const [isDocumentView, setIsDocumentView] = useState(isAdmin);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isStudyExpanded, setIsStudyExpanded] = useState(!isAdmin);

    const getLockedStatus = (session: WeeklySession, dayNumber: number) => {
        if (isAdmin) return false;
        const startDate = new Date(session.weekStarting);
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Important: Diff is in days. If startDate is 2026-03-08, and today is 2026-03-08, diff is 0.
        // Day 1 starts on the startDate.
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return dayNumber > diffDays;
    };

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        if (type !== 'error') {
            setTimeout(() => setNotification(null), 5000);
        }
    };

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

                // Fetch weekly session
                const sessionRes = await fetch('/api/wisdom/weekly');
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    setWeeklySession(sessionData);
                }

                // Fetch past studies history
                const historyRes = await fetch('/api/wisdom/weekly?action=history');
                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setPastSessions(historyData);
                }
            } catch (error) {
                console.error('Error in Wisdom data fetching:', error);
            } finally {
                setLoadingInsights(false);
                setLoadingWeekly(false);
                setLoadingHistory(false);
            }
        };

        fetchWisdomData();
    }, [user]);

    useEffect(() => {
        setIsDocumentView(isAdmin);
        setIsStudyExpanded(!isAdmin);
    }, [isAdmin]);

    useEffect(() => {
        if (weeklySession) {
            const startDate = new Date(weeklySession.weekStarting);
            startDate.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const currentDay = Math.max(1, Math.min(7, diffDays));
            setActiveLessonDay(currentDay);
        }
    }, [weeklySession]);

    const todayDateStr = new Date().toISOString().split('T')[0];
    const todaysInsight = insights.find(i => i.date === todayDateStr);
    const pastInsights = insights.filter(i => i.date !== todayDateStr);





    const handleDeleteWeekly = async (id: string) => {
        try {
            const res = await fetch(`/api/wisdom/weekly?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete study');

            showNotification('success', 'Study record deleted successfully');
            if (weeklySession?.id === id) setWeeklySession(null);
            setPastSessions(prev => prev.filter(s => s.id !== id));
            if (selectedHistoryId === id) setSelectedHistoryId(null);
            setConfirmDeleteWeekly(null);
        } catch (error) {
            console.error('Delete study error:', error);
            showNotification('error', 'Failed to delete study');
        }
    };



    const handleDeleteInsight = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'devotions', id));
            setInsights(prev => prev.filter(i => i.id !== id));
            showNotification('success', 'Insight deleted successfully.');
            setConfirmDelete(null);
        } catch (err) {
            console.error('Error deleting insight:', err);
            showNotification('error', 'Failed to delete insight.');
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




    if (selectedPlan) {
        const day = selectedPlan.days[currentDay];
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <button onClick={() => { setSelectedPlan(null); setCurrentDay(0); }} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
                    <ChevronLeft size={18} /> Back to Growth Plans
                </button>
                <div className="bg-white rounded-2xl p-8 mb-6 border-l-4 border-l-red-500 border border-zinc-200 shadow-sm">
                    <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-bold uppercase tracking-wider">{selectedPlan.category}</span>
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


            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col relative">
            {/* Inline Notification */}
            {notification && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-md animate-in slide-in-from-top-4 duration-300">
                    <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-2xl ${notification.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
                        notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                            'bg-zinc-900 border-zinc-800 text-white'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.type === 'success' ? 'bg-green-500 text-white' :
                            notification.type === 'error' ? 'bg-red-500 text-white' :
                                'bg-zinc-800 text-zinc-400'
                            }`}>
                            {notification.type === 'success' && <CheckCircle2 size={20} />}
                            {notification.type === 'error' && <AlertCircle size={20} />}
                            {notification.type === 'info' && <Info size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-tight">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal for Weekly Study */}
            {confirmDeleteWeekly && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase">Delete Bible Study?</h3>
                        <p className="text-zinc-500 text-sm mb-8 font-medium italic">This will permanently remove this Bible study session and all its lessons. This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDeleteWeekly(null)} className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all">CANCEL</button>
                            <button onClick={() => handleDeleteWeekly(confirmDeleteWeekly)} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase">Delete Insight?</h3>
                        <p className="text-zinc-500 text-sm mb-8 font-medium italic">This action cannot be undone. Are you sure you want to remove this piece of wisdom?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200 transition-all">CANCEL</button>
                            <button onClick={() => handleDeleteInsight(confirmDelete)} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">DELETE</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-none mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex p-1 bg-zinc-100 rounded-xl w-fit">
                    {[{ id: 'devotion', label: 'Daily Insight', icon: Sun }, { id: 'study', label: 'Bible Study', icon: BookOpen }]
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
                                    <div className="bg-white rounded-[2rem] p-10 relative overflow-hidden group border border-zinc-200 shadow-sm">


                                        <div className="relative z-10 flex flex-col md:flex-row gap-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-red-200">Featured</span>
                                                    <p className="text-zinc-500 font-bold text-sm">{new Date(todaysInsight.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                                <h3 className="text-2xl font-extrabold text-zinc-900 mb-4 tracking-tight leading-tight uppercase">{todaysInsight.title}</h3>
                                                {todaysInsight.scripture && <p className="text-red-600 font-serif italic text-lg mb-6">{todaysInsight.scripture}</p>}
                                                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap text-base font-medium mb-8">{todaysInsight.content}</p>

                                                {todaysInsight.prayerPrompt && (
                                                    <div className="bg-zinc-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">

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


                                            <div className="flex flex-col gap-3">
                                                {isAdmin && (
                                                    <button onClick={() => setConfirmDelete(todaysInsight.id)} className="flex items-center justify-center w-12 h-12 bg-white text-zinc-400 border border-zinc-100 rounded-xl hover:border-red-600 hover:text-red-600 transition-all shadow-sm"><Trash2 size={18} /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2rem] p-16 text-center border-dashed border-2 border-zinc-200 flex flex-col items-center shadow-sm">
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
                                        <div key={insight.id} className="bg-white rounded-3xl p-6 hover:shadow-xl transition-all group cursor-pointer border border-zinc-100 hover:border-red-500/20 shadow-sm" onClick={() => { setInsightInitialData(insight); setActiveTab('devotion'); }}>
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
                    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
                        {loadingWeekly ? (
                            <div className="h-96 bg-zinc-50 rounded-3xl animate-pulse border border-zinc-200" />
                        ) : !weeklySession && !selectedHistoryId ? (
                            <div className="bg-white rounded-[3rem] p-20 text-center border-dashed border-2 border-zinc-200 flex flex-col items-center shadow-sm">
                                <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8">
                                    <BookOpen size={48} className="text-zinc-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 mb-4 uppercase tracking-tight">No Active Session</h3>
                                <p className="text-zinc-500 mb-10 max-w-sm font-medium text-base">Check back later or browse the archive below.</p>
                            </div>
                        ) : (() => {
                            const session = selectedHistoryId ? pastSessions.find(s => s.id === selectedHistoryId) : weeklySession;
                            if (!session) return null;

                            return (
                                <div className="flex flex-col gap-10">
                                    {/* Session Title Card (The "One UI Component") */}
                                    <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm relative overflow-hidden group">


                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-red-100">
                                                        {selectedHistoryId ? 'Archived Study' : 'Active Study'}
                                                    </div>
                                                    <p className="text-zinc-500 font-bold text-sm tracking-tight text-center sm:text-left">
                                                        Week of {new Date(session.weekStarting).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>

                                                {isAdmin && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteWeekly(session.id); }}
                                                            className="flex items-center gap-2 px-5 py-3 bg-white text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={14} /> Delete Study
                                                        </button>
                                                    </div>
                                                )}

                                                {(isStudyExpanded || !isAdmin) && (
                                                    <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
                                                        <button
                                                            onClick={() => setIsDocumentView(false)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!isDocumentView ? 'bg-white text-red-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                                        >
                                                            <LayoutGrid size={14} /> Daily
                                                        </button>
                                                        <button
                                                            onClick={() => setIsDocumentView(true)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${isDocumentView ? 'bg-white text-red-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                                                        >
                                                            <FileText size={14} /> Document
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <h2 className="text-4xl font-black text-zinc-900 mb-6 tracking-tight uppercase leading-[0.9]">{session.theme}</h2>
                                            <p className="text-zinc-500 leading-relaxed font-medium max-w-3xl text-lg italic pr-12">"{session.summary}"</p>

                                            <div className="flex items-center gap-4 mt-10">
                                                {(isAdmin || selectedHistoryId) && (
                                                    <button
                                                        onClick={() => setIsStudyExpanded(!isStudyExpanded)}
                                                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                                                    >
                                                        {isStudyExpanded ? <><ChevronUp size={14} /> Collapse Study</> : <><ChevronDown size={14} /> Expand to View</>}
                                                    </button>
                                                )}

                                                {selectedHistoryId && (
                                                    <button
                                                        onClick={() => setSelectedHistoryId(null)}
                                                        className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all ml-4"
                                                    >
                                                        <ChevronLeft size={14} /> Back to current study
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lessons Content (Revealed when expanded) */}
                                    {(isStudyExpanded || (!isAdmin && !selectedHistoryId)) && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                            {isDocumentView ? (
                                                <div className="space-y-12">
                                                    {session.lessons.map((lesson) => {
                                                        const isLocked = getLockedStatus(session, lesson.dayNumber);
                                                        return (
                                                            <div key={lesson.dayNumber} className={`relative pt-12 ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                                                <div className="absolute top-0 left-0 flex items-center gap-4 w-full">
                                                                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-xl shadow-xl">{lesson.dayNumber}</div>
                                                                    <div className="h-px bg-zinc-100 flex-1" />
                                                                </div>

                                                                <div className="bg-white rounded-[2rem] p-10 border border-zinc-200 shadow-sm mt-6">
                                                                    <div className="flex justify-between items-start gap-4 mb-8">
                                                                        <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-tight">{lesson.title}</h3>
                                                                        {isLocked && <Lock className="text-zinc-300" size={24} />}
                                                                    </div>

                                                                    <p className="text-red-600 font-serif italic text-xl mb-10 leading-relaxed">{lesson.scripture}</p>

                                                                    <div className="prose prose-zinc max-w-none text-zinc-700 font-medium leading-relaxed mb-12">
                                                                        <ReactMarkdown components={markdownComponents}>{lesson.content}</ReactMarkdown>
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-zinc-100">
                                                                        <div>
                                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-6">Reflection Questions</h4>
                                                                            <div className="space-y-4">
                                                                                {lesson.reflectionQuestions.map((q, i) => (
                                                                                    <div key={i} className="flex gap-4">
                                                                                        <span className="text-red-500 font-bold">{i + 1}.</span>
                                                                                        <p className="text-zinc-600 text-sm font-medium leading-relaxed">{q}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-zinc-50 rounded-2xl p-8">
                                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Prayer Focus</h4>
                                                                            <p className="text-zinc-700 font-medium italic text-lg leading-relaxed">"{lesson.prayerPoint}"</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-8">
                                                    {/* 7-Day Navigation */}
                                                    <div className="bg-white rounded-3xl p-3 border border-zinc-200 flex justify-between gap-3 overflow-x-auto shadow-sm">
                                                        {session.lessons.map((lesson) => {
                                                            const isActive = activeLessonDay === lesson.dayNumber;
                                                            const isLocked = getLockedStatus(session, lesson.dayNumber);
                                                            return (
                                                                <button
                                                                    key={lesson.dayNumber}
                                                                    disabled={isLocked}
                                                                    onClick={() => setActiveLessonDay(lesson.dayNumber)}
                                                                    className={`flex-1 min-w-[120px] flex flex-col items-center py-5 rounded-2xl transition-all relative ${isActive ? 'bg-zinc-900 text-white shadow-2xl scale-105 z-10' :
                                                                        isLocked ? 'bg-zinc-50 text-zinc-300 cursor-not-allowed opacity-50' :
                                                                            'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                                                                        }`}
                                                                >
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Study Day</span>
                                                                    <span className="text-3xl font-black">{lesson.dayNumber}</span>
                                                                    {isLocked && <Lock className="absolute top-2 right-2 opacity-40" size={12} />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Individual Lesson Content */}
                                                    {session.lessons.find(l => l.dayNumber === activeLessonDay) && (
                                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                            <div className="bg-white rounded-[2.5rem] p-12 border border-zinc-200 shadow-sm">
                                                                <div className="flex justify-between items-center mb-8">
                                                                    <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">
                                                                        {session.lessons.find(l => l.dayNumber === activeLessonDay)?.title}
                                                                    </h3>
                                                                </div>

                                                                <p className="text-red-600 font-serif italic text-2xl mb-12 leading-relaxed">
                                                                    {session.lessons.find(l => l.dayNumber === activeLessonDay)?.scripture}
                                                                </p>

                                                                <div className="prose prose-zinc max-w-none text-zinc-700 font-medium leading-relaxed text-lg">
                                                                    <ReactMarkdown components={markdownComponents}>
                                                                        {session.lessons.find(l => l.dayNumber === activeLessonDay)?.content || ''}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div className="bg-zinc-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-8 flex items-center gap-2">
                                                                        Reflection Questions
                                                                    </h4>
                                                                    <div className="space-y-6">
                                                                        {session.lessons.find(l => l.dayNumber === activeLessonDay)?.reflectionQuestions.map((q, i) => (
                                                                            <div key={i} className="flex gap-5">
                                                                                <span className="text-red-500 font-black text-lg">{i + 1}.</span>
                                                                                <p className="text-zinc-300 text-sm font-medium leading-relaxed">{q}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-[2rem] p-10 border border-zinc-200 shadow-sm">
                                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-8">Prayer Focus</h4>
                                                                    <p className="text-zinc-700 font-medium italic text-xl leading-relaxed">
                                                                        "{session.lessons.find(l => l.dayNumber === activeLessonDay)?.prayerPoint}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Past Studies Archive Section */}
                                    {pastSessions.length > 0 && (
                                        <div className="mt-20 pt-20 border-t border-zinc-100">
                                            <div className="flex items-center gap-4 mb-10">
                                                <div className="h-px bg-zinc-100 flex-1" />
                                                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] whitespace-nowrap">Past Weekly Studies</h2>
                                                <div className="h-px bg-zinc-100 flex-1" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {pastSessions.map((session) => (
                                                    <button
                                                        key={session.id}
                                                        onClick={() => {
                                                            setSelectedHistoryId(session.id);
                                                            setIsDocumentView(true);
                                                            setIsStudyExpanded(false); // Collapse archive when selected to follow pattern
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="group bg-white rounded-[2rem] p-8 border border-zinc-100 hover:border-red-500/30 hover:shadow-2xl transition-all text-left shadow-sm relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-12 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none" />
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 group-hover:text-red-500 transition-colors">
                                                            {new Date(session.weekStarting).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <h3 className="text-xl font-black text-zinc-900 group-hover:text-red-600 transition-colors uppercase tracking-tight leading-tight mb-4">
                                                            {session.theme}
                                                        </h3>
                                                        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed font-medium transition-colors">
                                                            {session.summary}
                                                        </p>
                                                        <div className="mt-8 flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] group-hover:text-zinc-500">View Document</span>
                                                            <div className="flex items-center gap-2">
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteWeekly(session.id); }}
                                                                        className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all z-10"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                                    <ChevronRight size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}


            </div>

            <InsightModal isOpen={isInsightModalOpen} onClose={() => setIsInsightModalOpen(false)} initialData={insightInitialData} />
            <GrowthPlanModal isOpen={isGrowthPlanModalOpen} onClose={() => setIsGrowthPlanModalOpen(false)} initialData={growthPlanInitialData} />
        </div>
    );
}
