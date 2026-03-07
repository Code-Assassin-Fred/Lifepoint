'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Wand2, 
    Save, 
    FileText, 
    Calendar,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Lesson {
    dayNumber: number;
    title: string;
    scripture: string;
    content: string;
    reflectionQuestions: string[];
    prayerPoint: string;
}

interface WeeklySession {
    theme: string;
    summary: string;
    weekStarting: string;
    lessons: Lesson[];
}

export default function AdminSessionPlanner() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [sourceMaterial, setSourceMaterial] = useState('');
    
    const [generationMode, setGenerationMode] = useState<'ground-up' | 'material'>('material');
    const [uploading, setUploading] = useState(false);
    const [specifications, setSpecifications] = useState('');
    
    const [session, setSession] = useState<WeeklySession>({
        theme: '',
        summary: '',
        weekStarting: new Date().toISOString().split('T')[0],
        lessons: []
    });

    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setSourceMaterial(text);
            setUploading(false);
            setGenerationMode('material');
        };
        reader.readAsText(file);
    };

    const handleGenerateWithAI = async () => {
        if (!session.theme) {
            alert('Please enter a theme first');
            return;
        }

        setGenerating(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-weekly-curriculum',
                    content: session.theme,
                    material: generationMode === 'material' ? sourceMaterial : '',
                    specifications: specifications,
                    format: 'json'
                })
            });

            if (!res.ok) {
                const errorData = await res.text();
                console.error('API Error Response:', errorData);
                throw new Error('Failed to generate');
            }
            const data = await res.json();
            
            setSession({
                ...session,
                theme: data.theme || session.theme,
                summary: data.summary || '',
                lessons: data.lessons || []
            });
            setExpandedDay(1); 
        } catch (error) {
            console.error('AI Generation error:', error);
            alert('Failed to generate. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveSession = async () => {
        if (!session.theme || !session.weekStarting || session.lessons.length === 0) {
            alert('Please generate the curriculum before publishing.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/wisdom/weekly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(session)
            });

            if (!res.ok) throw new Error('Save failed');
            alert('Weekly Session published & approved!');
            router.push('/dashboard/admin/wisdom');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const updateLesson = (day: number, field: keyof Lesson, value: any) => {
        const newLessons = [...session.lessons];
        const idx = newLessons.findIndex(l => l.dayNumber === day);
        if (idx !== -1) {
            newLessons[idx] = { ...newLessons[idx], [field]: value };
            setSession({ ...session, lessons: newLessons });
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-10 mt-6">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-all">
                    <ChevronLeft size={20} /> BACK
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={handleSaveSession}
                        disabled={loading || session.lessons.length === 0}
                        className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:shadow-xl transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                    >
                        {loading ? 'PUBLISHING...' : 'PUBLISH & APPROVE STUDY'}
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Step 1: Generation Strategy */}
                <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-8">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 uppercase">Generation Strategy</h2>
                                <p className="text-xs text-zinc-400 font-bold">Choose how AI should architect your week</p>
                            </div>
                        </div>

                        <div className="flex p-1 bg-zinc-100 rounded-xl">
                            <button 
                                onClick={() => setGenerationMode('ground-up')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${generationMode === 'ground-up' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
                            >
                                Ground Up
                            </button>
                            <button 
                                onClick={() => setGenerationMode('material')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${generationMode === 'material' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
                            >
                                From Material
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Weekly Theme</label>
                            <input 
                                type="text"
                                value={session.theme}
                                onChange={(e) => setSession({...session, theme: e.target.value})}
                                placeholder="e.g., Kingdom Stewardship"
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:border-red-600 outline-none transition-all placeholder:text-zinc-300"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Kickoff Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <input 
                                    type="date"
                                    value={session.weekStarting}
                                    onChange={(e) => setSession({...session, weekStarting: e.target.value})}
                                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold focus:border-red-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {generationMode === 'material' && (
                            <div className="md:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Source Material</label>
                                    <label className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black cursor-pointer hover:bg-zinc-200 transition-all">
                                        <FileText size={14} />
                                        UPLOAD FILE (.txt, .md)
                                        <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                                <textarea 
                                    value={sourceMaterial}
                                    onChange={(e) => setSourceMaterial(e.target.value)}
                                    rows={6}
                                    placeholder="Paste sermon transcript or notes here..."
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:border-red-600 outline-none transition-all resize-none leading-relaxed"
                                />
                                {uploading && <p className="text-[10px] font-bold text-red-600 animate-pulse">READING FILE...</p>}
                            </div>
                        )}

                        <div className="md:col-span-2 space-y-4">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Specifications (Optional)</label>
                            <textarea 
                                value={specifications}
                                onChange={(e) => setSpecifications(e.target.value)}
                                rows={3}
                                placeholder="Example: Focus on youth application, use a very warm pastoral tone, include original Greek word studies..."
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:border-red-600 outline-none transition-all resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleGenerateWithAI}
                            disabled={generating || !session.theme || (generationMode === 'material' && !sourceMaterial)}
                            className="w-fit px-12 py-4 bg-zinc-900 text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
                        >
                            {generating ? (
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    {generationMode === 'ground-up' ? 'CREATE FROM SCRATCH' : 'DISTILL FROM MATERIAL'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Step 2: Review (Simplified) */}
                {session.lessons.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2.5 py-1 bg-zinc-100 rounded-md">Curriculum Draft</h3>
                            <div className="flex-1 h-px bg-zinc-100" />
                        </div>

                        {/* Weekly Summary Preview */}
                        <div className="bg-zinc-50 rounded-3xl p-8 mb-6 border border-zinc-100">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Weekly Executive Summary</label>
                            <textarea 
                                value={session.summary}
                                onChange={(e) => setSession({...session, summary: e.target.value})}
                                rows={3}
                                className="w-full bg-transparent border-none text-zinc-700 font-medium leading-relaxed outline-none resize-none p-0"
                            />
                        </div>

                        {session.lessons.map((lesson) => (
                            <div key={lesson.dayNumber} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                                <button 
                                    onClick={() => setExpandedDay(expandedDay === lesson.dayNumber ? null : lesson.dayNumber)}
                                    className="w-full px-8 py-6 flex items-center justify-between hover:bg-zinc-50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500">
                                            {lesson.dayNumber}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-0.5">DAY {lesson.dayNumber}</h4>
                                            <p className="text-sm font-bold text-zinc-900">{lesson.title}</p>
                                        </div>
                                    </div>
                                    {expandedDay === lesson.dayNumber ? <ChevronUp size={20} className="text-zinc-300" /> : <ChevronDown size={20} className="text-zinc-300" />}
                                </button>

                                {expandedDay === lesson.dayNumber && (
                                    <div className="px-8 pb-8 pt-2 space-y-6 border-t border-zinc-50 animate-in fade-in duration-300">
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-300 uppercase mb-2 block">Scripture Anchor</label>
                                            <input 
                                                type="text"
                                                value={lesson.scripture}
                                                onChange={(e) => updateLesson(lesson.dayNumber, 'scripture', e.target.value)}
                                                className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-bold italic text-zinc-600 focus:ring-1 focus:ring-red-600 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-300 uppercase mb-2 block">Lesson Content</label>
                                            <textarea 
                                                value={lesson.content}
                                                onChange={(e) => updateLesson(lesson.dayNumber, 'content', e.target.value)}
                                                rows={6}
                                                className="w-full bg-zinc-50 border-none rounded-2xl px-4 py-4 text-sm font-medium text-zinc-700 leading-relaxed focus:ring-1 focus:ring-red-600 outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
