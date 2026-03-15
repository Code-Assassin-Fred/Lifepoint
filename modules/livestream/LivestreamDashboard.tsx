'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { livestreamService, LiveSession } from '@/lib/services/livestreamService';
import LiveAdmin from './components/LiveAdmin';
import LiveViewer from './components/LiveViewer';
import { Radio, AlertCircle, Share2, Check, PlayCircle, Trash2 } from 'lucide-react';
import VideoPlayer from '@/components/media/VideoPlayer';

export default function LivestreamDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [pastSessions, setPastSessions] = useState<LiveSession[]>([]);
    const [loadingPast, setLoadingPast] = useState(true);
    const [selectedPlaybackSession, setSelectedPlaybackSession] = useState<LiveSession | null>(null);
    const [fetchingRecording, setFetchingRecording] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteConfirmSession, setDeleteConfirmSession] = useState<LiveSession | null>(null);

    const isAdmin = role === 'admin';

    useEffect(() => {
        if (authLoading) return;

        const unsubscribeScroll = livestreamService.subscribeToActiveSession((session) => {
            setActiveSession(session);
            setLoading(false);
        });

        const fetchPast = async () => {
            try {
                const past = await livestreamService.getPastSessions();
                setPastSessions(past);
            } catch (error) {
                console.error('Error fetching past sessions:', error);
            } finally {
                setLoadingPast(false);
            }
        };

        fetchPast();

        return () => unsubscribeScroll();
    }, [authLoading]);

    const handleShare = useCallback(async () => {
        try {
            const shareUrl = `${window.location.origin}/dashboard/home?tab=livestream`;
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }, []);

    const handleStartStream = useCallback(async (title: string) => {
        try {
            const response = await fetch('/api/livestream/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, adminId: user?.uid }),
            });

            if (!response.ok) throw new Error('Failed to create room');

            const { roomUrl, token } = await response.json();
            setAdminToken(token);
        } catch (error) {
            console.error('Error starting stream:', error);
            throw error;
        }
    }, [user?.uid]);

    const handleEndStream = useCallback(async () => {
        if (activeSession?.id) {
            try {
                const response = await fetch('/api/livestream/end-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: activeSession.id }),
                });

                if (!response.ok) throw new Error('Failed to end session');
                setAdminToken(null);
                // Refresh past sessions
                const past = await livestreamService.getPastSessions();
                setPastSessions(past);
            } catch (error) {
                console.error('Error ending session:', error);
            }
        }
    }, [activeSession?.id]);

    const handleDeleteSession = useCallback(async (sessionId: string) => {
        setIsDeleting(sessionId);
        try {
            const response = await fetch('/api/livestream/delete-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            if (!response.ok) throw new Error('Failed to delete session');
            
            setPastSessions(prev => prev.filter(s => s.id !== sessionId));
            setDeleteConfirmSession(null);
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('Failed to delete session');
        } finally {
            setIsDeleting(null);
        }
    }, []);

    const handlePlayRecording = useCallback(async (session: LiveSession) => {
        if (!session.recordingId) return;
        
        setFetchingRecording(session.id || null);
        try {
            const res = await fetch(`/api/livestream/recording-url?recordingId=${session.recordingId}`);
            
            if (res.status === 202) {
                alert('Recording is still processing and will be ready in a few minutes.');
                return;
            }
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch recording URL');
            }
            
            const data = await res.json();
            console.log('[Playback] Got recording URL:', data.downloadUrl);
            
            if (!data.downloadUrl) {
                throw new Error('No download URL returned from API');
            }
            
            setSelectedPlaybackSession({
                ...session,
                recordingUrl: data.downloadUrl
            });
        } catch (error: any) {
            console.error('[Playback] Error:', error);
            alert(`Playback Error: ${error.message}`);
        } finally {
            setFetchingRecording(null);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Active or Start Stream Section */}
            {activeSession ? (
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
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleShare}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl font-medium transition-all ${copied
                                        ? 'bg-green-50 text-green-600 border border-green-100'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                                    {copied ? 'Link Copied!' : 'Share Session'}
                                </button>
                                <button
                                    onClick={handleEndStream}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    End Session
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full">
                        <LiveViewer
                            roomUrl={activeSession.roomUrl}
                            token={isAdmin ? adminToken || undefined : undefined}
                            onLeave={isAdmin ? handleEndStream : undefined}
                            userName={user?.displayName || (isAdmin ? 'Admin' : 'Guest')}
                        />
                    </div>
                </div>
            ) : isAdmin ? (
                <LiveAdmin onStart={handleStartStream} onEnd={handleEndStream} />
            ) : (
                <div className="bg-gray-50 rounded-2xl p-12 py-24 text-center flex flex-col items-center justify-center border border-gray-100/50">
                    <div className="w-16 h-16 rounded-full bg-gray-200/50 flex items-center justify-center mb-6">
                        <Radio size={28} className="text-black/40" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-3">No Live Session</h3>
                    <p className="text-black/60 text-sm max-w-sm mx-auto leading-relaxed">
                        Check back during session times to watch live. Our sessions are streamed regularly.
                    </p>
                </div>
            )}

            {/* Past Sessions Section - Shown to everyone */}
            {pastSessions.length > 0 && (
                <div className="w-full max-w-4xl">
                    <h4 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                        <Radio size={20} className="text-red-600" />
                        Past Live Streams
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {pastSessions.map((session) => (
                            <div key={session.id} className="relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                {/* Admin Delete Button */}
                                {isAdmin && (
                                    <button
                                        onClick={() => setDeleteConfirmSession(session)}
                                        disabled={isDeleting === session.id}
                                        className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg hover:bg-red-600 transition-colors z-10"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}

                                <div className="aspect-video bg-gray-900 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20" />
                                    <Radio size={32} className="text-white/40 group-hover:scale-110 transition-transform" />
                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                        Ended
                                    </div>
                                </div>
                                <h5 className="font-bold text-sm text-gray-900 line-clamp-1">{session.title}</h5>
                                <p className="text-xs text-gray-500 mt-1">
                                    {session.endedAt ? new Date(
                                        typeof session.endedAt === 'string'
                                            ? session.endedAt
                                            : (session.endedAt as any).toDate?.() || session.endedAt
                                    ).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    }) : 'TBD'}
                                </p>

                                {session.recordingId && (
                                    <button
                                        onClick={() => handlePlayRecording(session)}
                                        disabled={fetchingRecording === session.id}
                                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                                    >
                                        {fetchingRecording === session.id ? (
                                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <PlayCircle size={14} />
                                        )}
                                        {fetchingRecording === session.id ? 'Loading...' : 'Watch Replay'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmSession && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDeleteConfirmSession(null)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Session</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete "{deleteConfirmSession.title}"? This action cannot be undone.
                            </p>
                            
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setDeleteConfirmSession(null)}
                                    disabled={!!isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteConfirmSession.id && handleDeleteSession(deleteConfirmSession.id)}
                                    disabled={!!isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Playback Modal */}
            {selectedPlaybackSession?.recordingUrl && (
                <VideoPlayer
                    url={selectedPlaybackSession.recordingUrl}
                    title={selectedPlaybackSession.title}
                    onClose={() => setSelectedPlaybackSession(null)}
                />
            )}
        </div>
    );
}
