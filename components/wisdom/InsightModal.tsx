'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface InsightModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        id?: string;
        title?: string;
        content?: string;
        prayerPrompt?: string;
    };
}

export default function InsightModal({ isOpen, onClose, initialData }: InsightModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [prayerPrompt, setPrayerPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Load initial data when available
    useEffect(() => {
        if (initialData && isOpen) {
            if (initialData.title) setTitle(initialData.title);
            if (initialData.content) setContent(initialData.content);
            if (initialData.prayerPrompt) setPrayerPrompt(initialData.prayerPrompt);
        } else if (!isOpen) {
            // Reset when closing
            setTitle('');
            setContent('');
            setPrayerPrompt('');
            setError(null);
            setSuccess(false);
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = {
                date,
                title: title.trim(),
                content: content.trim(),
                prayerPrompt: prayerPrompt.trim() || null,
                updatedAt: serverTimestamp(),
            };

            if (initialData?.id) {
                // Update existing
                await updateDoc(doc(db, 'devotions', initialData.id), data);
            } else {
                // Create new
                await addDoc(collection(db, 'devotions'), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Error saving insight:', err);
            setError('Failed to save insight. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!initialData) {
            setDate(new Date().toISOString().split('T')[0]);
            setTitle('');
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
                        <h2 className="text-xl font-bold text-black">Create Insight</h2>
                        <p className="text-sm text-black/60 mt-0.5">Add a daily insight for the community</p>
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

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold">Insight Saved Successfully!</p>
                                <p className="opacity-80">This insight is now live for the community.</p>
                            </div>
                        </div>
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
                        <label className="block text-sm font-medium text-black mb-1.5">Insight Content *</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write the daily insight reflection..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5 font-bold text-red-600 flex items-center gap-2">
                             Prayer & Reflection Focus (optional)
                             <span className="text-[10px] bg-red-50 px-2 py-0.5 rounded-full font-medium">Shown as "Prayer Focus" to users</span>
                        </label>
                        <textarea
                            value={prayerPrompt}
                            onChange={(e) => setPrayerPrompt(e.target.value)}
                            placeholder="A guiding prompt for prayer or personal reflection..."
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
                        {loading ? 'Creating...' : 'Create Insight'}
                    </button>
                </div>
            </div>
        </div>
    );
}
