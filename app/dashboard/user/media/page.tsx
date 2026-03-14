'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Play,
    Mic,
    Video,
    Clock,
    User,
    ChevronRight,
    Headphones,
    Share2,
    Bookmark
} from 'lucide-react';
import VideoPlayer from '@/components/media/VideoPlayer';

interface MediaItem {
    id: string;
    title: string;
    speaker: string;
    date: string;
    duration: string;
    category: 'Sermon' | 'Podcast' | 'Worship' | 'Testimony';
    thumbnail: string;
    videoUrl?: string;
    audioUrl?: string;
}

export default function MediaPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [playingVideo, setPlayingVideo] = useState<{ url: string, title: string } | null>(null);

    const categories = ['All', 'Sermon', 'Podcast', 'Worship', 'Testimony'];

    const mediaItems: MediaItem[] = [
        {
            id: '1',
            title: 'Walking in the Spirit',
            speaker: 'Pastor John Doe',
            date: 'Oct 12, 2025',
            duration: '42:15',
            category: 'Sermon',
            thumbnail: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        },
        {
            id: '2',
            title: 'Faith in Adversity',
            speaker: 'Sarah Jenkins',
            date: 'Oct 5, 2025',
            duration: '28:30',
            category: 'Podcast',
            thumbnail: 'https://images.unsplash.com/photo-1478737270239-2fccd2c7fd1d?w=800&q=80',
            audioUrl: '#'
        },
        {
            id: '3',
            title: 'Morning Worship Session',
            speaker: 'Lifepoint Worship',
            date: 'Sep 28, 2025',
            duration: '15:20',
            category: 'Worship',
            thumbnail: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800&q=80',
            videoUrl: '#'
        },
        {
            id: '4',
            title: 'My Journey Home',
            speaker: 'Mark Thompson',
            date: 'Sep 21, 2025',
            duration: '08:45',
            category: 'Testimony',
            thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
            videoUrl: '#'
        },
    ];

    const filteredItems = mediaItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.speaker.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Hero / Featured */}
            <div className="relative h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl">
                <img
                    src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1600&q=80"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="Featured Media"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-12 left-12 right-12 flex flex-col items-start gap-4">
                    <span className="px-4 py-1.5 bg-[#ccf381] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Featured Sermon</span>
                    <h1 className="text-5xl font-black text-white max-w-2xl leading-[1.1]">The Architecture of Peace</h1>
                    <div className="flex items-center gap-6 text-zinc-300 font-bold text-sm">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-[#ccf381]" />
                            <span>Pastor Steven Furtick</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-[#ccf381]" />
                            <span>45:00</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setPlayingVideo({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'The Architecture of Peace' })}
                        className="mt-4 flex items-center gap-3 px-8 py-4 bg-white text-black rounded-[2rem] font-black text-sm hover:bg-[#ccf381] transition-all group/btn shadow-xl shadow-black/40"
                    >
                        <Play size={20} fill="currentColor" />
                        WATCH NOW
                    </button>
                </div>
            </div>

            {/* Content Filters */}
            <div className="flex flex-col md:flex-row gap-6 items-center px-4">
                <div className="relative flex-1 group">
                    <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#0d9488] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for sermons, speakers, or topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white border border-zinc-100 rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-[#0d9488]/5 focus:border-[#0d9488] outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-3xl">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                    ? 'bg-white text-black shadow-lg shadow-black/5'
                                    : 'text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Media Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pt-4">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="group flex flex-col bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-zinc-50 hover:-translate-y-2"
                    >
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6">
                            <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white">
                                    {item.category === 'Sermon' || item.category === 'Worship' ? <Video size={16} /> : <Mic size={16} />}
                                </span>
                            </div>

                            <button
                                onClick={() => item.videoUrl && setPlayingVideo({ url: item.videoUrl, title: item.title })}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                            >
                                <div className="w-14 h-14 bg-[#ccf381] text-black rounded-full flex items-center justify-center shadow-2xl">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </button>

                            <div className="absolute bottom-4 right-4">
                                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest leading-none flex items-center h-6">
                                    {item.duration}
                                </span>
                            </div>
                        </div>

                        <div className="px-2 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest">{item.category}</span>
                                <div className="flex gap-1 text-zinc-300">
                                    <button className="hover:text-red-500 transition-colors"><Bookmark size={14} /></button>
                                    <button className="hover:text-sky-500 transition-colors"><Share2 size={14} /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 leading-tight mb-2 group-hover:text-[#0d9488] transition-colors">{item.title}</h3>
                            <p className="text-sm font-bold text-zinc-400 mb-6">{item.speaker}</p>

                            <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{item.date}</span>
                                <button className="flex items-center gap-1.5 text-[10px] font-black text-zinc-900 group-hover:text-red-600 transition-colors uppercase tracking-widest">
                                    Explore <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* RSS Podcasts Integration Mockup */}
            <div className="mx-4 mt-16 p-12 bg-zinc-900 rounded-[3rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccf381]/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="w-16 h-16 bg-[#ccf381] text-black rounded-3xl flex items-center justify-center mb-8 rotate-3">
                            <Headphones size={32} />
                        </div>
                        <h2 className="text-4xl font-black mb-4 leading-tight">The Lifepoint <br />Podcast Hub</h2>
                        <p className="text-zinc-400 font-bold leading-relaxed mb-8 max-w-sm">
                            Listen to deeper theological discussions and stories of faith. Available on all major streaming platforms.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl text-xs font-black tracking-widest transition-all">SPOTIFY</button>
                            <button className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl text-xs font-black tracking-widest transition-all">APPLE PODCASTS</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { title: 'The Theology of Presence', ep: 24, dur: '54 min' },
                            { title: 'Unmasking Modern Idols', ep: 23, dur: '48 min' },
                            { title: 'Sabbath as Resistance', ep: 22, dur: '62 min' }
                        ].map((pod, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all cursor-pointer group/pod">
                                <div className="flex items-center gap-4">
                                    <span className="text-[#ccf381] font-black text-lg">0{i + 1}</span>
                                    <div>
                                        <h4 className="font-bold text-white group-hover/pod:text-[#ccf381] transition-colors">{pod.title}</h4>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Episode {pod.ep} • {pod.dur}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-full text-zinc-400 group-hover/pod:bg-[#ccf381] group-hover/pod:text-black transition-all">
                                    <Play size={16} fill="currentColor" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {playingVideo && (
                <VideoPlayer
                    url={playingVideo.url}
                    title={playingVideo.title}
                    onClose={() => setPlayingVideo(null)}
                />
            )}
        </div>
    );
}
