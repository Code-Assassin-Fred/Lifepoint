'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DevotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        title?: string;
        scripture?: string;
        content?: string;
        prayerPrompt?: string;
    };
}

export default function DevotionModal({ isOpen, onClose, initialData }: DevotionModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [title, setTitle] = useState('');
    const [scripture, setScripture] = useState('');
    const [content, setContent] = useState('');
    const [prayerPrompt, setPrayerPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial data when available
    useEffect(() => {
        if (initialData) {
            if (initialData.title) setTitle(initialData.title);
            if (initialData.scripture) setScripture(initialData.scripture);
            if (initialData.content) setContent(initialData.content);
            if (initialData.prayerPrompt) setPrayerPrompt(initialData.prayerPrompt);
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        if (!title.trim() || !scripture.trim() || !content.trim()) {
            setError('Title, scripture, and content are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await addDoc(collection(db, 'devotions'), {
                date,
                title: title.trim(),
                scripture: scripture.trim(),
                content: content.trim(),
                prayerPrompt: prayerPrompt.trim() || null,
                createdAt: serverTimestamp(),
            });

            // Reset and close
            setDate(new Date().toISOString().split('T')[0]);
            setTitle('');
            setScripture('');
            setContent('');
            setPrayerPrompt('');
            onClose();
        } catch (err) {
            console.error('Error creating devotion:', err);
            setError('Failed to create devotion. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!initialData) {
            setDate(new Date().toISOString().split('T')[0]);
            setTitle('');
            setScripture('');
            setContent('');
            setPrayerPrompt('');
        }
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-black">Create Devotion</h2>
                        <p className="text-sm text-black/60 mt-0.5">Add a daily devotion for the community</p>
                    </div>
                    <button onClick={handleClose} className="p-2 text-black/40 hover:text-black/60 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Finding Peace in the Storm"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">Scripture Reference *</label>
                        <input
                            type="text"
                            value={scripture}
                            onChange={(e) => setScripture(e.target.value)}
                            placeholder="e.g., Philippians 4:6-7"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">Devotional Content *</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write the devotional reflection..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">Prayer Prompt (optional)</label>
                        <textarea
                            value={prayerPrompt}
                            onChange={(e) => setPrayerPrompt(e.target.value)}
                            placeholder="A guiding prayer or prompt for reflection..."
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-black/70 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Devotion'}
                    </button>
                </div>
            </div>
        </div>
    );
}
