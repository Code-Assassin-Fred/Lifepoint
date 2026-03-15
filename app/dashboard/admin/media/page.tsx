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
    Filter
} from 'lucide-react';

export default function MediaAdminPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const response = await fetch('/api/sermons');
                if (response.ok) {
                    const data = await response.json();
                    setMediaList(data);
                }
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
                    <p className="text-zinc-500 font-medium text-sm">
                        Total {mediaList.length} items across all categories.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-white text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors shadow-sm border border-zinc-200">
                        Analytics
                    </button>
                    <button className="px-6 py-2.5 bg-[#0d9488] text-white rounded-xl text-sm font-bold shadow-md shadow-[#0d9488]/20 hover:bg-[#0f766e] transition-all flex items-center gap-2">
                        <Plus size={18} />
                        Add New Media
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4">
                {[
                    { label: 'Total Views', value: totalViews.toLocaleString(), trend: '+0%', color: 'text-teal-600' },
                    { label: 'Audio Plays', value: audioPlays.toLocaleString(), trend: '+0%', color: 'text-sky-600' },
                    { label: 'Active Drafts', value: activeDrafts.toString(), trend: '', color: 'text-slate-600' },
                    { label: 'Storage Used', value: '82%', trend: '98GB', color: 'text-red-600' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between h-[130px]">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                            <span className={`text-[10px] font-black ${stat.color} bg-current/5 px-2 py-0.5 rounded-full`}>{stat.trend}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-zinc-900 leading-none">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Content Table Area */}
            <div className="px-4">
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 max-w-md w-full">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by title or speaker..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#0d9488]/10 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-600 rounded-xl transition-all"><Filter size={18} /></button>
                            <button className="px-4 py-3 bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold transition-all">Export</button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d9488]" />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Content</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Speaker</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Engagement</th>
                                        <th className="px-8 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {filteredMedia.length > 0 ? filteredMedia.map((item) => (
                                        <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                        {item.type === 'Sermon' ? <Video size={18} /> : <Mic size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900 leading-tight mb-0.5">{item.title}</p>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                            {item.date && new Date(item.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-zinc-600">{item.speaker || 'Unknown'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Published' || !item.status ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'
                                                    }`}>
                                                    {item.status || 'Published'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-zinc-900">{item.views || 0}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400">Views</span>
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
        </div>
    );
}
