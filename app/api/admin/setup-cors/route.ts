import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const bucket = adminStorage.bucket();

        // Define CORS configuration
        const corsConfig = [
            {
                origin: ['*'],
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                responseHeader: ['Content-Type', 'x-goog-resumable'],
                maxAgeSeconds: 3600,
            }
        ];

        // Apply CORS configuration
        await bucket.setCorsConfiguration(corsConfig);

        return NextResponse.json({
            success: true,
            message: 'CORS configuration applied successfully to ' + bucket.name
        });
    } catch (error: any) {
        console.error('Error applying CORS configuration:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
