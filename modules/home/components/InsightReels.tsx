'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, User, ChevronUp, ChevronDown, Play, Pause, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/context/AuthContext';

interface Session {
    id: string;
    title: string;
    speaker: string;
    date: Timestamp;
    videoUrl: string;
    thumbnailUrl?: string;
}

interface Comment {
    id: string;
    text: string;
    userName: string;
    userId: string;
    createdAt: any; // Can be Timestamp or JSON-serialized timestamp
}

interface InsightReelsProps {
    sessions: Session[];
    initialIndex?: number;
    onClose?: () => void;
}

export default function InsightReels({ sessions, initialIndex = 0, onClose }: InsightReelsProps) {
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
    const [likeCount, setLikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentSession = sessions[currentIndex];

    const fetchLikes = async () => {
        if (!currentSession) return;
        try {
            const response = await fetch(`/api/insights/likes?sermonId=${currentSession.id}${user ? `&userId=${user.uid}` : ''}`);
            if (response.ok) {
                const data = await response.json();
                setLikeCount(data.likeCount);
                setHasLiked(data.hasLiked);
            }
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    };

    const fetchSignedUrl = async () => {
        if (!currentSession) return;
        setSignedVideoUrl(null);
        try {
            const response = await fetch('/api/media/signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: currentSession.videoUrl }),
            });
            if (response.ok) {
                const { signedUrl } = await response.json();
                setSignedVideoUrl(signedUrl);
            }
        } catch (error) {
            console.error('Error fetching signed URL:', error);
        }
    };

    const fetchComments = async () => {
        if (!currentSession) return;
        setLoadingComments(true);
        try {
            const response = await fetch(`/api/insights/comments?sermonId=${currentSession.id}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        fetchComments();
        fetchLikes();
        fetchSignedUrl();
    }, [currentSession, user]);

    const handleNext = () => {
        if (currentIndex < sessions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsPlaying(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsPlaying(true);
        }
    };

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleToggleLike = async () => {
        if (!user || !currentSession) return;

        const action = hasLiked ? 'unlike' : 'like';
        const previousLiked = hasLiked;
        const previousCount = likeCount;

        // Optimistic update
        setHasLiked(!previousLiked);
        setLikeCount(prev => action === 'like' ? prev + 1 : prev - 1);

        try {
            const response = await fetch('/api/insights/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sermonId: currentSession.id,
                    userId: user.uid,
                    action
                })
            });

            if (!response.ok) throw new Error('Failed to toggle like');
        } catch (error) {
            console.error('Error toggling like:', error);
            // Rollback on error
            setHasLiked(previousLiked);
            setLikeCount(previousCount);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !currentSession) return;

        try {
            const response = await fetch('/api/insights/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sermonId: currentSession.id,
                    text: newComment,
                    userName: user.displayName || 'Anonymous',
                    userId: user.uid
                })
            });

            if (response.ok) {
                setNewComment('');
                fetchComments(); // Refresh comments list
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (!currentSession) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row items-center justify-center overflow-hidden">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
            >
                <X size={24} />
            </button>

            {/* Main Video Area */}
            <div className="relative h-full w-full max-w-[450px] bg-gray-900 shadow-2xl overflow-hidden flex items-center justify-center">
                {!signedVideoUrl ? (
                    <div className="flex flex-col items-center gap-4 text-white/40">
                        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="text-xs font-medium">Loading video...</span>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        src={signedVideoUrl}
                        className="h-full w-full object-cover"
                        loop
                        autoPlay
                        playsInline
                        onClick={handleTogglePlay}
                    />
                )}

                {/* Play/Pause Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center animate-ping">
                            <Play size={40} className="text-white ml-2" />
                        </div>
                    </div>
                )}

                {/* Bottom Overlay Information */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center border-2 border-white">
                            <User size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">@{currentSession.speaker.replace(/\s+/g, '').toLowerCase()}</span>
                            <span className="text-white/60 text-xs">{currentSession.speaker}</span>
                        </div>
                    </div>
                    <h3 className="text-white font-medium mb-4 leading-relaxed">{currentSession.title}</h3>
                </div>

                {/* Right Side Actions */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
                    <button
                        onClick={handleToggleLike}
                        className="group flex flex-col items-center gap-1"
                    >
                        <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${hasLiked
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 hover:bg-red-500/20 text-white'
                            }`}>
                            <Heart size={24} className={hasLiked ? 'fill-current' : 'group-hover:fill-red-500 group-hover:text-red-500'} />
                        </div>
                        <span className="text-white text-xs font-medium">
                            {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="group flex flex-col items-center gap-1"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-blue-500/20 backdrop-blur-md flex items-center justify-center text-white transition-all">
                            <MessageCircle size={24} className="group-hover:text-blue-400" />
                        </div>
                        <span className="text-white text-xs font-medium">{comments.length}</span>
                    </button>

                    <button className="group flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-green-500/20 backdrop-blur-md flex items-center justify-center text-white transition-all">
                            <Share2 size={24} className="group-hover:text-green-400" />
                        </div>
                        <span className="text-white text-xs font-medium">Share</span>
                    </button>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 backdrop-blur-md"
                    >
                        <ChevronUp size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === sessions.length - 1}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 backdrop-blur-md"
                    >
                        <ChevronDown size={24} />
                    </button>
                </div>
            </div>

            {/* Desktop Comments Sidebar / Mobile Overlay */}
            {(showComments || window.innerWidth > 768) && (
                <div className={`
                    absolute md:relative bottom-0 left-0 right-0 h-[60%] md:h-full md:w-[400px] 
                    bg-white md:bg-gray-50 flex flex-col transition-all duration-300 transform
                    ${showComments ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                    rounded-t-3xl md:rounded-none shadow-2xl z-[120] md:z-0
                `}>
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">Comments ({comments.length})</h4>
                        <button
                            onClick={() => setShowComments(false)}
                            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {comments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center py-12">
                                <MessageCircle size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">No comments yet.<br />Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900">{comment.userName}</span>
                                            <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddComment} className="p-6 border-t border-gray-200 bg-white shadow-lg">
                        <div className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-100"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
