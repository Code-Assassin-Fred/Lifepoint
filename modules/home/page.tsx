'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    Timestamp,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { Home, Radio, Video, Heart, Plus, Play, Clock, User, Trash2, Send, MessageSquare } from 'lucide-react';
import LivestreamDashboard from '@/modules/livestream/LivestreamDashboard';
import SessionUploadModal from '@/components/home/SessionUploadModal';
import InsightReels from './components/InsightReels';
import VideoPlayer from '@/components/media/VideoPlayer';

interface Session {
    id: string;
    title: string;
    speaker: string;
    date: Timestamp;
    videoUrl: string;
    thumbnailUrl?: string;
}

interface PrayerRequest {
    id: string;
    text: string;
    userId: string;
    userName: string;
    timestamp: Timestamp;
}

type Tab = 'livestream' | 'sessions' | 'prayer';

function HomeContent() {
    const { role } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'sessions');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [showReels, setShowReels] = useState(false);
    const [initialReelIndex, setInitialReelIndex] = useState(0);

    // Prayer Request State
    const [prayerText, setPrayerText] = useState('');
    const [submittingPrayer, setSubmittingPrayer] = useState(false);
    const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
    const [loadingPrayers, setLoadingPrayers] = useState(true);
    const [userRequests, setUserRequests] = useState<PrayerRequest[]>([]);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const { user } = useAuth();

    const isAdmin = role === 'admin';

    // Handle tab query parameter
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'livestream') {
            setActiveTab('livestream');
        } else if (tab === 'sessions') {
            setActiveTab('sessions');
        } else if (tab === 'prayer') {
            setActiveTab('prayer');
        }
    }, [searchParams]);

    // Fetch sessions (sermons) from API (Admin SDK)
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/sermons');
                if (!response.ok) throw new Error('Failed to fetch sermons');
                const sessionsData = await response.json();
                setSessions(sessionsData);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // Fetch prayer requests
    useEffect(() => {
        const fetchPrayers = async () => {
            try {
                // If admin, fetch all. If user, fetch only theirs.
                const url = isAdmin ? '/api/prayer-requests' : `/api/prayer-requests?userId=${user?.uid}`;
                if (!isAdmin && !user) return;

                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                
                const formattedData = data.map((req: any) => ({
                    ...req,
                    timestamp: req.timestamp ? {
                        toDate: () => new Date(req.timestamp.toDate ? req.timestamp : (req.timestamp._seconds ? req.timestamp._seconds * 1000 : req.timestamp))
                    } : null
                }));

                if (isAdmin) {
                    setPrayerRequests(formattedData);
                } else {
                    setUserRequests(formattedData);
                }
            } catch (error) {
                console.error("Error fetching prayer requests:", error);
            } finally {
                setLoadingPrayers(false);
            }
        };

        fetchPrayers();
        const interval = setInterval(fetchPrayers, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [isAdmin, user]);

    const handlePrayerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prayerText.trim() || !user) return;

        setSubmittingPrayer(true);
        try {
            const res = await fetch('/api/prayer-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: prayerText,
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                }),
            });

            if (!res.ok) throw new Error('Failed to submit');

            setPrayerText('');
            setSubmitStatus({ type: 'success', message: 'Your prayer request has been submitted.' });
            
            // If admin, refresh the list
            if (isAdmin) {
                const resFetch = await fetch('/api/prayer-requests');
                if (resFetch.ok) {
                    const data = await resFetch.json();
                    setPrayerRequests(data);
                }
            } else {
                // Refresh user's requests
                const resFetch = await fetch(`/api/prayer-requests?userId=${user?.uid}`);
                if (resFetch.ok) {
                    const data = await resFetch.json();
                    const formattedData = data.map((req: any) => ({
                        ...req,
                        timestamp: req.timestamp ? {
                            toDate: () => new Date(req.timestamp.toDate ? req.timestamp : (req.timestamp._seconds ? req.timestamp._seconds * 1000 : req.timestamp))
                        } : null
                    }));
                    setUserRequests(formattedData);
                }
            }
        } catch (error) {
            console.error('Error submitting prayer request:', error);
            setSubmitStatus({ type: 'error', message: 'Failed to submit prayer request. Please try again.' });
        } finally {
            setSubmittingPrayer(false);
            // Clear status after 5 seconds
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to delete this session?')) return;

        setDeleting(sessionId);
        try {
            const response = await fetch('/api/sermons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, action: 'delete' }),
            });

            if (!response.ok) throw new Error('Failed to delete session');
            
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('Failed to delete session');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp?.toDate) return '';
        return timestamp.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'livestream', label: 'Live Sessions', icon: Radio },
        { id: 'sessions', label: 'Recent Insights', icon: Video },
        { id: 'prayer', label: 'Prayer Room', icon: Heart },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            {/* Admin Actions */}
            {isAdmin && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                        <Plus size={16} />
                        Upload Session
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                router.push(`?tab=${tab.id}`, { scroll: false });
                            }}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${isActive
                                ? 'border-red-600 text-red-600'
                                : 'border-transparent text-black/60 hover:text-black'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div>
                {/* Livestream Tab */}
                {activeTab === 'livestream' && (
                    <LivestreamDashboard />
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                                <p className="mt-4 text-black/60">Loading sessions...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-12 py-24 text-center flex flex-col items-center justify-center border border-gray-100/50">
                                <div className="w-16 h-16 rounded-full bg-gray-200/50 flex items-center justify-center mb-6">
                                    <Video size={28} className="text-black/40" />
                                </div>
                                <h3 className="text-xl font-bold text-black mb-3">No Sessions Yet</h3>
                                <p className="text-black/60 text-sm max-w-sm mx-auto leading-relaxed">
                                    {isAdmin
                                        ? 'Upload your first session to get started.'
                                        : 'Check back soon for new insights.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video bg-gray-100">
                                            {session.thumbnailUrl ? (
                                                <img
                                                    src={session.thumbnailUrl}
                                                    alt={session.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full relative group">
                                                    {session.videoUrl.startsWith('http') && (
                                                        <video
                                                            src={session.videoUrl}
                                                            className="w-full h-full object-cover"
                                                            preload="metadata"
                                                            muted
                                                            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                                            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-all">
                                                        <Video size={32} className="text-white/80 group-hover:opacity-0 transition-opacity" />
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                onClick={() => {
                                                    setInitialReelIndex(sessions.indexOf(session));
                                                    setShowReels(true);
                                                }}
                                                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all cursor-pointer"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                    <Play size={20} className="text-red-600 ml-0.5" />
                                                </div>
                                            </div>

                                            {/* Admin Delete Button */}
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(session.id);
                                                    }}
                                                    disabled={deleting === session.id}
                                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg hover:bg-red-600 transition-colors z-20"
                                                >
                                                    {deleting === session.id ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h4 className="font-medium text-black text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                                                {session.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-black/60">
                                                <User size={12} />
                                                <span>{session.speaker}</span>
                                                <span className="text-black/30">•</span>
                                                <span>{formatDate(session.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Prayer Room Tab */}
                {activeTab === 'prayer' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* User Submission Form (Always show for non-admins or as a shared feature) */}
                        <div className="bg-zinc-50 rounded-2xl p-8 md:p-12 border border-zinc-200 shadow-sm">
                            <div className="max-w-2xl mx-auto flex flex-col items-center text-center">

                                <h3 className="text-2xl font-bold text-black mb-3">Prayer Room</h3>
                                <p className="text-black/70 text-sm mb-8 leading-relaxed">
                                    "For where two or three gather in my name, there am I with them." - Matthew 18:20
                                    <br />
                                    Share your requests and let Bishop Mike lift you up in prayer.
                                </p>

                                <form onSubmit={handlePrayerSubmit} className="w-full space-y-4">
                                    <textarea
                                        value={prayerText}
                                        onChange={(e) => setPrayerText(e.target.value)}
                                        placeholder="How can we pray for you today?"
                                        className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none text-sm bg-white"
                                        disabled={submittingPrayer}
                                    />
                                    
                                    {submitStatus && (
                                        <div className={`text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300 ${
                                            submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {submitStatus.message}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submittingPrayer || !prayerText.trim()}
                                        className="w-full md:w-auto px-8 py-3 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-all hover:scale-105 shadow-lg shadow-red-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {submittingPrayer ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Submit Prayer Request
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* User View: Their previous requests */}
                        {!isAdmin && user && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={20} className="text-black/60" />
                                    <h3 className="text-lg font-bold text-black">Your Previous Requests</h3>
                                </div>

                                {loadingPrayers ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                                    </div>
                                ) : userRequests.length === 0 ? (
                                    <p className="text-center text-black/40 py-8 italic border border-dashed border-gray-200 rounded-xl">You haven't submitted any prayer requests yet.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {userRequests.map((request) => (
                                            <div key={request.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] text-black/40">
                                                        {request.timestamp?.toDate ? request.timestamp.toDate().toLocaleString() : 'Just now'}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">

                                                        <span>Submitted</span>
                                                    </div>
                                                </div>
                                                <p className="text-black/70 text-sm leading-relaxed">
                                                    {request.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin View: List of Requests */}
                        {isAdmin && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare size={20} className="text-black/60" />
                                    <h3 className="text-lg font-bold text-black">All Prayer Requests</h3>
                                </div>

                                {loadingPrayers ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                                    </div>
                                ) : prayerRequests.length === 0 ? (
                                    <p className="text-center text-black/40 py-8 italic">No prayer requests yet.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {prayerRequests.map((request) => (
                                            <div key={request.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                                            <User size={16} className="text-red-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-black">{request.userName}</p>
                                                            <p className="text-[10px] text-black/40">
                                                                {request.timestamp?.toDate ? request.timestamp.toDate().toLocaleString() : 'Just now'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-black/70 text-sm leading-relaxed italic">
                                                    "{request.text}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <SessionUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />

            {/* Insight Reels View */}
            {showReels && (
                <InsightReels
                    sessions={sessions}
                    initialIndex={initialReelIndex}
                    onClose={() => setShowReels(false)}
                />
            )}

            {/* Video Player (Original - kept for other uses if any, but now reels is preferred for insights) */}
            {selectedSession && (
                <VideoPlayer
                    url={selectedSession.videoUrl}
                    title={selectedSession.title}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    );
}

export default function HomeModule() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
