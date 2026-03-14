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
            {/* Header - Solid Colors Only */}
            <div className="p-6 border-b border-slate-200 bg-teal-600 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-700 rounded-2xl flex items-center justify-center border border-teal-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Lifepoint Community</h2>
                        <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Official Feed</p>
                    </div>
                </div>
            </div>

            {/* Navigation - No Bubbles/Cards */}
            <div className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 transition-colors relative group`}
                        >
                            {/* Visual Indicator (instead of background bubble) */}
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r-full" />
                            )}
                            
                            <div className={`p-2 rounded-lg transition-colors ${
                                isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
                            }`}>
                                <Icon size={20} />
                            </div>
                            
                            <span className={`text-sm font-bold transition-colors ${
                                isActive ? 'text-teal-600 font-black' : 'text-slate-500 group-hover:text-slate-700'
                            }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            
            {/* Minimal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected</span>
                </div>
            </div>
        </div>
    );
}
