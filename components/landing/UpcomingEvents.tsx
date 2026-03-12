'use client';

import React, { useState, useEffect } from 'react';
import { eventService, Event } from '@/lib/services/eventService';
import { format } from 'date-fns';

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
        return null; // Hide the section if loading or no events
    }

    return (
        <section id="upcoming-events" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12 flex flex-col items-center text-center">
                    <h2 className="text-sm font-black text-[#1e2a5a] uppercase tracking-[0.2em]">
                        Upcoming Events
                    </h2>
                    <div className="h-1 w-12 bg-blue-600 mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className={`p-10 rounded-lg flex flex-col transition-all duration-300 ${index === 0
                                ? 'bg-[#4b6fff] text-white shadow-xl shadow-blue-200 translate-y-[-4px]'
                                : 'bg-[#f4f5f9] text-[#1e2a5a] hover:bg-[#ebedf5]'
                                }`}
                        >
                            <div className="mb-8">
                                <span className="block text-5xl font-light mb-1">
                                    {format(new Date(event.date), 'dd')}
                                </span>
                                <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                                    {format(new Date(event.date), 'MMMM')}
                                </span>
                            </div>

                            <div className="mt-auto">
                                <h3 className="font-bold text-lg leading-tight mb-4">
                                    {event.title}
                                </h3>
                                <div className={`text-xs font-semibold space-y-1 ${index === 0 ? 'text-white/80' : 'text-gray-500'}`}>
                                    <p>{event.time}</p>
                                    <p className="line-clamp-1">{event.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents;
