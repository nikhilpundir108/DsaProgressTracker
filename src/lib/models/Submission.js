import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    questionSlug: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['LEETCODE', 'GFG'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'LATE'],
      default: 'PENDING',
    },
    solvedAt: {
      type: Date,
    },
    lastCheckedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ studentId: 1, assignmentId: 1, questionSlug: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
