'use client';

import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
    url: string;
    onClose: () => void;
    title?: string;
}

export default function VideoPlayer({ url, onClose, title }: VideoPlayerProps) {
    const isExternal = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.includes('daily.co');
    const [videoUrl, setVideoUrl] = useState<string | null>(isExternal ? url : null);
    const [loading, setLoading] = useState(!isExternal);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSignedUrl = async () => {
            if (isExternal) {
                setVideoUrl(url);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/media/signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: url }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to get signed URL');
                }

                const { signedUrl } = await response.json();
                setVideoUrl(signedUrl);
            } catch (err: any) {
                console.error('Error fetching signed URL:', err);
                setError(err.message || 'Error loading video');
            } finally {
                setLoading(false);
            }
        };

        fetchSignedUrl();
    }, [url, isExternal]);

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.split('v=')[1] || url.split('/').pop();
            return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        if (url.includes('vimeo.com')) {
            const id = url.split('/').pop();
            return `https://player.vimeo.com/video/${id}?autoplay=1`;
        }
        return url;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Container */}
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10 opacity-100 transition-opacity">
                    <h3 className="text-white font-bold text-lg drop-shadow-md">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-4">
                        <Loader2 className="animate-spin" size={40} />
                        <p className="text-sm">Preparing secure stream...</p>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/60 p-6 text-center">
                        <p className="text-red-400 font-medium mb-2">Failed to Load Video</p>
                        <p className="text-sm max-w-sm">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
                        >
                            Close
                        </button>
                    </div>
                ) : isExternal ? (
                    <iframe
                        src={getEmbedUrl(videoUrl!)}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />

                ) : videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    />
                ) : null}
            </div>
        </div>
    );
}
