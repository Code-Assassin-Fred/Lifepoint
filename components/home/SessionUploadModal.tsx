'use client';

import { useState, useRef, DragEvent } from 'react';
import { X, Link2, Upload, Image } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/lib/context/AuthContext';

interface SessionUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SessionUploadModal({ isOpen, onClose }: SessionUploadModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [videoSource, setVideoSource] = useState<'link' | 'upload'>('link');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                setError('File too large. Max 100MB.');
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

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
        setUploadProgress(0);

        try {
            let finalVideoUrl = videoUrl.trim();

            if (videoSource === 'upload' && selectedFile) {
                const storageRef = ref(storage, `sessions/${Date.now()}_${selectedFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, selectedFile);

                finalVideoUrl = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            reject(error);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        }
                    );
                });
            }

            await addDoc(collection(db, 'sermons'), {
                title: title.trim(),
                speaker: speaker.trim(),
                date: new Date(date),
                videoUrl: finalVideoUrl,
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
            setSelectedFile(null);
            setUploadProgress(0);
            onClose();
        } catch (err) {
            console.error('Error uploading session:', err);
            setError('Failed to upload session. Please try again.');
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
                        <h2 className="text-xl font-bold text-black">Upload Session</h2>
                        <p className="text-sm text-black/60 mt-0.5">
                            Add a new session to the library for your audience.
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
                            Session Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter session title"
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
                                placeholder="Speaker name"
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
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${isDragging
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="video/*"
                                className="hidden"
                            />
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-black">
                                    {selectedFile ? selectedFile.name : 'Click or drag video to upload'}
                                </p>
                                <p className="text-xs text-black/40 mt-1">MP4, WebM or MOV up to 100MB</p>
                            </div>

                            {loading && uploadProgress > 0 && (
                                <div className="w-full mt-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-red-600 uppercase">Uploading</span>
                                        <span className="text-[10px] font-bold text-red-600">{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-600 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
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
                        {loading ? 'Uploading...' : 'Upload Session'}
                    </button>
                </div>
            </div>
        </div>
    );
}
