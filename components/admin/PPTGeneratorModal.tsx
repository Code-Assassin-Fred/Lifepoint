'use client';

import { useState } from 'react';
import {
    X,
    Sparkles,
    Download,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Edit3,
    ArrowLeft
} from 'lucide-react';
import { generatePPT, PresentationData, SlideData } from '@/lib/utils/pptGenerator';

interface PPTGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialNotes?: string;
}

type Step = 'input' | 'generating' | 'review';

export default function PPTGeneratorModal({ isOpen, onClose, initialNotes = '' }: PPTGeneratorModalProps) {
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState(initialNotes);
    const [tone, setTone] = useState('inspirational');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<Step>('input');

    // Review state
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewSubtitle, setReviewSubtitle] = useState('');
    const [reviewSlides, setReviewSlides] = useState<SlideData[]>([]);
    const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setLoading(true);
        setError(null);
        setStep('generating');

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

            // Populate review state
            setReviewTitle(data.title || topic);
            setReviewSubtitle(data.subtitle || '');
            setReviewSlides(data.slides.map((s: any) => ({
                title: s.title || '',
                body: s.body || '',
                scripture: s.scripture || '',
                speakerNotes: s.speakerNotes || ''
            })));
            setStep('review');
        } catch (err: any) {
            console.error('[PPTGenerator] Error:', err);
            setError(err.message || 'Error connecting to AI service');
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const finalData: PresentationData = {
            title: reviewTitle,
            subtitle: reviewSubtitle,
            slides: reviewSlides
        };
        try {
            await generatePPT(finalData);
        } catch (err) {
            console.error('[PPTGenerator] Download Error:', err);
            setError('Failed to generate PPT file');
        }
    };

    const updateSlide = (index: number, field: keyof SlideData, value: string) => {
        setReviewSlides(prev => prev.map((slide, i) =>
            i === index ? { ...slide, [field]: value } : slide
        ));
    };

    const addSlide = () => {
        setReviewSlides(prev => [...prev, { title: 'New Slide', body: '', scripture: '', speakerNotes: '' }]);
        setEditingSlideIndex(reviewSlides.length);
    };

    const removeSlide = (index: number) => {
        if (reviewSlides.length <= 1) return;
        setReviewSlides(prev => prev.filter((_, i) => i !== index));
        if (editingSlideIndex === index) setEditingSlideIndex(null);
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= reviewSlides.length) return;
        const newSlides = [...reviewSlides];
        [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
        setReviewSlides(newSlides);
        setEditingSlideIndex(newIndex);
    };

    const handleBack = () => {
        setStep('input');
        setError(null);
    };

    const handleClose = () => {
        setStep('input');
        setError(null);
        setReviewSlides([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between bg-white border-b border-zinc-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {step === 'review' && (
                            <button onClick={handleBack} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all mr-1">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-2xl bg-[#ccf381] flex items-center justify-center text-black">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900">
                                {step === 'review' ? 'Review & Edit Slides' : step === 'generating' ? 'Generating...' : 'AI Presentation Builder'}
                            </h2>
                            <p className="text-xs text-zinc-500 font-medium">
                                {step === 'review' ? 'Edit each slide before downloading' : step === 'generating' ? 'Multi-agent AI is crafting your slides' : 'Generate sermon slides with AI'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 no-scrollbar">
                    {/* INPUT STEP */}
                    {step === 'input' && (
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
                                <Sparkles size={18} className="text-[#ccf381]" />
                                GENERATE PRESENTATION
                            </button>
                        </div>
                    )}

                    {/* GENERATING STEP */}
                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-8">
                            <div className="relative">
                                <div className="w-20 h-20 bg-[#ccf381]/20 rounded-3xl flex items-center justify-center">
                                    <Loader2 className="animate-spin text-[#0d9488]" size={36} />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#ccf381] rounded-full animate-pulse" />
                            </div>
                            <div className="text-center space-y-3">
                                <h3 className="text-xl font-black text-zinc-900">AI Agents at Work</h3>
                                <div className="space-y-2 text-sm font-bold text-zinc-500">
                                    <p className="flex items-center gap-2 justify-center">
                                        <span className="w-2 h-2 bg-[#0d9488] rounded-full animate-pulse" />
                                        Research Agent analyzing theology...
                                    </p>
                                    <p className="flex items-center gap-2 justify-center">
                                        <span className="w-2 h-2 bg-[#ccf381] rounded-full animate-pulse delay-300" />
                                        Outline Agent structuring slides...
                                    </p>
                                    <p className="flex items-center gap-2 justify-center">
                                        <span className="w-2 h-2 bg-zinc-300 rounded-full animate-pulse delay-700" />
                                        Content Agent polishing words...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REVIEW STEP — Bishop Review */}
                    {step === 'review' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Presentation title/subtitle */}
                            <div className="p-6 bg-zinc-900 rounded-3xl text-white">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Presentation Title</label>
                                <input
                                    type="text"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    className="w-full bg-transparent text-2xl font-black text-[#ccf381] outline-none border-none placeholder:text-zinc-600"
                                    placeholder="Presentation Title"
                                />
                                <input
                                    type="text"
                                    value={reviewSubtitle}
                                    onChange={(e) => setReviewSubtitle(e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-zinc-400 outline-none border-none mt-2 placeholder:text-zinc-600"
                                    placeholder="Subtitle (optional)"
                                />
                            </div>

                            {/* Status bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-[#0d9488]" />
                                    <span className="text-sm font-bold text-zinc-600">{reviewSlides.length} slides generated</span>
                                </div>
                                <button
                                    onClick={addSlide}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-[#ccf381] text-zinc-600 hover:text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    <Plus size={14} /> Add Slide
                                </button>
                            </div>

                            {/* Slides list */}
                            <div className="space-y-3">
                                {reviewSlides.map((slide, i) => (
                                    <div key={i} className={`rounded-2xl border transition-all ${editingSlideIndex === i ? 'border-[#0d9488] bg-white shadow-lg' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}>
                                        {/* Slide header */}
                                        <div
                                            className="flex items-center justify-between p-4 cursor-pointer"
                                            onClick={() => setEditingSlideIndex(editingSlideIndex === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-[10px] font-black text-zinc-300 uppercase flex-shrink-0 w-16">Slide {i + 1}</span>
                                                <h4 className="text-sm font-bold text-zinc-800 truncate">{slide.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveSlide(i, 'up'); }}
                                                    disabled={i === 0}
                                                    className="p-1.5 text-zinc-300 hover:text-zinc-900 disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveSlide(i, 'down'); }}
                                                    disabled={i === reviewSlides.length - 1}
                                                    className="p-1.5 text-zinc-300 hover:text-zinc-900 disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                                                    disabled={reviewSlides.length <= 1}
                                                    className="p-1.5 text-zinc-300 hover:text-red-500 disabled:opacity-30 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <Edit3 size={14} className={`ml-1 ${editingSlideIndex === i ? 'text-[#0d9488]' : 'text-zinc-300'}`} />
                                            </div>
                                        </div>

                                        {/* Expanded edit view */}
                                        {editingSlideIndex === i && (
                                            <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={slide.title}
                                                        onChange={(e) => updateSlide(i, 'title', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Body Content</label>
                                                    <textarea
                                                        value={slide.body}
                                                        onChange={(e) => updateSlide(i, 'body', e.target.value)}
                                                        rows={4}
                                                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Scripture Reference</label>
                                                    <input
                                                        type="text"
                                                        value={slide.scripture || ''}
                                                        onChange={(e) => updateSlide(i, 'scripture', e.target.value)}
                                                        placeholder="e.g., John 3:16 — For God so loved the world..."
                                                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Speaker Notes</label>
                                                    <textarea
                                                        value={slide.speakerNotes || ''}
                                                        onChange={(e) => updateSlide(i, 'speakerNotes', e.target.value)}
                                                        rows={2}
                                                        placeholder="Notes for yourself while presenting..."
                                                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-500 focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381] outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleBack}
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
