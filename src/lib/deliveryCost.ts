/**
 * Delivery cost calculation rules for Nurani Board Khulna Center/Agent Book Orders
 * 
 * Rules:
 * 1. If book order is 5,000 BDT or more (>= 5,000 ৳):
 *    - Free delivery (কুরিয়ার খরচ ০ ৳ / ফ্রি ডেলিভারি)
 * 2. If book order is less than 5,000 BDT (< 5,000 ৳):
 *    - Sent via "পাঠাও কুরিয়ার" (Pathao Courier) up to 15 kg.
 *    - First 2 kg: 180 BDT
 *    - Every additional kg: 25 BDT per kg
 *    - Courier fee is borne by the orderer and added to the bill.
 */

export interface DeliveryCalculation {
  subtotal: number;
  totalWeightKg: number;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  courierName: string;
  weightBreakdown: string;
  isOverweight: boolean; // weight > 15 kg
  ruleNotice: string;
}

export const DELIVERY_CONSTANTS = {
  FREE_DELIVERY_THRESHOLD: 5000,
  DEFAULT_PRODUCT_WEIGHT_KG: 0.25, // 250 grams per book/product if not explicitly specified
  BASE_WEIGHT_KG: 2,
  BASE_CHARGE_BDT: 180,
  PER_KG_CHARGE_BDT: 25,
  MAX_COURIER_WEIGHT_KG: 15,
  COURIER_NAME: "পাঠাও কুরিয়ার",
};

/**
 * Calculates delivery cost based on items in cart and their weights
 */
export function calculateDeliveryCost(
  items: { product: { price: number; weight?: number | null }; quantity?: number; qty?: number }[],
  overrideWeightKg?: number
): DeliveryCalculation {
  const getItemQty = (item: { quantity?: number; qty?: number }) => Number(item.quantity ?? item.qty ?? 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.product?.price) || 0) * getItemQty(item), 0);

  let rawWeight = 0;
  if (typeof overrideWeightKg === 'number' && overrideWeightKg > 0) {
    rawWeight = overrideWeightKg;
  } else {
    rawWeight = items.reduce((sum, item) => {
      const weight = (item.product?.weight && item.product.weight > 0)
        ? item.product.weight
        : DELIVERY_CONSTANTS.DEFAULT_PRODUCT_WEIGHT_KG;
      return sum + weight * getItemQty(item);
    }, 0);
  }

  // Round weight to 1 decimal place (at least 0.1 kg if cart has items)
  const totalWeightKg = items.length > 0 ? Math.max(0.1, Math.round(rawWeight * 10) / 10) : 0;
  const isFreeDelivery = subtotal >= DELIVERY_CONSTANTS.FREE_DELIVERY_THRESHOLD;
  const isOverweight = totalWeightKg > DELIVERY_CONSTANTS.MAX_COURIER_WEIGHT_KG;

  let deliveryCharge = 0;
  let weightBreakdown = "";

  if (items.length === 0 || subtotal === 0) {
    deliveryCharge = 0;
    weightBreakdown = "কার্ট খালি";
  } else if (isFreeDelivery) {
    deliveryCharge = 0;
    weightBreakdown = `৫,০০০ ৳ বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি (ওজন: ${totalWeightKg} কেজি)`;
  } else {
    if (totalWeightKg <= DELIVERY_CONSTANTS.BASE_WEIGHT_KG) {
      deliveryCharge = DELIVERY_CONSTANTS.BASE_CHARGE_BDT;
      weightBreakdown = `প্রথম ২ কেজি পর্যন্ত: ${DELIVERY_CONSTANTS.BASE_CHARGE_BDT} ৳`;
    } else {
      const extraKg = Math.ceil(totalWeightKg - DELIVERY_CONSTANTS.BASE_WEIGHT_KG);
      const extraCost = extraKg * DELIVERY_CONSTANTS.PER_KG_CHARGE_BDT;
      deliveryCharge = DELIVERY_CONSTANTS.BASE_CHARGE_BDT + extraCost;
      weightBreakdown = `প্রথম ২ কেজি (${DELIVERY_CONSTANTS.BASE_CHARGE_BDT} ৳) + অতিরিক্ত ${extraKg} কেজি (${extraCost} ৳) = ${deliveryCharge} ৳`;
    }
  }

  const ruleNotice = isFreeDelivery
    ? "🎉 আপনার অর্ডার ৫,০০০ টাকার বেশি হওয়ায় ডেলিভারি সম্পূর্ণ ফ্রি!"
    : `🚚 ৫,০০০ টাকার কম অর্ডারে “পাঠাও কুরিয়ার”-এ পাঠানো হবে (প্রথম ২ কেজি ১৮০ ৳, পরের প্রতি কেজি ২৫ ৳, সর্বোচ্চ ১৫ কেজি)।`;

  return {
    subtotal,
    totalWeightKg,
    deliveryCharge,
    isFreeDelivery,
    courierName: DELIVERY_CONSTANTS.COURIER_NAME,
    weightBreakdown,
    isOverweight,
    ruleNotice,
  };
}
