'use client';

import { useState, useRef, DragEvent } from 'react';
import { X, Link2, Upload, Image } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/context/AuthContext';

interface SermonUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SermonUploadModal({ isOpen, onClose }: SermonUploadModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [videoSource, setVideoSource] = useState<'link' | 'upload'>('link');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        // For now, just accept URL input for thumbnail
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (!speaker.trim()) {
            setError('Speaker is required');
            return;
        }
        if (!videoUrl.trim()) {
            setError('Video URL is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await addDoc(collection(db, 'sermons'), {
                title: title.trim(),
                speaker: speaker.trim(),
                date: new Date(date),
                videoUrl: videoUrl.trim(),
                thumbnailUrl: thumbnailUrl.trim() || null,
                createdAt: serverTimestamp(),
                createdBy: user?.uid || 'unknown',
            });

            // Reset form and close
            setTitle('');
            setSpeaker('');
            setDate(new Date().toISOString().split('T')[0]);
            setVideoUrl('');
            setThumbnailUrl('');
            onClose();
        } catch (err) {
            console.error('Error uploading sermon:', err);
            setError('Failed to upload sermon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setSpeaker('');
        setDate(new Date().toISOString().split('T')[0]);
        setVideoUrl('');
        setThumbnailUrl('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-black">Upload Sermon</h2>
                        <p className="text-sm text-black/60 mt-0.5">
                            Add a new sermon to the library for your congregation.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-black/40 hover:text-black/60 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">
                            Sermon Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter sermon title"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Speaker & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-1.5">
                                Speaker *
                            </label>
                            <input
                                type="text"
                                value={speaker}
                                onChange={(e) => setSpeaker(e.target.value)}
                                placeholder="Pastor name"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-black mb-1.5">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Video Source Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">
                            Video Source *
                        </label>
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setVideoSource('link')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${videoSource === 'link'
                                        ? 'bg-red-50 text-red-600 border-r border-red-100'
                                        : 'bg-white text-black/60 hover:bg-gray-50 border-r border-gray-200'
                                    }`}
                            >
                                <Link2 size={16} />
                                Video Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setVideoSource('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${videoSource === 'upload'
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-white text-black/60 hover:bg-gray-50'
                                    }`}
                            >
                                <Upload size={16} />
                                Upload File
                            </button>
                        </div>
                    </div>

                    {/* Video URL Input */}
                    {videoSource === 'link' && (
                        <div>
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="YouTube or Vimeo URL"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                    )}

                    {/* Upload placeholder */}
                    {videoSource === 'upload' && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                            <p className="text-sm text-black/50">Video upload coming soon - use link for now</p>
                        </div>
                    )}

                    {/* Thumbnail URL */}
                    <div>
                        <label className="block text-sm font-medium text-black mb-1.5">
                            Thumbnail URL (optional)
                        </label>
                        <input
                            type="url"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="https://example.com/thumbnail.jpg"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-black/70 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Uploading...' : 'Upload Sermon'}
                    </button>
                </div>
            </div>
        </div>
    );
}
