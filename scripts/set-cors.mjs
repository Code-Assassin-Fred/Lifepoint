import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
try {
    const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
    envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
            process.env[key.trim()] = value;
        }
    });
} catch (e) {
    console.error('Error loading .env.local:', e.message);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    console.error('Missing required environment variables. Check .env.local.');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
        storageBucket,
    });
}

async function setupCors() {
    try {
        const bucket = admin.storage().bucket();
        console.log(`Setting CORS for bucket: ${bucket.name}`);

        const corsConfig = [
            {
                origin: ['*'],
                method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                responseHeader: ['Content-Type', 'x-goog-resumable'],
                maxAgeSeconds: 3600,
            }
        ];

        await bucket.setCorsConfiguration(corsConfig);
        console.log('CORS configuration applied successfully!');

        // Verify
        const [metadata] = await bucket.getMetadata();
        console.log('Updated Metadata CORS:', JSON.stringify(metadata.cors, null, 2));

    } catch (error) {
        console.error('Error setting CORS:', error);
        process.exit(1);
    }
}

setupCors();
