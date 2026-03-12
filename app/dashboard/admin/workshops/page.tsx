'use client';

import React, { useState, useEffect } from 'react';
import { eventService, Event } from '@/lib/services/eventService';
import { Calendar, MapPin, Clock, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: ''
    });

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await eventService.createEvent(formData);
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                imageUrl: ''
            });
            fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await eventService.deleteEvent(id);
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-12">
            <div className="space-y-2">
                <h1 className="text-3xl font-light text-rose-500 tracking-[0.1em] uppercase">Events Management</h1>
                <p className="text-zinc-400 font-medium tracking-wide">Upload and manage church events</p>
            </div>

            {/* Upload Form - Now at the Top and Centered */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-zinc-100 shadow-blue-500/5">
                    <h2 className="text-2xl font-black mb-8 flex items-center justify-center gap-3 text-blue-600">
                        Create New Event
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5 ml-1 tracking-wider">Title</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                placeholder="Event Title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5 ml-1 tracking-wider">Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none font-medium"
                                placeholder="Short description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5 ml-1 tracking-wider">Date</label>
                                <input
                                    required
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5 ml-1 tracking-wider">Time</label>
                                <input
                                    required
                                    type="text"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                    placeholder="e.g. 7:00 PM"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5 ml-1 tracking-wider">Location</label>
                            <input
                                required
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                placeholder="Event Location"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5 ml-1 tracking-wider">Image URL (Optional)</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                            Create Event
                        </button>
                    </form>
                </div>
            </div>

            {/* Event Lists - Table Layout */}
            <div className="">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-zinc-100 text-zinc-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="font-medium">Loading events...</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Upcoming Events Table */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-xl font-bold text-blue-600 tracking-wide">Upcoming Events</h3>
                                <div className="h-px flex-1 bg-blue-100/50"></div>
                            </div>
                            {upcomingEvents.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 font-medium border-2 border-dashed border-zinc-100 rounded-3xl">
                                    No upcoming events.
                                </div>
                            ) : (
                                <div className="min-w-0 overflow-hidden">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="py-3 pr-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Date</th>
                                                <th className="py-3 pr-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Title</th>
                                                <th className="py-3 pr-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Location</th>
                                                <th className="py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {upcomingEvents.map(event => (
                                                <EventRow key={event.id} event={event} onDelete={handleDelete} isPast={false} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* Past Events Table */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 opacity-60">
                                <h3 className="text-xl font-bold text-red-600 tracking-wide">Past Events</h3>
                                <div className="h-px flex-1 bg-red-100/50"></div>
                            </div>
                            {pastEvents.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 font-medium border-2 border-dashed border-zinc-100 rounded-3xl opacity-50">
                                    No past events.
                                </div>
                            ) : (
                                <div className="min-w-0 overflow-hidden opacity-80">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="py-3 pr-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Date</th>
                                                <th className="py-3 pr-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Title</th>
                                                <th className="py-3 pr-4 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Location</th>
                                                <th className="py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {pastEvents.map(event => (
                                                <EventRow key={event.id} event={event} onDelete={handleDelete} isPast={true} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

function EventRow({ event, onDelete, isPast }: { event: Event, onDelete: (id: string) => void, isPast: boolean }) {
    return (
        <tr className="group hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-baseline gap-1.5 min-w-[60px]">
                    <span className={`text-base font-black ${isPast ? 'text-zinc-400' : 'text-zinc-900'}`}>{format(new Date(event.date), 'dd')}</span>
                    <span className="text-[10px] font-bold uppercase text-zinc-400">{format(new Date(event.date), 'MMM')}</span>
                </div>
            </td>
            <td className="py-4 pr-4 min-w-[120px]">
                <div className={`font-bold ${isPast ? 'text-zinc-500' : 'text-zinc-900'} truncate group-hover:text-zinc-800 transition-colors`} title={event.title}>
                    {event.title}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">{event.time}</div>
            </td>
            <td className="py-4 pr-4 min-w-[100px]">
                <div className="text-xs font-medium text-zinc-500 truncate" title={event.location}>
                    {event.location}
                </div>
            </td>
            <td className="py-4 text-right whitespace-nowrap">
                <button
                    onClick={() => onDelete(event.id)}
                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete event"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}
