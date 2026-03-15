'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { generatePPT, PresentationData, SlideData } from '@/lib/utils/pptGenerator';

interface Draft {
    id: string;
    title: string;
    content: string;
    category: string;
    updatedAt?: string;
}

type ViewMode = 'research' | 'ppt-input' | 'ppt-generating' | 'ppt-review';

export default function ResearchPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('research');
    const [researchQuery, setResearchQuery] = useState('');
    const [researchResult, setResearchResult] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [researching, setResearching] = useState(false);
    const [copied, setCopied] = useState(false);
    const [researchTopic, setResearchTopic] = useState('');
    const [followUp, setFollowUp] = useState('');
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [savedResearches, setSavedResearches] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // PPT State
    const [pptTopic, setPptTopic] = useState('');
    const [pptNotes, setPptNotes] = useState('');
    const [pptTone, setPptTone] = useState('inspirational');
    const [pptError, setPptError] = useState<string | null>(null);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewSubtitle, setReviewSubtitle] = useState('');
    const [reviewSlides, setReviewSlides] = useState<SlideData[]>([]);
    const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

    const fetchDrafts = async () => {
        try {
            const response = await fetch('/api/admin/research');
            if (response.ok) {
                const data = await response.json();
                setSavedResearches(data);
            }
        } catch (error) {
            console.error('Failed to fetch drafts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrafts(); }, []);

    const RESEARCH_SYSTEM_PROMPT = `You are a world-class theological research assistant helping a Bishop prepare for sermons and teachings.

When given a topic, provide comprehensive, scholarly research including:

## Theological Overview
- Core theological concepts and significance
- How this topic fits in the broader biblical narrative

## Key Scriptures
- 5-8 directly relevant scripture passages with full references
- Brief commentary on each passage's relevance

## Historical & Cultural Context
- What did the original audience understand?
- Historical background that illuminates the topic
- Original Hebrew/Greek word studies if relevant

## Different Theological Perspectives
- How different traditions approach this topic
- Areas of theological consensus and debate

## Sermon Application Points
- 3-5 practical application ideas for a congregation
- Real-world illustrations or analogies

## Further Study Resources
- Related topics to explore
- Connected scriptural themes

Be thorough, scholarly, and pastorally sensitive. Write 600-900 words. Use markdown formatting with headers, bold text, and bullet points for clarity.
CRITICAL: DO NOT use em dashes. Use commas, colons, or parentheses instead.`;

    const handleResearch = async () => {
        if (!researchQuery.trim()) return;
        setResearching(true);
        setResearchResult('');
        setResearchTopic(researchQuery);
        setActiveId(null);
        setIsEditing(false);
        setViewMode('research');
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate', content: researchQuery, systemPrompt: RESEARCH_SYSTEM_PROMPT }),
            });
            if (res.ok) {
                const data = await res.json();
                setResearchResult(data.response);
                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            } else {
                setResearchResult('Failed to get research results. Please try again.');
            }
        } catch (error) {
            setResearchResult('An error occurred during research. Please try again.');
        } finally {
            setResearching(false);
        }
    };

    const handleFollowUp = async () => {
        if (!followUp.trim() || !researchResult) return;
        setResearching(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate',
                    content: `Original research topic: "${researchTopic}"\n\nCurrent research content:\n${researchResult}\n\nThe Bishop wants you to modify the research as follows:\n${followUp}\n\nPlease provide the COMPLETE updated research with the requested modifications applied. Keep the same structured format.`,
                    systemPrompt: RESEARCH_SYSTEM_PROMPT
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setResearchResult(data.response);
                setFollowUp('');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Follow-up failed:', error);
        } finally {
            setResearching(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(researchResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!researchResult.trim()) return;
        setSaving(true);
        try {
            if (activeId) {
                await fetch('/api/admin/research', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: activeId, title: researchTopic || 'Untitled Research', content: researchResult, category: 'Research' }),
                });
            } else {
                const res = await fetch('/api/admin/research', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: researchTopic || 'Untitled Research', content: researchResult, category: 'Research' }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setActiveId(data.id);
                }
            }
            await fetchDrafts();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLoad = (draft: Draft) => {
        setResearchTopic(draft.title);
        setResearchQuery(draft.title);
        setResearchResult(draft.content || '');
        setActiveId(draft.id);
        setIsEditing(false);
        setViewMode('research');
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/research?id=${id}`, { method: 'DELETE' });
            if (activeId === id) {
                setResearchResult('');
                setResearchTopic('');
                setResearchQuery('');
                setActiveId(null);
            }
            await fetchDrafts();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const startPPTFlow = () => {
        console.log('[DEBUG] Starting PPT Flow', { researchTopic, researchQuery });
        setPptTopic(researchTopic || researchQuery);
        setPptNotes(researchResult);
        setViewMode('ppt-input');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGeneratePPT = async () => {
        if (!pptTopic.trim()) {
            setPptError('Please enter a topic');
            return;
        }

        console.log('[DEBUG] Generating PPT', { pptTopic, pptTone });
        setPptError(null);
        setViewMode('ppt-generating');

        // Create new AbortController
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const res = await fetch('/api/ai/ppt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: pptTopic, notes: pptNotes, tone: pptTone }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to generate presentation content');
            }

            const data = await res.json();
            setReviewTitle(data.title || pptTopic);
            setReviewSubtitle(data.subtitle || '');
            setReviewSlides(data.slides.map((s: any) => ({
                title: s.title || '',
                body: s.body || '',
                scripture: s.scripture || '',
                speakerNotes: s.speakerNotes || ''
            })));
            setViewMode('ppt-review');
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('PPT generation aborted');
                return;
            }
            setPptError(err.message || 'Error connecting to AI service');
            setViewMode('ppt-input');
        } finally {
            abortControllerRef.current = null;
        }
    };

    const handleCancelPPT = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setViewMode('ppt-input');
    };

    const handleDownloadPPT = async () => {
        const finalData: PresentationData = {
            title: reviewTitle,
            subtitle: reviewSubtitle,
            slides: reviewSlides
        };
        try {
            await generatePPT(finalData);
        } catch (err) {
            console.error('[PPTGenerator] Download Error:', err);
            setPptError('Failed to generate PPT file');
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

    const filteredDrafts = savedResearches.filter(d =>
        d.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const MarkdownComponents = {
        h2: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-xl font-black text-white mt-8 mb-4 first:mt-0 tracking-tight" {...props} />,
        h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-lg font-black text-[#ccf381] mt-6 mb-3 tracking-tight" {...props} />,
        p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-zinc-200 leading-relaxed mb-4 text-sm font-medium" {...props} />,
        ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => <ul className="space-y-3 mb-6 ml-2" {...props} />,
        li: ({ ...props }: React.HTMLAttributes<HTMLLIElement>) => (
            <li className="flex items-start gap-3 text-sm text-zinc-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccf381] mt-2 flex-shrink-0" />
                <span>{props.children}</span>
            </li>
        ),
        strong: ({ ...props }: React.HTMLAttributes<HTMLElement>) => <strong className="text-white font-black" {...props} />,
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20 pt-8 px-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-1">Research & Prep</h1>
                    <p className="text-zinc-500 font-bold text-sm">AI-powered theological research and sermon preparation.</p>
                </div>
                <div className="flex gap-2">
                    {viewMode !== 'research' && (
                        <button
                            onClick={() => setViewMode('research')}
                            className="px-6 py-2.5 bg-zinc-100 text-zinc-600 rounded-md text-sm font-bold border border-zinc-200 shadow-sm hover:bg-zinc-200 transition-all uppercase tracking-widest"
                        >
                            History
                        </button>
                    )}
                    <button
                        onClick={startPPTFlow}
                        className="px-6 py-2.5 bg-[#0d9488] text-white rounded-md text-sm font-bold shadow-md shadow-[#0d9488]/20 hover:bg-[#0d9488]/90 transition-all uppercase tracking-widest"
                    >
                        Generate PPT
                    </button>
                </div>
            </div>

            {/* MAIN WORKSPACE SECTION */}
            <div className="bg-zinc-900 rounded-md p-8 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0d9488]/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#ccf381]/5 rounded-full blur-[80px] -ml-24 -mb-24" />

                <div className="relative z-10 animate-in fade-in duration-500">
                    {/* RESEARCH VIEW */}
                    {viewMode === 'research' && (
                        <div className="space-y-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-white mb-1">AI Research Assistant</h2>
                                <p className="text-xs text-zinc-400 font-bold">Enter a topic and let AI do deep theological research</p>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={researchQuery}
                                    onChange={(e) => setResearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !researching && handleResearch()}
                                    placeholder="e.g., The theology of grace in Pauline epistles..."
                                    className="flex-1 px-5 py-4 bg-white/10 border border-white/10 rounded-md text-white text-sm font-medium placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[#ccf381]/30 focus:border-[#ccf381]/50 transition-all"
                                />
                                <button
                                    onClick={handleResearch}
                                    disabled={researching || !researchQuery.trim()}
                                    className="px-8 py-4 bg-[#ccf381] text-black rounded-md font-black text-sm tracking-wide hover:bg-[#ccf381]/90 transition-all disabled:opacity-40 shadow-lg shadow-[#ccf381]/20"
                                >
                                    {researching && !researchResult ? 'Researching...' : 'Research'}
                                </button>
                            </div>

                            {!researchResult && !researching && (
                                <div className="flex flex-wrap gap-2">
                                    {['The theology of grace', 'Faith in Hebrews 11', 'Holy Spirit in Acts', 'Sermon on the Mount', 'Justification by faith'].map((s) => (
                                        <button key={s} onClick={() => setResearchQuery(s)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-bold text-zinc-400 hover:text-white transition-all">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {researching && !researchResult && (
                                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                    <div className="w-12 h-12 border-4 border-[#ccf381]/20 border-t-[#ccf381] rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-zinc-400">AI is researching your topic...</p>
                                </div>
                            )}

                            {researchResult && (
                                <div ref={resultRef} className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-md overflow-hidden">
                                        {/* Toolbar */}
                                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5">
                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{researchTopic}</span>
                                            <div className="flex gap-2">
                                                <button onClick={startPPTFlow} className="px-3 py-1.5 bg-[#ccf381] hover:bg-[#ccf381]/90 rounded-md text-xs font-black text-black transition-all">
                                                    Create PPT
                                                </button>
                                                <button onClick={handleCopy} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs font-bold text-zinc-300 transition-all">
                                                    {copied ? 'Copied' : 'Copy'}
                                                </button>
                                                <button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isEditing ? 'bg-[#0d9488] text-white' : 'bg-white/10 hover:bg-white/20 text-zinc-300'}`}>
                                                    {isEditing ? 'Preview' : 'Edit'}
                                                </button>
                                                <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-[#0d9488] hover:bg-[#0d9488]/80 rounded-md text-xs font-bold text-white transition-all disabled:opacity-50">
                                                    {saving ? 'Saving...' : activeId ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                                            {isEditing ? (
                                                <textarea
                                                    value={researchResult}
                                                    onChange={(e) => setResearchResult(e.target.value)}
                                                    className="w-full min-h-[500px] bg-transparent text-sm text-zinc-200 font-mono leading-relaxed outline-none resize-none p-2 rounded-md"
                                                    placeholder="Edit research content using markdown..."
                                                />
                                            ) : (
                                                <div className="prose prose-invert max-w-none">
                                                    <ReactMarkdown components={MarkdownComponents}>
                                                        {researchResult}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={followUp}
                                                    onChange={(e) => setFollowUp(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && !researching && handleFollowUp()}
                                                    placeholder="Ask AI to modify: e.g., 'Add more on Ephesians 2:8-9'..."
                                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-md text-white text-sm font-medium placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[#ccf381]/20 transition-all"
                                                />
                                                <button
                                                    onClick={handleFollowUp}
                                                    disabled={researching || !followUp.trim()}
                                                    className="px-5 py-3 bg-[#ccf381] text-black rounded-md font-bold text-sm hover:bg-[#ccf381]/90 transition-all disabled:opacity-40"
                                                >
                                                    {researching ? 'Refining...' : 'Send'}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-widest">
                                                Prompt AI to refine or expand research
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PPT INPUT VIEW */}
                    {viewMode === 'ppt-input' && (
                        <div className="space-y-8 max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black text-white mb-2">Presentation Builder</h2>
                                <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Generate sermon slides with AI</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Sermon Topic</label>
                                    <input
                                        type="text"
                                        value={pptTopic}
                                        onChange={(e) => setPptTopic(e.target.value)}
                                        placeholder="e.g., Finding Peace in the Storm"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:ring-2 focus:ring-[#ccf381]/30 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Base Content / Notes</label>
                                    <textarea
                                        value={pptNotes}
                                        onChange={(e) => setPptNotes(e.target.value)}
                                        placeholder="Enter research content or notes here..."
                                        rows={8}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:ring-2 focus:ring-[#ccf381]/30 outline-none transition-all resize-none custom-scrollbar font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Presentation Tone</label>
                                    <select
                                        value={pptTone}
                                        onChange={(e) => setPptTone(e.target.value)}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:ring-2 focus:ring-[#ccf381]/30 outline-none transition-all appearance-none font-bold"
                                    >
                                        <option value="inspirational">Inspirational</option>
                                        <option value="theological">Theological</option>
                                        <option value="storytelling">Storytelling</option>
                                        <option value="energetic">Energetic</option>
                                    </select>
                                </div>

                                {pptError && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm font-bold">
                                        {pptError}
                                    </div>
                                )}

                                <button
                                    onClick={handleGeneratePPT}
                                    className="block mx-auto px-10 py-3 bg-[#ccf381] text-black rounded-md font-black text-sm tracking-widest hover:bg-[#ccf381]/90 transition-all shadow-xl shadow-[#ccf381]/10"
                                >
                                    GENERATE SLIDES
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PPT GENERATING VIEW */}
                    {viewMode === 'ppt-generating' && (
                        <div className="flex flex-col items-center justify-center py-32 space-y-12">
                            <div className="w-16 h-16 border-4 border-[#ccf381]/20 border-t-[#ccf381] rounded-full animate-spin" />
                            <div className="text-center space-y-4">
                                <h3 className="text-2xl font-black text-white">AI Agents at Work</h3>
                                <div className="space-y-2 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                    <p className="animate-pulse">Analyzing theology...</p>
                                    <p className="animate-pulse delay-300">Structuring slides...</p>
                                    <p className="animate-pulse delay-700">Polishing content...</p>
                                </div>
                                <button
                                    onClick={handleCancelPPT}
                                    className="mt-8 px-6 py-2 bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-md text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                                >
                                    Cancel Generation
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PPT REVIEW VIEW */}
                    {viewMode === 'ppt-review' && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-1">Review & Edit Slides</h2>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Bishop Review Workspace</p>
                                </div>
                                <button
                                    onClick={addSlide}
                                    className="px-4 py-2 bg-white/10 text-white rounded-md text-xs font-black uppercase tracking-widest hover:bg-[#ccf381] hover:text-black transition-all"
                                >
                                    Add Slide
                                </button>
                            </div>

                            {/* Presentation Info */}
                            <div className="p-8 bg-black rounded-md border border-white/5 shadow-2xl">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Main Title</label>
                                <input
                                    type="text"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    className="w-full bg-transparent text-3xl font-black text-[#ccf381] outline-none border-none placeholder:text-zinc-800"
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    value={reviewSubtitle}
                                    onChange={(e) => setReviewSubtitle(e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-zinc-500 outline-none border-none mt-2 placeholder:text-zinc-800"
                                    placeholder="Subtitle"
                                />
                            </div>

                            {/* Slides List */}
                            <div className="space-y-4">
                                {reviewSlides.map((slide, i) => (
                                    <div key={i} className={`rounded-md border animate-in fade-in transition-all duration-300 ${editingSlideIndex === i ? 'border-[#0d9488] bg-white/5 shadow-xl' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                                        <div
                                            className="flex items-center justify-between p-5 cursor-pointer"
                                            onClick={() => setEditingSlideIndex(editingSlideIndex === i ? null : i)}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase w-12 flex-shrink-0">Slide {i + 1}</span>
                                                <h4 className="text-sm font-bold text-white truncate">{slide.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 'up'); }} disabled={i === 0} className="text-zinc-500 hover:text-white disabled:opacity-20 transition-all px-2">Up</button>
                                                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 'down'); }} disabled={i === reviewSlides.length - 1} className="text-zinc-500 hover:text-white disabled:opacity-20 transition-all px-2">Down</button>
                                                <button onClick={(e) => { e.stopPropagation(); removeSlide(i); }} disabled={reviewSlides.length <= 1} className="text-zinc-500 hover:text-red-500 disabled:opacity-20 transition-all px-2">Del</button>
                                                <span className={`${editingSlideIndex === i ? 'text-[#ccf381]' : 'text-zinc-700'}`}>Edit</span>
                                            </div>
                                        </div>

                                        {editingSlideIndex === i && (
                                            <div className="px-5 pb-6 space-y-4 border-t border-white/5 pt-5 animate-in slide-in-from-top-2">
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Slide Heading</label>
                                                    <input
                                                        type="text"
                                                        value={slide.title}
                                                        onChange={(e) => updateSlide(i, 'title', e.target.value)}
                                                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-md text-sm font-bold text-white outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Bullet Points / Body</label>
                                                    <textarea
                                                        value={slide.body}
                                                        onChange={(e) => updateSlide(i, 'body', e.target.value)}
                                                        rows={4}
                                                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-md text-sm text-zinc-300 outline-none resize-none font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Scripture Focus</label>
                                                    <input
                                                        type="text"
                                                        value={slide.scripture || ''}
                                                        onChange={(e) => updateSlide(i, 'scripture', e.target.value)}
                                                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-md text-sm text-[#ccf381] outline-none font-medium"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Speaker Notes</label>
                                                    <textarea
                                                        value={slide.speakerNotes || ''}
                                                        onChange={(e) => updateSlide(i, 'speakerNotes', e.target.value)}
                                                        rows={2}
                                                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-md text-sm text-zinc-500 outline-none resize-none italic font-medium"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4 pt-4 pb-12">
                                <button
                                    onClick={() => setViewMode('ppt-input')}
                                    className="px-8 py-3 bg-zinc-100/5 text-zinc-400 rounded-md text-sm font-black tracking-widest hover:bg-zinc-100/10 transition-all border border-white/5"
                                >
                                    REGENERATE
                                </button>
                                <button
                                    onClick={handleDownloadPPT}
                                    className="px-8 py-3 bg-[#ccf381] text-black rounded-md text-sm font-black tracking-widest hover:bg-[#ccf381]/90 shadow-2xl shadow-[#ccf381]/10 transition-all font-bold"
                                >
                                    DOWNLOAD PPTX
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM SECTIONS: PAST RESEARCH + WORKFLOW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Past Research */}
                <div className="md:col-span-2 bg-white rounded-md p-6 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Past Research</h3>
                        <input
                            type="text"
                            placeholder="Search History"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48 px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-md text-xs font-bold text-zinc-700 outline-none focus:border-[#0d9488] transition-all"
                        />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <div className="w-8 h-8 border-2 border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
                            </div>
                        ) : filteredDrafts.length > 0 ? (
                            filteredDrafts.map((item) => (
                                <div
                                    key={item.id}
                                    className={`group cursor-pointer p-4 rounded-md border transition-all flex items-center justify-between ${activeId === item.id ? 'bg-[#0d9488]/5 border-[#0d9488]/20' : 'border-transparent hover:bg-zinc-50'}`}
                                    onClick={() => handleLoad(item)}
                                >
                                    <div className="min-w-0">
                                        <h4 className={`text-sm font-bold truncate ${activeId === item.id ? 'text-[#0d9488]' : 'text-zinc-800'}`}>
                                            {item.title}
                                        </h4>
                                        <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-tighter">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteConfirm === item.id ? handleDelete(item.id) : setDeleteConfirm(item.id); }}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${deleteConfirm === item.id ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-300 hover:text-red-500 hover:bg-red-50'}`}
                                        >
                                            {deleteConfirm === item.id ? 'Confirm' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-zinc-400 font-bold text-xs uppercase tracking-widest">No entries found.</div>
                        )}
                    </div>
                </div>

                {/* Workflow Card */}
                <div className="p-8 bg-[#0d9488] rounded-md text-white overflow-hidden relative border border-[#0d9488]/20 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-white/60">Preparation Workflow</h4>
                        <div className="space-y-4">
                            {[
                                'Deep theological research',
                                'Refinement with AI Dialogue',
                                'Permanent archive of study',
                                'Multi-agent PPT slide output'
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-[#ccf381] w-4">{i + 1}.</span>
                                    <span className="text-sm font-bold leading-tight uppercase tracking-tight">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={startPPTFlow}
                        className="mt-8 py-3 px-6 bg-[#ccf381] text-black rounded-md text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-black/10"
                    >
                        Start PPT Task
                    </button>
                </div>
            </div>
        </div>
    );
}
