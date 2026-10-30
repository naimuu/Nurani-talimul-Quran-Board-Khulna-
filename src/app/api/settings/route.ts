import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── Cover-display flags are stored as a JSON PageContent record ───────────────
// This avoids needing `npx prisma generate` for new BoardSettings fields.
const FLAGS_SLUG = 'cover-display-flags';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

function sanitizeText(str?: string): string {
  if (!str) return "";
  return str
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\uFE00-\uFE0F]/g, "")
    .replace(/অডার/g, "অর্ডার")
    .trim();
}

function sanitizeHeroSlides(slides?: HeroSlide[]): HeroSlide[] {
  if (!Array.isArray(slides)) return [];
  return slides.map((s) => ({
    ...s,
    title: sanitizeText(s.title),
    subtitle: sanitizeText(s.subtitle),
    description: sanitizeText(s.description),
    buttonText: sanitizeText(s.buttonText),
  }));
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-default-1",
    imageUrl: "/images/hero/slide1.jpg",
    title: "নূরানী বোর্ড খুলনায় স্বাগতম",
    subtitle: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    description: "আধুনিক পদ্ধতির সাথে বিশুদ্ধ কোরআনি শিক্ষায় নতুন প্রজন্মকে ক্ষমতায়ন করা।",
    buttonText: "আরও জানুন",
    buttonLink: "/about"
  },
  {
    id: "slide-default-2",
    imageUrl: "/images/hero/slide2.jpg",
    title: "আপনার মাদরাসা এখনই নিবন্ধন করুন",
    subtitle: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    description: "আজই আমাদের মাদরাসার বিশাল নেটওয়ার্কে যুক্ত হোন এবং জ্ঞান অর্জনে নিবেদিত একটি ক্রমবর্ধমান সম্প্রদায়ের অংশ হন।",
    buttonText: "মাদরাসা নিবন্ধন করুন",
    buttonLink: "/register"
  },
  {
    id: "slide-default-3",
    imageUrl: "/images/hero/slide3.jpg",
    title: "সহজ ও দ্রুত প্রকাশনা ও প্রশ্নপত্র সেবা",
    subtitle: "অনলাইনে বই ও প্রশ্নপত্র সেটের অর্ডার দিন এবং দ্রুত ডেলিভারি গ্রহণ করুন।",
    description: "অনলাইনে বই ও প্রশ্নপত্র সেটের অর্ডার দিন এবং দ্রুত ডেলিভারি গ্রহণ করুন।",
    buttonText: "প্রশ্নপত্র অর্ডার করুন",
    buttonLink: "/academic/question-order"
  }
];

async function getCoverFlags(): Promise<{
  showCoverAboveNavbar: boolean;
  showCoverInPageHeader: boolean;
  scrollingNotice: string;
  showScrollingNotice: boolean;
  heroSlides: HeroSlide[];
  zimadarCommissionPercent: number;
  zimadarMinMadrasas: number;
  zimadarMinOrderAmount: number;
  zimadarCommissionEnabled: boolean;
}> {
  try {
    const record = await prisma.pageContent.findUnique({ where: { slug: FLAGS_SLUG } });
    if (!record) {
      const initial = {
        showCoverAboveNavbar: false,
        showCoverInPageHeader: false,
        scrollingNotice: "",
        showScrollingNotice: false,
        heroSlides: DEFAULT_HERO_SLIDES,
        zimadarCommissionPercent: 15,
        zimadarMinMadrasas: 5,
        zimadarMinOrderAmount: 5000,
        zimadarCommissionEnabled: true,
      };
      await prisma.pageContent.create({
        data: { slug: FLAGS_SLUG, content: JSON.stringify(initial) }
      }).catch(() => {});
      return initial;
    }
    const parsed = JSON.parse(record.content);
    const slides = Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
      ? parsed.heroSlides
      : DEFAULT_HERO_SLIDES;

    // If heroSlides was empty in DB, persist default slides into DB
    if (!Array.isArray(parsed.heroSlides) || parsed.heroSlides.length === 0) {
      const updatedContent = { ...parsed, heroSlides: DEFAULT_HERO_SLIDES };
      await prisma.pageContent.update({
        where: { slug: FLAGS_SLUG },
        data: { content: JSON.stringify(updatedContent) }
      }).catch(() => {});
    }

    return {
      showCoverAboveNavbar:      parsed.showCoverAboveNavbar  ?? false,
      showCoverInPageHeader:     parsed.showCoverInPageHeader ?? false,
      scrollingNotice:           parsed.scrollingNotice ?? "",
      showScrollingNotice:       parsed.showScrollingNotice ?? false,
      heroSlides:                sanitizeHeroSlides(slides),
      zimadarCommissionPercent:  typeof parsed.zimadarCommissionPercent === 'number' ? parsed.zimadarCommissionPercent : 15,
      zimadarMinMadrasas:        typeof parsed.zimadarMinMadrasas === 'number' ? parsed.zimadarMinMadrasas : 5,
      zimadarMinOrderAmount:     typeof parsed.zimadarMinOrderAmount === 'number' ? parsed.zimadarMinOrderAmount : 5000,
      zimadarCommissionEnabled:  parsed.zimadarCommissionEnabled !== undefined ? Boolean(parsed.zimadarCommissionEnabled) : true,
    };
  } catch {
    return {
      showCoverAboveNavbar: false,
      showCoverInPageHeader: false,
      scrollingNotice: "",
      showScrollingNotice: false,
      heroSlides: sanitizeHeroSlides(DEFAULT_HERO_SLIDES),
      zimadarCommissionPercent: 15,
      zimadarMinMadrasas: 5,
      zimadarMinOrderAmount: 5000,
      zimadarCommissionEnabled: true,
    };
  }
}

