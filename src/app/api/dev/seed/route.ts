import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  const defs = [
    { name: 'বই', isClassWise: true },
    { name: 'খাতা', isClassWise: false },
    { name: 'কলম', isClassWise: false },
    { name: 'পেন্সিল', isClassWise: false },
    { name: 'ডাস্টার', isClassWise: false },
    { name: 'স্লেট', isClassWise: false },
  ];
  try {
    for (const cat of defs) {
      await (prisma as any).storeCategory.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }
    return NextResponse.json({ success: true, seeded: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
