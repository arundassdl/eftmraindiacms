import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../payload.config'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const courses = [
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2022/05/Karl-January-1024x724.png",
    title: "EFT Level 3 & Matrix Reimprinting",
    levelKey: "l3",
    levelLabel: "Level 3",
    cityKey: "other",
    cityLabel: "Kochi",
    trainerName: "Karl Dawson",
    startDate: "2023-01-07T09:00:00.000Z",
    endDate: "2023-01-12T18:00:00.000Z",
    monthKey: "january",
    badge: "Level 3 & MR"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/IMG-20240210-WA0007-1024x1024.jpg",
    title: "EFT Level 1 & 2 Training",
    levelKey: "l12",
    levelLabel: "Level 1 & 2",
    cityKey: "mumbai",
    cityLabel: "Mumbai",
    trainerName: "Leena R Haldar",
    startDate: "2024-02-23T09:00:00.000Z",
    endDate: "2024-02-25T18:00:00.000Z",
    venueName: "Suba Galaxy",
    monthKey: "february",
    badge: "Level 1 & 2"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-09-at-21.29.57_a1f965dd-1024x1024.jpg",
    title: "Matrix Reimprinting Practitioner Certification",
    levelKey: "matrix",
    levelLabel: "Matrix Reimprinting",
    cityKey: "mumbai",
    cityLabel: "Mumbai",
    trainerName: "Leena R Haldar",
    startDate: "2024-02-29T09:00:00.000Z",
    endDate: "2024-03-03T18:00:00.000Z",
    monthKey: "february",
    badge: "Matrix Reimprinting"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/Mridula-MR-1024x1024.png",
    title: "Matrix Reimprinting Practitioner Certification",
    levelKey: "matrix",
    levelLabel: "Matrix Reimprinting",
    cityKey: "bangalore",
    cityLabel: "Bangalore",
    trainerName: "Mridula Nair",
    startDate: "2024-03-01T09:00:00.000Z",
    endDate: "2024-03-04T18:00:00.000Z",
    venueName: "Royal Orchid Central",
    monthKey: "march",
    badge: "Matrix Reimprinting"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/Shilpa-EFT-1024x1024.jpg",
    title: "Emotional Freedom Technique (Level 1&2)",
    levelKey: "l12",
    levelLabel: "Level 1 & 2",
    cityKey: "new-delhi",
    cityLabel: "New Delhi",
    trainerName: "Dr Shilpa Gupta",
    startDate: "2024-03-08T09:00:00.000Z",
    endDate: "2024-03-10T18:00:00.000Z",
    monthKey: "march",
    badge: "Level 1 & 2"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/IMG-20240210-WA0008-1024x1024.jpg",
    title: "EFT 3 Advanced EFT skills",
    levelKey: "l3",
    levelLabel: "Level 3",
    cityKey: "mumbai",
    cityLabel: "Mumbai",
    trainerName: "Leena R Haldar",
    startDate: "2024-03-16T09:00:00.000Z",
    endDate: "2024-03-17T18:00:00.000Z",
    monthKey: "march",
    badge: "Level 3"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/Meetu-poster-1024x1024.jpg",
    title: "Emotional Freedom Technique (Level 1&2)",
    levelKey: "l12",
    levelLabel: "Level 1 & 2",
    cityKey: "new-delhi",
    cityLabel: "New Delhi",
    trainerName: "Meetu Sehgal",
    startDate: "2024-03-15T09:00:00.000Z",
    endDate: "2024-03-17T18:00:00.000Z",
    venueName: "Hilton Garden Inn",
    monthKey: "march",
    badge: "Level 1 & 2"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/Shilpa-eft-1-1024x1024.jpg",
    title: "Matrix Reimprinting Certification",
    levelKey: "matrix",
    levelLabel: "Matrix Reimprinting",
    cityKey: "new-delhi",
    cityLabel: "New Delhi",
    trainerName: "Dr Shilpa Gupta",
    startDate: "2024-03-28T09:00:00.000Z",
    endDate: "2024-03-31T18:00:00.000Z",
    monthKey: "march",
    badge: "Matrix Reimprinting"
  },
  {
    originalUrl: "https://www.eftmraindia.com/wp-content/uploads/2024/02/Diksha-EFT-3-1024x1024.jpg",
    title: "EFT 3 Advanced Training",
    levelKey: "l3",
    levelLabel: "Level 3",
    cityKey: "other",
    cityLabel: "Thane",
    trainerName: "Diksha Wadhwa",
    startDate: "2024-04-26T09:00:00.000Z",
    endDate: "2024-04-27T18:00:00.000Z",
    monthKey: "april",
    badge: "Level 3"
  }
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getBadgeTone(levelKey: string) {
  if (levelKey === 'matrix') return 'amber'
  if (levelKey === 'l3') return 'blue'
  return 'default'
}

async function run() {
  try {
    const payload = await getPayload({ config: configPromise })
    console.log('Payload initialized')

    // Find the primary site ID to bind it correctly to these courses
    const sitesres = await payload.find({ collection: 'sites' })
    const siteId = sitesres.docs[0]?.id || 1

    let i = 0;
    for (const data of courses) {
      i++;
      console.log(`[${i}/${courses.length}] Processing ${data.title}...`);

      try {
        const response = await fetch(data.originalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://www.eftmraindia.com/courses/'
          }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const urlObj = new URL(data.originalUrl);
        let filename = path.basename(urlObj.pathname).replace('%20', '_');
        filename = `${uuidv4().substring(0, 5)}-${filename}`;

        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = response.headers.get('content-type');
        if (!contentType) {
          contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
        }
        
        // Upload the media file
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `${data.title} Poster`,
          },
          file: {
            data: buffer,
            mimetype: contentType,
            name: filename,
            size: buffer.length,
          }
        });
        
        console.log(` -> Media uploaded: ID ${mediaDoc.id}`);

        const slug = slugify(`${data.title}-${data.cityLabel}-${data.startDate.split('-')[0]}-${i}`);

        // Inject the structured course directly
        await payload.create({
          collection: 'trainings',
          data: {
            title: data.title,
            slug: slug,
            site: siteId,
            status: "published",
            levelKey: data.levelKey as any,
            badge: data.badge,
            badgeTone: getBadgeTone(data.levelKey),
            cityKey: data.cityKey as any,
            cityLabel: data.cityLabel,
            trainerName: data.trainerName,
            trainerRole: "Trainer · EFTMRA India",
            startDate: data.startDate,
            endDate: data.endDate,
            format: "In-person",
            schedule: "9:00 am - 6:00 pm",
            venue: data.venueName || "Venue TBA",
            venueName: data.venueName || "Venue TBA",
            description: `A ${data.levelLabel} training led by ${data.trainerName} in ${data.cityLabel}.`,
            availability: "Registration required",
            availabilityTone: "open",
            price: "Contact for pricing",
            image: mediaDoc.id,
            imageAlt: `${data.title} Poster`,
          } as any
        });

        console.log(' -> Training record generated!');
      } catch (err) {
        console.error(` -> Failed for ${data.originalUrl}:`, err);
      }
    }
    
    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
