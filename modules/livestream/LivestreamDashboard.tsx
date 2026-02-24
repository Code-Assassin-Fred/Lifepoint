'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { livestreamService, LiveSession } from '@/lib/services/livestreamService';
import LiveAdmin from './components/LiveAdmin';
import LiveViewer from './components/LiveViewer';
import { Radio, AlertCircle } from 'lucide-react';

export default function LivestreamDashboard() {
    const { user, role } = useAuth();
    const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminToken, setAdminToken] = useState<string | null>(null);

    const isAdmin = role === 'admin';

    useEffect(() => {
        const unsubscribe = livestreamService.subscribeToActiveSession((session) => {
            setActiveSession(session);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStartStream = async (title: string) => {
        try {
            const response = await fetch('/api/livestream/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) throw new Error('Failed to create room');

            const { roomUrl, roomName, token } = await response.json();

            // Save session to Firestore
            await livestreamService.startSession({
                adminId: user?.uid || 'unknown',
                roomUrl,
                roomName,
                title,
            });

            setAdminToken(token);
        } catch (error) {
            console.error('Error starting stream:', error);
            throw error;
        }
    };

    const handleEndStream = async () => {
        if (activeSession?.id) {
            await livestreamService.endSession(activeSession.id);
            setAdminToken(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
        );
    }

    // If there is an active session, show the viewer (or admin view if admin)
    if (activeSession) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-black">{activeSession.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Live Now</span>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={handleEndStream}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            End Session
                        </button>
                    )}
                </div>

                <LiveViewer
                    roomUrl={activeSession.roomUrl}
                    token={isAdmin ? adminToken || undefined : undefined}
                    onLeave={isAdmin ? handleEndStream : undefined}
                />
            </div>
        );
    }

    // No active session
    if (isAdmin) {
        return <LiveAdmin onStart={handleStartStream} onEnd={handleEndStream} />;
    }

    return (
        <div className="bg-gray-50 rounded-2xl p-12 py-24 text-center flex flex-col items-center justify-center border border-gray-100/50">
            <div className="w-16 h-16 rounded-full bg-gray-200/50 flex items-center justify-center mb-6">
                <Radio size={28} className="text-black/40" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">No Live Session</h3>
            <p className="text-black/60 text-sm max-w-sm mx-auto leading-relaxed">
                Check back during session times to watch live. Our sessions are streamed regularly.
            </p>
        </div>
    );
}
