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
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Events Management</h1>
                    <p className="text-zinc-500 font-medium">Upload and manage church events</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100/50 sticky top-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" />
                            Create New Event
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Event Title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Description</label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    placeholder="Short description..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Time</label>
                                    <input
                                        required
                                        type="text"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="e.g. 7:00 PM"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Location</label>
                                <input
                                    required
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Event Location"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-xs"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-lg hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                Create Event
                            </button>
                        </form>
                    </div>
                </div>

                {/* Event Lists */}
                <div className="lg:col-span-2 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-zinc-100 text-zinc-400">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="font-medium">Loading events...</p>
                        </div>
                    ) : (
                        <>
                            {/* Upcoming Events */}
                            <section>
                                <h3 className="text-xl font-extrabold text-zinc-900 mb-4 ml-2">Upcoming Events</h3>
                                {upcomingEvents.length === 0 ? (
                                    <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-10 text-center text-zinc-400">
                                        No upcoming events scheduled.
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {upcomingEvents.map(event => (
                                            <EventItem key={event.id} event={event} onDelete={handleDelete} isPast={false} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Past Events */}
                            <section>
                                <h3 className="text-xl font-extrabold text-zinc-900 mb-4 ml-2 opacity-50">Past Events</h3>
                                {pastEvents.length === 0 ? (
                                    <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-10 text-center text-zinc-400 opacity-50">
                                        No past events.
                                    </div>
                                ) : (
                                    <div className="grid gap-4 opacity-75">
                                        {pastEvents.map(event => (
                                            <EventItem key={event.id} event={event} onDelete={handleDelete} isPast={true} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function EventItem({ event, onDelete, isPast }: { event: Event, onDelete: (id: string) => void, isPast: boolean }) {
    return (
        <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-zinc-100/50 flex flex-col md:flex-row gap-5 items-start md:items-center hover:shadow-md transition-shadow group">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${isPast ? 'bg-zinc-100 text-zinc-400' : 'bg-blue-50 text-blue-600'}`}>
                <span className="text-lg font-black leading-none">{format(new Date(event.date), 'dd')}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{format(new Date(event.date), 'MMM')}</span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-zinc-900 mb-1 truncate">{event.title}</h4>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-zinc-400" /> {event.time}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-zinc-400" /> {event.location}</span>
                </div>
            </div>

            <button
                onClick={() => onDelete(event.id)}
                className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
