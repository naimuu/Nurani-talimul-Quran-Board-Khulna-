import { generateQRCodeDataUrl, generateBarcodeSVG } from "@/lib/qrHelper";
import { cleanAddressNotes, parseQuestionItemsFromNotes } from "@/lib/orderTimeline";

export interface PrintInvoiceOptions {
  printBW?: boolean;
}

export async function printOrderInvoice(
  orderInput: any,
  options: PrintInvoiceOptions = {}
) {
  if (!orderInput) return;

  let order = orderInput;

  // 1. Fetch fresh enriched order from /api/store/orders/[invoiceId] to ensure repaired items and current dues
  if (order.invoiceId) {
    try {
      const res = await fetch(`/api/store/orders/${order.invoiceId}`);
      if (res.ok) {
        const fresh = await res.json();
        order = {
          ...fresh,
          ...order,
          items: fresh.items && fresh.items.length > 0 ? fresh.items : order.items,
          currentTotalDue: fresh.currentTotalDue !== undefined ? fresh.currentTotalDue : order.currentTotalDue,
          currentDueList: fresh.currentDueList || order.currentDueList,
          deliveryCharge: fresh.deliveryCharge !== undefined ? fresh.deliveryCharge : order.deliveryCharge,
          courierName: fresh.courierName || order.courierName,
        };
      }
    } catch (e) {
      console.warn("Failed to fetch enriched order for printing:", e);
    }
  }

  // 2. Fetch settings if not present
  let boardSettings: any = null;
  try {
    const sRes = await fetch("/api/settings");
    if (sRes.ok) {
      boardSettings = await sRes.json();
    }
  } catch (e) {
    console.warn("Failed to fetch settings for printing:", e);
  }

  // 3. Fallback repair for duplicate glitch if any
  let displayItems = order.items || [];
  const parsedFromNotes = parseQuestionItemsFromNotes(order.notes);
  const hasDuplicateGlitch =
    displayItems.length > 1 &&
    displayItems.every(
      (i: any) =>
        i.productId === displayItems[0]?.productId ||
        i.product?.name === displayItems[0]?.product?.name
    ) &&
    parsedFromNotes.length > 1;

  if (hasDuplicateGlitch && parsedFromNotes.length > 0) {
    displayItems = parsedFromNotes.map((p, idx) => ({
      product: { name: p.name },
      quantity: p.qty,
      unitPrice:
        displayItems[idx]?.unitPrice || (p.name.includes("প্রথম") ? 18 : 20),
    }));
  }

  const isQuestion = Boolean(
    order.orderType === 'QUESTION' ||
    order.orderType === 'EXAM_QUESTION' ||
    (order.notes && (
      order.notes.includes('[প্রশ্নের অর্ডার]') ||
      order.notes.includes('প্রশ্নপত্র') ||
      order.notes.includes('প্রশ্ন অর্ডার') ||
      order.notes.includes('প্রশ্নপত্র সেট')
    )) ||
    (displayItems && displayItems.some((i: any) => {
      const pName = String(i.product?.name || i.name || '').toLowerCase();
      const pCat = String(i.product?.category || i.category || '').toLowerCase();
      return pName.includes('প্রশ্ন') || pCat.includes('প্রশ্ন') || pCat.includes('question');
    }))
  );

  const trackingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/track?code=${order.invoiceId}`
      : order.invoiceId;
  const qrCodeUrl = await generateQRCodeDataUrl(trackingUrl);
  const barcodeSVG = generateBarcodeSVG(order.invoiceId);
  const itemsSubtotal = displayItems.reduce(
    (s: number, i: any) => s + i.quantity * Number(i.unitPrice || 0),
    0
  );
  const deliveryCharge = Number(order.deliveryCharge) || 0;
  const courierName = order.courierName || "পাঠাও কুরিয়ার";
  const grandTotalBill = order.totalAmount + (order.currentTotalDue || 0);
  const paidAmount = Number(order.paidAmount || 0);
  const totalDue = Math.max(0, grandTotalBill - paidAmount);

  // Format short-listed dues if more than 5 in pure black & white
  let dueListHtml = "";
  if (order.currentDueList && order.currentDueList.length > 0) {
    if (order.currentDueList.length <= 5) {
      dueListHtml = order.currentDueList
        .map(
          (dueObj: any) =>
            `<div class="totals-row" style="font-size: 9.5px; color: #000000;"><span>বকেয়া (${dueObj.invoiceId}):</span><span>৳${Number(dueObj.due || 0).toFixed(2)}</span></div>`
        )
        .join("");
    } else {
      const top5 = order.currentDueList.slice(0, 5);
      const remaining = order.currentDueList.slice(5);
      const remainingCount = remaining.length;
      const remainingSum = remaining.reduce(
        (s: number, d: any) => s + Number(d.due || 0),
        0
      );

      const top5Html = top5
        .map(
          (dueObj: any) =>
            `<div class="totals-row" style="font-size: 9.5px; color: #000000;"><span>বকেয়া (${dueObj.invoiceId}):</span><span>৳${Number(dueObj.due || 0).toFixed(2)}</span></div>`
        )
        .join("");

      const remainingRow = `<div class="totals-row" style="font-size: 9.5px; color: #000000; font-weight: 700; border-top: 1px dashed #000000; padding-top: 1.5px; margin-top: 1.5px;"><span>অন্যান্য বকেয়া (+${remainingCount}টি ইনভয়েস):</span><span>৳${remainingSum.toFixed(2)}</span></div>`;

      dueListHtml = top5Html + remainingRow;
    }
  } else if (order.currentTotalDue) {
    dueListHtml = `<div class="totals-row" style="font-size: 9.5px; color: #000000;"><span>পূর্বের মোট বকেয়া:</span><span>৳${Number(order.currentTotalDue).toFixed(2)}</span></div>`;
  }

  const getStatusText = (status: string) => {
    const s = (status || "").trim().toLowerCase();
    if (s === "completed" || s === "delivered") return "ডেলিভারি সম্পন্ন";
    if (s === "shipped" || s === "courier") return "কুরিয়ারে হস্তান্তরকৃত";
    if (s === "packaging") return "প্যাকেজিং চলছে";
    if (s === "confirmed" || s === "accepted") return "অনুমোদিত ও নিশ্চিত";
    if (s === "rejected" || s === "cancelled") return "বাতিলকৃত অর্ডার";
    if (s === "pending order" || s === "pending") return "অপেক্ষমান অর্ডার";
    if (s === "paid") return "অনুমোদিত (পরিশোধিত)";
    if (s === "partial") return "অনুমোদিত (আংশিক)";
    return status || "গৃহীত";
  };

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((s) => s.outerHTML)
      .join("");

    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="utf-8" />
          <title>ইনভয়েস — ${order.invoiceId}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.maateen.me/solaiman-lipi/font.css" rel="stylesheet">
          <link href="https://cdn.jsdelivr.net/gh/maateen/solaiman-lipi@master/font.css" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
          ${styles}
          <style>
            @page {
              size: auto;
              margin: 4mm 6mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'SolaimanLipi', 'Solaiman Lipi', 'Hind Siliguri', 'Kalpurush', 'Segoe UI', Tahoma, sans-serif !important;
              color: #000000 !important;
            }
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              color: #000000 !important;
              background: #ffffff !important;
              font-size: 10.5px;
              line-height: 1.35;
            }
            .invoice-wrapper {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              padding: 0;
              background: transparent !important;
              position: relative;
              z-index: 1;
            }
            .bismillah {
              font-family: 'Amiri', 'Traditional Arabic', serif !important;
              font-size: 13px;
              font-weight: 700;
              color: #000000 !important;
              margin: 0 0 1px 0;
              text-align: center;
              letter-spacing: 0.6px;
            }
            .header-container {
              text-align: center;
              border-bottom: 2px solid #000000;
              padding-bottom: 4px;
              margin-bottom: 6px;
              position: relative;
              background: transparent;
            }
            .board-title {
              color: #000000 !important;
              margin: 1px 0;
              font-size: 18px;
              font-weight: 800;
              letter-spacing: -0.2px;
              line-height: 1.2;
            }
            .sub-title {
              color: #000000 !important;
              font-size: 11px;
              font-weight: 700;
              margin: 1px 0;
            }
            .board-address {
              color: #000000 !important;
              font-size: 9px;
              margin: 1px 0 3px 0;
              font-weight: 500;
            }
            .invoice-pill {
              display: inline-block;
              background: #ffffff !important;
              color: #000000 !important;
              border: 1.5px solid #000000;
              padding: 1.5px 14px;
              border-radius: 9999px;
              font-weight: 800;
              font-size: 10.5px;
              margin-top: 1px;
              letter-spacing: 0.2px;
            }
            .grid-container {
              display: flex;
              gap: 6px;
              margin-bottom: 6px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: transparent;
            }
            .card-box {
              flex: 1;
              background: transparent !important;
              border: 1.5px solid #000000;
              border-radius: 4px;
              padding: 5px 8px;
              font-size: 10.5px;
            }
            .card-box-header {
              font-weight: 800;
              font-size: 10px;
              color: #000000 !important;
              border-bottom: 1px solid #000000;
              padding-bottom: 2px;
              margin-bottom: 3px;
              text-transform: uppercase;
              background: transparent;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 1.5px 0;
              font-size: 10.5px;
              background: transparent;
            }
            .info-item .label {
              font-weight: 700;
              color: #000000 !important;
            }
            .info-item .value {
              font-weight: 600;
              color: #000000 !important;
              text-align: right;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 3px;
              font-size: 10.5px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: transparent !important;
            }
            table.items-table tr {
              background: transparent !important;
            }
            table.items-table th {
              background: #000000 !important;
              color: #ffffff !important;
              padding: 4.5px 6px;
              font-weight: 800;
              font-size: 10.5px;
              border: 1px solid #000000 !important;
            }
            table.items-table td {
              padding: 4px 6px;
              border: 1px solid #000000 !important;
              font-size: 10.5px;
              vertical-align: middle;
              background: transparent !important;
              color: #000000 !important;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .totals-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-top: 6px;
              gap: 10px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: transparent;
            }
            .notes-box {
              flex: 1;
              background: transparent !important;
              border: 1px solid #000000;
              border-radius: 4px;
              padding: 5px 7px;
              font-size: 9.5px;
              color: #000000 !important;
            }
            .totals-box {
              width: 260px;
              background: transparent !important;
              border: 1.5px solid #000000;
              border-radius: 4px;
              padding: 5px 7px;
              font-size: 10.5px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 1.5px 0;
              font-size: 10.5px;
              color: #000000 !important;
              background: transparent;
            }
            .totals-row.grand {
              border-top: 1.5px solid #000000;
              border-bottom: 1.5px solid #000000;
              background: transparent !important;
              padding: 3px 0;
              margin: 3px 0;
              font-weight: 800;
              font-size: 12px;
              color: #000000 !important;
            }
            .totals-row.due {
              font-weight: 800;
              color: #000000 !important;
              font-size: 11px;
              padding-top: 2px;
            }
            .signatures-row {
              display: flex;
              justify-content: space-between;
              margin-top: 18px;
              margin-bottom: 2px;
              padding-top: 2px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: transparent;
            }
            .signature-block {
              text-align: center;
              width: 30%;
              border-top: 1px dashed #000000;
              padding-top: 3px;
              font-size: 9.5px;
              font-weight: 700;
              color: #000000 !important;
              background: transparent;
            }
            .footer-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px dashed #000000;
              padding-top: 4px;
              margin-top: 6px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: transparent;
            }
            .system-notice {
              text-align: center;
              font-size: 8.5px;
              color: #000000 !important;
              margin-top: 3px;
            }
            .watermark-container {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 320px;
              height: 320px;
              pointer-events: none;
              z-index: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0.25;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .watermark-logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
              filter: grayscale(100%);
            }
            .invoice-wrapper {
              position: relative;
              z-index: 1;
            }
          </style>
        </head>
        <body>
          <div class="watermark-container">
            <img src="${boardSettings?.logoUrl || '/images/logo.jpeg'}" alt="Watermark Logo" class="watermark-logo" />
          </div>
          <div class="invoice-wrapper">
            <div class="header-container">
              <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
              <h1 class="board-title">${boardSettings?.siteTitle || "নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ"}</h1>
              <p class="sub-title">কেন্দ্রীয় কার্যালয় ও পরীক্ষা নিয়ন্ত্রণ বিভাগ — অফিসিয়াল ইনভয়েস</p>
              <p class="board-address">${boardSettings?.address || "প্রধান কার্যালয়: মুহাম্মাদনগর বড় মাদরাসা, মাদরাসা সড়ক, জলমা - ৯২৬০, লবণচরা, খুলনা।"} | হেল্পলাইন: ${boardSettings?.contactPhone || "০১৮২০-৫৮০৫৬০"}</p>
              <span class="invoice-pill">${isQuestion ? "অফিসিয়াল প্রশ্নপত্র অর্ডার ইনভয়েস ও ক্যাশ মেমো" : "অফিসিয়াল অর্ডার ইনভয়েস ও ক্যাশ মেমো"}</span>
            </div>

            <div class="grid-container">
              <div class="card-box">
                <div class="card-box-header">গ্রাহক ও মাদরাসার তথ্য</div>
                <div class="info-item">
                  <span class="label">মাদরাসা / প্রতিষ্ঠান:</span>
                  <span class="value">${order.instituteId || "সাধারণ / অনির্ধারিত"}</span>
                </div>
                <div class="info-item">
                  <span class="label">মুহতামিম / দায়িত্বশীল:</span>
                  <span class="value">${order.customerName || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="label">মোবাইল নম্বর:</span>
                  <span class="value">${order.customerPhone || "N/A"}</span>
                </div>
                ${
                  order.notes
                    ? `
                  <div class="info-item" style="border-top: 1px dashed #000000; margin-top: 2px; padding-top: 2px;">
                    <span class="label">ঠিকানা:</span>
                    <span class="value" style="font-size: 9.5px; max-width: 60%;">${cleanAddressNotes(order.notes) || order.notes}</span>
                  </div>
                `
                    : ""
                }
              </div>

              <div class="card-box">
                <div class="card-box-header">ইনভয়েস ও অর্ডার বিবরণ</div>
                <div class="info-item">
                  <span class="label">ইনভয়েস নম্বর:</span>
                  <span class="value" style="font-family: monospace; font-size: 12px; font-weight: 800;">${order.invoiceId}</span>
                </div>
                <div class="info-item">
                  <span class="label">তারিখ ও সময়:</span>
                  <span class="value">${new Date(order.createdAt).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div class="info-item">
                  <span class="label">অর্ডার অবস্থা:</span>
                  <span class="value" style="font-weight: 800;">${getStatusText(order.status)}</span>
                </div>
                <div class="info-item">
                  <span class="label">ডেলিভারি কুরিয়ার:</span>
                  <span class="value">${courierName}</span>
                </div>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th class="text-center" style="width: 36px;">ক্র.নং</th>
                  <th class="text-left">${isQuestion ? "প্রশ্ন ও বিষয়সমূহ" : "বই ও স্টেশনারি বিবরণ"}</th>
                  <th class="text-center" style="width: 55px;">পরিমাণ</th>
                  <th class="text-right" style="width: 75px;">একক মূল্য</th>
                  <th class="text-right" style="width: 85px;">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody>
                ${displayItems
                  .map((i: any, idx: number) => {
                    const uPrice = Number(i.unitPrice || 0);
                    const lineTotal = i.quantity * uPrice;
                    const pName = i.product?.name || i.name || "প্রশ্নপত্র সেট";
                    const subjects = i.product?.description && !i.product.description.includes('কেন্দ্রীয়') ? i.product.description : '';
                    return `
                    <tr>
                      <td class="text-center" style="font-weight: 700;">${String(idx + 1).padStart(2, "0")}</td>
                      <td class="text-left">
                        <strong>${pName}</strong>
                        ${i.product?.className && !pName.includes(i.product.className) ? `<span style="font-size: 9.5px; font-weight: normal; margin-left: 4px;">(${i.product.className})</span>` : ''}
                        ${subjects ? `<div style="font-size: 8.5px; color: #333; margin-top: 1.5px; line-height: 1.25;">বিষয়সমূহ: ${subjects}</div>` : ''}
                      </td>
                      <td class="text-center" style="font-weight: 800;">${i.quantity}</td>
                      <td class="text-right">৳${uPrice.toFixed(2)}</td>
                      <td class="text-right" style="font-weight: 800;">৳${lineTotal.toFixed(2)}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>

            <div class="totals-container">
              <div class="notes-box">
                <strong>📌 নির্দেশনাবলী ও শর্তাবলী:</strong>
                <p style="margin: 1.5px 0;">১. প্রশ্নপত্র বা পণ্য রিসিভ করার সময় প্যাকেট ও সিল ঠিক আছে কিনা যাচাই করুন।</p>
                <p style="margin: 1.5px 0;">২. যেকোনো প্রয়োজনে ইনভয়েস নম্বরটি সংরক্ষণ করুন ও বোর্ডের হেল্পলাইনে যোগাযোগ করুন।</p>
              </div>

              <div class="totals-box">
                <div class="totals-row">
                  <span>পণ্যের মোট মূল্য:</span>
                  <span>৳${itemsSubtotal.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>কুরিয়ার চার্জ (${courierName}):</span>
                  <span>${deliveryCharge > 0 ? `৳${deliveryCharge.toFixed(2)}` : "৳০.০০ (ফ্রি)"}</span>
                </div>
                ${order.discount ? `<div class="totals-row"><span>বিশেষ ছাড়:</span><span>-৳${order.discount.toFixed(2)}</span></div>` : ""}
                <div class="totals-row" style="border-top: 1px dashed #000000; padding-top: 1.5px; font-weight: 700;">
                  <span>বর্তমান অর্ডারের বিল:</span>
                  <span>৳${order.totalAmount.toFixed(2)}</span>
                </div>
                ${dueListHtml}
                <div class="totals-row grand">
                  <span>সর্বমোট প্রদেয় বিল:</span>
                  <span>৳${grandTotalBill.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>পরিশোধিত টাকা:</span>
                  <span>৳${paidAmount.toFixed(2)}</span>
                </div>
                <div class="totals-row due">
                  <span>সর্বমোট বর্তমান বকেয়া:</span>
                  <span>${totalDue > 0 ? `৳${totalDue.toFixed(2)}` : "পরিশোধিত (০.০০)"}</span>
                </div>
              </div>
            </div>

            <div class="signatures-row">
              <div class="signature-block">গ্রাহক / মুহতামিমের স্বাক্ষর</div>
              <div class="signature-block">আদায়কারী / বুকিংকারীর স্বাক্ষর</div>
              <div class="signature-block">হিসাব ও পরীক্ষা শাখা</div>
            </div>

            <div class="footer-bar">
              <div style="text-align: left;">
                <p style="margin: 0 0 1px; font-size: 8.5px; font-weight: 700;">ট্র্যাকিং বারকোড:</p>
                ${barcodeSVG}
              </div>
              <div style="text-align: right;">
                <p style="margin: 0 0 1px; font-size: 8.5px; font-weight: 700;">অনলাইনে যাচাই করুন:</p>
                ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR" style="width: 42px; height: 42px; display: inline-block;" />` : ""}
              </div>
            </div>

            <div class="system-notice">
              এটি নূরানী তা'লীমুল কুরআন বোর্ড খুলনা বাংলাদেশ-এর একটি কম্পিউটার জেনারেটেড ডিজিটাল অফিসিয়াল ইনভয়েস।
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 350);
    };
  }
}
