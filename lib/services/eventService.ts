export interface Event {
    id: string;
    title: string;
    description: string;
    date: string; // ISO string
    time: string;
    location: string;
    imageUrl?: string;
    createdAt: string;
}

export const eventService = {
    async getUpcomingEvents(): Promise<Event[]> {
        const response = await fetch('/api/events/upcoming');
        if (!response.ok) throw new Error('Failed to fetch upcoming events');
        return response.json();
    },

    async getPastEvents(): Promise<Event[]> {
        const response = await fetch('/api/events/past');
        if (!response.ok) throw new Error('Failed to fetch past events');
        return response.json();
    },

    async getAllEvents(): Promise<Event[]> {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    },

    async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<{ id: string }> {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    },

    async deleteEvent(id: string): Promise<void> {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete event');
    }
};
