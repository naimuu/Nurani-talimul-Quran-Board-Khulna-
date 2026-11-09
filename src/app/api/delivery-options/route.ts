import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DELIVERY_V3_QUESTION_SLUG = "delivery-options-v3-question";
const DELIVERY_V3_BOOK_SLUG = "delivery-options-v3-book";

export interface DeliveryOptionItem {
  id?: string;
  name: string;
  type: string;
  category?: "question" | "book";
  charge: number;
  requiresName: boolean;
  description?: string;
  billNote?: string;
  sortOrder: number;
  isActive: boolean;
}

const DEFAULT_QUESTION_DELIVERY_OPTIONS: DeliveryOptionItem[] = [
  {
    name: "পাঠাও",
    type: "pathao",
    category: "question",
    charge: 0,
    requiresName: false,
    description: "পাঠাও কুরিয়ারের মাধ্যমে ডেলিভারি (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)",
    billNote: "চার্জ কুরিয়ার বাহককে",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "স্টীডফাস্ট",
    type: "steadfast",
    category: "question",
    charge: 0,
    requiresName: false,
    description: "স্টীডফাস্ট কুরিয়ারের মাধ্যমে ডেলিভারি (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)",
    billNote: "চার্জ কুরিয়ার বাহককে",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "নিজে",
    type: "self",
    category: "question",
    charge: 0,
    requiresName: false,
    description: "বোর্ড কার্যালয় থেকে সরাসরি প্রশ্নপত্র সংগ্রহ করুন (চার্জ নাই)",
    billNote: "চার্জ নাই",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "অন্যান্য কুরিয়ার",
    type: "other_courier",
    category: "question",
    charge: 20,
    requiresName: true,
    description: "সুন্দরবন, এস এ পরিবহন, করতোয়া ইত্যাদি কুরিয়ার সার্ভিস",
    billNote: "+৳২০",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "ট্রান্সপোর্ট",
    type: "transport",
    category: "question",
    charge: 10,
    requiresName: true,
    description: "বাস / ট্রাক / ট্রান্সপোর্টের মাধ্যমে ডেলিভারি",
    billNote: "+৳১০",
    sortOrder: 5,
    isActive: true,
  },
];

const DEFAULT_BOOK_DELIVERY_OPTIONS: DeliveryOptionItem[] = [
  {
    name: "পাঠাও",
    type: "pathao",
    category: "book",
    charge: 0,
    requiresName: false,
    description: "পাঠাও কুরিয়ারের মাধ্যমে বই ডেলিভারি (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)",
    billNote: "চার্জ কুরিয়ার বাহককে",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "স্টীডফাস্ট",
    type: "steadfast",
    category: "book",
    charge: 0,
    requiresName: false,
    description: "স্টীডফাস্ট কুরিয়ারের মাধ্যমে বই ডেলিভারি (চার্জ কুরিয়ার বাহককে পরিশোধযোগ্য)",
    billNote: "চার্জ কুরিয়ার বাহককে",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "নিজে",
    type: "self",
    category: "book",
    charge: 0,
    requiresName: false,
    description: "বোর্ড প্রকাশনা সেলস কাউন্টার থেকে সরাসরি সংগ্রহ করুন (চার্জ নাই)",
    billNote: "চার্জ নাই",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "অন্যান্য কুরিয়ার",
    type: "other_courier",
    category: "book",
    charge: 20,
    requiresName: true,
    description: "সুন্দরবন, এস এ পরিবহন ইত্যাদি কুরিয়ার সার্ভিস",
    billNote: "+৳২০",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "ট্রান্সপোর্ট",
    type: "transport",
    category: "book",
    charge: 10,
    requiresName: true,
    description: "বাস / ট্রাক / ট্রান্সপোর্টের মাধ্যমে ডেলিভারি",
    billNote: "+৳১০",
    sortOrder: 5,
    isActive: true,
  },
];

async function getOptionsBySlug(slug: string, defaults: DeliveryOptionItem[]): Promise<DeliveryOptionItem[]> {
  try {
    const record = await prisma.pageContent.findUnique({ where: { slug } });
    if (!record) {
      await prisma.pageContent.create({
        data: { slug, content: JSON.stringify(defaults) },
      }).catch(() => { });
      return defaults;
    }
    const parsed = JSON.parse(record.content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all 5 default types exist
      const merged = [...parsed];
      for (const def of defaults) {
        if (!merged.some((m) => m.type === def.type)) {
          merged.push(def);
        }
      }
      return merged.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return defaults;
  } catch {
    return defaults;
  }
}

async function saveOptionsBySlug(slug: string, options: DeliveryOptionItem[]) {
  await prisma.pageContent.upsert({
    where: { slug },
    update: { content: JSON.stringify(options) },
    create: { slug, content: JSON.stringify(options) },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // 'book' | 'question'
    const format = searchParams.get("format"); // 'all'

    const questionOptions = await getOptionsBySlug(DELIVERY_V3_QUESTION_SLUG, DEFAULT_QUESTION_DELIVERY_OPTIONS);
    const bookOptions = await getOptionsBySlug(DELIVERY_V3_BOOK_SLUG, DEFAULT_BOOK_DELIVERY_OPTIONS);

    if (format === "all") {
      return NextResponse.json({ question: questionOptions, book: bookOptions }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    if (category === "book") {
      return NextResponse.json(bookOptions, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // Default or category === "question"
    return NextResponse.json(questionOptions, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error: any) {
    console.error("Error fetching delivery options:", error);
    return NextResponse.json(DEFAULT_QUESTION_DELIVERY_OPTIONS, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");

    // Case 1: Body contains { question: [...], book: [...] }
    if (body && (Array.isArray(body.question) || Array.isArray(body.book))) {
      if (Array.isArray(body.question)) {
        await saveOptionsBySlug(DELIVERY_V3_QUESTION_SLUG, body.question);
      }
      if (Array.isArray(body.book)) {
        await saveOptionsBySlug(DELIVERY_V3_BOOK_SLUG, body.book);
      }
      const updatedQ = await getOptionsBySlug(DELIVERY_V3_QUESTION_SLUG, DEFAULT_QUESTION_DELIVERY_OPTIONS);
      const updatedB = await getOptionsBySlug(DELIVERY_V3_BOOK_SLUG, DEFAULT_BOOK_DELIVERY_OPTIONS);
      return NextResponse.json({ question: updatedQ, book: updatedB }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // Case 2: Body is an array of options
    if (Array.isArray(body)) {
      const targetCategory = categoryParam === "book" ? "book" : "question";
      const targetSlug = targetCategory === "book" ? DELIVERY_V3_BOOK_SLUG : DELIVERY_V3_QUESTION_SLUG;
      await saveOptionsBySlug(targetSlug, body);

      // Sync DeliveryOption table for backwards compatibility
      for (const item of body) {
        if (item.type) {
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
          }).catch(() => { });
        }
      }

      const updated = await getOptionsBySlug(targetSlug, targetCategory === "book" ? DEFAULT_BOOK_DELIVERY_OPTIONS : DEFAULT_QUESTION_DELIVERY_OPTIONS);
      return NextResponse.json(updated, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating delivery options:", error);
    return NextResponse.json({ error: "Failed to update delivery options" }, { status: 500 });
  }
}
