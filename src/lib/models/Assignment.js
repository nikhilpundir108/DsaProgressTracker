import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String,
    enum: ['LEETCODE', 'GFG'],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'School', 'Basic'],
    default: 'Easy',
  },
  topic: {
    type: String,
    default: 'General',
    trim: true,
  },
});

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    questions: [QuestionSchema],
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index({ batchId: 1 });
AssignmentSchema.index({ instructorId: 1 });

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
