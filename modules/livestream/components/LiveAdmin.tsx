'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { livestreamService } from '@/lib/services/livestreamService';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Settings } from 'lucide-react';

interface LiveAdminProps {
    onStart: (title: string) => Promise<void>;
    onEnd: () => Promise<void>;
}

export default function LiveAdmin({ onStart, onEnd }: LiveAdminProps) {
    const [title, setTitle] = useState('');
    const [isStarting, setIsStarting] = useState(false);

    const handleStart = async () => {
        if (!title.trim()) return;
        setIsStarting(true);
        try {
            await onStart(title);
        } catch (error) {
            console.error('Failed to start stream:', error);
            alert('Failed to start stream');
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Setup Your Live Session</h3>
            <div className="w-full max-w-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for your live stream"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <button
                    onClick={handleStart}
                    disabled={isStarting || !title.trim()}
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200"
                >
                    {isStarting ? 'Preparing Room...' : 'Go Live Now'}
                </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <Video size={20} />
                    </div>
                    <span className="text-sm font-medium">Auto-HD Video</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <Mic size={20} />
                    </div>
                    <span className="text-sm font-medium">Crystal Audio</span>
                </div>
            </div>
        </div>
    );
}
