'use client';

import { Users, Info, Bell, Image as ImageIcon, MapPin } from 'lucide-react';

interface CommunitySidebarProps {
    onTabChange: (tab: string) => void;
    activeTab: string;
}

export default function CommunitySidebar({ onTabChange, activeTab }: CommunitySidebarProps) {
    const navItems = [
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'about', label: 'About Community', icon: Info },
        { id: 'media', label: 'Media & Links', icon: ImageIcon },
        { id: 'locations', label: 'Local Chapters', icon: MapPin },
    ];

    return (
        <div className="w-full md:w-[320px] bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-teal-600 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Lifepoint Community</h2>
                        <p className="text-teal-100 text-xs font-medium">Official Community Channel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 px-2 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group ${isActive
                                    ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'
                                }`}>
                                <Icon size={18} />
                            </div>
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Mobile/Compact Info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Community Strength</p>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-700">12,450+</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+120 today</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
