'use client';

import { useState } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';

interface AnnouncementComposerProps {
    onPost: (data: { title: string; content: string; imageUrl?: string }) => Promise<void>;
}

export default function AnnouncementComposer({ onPost }: AnnouncementComposerProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || isPosting) return;

        setIsPosting(true);
        try {
            await onPost({ title, content, imageUrl });
            setTitle('');
            setContent('');
            setImageUrl('');
            setShowImageInput(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-4xl mx-auto space-y-3">
                {/* Inputs area */}
                <div className="bg-slate-50 p-4 border border-slate-100 focus-within:border-teal-500 transition-all">
                    <input 
                        type="text"
                        placeholder="ANNOUNCEMENT TITLE..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-slate-800 placeholder:text-slate-400 uppercase tracking-widest mb-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea 
                        placeholder="Write your message here..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-600 placeholder:text-slate-400 min-h-[80px] resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                {/* Optional Image Input */}
                {showImageInput && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 px-4 rounded-xl border border-dashed border-slate-300 animate-in slide-in-from-top-2">
                        <ImageIcon size={16} className="text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Paste image URL here..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-medium text-slate-600"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <button 
                            type="button" 
                            onClick={() => { setImageUrl(''); setShowImageInput(false); }}
                            className="p-1 hover:bg-slate-200 rounded-md"
                        >
                            <X size={14} className="text-slate-500" />
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => setShowImageInput(!showImageInput)}
                            className={`p-2.5 rounded-xl transition-all ${showImageInput ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            <ImageIcon size={18} />
                        </button>
                        <button 
                            type="button"
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                        >
                            <Sparkles size={14} className="text-teal-400" />
                            AI Refine
                        </button>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isPosting || !title || !content}
                        className="flex items-center gap-3 px-8 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {isPosting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                        POST CHANNEL
                    </button>
                </div>
            </div>
        </form>
    );
}
