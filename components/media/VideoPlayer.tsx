'use client';

import { X } from 'lucide-react';

interface VideoPlayerProps {
    url: string;
    onClose: () => void;
    title?: string;
}

export default function VideoPlayer({ url, onClose, title }: VideoPlayerProps) {
    const isExternal = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');

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
                <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10 opacity-0 hover:opacity-100 transition-opacity">
                    <h3 className="text-white font-bold text-lg drop-shadow-md">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {isExternal ? (
                    <iframe
                        src={getEmbedUrl(url)}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <video
                        src={url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    />
                )}
            </div>
        </div>
    );
}
