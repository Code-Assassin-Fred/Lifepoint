'use client';

import { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface MentorshipRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function MentorshipRequestModal({ isOpen, onClose, onSuccess }: MentorshipRequestModalProps) {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!reason.trim() || !area.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/development/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous User',
                    reason,
                    area
                })
            });

            if (!res.ok) throw new Error('Failed to submit request');

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Mentorship request error:', err);
            setError('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ccf381] flex items-center justify-center text-black">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Request Mentorship</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Connect with a spiritual guide</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Focus Area</label>
                        <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="e.g., Leadership, Theology, Personal Growth"
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Why do you seek mentorship?</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="Tell us about your current journey and expectations..."
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-zinc-900 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? 'SUBMITTING...' : (
                            <>
                                SUBMIT REQUEST
                                <Send size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
