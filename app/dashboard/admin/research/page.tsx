'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Sparkles,
    Layout,
    BookMarked,
    Calendar,
    History,
    ChevronRight,
    FileText,
    Save,
    MoreVertical,
    Download
} from 'lucide-react';
import PPTGeneratorModal from '@/components/admin/PPTGeneratorModal';

export default function ResearchPage() {
    const [isPPTModalOpen, setIsPPTModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentNotes, setCurrentNotes] = useState('');

    const recentResearches = [
        { id: 1, title: 'The Power of Forgiveness', date: 'Yesterday', category: 'Sermon Series' },
        { id: 2, title: 'Biblical Stewardship', date: '3 days ago', category: 'Workshop' },
        { id: 3, title: 'Mental Health & Faith', date: 'Last Week', category: 'Special Event' },
    ];

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
                    <button className="px-6 py-2.5 bg-white text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors shadow-sm border border-zinc-200">
                        Past Drafts
                    </button>
                    <button
                        onClick={() => setIsPPTModalOpen(true)}
                        className="px-6 py-2.5 bg-[#ccf381] text-black rounded-xl text-sm font-bold shadow-md shadow-[#ccf381]/20 hover:shadow-xl transition-all flex items-center gap-2"
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
                        <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl transition-all">
                                <Save size={18} />
                            </button>
                            <button className="p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl transition-all">
                                <History size={18} />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Sermon Title..."
                            className="text-2xl font-black text-zinc-900 placeholder:text-zinc-200 outline-none w-full mb-6 border-none focus:ring-0"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <textarea
                            className="flex-1 w-full text-zinc-600 leading-relaxed outline-none border-none focus:ring-0 resize-none font-medium text-lg placeholder:text-zinc-200"
                            placeholder="Start researching or drafting your thoughts here... AI assistant can help you expand your notes into a full presentation."
                            value={currentNotes}
                            onChange={(e) => setCurrentNotes(e.target.value)}
                        />

                        <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#ccf381]" />
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Workspace Autosaved</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-xs font-bold text-zinc-400">{currentNotes.split(/\s+/).filter(w => w).length} Words</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Tools */}
                <div className="space-y-6">
                    {/* Search / Context */}
                    <div className="bg-zinc-900 rounded-[2rem] p-6 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccf381]/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#ccf381]/30 transition-all duration-700" />

                        <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
                            <Layout size={20} className="text-[#ccf381]" />
                            Prep Tools
                        </h3>

                        <div className="space-y-3 relative z-10">
                            {[
                                { icon: BookMarked, label: 'Scripture Explorer' },
                                { icon: Calendar, label: 'Series Planner' },
                                { icon: Sparkles, label: 'AI Illustration Gen' }
                            ].map((item) => (
                                <button key={item.label} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between group/item transition-all border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="text-[#ccf381]" />
                                        <span className="text-sm font-bold text-zinc-300 group-hover/item:text-white">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-zinc-600 group-hover/item:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Research */}
                    <div className="bg-white rounded-[2rem] p-6 border border-zinc-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Recent Activity</h3>
                            <button className="text-[10px] font-black text-[#0d9488] hover:text-zinc-600 uppercase tracking-widest">See All</button>
                        </div>

                        <div className="space-y-4">
                            {recentResearches.map((item) => (
                                <div key={item.id} className="group cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#ccf381] group-hover:text-black transition-all">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-zinc-800 truncate group-hover:text-[#0d9488] transition-colors">{item.title}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{item.category} • {item.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Insight / Tips */}
                    <div className="p-6 bg-[#0d9488] rounded-[2rem] text-white overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mb-8" />
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3 opacity-60">Prep Tip</h4>
                        <p className="text-sm font-bold leading-relaxed mb-4">
                            Use the <span className="text-[#ccf381]">AI Generator</span> to convert your notes into high-impact slides once your research is 70% complete.
                        </p>
                        <button className="text-xs font-black text-white hover:text-black hover:bg-[#ccf381] py-2 px-4 rounded-xl border border-white/20 transition-all flex items-center gap-2">
                            Learn More <ChevronRight size={14} />
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
