export interface TimelineEvent {
  step: 'pending' | 'confirmed' | 'packaging' | 'shipped' | 'delivered' | 'cancelled';
  status: string;
  title: string;
  actorName: string;
  actorRole: 'ADMIN' | 'CUSTOMER' | 'SYSTEM';
  actorPhone?: string;
  timestamp: string; // ISO String
  notes?: string;
  courierName?: string;
  trackingId?: string;
  confirmedByCustomer?: boolean;
}

export const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const toBanglaDigits = (num: string | number): string => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, d => bn[parseInt(d)]);
};

export const formatBanglaDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const day = toBanglaDigits(d.getDate());
  const month = BANGLA_MONTHS[d.getMonth()];
  const year = toBanglaDigits(d.getFullYear());

  let hours = d.getHours();
  const minutes = toBanglaDigits(String(d.getMinutes()).padStart(2, '0'));
  const isPM = hours >= 12;
  const ampm = isPM ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursBn = toBanglaDigits(String(hours).padStart(2, '0'));

  return `${day} ${month} ${year}, ${hoursBn}:${minutes} ${ampm}`;
};

export function cleanAddressNotes(notes?: string | null): string {
  if (!notes) return '';
  let cleaned = notes
    .replace(/\[প্রশ্নের অর্ডার\]:[\s\S]*?(?:\|\s*|$)/gi, '')
    .replace(/\[(?:Tracking|ট্র্যাকিং|Consignment):\s*[^\]]+\]/gi, '')
    .replace(/\[(?:কুরিয়ার নোট|Courier Note):\s*[^\]]+\]/gi, '')
    .replace(/\|\s*কুরিয়ার:\s*[^|]+/gi, '')
    .replace(/কুরিয়ার:\s*[^|]+/gi, '')
    .replace(/\(ফ্রি ডেলিভারি[^)]*\)/gi, '')
    .replace(/\(চার্জ:[^)]*\)/gi, '')
    .replace(/ওজন:\s*[\d.]+\s*(?:কেজি|kg)/gi, '')
    .replace(/\(ইলহাক:\s*[^)]+\)/gi, '')
    .trim();

  // Remove leading/trailing pipes and commas
  cleaned = cleaned.replace(/^[|,\s]+|[|,\s]+$/g, '').trim();
  return cleaned;
}

export function parseQuestionItemsFromNotes(notes?: string | null): { name: string; qty: number }[] {
  if (!notes || !notes.includes('[প্রশ্নের অর্ডার]:')) return [];
  const match = notes.match(/\[প্রশ্নের অর্ডার\]:\s*([^|]+)/);
  if (!match) return [];
  const rawList = match[1];
  const itemMatches = rawList.match(/\[([^\]:]+):\s*(\d+)\s*(?:সেট|টি)?\]/g);
  if (!itemMatches) return [];

  const result: { name: string; qty: number }[] = [];
  for (const m of itemMatches) {
    const parsed = m.match(/\[([^\]:]+):\s*(\d+)/);
    if (parsed) {
      result.push({
        name: parsed[1].trim(),
        qty: parseInt(parsed[2]) || 1
      });
    }
  }
  return result;
}

export function createTimelineEvent(data: {
  step: 'pending' | 'confirmed' | 'packaging' | 'shipped' | 'delivered' | 'cancelled';
  status: string;
  title: string;
  actorName?: string;
  actorRole?: 'ADMIN' | 'CUSTOMER' | 'SYSTEM';
  actorPhone?: string;
  timestamp?: string | Date;
  notes?: string;
  courierName?: string;
  trackingId?: string;
  confirmedByCustomer?: boolean;
}): TimelineEvent {
  return {
    step: data.step,
    status: data.status,
    title: data.title,
    actorName: data.actorName || 'System Admin',
    actorRole: data.actorRole || 'ADMIN',
    actorPhone: data.actorPhone,
    timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
    notes: data.notes,
    courierName: data.courierName,
    trackingId: data.trackingId,
    confirmedByCustomer: data.confirmedByCustomer,
  };
}

