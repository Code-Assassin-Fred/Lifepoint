'use client';

import React, { useState, useEffect } from 'react';
import { eventService, Event } from '@/lib/services/eventService';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/context/AuthContext';

export default function UserEventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [regLoading, setRegLoading] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId: string) => {
        if (!user) {
            setStatusMessage({ text: 'Please log in to register for events', type: 'error' });
            return;
        }

        setRegLoading(eventId);
        setStatusMessage(null);
        try {
            await eventService.registerForEvent(eventId, {
                name: user.displayName || 'Anonymous User',
                email: user.email || ''
            });
            setStatusMessage({ text: 'Registration successful! See you there.', type: 'success' });
            fetchEvents(); // Refresh counts
            
            // Auto-clear success message after 5 seconds
            setTimeout(() => setStatusMessage(null), 5000);
        } catch (error: any) {
            setStatusMessage({ text: error.message || 'Registration failed', type: 'error' });
        } finally {
            setRegLoading(null);
        }
    };

    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-8 px-4">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-1">Events & Gatherings</h1>
                <p className="text-zinc-500 font-bold text-sm">Connect with the community and grow together.</p>
            </div>

            {/* Status Message */}
            {statusMessage && (
                <div className={`flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 pb-2 border-b border-zinc-100 ${
                    statusMessage.type === 'success' 
                    ? 'text-[#0d9488]' 
                    : 'text-red-500'
                }`}>
                    <p className="font-black text-[10px] uppercase tracking-[0.2em]">{statusMessage.text}</p>
                    <button onClick={() => setStatusMessage(null)} className="text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 transition-all">Dismiss</button>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-md border border-zinc-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-[#0d9488]/10 border-t-[#0d9488] rounded-full animate-spin mb-4" />
                    <p className="font-bold text-zinc-400 text-xs uppercase tracking-widest">Gathering events...</p>
                </div>
            ) : (
                <div className="space-y-20">
                    {/* Upcoming Events Table */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em]">Upcoming</h2>
                                <div className="h-px w-24 bg-zinc-100"></div>
                            </div>
                            <span className="px-4 py-1 bg-[#0d9488] text-white rounded-md text-[10px] font-black uppercase tracking-widest">{upcomingEvents.length} Gatherings</span>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="bg-white rounded-md border border-zinc-100 p-24 text-center border-dashed border-2">
                                <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest text-center mx-auto">No upcoming events currently scheduled.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-md border border-zinc-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-100">
                                            <th className="py-5 px-8 text-[10px] font-black text-zinc-900 uppercase tracking-widest">Date</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-zinc-900 uppercase tracking-widest">Event</th>
                                            <th className="py-5 px-8 text-[10px] font-black text-zinc-900 uppercase tracking-widest">Location</th>
                                            <th className="py-5 px-8 text-right text-[10px] font-black text-zinc-900 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {upcomingEvents.map(event => (
                                            <tr key={event.id} className="group hover:bg-[#0d9488]/[0.02] transition-colors">
                                                <td className="py-6 px-8">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-black text-black">{format(new Date(event.date), 'dd')}</span>
                                                        <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest">{format(new Date(event.date), 'MMMM')}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-widest">{format(new Date(event.date), 'EEEE')}</p>
                                                </td>
                                                <td className="py-6 px-8 max-w-md">
                                                    <h4 className="text-lg font-black text-zinc-900 mb-1 leading-tight group-hover:text-[#0d9488] transition-colors">{event.title}</h4>
                                                    <p className="text-xs font-bold text-zinc-600 line-clamp-1">{event.description}</p>
                                                </td>
                                                <td className="py-6 px-8">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-zinc-900 uppercase tracking-tight">{event.location}</p>
                                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{event.time}</p>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <button
                                                        onClick={() => handleRegister(event.id)}
                                                        disabled={regLoading === event.id}
                                                        className="min-w-[100px] px-6 py-2.5 bg-zinc-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all shadow-lg shadow-zinc-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ml-auto"
                                                    >
                                                        {regLoading === event.id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : 'Register'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Past Events Table */}
                    {pastEvents.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-8 opacity-80">
                                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em]">Past Gatherings</h2>
                                <div className="h-px flex-1 bg-zinc-200"></div>
                            </div>

                            <div className="bg-white rounded-md border border-zinc-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <tbody className="divide-y divide-zinc-50">
                                        {pastEvents.map(event => (
                                            <tr key={event.id} className="group hover:bg-zinc-50 transition-colors">
                                                <td className="py-5 px-8 w-48">
                                                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">
                                                        {format(new Date(event.date), 'MMMM dd, yyyy')}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <h4 className="font-extrabold text-zinc-900 text-sm">{event.title}</h4>
                                                </td>
                                                <td className="py-5 px-8">
                                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{event.location}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
