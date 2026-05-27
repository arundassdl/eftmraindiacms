import "dotenv/config";
import path from "path";
import { getPayload } from "payload";
import configPromise from "../payload.config";

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;

type MediaDoc = {
  id: number;
  filename?: string | null;
};

type SiteDoc = {
  id: number;
  slug: string;
};

const imageRoot = path.resolve(process.cwd(), "media");

async function ensureMedia(payload: PayloadClient, filename: string, alt?: string) {
  const existing = await payload.find({
    collection: "media",
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
  });

  if (existing.docs[0]) {
    return existing.docs[0] as MediaDoc;
  }

  return (await payload.create({
    collection: "media",
    data: {
      alt: alt ?? null,
    },
    filePath: path.join(imageRoot, filename),
  })) as MediaDoc;
}

async function ensureSite(payload: PayloadClient) {
  const siteResult = await payload.find({
    collection: "sites",
    where: {
      slug: {
        equals: "/",
      },
    },
    limit: 1,
  });

  const siteData = {
    name: "EFTMRA India",
    slug: "/",
    layoutType: "platform-home" as const,
    theme: {
      preset: "main" as const,
      primaryColor: "#4A9DAE",
      secondaryColor: "#1A3B4C",
      accentColor: "#EFF8FA",
      surfaceColor: "#FFFFFF",
      textColor: "#1A3B4C",
      mutedColor: "#6B8898",
      customTokens: [
        { token: "eftmra-midnight", label: "EFTMRA Midnight", value: "#1A3B4C" },
        { token: "eftmra-deep-ocean", label: "EFTMRA Deep Ocean", value: "#2B6A7C" },
        { token: "eftmra-sapphire", label: "EFTMRA Sapphire", value: "#4A9DAE" },
        { token: "eftmra-amber", label: "EFTMRA Amber", value: "#C9A84C" },
      ],
    },
    micrositeSubmenu: {
      title: "",
      icon: "auto" as const,
      links: [],
    },
  };

  if (siteResult.docs[0]) {
    return (await payload.update({
      collection: "sites",
      id: siteResult.docs[0].id,
      data: siteData,
    })) as SiteDoc;
  }

  return (await payload.create({
    collection: "sites",
    data: siteData,
  })) as SiteDoc;
}

async function upsertPage(payload: PayloadClient, site: SiteDoc, title: string, slug: string, layout: any[]) {
  const existing = await payload.find({
    collection: "pages",
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          site: {
            equals: site.id,
          },
        },
      ],
    },
    limit: 1,
  });

  const data: any = {
    title,
    slug,
    site: site.id,
    layout,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "pages",
      id: existing.docs[0].id,
      data,
    });
    console.log(`Updated page: ${slug}`);
    return;
  }

  await payload.create({
    collection: "pages",
    data,
  });
  console.log(`Created page: ${slug}`);
}

async function upsertTraining(payload: PayloadClient, site: SiteDoc, data: any) {
  const existing = await payload.find({
    collection: "trainings",
    where: {
      slug: {
        equals: data.slug,
      },
    },
    limit: 1,
  });

  const trainingData = {
    ...data,
    site: site.id,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "trainings",
      id: existing.docs[0].id,
      data: trainingData,
    });
    console.log(`Updated training: ${data.slug}`);
    return;
  }

  await payload.create({
    collection: "trainings",
    data: trainingData,
  });
  console.log(`Created training: ${data.slug}`);
}

async function upsertPractitioner(payload: PayloadClient, site: SiteDoc, data: any) {
  const existing = await payload.find({
    collection: "practitioners",
    where: {
      slug: {
        equals: data.slug,
      },
    },
    limit: 1,
  });

  const practitionerData = {
    ...data,
    site: site.id,
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "practitioners",
      id: existing.docs[0].id,
      data: practitionerData,
    });
    console.log(`Updated practitioner: ${data.slug}`);
    return;
  }

  await payload.create({
    collection: "practitioners",
    data: practitionerData,
  });
  console.log(`Created practitioner: ${data.slug}`);
}

async function upsertTestimonial(payload: PayloadClient, site: SiteDoc, data: any) {
  const payloadUnsafe = payload as any;

  const existing = await payloadUnsafe.find({
    collection: "testimonials",
    where: {
      slug: {
        equals: data.slug,
      },
    },
    limit: 1,
  });

  const testimonialData = {
    ...data,
    site: site.id,
  };

  if (existing.docs[0]) {
    await payloadUnsafe.update({
      collection: "testimonials",
      id: existing.docs[0].id,
      data: testimonialData,
    });
    console.log(`Updated testimonial: ${data.slug}`);
    return;
  }

  await payloadUnsafe.create({
    collection: "testimonials",
    data: testimonialData,
  });
  console.log(`Created testimonial: ${data.slug}`);
}

async function upsertPractitionerReview(payload: PayloadClient, site: SiteDoc, data: any) {
  const payloadUnsafe = payload as any;

  const existing = await payloadUnsafe.find({
    collection: "practitioner-reviews",
    where: {
      and: [
        { practitioner: { equals: data.practitioner } },
        { authorName: { equals: data.authorName } },
        { quote: { equals: data.quote } },
      ],
    },
    limit: 1,
  });

  const reviewData = {
    ...data,
    site: site.id,
  };

  if (existing.docs[0]) {
    await payloadUnsafe.update({
      collection: "practitioner-reviews",
      id: existing.docs[0].id,
      data: reviewData,
    });
    console.log(`Updated practitioner review: ${data.authorName}`);
    return;
  }

  await payloadUnsafe.create({
    collection: "practitioner-reviews",
    data: reviewData,
  });
  console.log(`Created practitioner review: ${data.authorName}`);
}

async function upsertTrainingReview(payload: PayloadClient, site: SiteDoc, data: any) {
  const payloadUnsafe = payload as any;

  const existing = await payloadUnsafe.find({
    collection: "training-reviews",
    where: {
      and: [
        { training: { equals: data.training } },
        { authorName: { equals: data.authorName } },
        { quote: { equals: data.quote } },
      ],
    },
    limit: 1,
  });

  const reviewData = {
    ...data,
    site: site.id,
  };

  if (existing.docs[0]) {
    await payloadUnsafe.update({
      collection: "training-reviews",
      id: existing.docs[0].id,
      data: reviewData,
    });
    console.log(`Updated training review: ${data.authorName}`);
    return;
  }

  await payloadUnsafe.create({
    collection: "training-reviews",
    data: reviewData,
  });
  console.log(`Created training review: ${data.authorName}`);
}

