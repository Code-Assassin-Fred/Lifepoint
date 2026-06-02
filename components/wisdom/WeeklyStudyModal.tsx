'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, BookOpen, Plus, Trash2, Users, Globe, ChevronRight, ChevronLeft, Upload, FileText } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface WeeklyStudyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface Lesson {
    dayNumber: number;
    title: string;
    scripture: string;
    content: string;
    reflectionQuestions: string[];
    prayerPoint: string;
}

export default function WeeklyStudyModal({ isOpen, onClose, onSuccess }: WeeklyStudyModalProps) {
    const { user, token } = useAuth();
    const [step, setStep] = useState<'type' | 'configure' | 'edit' | 'target'>('type');
    const [creationType, setCreationType] = useState<'manual' | 'ai' | 'material'>('ai');

    // Form State
    const [theme, setTheme] = useState('');
    const [summary, setSummary] = useState('');
    const [weekStarting, setWeekStarting] = useState(new Date().toISOString().split('T')[0]);
    const [material, setMaterial] = useState('');
    const [specifications, setSpecifications] = useState('');

    // Lessons State
    const [lessons, setLessons] = useState<Lesson[]>(
        Array.from({ length: 7 }, (_, i) => ({
            dayNumber: i + 1,
            title: '',
            scripture: '',
            content: '',
            reflectionQuestions: ['', '', ''],
            prayerPoint: ''
        }))
    );

    // Targeting State
    const [targetType, setTargetType] = useState<'everyone' | 'individuals'>('everyone');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Loading & UI State
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeEditDay, setActiveEditDay] = useState(1);

    useEffect(() => {
        if (isOpen && targetType === 'individuals' && availableUsers.length === 0) {
            fetchUsers();
        }
    }, [isOpen, targetType]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableUsers(data.users || []);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleAIGenerate = async () => {
        if (!theme.trim()) {
            setError('Please provide a theme for AI generation');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-weekly-curriculum',
                    content: theme,
                    material: creationType === 'material' ? material : undefined,
                    specifications: specifications,
                    format: 'json'
                })
            });

            if (!response.ok) throw new Error('AI generation failed');

            const data = await response.json();
            if (data.theme) setTheme(data.theme);
            if (data.summary) setSummary(data.summary);
            if (data.lessons) setLessons(data.lessons);

            setStep('edit');
        } catch (err) {
            console.error('AI Bible Study Error:', err);
            setError('Failed to generate study with AI. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const body = {
                weekStarting,
                theme,
                summary,
                lessons,
                targetAudience: {
                    type: targetType,
                    userIds: targetType === 'individuals' ? selectedUserIds : []
                }
            };

            const res = await fetch('/api/wisdom/weekly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to save study');

            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error('Save Study Error:', err);
            setError('Failed to save Bible study. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('type');
        setTheme('');
        setSummary('');
        setMaterial('');
        setSpecifications('');
        setTargetType('everyone');
        setSelectedUserIds([]);
        setLessons(Array.from({ length: 7 }, (_, i) => ({
            dayNumber: i + 1,
            title: '',
            scripture: '',
            content: '',
            reflectionQuestions: ['', '', ''],
            prayerPoint: ''
        })));
        setError(null);
        onClose();
    };

    const filteredUsers = availableUsers.filter(u =>
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleClose} />

            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-zinc-200">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-zinc-100 bg-white z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 text-[#0d9488] rounded-2xl flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Create Bible Study</h2>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">Weekly curriculum builder</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-3 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-black rounded-2xl uppercase tracking-widest text-center animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    {step === 'type' && (
                        <div className="space-y-8 py-10">
                            <div className="text-center max-w-lg mx-auto mb-12">
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">How would you like to build this study?</h3>
                                <p className="text-zinc-500 font-medium text-sm">Choose a method to generate a 7-day spiritual journey.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: 'ai', title: 'Generate with AI', desc: 'Brief prompt, AI does the rest', icon: Sparkles, color: 'bg-[#0d9488] text-white' },
                                    { id: 'material', title: 'From Material', desc: 'Upload notes/text for AI extraction', icon: FileText, color: 'bg-[#ccf381] text-black' },
                                    { id: 'manual', title: 'Manual Entry', desc: 'Write every day yourself', icon: Plus, color: 'bg-zinc-900 text-white' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setCreationType(t.id as any); setStep(t.id === 'manual' ? 'edit' : 'configure'); }}
                                        className="group p-8 rounded-[3rem] border border-zinc-100 hover:border-zinc-300 hover:shadow-2xl transition-all text-left flex flex-col gap-6"
                                    >
                                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg ${t.color}`}>
                                            <t.icon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-zinc-900 text-lg uppercase tracking-tight">{t.title}</h4>
                                            <p className="text-zinc-500 text-xs font-bold mt-2 uppercase tracking-wide leading-relaxed">{t.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'configure' && (
                        <div className="max-w-2xl mx-auto space-y-10 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Weekly Theme *</label>
                                <input
                                    type="text"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    placeholder="e.g., The Prodigal's Return"
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-teal-500/10 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Study Summary</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="A brief overview of what this week covers..."
                                    rows={2}
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/10 outline-none resize-none"
                                />
                            </div>

                            {creationType === 'material' && (
                                <div className="space-y-4">
                                    <div className="p-6 bg-teal-50 rounded-[2rem] border border-teal-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Upload size={18} className="text-[#0d9488]" />
                                            <h4 className="text-[10px] font-black text-[#0d9488] uppercase tracking-[0.2em]">Source Material</h4>
                                        </div>
                                        <textarea
                                            value={material}
                                            onChange={(e) => setMaterial(e.target.value)}
                                            placeholder="Paste sermon notes, articles, or scripture blocks here. AI will extract 7 lessons from this..."
                                            rows={8}
                                            className="w-full px-6 py-4 bg-white border border-teal-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-[#0d9488]/10 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Special Instructions (Optional)</label>
                                <textarea
                                    value={specifications}
                                    onChange={(e) => setSpecifications(e.target.value)}
                                    placeholder="e.g., 'Focus on historical context' or 'Keep it very simple for new believers'"
                                    rows={2}
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-teal-500/10 outline-none resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !theme.trim()}
                                className="w-full py-5 bg-[#0d9488] text-white rounded-[2rem] font-black text-sm tracking-[0.2em] hover:bg-[#0f766e] transition-all shadow-2xl shadow-teal-200 flex items-center justify-center gap-4 py-6"
                            >
                                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={20} /> GENERATE 7-DAY CURRICULUM</>}
                            </button>
                        </div>
                    )}

                    {step === 'edit' && (
                        <div className="flex gap-10">
                            {/* Day Sidebar */}
                            <div className="w-24 flex flex-col gap-3">
                                {lessons.map((l) => (
                                    <button
                                        key={l.dayNumber}
                                        onClick={() => setActiveEditDay(l.dayNumber)}
                                        className={`w-16 h-16 rounded-2xl font-black text-lg transition-all ${activeEditDay === l.dayNumber ? 'bg-zinc-900 text-[#ccf381] shadow-xl scale-110 select-none' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                                    >
                                        {l.dayNumber}
                                    </button>
                                ))}
                            </div>

                            {/* Editor */}
                            <div className="flex-1 space-y-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Lesson Title</label>
                                        <input
                                            type="text"
                                            value={lessons[activeEditDay - 1].title}
                                            onChange={(e) => {
                                                const newLessons = [...lessons];
                                                newLessons[activeEditDay - 1].title = e.target.value;
                                                setLessons(newLessons);
                                            }}
                                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Scripture Reference</label>
                                        <input
                                            type="text"
                                            value={lessons[activeEditDay - 1].scripture}
                                            onChange={(e) => {
                                                const newLessons = [...lessons];
                                                newLessons[activeEditDay - 1].scripture = e.target.value;
                                                setLessons(newLessons);
                                            }}
                                            placeholder="e.g. John 3:16"
                                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Lesson Content (Markdown Supported)</label>
                                    <textarea
                                        value={lessons[activeEditDay - 1].content}
                                        onChange={(e) => {
                                            const newLessons = [...lessons];
                                            newLessons[activeEditDay - 1].content = e.target.value;
                                            setLessons(newLessons);
                                        }}
                                        rows={10}
                                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none resize-none font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Reflection Questions</label>
                                        {lessons[activeEditDay - 1].reflectionQuestions.map((q, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                value={q}
                                                onChange={(e) => {
                                                    const newLessons = [...lessons];
                                                    newLessons[activeEditDay - 1].reflectionQuestions[i] = e.target.value;
                                                    setLessons(newLessons);
                                                }}
                                                placeholder={`Question ${i + 1}`}
                                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold outline-none"
                                            />
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Prayer Point</label>
                                        <textarea
                                            value={lessons[activeEditDay - 1].prayerPoint}
                                            onChange={(e) => {
                                                const newLessons = [...lessons];
                                                newLessons[activeEditDay - 1].prayerPoint = e.target.value;
                                                setLessons(newLessons);
                                            }}
                                            placeholder="A specific prayer focus for this day..."
                                            rows={5}
                                            className="w-full px-5 py-4 bg-[#ccf381]/10 border border-[#ccf381]/20 rounded-2xl text-sm font-bold outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'target' && (
                        <div className="max-w-2xl mx-auto space-y-10 py-6">
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => setTargetType('everyone')}
                                    className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-4 ${targetType === 'everyone' ? 'border-[#0d9488] bg-teal-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                                >
                                    <Globe size={40} className={targetType === 'everyone' ? 'text-[#0d9488]' : 'text-zinc-300'} />
                                    <span className="font-black uppercase tracking-widest text-sm">Everyone</span>
                                </button>
                                <button
                                    onClick={() => setTargetType('individuals')}
                                    className={`p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-4 ${targetType === 'individuals' ? 'border-[#0d9488] bg-teal-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                                >
                                    <Users size={40} className={targetType === 'individuals' ? 'text-[#0d9488]' : 'text-zinc-300'} />
                                    <span className="font-black uppercase tracking-widest text-sm">Individuals</span>
                                </button>
                            </div>

                            {targetType === 'individuals' && (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/10 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 pb-4">
                                        {filteredUsers.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    setSelectedUserIds(prev =>
                                                        prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                                                    );
                                                }}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${selectedUserIds.includes(u.id) ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200 text-zinc-900'}`}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-[#ccf381] text-black flex items-center justify-center font-black">
                                                    {u.displayName[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-xs truncate">{u.displayName}</p>
                                                    <p className={`text-[10px] truncate ${selectedUserIds.includes(u.id) ? 'text-zinc-400' : 'text-zinc-400'}`}>{u.email}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-zinc-50 rounded-2xl flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        <span>{selectedUserIds.length} Selected</span>
                                        <button onClick={() => setSelectedUserIds([])} className="text-red-500 hover:underline">Clear All</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Week Starting Date</label>
                                <input
                                    type="date"
                                    value={weekStarting}
                                    onChange={(e) => setWeekStarting(e.target.value)}
                                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-black text-sm outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {step !== 'type' && (
                            <button
                                onClick={() => {
                                    if (step === 'configure') setStep('type');
                                    else if (step === 'edit') setStep(creationType === 'manual' ? 'type' : 'configure');
                                    else if (step === 'target') setStep('edit');
                                }}
                                className="flex items-center gap-2 px-6 py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleClose}
                            className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            Cancel
                        </button>

                        {step === 'type' ? null : step !== 'target' ? (
                            <button
                                onClick={() => {
                                    if (step === 'configure' && !isGenerating) setStep('edit');
                                    else if (step === 'edit') setStep('target');
                                }}
                                className="flex items-center gap-2 px-8 py-4 bg-[#0d9488] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0f766e] transition-all shadow-xl shadow-teal-100"
                            >
                                Next Step <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || (targetType === 'individuals' && selectedUserIds.length === 0)}
                                className="flex items-center gap-4 px-10 py-5 bg-zinc-900 text-[#ccf381] rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'PUBLISH STUDY'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
