'use client';

import React from 'react';

const EVENTS = [
    {
        id: 1,
        day: '08',
        month: 'JUNE',
        title: 'Paris Start-up Innovation Summit',
        time: '7:30PM — 10PM',
        location: '@ Algolia Paris - Bridge (200)',
        active: true,
    },
    {
        id: 2,
        day: '20',
        month: 'JUNE',
        title: 'Masterclass J. Lemkin',
        time: '7:30PM — 10PM',
        location: '@ Algolia Paris - Bridge (200)',
        active: false,
    },
    {
        id: 3,
        day: '26',
        month: 'JUNE',
        title: '"Libérons nos RH", with Pauline Bergeret',
        time: '8AM — 5PM',
        location: '@ 16 Rue de Charonne, 75012 Paris',
        active: false,
    },
    {
        id: 4,
        day: '27',
        month: 'JUNE',
        title: 'TechLunch - Design Horror Stories',
        time: '12AM — 2PM',
        location: '@ Algolia Paris - Bridge (200)',
        active: false,
    },
];

const UpcomingEvents = () => {
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
                    {EVENTS.map((event) => (
                        <div
                            key={event.id}
                            className={`p-10 rounded-lg flex flex-col transition-all duration-300 ${event.active
                                ? 'bg-[#4b6fff] text-white shadow-xl shadow-blue-200 translate-y-[-4px]'
                                : 'bg-[#f4f5f9] text-[#1e2a5a] hover:bg-[#ebedf5]'
                                }`}
                        >
                            <div className="mb-8">
                                <span className="block text-5xl font-light mb-1">{event.day}</span>
                                <span className="text-xs font-bold tracking-widest uppercase opacity-70">
                                    {event.month}
                                </span>
                            </div>

                            <div className="mt-auto">
                                <h3 className="font-bold text-lg leading-tight mb-4">
                                    {event.title}
                                </h3>
                                <div className={`text-xs font-semibold space-y-1 ${event.active ? 'text-white/80' : 'text-gray-500'}`}>
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
