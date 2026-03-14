'use client';

import { useState } from 'react';
import {
    X,
    Sparkles,
    Download,
    Loader2,
    Layout,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { generatePPT, PresentationData } from '@/lib/utils/pptGenerator';

interface PPTGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialNotes?: string;
}

export default function PPTGeneratorModal({ isOpen, onClose, initialNotes = '' }: PPTGeneratorModalProps) {
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState(initialNotes);
    const [tone, setTone] = useState('inspirational');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedData, setGeneratedData] = useState<PresentationData | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedData(null);

        try {
            const res = await fetch('/api/ai/ppt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, notes, tone }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate presentation content');
            }

            const data = await res.json();
            setGeneratedData(data);
        } catch (err: any) {
            console.error('[PPTGenerator] Error:', err);
            setError(err.message || 'Error connecting to AI service');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedData) return;
        try {
            await generatePPT(generatedData);
        } catch (err) {
            console.error('[PPTGenerator] Download Error:', err);
            setError('Failed to generate PPT file');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between bg-white border-b border-zinc-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#ccf381] flex items-center justify-center text-black">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900">AI Presentation Builder</h2>
                            <p className="text-xs text-zinc-500 font-medium">Generate sermon slides in seconds</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {!generatedData ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Sermon Topic</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Finding Peace in the Storm"
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Base Content / Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add sermon points, scriptures, or key thoughts..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wider">Presentation Tone</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none transition-all appearance-none"
                                    >
                                        <option value="inspirational">Inspirational</option>
                                        <option value="theological">Theological</option>
                                        <option value="storytelling">Storytelling</option>
                                        <option value="energetic">Energetic</option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full py-4 bg-zinc-900 text-white rounded-[2rem] font-bold text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        CRAFTING SLIDES...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="text-[#ccf381]" />
                                        GENERATE PRESENTATION
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 bg-[#ccf381]/10 rounded-3xl border border-[#ccf381]/30 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#ccf381] flex items-center justify-center text-black">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900">{generatedData.title}</h3>
                                    <p className="text-sm text-zinc-600 font-medium">{generatedData.slides.length} Professional Slides Ready</p>
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto pr-2 space-y-3 no-scrollbar border-t border-b border-zinc-50 py-4">
                                {generatedData.slides.map((slide, i) => (
                                    <div key={i} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-zinc-300 uppercase">Slide {i + 1}</span>
                                            <h4 className="text-sm font-bold text-zinc-800">{slide.title}</h4>
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-1">{slide.body}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setGeneratedData(null)}
                                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-[2rem] font-bold text-sm tracking-widest hover:bg-zinc-200 transition-all"
                                >
                                    REGENERATE
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-[2] py-4 bg-zinc-900 text-white rounded-[2rem] font-bold text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                                >
                                    <Download size={18} className="text-[#ccf381]" />
                                    DOWNLOAD PPTX
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
