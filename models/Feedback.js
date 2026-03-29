import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    enum: ['General', 'Bug Report', 'Feature Request', 'UI/UX', 'Performance'],
    default: 'General'
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
