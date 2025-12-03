// Simple test to verify MongoDB connection and basic setup
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ MongoDB connection successful');
    const db = client.db('proyecto3_test_db');
    const collections = await db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections`);
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
