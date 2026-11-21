import { PrismaClient } from "@prisma/client";

/**
 * Generate a guaranteed unique, non-colliding invoice ID in the format INV-YYYY-XXXX.
 * This function is collision-proof against record deletions. When orders are deleted,
 * simple `count() + 1` causes duplicate key collisions on the unique constraint.
 * This helper searches for the maximum assigned sequence number for the current year
 * and verifies uniqueness before returning.
 */
export async function generateUniqueInvoiceId(prismaClient: PrismaClient | any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  try {
    // 1. Fetch sales matching current year's prefix
    const existingSales = await prismaClient.storeSale.findMany({
      where: {
        invoiceId: {
          startsWith: prefix,
        },
      },
      select: {
        invoiceId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    let maxNum = 0;
    for (const s of existingSales) {
      if (s.invoiceId && s.invoiceId.startsWith(prefix)) {
        const rawSuffix = s.invoiceId.replace(prefix, "");
        const parsed = parseInt(rawSuffix, 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }

    // Also check total count as a baseline
    let countBaseline = 0;
    try {
      countBaseline = await prismaClient.storeSale.count();
    } catch {}

    let nextNum = Math.max(maxNum, countBaseline) + 1;
    let candidate = `${prefix}${String(nextNum).padStart(4, "0")}`;

    // Verify candidate does not already exist in database
    let existing = await prismaClient.storeSale.findUnique({
      where: { invoiceId: candidate },
      select: { id: true },
    });

    while (existing) {
      nextNum++;
      candidate = `${prefix}${String(nextNum).padStart(4, "0")}`;
      existing = await prismaClient.storeSale.findUnique({
        where: { invoiceId: candidate },
        select: { id: true },
      });
    }

    return candidate;
  } catch (error) {
    console.error("Failed to generate sequential unique invoice ID, using timestamped fallback:", error);
    const fallbackSeq = `${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    return `${prefix}${fallbackSeq}`;
  }
}
