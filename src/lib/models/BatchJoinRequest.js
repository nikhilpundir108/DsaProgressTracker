import mongoose from 'mongoose';

const BatchJoinRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can have only one active/pending request per batch
BatchJoinRequestSchema.index({ studentId: 1, batchId: 1 });
BatchJoinRequestSchema.index({ batchId: 1, status: 1 });

export default mongoose.models.BatchJoinRequest || mongoose.model('BatchJoinRequest', BatchJoinRequestSchema);
