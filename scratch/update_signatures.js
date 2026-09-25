const fs = require('fs');
const mongoose = require('mongoose');

async function main() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/DATABASE_URL=([^\r\n]+)/);
  if (!match) {
    console.error('No DATABASE_URL found in .env');
    process.exit(1);
  }
  const uri = match[1].replace(/["']/g, '').trim();
  console.log('Connecting to Mongo...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('inspectionreports');
  
  const elegantSignatureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><path d="M 20 40 Q 45 10 70 38 T 115 32 Q 145 18 175 38 Q 155 46 135 44 T 95 48 M 40 26 Q 60 14 85 18" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const signatureDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(elegantSignatureSvg)}`;

  const reports = await col.find({}).toArray();
  console.log('Found', reports.length, 'reports in DB');

  let updatedCount = 0;
  for (const r of reports) {
    if (r.signatureUrl && (r.signatureUrl.includes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB') || r.signatureUrl.length < 150)) {
      console.log('Replacing 1x1 green dummy signature for report:', r.trackingNo);
      await col.updateOne({ _id: r._id }, { $set: { signatureUrl: signatureDataUrl } });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} reports with clean dark-ink signature.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
