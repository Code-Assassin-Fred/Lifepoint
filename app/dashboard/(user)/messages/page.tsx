import React, { Suspense } from 'react';
import MessagesModule from '@/modules/messages/page';

export default function UserMessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-[#0d9488]/10 border-t-[#0d9488] rounded-full animate-spin" />
            </div>
        }>
            <MessagesModule isAdmin={false} />
        </Suspense>
    );
}
