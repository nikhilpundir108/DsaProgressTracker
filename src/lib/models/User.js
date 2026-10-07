import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'INSTRUCTOR', 'STUDENT'],
      default: 'STUDENT',
      required: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    supabaseId: {
      type: String,
      unique: true,
      sparse: true,
    },
    instructorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    collegeRollNo: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    leetcodeHandle: {
      type: String,
      trim: true,
    },
    gfgHandle: {
      type: String,
      trim: true,
    },
    leetcodeStats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      recentSubmissions: [
        {
          title: String,
          slug: String,
          timestamp: Date,
          statusDisplay: String,
          lang: String,
        },
      ],
      lastFetched: Date,
    },
    gfgStats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      codingScore: { type: Number, default: 0 },
      recentSubmissions: [
        {
          title: String,
          slug: String,
          timestamp: Date,
        },
      ],
      lastFetched: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Password compare helper
UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
