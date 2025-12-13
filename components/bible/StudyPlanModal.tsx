'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StudyDay {
    dayNumber: number;
    title: string;
    scripture: string;
    content: string;
}

interface StudyPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        title?: string;
        description?: string;
        days?: StudyDay[];
    };
}

export default function StudyPlanModal({ isOpen, onClose, initialData }: StudyPlanModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Faith');
    const [days, setDays] = useState<StudyDay[]>([
        { dayNumber: 1, title: '', scripture: '', content: '' },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories = ['Faith', 'Peace', 'Discipleship', 'Prayer', 'Hope', 'Love', 'Wisdom'];

    // Load initial data
    useEffect(() => {
        if (initialData) {
            if (initialData.title) setTitle(initialData.title);
            if (initialData.description) setDescription(initialData.description);
            if (initialData.days && initialData.days.length > 0) {
                setDays(initialData.days);
            }
        }
    }, [initialData, isOpen]);

    const addDay = () => {
        setDays([...days, { dayNumber: days.length + 1, title: '', scripture: '', content: '' }]);
    };

    const removeDay = (index: number) => {
        if (days.length <= 1) return;
        const newDays = days.filter((_, i) => i !== index).map((day, i) => ({ ...day, dayNumber: i + 1 }));
        setDays(newDays);
    };

    const updateDay = (index: number, field: keyof StudyDay, value: string) => {
        const newDays = [...days];
        newDays[index] = { ...newDays[index], [field]: value };
        setDays(newDays);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required');
            return;
        }

        const validDays = days.filter((d) => d.title.trim() && d.scripture.trim());
        if (validDays.length === 0) {
            setError('At least one day with title and scripture is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await addDoc(collection(db, 'studyPlans'), {
                title: title.trim(),
                description: description.trim(),
                category,
                duration: `${validDays.length} days`,
                days: validDays,
                createdAt: serverTimestamp(),
            });

            // Reset and close
            if (!initialData) {
                setTitle('');
                setDescription('');
                setCategory('Faith');
                setDays([{ dayNumber: 1, title: '', scripture: '', content: '' }]);
            }
            onClose();
        } catch (err) {
            console.error('Error creating study plan:', err);
            setError('Failed to create study plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!initialData) {
            setTitle('');
            setDescription('');
            setCategory('Faith');
            setDays([{ dayNumber: 1, title: '', scripture: '', content: '' }]);
        }
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-black">Create Study Plan</h2>
                        <p className="text-sm text-black/60 mt-0.5">Design a multi-day Bible study plan</p>
                    </div>
                    <button onClick={handleClose} className="p-2 text-black/40 hover:text-black/60 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-black mb-1.5">Plan Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., 21 Days of Faith"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-black mb-1.5">Description *</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the study plan..."
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-1.5">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Days */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-black">Study Days</label>
                            <button
                                type="button"
                                onClick={addDay}
                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                            >
                                <Plus size={16} />
                                Add Day
                            </button>
                        </div>

                        <div className="space-y-4">
                            {days.map((day, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-black/70">Day {day.dayNumber}</span>
                                        {days.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDay(index)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={day.title}
                                        onChange={(e) => updateDay(index, 'title', e.target.value)}
                                        placeholder="Day title"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={day.scripture}
                                        onChange={(e) => updateDay(index, 'scripture', e.target.value)}
                                        placeholder="Scripture reference (e.g., John 3:16)"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <textarea
                                        value={day.content}
                                        onChange={(e) => updateDay(index, 'content', e.target.value)}
                                        placeholder="Study notes or reflection prompt (optional)"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
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
                        {loading ? 'Creating...' : 'Create Study Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
