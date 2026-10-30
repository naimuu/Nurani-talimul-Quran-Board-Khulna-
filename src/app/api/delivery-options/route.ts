import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DELIVERY_V2_SEED_SLUG = "delivery-options-20-10-v1";

const DEFAULT_DELIVERY_OPTIONS = [
  {
    name: "পাঠাও",
    type: "pathao",
    charge: 0,
    requiresName: false,
    description: "পাঠাও কুরিয়ারের মাধ্যমে ডেলিভারি (কোনো অতিরিক্ত চার্জ নেই)",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "স্টিডফাস্ট",
    type: "steadfast",
    charge: 0,
    requiresName: false,
    description: "স্টিডফাস্ট কুরিয়ারের মাধ্যমে ডেলিভারি (কোনো অতিরিক্ত চার্জ নেই)",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "অন্যান্য কুরিয়ার",
    type: "other_courier",
    charge: 20,
    requiresName: true,
    description: "সুন্দরবন, এস এ পরিবহন, করতোয়া ইত্যাদি কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "ট্রান্সপোর্ট",
    type: "transport",
    charge: 10,
    requiresName: true,
    description: "বাস / ট্রাক / ট্রান্সপোর্টের মাধ্যমে ডেলিভারি",
    sortOrder: 4,
    isActive: true,
  },
];

export async function GET() {
  try {
    let options = await (prisma as any).deliveryOption.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (!options || options.length === 0) {
      for (const item of DEFAULT_DELIVERY_OPTIONS) {
        await (prisma as any).deliveryOption.upsert({
          where: { type: item.type },
          update: {},
          create: item,
        });
      }
      await prisma.pageContent.upsert({
        where: { slug: DELIVERY_V2_SEED_SLUG },
        update: { content: JSON.stringify({ migrated: true }) },
        create: { slug: DELIVERY_V2_SEED_SLUG, content: JSON.stringify({ migrated: true }) },
      }).catch(() => {});

      options = await (prisma as any).deliveryOption.findMany({
        orderBy: { sortOrder: "asc" },
      });
    } else {
      // One-time migration from legacy 200/100 defaults to 20/10 defaults (while preserving future admin edits)
      const marker = await prisma.pageContent.findUnique({ where: { slug: DELIVERY_V2_SEED_SLUG } }).catch(() => null);
      if (!marker) {
        for (const item of DEFAULT_DELIVERY_OPTIONS) {
          const existing = options.find((o: any) => o.type === item.type);
          if (!existing) {
            await (prisma as any).deliveryOption.create({ data: item }).catch(() => {});
          } else if (
            (item.type === "other_courier" && Number(existing.charge) === 200) ||
            (item.type === "transport" && Number(existing.charge) === 100)
          ) {
            await (prisma as any).deliveryOption.update({
              where: { id: existing.id },
              data: { charge: item.charge },
            }).catch(() => {});
          }
        }
        await prisma.pageContent.upsert({
          where: { slug: DELIVERY_V2_SEED_SLUG },
          update: { content: JSON.stringify({ migrated: true }) },
          create: { slug: DELIVERY_V2_SEED_SLUG, content: JSON.stringify({ migrated: true }) },
        }).catch(() => {});

        options = await (prisma as any).deliveryOption.findMany({
          orderBy: { sortOrder: "asc" },
        });
      }
    }

    return NextResponse.json(options, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error: any) {
    console.error("Error fetching delivery options:", error);
    return NextResponse.json(DEFAULT_DELIVERY_OPTIONS, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.id) {
          await (prisma as any).deliveryOption.update({
            where: { id: item.id },
            data: {
              name: item.name,
              charge: Number(item.charge) || 0,
              requiresName: Boolean(item.requiresName),
              description: item.description,
              sortOrder: Number(item.sortOrder) || 0,
              isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
            },
          });
        } else if (item.type) {
          await (prisma as any).deliveryOption.upsert({
            where: { type: item.type },
            update: {
              name: item.name,
              charge: Number(item.charge) || 0,
              requiresName: Boolean(item.requiresName),
              description: item.description,
              sortOrder: Number(item.sortOrder) || 0,
              isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
            },
            create: {
              name: item.name,
              type: item.type,
              charge: Number(item.charge) || 0,
              requiresName: Boolean(item.requiresName),
              description: item.description,
              sortOrder: Number(item.sortOrder) || 0,
              isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
            },
          });
        }
      }
    }

    await prisma.pageContent.upsert({
      where: { slug: DELIVERY_V2_SEED_SLUG },
      update: { content: JSON.stringify({ migrated: true }) },
      create: { slug: DELIVERY_V2_SEED_SLUG, content: JSON.stringify({ migrated: true }) },
    }).catch(() => {});

    const updated = await (prisma as any).deliveryOption.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error: any) {
    console.error("Error updating delivery options:", error);
    return NextResponse.json({ error: "Failed to update delivery options" }, { status: 500 });
  }
}
