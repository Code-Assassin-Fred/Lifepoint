'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Users2, Clock, Send } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ScheduleSessionModal({ isOpen, onClose, onSuccess }: ScheduleSessionModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'individual' | 'group'>('individual');
    const [scheduledAt, setScheduledAt] = useState('');
    const [description, setDescription] = useState('');
    const [participants, setParticipants] = useState<string>(''); // Comma separated IDs or names for now
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!title.trim() || !scheduledAt || !description.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/development/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    type,
                    scheduledAt,
                    description,
                    mentorId: user.uid,
                    participants: participants.split(',').map(p => p.trim()).filter(p => p !== ''),
                })
            });

            if (!res.ok) throw new Error('Failed to schedule session');

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Session scheduling error:', err);
            setError('Failed to schedule session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ccf381] flex items-center justify-center text-black">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Schedule Session</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Plan a mentorship encounter</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {error && (
                        <div className="col-span-2 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl">
                            {error}
                        </div>
                    )}

                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Session Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Spiritual Leadership Q&A"
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Session Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                        >
                            <option value="individual">Individual</option>
                            <option value="group">Group</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Date & Time *</label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Participants (IDs, comma separated)</label>
                        <input
                            type="text"
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            placeholder="e.g., user_123, user_456"
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all"
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What will this session cover?"
                            className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all resize-none"
                        />
                    </div>

                    <div className="col-span-2 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-zinc-900 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-zinc-200 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? 'SCHEDULING...' : (
                                <>
                                    SCHEDULE SESSION
                                    <Clock size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