export function parseTrackingInfo(notes?: string | null, courierName?: string | null) {
  let trackingId = '';
  if (notes) {
    const match = notes.match(/\[(?:Tracking|ট্র্যাকিং|Consignment):\s*([^\]]+)\]/i);
    if (match) trackingId = match[1].trim();
  }
  return {
    trackingId,
    courier: courierName || 'পাঠাও কুরিয়ার'
  };
}

export function getEnrichedTimeline(sale: any): TimelineEvent[] {
  const existing: TimelineEvent[] = Array.isArray(sale?.timeline) ? sale.timeline : [];
  
  if (existing.length > 0) {
    return existing;
  }

  // Generate synthetic timeline for legacy/existing orders without saved timeline
  const synth: TimelineEvent[] = [];
  const createdAt = sale.createdAt ? new Date(sale.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = sale.updatedAt ? new Date(sale.updatedAt).toISOString() : createdAt;
  const status = (sale.status || '').trim().toLowerCase();
  const customerName = sale.customerName || 'ক্রেতা';
  const tracking = parseTrackingInfo(sale.notes, sale.courierName);

  // 1. Initial Order Placed
  synth.push({
    step: 'pending',
    status: 'Pending Order',
    title: 'নতুন অনলাইন অর্ডার গৃহীত',
    actorName: `${customerName} (ক্রেতা)`,
    actorRole: 'CUSTOMER',
    actorPhone: sale.customerPhone,
    timestamp: createdAt,
    notes: 'অর্ডারটি সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে',
  });

  // If rejected/cancelled
  if (status === 'rejected' || status === 'cancelled') {
    synth.push({
      step: 'cancelled',
      status: 'Cancelled',
      title: 'অর্ডার বাতিল করা হয়েছে',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      timestamp: updatedAt,
    });
    return synth;
  }

  // 2. Confirmed
  if (status !== 'pending order' && status !== 'pending') {
    synth.push({
      step: 'confirmed',
      status: 'Confirmed',
      title: 'বোর্ড কর্তৃক অনুমোদন ও নিশ্চিতকরণ সম্পন্ন',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      timestamp: updatedAt,
    });
  }

  // 3. Packaging
  if (status === 'packaging' || status === 'shipped' || status === 'courier' || status === 'delivered' || status === 'completed') {
    synth.push({
      step: 'packaging',
      status: 'Packaging',
      title: 'প্যাকেজিং ও পণ্য প্রস্তুতকরণ সম্পন্ন',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      timestamp: updatedAt,
    });
  }

  // 4. Shipped / Courier
  if (status === 'shipped' || status === 'courier' || status === 'delivered' || status === 'completed') {
    synth.push({
      step: 'shipped',
      status: 'Shipped',
      title: 'কুরিয়ারে হস্তান্তর ও ট্র্যাকিং বুকিং সম্পন্ন',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      courierName: tracking.courier,
      trackingId: tracking.trackingId,
      timestamp: updatedAt,
    });
  }

  // 5. Delivered
  if (status === 'delivered' || status === 'completed') {
    const isByCust = !!sale.confirmedByCustomer;
    synth.push({
      step: 'delivered',
      status: 'Delivered',
      title: isByCust ? 'পণ্য রিসিভ ও ডেলিভারি নিশ্চিত (ক্রেতা নিজে)' : 'ডেলিভারি সম্পন্ন (অ্যাডমিন কর্তৃক নিশ্চিত)',
      actorName: isByCust ? `${customerName} (ক্রেতা নিজে)` : (sale.deliveredBy || 'System Admin'),
      actorRole: isByCust ? 'CUSTOMER' : 'ADMIN',
      confirmedByCustomer: isByCust,
      timestamp: sale.receivedAt ? new Date(sale.receivedAt).toISOString() : (sale.deliveredAt ? new Date(sale.deliveredAt).toISOString() : updatedAt),
      notes: isByCust ? 'ক্রেতা ট্র্যাকিং পেজ থেকে পণ্য প্রাপ্তি নিশ্চিত করেছেন' : 'ডেলিভারি সফল হয়েছে',
    });
  }

  return synth;
}
