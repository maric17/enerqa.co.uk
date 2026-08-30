import { list } from '@vercel/blob';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

// ==========================================
// Configuration
// ==========================================
const VERCEL_BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const DO_SPACES_ENDPOINT = process.env.S3_ENDPOINT; // e.g., 'https://sfo3.digitaloceanspaces.com'
const DO_SPACES_REGION = process.env.S3_REGION;     // e.g., 'sfo3'
const DO_SPACES_BUCKET = process.env.S3_BUCKET;
const DO_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const DO_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY;

// Initialize DO Spaces S3 Client
const s3Client = new S3Client({
  endpoint: DO_SPACES_ENDPOINT,
  forcePathStyle: false, // DigitalOcean Spaces supports virtual-hosted style
  region: DO_SPACES_REGION,
  credentials: {
    accessKeyId: DO_ACCESS_KEY,
    secretAccessKey: DO_SECRET_KEY
  }
});

async function migrate() {
  console.log('Starting migration from Vercel Blob to DO Spaces...');
  
  let cursor;
  let totalFiles = 0;

  do {
    // 1. List files from Vercel Blob
    const listResult = await list({
      token: VERCEL_BLOB_TOKEN,
      cursor: cursor,
      limit: 100, // Process in batches
    });

    const { blobs, cursor: nextCursor } = listResult;
    cursor = nextCursor;

    for (const blob of blobs) {
      try {
        console.log(`\nMigrating: ${blob.pathname}`);
        
        // 2. Download the file from Vercel Blob
        const response = await fetch(blob.url);
        if (!response.ok) throw new Error(`Failed to fetch ${blob.url}: ${response.statusText}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 3. Upload to DO Spaces
        const uploadParams = {
          Bucket: DO_SPACES_BUCKET,
          Key: blob.pathname, // Keep the same path/filename
          Body: buffer,
          ContentType: blob.contentType,
          ACL: 'public-read', // Ensure files are public if needed for your website
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`✅ Successfully uploaded: ${blob.pathname}`);
        totalFiles++;

      } catch (err) {
        console.error(`❌ Failed to migrate ${blob.pathname}:`, err);
      }
    }
  } while (cursor);

  console.log(`\n🎉 Migration complete! Total files migrated: ${totalFiles}`);
}

migrate().catch(console.error);
