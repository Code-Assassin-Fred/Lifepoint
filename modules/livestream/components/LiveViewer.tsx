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
        if (!containerRef.current) return;

        // Check if an instance already exists
        let call = DailyIframe.getCallInstance();

        if (!call) {
            // Initialize Daily Prebuilt iframe
            call = DailyIframe.createFrame(containerRef.current, {
                iframeStyle: {
                    width: '100%',
                    height: '100%',
                    border: '0',
                    borderRadius: '16px',
                },
                showLeaveButton: true,
                showFullscreenButton: true,
            });
        }

        callRef.current = call;

        const handleJoined = () => {
            console.log('Joined meeting');
        };

        const handleLeft = () => {
            onLeave?.();
        };

        const initJoin = async () => {
            const state = call.meetingState();
            if (state === 'joined-meeting' || state === 'joining-meeting') {
                return;
            }

            const joinOptions: any = { url: roomUrl };
            if (token && typeof token === 'string') {
                joinOptions.token = token;
            }

            await call.join(joinOptions);
        };

        initJoin();
        call.on('joined-meeting', handleJoined);
        call.on('left-meeting', handleLeft);

        return () => {
            if (call) {
                call.off('joined-meeting', handleJoined);
                call.off('left-meeting', handleLeft);
                call.destroy();
                callRef.current = null;
            }
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
