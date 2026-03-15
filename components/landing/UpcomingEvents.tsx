'use client';

import React, { useState, useEffect } from 'react';
import { eventService, Event } from '@/lib/services/eventService';
import { format } from 'date-fns';

import Link from 'next/link';

const UpcomingEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getUpcomingEvents();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching landing page events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading || events.length === 0) {
        return null;
    }

    return (
        <section id="upcoming-events" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20 flex flex-col items-center text-center">
                    <h2 className="text-sm font-black text-zinc-900 uppercase tracking-[0.3em]">
                        Gatherings
                    </h2>
                    <div className="h-1 w-12 bg-[#0d9488] mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {events.map((event, index) => (
                        <Link
                            key={event.id}
                            href="/dashboard/user/workshops"
                            className="group p-10 bg-zinc-50 border border-zinc-100 rounded-md flex flex-col transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-[#0d9488]/10 hover:-translate-y-1"
                        >
                            <div className="mb-10">
                                <span className="block text-6xl font-black text-zinc-900 mb-2 group-hover:text-[#0d9488] transition-colors leading-none">
                                    {format(new Date(event.date), 'dd')}
                                </span>
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                    {format(new Date(event.date), 'MMMM')}
                                </span>
                            </div>

                            <div className="mt-auto">
                                <h3 className="font-black text-lg leading-tight mb-4 text-zinc-900 tracking-tight capitalize">
                                    {event.title}
                                </h3>
                                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0d9488] mb-4">
                                    Register Now
                                </div>
                                <div className="text-[10px] font-bold space-y-1 text-zinc-500 uppercase tracking-widest">
                                    <p>{event.time}</p>
                                    <p className="line-clamp-1">{event.location}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents;