async function main() {
  const payload = await getPayload({ config: configPromise });
  const site = await ensureSite(payload);

  const media = {
    hero: await ensureMedia(payload, "EFT-tapping.jpg", "EFT tapping session"),
    training: await ensureMedia(payload, "EFT-training.png", "EFTMRA training session"),
    aboutGroup: await ensureMedia(payload, "About-EFTMRA-India.webp", "EFTMRA India group"),
    logo: await ensureMedia(payload, "LogoMakr-0kSFrf-300dpi-1-300x300.webp", "EFTMRA India logo"),
    banner: await ensureMedia(payload, "Training-banner.png", "EFT training banner"),
    bannerThumb: await ensureMedia(payload, "Training-banner-thumb.png", "Training banner thumbnail"),
    training3: await ensureMedia(payload, "training3.png", "EFT training Mumbai"),
    training4: await ensureMedia(payload, "training4.png", "EFT training Bengaluru"),
    training5: await ensureMedia(payload, "training5.png", "EFT training Gurugram"),
    training6: await ensureMedia(payload, "training6.png", "Introduction to EFT webinar"),
    training7: await ensureMedia(payload, "training7.png", "EFT training Delhi August"),
    eftPointsDiagram: await ensureMedia(payload, "EFT tappings body points (1).png", "EFT Tapping Points Diagram"),
    certMridula: await ensureMedia(payload, "Mridula-certificate-1024x768.webp", "Mridula certification"),
    certShilpa: await ensureMedia(payload, "Shilpa-Trainer-Cert-rotated.webp", "Shilpa certification"),
    certLeena: await ensureMedia(payload, "Leena-Cert-1024x743.webp", "Leena certification"),
    certDiksha: await ensureMedia(payload, "Diksha-Cert-1024x728.webp", "Diksha certification"),
    certDivya: await ensureMedia(payload, "DIVYA-SRIVASTAVA-Certificate-1024x745.webp", "Divya certification"),
    badgeBasic: await ensureMedia(payload, "EFTMRA-Basic-300x300.webp", "EFTMRA Basic badge"),
    badgeAdvanced: await ensureMedia(payload, "EFTMRA-Adv-Prractitioner-300x300.webp", "EFTMRA Advanced badge"),
    badgeMatrix: await ensureMedia(payload, "Matrix-Loo-300x300.webp", "Matrix Reimprinting badge"),
    mridula: await ensureMedia(payload, "Mridula-Photo.webp", "Mridula Nair"),
    shilpa: await ensureMedia(payload, "Shilpa.webp", "Dr. Shilpa Gupta"),
    leena: await ensureMedia(payload, "leena-R-Haldar.webp", "Leena R Haldar"),
    diksha: await ensureMedia(payload, "Diksha.webp", "Diksha Wadhwa"),
    divya: await ensureMedia(payload, "Divya-Srivastava.webp", "Divya Srivastava"),
    saumya: await ensureMedia(payload, "Saumya-Sharma.webp", "Saumya Sharma"),
    fatema: await ensureMedia(payload, "Fatema-Zavery.webp", "Fatema Zavery"),
    meetu: await ensureMedia(payload, "Meetu-Sehgal.webp", "Meetu Sehgal"),
    seema: await ensureMedia(payload, "Seema-Gorowara.webp", "Seema Gorowara"),
    aadya: await ensureMedia(payload, "AadyaGupta1.png", "Aadya Gupta"),
    aakriti: await ensureMedia(payload, "Aakriti-Todi.webp", "Aakriti Todi"),
    aastha: await ensureMedia(payload, "Aastha-Khurana-scaled.webp", "Aastha Khurana"),
    aayushi: await ensureMedia(payload, "Aayushi-Mittal.webp", "Aayushi Mittal"),
    adiba: await ensureMedia(payload, "Adiba-Khursheed.webp", "Adiba Khursheed"),
    aditi: await ensureMedia(payload, "Aditi-Bhasin.webp", "Aditi Bhasin"),
    akangsha: await ensureMedia(payload, "Akangsha.webp", "Akangsha Bansal"),
    alamelu: await ensureMedia(payload, "Alamelu-Harish.webp", "Alamelu Harish"),
    adrija: await ensureMedia(payload, "Adrija-Chakraborty.webp", "Adrija Chakraborty"),
    anandmai: await ensureMedia(payload, "Anandmai.webp", "Anandmai"),
  };

  const commonTrainingFields = {
    aboutParagraphs: [
      {
        content:
          "This training is delivered through EFTMRA India's internationally aligned curriculum, combining practical tapping tools, trauma-aware teaching, and a clear pathway into deeper professional practice.",
      },
      {
        content:
          "Participants leave with structured next steps, practice guidance, and access to the wider EFTMRA learning community so the training continues to support their growth beyond the room.",
      },
    ],
    outcomes: [
      { label: "A clear understanding of the methods taught in this training" },
      { label: "Hands-on practice with guided supervision and feedback" },
      { label: "Confidence applying the work ethically and appropriately" },
      { label: "A practical next-step plan for certification or continued study" },
    ],
    audiences: [
      {
        title: "Helping Professionals",
        description: "Therapists, coaches, counsellors, healers, doctors and wellness practitioners looking to expand their toolkit.",
      },
      {
        title: "Career Changers",
        description: "People seeking a structured, high-quality entry point into transformational work and client practice.",
      },
      {
        title: "Personal Growth Seekers",
        description: "Those who want to deepen their own healing journey while learning skills they can later share with others.",
      },
    ],
    scheduleDays: [
      {
        dayLabel: "Day 1",
        dayTitle: "Foundations",
        dayDate: "Training Day 1",
        theme: "Core principles and structure",
        topics: [
          { label: "Orientation, principles and live demonstrations" },
          { label: "Foundational techniques and teaching framework" },
          { label: "Practice rounds with trainer guidance" },
        ],
      },
      {
        dayLabel: "Day 2",
        dayTitle: "Application",
        dayDate: "Training Day 2",
        theme: "Practice, nuance and confidence",
        topics: [
          { label: "Deeper application with case examples" },
          { label: "Practice sessions, debriefs and Q&A" },
          { label: "Troubleshooting common sticking points" },
        ],
      },
      {
        dayLabel: "Day 3",
        dayTitle: "Integration",
        dayDate: "Training Day 3",
        theme: "Professional use and next steps",
        topics: [
          { label: "Ethics, scope, confidence and integration" },
          { label: "Certification or pathway requirements" },
          { label: "Closing supervision, reflection and action plan" },
        ],
      },
    ],
    certificationSteps: [
      {
        stepLabel: "1",
        title: "Complete the live training",
        description: "Attend the full training and receive your EFTMRA India certificate of completion.",
      },
      {
        stepLabel: "2",
        title: "Continue your supervised learning",
        description: "Follow the recommended coursework, practice hours, and mentoring guidance for your chosen level.",
      },
      {
        stepLabel: "✓",
        title: "Progress toward recognition",
        description: "Move forward with the relevant EFTMRA U.K. pathway and professional development steps for your programme.",
        highlight: true,
      },
    ],
    venueNotes: [
      { icon: "room", label: "Dedicated training room — fully prepared for live teaching and partner practice" },
      { icon: "location", label: "Full venue details are shared again after registration" },
      { icon: "info", label: "Tea, coffee and break logistics are confirmed with your joining instructions" },
    ],
    galleryVideoLabel: "Event Recap Video",
    galleryVideoUrl: "https://www.youtube.com/watch?v=q6z01r3t8a0",
    galleryShareTitle: "Were you there?",
    galleryShareDescription: "Share your photos and we'll feature them in the gallery.",
    successTitle: "You're registered!",
  };

  const reviewPresets = {
    l12: [
      {
        authorName: "Priya Sharma",
        authorRole: "Bengaluru · EFT Level 1 & 2",
        dateLabel: "June 2024",
        quote:
          "The 3-day intensive was transformative. I went in as a complete beginner and came out ready to work with clients. The teaching depth and the pace of the programme were exactly right.",
        rating: 5,
      },
      {
        authorName: "Ananya Krishnan",
        authorRole: "Mumbai · EFT Level 1 & 2",
        dateLabel: "November 2024",
        quote:
          "I have tried various healing modalities over the years, but EFT has been the most practically applicable. Thorough, well-paced, and deeply experiential — I felt safe to go deep.",
        rating: 5,
      },
      {
        authorName: "Rohan Mehta",
        authorRole: "New Delhi · EFT Level 1 & 2",
        dateLabel: "March 2025",
        quote:
          "The training gave me both the technical skills and the professional confidence to start seeing clients. The certification pathway is clearly explained and the ongoing support is genuine.",
        rating: 5,
      },
    ],
    l3: [
      {
        authorName: "Deepa Sharma",
        authorRole: "New Delhi · EFT Level 3",
        dateLabel: "September 2024",
        quote:
          "The Level 3 training filled every gap I had and gave me specialist tools I use with complex clients every week. Absolutely essential for any serious EFT practitioner who wants to go deeper.",
        rating: 5,
      },
      {
        authorName: "Amit Verma",
        authorRole: "Noida · EFT Level 3",
        dateLabel: "December 2024",
        quote:
          "Advanced, thorough and deeply practical. You are challenged to think at a truly professional level throughout. The peer supervision element alone was worth the investment.",
        rating: 5,
      },
    ],
    matrix: [
      {
        authorName: "Dr. Sunita Rao",
        authorRole: "Hyderabad · Matrix Reimprinting",
        dateLabel: "August 2024",
        quote:
          "Matrix Reimprinting changed how I work with trauma entirely. The ECHO process is profoundly different from standard EFT and the training was held with exceptional care and expertise.",
        rating: 5,
      },
      {
        authorName: "Kavitha Nair",
        authorRole: "Chennai · Matrix Reimprinting",
        dateLabel: "January 2025",
        quote:
          "I have been an EFT practitioner for two years and this training took my work to a completely new level. The depth of knowledge and the experiential learning were extraordinary.",
        rating: 5,
      },
    ],
    intro: [
      {
        authorName: "Neha Patel",
        authorRole: "Ahmedabad · Introductory Webinar",
        dateLabel: "February 2025",
        quote:
          "A wonderful introduction — clear, practical and very well hosted. I booked the Level 1 & 2 training immediately afterwards. Exactly what I needed to understand whether EFT was right for me.",
        rating: 5,
      },
      {
        authorName: "Ritu Agarwal",
        authorRole: "Pune · Introductory Webinar",
        dateLabel: "March 2025",
        quote:
          "I had been curious about EFT for years. This webinar made the whole thing tangible — I could feel the difference during the live practice segment. Signed up for the full training the same evening.",
        rating: 5,
      },
    ],
  } as const;

  function getTrainingReviewType(training: { reviewType?: string; levelKey?: string }) {
    if (training.reviewType === "matrix" || training.levelKey === "matrix") return "matrix";
    if (training.reviewType === "l3" || training.levelKey === "l3") return "l3";
    if (training.reviewType === "intro" || training.levelKey === "intro") return "intro";
    return "l12";
  }

  const trainingSeeds = [
    {
      title: "EFT Level 1 & 2 Training",
      slug: "eft-level-1-2-training-new-delhi-june-2025",
      status: "published",
      badge: "Foundation · Level 1 & 2",
      badgeTone: "default",
      description: "Your first 3-day intensive into the full tapping protocol, trauma-aware practice, and professional foundations.",
      image: media.bannerThumb.id,
      imageAlt: "EFT Training New Delhi",
      posterImage: media.banner.id,
      posterImageAlt: "EFT Level 1 & 2 Training — EFTMRA India",
      levelKey: "l12",
      levelLabel: "Level 1 & 2",
      cityKey: "delhi",
      cityLabel: "New Delhi",
      startDate: "2025-06-13",
      endDate: "2025-06-15",
      monthKey: "june",
      monthLabel: "June 2025",
      format: "In-person",
      dateText: "13–15 June 2025",
      cityText: "New Delhi",
      schedule: "Fri–Sun · 9:00 am – 6:00 pm daily",
      venue: "The Leela Palace, Chanakyapuri",
      requirement: "No prior experience required",
      availability: "8 seats left",
      availabilityTone: "low",
      price: "₹50,000",
      priceNote: "per person",
      stats: [
        { value: "3", label: "Days Intensive" },
        { value: "500+", label: "Certified Alumni" },
      ],
      trainerName: "Mridula Nair",
      trainerRole: "Master Trainer of Trainers · Head of EFTMRA India",
      trainerImage: media.mridula.id,
      trainerImageAlt: "Mridula Nair",
      trainerBio:
        "Mridula is a counselor and practitioner in several alternative therapies including Bach Flower Remedies, NLP, and Breakthrough Coaching with Timeline Technology. She is an experienced and successful trainer in EFT and Matrix Reimprinting, and leads EFTMRA India as the country's only EFTMRA U.K.-authorised certification academy.",
      trainerCredentials: [
        { label: "EFTMRA U.K. Master Trainer" },
        { label: "NLP Practitioner" },
        { label: "Bach Flower Remedies" },
        { label: "Timeline Technology" },
      ],
      venueName: "The Leela Palace, New Delhi",
      venueAddress: "Diplomatic Enclave, Chanakyapuri, New Delhi 110023",
      venueImage: media.training.id,
      venueImageAlt: "The Leela Palace New Delhi",
      successMessage:
        "Thank you — we've received your registration for the EFT Level 1 & 2 Training, New Delhi.\n\nYou'll receive a confirmation email within 24 hours with payment instructions and everything you need for the training.",
    },
    {
      title: "Matrix Reimprinting Workshop",
      slug: "matrix-reimprinting-workshop-mumbai-june-2025",
      status: "published",
      badge: "Matrix Reimprinting",
      badgeTone: "amber",
      description: "Karl Dawson's advanced modality for transformation at the root imprint level.",
      image: media.training3.id,
      imageAlt: "Matrix Reimprinting Mumbai",
      posterImage: media.training3.id,
      posterImageAlt: "Matrix Reimprinting workshop in Mumbai",
      levelKey: "matrix",
      levelLabel: "Matrix Reimprinting",
      cityKey: "mumbai",
      cityLabel: "Mumbai",
      startDate: "2025-06-20",
      endDate: "2025-06-22",
      monthKey: "june",
      monthLabel: "June 2025",
      format: "In-person",
      dateText: "20–22 June 2025",
      cityText: "Mumbai",
      schedule: "Fri–Sun · 9:30 am – 5:30 pm",
      venue: "ITC Grand Central, Parel",
      requirement: "Prerequisite: EFT Level 1 & 2",
      availability: "14 seats",
      availabilityTone: "open",
      price: "₹65,000",
      priceNote: "per person",
      stats: [
        { value: "3", label: "Live Days" },
        { value: "1", label: "Advanced Method" },
      ],
      trainerName: "Diksha Wadhwa",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.diksha.id,
      trainerImageAlt: "Diksha Wadhwa",
      trainerBio: "Diksha supports practitioners in working more deeply with emotional imprints, memory reconsolidation, and lasting transformation using EFTMRA-aligned methods.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }, { label: "Matrix Reimprinting Facilitator" }],
      venueName: "ITC Grand Central, Mumbai",
      venueAddress: "Parel, Mumbai",
      venueImage: media.training3.id,
      venueImageAlt: "Mumbai training venue",
      successMessage:
        "Thank you — we've received your registration for the Matrix Reimprinting Workshop, Mumbai.\n\nYou'll receive the next steps by email shortly.",
    },
    {
      title: "EFT Level 1 & 2 Training",
      slug: "eft-level-1-2-training-bengaluru-july-2025",
      status: "published",
      badge: "Level 1 & 2",
      badgeTone: "default",
      description: "The complete EFT certification foundation delivered as a single 3-day intensive.",
      image: media.training4.id,
      imageAlt: "EFT Training Bengaluru",
      posterImage: media.training4.id,
      posterImageAlt: "EFT Training Bengaluru",
      levelKey: "l12",
      levelLabel: "Level 1 & 2",
      cityKey: "bengaluru",
      cityLabel: "Bengaluru",
      startDate: "2025-07-11",
      endDate: "2025-07-13",
      monthKey: "july",
      monthLabel: "July 2025",
      format: "In-person",
      dateText: "11–13 July 2025",
      cityText: "Bengaluru",
      schedule: "Fri–Sun · 9:00 am – 6:00 pm",
      venue: "The Oberoi, MG Road",
      requirement: "No prior experience required",
      availability: "18 seats",
      availabilityTone: "open",
      price: "₹50,000",
      priceNote: "per person",
      stats: [{ value: "3", label: "Days Intensive" }, { value: "1", label: "Certification Start" }],
      trainerName: "Dr. Shilpa Gupta",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.shilpa.id,
      trainerImageAlt: "Dr. Shilpa Gupta",
      trainerBio: "Shilpa teaches EFT with warmth, structure, and clinical clarity, helping new students build strong foundations they can actually use.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }],
      venueName: "The Oberoi, Bengaluru",
      venueAddress: "MG Road, Bengaluru",
      venueImage: media.training4.id,
      venueImageAlt: "Bengaluru training venue",
      successMessage:
        "Thank you — we've received your registration for the EFT Level 1 & 2 Training, Bengaluru.\n\nWe'll send your confirmation and payment details soon.",
    },
    {
      title: "EFT Level 3 Advanced Training",
      slug: "eft-level-3-advanced-training-new-delhi-july-2025",
      status: "published",
      badge: "Level 3 · Advanced",
      badgeTone: "blue",
      description: "A deeper professional training focused on complex cases, scope expansion, and advanced methodologies.",
      image: media.bannerThumb.id,
      imageAlt: "EFT Level 3 New Delhi",
      posterImage: media.banner.id,
      posterImageAlt: "EFT Level 3 New Delhi",
      levelKey: "l3",
      levelLabel: "Level 3",
      cityKey: "delhi",
      cityLabel: "New Delhi",
      startDate: "2025-07-18",
      endDate: "2025-07-20",
      monthKey: "july",
      monthLabel: "July 2025",
      format: "In-person",
      dateText: "18–20 July 2025",
      cityText: "New Delhi",
      schedule: "Fri–Sun · 9:30 am – 6:00 pm",
      venue: "Taj Mahal Hotel, Man Singh Road",
      requirement: "Prerequisite: EFT Level 1 & 2",
      availability: "5 seats left",
      availabilityTone: "low",
      price: "₹35,000",
      priceNote: "per person",
      stats: [{ value: "3", label: "Advanced Days" }, { value: "1", label: "Next-Level Module" }],
      trainerName: "Mridula Nair",
      trainerRole: "Master Trainer · EFTMRA India",
      trainerImage: media.mridula.id,
      trainerImageAlt: "Mridula Nair",
      trainerBio: "Mridula leads advanced trainings that help practitioners refine complexity handling, confidence, and scope within a strong ethical framework.",
      trainerCredentials: [{ label: "EFTMRA U.K. Master Trainer" }],
      venueName: "Taj Mahal Hotel, New Delhi",
      venueAddress: "Man Singh Road, New Delhi",
      venueImage: media.bannerThumb.id,
      venueImageAlt: "New Delhi Level 3 venue",
      successMessage:
        "Thank you — we've received your registration for EFT Level 3 Advanced Training, New Delhi.\n\nYou'll hear from us shortly with the next steps.",
    },
    {
      title: "EFT Level 1 & 2 Training",
      slug: "eft-level-1-2-training-gurugram-august-2025",
      status: "published",
      badge: "Level 1 & 2",
      badgeTone: "default",
      description: "Foundation training in an intimate Gurugram setting.",
      image: media.training5.id,
      imageAlt: "EFT Training Gurugram",
      posterImage: media.training5.id,
      posterImageAlt: "EFT Training Gurugram",
      levelKey: "l12",
      levelLabel: "Level 1 & 2",
      cityKey: "gurugram",
      cityLabel: "Gurugram",
      startDate: "2025-08-08",
      endDate: "2025-08-10",
      monthKey: "aug",
      monthLabel: "August 2025",
      format: "In-person",
      dateText: "8–10 August 2025",
      cityText: "Gurugram",
      schedule: "Fri–Sun · 9:00 am – 6:00 pm",
      venue: "Trident Hotel, Golf Course Road",
      requirement: "No prior experience required",
      availability: "20 seats",
      availabilityTone: "open",
      price: "₹50,000",
      priceNote: "per person",
      stats: [{ value: "3", label: "Live Days" }, { value: "1", label: "Certification Start" }],
      trainerName: "Leena R Haldar",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.leena.id,
      trainerImageAlt: "Leena R Haldar",
      trainerBio: "Leena helps students build confidence with EFT through clear teaching, repeated practice, and an emphasis on embodied understanding.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }],
      venueName: "Trident Hotel, Gurugram",
      venueAddress: "Golf Course Road, Gurugram",
      venueImage: media.training5.id,
      venueImageAlt: "Gurugram training venue",
      successMessage:
        "Thank you — we've received your registration for the EFT Level 1 & 2 Training, Gurugram.\n\nWe'll send your joining details soon.",
    },
    {
      title: "Introduction to EFT Tapping - Free Webinar",
      slug: "introduction-to-eft-tapping-free-webinar-may-2025",
      status: "published",
      badge: "Introductory",
      badgeTone: "default",
      description: "A short introductory session for newcomers who want to experience EFT before enrolling.",
      image: media.training6.id,
      imageAlt: "Introduction to EFT Webinar",
      posterImage: media.training6.id,
      posterImageAlt: "Introduction to EFT webinar",
      levelKey: "intro",
      levelLabel: "Introductory",
      cityKey: "online",
      cityLabel: "Online",
      startDate: "2025-05-24",
      monthKey: "may",
      monthLabel: "May 2025",
      format: "Online",
      dateText: "24 May 2025",
      cityText: "Zoom · 11am–1pm IST",
      schedule: "Saturday · 11:00 am – 1:00 pm IST",
      venue: "Zoom — link sent on registration",
      requirement: "Open to all — no experience needed",
      availability: "42 joined",
      availabilityTone: "open",
      price: "Free",
      priceNote: "complimentary session",
      stats: [{ value: "2", label: "Hours Live" }, { value: "1", label: "Beginner Session" }],
      trainerName: "Dr. Shilpa Gupta",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.shilpa.id,
      trainerImageAlt: "Dr. Shilpa Gupta",
      trainerBio: "Shilpa introduces EFT in a welcoming and practical way, making the work accessible to complete beginners.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }],
      venueName: "Zoom Webinar",
      venueAddress: "Online event",
      venueImage: media.training6.id,
      venueImageAlt: "Zoom webinar",
      successMessage:
        "Thank you — you're registered for the Introduction to EFT Tapping webinar.\n\nWe'll email your access details before the session.",
    },
    {
      title: "EFT Level 1 & 2 Training",
      slug: "eft-level-1-2-training-new-delhi-august-2025",
      status: "published",
      badge: "Level 1 & 2",
      badgeTone: "default",
      description: "A late-summer New Delhi cohort for those starting their certification pathway.",
      image: media.training7.id,
      imageAlt: "EFT Training Delhi August",
      posterImage: media.training7.id,
      posterImageAlt: "EFT Training New Delhi August",
      levelKey: "l12",
      levelLabel: "Level 1 & 2",
      cityKey: "delhi",
      cityLabel: "New Delhi",
      startDate: "2025-08-22",
      endDate: "2025-08-24",
      monthKey: "aug",
      monthLabel: "August 2025",
      format: "In-person",
      dateText: "22–24 August 2025",
      cityText: "New Delhi",
      schedule: "Fri–Sun · 9:00 am – 6:00 pm",
      venue: "Hyatt Regency, Bhikaji Cama Place",
      requirement: "No prior experience required",
      availability: "16 seats",
      availabilityTone: "open",
      price: "₹50,000",
      priceNote: "per person",
      stats: [{ value: "3", label: "Live Days" }, { value: "1", label: "Certification Start" }],
      trainerName: "Saumya Sharma",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.saumya.id,
      trainerImageAlt: "Saumya Sharma",
      trainerBio: "Saumya supports students in learning EFT with calm structure, depth, and practical confidence they can carry forward immediately.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }],
      venueName: "Hyatt Regency, New Delhi",
      venueAddress: "Bhikaji Cama Place, New Delhi",
      venueImage: media.training7.id,
      venueImageAlt: "Delhi August venue",
      successMessage:
        "Thank you — we've received your registration for the EFT Level 1 & 2 Training, New Delhi.\n\nA confirmation email will follow shortly.",
    },
    {
      title: "Matrix Reimprinting Workshop",
      slug: "matrix-reimprinting-workshop-new-delhi-august-2025",
      status: "published",
      badge: "Matrix Reimprinting",
      badgeTone: "amber",
      description: "An advanced four-day specialist qualification in New Delhi.",
      image: media.bannerThumb.id,
      imageAlt: "Matrix Reimprinting Delhi",
      posterImage: media.banner.id,
      posterImageAlt: "Matrix Reimprinting New Delhi",
      levelKey: "matrix",
      levelLabel: "Matrix Reimprinting",
      cityKey: "delhi",
      cityLabel: "New Delhi",
      startDate: "2025-08-29",
      endDate: "2025-09-01",
      monthKey: "aug",
      monthLabel: "August 2025",
      format: "In-person",
      dateText: "29 Aug – 1 Sep 2025",
      cityText: "New Delhi",
      schedule: "4-day intensive · 9:30 am – 5:30 pm",
      venue: "The Claridges Hotel, Aurangzeb Road",
      requirement: "Prerequisite: EFT Level 1 & 2",
      availability: "12 seats",
      availabilityTone: "open",
      price: "₹65,000",
      priceNote: "per person",
      stats: [{ value: "4", label: "Intensive Days" }, { value: "1", label: "Advanced Specialist Module" }],
      trainerName: "Mridula Nair",
      trainerRole: "Master Trainer · EFTMRA India",
      trainerImage: media.mridula.id,
      trainerImageAlt: "Mridula Nair",
      trainerBio: "Mridula teaches Matrix Reimprinting as a deep, structured modality for working with imprints, beliefs, and transformation at the root level.",
      trainerCredentials: [{ label: "EFTMRA U.K. Master Trainer" }, { label: "Matrix Reimprinting Specialist" }],
      venueName: "The Claridges Hotel, New Delhi",
      venueAddress: "Aurangzeb Road, New Delhi",
      venueImage: media.bannerThumb.id,
      venueImageAlt: "Claridges New Delhi",
      successMessage:
        "Thank you — we've received your registration for the Matrix Reimprinting Workshop, New Delhi.\n\nWe'll be in touch with the next steps soon.",
    },
    {
      title: "EFT Level 1 & 2 Training",
      slug: "eft-level-1-2-training-mumbai-july-2025",
      status: "published",
      badge: "Level 1 & 2",
      badgeTone: "default",
      description: "A Mumbai cohort currently at capacity with waitlist enrollment open.",
      image: media.training3.id,
      imageAlt: "EFT Training Mumbai",
      posterImage: media.training3.id,
      posterImageAlt: "EFT Training Mumbai",
      levelKey: "l12",
      levelLabel: "Level 1 & 2",
      cityKey: "mumbai",
      cityLabel: "Mumbai",
      startDate: "2025-07-25",
      endDate: "2025-07-27",
      monthKey: "july",
      monthLabel: "July 2025",
      format: "In-person",
      dateText: "25–27 July 2025",
      cityText: "Mumbai",
      schedule: "Fri–Sun · 9:00 am – 6:00 pm",
      venue: "Sofitel BKC, Bandra Kurla Complex",
      requirement: "No prior experience required",
      availability: "Sold out",
      availabilityTone: "full",
      price: "₹50,000",
      priceNote: "per person",
      stats: [{ value: "3", label: "Live Days" }, { value: "Waitlist", label: "Current Status" }],
      trainerName: "Diksha Wadhwa",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.diksha.id,
      trainerImageAlt: "Diksha Wadhwa",
      trainerBio: "Diksha teaches foundational EFT in a way that helps students feel grounded, capable, and ready to continue beyond the room.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }],
      venueName: "Sofitel BKC, Mumbai",
      venueAddress: "Bandra Kurla Complex, Mumbai",
      venueImage: media.training3.id,
      venueImageAlt: "Mumbai venue",
      successMessage:
        "Thank you — we've received your waitlist registration for the EFT Level 1 & 2 Training, Mumbai.\n\nWe'll contact you if a place opens up.",
    },
    {
      title: "EFT Level 1 & 2 Training",
      slug: "eft-level-1-2-training-pune-may-2026",
      status: "published",
      badge: "Level 1 & 2",
      badgeTone: "default",
      description: "A spring Pune cohort for new students beginning their EFT certification journey with a practical, experiential foundation.",
      image: media.training4.id,
      imageAlt: "EFT Training Pune",
      posterImage: media.training4.id,
      posterImageAlt: "EFT Training Pune",
      levelKey: "l12",
      levelLabel: "Level 1 & 2",
      cityKey: "pune",
      cityLabel: "Pune",
      startDate: "2026-05-09",
      endDate: "2026-05-11",
      monthKey: "may",
      monthLabel: "May 2026",
      format: "In-person",
      dateText: "9–11 May 2026",
      cityText: "Pune",
      schedule: "Sat–Mon · 9:00 am – 6:00 pm daily",
      venue: "Hyatt Regency Pune, Kalyani Nagar",
      requirement: "No prior experience required",
      availability: "18 seats",
      availabilityTone: "open",
      price: "₹50,000",
      priceNote: "per person",
      stats: [{ value: "3", label: "Days Intensive" }, { value: "1", label: "Certification Start" }],
      trainerName: "Dr. Shilpa Gupta",
      trainerRole: "Trainer · EFTMRA India",
      trainerImage: media.shilpa.id,
      trainerImageAlt: "Dr. Shilpa Gupta",
      trainerBio:
        "Shilpa teaches EFT with warmth, structure, and clinical clarity, helping new students build strong foundations they can actually use.",
      trainerCredentials: [{ label: "EFTMRA India Trainer" }],
      venueName: "Hyatt Regency Pune",
      venueAddress: "Weikfield IT City Infopark, Nagar Road, Pune 411014",
      venueImage: media.training4.id,
      venueImageAlt: "Pune training venue",
      successMessage:
        "Thank you — we've received your registration for the EFT Level 1 & 2 Training, Pune.\n\nWe'll send your confirmation and payment details soon.",
    },
  ];

  const trainingReviewSeeds: { slug: string; reviews: any[] }[] = [];

  for (const training of trainingSeeds) {
    const reviewType = getTrainingReviewType(training);
    trainingReviewSeeds.push({
      slug: training.slug,
      reviews: [...reviewPresets[reviewType]],
    });

    await upsertTraining(payload, site, {
      ...commonTrainingFields,
      ...training,
    });
  }

  const practitionerSeeds = [
    {
      name: "Aadya Gupta",
      slug: "aadya-gupta",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "deep-teal",
      image: media.aadya.id,
      imageAlt: "Aadya Gupta",
      profileTagline: "Helping you heal anxiety, stress and trauma through the science of tapping. Based in New Delhi, available online across India.",
      rating: 4.8,
      reviews: 38,
      cityKey: "delhi",
      cityLabel: "New Delhi",
      state: "Delhi",
      country: "India",
      hours: "1 PM - 7 PM",
      availabilityMode: "both",
      sessionFee: "2500",
      email: "aadya@example.com",
      phone: "",
      whatsapp: "",
      bio: "I am a certified EFT Practitioner registered with EFTMRA India, with a deep commitment to helping individuals move through anxiety, stress, trauma, and emotional overwhelm gently and effectively. I work with clients both online and in-person in New Delhi, holding a safe, compassionate space where real healing can happen.",
      approach: "Every session begins with a conversation about what you are carrying, what you have tried, and what you most want to change. I work primarily with EFT tapping to gently release the emotional charge attached to past events and present-day triggers.",
      membershipNumber: "EFTMRA-IN-00142",
      certificationYear: "2022",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "Anxiety & Stress" }, { label: "Trauma & PTSD" }, { label: "Grief & Loss" }, { label: "Self-Worth" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Certified 2022 · Membership No. EFTMRA-IN-00142" }, { label: "Verified EFTMRA India member" }],
      reviewsList: [
        { authorName: "Preethi M.", dateLabel: "March 2025", quote: "I came to Aadya with years of unresolved anxiety that had started affecting my work. After just three sessions I noticed a significant shift.", rating: 5 },
        { authorName: "Rajan T.", dateLabel: "January 2025", quote: "Aadya creates a grounded, patient space. The sessions felt both evidence-based and deeply human.", rating: 5 },
      ],
    },
    {
      name: "Aakriti Todi",
      slug: "aakriti-todi",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "sapphire",
      image: media.aakriti.id,
      imageAlt: "Aakriti Todi",
      profileTagline: "Supporting emotional healing and personal clarity through EFT. Based in Guwahati and available online.",
      rating: 4.7,
      reviews: 14,
      cityKey: "guwahati",
      cityLabel: "Guwahati",
      state: "Assam",
      country: "India",
      hours: "9:30 AM - 4 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "Emotional Healing" }, { label: "Stress" }, { label: "Confidence" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I work with clients who are ready to move through emotional blocks with more ease and regulation.",
      approach: "My sessions blend tapping, reflection, and gentle pacing to support safe transformation.",
    },
    {
      name: "Aastha Khurana",
      slug: "aastha-khurana",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "ice-teal",
      image: media.aastha.id,
      imageAlt: "Aastha Khurana",
      rating: 4.6,
      reviews: 10,
      cityKey: "online",
      cityLabel: "Online",
      country: "India",
      hours: "10 AM - 6 PM",
      availabilityMode: "online",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "Stress" }, { label: "Healing" }, { label: "Relationships" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I help clients use EFT as a practical and empowering self-regulation method.",
      approach: "We work step by step, allowing the nervous system to settle while building emotional resilience.",
    },
    {
      name: "Aayushi Mittal",
      slug: "aayushi-mittal",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "amber",
      image: media.aayushi.id,
      imageAlt: "Aayushi Mittal",
      rating: 4.9,
      reviews: 18,
      cityKey: "mumbai",
      cityLabel: "Mumbai",
      state: "Maharashtra",
      country: "India",
      hours: "11 AM - 7 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "Trauma & PTSD" }, { label: "Self-Worth" }, { label: "Women's Health" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I support clients navigating stress, identity, and emotional healing in a grounded way.",
      approach: "My approach balances structure with compassion so each session feels steady and workable.",
    },
    {
      name: "Adiba Khursheed",
      slug: "adiba-khursheed",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "sapphire",
      image: media.adiba.id,
      imageAlt: "Adiba Khursheed",
      rating: 4.5,
      reviews: 9,
      cityKey: "gurugram",
      cityLabel: "Gurugram",
      state: "Haryana",
      country: "India",
      hours: "10 AM - 8 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "Stress" }, { label: "Trauma & PTSD" }, { label: "Mindset" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I work with clients seeking calm, clarity, and steadier emotional responses.",
      approach: "EFT gives us a gentle but direct way to work with stuck emotional patterns.",
    },
    {
      name: "Aditi Bhasin",
      slug: "aditi-bhasin",
      status: "published",
      role: "EFT & Matrix Reimprinting",
      category: "matrix",
      accent: "amber",
      image: media.aditi.id,
      imageAlt: "Aditi Bhasin",
      rating: 4.9,
      reviews: 20,
      cityKey: "delhi",
      cityLabel: "New Delhi",
      state: "Delhi",
      country: "India",
      hours: "10 AM - 6 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "Matrix Reimprinting" }, { label: "Trauma & PTSD" }, { label: "Self-Worth" }],
      credentials: [{ label: "EFT Advanced Practitioner" }, { label: "Matrix Reimprinting Practitioner" }, { label: "Verified EFTMRA India member" }],
      bio: "I specialise in deeper subconscious transformation using EFT and Matrix Reimprinting.",
      approach: "We work gently with stored emotional imprints and create space for meaningful change.",
    },
    {
      name: "Akangsha Bali",
      slug: "akangsha-bansal",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "deep-teal",
      image: media.akangsha.id,
      imageAlt: "Akangsha Bali",
      rating: 4.6,
      reviews: 11,
      cityKey: "gurugram",
      cityLabel: "Gurugram",
      state: "Haryana",
      country: "India",
      hours: "10 AM - 5 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "EFT Tapping" }, { label: "Stress" }, { label: "Trauma" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I help clients build greater regulation, confidence, and emotional balance.",
      approach: "Sessions are practical, compassionate, and paced to support lasting change.",
    },
    {
      name: "Adrija Chakraborty",
      slug: "adrija-chakraborty",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "sapphire",
      image: media.adrija.id,
      imageAlt: "Adrija Chakraborty",
      rating: 4.6,
      reviews: 12,
      cityKey: "noida",
      cityLabel: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      hours: "10 AM - 6 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "EFT Tapping" }, { label: "Emotional Healing" }, { label: "Wellness" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I support clients in creating more steadiness, self-awareness, and emotional ease through EFT.",
      approach: "My work is gentle, collaborative, and focused on making healing practical for everyday life.",
    },
    {
      name: "Alamelu Harish",
      slug: "alamelu-harish",
      status: "published",
      role: "EFT & Matrix Reimprinting",
      category: "matrix",
      accent: "ice-teal",
      image: media.alamelu.id,
      imageAlt: "Alamelu Harish",
      rating: 4.8,
      reviews: 16,
      cityKey: "bengaluru",
      cityLabel: "Bengaluru",
      state: "Karnataka",
      country: "India",
      hours: "10 AM - 5 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Tamil" }],
      specialties: [{ label: "Matrix Reimprinting" }, { label: "Healing" }, { label: "Trauma & PTSD" }],
      credentials: [{ label: "EFT Advanced Practitioner" }, { label: "Matrix Reimprinting Practitioner" }, { label: "Verified EFTMRA India member" }],
      bio: "I support clients through deep healing processes using EFT and Matrix Reimprinting.",
      approach: "The work is paced, respectful, and focused on creating emotional safety alongside transformation.",
    },
    {
      name: "Anandmai",
      slug: "anandmai",
      status: "published",
      role: "EFT Practitioner",
      category: "eft-practitioner",
      accent: "amber",
      image: media.anandmai.id,
      imageAlt: "Anandmai",
      rating: 4.7,
      reviews: 13,
      cityKey: "delhi",
      cityLabel: "New Delhi",
      state: "Delhi",
      country: "India",
      hours: "11 AM - 5 PM",
      availabilityMode: "both",
      languages: [{ label: "English" }, { label: "Hindi" }],
      specialties: [{ label: "EFT Tapping" }, { label: "Mindfulness" }, { label: "Healing" }],
      credentials: [{ label: "EFT Practitioner — Level 1 & 2" }, { label: "Verified EFTMRA India member" }],
      bio: "I help clients reconnect with inner steadiness and clarity through grounded EFT practice.",
      approach: "Sessions move at your pace and are designed to support both immediate relief and deeper emotional integration.",
    },
  ];

  for (const practitioner of practitionerSeeds) {
    await upsertPractitioner(payload, site, practitioner);
  }

  await upsertPage(payload, site, "Home", "/", [
    {
      blockType: "eftmra-hero",
      eyebrow: "New Delhi · Mumbai · Bengaluru · Gurugram · Pan India",
      title: "Every Mind Deserves World-Class Healing.",
      titleHighlight: "World-Class",
      description:
        "India's only internationally accredited EFT academy, authorised by EFTMRA U.K., founded by Karl Dawson, one of only 28 EFT Founding Masters in the world.",
      primaryCTA: { label: "Explore Our Courses →", href: "/eft-training" },
      videoLink: { label: "Watch: What is Tapping? (2 min)", href: "#what-is-eft" },
      heroImage: media.hero.id,
      heroImageAlt: "EFT Tapping session — EFTMRA India",
    },
    {
      blockType: "eftmra-trust-strip",
      items: [
        { value: "500+", label: "Practitioners Trained" },
        { value: "10+", label: "Years of Excellence" },
        { value: "5", label: "Cities Across India" },
        { value: "300+", label: "Published Studies" },
        // { value: "3", label: "Certification Levels" },
      ],
    },
    {
      blockType: "eftmra-explainer",
      eyebrow: "What is EFT Tapping",
      title: "Your body has a reset button.",
      description:
        "Emotional Freedom Technique, also called Tapping, sends a direct calming signal to the brain's threat-response centre by gently tapping on acupressure points while focusing on an emotional issue. It is validated in over 300 peer-reviewed studies, with measurable results often in a single session.",
      scienceLink: { label: "Read the science", href: "/about" },
      scienceCards: [
        {
          number: "01",
          metric: "Amygdala",
          title: "Calms the stress alarm",
          description: "Tapping signals safety to the brain's threat centre and quiets the fight-or-flight response.",
          accent: "blue",
        },
        {
          number: "02",
          metric: "43%",
          title: "Lowers cortisol by up to 43%",
          description: "Clinical trials show EFT can measurably reduce the body's primary stress hormone.",
          accent: "amber",
        },
        {
          number: "03",
          metric: "Mind & Body",
          title: "Shifts the nervous system",
          description: "Move from fight-or-flight to rest-and-repair with results that feel immediate and lasting.",
          accent: "blue",
        },
      ],
      conditionsLabel: "What it addresses",
      conditions: [
        { label: "Anxiety & Stress" },
        { label: "Trauma & PTSD" },
        { label: "Depression" },
        { label: "Phobias & Fears" },
        { label: "Chronic Pain" },
        { label: "Performance & Confidence" },
      ],
    },
    {
      blockType: "eftmra-certification",
      introEyebrow: "The EFTMRA Difference",
      introTitle: "India's only internationally recognised EFT certification and why it matters.",
      introDescription:
        "There are many EFT workshops in India. Only one offers a globally recognised certification — EFTMRA India, the sole academy authorised by EFTMRA U.K.",
      introImage: media.training.id,
      introImageAlt: "EFTMRA India EFT training session",
      highlights: [
        { number: "01", title: "International Recognition", description: "Certification accepted globally, accredited by EFTMRA U.K." },
        { number: "02", title: "Karl Dawson's Lineage", description: "Learn from the gold standard of EFT mastery worldwide." },
        { number: "03", title: "Clear Pathway", description: "Transparent levels from beginner to internationally certified practitioner." },
        { number: "04", title: "Ongoing Community", description: "Swap sessions, mentoring circles, and practitioner development." },
      ],
      missionEyebrow: "Our Mission",
      missionTitle: "Every Indian deserves access to world-class emotional healing.",
      missionParagraphs: [
        { content: "India is home to 1.4 billion people. Anxiety, depression, trauma, and stress touch virtually every family, yet internationally accredited emotional healing practitioners are still rare." },
        { content: "We are building a generation of skilled, ethical, and compassionate EFT practitioners for every community across this country." },
      ],
      missionEmphasis: "Because every life deserves world-class care.",
      primaryCTA: { label: "Read our full story", href: "/about" },
      secondaryCTA: { label: "Meet the trainers", href: "/our-team" },
      teamMembers: [
        { name: "Mridula Nair", role: "Head & Master Trainer of Trainers", image: media.mridula.id },
        { name: "Dr. Shilpa Gupta", role: "Master Trainer of Trainers", image: media.shilpa.id },
        { name: "Leena R Haldar", role: "Master Trainer of Trainers", image: media.leena.id },
        { name: "Diksha Wadhwa", role: "Master Trainer", image: media.diksha.id },
        { name: "Divya Srivastava", role: "Trainer", image: media.divya.id },
        { name: "Saumya Sharma", role: "Master Trainer", image: media.saumya.id },
        { name: "Fatema Zavery", role: "Trainer", image: media.fatema.id },
      ],
    },
    {
      blockType: "eftmra-pathway",
      eyebrow: "The Pathway",
      title: "From first tap to certified practitioner.",
      description:
        "A clear, transparent journey — from your first EFT weekend through to internationally recognised certification and beyond.",
      steps: [
        {
          marker: "1",
          title: "Attend EFT Level 1 & 2 Training",
          subtitle: "Your starting point.",
          description: "A 3-day intensive covering the complete EFT tapping protocol through professional-level trauma work, advanced protocols, and ethical practice.",
          meta: "New Delhi · Mumbai · Bengaluru · Gurugram · Duration: 3 days",
          tone: "default",
        },
        {
          marker: "2",
          title: "Register with EFTMRA & Complete Online Requirements",
          subtitle: "Go official.",
          description: "Register as a student, complete the Code of Ethics, watch student training videos, and pass the online assessment.",
          meta: "Online · Self-paced",
          tone: "default",
        },
        {
          marker: "3",
          title: "Gain Supervised Practice",
          subtitle: "Build your mastery.",
          description: "Complete peer swaps, submit case studies, and build professional readiness with guided practice.",
          meta: "Ongoing · Online & in-person",
          tone: "default",
        },
        {
          marker: "4",
          title: "Upgrade to Certified Practitioner",
          subtitle: "Receive your international certification.",
          description: "Once you pass the test, your practitioner profile goes live on the EFTMRA directory and is recognised globally.",
          meta: "Credential: EFTMRA Certified EFT Practitioner",
          tone: "default",
        },
        {
          marker: "★",
          title: "Matrix Reimprinting",
          subtitle: "Karl Dawson's evolution of EFT.",
          description: "Work with ECHOs to transform the root imprints of trauma and limiting beliefs through advanced EFT practice.",
          meta: "Eligibility: Completion of EFT Level 1 & 2",
          badge: "Advanced Specialist Qualification",
          tone: "amber",
        },
      ],
      advancedTrackLabel: "Optional Advanced Track",
      audienceTitle: "You're in the right place if you are…",
      audienceItems: [
        {
          title: "A health professional adding to your toolkit",
          description: "Psychologists, counsellors, coaches, physiotherapists, and doctors worldwide are integrating EFT.",
        },
        {
          title: "Someone beginning a new career as a Practitioner",
          description: "No prior experience needed. Our pathway takes you from beginner to internationally certified practitioner.",
        },
        {
          title: "An individual who experienced EFT and wants to share it",
          description: "Many of our finest practitioners began as clients. We'll show you how to turn that experience into a profession.",
        },
      ],
      audienceCTA: { label: "Not sure which path fits you? Talk to us →", href: "/contact" },
    },
    {
      blockType: "eftmra-courses",
      eyebrow: "Training Programmes",
      title: "Find the right course for where you are.",
      description: "EFTMRA-certified trainers across India lead all courses. Each level is a step toward your internationally recognised certification.",
      courses: [
        {
          badge: "Foundation + Practitioner · No experience needed",
          badgeTone: "default",
          title: "EFT Level 1 & 2",
          description: "The complete EFT certification foundation delivered as a single 3-day intensive.",
          location: "New Delhi · Mumbai · Bengaluru · Gurugram",
          image: media.bannerThumb.id,
          cta: { label: "View Dates & Enroll →", href: "/eft-training" },
        },
        {
          badge: "Advanced Practitioner · Requires Level 1 & 2",
          badgeTone: "blue",
          title: "EFT Level 3",
          description: "Deepen your professional practice with specialist skills, deeper trauma work, and advanced client methodologies.",
          location: "Multiple locations",
          image: media.training.id,
          cta: { label: "View Dates & Enroll →", href: "/eft-training" },
        },
        {
          badge: "Advanced Specialist · Requires Level 1 & 2",
          badgeTone: "amber",
          title: "Matrix Reimprinting",
          description: "Karl Dawson's revolutionary evolution of EFT for deep subconscious transformation.",
          location: "Select locations",
          image: media.training.id,
          cta: { label: "View Dates & Enroll →", href: "/eft-training" },

        },
      ],
      sectionCTA: { label: "See All Upcoming Courses & Dates →", href: "/eft-training" },
    },
    {
      blockType: "eftmra-practitioners",
      eyebrow: "Find a Practitioner",
      title: "Connect with a certified EFT practitioner near you.",
      description: "Every practitioner in our directory is trained and certified by EFTMRA India and EFTMRA U.K., committed to ethical, evidence-based practice.",
      cta: { label: "View All Practitioners →", href: "/practitioners" },
      practitioners: [
        { name: "Aadya Gupta", role: "EFT Practitioner", image: media.aadya.id, accent: "deep-teal" },
        { name: "Aakriti Todi", role: "EFT Practitioner", image: media.aakriti.id, accent: "deep-teal" },
        { name: "Aastha Khurana", role: "EFT Practitioner", image: media.aastha.id, accent: "sapphire" },
        { name: "Aayushi Mittal", role: "EFT Practitioner", image: media.aayushi.id, accent: "amber" },
        { name: "Adiba Khursheed", role: "EFT Practitioner", image: media.adiba.id, accent: "sapphire" },
        { name: "Aditi Bhasin", role: "EFT & Matrix Reimprinting", image: media.aditi.id, accent: "amber" },
        { name: "Akangsha Bansal", role: "EFT Practitioner", image: media.akangsha.id, accent: "deep-teal" },
        { name: "Alamelu Harish", role: "EFT & Matrix Reimprinting", image: media.alamelu.id, accent: "ice-teal" },
      ],
    },
    {
      blockType: "eftmra-testimonials",
      eyebrow: "What Our Practitioners Say",
      title: "Lives changed. Practices built.",
      testimonials: [
        { quote: "I came as a psychologist looking to add one tool. EFT is now the foundation of everything I do with clients.", authorName: "Practitioner Name", authorRole: "Mumbai", authorImage: media.aayushi.id, rating: 5 },
        { quote: "I had no prior experience. EFTMRA India's Level 1 & 2 changed my life. I now run a full-time EFT practice.", authorName: "Practitioner Name", authorRole: "Bengaluru", authorImage: media.aadya.id, rating: 5 },
        { quote: "The Matrix Reimprinting course was world-class. I travel internationally to see clients now.", authorName: "Practitioner Name", authorRole: "Gurugram", authorImage: media.alamelu.id, rating: 5 },
      ],
    },
    {
      blockType: "eftmra-final-cta",
      title: "Every mind deserves world-class healing.",
      subtitle: "Yours included. Begin with one step.",
      description: "Join India's only internationally accredited EFT academy. Train with us, and carry this life-changing skill to the people who need it most.",
      primaryCTA: { label: "Explore Courses", href: "/eft-training" },
      secondaryCTA: { label: "Talk to Us First", href: "/contact" },
    },
  ]);

  await upsertPage(payload, site, "About EFTMRA India", "about", [
    {
      blockType: "eftmra-page-header",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "About EFTMRA India" },
      ],
      eyebrow: "About EFTMRA",
      title: "Creating Internationally Accredited EFT Practitioners.",
      description:
        "India's only officially authorised EFT training academy, recognised by EFTMRA U.K. and built on the direct lineage of Karl Dawson.",
      body: [
        {
          content:
            "EFTMRA India exists to make high-quality emotional healing accessible through properly trained practitioners. In a space where standards vary widely, we bring structure, accountability, and international alignment.",
        },
        {
          content:
            "We work with individuals seeking personal transformation as well as professionals looking to integrate EFT into their existing practice or build one of their own.",
        },
        {
          content: "We train practitioners who are prepared, not just certified.",
        },
      ],
      media: media.eftPointsDiagram.id,
      mediaAlt: "EFT Tapping Points Diagram",
      layout: "media",
    },
    {
      blockType: "eftmra-lineage",
      eyebrow: "Our Lineage",
      title: "Certified directly through EFT's founding lineage.",
      nodes: [
        {
          initials: "GC",
          name: "Gary Craig",
          role:
            "Originator of EFT Tapping. Developed the technique in 1995 and made it publicly available worldwide, sparking a global movement in emotional healing.",
        },
        {
          initials: "KD",
          name: "Karl Dawson",
          role:
            "EFT Founding Master, one of only 28 worldwide. Founder of Matrix Reimprinting and creator of EFTMRA, establishing the global standard for EFT training.",
        },
        {
          initials: "UK",
          name: "EFTMRA U.K.",
          role:
            "The global governing body for EFT practitioner training and certification standards. Operational across 40+ countries, maintaining consistent international quality.",
        },
        {
          initials: "IN",
          name: "EFTMRA India",
          role:
            "India's only officially authorised EFT training academy, directly certified under EFTMRA U.K. and carrying the full weight of the founding lineage.",
          tone: "midnight",
          tag: "You train here",
        },
      ],
      badges: [
        {
          image: media.badgeBasic.id,
          imageAlt: "EFT Practitioner badge",
          level: "Level 01 - EFT Practitioner",
          title: "Structured Learning",
          description:
            "Foundation certification · EFTMRA U.K. recognised\nEach level follows the approved curriculum, delivered through focused in-person training to build genuine competence at every stage.",
        },
        {
          image: media.badgeAdvanced.id,
          imageAlt: "EFT Advanced Practitioner badge",
          level: "Level 02 - EFT Advanced Practitioner",
          title: "Guided Practice",
          description:
            "Advanced techniques · Supervised case work\nPractical application built through supervised sessions and structured case submissions, ensuring readiness before independent work.",
        },
        {
          image: media.badgeMatrix.id,
          imageAlt: "Matrix Reimprinting badge",
          level: "Level 03 - Matrix Reimprinting",
          title: "Real Capability",
          description:
            "Karl Dawson method · Global recognition\nGraduates leave with internationally recognised certification and ongoing support through our active practitioner community.",
        },
      ],
      certificates: [
        { image: media.certMridula.id, imageAlt: "EFTMRA Trainer Certification - Mridula Nair" },
        { image: media.certShilpa.id, imageAlt: "EFTMRA Trainer Certification - Dr. Shilpa Gupta" },
        { image: media.certLeena.id, imageAlt: "EFTMRA Certification - Leena R Haldar" },
        { image: media.certDiksha.id, imageAlt: "EFTMRA Certification - Diksha Wadhwa" },
        { image: media.certDivya.id, imageAlt: "EFTMRA Certification - Divya Srivastava" },
      ],
    },
    {
      blockType: "eftmra-card-grid",
      eyebrow: "What Drives Us",
      title: "Our Vision & Mission",
      description:
        "We operate with integrity, maintaining international standards without compromise. Our focus is on delivering meaningful training that produces capable practitioners, not just certifications. We believe in building a supportive professional community and holding a responsible, compassionate approach to healing work.",
      variant: "vision-mission",
      cards: [
        {
          badge: "Vision",
          title: "Vision",
          description:
            "A future where access to skilled emotional healing is available across every community in India.",
        },
        {
          badge: "Mission",
          title: "Mission",
          description:
            "To train and support practitioners to a consistent, international standard, building a credible and trusted EFT ecosystem in India.",
        },
      ],
    },
    {
      blockType: "eftmra-card-grid",
      eyebrow: "Meet the Trainers",
      title: "Learn from certified practitioners actively working in the field.",
      description: "Each trainer is certified directly by EFTMRA U.K. and brings years of professional EFT practice alongside their teaching expertise.",
      variant: "people",
      cards: [
        { title: "Mridula Nair", subtitle: "Master Trainer of Trainers · Head of EFTMRA India", image: media.mridula.id, accent: "deep-teal" },
        { title: "Dr. Shilpa Gupta", subtitle: "Master Trainer of Trainers · EFTMRA India", image: media.shilpa.id, accent: "sapphire" },
        { title: "Leena R Haldar", subtitle: "Master Trainer of Trainers · EFTMRA India", image: media.leena.id, accent: "amber" },
        { title: "Diksha Wadhwa", subtitle: "Master Trainer · EFTMRA India", image: media.diksha.id, accent: "ice" },
        { title: "Divya Srivastava", subtitle: "Trainer · EFTMRA India", image: media.divya.id, accent: "sapphire" },
        { title: "Saumya Sharma", subtitle: "Master Trainer · EFTMRA India", image: media.saumya.id, accent: "deep-teal" },
        { title: "Fatema Zavery", subtitle: "Trainer · EFTMRA India", image: media.fatema.id, accent: "amber" },
        { title: "Meetu Sehgal", subtitle: "Trainer · EFTMRA India", image: media.meetu.id, accent: "amber" },
        { title: "Seema Gorowara", subtitle: "Trainer · EFTMRA India", image: media.seema.id, accent: "sapphire" },
      ],
    },
    {
      blockType: "eftmra-card-grid",
      eyebrow: "Impact & Insights",
      title: "Watch EFT in Action.",
      description: "Explore how EFT and Matrix Reimprinting are transforming lives and gaining global recognition.",
      variant: "video",
      cards: [
        {
          title: "About Karl Dawson",
          subtitle: "EFT & Matrix Reimprinting Trainer",
          videoUrl: "https://www.youtube.com/watch?v=CwU4rdFiuIs",
          image: media.aboutGroup.id,
        },
        {
          title: "Introduction to EFT",
          subtitle: "By EFT Master Karl Dawson",
          videoUrl: "https://www.youtube.com/watch?v=58uh5ZaxDPA",
          image: media.training.id,
        },
        {
          title: "Global Recognition",
          subtitle: "Celebrities & News Reports",
          videoUrl: "https://www.youtube.com/watch?v=JJeOXsMSIo4",
          image: media.training3.id,
        },
        {
          title: "Practitioner Perspectives",
          subtitle: "What Professionals Think",
          videoUrl: "https://www.youtube.com/watch?v=1LzNFWZgm8k",
          image: media.eftPointsDiagram.id,
        },
        {
          title: "Resolving Trauma",
          subtitle: "Using Matrix Reimprinting",
          videoUrl: "https://www.youtube.com/watch?v=p0iwB0x6hyU",
          image: media.training4.id,
        },
      ],
    },
    {
      blockType: "eftmra-final-cta",
      eyebrow: "Ready to Begin",
      title: "Ready to begin your EFT journey?",
      description: "Whether you are exploring EFT for personal growth or professional practice, our structured pathway takes you from your first session to internationally recognised certification.",
      primaryCTA: { label: "Explore EFT Trainings", href: "/eft-training" },
      secondaryCTA: { label: "Find a Practitioner", href: "/practitioners" },
    },
  ]);

  await upsertPage(payload, site, "Contact Us", "contact", [
    {
      blockType: "eftmra-page-header",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Contact Us" },
      ],
      eyebrow: "Get in Touch",
      title: "We'd love to hear from you.",
      description: "Reach out to us about training, certification, or anything EFT — our team typically responds within one business day.",
    },
    {
      blockType: "eftmra-contact-section",
      eyebrow: "Get in Touch",
      title: "We would love to hear from you.",
      description: "Whether you have a question about our EFT training programmes, certification pathways, or simply want to learn more about what we do, our team is here to help.",
      infoItems: [
        { label: "Email", value: "contact@eftmraindia.com" },
        { label: "Phone", value: "+91 96633 33144" },
        { label: "WhatsApp", value: "+91 96633 33144" },
        { label: "Location", value: "#2995, 12A Main, 5th Cross, Indiranagar 2nd Stage, Bangalore – 560038" },
      ],
      formTitle: "Send us a message",
      formFields: [
        { label: "Full name", name: "name", type: "text", placeholder: "Your full name", required: true },
        { label: "Email address", name: "email", type: "email", placeholder: "you@email.com", required: true },
        { label: "Phone number", name: "phone", type: "tel", placeholder: "" },
        { label: "Subject", name: "subject", type: "text", placeholder: "How can we help?" },
        { label: "Message", name: "message", type: "textarea", placeholder: "Tell us a bit more…", required: true },
      ],
      submitLabel: "Send Message",
    },
    {
      blockType: "eftmra-final-cta",
      eyebrow: "Begin Your EFT Journey",
      title: "Ready to begin your EFT training?",
      subtitle: "Join 500+ practitioners trained by EFTMRA India.",
      description: "Train with India's only internationally accredited EFT academy and carry this life-changing skill to the people who need it most.",
      tone: "dark",
      primaryCTA: { label: "View Upcoming Trainings", href: "/eft-training" },
      secondaryCTA: { label: "About EFTMRA India", href: "/about" },
    },
  ]);

  await upsertPage(payload, site, "EFT Training & Workshops", "eft-training", [
    {
      blockType: "eftmra-page-header",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "EFT Training" },
      ],
      eyebrow: "EFT Training & Workshops",
      title: "A structured pathway to internationally recognised certification.",
      description: "From a first-weekend intensive to advanced specialist training, every course is led by EFTMRA-certified trainers and builds toward your globally recognised practitioner credential.",
      stats: [
        { value: "12", label: "Upcoming Sessions" },
        { value: "9", label: "Accredited Trainers" },
        { value: "5", label: "Cities Across India" },
      ],
    },
    {
      blockType: "eftmra-courses",
      title: "Upcoming EFT Trainings",
      layoutVariant: "listing",
      courses: [
        {
          badge: "Level 1 & 2",
          badgeTone: "default",
          title: "EFT Level 1 & 2 Training",
          description: "Your first 3-day intensive into the full tapping protocol, trauma-aware practice, and professional foundations.",
          image: media.bannerThumb.id,
          imageAlt: "EFT Training New Delhi",
          levelKey: "l12",
          levelLabel: "Level 1 & 2",
          cityKey: "delhi",
          cityLabel: "New Delhi",
          monthKey: "june",
          monthLabel: "June 2025",
          startDate: "2025-06-13",
          endDate: "2025-06-15",
          format: "In-person",
          dateText: "13–15 June 2025",
          cityText: "New Delhi",
          schedule: "Fri-Sun · 9:00 am - 6:00 pm",
          venue: "The Leela Palace, Chanakyapuri",
          requirement: "No prior experience required",
          trainerName: "Mridula Nair",
          trainerRole: "Master Trainer · EFTMRA India",
          trainerImage: media.mridula.id,
          availability: "8 seats left",
          availabilityTone: "low",
          price: "₹50,000",
          priceNote: "incl. materials",
          cta: { label: "Register Now →", href: "/eft-training/eft-level-1-2-training-new-delhi-june-2025" },
        },
        {
          badge: "Matrix Reimprinting",
          badgeTone: "amber",
          title: "Matrix Reimprinting Workshop",
          description: "Karl Dawson's advanced modality for transformation at the root imprint level.",
          image: media.training3.id,
          imageAlt: "Matrix Reimprinting Mumbai",
          levelKey: "matrix",
          levelLabel: "Matrix Reimprinting",
          cityKey: "mumbai",
          cityLabel: "Mumbai",
          monthKey: "june",
          monthLabel: "June 2025",
          startDate: "2025-06-20",
          endDate: "2025-06-22",
          format: "In-person",
          dateText: "20–22 June 2025",
          cityText: "Mumbai",
          schedule: "Fri-Sun · 9:30 am - 5:30 pm",
          venue: "ITC Grand Central, Parel",
          requirement: "Prerequisite: EFT Level 1 & 2",
          trainerName: "Diksha Wadhwa",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.diksha.id,
          availability: "14 seats",
          availabilityTone: "open",
          price: "₹65,000",
          priceNote: "3-4 day intensive",
          cta: { label: "Register Now →", href: "/eft-training/matrix-reimprinting-workshop-mumbai-june-2025" },
        },
        {
          badge: "Level 1 & 2",
          badgeTone: "default",
          title: "EFT Level 1 & 2 Training",
          description: "The complete EFT certification foundation delivered as a single 3-day intensive.",
          image: media.training4.id,
          imageAlt: "EFT Training Bengaluru",
          levelKey: "l12",
          levelLabel: "Level 1 & 2",
          cityKey: "bengaluru",
          cityLabel: "Bengaluru",
          monthKey: "july",
          monthLabel: "July 2025",
          startDate: "2025-07-11",
          endDate: "2025-07-13",
          format: "In-person",
          dateText: "11–13 July 2025",
          cityText: "Bengaluru",
          schedule: "Fri-Sun · 9:00 am - 6:00 pm",
          venue: "The Oberoi, MG Road",
          requirement: "No prior experience required",
          trainerName: "Dr. Shilpa Gupta",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.shilpa.id,
          availability: "18 seats",
          availabilityTone: "open",
          price: "₹50,000",
          priceNote: "incl. materials",
          cta: { label: "Register Now →", href: "/eft-training/eft-level-1-2-training-bengaluru-july-2025" },
        },
        {
          badge: "Level 3 · Advanced",
          badgeTone: "blue",
          title: "EFT Level 3 Advanced Training",
          description: "A deeper professional training focused on complex cases, scope expansion, and advanced methodologies.",
          image: media.bannerThumb.id,
          imageAlt: "EFT Level 3 New Delhi",
          levelKey: "l3",
          levelLabel: "Level 3",
          cityKey: "delhi",
          cityLabel: "New Delhi",
          monthKey: "july",
          monthLabel: "July 2025",
          startDate: "2025-07-18",
          endDate: "2025-07-20",
          format: "In-person",
          dateText: "18–20 July 2025",
          cityText: "New Delhi",
          schedule: "Fri-Sun · 9:30 am - 6:00 pm",
          venue: "Taj Mahal Hotel, Man Singh Road",
          requirement: "Prerequisite: EFT Level 1 & 2",
          trainerName: "Mridula Nair",
          trainerRole: "Master Trainer · EFTMRA India",
          trainerImage: media.mridula.id,
          availability: "5 seats left",
          availabilityTone: "low",
          price: "₹35,000",
          priceNote: "incl. materials",
          cta: { label: "Register Now →", href: "/eft-training/eft-level-3-advanced-training-new-delhi-july-2025" },
        },
        {
          badge: "Level 1 & 2",
          badgeTone: "default",
          title: "EFT Level 1 & 2 Training",
          description: "Foundation training in an intimate Gurugram setting.",
          image: media.training5.id,
          imageAlt: "EFT Training Gurugram",
          levelKey: "l12",
          levelLabel: "Level 1 & 2",
          cityKey: "gurugram",
          cityLabel: "Gurugram",
          monthKey: "aug",
          monthLabel: "August 2025",
          startDate: "2025-08-08",
          endDate: "2025-08-10",
          format: "In-person",
          dateText: "8–10 August 2025",
          cityText: "Gurugram",
          schedule: "Fri-Sun · 9:00 am - 6:00 pm",
          venue: "Trident Hotel, Golf Course Road",
          requirement: "No prior experience required",
          trainerName: "Leena R Haldar",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.leena.id,
          availability: "20 seats",
          availabilityTone: "open",
          price: "₹50,000",
          priceNote: "incl. materials",
          cta: { label: "Register Now →", href: "/eft-training/eft-level-1-2-training-gurugram-august-2025" },
        },
        {
          badge: "Introductory",
          badgeTone: "default",
          title: "Introduction to EFT Tapping - Free Webinar",
          description: "A short introductory session for newcomers who want to experience EFT before enrolling.",
          image: media.training6.id,
          imageAlt: "Introduction to EFT Webinar",
          levelKey: "intro",
          levelLabel: "Introductory",
          cityKey: "online",
          cityLabel: "Online",
          monthKey: "may",
          monthLabel: "May 2025",
          startDate: "2025-05-24",
          endDate: "2025-05-24",
          format: "Online",
          dateText: "24 May 2025",
          cityText: "Zoom · 11am-1pm IST",
          schedule: "Saturday · 11:00 am - 1:00 pm IST",
          venue: "Zoom - link sent on registration",
          requirement: "Open to all - no experience needed",
          trainerName: "Dr. Shilpa Gupta",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.shilpa.id,
          availability: "42 joined",
          availabilityTone: "open",
          price: "Free",
          priceNote: "Complimentary session",
          cta: { label: "Register Free →", href: "/eft-training/introduction-to-eft-tapping-free-webinar-may-2025" },
        },
        {
          badge: "Level 1 & 2",
          badgeTone: "default",
          title: "EFT Level 1 & 2 Training",
          description: "A late-summer New Delhi cohort for those starting their certification pathway.",
          image: media.training7.id,
          imageAlt: "EFT Training Delhi August",
          levelKey: "l12",
          levelLabel: "Level 1 & 2",
          cityKey: "delhi",
          cityLabel: "New Delhi",
          monthKey: "aug",
          monthLabel: "August 2025",
          startDate: "2025-08-22",
          endDate: "2025-08-24",
          format: "In-person",
          dateText: "22–24 August 2025",
          cityText: "New Delhi",
          schedule: "Fri-Sun · 9:00 am - 6:00 pm",
          venue: "Hyatt Regency, Bhikaji Cama Place",
          requirement: "No prior experience required",
          trainerName: "Saumya Sharma",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.saumya.id,
          availability: "16 seats",
          availabilityTone: "open",
          price: "₹50,000",
          priceNote: "incl. materials",
          cta: { label: "Register Now →", href: "/eft-training/eft-level-1-2-training-new-delhi-august-2025" },
        },
        {
          badge: "Matrix Reimprinting",
          badgeTone: "amber",
          title: "Matrix Reimprinting Workshop",
          description: "An advanced four-day specialist qualification in New Delhi.",
          image: media.bannerThumb.id,
          imageAlt: "Matrix Reimprinting Delhi",
          levelKey: "matrix",
          levelLabel: "Matrix Reimprinting",
          cityKey: "delhi",
          cityLabel: "New Delhi",
          monthKey: "aug",
          monthLabel: "August 2025",
          startDate: "2025-08-29",
          endDate: "2025-09-01",
          format: "In-person",
          dateText: "29 Aug - 1 Sep 2025",
          cityText: "New Delhi",
          schedule: "4-day intensive · 9:30 am - 5:30 pm",
          venue: "The Claridges Hotel, Aurangzeb Road",
          requirement: "Prerequisite: EFT Level 1 & 2",
          trainerName: "Mridula Nair",
          trainerRole: "Master Trainer · EFTMRA India",
          trainerImage: media.mridula.id,
          availability: "12 seats",
          availabilityTone: "open",
          price: "₹65,000",
          priceNote: "4-day intensive",
          cta: { label: "Register Now →", href: "/eft-training/matrix-reimprinting-workshop-new-delhi-august-2025" },
        },
        {
          badge: "Level 1 & 2",
          badgeTone: "default",
          title: "EFT Level 1 & 2 Training",
          description: "A Mumbai cohort currently at capacity with waitlist enrollment open.",
          image: media.training3.id,
          imageAlt: "EFT Training Mumbai",
          levelKey: "l12",
          levelLabel: "Level 1 & 2",
          cityKey: "mumbai",
          cityLabel: "Mumbai",
          monthKey: "july",
          monthLabel: "July 2025",
          startDate: "2025-07-25",
          endDate: "2025-07-27",
          format: "In-person",
          dateText: "25–27 July 2025",
          cityText: "Mumbai",
          schedule: "Fri-Sun · 9:00 am - 6:00 pm",
          venue: "Sofitel BKC, Bandra Kurla Complex",
          requirement: "No prior experience required",
          trainerName: "Diksha Wadhwa",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.diksha.id,
          availability: "Sold out",
          availabilityTone: "full",
          price: "₹50,000",
          priceNote: "incl. materials",
          cta: { label: "Join Waitlist", href: "/contact" },
        },
        {
          badge: "Level 1 & 2",
          badgeTone: "default",
          title: "EFT Level 1 & 2 Training",
          description: "A spring Pune cohort for new students beginning their EFT certification journey with a practical, experiential foundation.",
          image: media.training4.id,
          imageAlt: "EFT Training Pune",
          levelKey: "l12",
          levelLabel: "Level 1 & 2",
          cityKey: "pune",
          cityLabel: "Pune",
          monthKey: "may",
          monthLabel: "May 2026",
          startDate: "2026-05-09",
          endDate: "2026-05-11",
          format: "In-person",
          dateText: "9–11 May 2026",
          cityText: "Pune",
          schedule: "Sat-Mon · 9:00 am - 6:00 pm",
          venue: "Hyatt Regency Pune, Kalyani Nagar",
          requirement: "No prior experience required",
          trainerName: "Dr. Shilpa Gupta",
          trainerRole: "Trainer · EFTMRA India",
          trainerImage: media.shilpa.id,
          availability: "18 seats",
          availabilityTone: "open",
          price: "₹50,000",
          priceNote: "incl. materials",
          cta: { label: "Register Now →", href: "/eft-training/eft-level-1-2-training-pune-may-2026" },
        },
      ],
    },
    {
      blockType: "eftmra-card-grid",
      eyebrow: "About the Programmes",
      title: "What's included in each level",
      variant: "program-levels",
      cards: [
        {
          number: "1&2",
          badge: "Foundation + Practitioner",
          title: "EFT Level 1 & 2",
          description: "The complete EFT certification foundation, delivered as a single 3-day intensive. Learn the full tapping protocol, set-up statements, and professional-level trauma and advanced techniques. Qualifying you to begin your EFTMRA international certification process.",
          subtitle: "None — open to all",
          meta: "⏱ 3-day intensive · ₹50,000",
          accent: "sapphire",
        },
        {
          number: "3",
          badge: "Advanced Practitioner",
          title: "EFT Level 3",
          description: "Deepen your professional practice with specialist skills, deeper trauma work, and advanced client methodologies. Build on your certified foundation and expand the scope and impact of your EFT practice.",
          subtitle: "Completion of EFT Level 1 & 2 + EFTMRA registration",
          meta: "⏱ 3-day intensive · ₹35,000",
          accent: "deep-teal",
        },
        {
          number: "MR",
          badge: "Advanced Specialist",
          title: "Matrix Reimprinting",
          description: "Karl Dawson's revolutionary evolution of EFT. Work with ECHOs to transform the energetic root of trauma and limiting beliefs. Recognised worldwide as the gold standard in advanced EFT practice.",
          subtitle: "Completion of EFT Level 1 & 2",
          meta: "⏱ 3-4 day intensive · ₹65,000",
          accent: "amber",
        },
      ],
    },
  ]);

  await upsertPage(payload, site, "EFT Level 1 & 2 Training", "eft-training-detail", [
    {
      blockType: "eftmra-training-detail",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "EFT Trainings", href: "/eft-training" },
        { label: "EFT Level 1 & 2 Training" },
      ],
      badge: "Foundation · Level 1 & 2",
      title: "EFT Level 1 & 2 Training",
      startDate: "2025-06-13",
      endDate: "2025-06-15",
      levelKey: "l12",
      badgeTone: "default",
      format: "In-person",
      availabilityTone: "low",
      metaItems: [
        { icon: "calendar", primary: "13–15 June 2025", secondary: "Fri–Sun" },
        { icon: "clock", primary: "9:00 am – 6:00 pm daily" },
        { icon: "location", primary: "New Delhi", secondary: "The Leela Palace" },
      ],
      stats: [
        { value: "3", label: "Days Intensive" },
        { value: "500+", label: "Certified Alumni" },
      ],
      posterImage: media.banner.id,
      posterImageAlt: "EFT Level 1 & 2 Training — EFTMRA India",
      aboutEyebrow: "About This Training",
      aboutTitle: "Everything you need to begin your EFT journey",
      aboutParagraphs: [
        {
          content:
            "This 3-day intensive covers the complete EFT certification foundation — from your first tapping sequence through to professional-level trauma work, advanced protocols, and ethical client practice. Delivered by Mridula Nair, Master Trainer of Trainers and Head of EFTMRA India, this is the same internationally recognised curriculum taught by EFTMRA U.K.",
        },
        {
          content:
            "By the end of the training you will be ready to begin your EFTMRA international certification process and, where appropriate, begin working with clients.",
        },
      ],
      outcomesEyebrow: "What You Will Learn",
      outcomesTitle: "Your outcomes from this training",
      outcomes: [
        { label: "The complete EFT Basic Recipe — tapping points, set-up statements and affirmations" },
        { label: "Working with physical symptoms, anxiety, stress and emotional distress" },
        { label: "Advanced protocols — Chasing the Pain, Personal Peace Procedure, Borrowing Benefits" },
        { label: "Working with trauma, core beliefs, and deep emotional patterns" },
        { label: "Surrogate tapping and group tapping techniques" },
        { label: "Professional ethics, boundaries and practitioner responsibilities" },
        { label: "EFTMRA certification pathway — exactly what to do after training" },
      ],
      audienceEyebrow: "Who Should Attend",
      audienceTitle: "This training is right for you if you are…",
      audiences: [
        {
          title: "A Health or Wellness Professional",
          description:
            "Therapists, counsellors, psychologists, coaches, physiotherapists and doctors looking to add a powerful evidence-based tool to their practice.",
        },
        {
          title: "Starting a New Career",
          description:
            "No prior experience required. This training takes complete beginners to certification-ready practitioners in three intensive days.",
        },
        {
          title: "A Personal Growth Seeker",
          description:
            "Someone who has experienced EFT personally and wants to deepen their practice, or bring this healing modality to family, friends and community.",
        },
      ],
      trainerEyebrow: "Your Trainer",
      trainerTitle: "Learn from India's leading EFT Master Trainer",
      trainerName: "Mridula Nair",
      trainerRole: "Master Trainer of Trainers · Head of EFTMRA India",
      trainerBio:
        "Mridula is a counselor and practitioner in several alternative therapies including Bach Flower Remedies, NLP, and Breakthrough Coaching with Timeline Technology. She is an experienced and successful trainer in EFT and Matrix Reimprinting, and leads EFTMRA India as the country's only EFTMRA U.K.-authorised certification academy.",
      trainerImage: media.mridula.id,
      trainerImageAlt: "Mridula Nair",
      trainerCredentials: [
        { label: "EFTMRA U.K. Master Trainer" },
        { label: "NLP Practitioner" },
        { label: "Bach Flower Remedies" },
        { label: "Timeline Technology" },
      ],
      scheduleEyebrow: "Programme Schedule",
      scheduleTitle: "Three days, structured for mastery",
      scheduleDays: [
        {
          dayLabel: "Day 1",
          dayTitle: "Friday",
          dayDate: "13 June 2025",
          theme: "Foundations of EFT",
          topics: [
            { label: "Introduction to EFT and the meridian system" },
            { label: "The Basic Recipe — tapping points and sequences" },
            { label: "Set-up statements and affirmation structure" },
            { label: "Working with everyday stress and anxiety" },
            { label: "Supervised practice pairs and group debrief" },
          ],
        },
        {
          dayLabel: "Day 2",
          dayTitle: "Saturday",
          dayDate: "14 June 2025",
          theme: "Intermediate Protocols",
          topics: [
            { label: "Chasing the Pain and physical symptoms" },
            { label: "Core beliefs, emotional layers and aspects" },
            { label: "Trauma work — safety protocols and approaches" },
            { label: "Surrogate and borrowing benefits techniques" },
            { label: "Working with clients — supervised practice sessions" },
          ],
        },
        {
          dayLabel: "Day 3",
          dayTitle: "Sunday",
          dayDate: "15 June 2025",
          theme: "Professional Practice & Certification",
          topics: [
            { label: "Advanced techniques and specialist applications" },
            { label: "Ethics, professional boundaries and scope of practice" },
            { label: "Case study requirements for EFTMRA certification" },
            { label: "EFTMRA certification pathway — your next steps" },
            { label: "Q&A, integration and closing ceremony" },
          ],
        },
      ],
      certificationEyebrow: "After This Training",
      certificationTitle: "Your path to international certification",
      certificationSteps: [
        {
          stepLabel: "1",
          title: "Complete Level 1 & 2 Training",
          description: "You are here. Receive your EFTMRA India Certificate of Completion at the end of Day 3.",
        },
        {
          stepLabel: "2",
          title: "Register with EFTMRA U.K.",
          description:
            "Register as a student at eftmatrixacademy.com (£99/year). Complete the Code of Ethics, watch training videos and pass the 50-question online test (£15).",
        },
        {
          stepLabel: "3",
          title: "Build Your Practice Hours",
          description: "Complete 5 swap sessions with fellow students and submit 10 case studies. Arrange appropriate practitioner insurance.",
        },
        {
          stepLabel: "✓",
          title: "Receive Your International Certification",
          description:
            "Click 'Upgrade Me' in your EFTMRA Student Area — your profile goes live on the global EFTMRA directory, recognised in 60+ countries.",
          highlight: true,
        },
      ],
      venueEyebrow: "Venue",
      venueTitle: "Training location",
      venueName: "The Leela Palace, New Delhi",
      venueAddress: "Diplomatic Enclave, Chanakyapuri, New Delhi 110023",
      venueImage: media.training.id,
      venueImageAlt: "The Leela Palace New Delhi",
      venueNotes: [
        { icon: "room", label: "Dedicated training room — air-conditioned and fully set up for the day" },
        { icon: "location", label: "Nearest Metro: Udyog Bhawan (Yellow Line) — 10 mins walk" },
        { icon: "info", label: "Lunch, tea & coffee included on all 3 days — dietary requirements noted at registration" },
      ],
      price: "₹50,000",
      priceLabel: "per person",
      successTitle: "You're registered!",
      successMessage:
        "Thank you — we've received your registration for the EFT Level 1 & 2 Training, New Delhi.\n\nYou'll receive a confirmation email within 24 hours with payment instructions and everything you need for the training.",
    },
  ]);

  await upsertPage(payload, site, "Our Team", "our-team", [
    {
      blockType: "eftmra-page-header",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "About EFTMRA", href: "/about" },
        { label: "Our Team" },
      ],
      eyebrow: "Our Team",
      title: "Meet the Trainers Behind EFTMRA India.",
      description: "Every trainer at EFTMRA India is certified directly by EFTMRA U.K. and brings years of professional EFT practice alongside their teaching expertise.",
      badges: [
        { label: "EFTMRA U.K. Certified", tone: "sapphire" },
        { label: "9 Accredited Trainers", tone: "amber" },
        { label: "Pan India · 5 Cities", tone: "ice" },
      ],
      media: media.aboutGroup.id,
      mediaAlt: "EFTMRA India training group",
      layout: "media",
    },
    {
      blockType: "eftmra-card-grid",
      eyebrow: "Our Trainers",
      title: "People who live and breathe EFT.",
      description: "Each of our trainers has walked the path you are about to take — as practitioners, as clients, and now as educators.",
      variant: "people",
      cards: [
        { title: "Mridula Nair", subtitle: "Master Trainer of Trainers · Head of EFTMRA India", image: media.mridula.id, accent: "deep-teal" },
        { title: "Dr. Shilpa Gupta", subtitle: "Trainer · EFTMRA India", image: media.shilpa.id, accent: "sapphire" },
        { title: "Leena R Haldar", subtitle: "Trainer · EFTMRA India", image: media.leena.id, accent: "amber" },
        { title: "Saumya Sharma", subtitle: "Trainer · EFTMRA India", image: media.saumya.id, accent: "ice" },
        { title: "Diksha Wadhwa", subtitle: "Trainer · EFTMRA India", image: media.diksha.id, accent: "sapphire" },
        { title: "Meetu Sehgal", subtitle: "Trainer · EFTMRA India", image: media.meetu.id, accent: "amber" },
        { title: "Divya Srivastava", subtitle: "Trainer · EFTMRA India", image: media.divya.id, accent: "deep-teal" },
        { title: "Fatema Zavery", subtitle: "Trainer · EFTMRA India", image: media.fatema.id, accent: "sapphire" },
        { title: "Seema Gorowara", subtitle: "Trainer · EFTMRA India", image: media.seema.id, accent: "amber" },
      ],
    },
    {
      blockType: "eftmra-content-section",
      eyebrow: "Accreditation",
      title: "Every trainer is certified directly by EFTMRA U.K.",
      description:
        "All EFTMRA India trainers hold active EFTMRA U.K. certifications and are authorised to deliver the official EFTMRA curriculum.",
      paragraphs: [
        {
          content:
            "The same accreditation marks that appear on Karl Dawson's certifications appear on yours when you train through the official pathway.",
        },
      ],
    },
    {
      blockType: "eftmra-final-cta",
      title: "Learn directly from these trainers.",
      subtitle: "Train with us",
      description: "Browse upcoming EFT training dates and begin your journey toward an internationally recognised certification.",
      primaryCTA: { label: "View Upcoming Trainings", href: "/eft-training" },
      secondaryCTA: { label: "About EFTMRA India", href: "/about" },
    },
  ]);

  await upsertPage(payload, site, "Find an EFT Practitioner", "practitioners", [
    {
      blockType: "eftmra-page-header",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Practitioners Directory" },
      ],
      eyebrow: "Practitioners Directory",
      title: "Find a certified EFT Practitioner near you.",
      description: "Every practitioner listed here is registered with EFTMRA India and holds an internationally recognised certification. Browse by category to find the right support for your healing journey.",
    },
    {
      blockType: "eftmra-practitioners",
      layoutVariant: "directory",
      title: "Certified EFT practitioners across India.",
      registerCTA: { label: "Register as Practitioner", href: "/register-practitioner" },
      practitioners: [
        {
          name: "Aadya Gupta",
          role: "EFT Practitioner",
          image: media.aadya.id,
          profileHref: "/practitioner-aadya-gupta",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "online",
          cityLabel: "Online",
          specialties: [{ label: "Anxiety" }, { label: "Stress" }, { label: "Trauma" }],
          hours: "1 PM - 7 PM",
          accent: "deep-teal",
        },
        {
          name: "Aakriti Todi",
          role: "EFT Practitioner",
          image: media.aakriti.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "guwahati",
          cityLabel: "Guwahati",
          specialties: [{ label: "EFT Tapping" }, { label: "Emotional Healing" }, { label: "Graphology" }],
          hours: "9:30 AM - 4 PM",
          accent: "sapphire",
        },
        {
          name: "Aastha Khurana",
          role: "EFT Practitioner",
          image: media.aastha.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "online",
          cityLabel: "Online",
          specialties: [{ label: "EFT Tapping" }, { label: "Stress" }, { label: "Healing" }],
          hours: "10 AM - 6 PM",
          accent: "ice-teal",
        },
        {
          name: "Aayushi Mittal",
          role: "EFT Practitioner",
          image: media.aayushi.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "delhi",
          cityLabel: "New Delhi",
          specialties: [{ label: "EFT Tapping" }, { label: "Emotional Healing" }, { label: "Wellbeing" }],
          hours: "10 AM - 7 PM",
          accent: "amber",
        },
        {
          name: "Adiba Khursheed",
          role: "EFT Practitioner",
          image: media.adiba.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "online",
          cityLabel: "Online",
          specialties: [{ label: "EFT Tapping" }, { label: "Anxiety" }, { label: "Stress" }],
          hours: "10 AM - 7 PM",
          accent: "sapphire",
        },
        {
          name: "Aditi Bhasin",
          role: "EFT & Matrix Reimprinting",
          image: media.aditi.id,
          profileHref: "#",
          category: "matrix",
          categoryLabel: "Matrix Reimprinting",
          cityKey: "online",
          cityLabel: "Online",
          specialties: [{ label: "Matrix Reimprinting" }, { label: "EFT" }, { label: "Limiting Beliefs" }],
          hours: "10 AM - 5 PM",
          accent: "teal-gold",
        },
        {
          name: "Adrija Chakraborty",
          role: "EFT Practitioner",
          image: media.adrija.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "noida",
          cityLabel: "Noida",
          specialties: [{ label: "EFT Tapping" }, { label: "Emotional Healing" }, { label: "Wellness" }],
          hours: "11 AM - 5 PM",
          accent: "calm-sky",
        },
        {
          name: "Akangsha Bali",
          role: "EFT Practitioner",
          image: media.akangsha.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "gurugram",
          cityLabel: "Gurugram",
          specialties: [{ label: "EFT Tapping" }, { label: "Stress" }, { label: "Trauma" }],
          hours: "10 AM - 8 PM",
          accent: "deep-teal",
        },
        {
          name: "Alamelu Harish",
          role: "EFT & Matrix Reimprinting",
          image: media.alamelu.id,
          profileHref: "#",
          category: "matrix",
          categoryLabel: "Matrix Reimprinting",
          cityKey: "bengaluru",
          cityLabel: "Bengaluru",
          specialties: [{ label: "Matrix Reimprinting" }, { label: "EFT" }, { label: "Healing" }],
          hours: "10 AM - 5 PM",
          accent: "ice-teal",
        },
        {
          name: "Anandmai",
          role: "EFT Practitioner",
          image: media.anandmai.id,
          profileHref: "#",
          category: "eft-practitioner",
          categoryLabel: "EFT Practitioner",
          cityKey: "delhi",
          cityLabel: "New Delhi",
          specialties: [{ label: "EFT Tapping" }, { label: "Mindfulness" }, { label: "Healing" }],
          hours: "11 AM - 5 PM",
          accent: "amber",
        },
      ],
    },
  ]);

  await upsertPage(payload, site, "Aadya Gupta", "practitioner-aadya-gupta", [
    {
      blockType: "eftmra-profile-hero",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Practitioners", href: "/practitioners" },
        { label: "Aadya Gupta" },
      ],
      eyebrow: "EFT Practitioner · EFTMRA India",
      title: "Aadya Gupta",
      tagline: "Helping you heal anxiety, stress and trauma through the science of tapping. Based in New Delhi, available online across India.",
      image: media.aadya.id,
      imageAlt: "Aadya Gupta",
      badge: "EFT Practitioner",
      chips: [
        { label: "New Delhi" },
        { label: "English, Hindi" },
        { label: "1 pm – 7 pm" },
        { label: "Online & In-person" },
      ],
    },
    {
      blockType: "eftmra-content-section",
      eyebrow: "About",
      title: "About Aadya",
      paragraphs: [
        {
          content:
            "I am a certified EFT Practitioner registered with EFTMRA India, with a deep commitment to helping individuals move through anxiety, stress, trauma, and emotional overwhelm — gently and effectively.",
        },
        {
          content:
            "I work with clients both online and in-person in New Delhi, holding a safe, compassionate space where real healing can happen.",
        },
        {
          content:
            "I conduct sessions in English and Hindi, and I am available for individual sessions, group workshops, and corporate wellness programmes.",
        },
      ],
    },
    {
      blockType: "eftmra-content-section",
      eyebrow: "Areas of Practice",
      title: "What I help with",
      tags: [
        { label: "Anxiety & Stress" },
        { label: "Trauma & PTSD" },
        { label: "Grief & Loss" },
        { label: "Relationships" },
        { label: "Phobias & Fears" },
        { label: "Self-Worth" },
        { label: "Corporate Stress" },
        { label: "Sleep Issues" },
      ],
    },
    {
      blockType: "eftmra-content-section",
      eyebrow: "Approach",
      title: "How I work",
      paragraphs: [
        {
          content:
            "Every session begins with a conversation — understanding what you are carrying, what you have tried, and what you most want to change.",
        },
        {
          content:
            "I draw primarily on EFT tapping, working with the body's energy system to gently release the emotional charge attached to past events and present-day triggers.",
        },
      ],
    },
    {
      blockType: "eftmra-content-section",
      eyebrow: "Credentials",
      title: "Certification & Membership",
      checklist: [
        { label: "EFT Practitioner — Level 1 & 2", tone: "sapphire" },
        { label: "Certified 2022 · Membership No. EFTMRA-IN-00142", tone: "midnight" },
        { label: "Verified EFTMRA India member", tone: "amber" },
      ],
    },
    {
      blockType: "eftmra-reviews",
      eyebrow: "Client Reviews",
      title: "What clients say",
      summaryScore: "4.8",
      summaryCount: "38 reviews",
      reviews: [
        {
          authorName: "Preethi M.",
          dateLabel: "March 2025",
          quote:
            "I came to Aadya with years of unresolved anxiety that had started affecting my work. After just three sessions I noticed a significant shift.",
          rating: 5,
        },
        {
          authorName: "Rajan T.",
          dateLabel: "January 2025",
          quote:
            "Aadya creates a grounded, patient space. The sessions felt both evidence-based and deeply human.",
          rating: 5,
        },
      ],
    },
  ]);

  await upsertPage(payload, site, "Register as a Practitioner", "register-practitioner", [
    {
      blockType: "eftmra-page-header",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Practitioners", href: "/practitioners" },
        { label: "Register" },
      ],
      eyebrow: "Join the Directory",
      title: "Register as a Certified Practitioner",
      description: "List your practice on India's only internationally accredited EFT directory. Reviewed and published within 3–5 working days of submission.",
    },
    {
      blockType: "eftmra-practitioner-registration",
      steps: [
        { label: "Personal Details", sublabel: "Name, photo, bio" },
        { label: "Certification", sublabel: "Level & membership" },
        { label: "Practice Details", sublabel: "Location, fees, specialties" },
      ],
      successTitle: "Application submitted!",
      successMessage: "Thank you for registering. Our team will review your details and certificate within 3–5 working days.\nYou'll receive a confirmation email once your profile is live on the directory.",
      primaryCTA: { label: "Back to Directory", href: "/practitioners" },
      secondaryCTA: { label: "Return Home", href: "/" },
    },
  ]);

  const seededPractitioners = await payload.find({
    collection: "practitioners",
    where: {
      site: {
        equals: site.id,
      },
    },
    limit: 100,
  });

  for (const practitioner of seededPractitioners.docs as any[]) {
    if (!practitioner?.reviewsList?.length) continue;

    for (const [index, review] of practitioner.reviewsList.entries()) {
      await upsertPractitionerReview(payload, site, {
        practitioner: practitioner.id,
        status: "published",
        authorName: review.authorName,
        authorRole: review.authorRole,
        dateLabel: review.dateLabel,
        quote: review.quote,
        rating: review.rating ?? 5,
        displayOrder: index + 1,
      });
    }
  }

  const seededTrainings = await payload.find({
    collection: "trainings",
    where: {
      site: {
        equals: site.id,
      },
    },
    limit: 100,
  });

  for (const training of seededTrainings.docs as any[]) {
    const trainingReviewSeed = trainingReviewSeeds.find((seed) => seed.slug === training.slug);
    if (!trainingReviewSeed?.reviews.length) continue;

    for (const [index, review] of trainingReviewSeed.reviews.entries()) {
      await upsertTrainingReview(payload, site, {
        training: training.id,
        status: "published",
        authorName: review.authorName,
        authorRole: review.authorRole,
        dateLabel: review.dateLabel,
        quote: review.quote,
        rating: review.rating ?? 5,
        displayOrder: index + 1,
      });
    }
  }

  await upsertTestimonial(payload, site, {
    name: "Priya Mehta",
    slug: "priya-mehta-video",
    status: "published",
    type: "video",
    featured: true,
    displayOrder: 1,
    roleLabel: "Psychologist · Mumbai",
    videoLabel: "Video testimonials coming soon",
  });
  await upsertTestimonial(payload, site, {
    name: "Rahul Verma",
    slug: "rahul-verma-video",
    status: "published",
    type: "video",
    displayOrder: 2,
    roleLabel: "Life Coach · New Delhi",
    videoLabel: "Video testimonials coming soon",
  });
  await upsertTestimonial(payload, site, {
    name: "Anjali Desai",
    slug: "anjali-desai-video",
    status: "published",
    type: "video",
    displayOrder: 3,
    roleLabel: "Clinical Psychologist · Pune",
    videoLabel: "Video testimonials coming soon",
  });
  await upsertTestimonial(payload, site, {
    name: "Kavitha Pillai",
    slug: "kavitha-pillai-video",
    status: "published",
    type: "video",
    displayOrder: 4,
    roleLabel: "NLP Coach · Hyderabad",
    videoLabel: "Video testimonials coming soon",
  });
  await upsertTestimonial(payload, site, {
    name: "Dr. Nikhil Sharma",
    slug: "dr-nikhil-sharma-video",
    status: "published",
    type: "video",
    displayOrder: 5,
    roleLabel: "General Physician · Mumbai",
    videoLabel: "Video testimonials coming soon",
  });
  await upsertTestimonial(payload, site, {
    name: "Meera Nambiar",
    slug: "meera-nambiar-video",
    status: "published",
    type: "video",
    displayOrder: 6,
    roleLabel: "EFT Practitioner · Chennai",
    videoLabel: "Video testimonials coming soon",
  });
  await upsertTestimonial(payload, site, {
    name: "Dr. Sunita Rao",
    slug: "dr-sunita-rao-video",
    status: "published",
    type: "video",
    displayOrder: 7,
    roleLabel: "Psychiatrist · Bengaluru",
    videoLabel: "Video testimonials coming soon",
  });

  await upsertTestimonial(payload, site, {
    name: "Priya Mehta",
    slug: "priya-mehta-written",
    status: "published",
    type: "written",
    displayOrder: 1,
    roleLabel: "Psychologist · Mumbai",
    rating: 5,
    quote:
      "The Level 1 & 2 training with Mridula completely changed how I work with clients. Within a week of completing the course, I was using EFT in every session.",
  });
  await upsertTestimonial(payload, site, {
    name: "Rahul Verma",
    slug: "rahul-verma-written",
    status: "published",
    type: "written",
    displayOrder: 2,
    roleLabel: "Life Coach · New Delhi",
    rating: 5,
    quote:
      "I came in as a complete beginner with no therapy background. By Day 3, I was running full tapping sessions on my fellow participants. Mridula is an exceptional trainer.",
  });
  await upsertTestimonial(payload, site, {
    name: "Anjali Desai",
    slug: "anjali-desai-written",
    status: "published",
    type: "written",
    displayOrder: 3,
    roleLabel: "Clinical Psychologist · Pune",
    rating: 5,
    quote:
      "The Level 3 advanced training took my practice to a completely different dimension. The depth and rigour here is unmatched by any other training I have attended in India.",
  });
  await upsertTestimonial(payload, site, {
    name: "Kavitha Pillai",
    slug: "kavitha-pillai-written",
    status: "published",
    type: "written",
    displayOrder: 4,
    roleLabel: "NLP Coach · Hyderabad",
    rating: 5,
    quote:
      "I enrolled to help my clients better. I ended up healing myself in the process. Mridula holds the room beautifully. It is safe, deep, and transformational.",
  });
  await upsertTestimonial(payload, site, {
    name: "Dr. Nikhil Sharma",
    slug: "dr-nikhil-sharma-written",
    status: "published",
    type: "written",
    displayOrder: 5,
    roleLabel: "General Physician · Mumbai",
    rating: 5,
    quote:
      "As a doctor, I was sceptical. By the end of Day 2 I was a convert. The scientific basis of EFT is solid, and what I witnessed in the practice room was extraordinary.",
  });
  await upsertTestimonial(payload, site, {
    name: "Meera Nambiar",
    slug: "meera-nambiar-written",
    status: "published",
    type: "written",
    displayOrder: 6,
    roleLabel: "EFT Practitioner · Chennai",
    rating: 5,
    quote:
      "Being listed on the EFTMRA India practitioners directory has genuinely grown my practice. Clients come to me already trusting the credential.",
  });

  await upsertPage(payload, site, "Testimonials", "testimonials", [
    {
      blockType: "eftmra-testimonial-listing",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "About EFTMRA", href: "/about" },
        { label: "Testimonials" },
      ],
      title: "Voices from those who transformed.",
      description: "Practitioners, psychologists, and coaches; in their own words.",
      featuredBadgeLabel: "Featured",
      videoEyebrow: "More Stories",
      writtenEyebrow: "People who trained with us",
      writtenTitle: "What our students say",
      site: site.id,
    },
  ]);

  console.log("All required EFTMRA pages have been seeded into Payload CMS.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
