import mongoose from 'mongoose';

const uri = "mongodb+srv://khulnaboard_db_user:H5hs0SmF1htFXvLw@cluster0.rhwmae8.mongodb.net/khulnaboard?appName=Cluster0";

async function run() {
  try {
    console.log("Attempting to connect via Mongoose...");
    await mongoose.connect(uri);
    console.log("Successfully connected via Mongoose!");
    
    // Check if the User model connects
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name).join(", "));
    
  } catch(err) {
    console.error("CONNECTION FAILED!", err.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
