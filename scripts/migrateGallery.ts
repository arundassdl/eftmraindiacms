import fs from 'fs';
import path from 'path';
import { getPayload } from 'payload';
import configPromise from '../payload.config';

const urls = [
  "https://www.eftmraindia.com/wp-content/uploads/2024/07/LogoMakr-0kSFrf-300dpi-1-300x300.png",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-29-at-1.17.22-PM-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-29-at-1.10.02-PM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-29-at-1.10.02-PM-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-29-at-1.17.22-PM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/04/WhatsApp-Image-2022-04-19-at-12.16.14-AM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/04/WhatsApp-Image-2022-04-19-at-12.16.13-AM-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/04/WhatsApp-Image-2022-04-19-at-12.16.13-AM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/04/Leena-web-150x150.jpg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-04-at-7.59.51-PM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-04-at-7.59.51-PM-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-04-at-7.59.52-PM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-04-at-7.59.52-PM-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-25-at-1.50.05-PM-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-25-at-1.50.05-PM-1-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-25-at-1.50.05-PM-2-150x150.jpeg",
  "https://www.eftmraindia.com/wp-content/uploads/2022/07/WhatsApp-Image-2022-07-25-at-1.50.06-PM-150x150.jpeg"
];

async function run() {
  const payload = await getPayload({
    config: configPromise,
  });

  console.log("Starting migration...");
  for (const rawUrl of urls) {
    // Remove -150x150 or -300x300 ending
    const url = rawUrl.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');
    
    console.log(`Processing: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.eftmraindia.com/gallery/'
        }
      });
      if (!response.ok) {
        console.error(`Failed to download ${url}: ${response.statusText}`);
        continue;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = path.basename(new URL(url).pathname);
      const title = decodeURIComponent(filename).replace(/\.[^/.]+$/, "").replace(/-/g, ' ');

      console.log(`Uploading media: ${filename}`);
      const mediaRecord = await payload.create({
        collection: 'media',
        data: {
          alt: title,
        },
        file: {
          data: buffer,
          mimetype: response.headers.get('content-type') || 'image/jpeg',
          name: filename,
          size: buffer.byteLength,
        }
      });
      console.log(`Creating gallery item: ${title}`);
      await payload.create({
        collection: 'gallery',
        data: {
          title: title,
          image: mediaRecord.id,
          site: 1, // EFTMRA India
          status: 'published',
        }
      });
      console.log(`Successfully imported: ${title}\n`);
    } catch (e) {
      console.error(`Error processing ${url}:`, e);
    }
  }

  console.log("Migration complete!");
  process.exit(0);
}

run().catch(console.error);
