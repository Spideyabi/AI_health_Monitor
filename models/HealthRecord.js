import mongoose from 'mongoose';

const HealthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  diet: String,
  symptoms: String,
  severity: String,
    diagnosis: {
    type: { type: String },
    title: String,
    desc: String,
    advice: [String],
    doctor: String,
    aiInsights: [String],
    treatmentPlan: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);
