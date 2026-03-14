'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import CommunitySidebar from '@/components/community/CommunitySidebar';
import MessageView from '@/components/community/MessageView';
import AnnouncementComposer from '@/components/community/AnnouncementComposer';
import { Loader2 } from 'lucide-react';

export default function CommunityModule() {
    const { user, role } = useAuth();
    const isAdmin = role === 'admin';
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/community/announcements');
            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handlePost = async (data: { title: string; content: string; imageUrl?: string }) => {
        try {
            const response = await fetch('/api/community/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    authorName: user?.displayName || 'Lifepoint Admin',
                    authorRole: 'Official Channel'
                }),
            });

            if (response.ok) {
                fetchAnnouncements();
            }
        } catch (error) {
            console.error('Failed to post announcement:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        
        try {
            const response = await fetch(`/api/community/announcements?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAnnouncements(prev => prev.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete announcement:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-teal-600" size={40} />
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] bg-white -mx-6 -mb-6 lg:-mx-8 lg:-mb-8 overflow-hidden relative border-t border-slate-200">
            {/* Left Sidebar */}
            <div className={`${activeTab !== 'announcements' ? 'flex' : 'hidden'} md:flex shrink-0`}>
                 <CommunitySidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile Header (Back to sidebar) */}
                <div className="md:hidden p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className="text-teal-600 font-bold text-sm uppercase tracking-widest"
                    >
                        ← Community Menu
                    </button>
                    <span className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{activeTab}</span>
                </div>

                {/* Tab Content */}
                {activeTab === 'announcements' ? (
                    <>
                        <MessageView 
                            announcements={announcements} 
                            isAdmin={isAdmin} 
                            onDelete={handleDelete}
                        />
                        {isAdmin && <AnnouncementComposer onPost={handlePost} />}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-md">
                             <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">
                                {activeTab.replace('-', ' ')}
                             </h3>
                             <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                This section is currently under development as we enhance our community experience.
                             </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
