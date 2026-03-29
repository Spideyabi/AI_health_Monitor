import mongoose from 'mongoose';

const DailyVitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  day: String, // e.g. "Mon"
  sleep: Number,
  distance: Number,
  screenTime: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one record per user per day
DailyVitalsSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyVitals || mongoose.model('DailyVitals', DailyVitalsSchema);
