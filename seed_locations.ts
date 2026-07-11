import { connect, connection, Types } from 'mongoose';
// @ts-ignore
import dotenv from 'dotenv';
import path from 'path';

// Need to define schema manually here since Next.js models might have issues running standalone
const LocationSchema = new (require('mongoose').Schema)({
  name: { type: String, required: true },
  bn_name: { type: String, required: true },
  type: { type: String, enum: ["DISTRICT", "UPAZILA", "UNION", "VILLAGE", "PARA"], required: true },
  parentId: { type: require('mongoose').Schema.Types.ObjectId, default: null },
}, { timestamps: true });

async function seed() {
  try {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI not found');

    await connect(MONGODB_URI);
    const Location = connection.model('Location', LocationSchema);

    console.log('Connected to DB, clearing existing locations...');
    await Location.deleteMany({}); // Clear existing to prevent duplicates

    // Fetch data
    console.log('Fetching Districts...');
    const dRes = await fetch('https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/districts/districts.json');
    const districtData = (await dRes.json())[1].data;

    console.log('Fetching Upazilas...');
    const uRes = await fetch('https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/upazilas/upazilas.json');
    const upazilaData = (await uRes.json())[2].data;

    console.log('Fetching Unions...');
    const unRes = await fetch('https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/unions/unions.json');
    const unionData = (await unRes.json())[2].data;

    console.log(`Found ${districtData.length} districts, ${upazilaData.length} upazilas, ${unionData.length} unions.`);

    // Map IDs to ObjectIds
    const districtIdMap = new Map();
    const upazilaIdMap = new Map();

    // Insert Districts
    console.log('Inserting Districts...');
    for (const d of districtData) {
      const loc = await Location.create({
        name: d.name,
        bn_name: d.bn_name,
        type: 'DISTRICT',
        parentId: null
      });
      districtIdMap.set(d.id, loc._id);
    }

    // Insert Upazilas
    console.log('Inserting Upazilas...');
    const upazilaBatch = [];
    for (const u of upazilaData) {
      const parentId = districtIdMap.get(u.district_id);
      if (!parentId) continue;
      
      const locId = new Types.ObjectId();
      upazilaIdMap.set(u.id, locId);

      upazilaBatch.push({
        _id: locId,
        name: u.name,
        bn_name: u.bn_name,
        type: 'UPAZILA',
        parentId: parentId
      });
    }
    await Location.insertMany(upazilaBatch);

    // Insert Unions
    console.log('Inserting Unions (this might take a moment)...');
    const unionBatch = [];
    for (const u of unionData) {
      const parentId = upazilaIdMap.get(u.upazilla_id);
      if (!parentId) continue;

      unionBatch.push({
        name: u.name,
        bn_name: u.bn_name,
        type: 'UNION',
        parentId: parentId
      });
    }
    await Location.insertMany(unionBatch);

    console.log('Successfully seeded all locations!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
