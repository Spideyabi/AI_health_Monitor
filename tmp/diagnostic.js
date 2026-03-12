const mongoose = require('mongoose');

// Mocking User Schema for diagnostics
const UserSchema = new mongoose.Schema({
  email: String,
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  healthHistory: String,
  customReports: Array
});

async function runDiagnostics() {
  const MONGODB_URI = "mongodb://localhost:27017/wellbeing-vitals"; // Adjusted based on previous context or assumptions
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for diagnostics...");
    
    // Check for demo user
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const users = await User.find({ email: "demo@vitals.ai" });
    
    console.log(`Found ${users.length} users with email demo@vitals.ai`);
    
    if (users.length > 0) {
      const user = users[0];
      console.log("--- Demo User Profile Stats ---");
      console.log(`Name: ${user.name}`);
      console.log(`Age: ${user.age} (${typeof user.age})`);
      console.log(`Gender: ${user.gender}`);
      console.log(`Weight: ${user.weight}`);
      console.log(`Height: ${user.height}`);
      console.log(`History: ${user.healthHistory ? 'Present (' + user.healthHistory.length + ' chars)' : 'Missing'}`);
      console.log(`Reports: ${user.customReports ? user.customReports.length : 0}`);
    } else {
      console.log("No demo user found in the database.");
    }

  } catch (error) {
    console.error("DIAGNOSTIC ERROR:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runDiagnostics();
