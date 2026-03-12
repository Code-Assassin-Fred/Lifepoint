'use client';

import React, { useState, useEffect } from 'react';
import { eventService, Event } from '@/lib/services/eventService';
import { Calendar, MapPin, Clock, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function UserEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

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

    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="px-1">
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Events & Gatherings</h1>
                <p className="text-zinc-500 font-medium text-lg">Connect with the community and grow together.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border border-zinc-100/50">
                    <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                    <p className="font-bold text-zinc-400">Gathering events...</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Upcoming Events Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                    <Calendar size={22} />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Upcoming</h2>
                            </div>
                            <span className="px-4 py-1.5 bg-zinc-900 text-white rounded-full text-[11px] font-black">{upcomingEvents.length} Events</span>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                    <Calendar size={32} />
                                </div>
                                <p className="text-zinc-400 font-bold text-lg">No upcoming events at the moment. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {upcomingEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Past Events Section */}
                    {pastEvents.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-8 px-2 opacity-50">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-200 text-zinc-600 flex items-center justify-center">
                                    <Calendar size={22} />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Gatherings We Missed</h2>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-60">
                                {pastEvents.map(event => (
                                    <div key={event.id} className="bg-zinc-50 border border-zinc-100 p-5 rounded-[1.5rem] flex flex-col justify-between h-full group hover:bg-white hover:shadow-md transition-all">
                                        <div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{format(new Date(event.date), 'PPPP')}</span>
                                            <h4 className="font-extrabold text-zinc-900 mt-2 line-clamp-2">{event.title}</h4>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-zinc-500">{event.location}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}

function EventCard({ event }: { event: Event }) {
    return (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-zinc-100/50 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 flex flex-col group">
            <div className="relative h-48 bg-zinc-100 overflow-hidden">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
                        <Calendar className="text-zinc-200" size={64} />
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-blue-600 shadow-sm">
                    {format(new Date(event.date), 'EEEE')}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Confirmed Event</span>
                </div>

                <h3 className="text-xl font-black text-zinc-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                <p className="text-zinc-500 text-sm font-medium line-clamp-3 mb-6 flex-1">{event.description}</p>

                <div className="space-y-3 pt-6 border-t border-zinc-50">
                    <div className="flex items-center gap-3 text-zinc-900">
                        <div className="p-2 bg-zinc-50 rounded-lg"><Clock size={16} /></div>
                        <span className="text-xs font-bold">{format(new Date(event.date), 'MMMM dd, yyyy')} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-900">
                        <div className="p-2 bg-zinc-50 rounded-lg"><MapPin size={16} /></div>
                        <span className="text-xs font-bold line-clamp-1">{event.location}</span>
                    </div>
                </div>

                <button className="w-full mt-8 py-4 bg-zinc-50 text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                    Register Now <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
