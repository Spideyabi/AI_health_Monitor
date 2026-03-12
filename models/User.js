import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  age: { type: Number },
  gender: { type: String },
  weight: { type: Number }, // in kg
  height: { type: Number }, // in cm
  healthHistory: { type: String, default: "" },
  customReports: [{
    title: String,
    fileName: String,
    fileData: String, // Base64 or URL
    uploadDate: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Force model re-compilation in development to handle schema changes correctly
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
