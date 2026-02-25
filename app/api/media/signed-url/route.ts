import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { path, method = 'read', contentType } = await req.json();

        if (!path) {
            return NextResponse.json({ error: 'Storage path or URL is required' }, { status: 400 });
        }

        let storagePath = path;

        // If it's a full URL and we're reading, attempt to extract the path
        if (method === 'read' && path.startsWith('http')) {
            try {
                const url = new URL(path);
                const pathPart = url.pathname.split('/o/')[1];
                if (pathPart) {
                    storagePath = decodeURIComponent(pathPart.split('?')[0]);
                }
            } catch (e) {
                console.error('Error parsing URL in signed-url API:', e);
            }
        }

        const bucket = adminStorage.bucket();
        const file = bucket.file(storagePath);

        // For read actions, check if file exists
        if (method === 'read') {
            const [exists] = await file.exists();
            if (!exists) {
                console.error(`File does not exist at path: ${storagePath}`);
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }
        }

        // Generate signed URL
        const options: any = {
            version: 'v4',
            action: method,
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
        };

        if (method === 'write') {
            options.contentType = contentType || 'application/octet-stream';
        }

        const [signedUrl] = await file.getSignedUrl(options);

        return NextResponse.json({ signedUrl });
    } catch (error: any) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
