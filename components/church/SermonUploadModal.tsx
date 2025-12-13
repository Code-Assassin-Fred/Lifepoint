'use client';

import { useState, useRef, DragEvent } from 'react';
import { X, Link2, Upload, Image, Calendar } from 'lucide-react';

interface SermonUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SermonUploadModal({ isOpen, onClose }: SermonUploadModalProps) {
    const [title, setTitle] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [videoSource, setVideoSource] = useState<'link' | 'upload'>('link');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailChange = (file: File) => {
        setThumbnail(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setThumbnailPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleThumbnailChange(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleThumbnailChange(file);
        }
    };

    const handleSubmit = () => {
        // No submit logic - just for UI demo
        console.log({ title, speaker, date, videoSource, videoUrl, thumbnail });
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setSpeaker('');
        setDate(new Date().toISOString().split('T')[0]);
        setVideoUrl('');
        setThumbnail(null);
        setThumbnailPreview(null);
    };

    const handleClose = () => {
        resetForm();
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
                        <h2 className="text-xl font-bold text-gray-900">Upload Sermon</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Add a new sermon to the library for your congregation.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Sermon Title
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Speaker
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Video Source Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Video Source
                        </label>
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setVideoSource('link')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${videoSource === 'link'
                                        ? 'bg-red-50 text-red-600 border-r border-red-100'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-r border-gray-200'
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
                                        : 'bg-white text-gray-600 hover:bg-gray-50'
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
                            <p className="text-sm text-gray-500">Video upload coming soon</p>
                        </div>
                    )}

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Thumbnail (optional)
                        </label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${isDragging
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                } ${thumbnailPreview ? 'p-2' : 'p-6'}`}
                        >
                            {thumbnailPreview ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setThumbnail(null);
                                            setThumbnailPreview(null);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Image size={32} className="mb-2" />
                                    <p className="text-sm font-medium">Choose Image</p>
                                    <p className="text-xs mt-1">or drag and drop</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                    >
                        Upload Sermon
                    </button>
                </div>
            </div>
        </div>
    );
}
