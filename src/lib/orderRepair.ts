import { PrismaClient } from "@prisma/client";
import ExamSession from "@/lib/models/ExamQuestion";
import { parseQuestionItemsFromNotes } from "@/lib/orderTimeline";

export async function repairQuestionOrderSaleIfNeeded(sale: any, prisma: PrismaClient): Promise<any> {
  if (!sale || !sale.notes || !sale.notes.includes('[প্রশ্নের অর্ডার]:')) return sale;
  
  const isDummy = sale.items?.some((i: any) => 
    !i.product?.name || 
    i.product?.name?.includes('ব্ল্যাকবোর্ড') || 
    i.product?.name === 'অর্ডারকৃত পণ্য' ||
    (Number(i.unitPrice) >= 2000 && !i.product?.name?.includes('সেট'))
  ) || !sale.items || sale.items.length === 0;

  const parsedItems = parseQuestionItemsFromNotes(sale.notes);
  if (parsedItems.length === 0) return sale;

  const hasDuplicateGlitch = Boolean(
    sale.items &&
    sale.items.length > 1 &&
    sale.items.every((i: any) => i.productId === sale.items[0]?.productId || i.product?.name === sale.items[0]?.product?.name) &&
    parsedItems.some(p => p.name !== parsedItems[0].name)
  );

  const hasItemCountMismatch = Boolean(sale.items && sale.items.length !== parsedItems.length);

  if (!isDummy && !hasDuplicateGlitch && !hasItemCountMismatch) return sale;

  try {
    // Lookup question set prices from ExamSession
    let sessions: any[] = [];
    try {
      sessions = await ExamSession.find({}).lean();
    } catch {}

    const priceMap = new Map<string, number>();
    for (const sess of sessions) {
      for (const exam of sess.exams || []) {
        for (const qs of exam.questionSets || []) {
          if (qs.setName && qs.pricePerSet) {
            priceMap.set(qs.setName.trim().toLowerCase(), qs.pricePerSet);
            priceMap.set(`${qs.className || ''} ${qs.setName || ''}`.trim().toLowerCase(), qs.pricePerSet);
            if (sess.title) {
              priceMap.set(`${qs.setName.trim()} (${sess.title.trim()})`.toLowerCase(), qs.pricePerSet);
            }
          }
        }
      }
    }

    // Delete existing dummy items
    await (prisma as any).storeSaleItem.deleteMany({ where: { saleId: sale.id } });

    const newItemsToCreate = [];
    let newSubtotal = 0;

    for (const pItem of parsedItems) {
      let unitPrice = 0;
      const cleanNameLower = pItem.name.toLowerCase();
      priceMap.forEach((p, k) => {
        if (!unitPrice && (cleanNameLower.includes(k) || k.includes(cleanNameLower))) {
          unitPrice = p;
        }
      });
      if (!unitPrice) {
        // Fallback default set price per class
        if (cleanNameLower.includes('প্লে')) unitPrice = 20;
        else if (cleanNameLower.includes('নার্সারী')) unitPrice = 20;
        else if (cleanNameLower.includes('প্রথম')) unitPrice = 18;
        else if (cleanNameLower.includes('দ্বিতীয়') || cleanNameLower.includes('দ্বিতীয়')) unitPrice = 18;
        else if (cleanNameLower.includes('তৃতীয়') || cleanNameLower.includes('তৃতীয়')) unitPrice = 18;
        else if (cleanNameLower.includes('চতুর্থ')) unitPrice = 18;
        else if (cleanNameLower.includes('পঞ্চম')) unitPrice = 18;
        else unitPrice = 20;
      }

      let prod = await (prisma as any).storeProduct.findFirst({ where: { name: pItem.name } });
      if (!prod) {
        prod = await (prisma as any).storeProduct.create({
          data: {
            name: pItem.name,
            category: "প্রশ্নপত্র",
            price: unitPrice,
            stock: 9999,
            weight: 0.25,
            visibility: "academic",
          }
        });
      }

      newItemsToCreate.push({
        productId: prod.id,
        quantity: pItem.qty,
        unitPrice: unitPrice,
      });
      newSubtotal += unitPrice * pItem.qty;
    }

    const deliveryCharge = Number(sale.deliveryCharge) || 0;
    const discount = Number(sale.discount) || 0;
    const newTotalAmount = Math.max(0, newSubtotal - discount) + deliveryCharge;

    const updatedSale = await (prisma as any).storeSale.update({
      where: { id: sale.id },
      data: {
        totalAmount: newTotalAmount,
        items: { create: newItemsToCreate }
      },
      include: {
        items: { include: { product: true } },
        payments: true,
      }
    });

    return updatedSale;
  } catch (err) {
    console.error("Failed to auto-repair question order sale:", err);
    return sale;
  }
}
