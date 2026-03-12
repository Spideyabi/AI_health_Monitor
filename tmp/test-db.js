const { MongoClient } = require('mongodb');

// Test individual shards and the full set
const shards = [
    "ac-egyhcab-shard-00-00.t7szlz4.mongodb.net:27017",
    "ac-egyhcab-shard-00-01.t7szlz4.mongodb.net:27017",
    "ac-egyhcab-shard-00-02.t7szlz4.mongodb.net:27017"
];
const user = "abhiabi957_db_user";
const pass = "ISLUI2nHnoLjtETM";

async function testShard(host) {
    const uri = `mongodb://${user}:${pass}@${host}/vitals_ai?ssl=true&authSource=admin&directConnection=true`;
    console.log(`\n--- Testing Shard: ${host} ---`);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        const isMaster = await client.db("admin").command({ isMaster: 1 });
        console.log(`✅ SUCCESS: Connected to ${host}`);
        console.log(`   Is Primary: ${isMaster.ismaster}`);
        console.log(`   Replica Set: ${isMaster.setName}`);
    } catch (err) {
        console.error(`❌ FAILED: ${host}`);
        console.error(`   Error: ${err.message}`);
    } finally {
        await client.close();
    }
}

async function runTests() {
    for (const shard of shards) {
        await testShard(shard);
    }
}

runTests();
