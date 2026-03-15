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
        <div className="max-w-5xl mx-auto p-4 lg:p-8 space-y-8 lg:space-y-12 relative pb-24">
            <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight">Events Management</h1>
                <p className="text-zinc-500 font-bold text-xs lg:text-sm">Upload and manage church events</p>
            </div>

            {/* Upload Form - Integrated into Page */}
            <div className="w-full">
                <div className="space-y-6 lg:space-y-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[10px] lg:text-sm font-black text-zinc-900 uppercase tracking-[0.2em]">
                            Create New Event
                        </h2>
                        <div className="h-px flex-1 bg-zinc-100"></div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Title</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-zinc-50 border border-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-bold text-sm"
                                placeholder="Event Title"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-zinc-50 border border-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all resize-none font-bold text-sm"
                                placeholder="Short description..."
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Date</label>
                                <input
                                    required
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-zinc-50 border border-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-black text-sm text-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Time</label>
                                <input
                                    required
                                    type="text"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-zinc-50 border border-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-bold text-sm"
                                    placeholder="e.g. 7:00 PM"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-700 uppercase mb-1.5 ml-1 tracking-wider">Location</label>
                            <input
                                required
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-zinc-50 border border-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d9488]/10 transition-all font-bold text-sm"
                                placeholder="Event Location"
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full lg:w-auto px-10 py-3.5 bg-[#0d9488] text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#0d9488]/20 hover:bg-[#0d9488]/90 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'CREATE EVENT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Registrations View - Inline */}
            <div id="registrations-view" className="space-y-6 lg:space-y-8 scroll-mt-20">
                {selectedEventRegs ? (
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                        <div className="p-6 lg:p-8 border-b border-zinc-50 bg-zinc-50 flex items-start lg:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <button 
                                        onClick={() => setSelectedEventRegs(null)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] hover:translate-x-[-4px] transition-transform flex items-center gap-1"
                                    >
                                        ← Back
                                    </button>
                                </div>
                                <h3 className="text-xl lg:text-2xl font-black text-zinc-900 tracking-tight flex flex-wrap items-center gap-3 lg:gap-4">
                                    {selectedEventRegs.title}
                                    <span className="px-3 py-1 bg-white border border-zinc-100 rounded-md text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        {selectedEventRegs.regs.length} REGISTERED
                                    </span>
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedEventRegs(null)}
                                className="p-2 lg:p-3 hover:bg-zinc-200 rounded-full transition-colors flex-shrink-0"
                            >
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="divide-y divide-zinc-50">
                            {selectedEventRegs.regs.length === 0 ? (
                                <div className="py-16 lg:py-24 text-center">
                                    <p className="font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] text-zinc-300 italic">No registrations for this event yet.</p>
                                </div>
                            ) : (
                                selectedEventRegs.regs.map((reg) => (
                                    <div key={reg.id} className="p-4 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-zinc-50/50 transition-all">
                                        <div className="flex items-center gap-4 lg:gap-6">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-black text-sm">
                                                {reg.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-zinc-900 text-base lg:text-lg leading-tight">{reg.userName}</p>
                                                <p className="text-xs lg:text-sm font-medium text-zinc-400 mt-0.5">{reg.userEmail}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-0.5 lg:mb-1">Date</p>
                                                <p className="text-[10px] lg:text-xs font-bold text-zinc-900">{format(new Date(reg.registeredAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                            
                                            <Link 
                                                href={`/dashboard/admin/messages?open=${reg.userId || ''}`}
                                                className={`px-4 lg:px-6 py-2 lg:py-2.5 bg-zinc-900 text-white rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all flex items-center gap-2 shadow-lg shadow-zinc-900/10 ${!reg.userId ? 'opacity-50 pointer-events-none' : ''}`}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                        {/* Upcoming Events Table */}
                        <section>
                            <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                <h3 className="text-[10px] lg:text-sm font-black text-zinc-900 uppercase tracking-widest">Upcoming</h3>
                                <div className="h-px flex-1 bg-zinc-100"></div>
                            </div>
                            {upcomingEvents.length === 0 ? (
                                <div className="py-8 lg:py-12 text-center text-zinc-400 text-xs font-medium border-2 border-dashed border-zinc-100 rounded-xl">
                                    No upcoming events.
                                </div>
                            ) : (
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-xs lg:text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="py-2 lg:py-3 pr-4 font-bold text-zinc-800 uppercase text-[9px] lg:text-[10px] tracking-widest whitespace-nowrap">Date</th>
                                                <th className="py-2 lg:py-3 pr-4 font-bold text-zinc-800 uppercase text-[9px] lg:text-[10px] tracking-widest">Title</th>
                                                <th className="py-2 lg:py-3 text-right"></th>
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
                            <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                <h3 className="text-[10px] lg:text-sm font-black text-zinc-900/40 uppercase tracking-widest">Past</h3>
                                <div className="h-px flex-1 bg-zinc-100/50"></div>
                            </div>
                            {pastEvents.length === 0 ? (
                                <div className="py-8 lg:py-12 text-center text-zinc-400 text-xs font-medium border-2 border-dashed border-zinc-100 rounded-xl opacity-50">
                                    No past events.
                                </div>
                            ) : (
                                <div className="overflow-x-auto no-scrollbar opacity-80">
                                    <table className="w-full text-xs lg:text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-zinc-100">
                                                <th className="py-2 lg:py-3 pr-4 font-bold text-zinc-800 uppercase text-[9px] lg:text-[10px] tracking-widest whitespace-nowrap">Date</th>
                                                <th className="py-2 lg:py-3 pr-4 font-bold text-zinc-800 uppercase text-[9px] lg:text-[10px] tracking-widest">Title</th>
                                                <th className="py-2 lg:py-3 text-right"></th>
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
            <td className="py-3 lg:py-4 pr-4">
                <div className="flex items-baseline gap-1 lg:gap-1.5 min-w-[50px] lg:min-w-[60px]">
                    <span className="text-sm lg:text-base font-black text-black">{format(new Date(event.date), 'dd')}</span>
                    <span className="text-[8px] lg:text-[10px] font-bold uppercase text-zinc-600">{format(new Date(event.date), 'MMM')}</span>
                </div>
            </td>
            <td className="py-3 lg:py-4 pr-2 lg:pr-4 min-w-[100px] lg:min-w-[150px]">
                <div className="font-bold text-black truncate max-w-[80px] sm:max-w-[200px] lg:max-w-none group-hover:text-zinc-800 transition-colors" title={event.title}>
                    {event.title}
                </div>
                <div className="text-[9px] lg:text-[10px] text-zinc-600 font-bold">{event.time}</div>
            </td>
            <td className="py-3 lg:py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                    <button
                        onClick={onViewRegs}
                        className="px-2 lg:px-3 py-1 lg:py-1.5 bg-zinc-50 text-zinc-900 font-black text-[8px] lg:text-[9px] uppercase tracking-[0.05em] lg:tracking-[0.1em] rounded-md hover:bg-[#0d9488] hover:text-white transition-all flex items-center gap-1 lg:gap-1.5"
                    >
                        {event.registrationCount || 0} <span className="hidden sm:inline">REGS</span>
                    </button>
                    {!isPast && (
                        <button
                            onClick={() => onDelete(event.id)}
                            className="p-1 lg:px-3 lg:py-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                            title="Delete event"
                        >
                            <Trash2 size={14} className="lg:hidden" />
                            <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-widest">Delete</span>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
