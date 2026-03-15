'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Video,
    Mic,
    Edit3,
    Trash2,
    MoreHorizontal,
    Upload,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Filter,
    Radio
} from 'lucide-react';
import SessionUploadModal from '@/components/home/SessionUploadModal';
import { livestreamService, LiveSession } from '@/lib/services/livestreamService';

export default function MediaAdminPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                // Fetch Sermons/Videos
                const response = await fetch('/api/sermons');
                let sermons: any[] = [];
                if (response.ok) {
                    sermons = await response.json();
                }

                // Fetch Past Live Streams
                let pastStreams: LiveSession[] = [];
                try {
                    pastStreams = await livestreamService.getPastSessions();
                } catch (err) {
                    console.error('Failed to fetch past streams:', err);
                }

                // Combine and sort by date
                const combined = [
                    ...sermons.map((s: any) => ({ ...s, source: 'sermon' })),
                    ...pastStreams.map((ps: any) => ({
                        id: ps.id,
                        title: ps.title,
                        speaker: 'LifePoint Live',
                        date: ps.endedAt,
                        type: 'Livestream',
                        views: '0', // Adjust if views are available for streams
                        status: 'Published',
                        source: 'livestream'
                    }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setMediaList(combined);
            } catch (error) {
                console.error('Failed to fetch media:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    const filteredMedia = mediaList.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalViews = mediaList.reduce((acc, item) => acc + (parseInt(item.views) || 0), 0);
    const audioPlays = mediaList.filter(item => item.type === 'Podcast').reduce((acc, item) => acc + (parseInt(item.views) || 0), 0);
    const activeDrafts = mediaList.filter(item => item.status === 'Draft').length;

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                        Media Content Manager
                    </h1>
                    <p className="text-zinc-600 font-bold text-sm flex items-center gap-4">
                        <span>Total {mediaList.length} items across all categories</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                        <span className="text-zinc-900">{totalViews.toLocaleString()} Total Views</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-6 py-2.5 bg-[#0d9488] text-white rounded-xl text-sm font-bold shadow-md shadow-[#0d9488]/20 hover:bg-[#0f766e] transition-all flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add New Media
                    </button>
                </div>
            </div>

            {/* Content Table Area */}
            <div className="px-4">
                <div className="overflow-hidden">
                    {/* Toolbar */}
                    <div className="pb-6 border-b border-zinc-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search by title or speaker..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-[#0d9488]/10 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-white text-zinc-500 border border-zinc-200 hover:text-zinc-900 rounded-xl transition-all"><Filter size={18} /></button>
                            <button className="px-4 py-3 bg-white text-zinc-900 border border-zinc-200 rounded-xl text-xs font-bold transition-all">Export</button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative mt-6">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d9488]" />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="">
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-900 uppercase tracking-widest whitespace-nowrap">Content</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-900 uppercase tracking-widest whitespace-nowrap">Speaker</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-900 uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-900 uppercase tracking-widest whitespace-nowrap text-right">Engagement</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredMedia.length > 0 ? filteredMedia.map((item) => (
                                        <tr key={item.id} className="group hover:bg-zinc-100/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                        {item.type === 'Sermon' ? <Video size={18} /> : item.type === 'Livestream' ? <Radio size={18} /> : <Mic size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 leading-tight mb-0.5">{item.title}</p>
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                            {item.date && new Date(item.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-zinc-600">{item.speaker || 'Unknown'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Published' || !item.status ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-600'
                                                    }`}>
                                                    {item.status || 'Published'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-zinc-900">{item.views || 0}</span>
                                                    <span className="text-[10px] font-bold text-zinc-500">Views</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-zinc-300 hover:text-zinc-600 transition-colors">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-10 text-center text-zinc-400 font-medium">
                                                No media items found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <SessionUploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
}
