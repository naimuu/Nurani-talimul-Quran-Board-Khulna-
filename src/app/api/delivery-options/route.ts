import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_DELIVERY_OPTIONS = [
  {
    name: "পাঠাও কুরিয়ার",
    type: "pathao",
    charge: 0,
    requiresName: false,
    description: "পাঠাও কুরিয়ারের মাধ্যমে ডেলিভারি (কোনো অতিরিক্ত চার্জ নেই)",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "স্টিডফাস্ট কুরিয়ার",
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
    charge: 200,
    requiresName: true,
    description: "সুন্দরবন, এস এ পরিবহন, করতোয়া ইত্যাদি কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "ট্রান্সপোর্ট",
    type: "transport",
    charge: 100,
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
      // Seed default delivery options
      for (const item of DEFAULT_DELIVERY_OPTIONS) {
        await (prisma as any).deliveryOption.upsert({
          where: { type: item.type },
          update: {},
          create: item,
        });
      }
      options = await (prisma as any).deliveryOption.findMany({
        orderBy: { sortOrder: "asc" },
      });
    }

    return NextResponse.json(options);
  } catch (error: any) {
    console.error("Error fetching delivery options:", error);
    // Return default options as fallback
    return NextResponse.json(DEFAULT_DELIVERY_OPTIONS);
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

    const updated = await (prisma as any).deliveryOption.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating delivery options:", error);
    return NextResponse.json({ error: "Failed to update delivery options" }, { status: 500 });
  }
}
