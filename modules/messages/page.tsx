'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { Send, User as UserIcon, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';

interface MessagesModuleProps {
    isAdmin: boolean;
}

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: any;
    read?: boolean;
    threadId?: string;
}

interface ThreadUser {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role?: string;
}

export default function MessagesModule({ isAdmin }: MessagesModuleProps) {
    const { user } = useAuth();
    const [threads, setThreads] = useState<ThreadUser[]>([]);
    const [activeUser, setActiveUser] = useState<ThreadUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const openUserId = searchParams.get('open');

    const fetchThreads = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/messages/threads?role=${isAdmin ? 'admin' : 'user'}`);
            if (res.ok) {
                const data = await res.json();
                setThreads(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch message threads:', error);
        } finally {
            setLoading(false);
        }
    };

    // Deep link to specific chat from notification
    useEffect(() => {
        if (openUserId && threads.length > 0) {
            const userToOpen = threads.find(t => t.id === openUserId);
            if (userToOpen && (!activeUser || activeUser.id !== openUserId)) {
                setActiveUser(userToOpen);
            }
        }
    }, [openUserId, threads]);

    // Fetch available threads (admins see all users, users see admins)
    useEffect(() => {
        fetchThreads();
    }, [user, isAdmin]);

    // Fetch messages when a thread is selected
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchMessages = async () => {
            if (!user || !activeUser) return;
            try {
                const res = await fetch(`/api/messages?otherUserId=${activeUser.id}&userId=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                    scrollToBottom();

                    // Mark as read in background if there's any unread addressed to current user
                    if (data.messages && data.messages.length > 0) {
                        const hasUnread = data.messages.some((m: any) => m.receiverId === user.uid && !m.read);
                        if (hasUnread && data.messages[0].threadId) {
                            fetch('/api/messages', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    threadId: data.messages[0].threadId,
                                    receiverId: user.uid
                                })
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        if (activeUser) {
            fetchMessages();
            // Simple polling for new messages every 5 seconds
            intervalId = setInterval(fetchMessages, 5000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user, activeUser]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeUser || !newMessage.trim() || sending) return;

        setSending(true);
        const content = newMessage;
        setNewMessage(''); // optimistic clear

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.uid,
                    receiverId: activeUser.id,
                    content
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            } else {
                // Restore if failed
                setNewMessage(content);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(content);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Messages</h2>
                <p className="text-zinc-500 font-bold">Connect and communicate within the community.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 h-[70vh]">
                {/* Threads List (Only show on mobile if no active user selected) */}
                <div className={`lg:block bg-zinc-50 rounded-[3rem] p-6 border border-zinc-100 ${activeUser ? 'hidden' : 'block'}`}>
                    <div className="flex items-center justify-between mb-6 px-4">
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Conversations</h3>
                        <button onClick={fetchThreads} className="text-zinc-500 hover:text-zinc-900 transition-colors">
                            <ArrowLeft size={16} className="rotate-180" />
                        </button>
                    </div>
                    
                    {threads.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <MessageSquare className="mx-auto text-zinc-300 mb-4" size={32} />
                            <p className="text-zinc-500 text-sm font-medium">No contacts available.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 overflow-y-auto h-[calc(100%-4rem)] pr-2 custom-scrollbar">
                            {threads.map(targetUser => (
                                <button
                                    key={targetUser.id}
                                    onClick={() => setActiveUser(targetUser)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left ${
                                        activeUser?.id === targetUser.id 
                                            ? 'bg-zinc-900 text-white shadow-xl shadow-black/10' 
                                            : 'hover:bg-white hover:shadow-md'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                                        activeUser?.id === targetUser.id ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-200 bg-zinc-100 text-zinc-400'
                                    }`}>
                                        {targetUser.photoURL ? (
                                            <img src={targetUser.photoURL} alt={targetUser.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold truncate ${activeUser?.id === targetUser.id ? 'text-white' : 'text-zinc-900'}`}>{targetUser.displayName}</p>
                                        <p className={`text-xs truncate ${activeUser?.id === targetUser.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{targetUser.role || (isAdmin ? 'User' : 'Admin')}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className={`lg:col-span-2 bg-white rounded-[3rem] border border-zinc-200 flex flex-col overflow-hidden relative ${!activeUser ? 'hidden lg:flex' : 'flex'}`}>
                    {activeUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-zinc-100 flex items-center gap-4 bg-white/80 backdrop-blur-md z-10 sticky top-0">
                                <button 
                                    onClick={() => setActiveUser(null)}
                                    className="lg:hidden w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-12 h-12 rounded-full border-2 border-zinc-200 bg-zinc-100 flex items-center justify-center overflow-hidden">
                                    {activeUser.photoURL ? (
                                        <img src={activeUser.photoURL} alt={activeUser.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={20} className="text-zinc-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-zinc-900">{activeUser.displayName}</h3>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{activeUser.role || (isAdmin ? 'User' : 'Admin')}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-2">
                                            <MessageSquare size={24} />
                                        </div>
                                        <p className="font-bold text-lg text-zinc-600">No messages yet</p>
                                        <p className="text-sm">Start the conversation with {activeUser.displayName}!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.senderId === user?.uid;
                                        return (
                                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] rounded-3xl px-6 py-4 ${
                                                    isMe 
                                                        ? 'bg-zinc-900 text-white rounded-tr-sm' 
                                                        : 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-sm shadow-sm'
                                                }`}>
                                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 bg-white border-t border-zinc-100">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#ccf381] focus:border-transparent font-medium"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="w-14 h-14 bg-[#ccf381] text-black rounded-full flex items-center justify-center hover:bg-[#b8dd74] transition-all disabled:opacity-50 disabled:hover:bg-[#ccf381]"
                                    >
                                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-6">
                            <div className="w-24 h-24 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center">
                                <MessageSquare size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">Select a conversation</h3>
                                <p className="text-zinc-500 font-medium">Choose a thread from the list to start messaging.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
