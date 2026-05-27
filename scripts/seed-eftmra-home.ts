import "dotenv/config";
import path from "path";
import { getPayload } from "payload";
import configPromise from "../payload.config";

type MediaDoc = {
  id: number;
  filename?: string | null;
};

type SiteDoc = {
  id: number;
  slug: string;
};

type PageDoc = {
  id: number;
  title: string;
  slug: string;
};

const imageRoot = path.resolve(process.cwd(), "..", "..", "EFTMRAHTML", "images");

async function ensureMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
  alt?: string,
) {
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

  const filePath = path.join(imageRoot, filename);
  const created = await payload.create({
    collection: "media",
    data: {
      alt: alt ?? null,
    },
    filePath,
  });

  return created as MediaDoc;
}

async function main() {
  const payload = await getPayload({ config: configPromise });

  const [
    heroImage,
    certificationImage,
    mridula,
    shilpa,
    leena,
    diksha,
    divya,
    saumya,
    fatema,
    aadya,
    aakriti,
    aastha,
    aayushi,
    adiba,
    aditi,
    akangsha,
    alamelu,
  ] = await Promise.all([
    ensureMedia(payload, "EFT-tapping.jpg", "EFT tapping session"),
    ensureMedia(payload, "EFT-training.png", "EFTMRA India training session"),
    ensureMedia(payload, "Mridula-Photo.webp", "Mridula Nair"),
    ensureMedia(payload, "Shilpa.webp", "Dr. Shilpa Gupta"),
    ensureMedia(payload, "leena-R-Haldar.webp", "Leena R Haldar"),
    ensureMedia(payload, "Diksha.webp", "Diksha Wadhwa"),
    ensureMedia(payload, "Divya-Srivastava.webp", "Divya Srivastava"),
    ensureMedia(payload, "Saumya-Sharma.webp", "Saumya Sharma"),
    ensureMedia(payload, "Fatema-Zavery.webp", "Fatema Zavery"),
    ensureMedia(payload, "AadyaGupta1.png", "Aadya Gupta"),
    ensureMedia(payload, "Aakriti-Todi.webp", "Aakriti Todi"),
    ensureMedia(payload, "Aastha-Khurana-scaled.webp", "Aastha Khurana"),
    ensureMedia(payload, "Aayushi-Mittal.webp", "Aayushi Mittal"),
    ensureMedia(payload, "Adiba-Khursheed.webp", "Adiba Khursheed"),
    ensureMedia(payload, "Aditi-Bhasin.webp", "Aditi Bhasin"),
    ensureMedia(payload, "Akangsha.webp", "Akangsha Bansal"),
    ensureMedia(payload, "Alamelu-Harish.webp", "Alamelu Harish"),
  ]);

  const siteResult = await payload.find({
    collection: "sites",
    where: {
      slug: {
        equals: "/",
      },
    },
    limit: 1,
  });

  let site = siteResult.docs[0] as SiteDoc | undefined;

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

  if (site) {
    site = (await payload.update({
      collection: "sites",
      id: site.id,
      data: siteData,
    })) as SiteDoc;
  } else {
    site = (await payload.create({
      collection: "sites",
      data: siteData,
    })) as SiteDoc;
  }

  const layout: any[] = [
    {
      blockType: "eftmra-hero",
      eyebrow: "New Delhi · Mumbai · Bengaluru · Gurugram · Pan India",
      title: "Every Mind Deserves World-Class Healing.",
      titleHighlight: "World-Class",
      description:
        "India's only internationally accredited EFT academy, authorised by EFTMRA U.K., founded by Karl Dawson, one of only 28 EFT Founding Masters in the world.",
      primaryCTA: {
        label: "Explore Our Courses →",
        href: "/eft-training",
      },
      videoLink: {
        label: "Watch: What is Tapping? (2 min)",
        href: "#what-is-eft",
      },
      heroImage: heroImage.id,
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
        "Emotional Freedom Technique (EFT), also called Tapping, sends a direct calming signal to the brain's threat-response centre by gently tapping on acupressure points while focusing on an emotional issue. It's not alternative medicine. It's neuroscience, validated in over 300 peer-reviewed studies, with measurable results often in a single session.",
      scienceLink: {
        label: "Read the science",
        href: "/about",
      },
      scienceCards: [
        {
          number: "01",
          metric: "Amygdala",
          title: "Calms the stress alarm",
          description:
            "Tapping signals safety to the brain's threat centre, quieting the fight-or-flight response that anxiety and trauma keep switched on.",
          accent: "blue",
        },
        {
          number: "02",
          metric: "43%",
          title: "Lowers cortisol by up to 43%",
          description:
            "Clinical trials show EFT measurably reduces the body's primary stress hormone, producing both emotional and physical relief.",
          accent: "amber",
        },
        {
          number: "03",
          metric: "Mind & Body",
          title: "Shifts the nervous system",
          description:
            "Move from fight-or-flight to rest-and-repair. Your whole body responds, not just your mind. Results feel immediate and lasting.",
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
        "There are many EFT workshops in India. Only one offers a globally recognised certification — EFTMRA India, the sole academy authorised by EFTMRA U.K., in the direct lineage of Karl Dawson, one of only 28 EFT Founding Masters personally certified by Gary Craig.",
      introImage: certificationImage.id,
      introImageAlt: "EFTMRA India EFT training session",
      highlights: [
        {
          number: "01",
          title: "International Recognition",
          description: "Certification accepted globally, accredited by EFTMRA U.K.",
        },
        {
          number: "02",
          title: "Karl Dawson's Lineage",
          description: "Learn from the gold standard of EFT mastery worldwide.",
        },
        {
          number: "03",
          title: "Clear Pathway",
          description: "Transparent levels from beginner to internationally certified practitioner.",
        },
        {
          number: "04",
          title: "Ongoing Community",
          description: "Swap sessions, mentoring circles, and practitioner development.",
        },
      ],
      missionEyebrow: "Our Mission",
      missionTitle: "Every Indian deserves access to world-class emotional healing.",
      missionParagraphs: [
        {
          content:
            "India is home to 1.4 billion people. Anxiety, depression, trauma, and stress touch virtually every family, yet internationally accredited emotional healing practitioners are still rare. EFTMRA India was founded to change that.",
        },
        {
          content:
            "We are the only academy in India authorised by EFTMRA U.K. to certify practitioners to global standards — building a generation of skilled, ethical, and compassionate EFT practitioners for every community across this country.",
        },
      ],
      missionEmphasis: "Because every life deserves world-class care.",
      primaryCTA: {
        label: "Read our full story",
        href: "/about",
      },
      secondaryCTA: {
        label: "Meet the trainers",
        href: "/our-team",
      },
      teamMembers: [
        { name: "Mridula Nair", role: "Head & Master Trainer of Trainers", image: mridula.id },
        { name: "Dr. Shilpa Gupta", role: "Master Trainer of Trainers", image: shilpa.id },
        { name: "Leena R Haldar", role: "Master Trainer of Trainers", image: leena.id },
        { name: "Diksha Wadhwa", role: "Master Trainer", image: diksha.id },
        { name: "Divya Srivastava", role: "Trainer", image: divya.id },
        { name: "Saumya Sharma", role: "Master Trainer", image: saumya.id },
        { name: "Fatema Zavery", role: "Trainer", image: fatema.id },
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
          description:
            "A 3-day intensive covering the complete EFT tapping protocol, from set-up statements and basic sequences through to professional-level trauma work, advanced protocols, and ethical practice. You leave ready to work with clients and begin your certification journey.",
          meta: "New Delhi · Mumbai · Bengaluru · Gurugram · Duration: 3 days",
          tone: "default",
        },
        {
          marker: "2",
          title: "Register with EFTMRA & Complete Online Requirements",
          subtitle: "Go official.",
          description:
            "Register as a student at eftmatrixacademy.com (£99/year membership). Complete the EFTMRA Code of Ethics, watch approximately 3 hours of training videos in the student area, and pass the 50-question online test (£15 fee) — all within your own time.",
          meta: "Online · Self-paced",
          tone: "default",
        },
        {
          marker: "3",
          title: "Gain Supervised Practice",
          subtitle: "Build your mastery.",
          description:
            "Complete a minimum of 5 swap sessions with fellow students through your course peers or the EFTMRA Facebook Swap Group. Submit 10 case studies to EFTMRA documenting your client work. Arrange appropriate practitioner insurance.",
          meta: "Ongoing · Online & in-person",
          tone: "default",
        },
        {
          marker: "4",
          title: "Upgrade to Certified Practitioner",
          subtitle: "Receive your international certification.",
          description:
            "Once you pass the test, click 'Upgrade Me' in the EFTMRA Student Area at no extra cost. Your practitioner profile goes live on the EFTMRA directory — recognised globally.",
          meta: "Credential: EFTMRA Certified EFT Practitioner",
          tone: "default",
        },
        {
          marker: "★",
          title: "Matrix Reimprinting",
          subtitle: "Karl Dawson's evolution of EFT.",
          description:
            "Work at the deepest level of emotional healing with ECHOs (Energy Consciousness Holograms) to transform the root imprints of trauma and limiting beliefs. The gold standard in advanced EFT practice. Duration: 3–4 days.",
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
          description:
            "Psychologists, counsellors, coaches, physiotherapists, and doctors worldwide are integrating EFT. Our certification gives you clinical credibility you can use from day one.",
        },
        {
          title: "Someone beginning a new career as a Practitioner",
          description:
            "No prior experience needed. Our structured pathway takes you from beginner to internationally certified practitioner.",
        },
        {
          title: "An individual who experienced EFT and wants to share it",
          description:
            "Many of our finest practitioners began as clients. We'll show you how to turn that experience into a profession.",
        },
      ],
      audienceCTA: {
        label: "Not sure which path fits you? Talk to us →",
        href: "/contact",
      },
    },
    {
      blockType: "eftmra-courses",
      eyebrow: "Training Programmes",
      title: "Find the right course for where you are.",
      description:
        "EFTMRA-certified trainers across India lead all courses. Each level is a step toward your internationally recognised certification.",
      courses: [
        {
          badge: "Foundation + Practitioner · No experience needed",
          badgeTone: "default",
          title: "EFT Level 1 & 2",
          description:
            "The complete EFT certification foundation, delivered as a single 3-day intensive. Learn the full tapping protocol, set-up statements, and professional-level trauma and advanced techniques. Completing this course qualifies you to begin your EFTMRA international certification process.",
          location: "New Delhi · Mumbai · Bengaluru · Gurugram",
          cta: {
            label: "View Dates & Enroll →",
            href: "/eft-training",
          },
        },
        {
          badge: "Advanced Practitioner · Requires Level 1 & 2",
          badgeTone: "blue",
          title: "EFT Level 3",
          description:
            "Deepen your professional practice with Level 3. Build on your certified foundation with specialist skills, deeper trauma work, and advanced client methodologies — expanding the scope and impact of your EFT practice.",
          location: "Multiple locations",
          cta: {
            label: "View Dates & Enroll →",
            href: "/eft-training",
          },
        },
        {
          badge: "Advanced Specialist · Requires Level 1 & 2",
          badgeTone: "amber",
          title: "Matrix Reimprinting",
          description:
            "Karl Dawson's revolutionary evolution of EFT — the most advanced emotional healing qualification available. Work with ECHOs (Energy Consciousness Holograms) to transform the energetic root of trauma and limiting beliefs. Recognised worldwide as the gold standard in advanced EFT practice.",
          location: "Select locations",
          cta: {
            label: "View Dates & Enroll →",
            href: "/eft-training",
          },
        },
      ],
      sectionCTA: {
        label: "See All Upcoming Courses & Dates →",
        href: "/eft-training",
      },
    },
    {
      blockType: "eftmra-practitioners",
      eyebrow: "Find a Practitioner",
      title: "Connect with a certified EFT practitioner near you.",
      description:
        "Every practitioner in our directory is trained and certified by EFTMRA India and EFTMRA U.K., committed to ethical, evidence-based practice.",
      cta: {
        label: "View All Practitioners →",
        href: "/practitioners",
      },
      practitioners: [
        { name: "Aadya Gupta", role: "EFT Practitioner", image: aadya.id, accent: "deep-teal" },
        { name: "Aakriti Todi", role: "EFT Practitioner", image: aakriti.id, accent: "deep-teal" },
        { name: "Aastha Khurana", role: "EFT Practitioner", image: aastha.id, accent: "sapphire" },
        { name: "Aayushi Mittal", role: "EFT Practitioner", image: aayushi.id, accent: "amber" },
        { name: "Adiba Khursheed", role: "EFT Practitioner", image: adiba.id, accent: "calm-sky" },
        { name: "Aditi Bhasin", role: "EFT & Matrix Reimprinting", image: aditi.id, accent: "teal-gold" },
        { name: "Akangsha Bansal", role: "EFT Practitioner", image: akangsha.id, accent: "deep-teal" },
        { name: "Alamelu Harish", role: "EFT & Matrix Reimprinting", image: alamelu.id, accent: "ice-teal" },
      ],
    },
    {
      blockType: "eftmra-testimonials",
      eyebrow: "What Our Practitioners Say",
      title: "Lives changed. Practices built.",
      testimonials: [
        {
          quote:
            "I came as a psychologist looking to add one tool. EFT is now the foundation of everything I do with clients.",
          authorName: "Practitioner Name",
          authorRole: "Mumbai",
          authorImage: aayushi.id,
          rating: 5,
        },
        {
          quote:
            "I had no prior experience. EFTMRA India's Level 1 & 2 changed my life. I now run a full-time EFT practice.",
          authorName: "Practitioner Name",
          authorRole: "Bengaluru",
          authorImage: aadya.id,
          rating: 5,
        },
        {
          quote:
            "The Matrix Reimprinting course was world-class. I travel internationally to see clients now.",
          authorName: "Practitioner Name",
          authorRole: "Gurugram",
          authorImage: alamelu.id,
          rating: 5,
        },
      ],
    },
    {
      blockType: "eftmra-final-cta",
      title: "Every mind deserves world-class healing.",
      subtitle: "Yours included. Begin with one step.",
      description:
        "Join India's only internationally accredited EFT academy. Train with us, and carry this life-changing skill to the people who need it most.",
      primaryCTA: {
        label: "Explore Courses",
        href: "/eft-training",
      },
      secondaryCTA: {
        label: "Talk to Us First",
        href: "/contact",
      },
    },
  ];

  const pageResult = await payload.find({
    collection: "pages",
    where: {
      and: [
        {
          slug: {
            equals: "/",
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

  const pageData: any = {
    title: "Home",
    slug: "/",
    site: site.id,
    layout,
  };

  let page: PageDoc;

  if (pageResult.docs[0]) {
    page = (await payload.update({
      collection: "pages",
      id: pageResult.docs[0].id,
      data: pageData,
    })) as unknown as PageDoc;
    console.log(`Updated page ${page.id} (${page.slug}) for site ${site.slug}`);
  } else {
    page = (await payload.create({
      collection: "pages",
      data: pageData,
    })) as unknown as PageDoc;
    console.log(`Created page ${page.id} (${page.slug}) for site ${site.slug}`);
  }

  console.log("EFTMRA homepage layout is ready in Payload admin.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
