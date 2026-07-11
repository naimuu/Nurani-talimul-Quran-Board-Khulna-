import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bn_name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["DISTRICT", "UPAZILA", "UNION", "VILLAGE", "PARA"], 
      required: true 
    },
    parentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Location", 
      default: null 
    },
  },
  { timestamps: true }
);

// Optimize querying children of a specific location
LocationSchema.index({ parentId: 1, type: 1 });

const Location = mongoose.models.Location || mongoose.model("Location", LocationSchema);
export default Location;
