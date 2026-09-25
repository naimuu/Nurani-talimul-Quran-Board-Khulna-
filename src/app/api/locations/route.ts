import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Location from "@/lib/models/Location";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const upazila = searchParams.get("upazila");
    const type = searchParams.get("type");

    await connectDB();

    const query: any = {};

    if (type) {
      query.type = type.toUpperCase();
    }

    if (division) {
      const divLoc: any = await Location.findOne({
        type: "DIVISION",
        $or: [
          { bn_name: division },
          { name: new RegExp(`^${division}$`, "i") },
          ...(mongoose.isValidObjectId(division) ? [{ _id: division }] : []),
        ],
      }).lean();

      if (divLoc) {
        query.parentId = divLoc._id;
        query.type = "DISTRICT";
      } else {
        return NextResponse.json({ success: true, locations: [] });
      }
    } else if (district) {
      // Find district by bn_name or name
      const distLoc: any = await Location.findOne({
        type: "DISTRICT",
        $or: [
          { bn_name: district },
          { name: new RegExp(`^${district}$`, "i") },
          ...(mongoose.isValidObjectId(district) ? [{ _id: district }] : []),
        ],
      }).lean();

      if (distLoc) {
        query.parentId = distLoc._id;
        query.type = "UPAZILA";
      } else {
        return NextResponse.json({ success: true, locations: [] });
      }
    } else if (upazila) {
      // Find upazila by bn_name or name
      const upzLoc: any = await Location.findOne({
        type: "UPAZILA",
        $or: [
          { bn_name: upazila },
          { name: new RegExp(`^${upazila}$`, "i") },
          ...(mongoose.isValidObjectId(upazila) ? [{ _id: upazila }] : []),
        ],
      }).lean();

      if (upzLoc) {
        query.parentId = upzLoc._id;
        query.type = "UNION";
      } else {
        return NextResponse.json({ success: true, locations: [] });
      }
    } else if (parentId) {
      if (parentId === "null") {
        query.parentId = null;
      } else if (mongoose.isValidObjectId(parentId)) {
        query.parentId = parentId;
      } else {
        const parentLoc: any = await Location.findOne({
          $or: [
            { name: new RegExp(`^${parentId}$`, "i") },
            { bn_name: parentId },
          ],
        }).lean();

        if (parentLoc) {
          query.parentId = parentLoc._id;
        } else {
          return NextResponse.json({ success: true, locations: [] });
        }
      }
    }

    const locations = await Location.find(query).sort({ bn_name: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
