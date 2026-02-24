'use client';

import { useEffect, useRef } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';

interface LiveViewerProps {
    roomUrl: string;
    token?: string;
    onLeave?: () => void;
}

export default function LiveViewer({ roomUrl, token, onLeave }: LiveViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const callRef = useRef<DailyCall | null>(null);

    useEffect(() => {
        if (!containerRef.current || callRef.current) return;

        // Initialize Daily Prebuilt iframe
        const call: DailyCall = DailyIframe.createFrame(containerRef.current, {
            iframeStyle: {
                width: '100%',
                height: '100%',
                border: '0',
                borderRadius: '16px',
            },
            showLeaveButton: true,
            showFullscreenButton: true,
        });

        callRef.current = call;

        call.join({ url: roomUrl, token: token });

        call.on('left-meeting', () => {
            onLeave?.();
        });

        return () => {
            call.destroy();
            callRef.current = null;
        };
    }, [roomUrl, token, onLeave]);

    return (
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />

            {/* Loading State Overlay (if needed) */}
            {!callRef.current && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4" />
                    <p className="text-sm font-medium text-gray-400">Connecting to session...</p>
                </div>
            )}
        </div>
    );
}
