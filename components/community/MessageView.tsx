'use client';

import { format } from 'date-fns';
import { User, Trash2, Calendar, MoreVertical, Share2, CheckCheck } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    authorName: string;
    authorRole: string;
    createdAt: string;
}

interface MessageViewProps {
    announcements: Announcement[];
    isAdmin: boolean;
    onDelete?: (id: string) => void;
}

export default function MessageView({ announcements, isAdmin, onDelete }: MessageViewProps) {
    if (announcements.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-slate-300">
                    <Share2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-tight">No announcements yet</h3>
                <p className="text-slate-500 text-sm max-w-sm font-medium">
                    When the leadership posts update, they will appear here in chronological order.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#efeae2]/40 scroll-smooth">
            {announcements.map((msg) => (
                <div key={msg.id} className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Date Divider (optional, but WhatsApp style) */}
                    <div className="flex justify-center mb-6">
                        <span className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm border border-slate-100">
                            {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group">
                        {/* Admin Badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => onDelete?.(msg.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <button className="p-2 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        {/* Author Info */}
                        <div className="p-6 pb-0 flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border border-teal-100">
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 leading-none mb-1 uppercase tracking-tight text-sm">
                                    {msg.authorName}
                                </h4>
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none">
                                    {msg.authorRole}
                                </p>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="p-6 space-y-4">
                            {msg.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                    <img
                                        src={msg.imageUrl}
                                        alt={msg.title}
                                        className="w-full object-cover max-h-[300px]"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight leading-tight uppercase">
                                    {msg.title}
                                </h3>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                    {msg.content}
                                </div>
                            </div>
                        </div>

                        {/* Message Footer */}
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {format(new Date(msg.createdAt), 'h:mm a')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-teal-500">
                                <CheckCheck size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Channel</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
