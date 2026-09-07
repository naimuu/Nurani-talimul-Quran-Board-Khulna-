import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── Cover-display flags are stored as a JSON PageContent record ───────────────
// This avoids needing `npx prisma generate` for new BoardSettings fields.
const FLAGS_SLUG = 'cover-display-flags';

export interface HeroSlide {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

async function getCoverFlags(): Promise<{
  showCoverAboveNavbar: boolean;
  showCoverInPageHeader: boolean;
  scrollingNotice: string;
  showScrollingNotice: boolean;
  heroSlides: HeroSlide[];
}> {
  try {
    const record = await prisma.pageContent.findUnique({ where: { slug: FLAGS_SLUG } });
    if (!record) return { showCoverAboveNavbar: false, showCoverInPageHeader: false, scrollingNotice: "", showScrollingNotice: false, heroSlides: [] };
    const parsed = JSON.parse(record.content);
    return {
      showCoverAboveNavbar:  parsed.showCoverAboveNavbar  ?? false,
      showCoverInPageHeader: parsed.showCoverInPageHeader ?? false,
      scrollingNotice:       parsed.scrollingNotice ?? "",
      showScrollingNotice:   parsed.showScrollingNotice ?? false,
      heroSlides:            Array.isArray(parsed.heroSlides) ? parsed.heroSlides : [],
    };
  } catch {
    return { showCoverAboveNavbar: false, showCoverInPageHeader: false, scrollingNotice: "", showScrollingNotice: false, heroSlides: [] };
  }
}

async function setCoverFlags(flags: {
  showCoverAboveNavbar?: boolean;
  showCoverInPageHeader?: boolean;
  scrollingNotice?: string;
  showScrollingNotice?: boolean;
  heroSlides?: HeroSlide[];
}) {
  const current = await getCoverFlags();
  const merged = {
    showCoverAboveNavbar:  flags.showCoverAboveNavbar  ?? current.showCoverAboveNavbar,
    showCoverInPageHeader: flags.showCoverInPageHeader ?? current.showCoverInPageHeader,
    scrollingNotice:       flags.scrollingNotice ?? current.scrollingNotice,
    showScrollingNotice:   flags.showScrollingNotice ?? current.showScrollingNotice,
    heroSlides:            flags.heroSlides !== undefined ? flags.heroSlides : current.heroSlides,
  };
  await prisma.pageContent.upsert({
    where:  { slug: FLAGS_SLUG },
    update: { content: JSON.stringify(merged) },
    create: { slug: FLAGS_SLUG, content: JSON.stringify(merged) },
  });
  return merged;
}

// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    let settings = await prisma.boardSettings.findFirst({
      include: { contacts: true, payments: true },
    });

    if (!settings) {
      settings = await prisma.boardSettings.create({
        data: {},
        include: { contacts: true, payments: true },
      });
    }

    const flags = await getCoverFlags();
    return NextResponse.json({ ...settings, ...flags });
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
            create: data.payments.map((p: any) => ({
              type: p.type, provider: p.provider,
              accountName: p.accountName, accountNumber: p.accountNumber,
              branch: p.branch, routingNo: p.routingNo,
            }))
          } : undefined,
        },
        include: { contacts: true, payments: true },
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
            create: data.payments.map((p: any) => ({
              type: p.type, provider: p.provider,
              accountName: p.accountName, accountNumber: p.accountNumber,
              branch: p.branch, routingNo: p.routingNo,
            }))
          } : undefined,
        },
        include: { contacts: true, payments: true },
      });
    }

    // Persist cover-display flags via PageContent (no prisma generate needed)
    const flags = await setCoverFlags({
      showCoverAboveNavbar:  data.showCoverAboveNavbar,
      showCoverInPageHeader: data.showCoverInPageHeader,
      scrollingNotice:       data.scrollingNotice,
      showScrollingNotice:   data.showScrollingNotice,
      heroSlides:            data.heroSlides,
    });

    return NextResponse.json({ ...settings, ...flags });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
