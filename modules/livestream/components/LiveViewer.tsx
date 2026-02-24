'use client';

import { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
interface LiveViewerProps {
    roomUrl: string;
    token?: string;
    onLeave?: () => void;
    userName?: string;
}

export default function LiveViewer({ roomUrl, token, onLeave, userName }: LiveViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const callRef = useRef<DailyCall | null>(null);
    const [isReady, setIsReady] = useState(false);

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
                // Enabling Prebuilt UI features
                userName: userName || 'User',
            });
        }

        callRef.current = call;
        setIsReady(true);

        const handleJoined = () => {
            console.log('Joined meeting');
        };

        const handleLeft = () => {
            onLeave?.();
        };

        const initJoin = async () => {
            if (!call) {
                console.error('Daily call instance not available');
                return;
            }

            try {
                const state = call.meetingState();
                console.log('Current meeting state:', state);

                if (state === 'joined-meeting' || state === 'joining-meeting') {
                    console.log('Already joined or joining, skipping call.join()');
                    return;
                }

                const joinOptions: any = { url: roomUrl };
                if (token && typeof token === 'string') {
                    joinOptions.token = token;
                }

                console.log('Attempting to join Daily room:', {
                    roomUrl,
                    hasToken: !!token,
                    tokenType: typeof token,
                    meetingState: state
                });

                await call.join(joinOptions);
            } catch (error: any) {
                // Exhaustive logging for the error object since console.error('...', error)
                // sometimes shows {} for Error objects in some environments.
                console.error('Daily join failed:', {
                    message: error?.message,
                    name: error?.name,
                    action: error?.action,
                    type: error?.type,
                    error: error
                });
            }
        };

        if (call) {
            initJoin();
        }
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
            {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4" />
                    <p className="text-sm font-medium text-gray-400">Connecting to session...</p>
                </div>
            )}
        </div>
    );
}
