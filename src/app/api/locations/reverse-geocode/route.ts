import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Location from "@/lib/models/Location";

// Normalize Bengali characters and nuktas
function normalizeBengali(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFC")
    .replace(/[\u09dc]/g, "\u09a1\u09bc") // ড় -> ড়
    .replace(/[\u09dd]/g, "\u09a2\u09bc") // ঢ় -> ঢ়
    .replace(/[\u09df]/g, "\u09af\u09bc") // য় -> য়
    .toLowerCase()
    .trim();
}

function cleanLocationName(str: string): string {
  if (!str) return "";
  return str
    .replace(/(জেলা|বিভাগ|উপজেলা|থানা|পৌরসভা|সদর|District|Division|Upazila|Thana|Pourashava|Municipality|Sadar)/gi, "")
    .trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: "Latitude and Longitude are required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid coordinates format" },
        { status: 400 }
      );
    }

    // Call OpenStreetMap Nominatim reverse geocoder
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=bn,en`;
    
    let osmData: any = null;
    try {
      const osmRes = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "NuraniBoardKhulnaApp/1.0 (info@nuraniboard.org)",
          "Accept": "application/json",
        },
        next: { revalidate: 60 },
      });
      if (osmRes.ok) {
        osmData = await osmRes.json();
      }
    } catch (fetchErr) {
      console.error("OSM Nominatim fetch error:", fetchErr);
    }

    if (!osmData || !osmData.address) {
      return NextResponse.json({
        success: false,
        error: "লোকেশন থেকে ঠিকানা শনাক্ত করা সম্ভব হয়নি",
        lat,
        lng,
      });
    }

    const addr = osmData.address;
    await connectDB();

    // 1. Fetch all districts from database
    const allDistricts: any[] = await Location.find({ type: "DISTRICT" }).lean();

    // District Candidates from OSM
    const rawDistrictCandidates = [
      addr.state_district,
      addr.county,
      addr.city,
      addr.state,
    ].filter(Boolean);

    let matchedDistrict: any = null;

    for (const cand of rawDistrictCandidates) {
      const cleaned = cleanLocationName(cand);
      const normCleaned = normalizeBengali(cleaned);
      const normRaw = normalizeBengali(cand);

      matchedDistrict = allDistricts.find((d) => {
        const normBn = normalizeBengali(d.bn_name);
        const normEn = normalizeBengali(d.name);
        return (
          normBn === normCleaned ||
          normCleaned.includes(normBn) ||
          normRaw.includes(normBn) ||
          (normEn && normCleaned.includes(normEn))
        );
      });

      if (matchedDistrict) break;
    }

    let matchedUpazila: any = null;
    let upazilasOfDistrict: any[] = [];

    if (matchedDistrict) {
      upazilasOfDistrict = await Location.find({
        type: "UPAZILA",
        parentId: matchedDistrict._id,
      }).lean();

      // Upazila Candidates from OSM
      const rawUpazilaCandidates = [
        addr.subdistrict,
        addr.county,
        addr.town,
        addr.municipality,
        addr.city_district,
        addr.city,
      ].filter(Boolean);

      for (const cand of rawUpazilaCandidates) {
        const cleaned = cleanLocationName(cand);
        const normCleaned = normalizeBengali(cleaned);
        const normRaw = normalizeBengali(cand);

        matchedUpazila = upazilasOfDistrict.find((u) => {
          const normBn = normalizeBengali(u.bn_name);
          const normEn = normalizeBengali(u.name);
          const normBnCleaned = normalizeBengali(cleanLocationName(u.bn_name));

          return (
            normBn === normCleaned ||
            normBnCleaned === normCleaned ||
            normCleaned.includes(normBn) ||
            normBn.includes(normCleaned) ||
            normRaw.includes(normBn) ||
            (normEn && (normCleaned.includes(normEn) || normEn.includes(normCleaned)))
          );
        });

        if (matchedUpazila) break;
      }
    }

    // Resolve Division: From District parentId or OSM state/region
    let matchedDivision: any = null;
    if (matchedDistrict && matchedDistrict.parentId) {
      matchedDivision = await Location.findById(matchedDistrict.parentId).lean();
    }
    if (!matchedDivision) {
      const allDivisions: any[] = await Location.find({ type: "DIVISION" }).lean();
      const rawDivisionCandidates = [addr.state, addr.region].filter(Boolean);
      for (const cand of rawDivisionCandidates) {
        const cleaned = cleanLocationName(cand);
        const normCleaned = normalizeBengali(cleaned);
        matchedDivision = allDivisions.find((d) => {
          const normBn = normalizeBengali(d.bn_name);
          const normEn = normalizeBengali(d.name);
          return (
            normBn === normCleaned ||
            normCleaned.includes(normBn) ||
            (normEn && normCleaned.includes(normEn))
          );
        });
        if (matchedDivision) break;
      }
    }

    // Resolve Union: From Upazila children if available
    let matchedUnion: any = null;
    if (matchedUpazila) {
      const unionsOfUpazila: any[] = await Location.find({
        type: "UNION",
        parentId: matchedUpazila._id,
      }).lean();

      const rawUnionCandidates = [
        addr.suburb,
        addr.neighbourhood,
        addr.village,
        addr.quarter,
        addr.city_district,
      ].filter(Boolean);

      for (const cand of rawUnionCandidates) {
        const cleaned = cleanLocationName(cand);
        const normCleaned = normalizeBengali(cleaned);
        matchedUnion = unionsOfUpazila.find((u) => {
          const normBn = normalizeBengali(u.bn_name);
          const normEn = normalizeBengali(u.name);
          return (
            normBn === normCleaned ||
            normCleaned.includes(normBn) ||
            normBn.includes(normCleaned) ||
            (normEn && normCleaned.includes(normEn))
          );
        });
        if (matchedUnion) break;
      }
    }

    // Keep village and postOffice empty so manual inputs stay clean and protected from wrong/demo fills (e.g. zipcodes "1100")
    return NextResponse.json({
      success: true,
      division: matchedDivision ? matchedDivision.bn_name : null,
      divisionEnglish: matchedDivision ? matchedDivision.name : null,
      district: matchedDistrict ? matchedDistrict.bn_name : null,
      districtEnglish: matchedDistrict ? matchedDistrict.name : null,
      upazila: matchedUpazila ? matchedUpazila.bn_name : null,
      upazilaEnglish: matchedUpazila ? matchedUpazila.name : null,
      union: matchedUnion ? matchedUnion.bn_name : null,
      unionEnglish: matchedUnion ? matchedUnion.name : null,
      village: "",
      postOffice: "",
      formattedAddress: osmData.display_name,
      lat,
      lng,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Internal server error during reverse geocoding" },
      { status: 500 }
    );
  }
}
