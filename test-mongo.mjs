import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://khulnaboard_db_user:H5hs0SmF1htFXvLw@cluster0.rhwmae8.mongodb.net/khulnaboard?appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(err) {
    console.error("========================");
    console.error("CONNECTION FAILED!");
    console.error("========================");
    console.error(err.message);
  } finally {
    await client.close();
  }
}
run();