async function setCoverFlags(flags: {
  showCoverAboveNavbar?: boolean;
  showCoverInPageHeader?: boolean;
  scrollingNotice?: string;
  showScrollingNotice?: boolean;
  heroSlides?: HeroSlide[];
  zimadarCommissionPercent?: number;
  zimadarMinMadrasas?: number;
  zimadarMinOrderAmount?: number;
  zimadarCommissionEnabled?: boolean;
}) {
  const current = await getCoverFlags();
  const merged = {
    showCoverAboveNavbar:      flags.showCoverAboveNavbar      ?? current.showCoverAboveNavbar,
    showCoverInPageHeader:     flags.showCoverInPageHeader     ?? current.showCoverInPageHeader,
    scrollingNotice:           flags.scrollingNotice           ?? current.scrollingNotice,
    showScrollingNotice:       flags.showScrollingNotice       ?? current.showScrollingNotice,
    heroSlides:                flags.heroSlides !== undefined ? sanitizeHeroSlides(flags.heroSlides) : current.heroSlides,
    zimadarCommissionPercent:  flags.zimadarCommissionPercent !== undefined ? Number(flags.zimadarCommissionPercent) : current.zimadarCommissionPercent,
    zimadarMinMadrasas:        flags.zimadarMinMadrasas !== undefined ? Number(flags.zimadarMinMadrasas) : current.zimadarMinMadrasas,
    zimadarMinOrderAmount:     flags.zimadarMinOrderAmount !== undefined ? Number(flags.zimadarMinOrderAmount) : current.zimadarMinOrderAmount,
    zimadarCommissionEnabled:  flags.zimadarCommissionEnabled !== undefined ? Boolean(flags.zimadarCommissionEnabled) : current.zimadarCommissionEnabled,
  };
  await prisma.pageContent.upsert({
    where:  { slug: FLAGS_SLUG },
    update: { content: JSON.stringify(merged) },
    create: { slug: FLAGS_SLUG, content: JSON.stringify(merged) },
  });
  return merged;
}

const THREE_BANKS_SEED_SLUG = "payment-methods-3banks-v1";

const DEFAULT_BANK_METHODS = [
  {
    type: "bank",
    provider: "ইসলামী ব্যাংক",
    name: "ইসলামী ব্যাংক",
    accountName: "নূরানী তালিমুল কুরআন বোর্ড খুলনা",
    accountNumber: "2050000000000",
    accountType: "চলতি হিসাব",
    branch: "খুলনা প্রধান শাখা",
    routingNo: "125271822",
    instructions: "ব্যাংক অ্যাকাউন্ট ডিপোজিট বা অনলাইন ট্রান্সফার করে ট্রানজেকশন স্লিপ বা রেফারেন্স নম্বর দিন।",
    sortOrder: 4,
    isActive: true,
  },
  {
    type: "bank",
    provider: "ডাচ-বাংলা ব্যাংক",
    name: "ডাচ-বাংলা ব্যাংক",
    accountName: "নূরানী তালিমুল কুরআন বোর্ড খুলনা",
    accountNumber: "1200000000000",
    accountType: "চলতি হিসাব",
    branch: "খুলনা শাখা",
    routingNo: "090271828",
    instructions: "ডাচ-বাংলা ব্যাংক অ্যাকাউন্ট বা নেক্সাস পে-এর মাধ্যমে ট্রান্সফার করে ট্রানজেকশন স্লিপ বা রেফারেন্স নম্বর দিন।",
    sortOrder: 5,
    isActive: true,
  },
  {
    type: "bank",
    provider: "ইসলামী ব্যাংক",
    name: "ইসলামী ব্যাংক",
    accountName: "নূরানী তালিমুল কুরআন বোর্ড খুলনা",
    accountNumber: "2050000000001",
    accountType: "সঞ্চয়ী হিসাব",
    branch: "খুলনা শাখা",
    routingNo: "125271822",
    instructions: "ব্যাংক অ্যাকাউন্ট ডিপোজিট বা সেলফিন ট্রান্সফার করে ট্রানজেকশন স্লিপ বা রেফারেন্স নম্বর দিন।",
    sortOrder: 6,
    isActive: true,
  },
];

