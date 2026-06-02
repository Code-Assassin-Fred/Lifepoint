'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InsightModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        id?: string;
        title?: string;
        content?: string;
        prayerPrompt?: string;
    };
}

export default function InsightModal({ isOpen, onClose, initialData }: InsightModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [prayerPrompt, setPrayerPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Load initial data when available
    useEffect(() => {
        if (initialData && isOpen) {
            if (initialData.title) setTitle(initialData.title);
            if (initialData.content) setContent(initialData.content);
            if (initialData.prayerPrompt) setPrayerPrompt(initialData.prayerPrompt);
        } else if (!isOpen) {
            // Reset when closing
            setTitle('');
            setContent('');
            setPrayerPrompt('');
            setAiPrompt('');
            setError(null);
            setSuccess(false);
        }
    }, [initialData, isOpen]);

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) {
            setError('Please provide a theme or scripture for AI generation');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate-insight',
                    content: aiPrompt,
                    format: 'json'
                })
            });

            if (!response.ok) throw new Error('AI generation failed');

            const data = await response.json();
            if (data.title) setTitle(data.title);
            if (data.content) setContent(data.content);
            if (data.prayerPrompt) setPrayerPrompt(data.prayerPrompt);

            setAiPrompt('');
        } catch (err) {
            console.error('AI Insight Error:', err);
            setError('Failed to generate insight with AI. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = {
                date,
                title: title.trim(),
                content: content.trim(),
                prayerPrompt: prayerPrompt.trim() || null,
                updatedAt: serverTimestamp(),
            };

            if (initialData?.id) {
                // Update existing
                await updateDoc(doc(db, 'devotions', initialData.id), data);
            } else {
                // Create new
                await addDoc(collection(db, 'devotions'), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Error saving insight:', err);
            setError('Failed to save insight. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!initialData) {
            setDate(new Date().toISOString().split('T')[0]);
            setTitle('');
            setContent('');
            setPrayerPrompt('');
            setAiPrompt('');
        }
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Daily Insight</h2>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Spiritual nourishment for the flock</p>
                    </div>
                    <button onClick={handleClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-8 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl animate-in shake duration-300 uppercase tracking-wider">{error}</div>
                    )}

                    {success && (
                        <div className="p-6 bg-teal-50 border border-teal-100 text-[#0d9488] text-sm rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-10 h-10 rounded-xl bg-[#0d9488] text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-200">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-black uppercase tracking-tight">Insight Published</p>
                                <p className="text-xs font-bold opacity-70">Word of wisdom is now live.</p>
                            </div>
                        </div>
                    )}

                    {/* AI Section */}
                    {!initialData && (
                        <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-[#0d9488]" />
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Generate with AI</h3>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Enter theme, e.g., 'Faith in storms'"
                                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/10 outline-none"
                                />
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating || !aiPrompt.trim()}
                                    className="px-6 py-3 bg-[#0d9488] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0f766e] disabled:opacity-50 transition-all shadow-lg shadow-teal-200"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'GENERATE'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Publish Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/10 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Today's Theme"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/10 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Insight Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write the daily reflection..."
                            rows={6}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/10 outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest ml-1 flex items-center gap-2">
                            Prayer & Reflection Focus
                            <span className="text-[9px] bg-teal-50 px-2 py-0.5 rounded-full font-black">Admin View Only</span>
                        </label>
                        <textarea
                            value={prayerPrompt}
                            onChange={(e) => setPrayerPrompt(e.target.value)}
                            placeholder="A guiding prompt for prayer..."
                            rows={2}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/10 outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-8 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-[#0d9488] rounded-2xl hover:bg-[#0f766e] disabled:opacity-50 transition-all shadow-xl shadow-teal-100"
                    >
                        {loading ? 'SAVING...' : (initialData?.id ? 'UPDATE INSIGHT' : 'PUBLISH INSIGHT')}
                    </button>
                </div>
            </div>
        </div>
    );
}
