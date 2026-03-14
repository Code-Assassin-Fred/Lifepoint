'use client';

import { Users, Bell, MessageSquare, Image as ImageIcon } from 'lucide-react';

interface CommunitySidebarProps {
    onTabChange: (tab: string) => void;
    activeTab: string;
}

export default function CommunitySidebar({ onTabChange, activeTab }: CommunitySidebarProps) {
    const navItems = [
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'general', label: 'General', icon: MessageSquare },
        { id: 'media', label: 'Media & Links', icon: ImageIcon },
    ];

    return (
        <div className="w-full md:w-[320px] bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-teal-600 text-white">
                <div className="flex items-center gap-4">
                    {/* Replaced bg-white/20 with solid color */}
                    <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center border border-white/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Lifepoint Community</h2>
                        <p className="text-teal-50 text-xs font-medium uppercase tracking-wider">Official Feed</p>
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
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group ${
                                isActive 
                                ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${
                                isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500'
                            }`}>
                                <Icon size={18} />
                            </div>
                            {item.label}
                        </button>
                    );
                })}
            </div>
            
        </div>
    );
}
