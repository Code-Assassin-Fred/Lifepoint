'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';
import { Church, Radio, Video, Heart, Plus, Play, Clock, User, Trash2 } from 'lucide-react';
import SermonUploadModal from '@/components/church/SermonUploadModal';

interface Sermon {
    id: string;
    title: string;
    speaker: string;
    date: Timestamp;
    videoUrl: string;
    thumbnailUrl?: string;
}

type Tab = 'livestream' | 'sermons' | 'prayer';

export default function ChurchModule() {
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('sermons');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [sermons, setSermons] = useState<Sermon[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const isAdmin = role === 'admin';

    // Fetch sermons from Firestore
    useEffect(() => {
        const q = query(collection(db, 'sermons'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const sermonsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Sermon[];
                setSermons(sermonsData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching sermons:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleDeleteSermon = async (sermonId: string) => {
        if (!confirm('Are you sure you want to delete this sermon?')) return;

        setDeleting(sermonId);
        try {
            await deleteDoc(doc(db, 'sermons', sermonId));
        } catch (error) {
            console.error('Error deleting sermon:', error);
            alert('Failed to delete sermon');
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
        { id: 'livestream', label: 'Livestream', icon: Radio },
        { id: 'sermons', label: 'Past Sermons', icon: Video },
        { id: 'prayer', label: 'Prayer Room', icon: Heart },
    ];

    return (
        <div className="max-w-5xl">
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Church size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-black">Church</h2>
                        <p className="text-sm text-black/60">Livestreams, sermons, and prayer room</p>
                    </div>
                </div>

                {/* Admin Upload Button */}
                {isAdmin && (
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                        <Plus size={16} />
                        Upload Sermon
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
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
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                            <Radio size={24} className="text-black/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">No Live Service</h3>
                        <p className="text-black/60 text-sm max-w-md mx-auto">
                            Check back during service times to watch live. Our services are streamed every Sunday at 10:00 AM.
                        </p>
                    </div>
                )}

                {/* Sermons Tab */}
                {activeTab === 'sermons' && (
                    <>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                                <p className="mt-4 text-black/60">Loading sermons...</p>
                            </div>
                        ) : sermons.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                                    <Video size={24} className="text-black/40" />
                                </div>
                                <h3 className="text-lg font-semibold text-black mb-2">No Sermons Yet</h3>
                                <p className="text-black/60 text-sm max-w-md mx-auto">
                                    {isAdmin
                                        ? 'Upload your first sermon to get started.'
                                        : 'Check back soon for new sermons.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {sermons.map((sermon) => (
                                    <div
                                        key={sermon.id}
                                        className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video bg-gray-100">
                                            {sermon.thumbnailUrl ? (
                                                <img
                                                    src={sermon.thumbnailUrl}
                                                    alt={sermon.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
                                                    <Video size={40} className="text-red-300" />
                                                </div>
                                            )}
                                            <a
                                                href={sermon.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                    <Play size={20} className="text-red-600 ml-0.5" />
                                                </div>
                                            </a>

                                            {/* Admin Delete Button */}
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSermon(sermon.id);
                                                    }}
                                                    disabled={deleting === sermon.id}
                                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    {deleting === sermon.id ? (
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
                                                {sermon.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-black/60">
                                                <User size={12} />
                                                <span>{sermon.speaker}</span>
                                                <span className="text-black/30">•</span>
                                                <span>{formatDate(sermon.date)}</span>
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
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Heart size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-black mb-2">Prayer Room</h3>
                        <p className="text-black/70 text-sm max-w-md mx-auto mb-6">
                            Join our community in prayer. Share your prayer requests and lift up others.
                        </p>
                        <button className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-xl font-medium hover:bg-red-700 transition-colors">
                            Enter Prayer Room
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <SermonUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
}