const DEFAULT_PAYMENT_METHODS = [
  {
    type: "mobile",
    provider: "বিকাশ",
    name: "বিকাশ",
    accountNumber: "01700000000",
    accountType: "পার্সোনাল",
    instructions: "বিকাশ অ্যাপ অথবা *247# ডায়াল করে Send Money করুন এবং TrxID দিন।",
    logo: "https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png",
    sortOrder: 1,
    isActive: true,
  },
  {
    type: "mobile",
    provider: "নগদ",
    name: "নগদ",
    accountNumber: "01700000000",
    accountType: "পার্সোনাল",
    instructions: "নগদ অ্যাপ অথবা *167# ডায়াল করে Send Money করুন এবং TrxID দিন।",
    logo: "https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png",
    sortOrder: 2,
    isActive: true,
  },
  {
    type: "mobile",
    provider: "রকেট",
    name: "রকেট",
    accountNumber: "01700000000",
    accountType: "পার্সোনাল",
    instructions: "রকেট অ্যাপ অথবা *322# ডায়াল করে Send Money করুন এবং TrxID দিন।",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Rocket_mobile_banking_logo.svg/512px-Rocket_mobile_banking_logo.svg.png",
    sortOrder: 3,
    isActive: true,
  },
  ...DEFAULT_BANK_METHODS,
];

// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    let settings = await prisma.boardSettings.findFirst({
      include: {
        contacts: true,
        payments: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!settings) {
      settings = await prisma.boardSettings.create({
        data: {
          payments: {
            create: DEFAULT_PAYMENT_METHODS,
          },
        },
        include: {
          contacts: true,
          payments: { orderBy: { sortOrder: 'asc' } },
        },
      });
      await prisma.pageContent.upsert({
        where: { slug: THREE_BANKS_SEED_SLUG },
        update: { content: JSON.stringify({ seeded: true }) },
        create: { slug: THREE_BANKS_SEED_SLUG, content: JSON.stringify({ seeded: true }) },
      }).catch(() => {});
    } else if (!settings.payments || settings.payments.length === 0) {
      // Auto-seed default payments if none exist
      for (const p of DEFAULT_PAYMENT_METHODS) {
        await (prisma as any).paymentMethod.create({
          data: {
            ...p,
            boardSettingsId: settings.id,
          },
        });
      }
      await prisma.pageContent.upsert({
        where: { slug: THREE_BANKS_SEED_SLUG },
        update: { content: JSON.stringify({ seeded: true }) },
        create: { slug: THREE_BANKS_SEED_SLUG, content: JSON.stringify({ seeded: true }) },
      }).catch(() => {});
      settings = await prisma.boardSettings.findFirst({
        where: { id: settings.id },
        include: {
          contacts: true,
          payments: { orderBy: { sortOrder: 'asc' } },
        },
      });
    } else {
      // One-time migration: ensure the 3 default bank options (Islami Bank, Dutch-Bangla Bank, Islami Bank) exist
      const seedMarker = await prisma.pageContent.findUnique({ where: { slug: THREE_BANKS_SEED_SLUG } }).catch(() => null);
      if (!seedMarker) {
        const existingBanks = settings.payments.filter((p: any) => p.type === "bank" || p.type === "BANK");
        if (existingBanks.length < 3) {
          let nextOrder = settings.payments.reduce((m: number, p: any) => Math.max(m, Number(p.sortOrder) || 0), 0) + 1;
          const hasDutch = existingBanks.some((b: any) =>
            (b.name || "").includes("ডাচ") || (b.provider || "").toLowerCase().includes("dutch")
          );
          const islamiCount = existingBanks.filter((b: any) =>
            (b.name || "").includes("ইসলামী") || (b.provider || "").toLowerCase().includes("islami")
          ).length;

          const banksToAdd: any[] = [];
          if (islamiCount === 0) banksToAdd.push(DEFAULT_BANK_METHODS[0]);
          if (!hasDutch) banksToAdd.push(DEFAULT_BANK_METHODS[1]);
          if (islamiCount < 2 && existingBanks.length + banksToAdd.length < 3) {
            banksToAdd.push(DEFAULT_BANK_METHODS[2]);
          }
          while (existingBanks.length + banksToAdd.length < 3) {
            banksToAdd.push(DEFAULT_BANK_METHODS[banksToAdd.length % DEFAULT_BANK_METHODS.length]);
          }

          for (const bank of banksToAdd) {
            await (prisma as any).paymentMethod.create({
              data: {
                ...bank,
                sortOrder: nextOrder++,
                boardSettingsId: settings.id,
              },
            });
          }

          settings = await prisma.boardSettings.findFirst({
            where: { id: settings.id },
            include: {
              contacts: true,
              payments: { orderBy: { sortOrder: 'asc' } },
            },
          });
        }

        await prisma.pageContent.upsert({
          where: { slug: THREE_BANKS_SEED_SLUG },
          update: { content: JSON.stringify({ seeded: true }) },
          create: { slug: THREE_BANKS_SEED_SLUG, content: JSON.stringify({ seeded: true }) },
        }).catch(() => {});
      }
    }

    const flags = await getCoverFlags();
    return NextResponse.json(
      { ...settings, ...flags },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request: Request) {
  try {
    const data = await request.json();

    let settings = await prisma.boardSettings.findFirst();

    if (settings) {
      if (data.contacts) {
        await prisma.contactInfo.deleteMany({ where: { boardSettingsId: settings.id } });
      }
      if (data.payments) {
        await prisma.paymentMethod.deleteMany({ where: { boardSettingsId: settings.id } });
        await prisma.pageContent.upsert({
          where: { slug: THREE_BANKS_SEED_SLUG },
          update: { content: JSON.stringify({ seeded: true }) },
          create: { slug: THREE_BANKS_SEED_SLUG, content: JSON.stringify({ seeded: true }) },
        }).catch(() => {});
      }

      settings = await prisma.boardSettings.update({
        where: { id: settings.id },
        data: {
          name:     data.name     !== undefined ? data.name     : settings.name,
          address:  data.address  !== undefined ? data.address  : settings.address,
          logoUrl:  data.logoUrl  !== undefined ? data.logoUrl  : settings.logoUrl,
          coverUrl: data.coverUrl !== undefined ? data.coverUrl : settings.coverUrl,
          contacts: data.contacts ? {
            create: data.contacts.map((c: any) => ({ type: c.type, value: c.value }))
          } : undefined,
          payments: data.payments ? {
            create: data.payments.map((p: any, idx: number) => ({
              type: p.type || "mobile",
              provider: p.provider || "",
              name: p.name || p.provider || "",
              logo: p.logo || null,
              accountName: p.accountName || null,
              accountNumber: p.accountNumber || "",
              accountType: p.accountType || null,
              branch: p.branch || null,
              routingNo: p.routingNo || null,
              qrCodeImage: p.qrCodeImage || null,
              instructions: p.instructions || null,
              sortOrder: p.sortOrder !== undefined ? Number(p.sortOrder) : idx + 1,
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
            }))
          } : undefined,
        },
        include: {
          contacts: true,
          payments: { orderBy: { sortOrder: 'asc' } },
        },
      });
    } else {
      settings = await prisma.boardSettings.create({
        data: {
          name: data.name, address: data.address,
          logoUrl: data.logoUrl, coverUrl: data.coverUrl,
          contacts: data.contacts ? {
            create: data.contacts.map((c: any) => ({ type: c.type, value: c.value }))
          } : undefined,
          payments: data.payments ? {
            create: data.payments.map((p: any, idx: number) => ({
              type: p.type || "mobile",
              provider: p.provider || "",
              name: p.name || p.provider || "",
              logo: p.logo || null,
              accountName: p.accountName || null,
              accountNumber: p.accountNumber || "",
              accountType: p.accountType || null,
              branch: p.branch || null,
              routingNo: p.routingNo || null,
              qrCodeImage: p.qrCodeImage || null,
              instructions: p.instructions || null,
              sortOrder: p.sortOrder !== undefined ? Number(p.sortOrder) : idx + 1,
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
            }))
          } : undefined,
        },
        include: {
          contacts: true,
          payments: { orderBy: { sortOrder: 'asc' } },
        },
      });
    }

    // Persist cover-display flags and zimadar commission settings via PageContent
    const flags = await setCoverFlags({
      showCoverAboveNavbar:      data.showCoverAboveNavbar,
      showCoverInPageHeader:     data.showCoverInPageHeader,
      scrollingNotice:           data.scrollingNotice,
      showScrollingNotice:       data.showScrollingNotice,
      heroSlides:                data.heroSlides,
      zimadarCommissionPercent:  data.zimadarCommissionPercent,
      zimadarMinMadrasas:        data.zimadarMinMadrasas,
      zimadarMinOrderAmount:     data.zimadarMinOrderAmount,
      zimadarCommissionEnabled:  data.zimadarCommissionEnabled,
    });

    return NextResponse.json({ ...settings, ...flags });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
