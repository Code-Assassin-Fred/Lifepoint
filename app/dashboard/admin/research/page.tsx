'use client';

import { useState, useEffect } from 'react';
import {
    Sparkles,
    FileText,
    Save,
    Loader2,
    Trash2,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import PPTGeneratorModal from '@/components/admin/PPTGeneratorModal';

interface Draft {
    id: string;
    title: string;
    content: string;
    category: string;
    updatedAt?: string;
}

export default function ResearchPage() {
    const [isPPTModalOpen, setIsPPTModalOpen] = useState(false);
    const [currentNotes, setCurrentNotes] = useState('');
    const [title, setTitle] = useState('');
    const [recentResearches, setRecentResearches] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchDrafts = async () => {
        try {
            const response = await fetch('/api/admin/research');
            if (response.ok) {
                const data = await response.json();
                setRecentResearches(data);
            }
        } catch (error) {
            console.error('Failed to fetch drafts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleSave = async () => {
        if (!title.trim() && !currentNotes.trim()) return;
        setSaving(true);
        try {
            if (activeId) {
                // Update existing
                await fetch('/api/admin/research', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: activeId,
                        title: title || 'Untitled Draft',
                        content: currentNotes,
                        category: 'Draft'
                    }),
                });
            } else {
                // Create new
                const res = await fetch('/api/admin/research', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title || 'Untitled Draft',
                        content: currentNotes,
                        category: 'Draft'
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setActiveId(data.id);
                }
            }
            await fetchDrafts();
        } catch (error) {
            console.error('Failed to save draft:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLoadDraft = (draft: Draft) => {
        setTitle(draft.title);
        setCurrentNotes(draft.content || '');
        setActiveId(draft.id);
    };

    const handleNewDraft = () => {
        setTitle('');
        setCurrentNotes('');
        setActiveId(null);
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/research?id=${id}`, { method: 'DELETE' });
            if (activeId === id) {
                handleNewDraft();
            }
            await fetchDrafts();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete draft:', error);
        }
    };

    const filteredDrafts = recentResearches.filter(d =>
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                        Research & Prep
                    </h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        Craft your message with AI precision and biblical depth.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleNewDraft}
                        className="px-6 py-2.5 bg-white text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors shadow-sm border border-zinc-200"
                    >
                        New Draft
                    </button>
                    <button
                        onClick={() => setIsPPTModalOpen(true)}
                        className="px-6 py-2.5 bg-[#0d9488] text-white rounded-xl text-sm font-bold shadow-md shadow-[#0d9488]/20 hover:bg-[#0d9488]/90 transition-all flex items-center gap-2"
                    >
                        <Sparkles size={18} />
                        Generate AI PPT
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Main Workspace */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.05)] border border-zinc-100 min-h-[600px] flex flex-col relative group">
                        <div className="absolute top-8 right-8 flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || (!title.trim() && !currentNotes.trim())}
                                className="px-5 py-2 bg-[#0d9488] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0d9488]/90 transition-all disabled:opacity-40 flex items-center gap-2 shadow-md shadow-[#0d9488]/20"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {activeId ? 'Update' : 'Save'}
                            </button>
                        </div>

                        {activeId && (
                            <div className="mb-4">
                                <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest">Editing Draft</span>
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="Sermon Title..."
                            className="text-2xl font-black text-zinc-900 placeholder:text-zinc-200 outline-none w-full mb-6 border-none focus:ring-0"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className="flex-1 w-full text-zinc-600 leading-relaxed outline-none border-none focus:ring-0 resize-none font-medium text-lg placeholder:text-zinc-200"
                            placeholder="Start researching or drafting your thoughts here... AI assistant can help you expand your notes into a full presentation."
                            value={currentNotes}
                            onChange={(e) => setCurrentNotes(e.target.value)}
                        />

                        <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#0d9488]" />
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    {activeId ? 'Draft loaded' : 'New draft'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-xs font-bold text-zinc-400">{currentNotes.split(/\s+/).filter(w => w).length} Words</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar — Recent Drafts */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Saved Drafts</h3>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{recentResearches.length}</span>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
                            <input
                                type="text"
                                placeholder="Search drafts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0d9488]/10 focus:border-[#0d9488] transition-all"
                            />
                        </div>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-[#0d9488]" size={24} />
                                </div>
                            ) : filteredDrafts.length > 0 ? (
                                filteredDrafts.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`group cursor-pointer p-3 rounded-xl border transition-all ${activeId === item.id ? 'bg-[#0d9488]/5 border-[#0d9488]/20' : 'border-transparent hover:bg-zinc-50'}`}
                                        onClick={() => handleLoadDraft(item)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeId === item.id ? 'bg-[#0d9488] text-white' : 'bg-zinc-50 text-zinc-400 group-hover:bg-[#ccf381] group-hover:text-black'}`}>
                                                <FileText size={14} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-bold truncate transition-colors ${activeId === item.id ? 'text-[#0d9488]' : 'text-zinc-800 group-hover:text-[#0d9488]'}`}>
                                                    {item.title}
                                                </h4>
                                                <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                                                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteConfirm === item.id ? handleDelete(item.id) : setDeleteConfirm(item.id);
                                                }}
                                                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${deleteConfirm === item.id ? 'bg-red-50 text-red-500 opacity-100' : 'text-zinc-300 hover:text-red-500 hover:bg-red-50'}`}
                                                title={deleteConfirm === item.id ? 'Click again to confirm' : 'Delete draft'}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs font-bold text-zinc-400 text-center py-8">
                                    {searchQuery ? 'No matching drafts.' : 'No saved drafts yet.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick Tip */}
                    <div className="p-6 bg-[#0d9488] rounded-[2rem] text-white overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mb-8" />
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3 opacity-60">Workflow Tip</h4>
                        <p className="text-sm font-bold leading-relaxed mb-4">
                            Draft your research notes, then use <span className="text-[#ccf381]">Generate AI PPT</span> to convert them into professional presentation slides. You can review and edit each slide before downloading.
                        </p>
                        <button
                            onClick={() => setIsPPTModalOpen(true)}
                            className="text-xs font-black text-white hover:text-black hover:bg-[#ccf381] py-2 px-4 rounded-xl border border-white/20 transition-all flex items-center gap-2"
                        >
                            Try it Now <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <PPTGeneratorModal
                isOpen={isPPTModalOpen}
                onClose={() => setIsPPTModalOpen(false)}
                initialNotes={currentNotes}
            />
        </div>
    );
}
