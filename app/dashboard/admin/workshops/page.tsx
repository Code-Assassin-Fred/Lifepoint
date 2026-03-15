'use client';

import React, { useState, useEffect } from 'react';
import { eventService, Event, EventRegistration } from '@/lib/services/eventService';
import { Calendar, MapPin, Clock, Plus, Trash2, Loader2, Image as ImageIcon, Users, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedEventRegs, setSelectedEventRegs] = useState<{id: string, title: string, regs: EventRegistration[]} | null>(null);
    const [loadingRegs, setLoadingRegs] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: ''
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

    const handleViewRegistrations = async (event: Event) => {
        setLoadingRegs(true);
        try {
            const regs = await eventService.getEventRegistrations(event.id);
            setSelectedEventRegs({ id: event.id, title: event.title, regs });
            // Scroll to registrations area
            window.scrollTo({ top: document.getElementById('registrations-view')?.offsetTop || 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error fetching registrations:', error);
            alert('Failed to load registrations');
        } finally {
            setLoadingRegs(false);
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
                location: ''
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
        <div className="max-w-5xl mx-auto p-8 space-y-12 relative">
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Events Management</h1>
                <p className="text-zinc-500 font-bold text-sm">Upload and manage church events</p>
            </div>

            {/* Upload Form - Integrated into Page */}
            <div className="w-full">
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black text-zinc-900 uppercase tracking-[0.2em]">
                            Create New Event
                        </h2>
                        <div className="h-px flex-1 bg-zinc-100"></div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Title</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-bold text-sm"
                                placeholder="Event Title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all resize-none font-bold text-sm"
                                placeholder="Short description..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Date</label>
                                <input
                                    required
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-black text-sm text-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Time</label>
                                <input
                                    required
                                    type="text"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-bold text-sm"
                                    placeholder="e.g. 7:00 PM"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Location</label>
                            <input
                                required
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-bold text-sm"
                                placeholder="Event Location"
                            />
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-3.5 bg-[#0d9488] text-white rounded-md font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0d9488]/20 hover:bg-[#0d9488]/90 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'CREATE EVENT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Registrations View - Inline */}
            <div id="registrations-view" className="space-y-8 scroll-mt-10">
                {selectedEventRegs ? (
                    <div className="bg-white rounded-md border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                        <div className="p-8 border-b border-zinc-50 bg-zinc-50 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <button 
                                        onClick={() => setSelectedEventRegs(null)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] hover:translate-x-[-4px] transition-transform flex items-center gap-1"
                                    >
                                        ← Back to events
                                    </button>
                                </div>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
                                    {selectedEventRegs.title}
                                    <span className="px-3 py-1 bg-white border border-zinc-100 rounded-md text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        {selectedEventRegs.regs.length} REGISTERED
                                    </span>
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedEventRegs(null)}
                                className="p-3 hover:bg-zinc-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="divide-y divide-zinc-50">
                            {selectedEventRegs.regs.length === 0 ? (
                                <div className="py-24 text-center">
                                    <p className="font-black text-xs uppercase tracking-[0.2em] text-zinc-300 italic">No registrations for this event yet.</p>
                                </div>
                            ) : (
                                selectedEventRegs.regs.map((reg) => (
                                    <div key={reg.id} className="p-8 flex items-center justify-between group hover:bg-zinc-50/50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="font-extrabold text-zinc-900 text-lg leading-tight">{reg.userName}</p>
                                                <p className="text-sm font-medium text-zinc-400 mt-0.5">{reg.userEmail}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1">Registered On</p>
                                                <p className="text-xs font-bold text-zinc-900">{format(new Date(reg.registeredAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                            
                                            <Link 
                                                href={`/dashboard/admin/messages?open=${reg.userId || ''}`}
                                                className={`px-6 py-2.5 bg-zinc-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all flex items-center gap-2 shadow-lg shadow-zinc-900/10 ${!reg.userId ? 'opacity-50' : ''}`}
                                            >
                                                <MessageSquare size={14} />
                                                Message
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : null}

                <div className={`${selectedEventRegs ? 'opacity-30 pointer-events-none' : ''} transition-opacity duration-500`}>
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Upcoming Events Table */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Upcoming Events</h3>
                                <div className="h-px flex-1 bg-zinc-100"></div>
                            </div>
                            {upcomingEvents.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 font-medium border-2 border-dashed border-zinc-100 rounded-md">
                                    No upcoming events.
                                </div>
                            ) : (
                                <div className="min-w-0 overflow-hidden">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="py-3 pr-4 font-bold text-zinc-800 uppercase text-[10px] tracking-widest">Date</th>
                                                <th className="py-3 pr-4 font-bold text-zinc-800 uppercase text-[10px] tracking-widest">Title</th>
                                                <th className="py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {upcomingEvents.map(event => (
                                                <EventRow 
                                                    key={event.id} 
                                                    event={event} 
                                                    onDelete={handleDelete} 
                                                    onViewRegs={() => handleViewRegistrations(event)}
                                                    isPast={false} 
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* Past Events Table */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-sm font-black text-zinc-900/40 uppercase tracking-widest">Past Events</h3>
                                <div className="h-px flex-1 bg-zinc-100/50"></div>
                            </div>
                            {pastEvents.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 font-medium border-2 border-dashed border-zinc-100 rounded-md opacity-50">
                                    No past events.
                                </div>
                            ) : (
                                <div className="min-w-0 overflow-hidden opacity-80">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="py-3 pr-4 font-bold text-zinc-800 uppercase text-[10px] tracking-widest">Date</th>
                                                <th className="py-3 pr-4 font-bold text-zinc-800 uppercase text-[10px] tracking-widest">Title</th>
                                                <th className="py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {pastEvents.map(event => (
                                                <EventRow 
                                                    key={event.id} 
                                                    event={event} 
                                                    onDelete={handleDelete} 
                                                    onViewRegs={() => handleViewRegistrations(event)}
                                                    isPast={true} 
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

        </div>
    );
}

function EventRow({ 
    event, 
    onDelete, 
    onViewRegs,
    isPast 
}: { 
    event: Event, 
    onDelete: (id: string) => void, 
    onViewRegs: () => void,
    isPast: boolean 
}) {
    return (
        <tr className="group hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-baseline gap-1.5 min-w-[60px]">
                    <span className="text-base font-black text-black">{format(new Date(event.date), 'dd')}</span>
                    <span className="text-[10px] font-bold uppercase text-zinc-600">{format(new Date(event.date), 'MMM')}</span>
                </div>
            </td>
            <td className="py-4 pr-4 min-w-[120px]">
                <div className="font-bold text-black truncate group-hover:text-zinc-800 transition-colors" title={event.title}>
                    {event.title}
                </div>
                <div className="text-[10px] text-zinc-600 font-bold">{event.time}</div>
            </td>
            <td className="py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onViewRegs}
                        className="px-3 py-1.5 bg-zinc-50 text-zinc-900 font-black text-[9px] uppercase tracking-[0.1em] rounded-md hover:bg-[#0d9488] hover:text-white transition-all flex items-center gap-1.5"
                    >
                        {event.registrationCount || 0} REGS
                    </button>
                    {!isPast && (
                        <button
                            onClick={() => onDelete(event.id)}
                            className="px-3 py-1.5 text-zinc-700 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                            title="Delete event"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
