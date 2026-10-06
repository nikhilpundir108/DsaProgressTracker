const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dsatrack';

// Simple standalone seed script
async function run() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const UserSchema = new mongoose.Schema({}, { strict: false });
  const BatchSchema = new mongoose.Schema({}, { strict: false });
  const BatchJoinRequestSchema = new mongoose.Schema({}, { strict: false });
  const AssignmentSchema = new mongoose.Schema({}, { strict: false });
  const SubmissionSchema = new mongoose.Schema({}, { strict: false });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
  const BatchJoinRequest = mongoose.models.BatchJoinRequest || mongoose.model('BatchJoinRequest', BatchJoinRequestSchema);
  const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
  const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

  await User.deleteMany({});
  await Batch.deleteMany({});
  await BatchJoinRequest.deleteMany({});
  await Assignment.deleteMany({});
  await Submission.deleteMany({});

  const defaultPassword = 'password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Super Admin
  const admin = await User.create({
    name: 'Super Administrator',
    email: 'admin@mit.ac.in',
    password: adminHashedPassword,
    role: 'SUPER_ADMIN',
    instructorId: 'ADMIN001',
    isActive: true,
    isProfileComplete: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. Create Instructors
  const instructor1 = await User.create({
    name: 'Prof. Rahul Sharma',
    email: 'rahul@mit.ac.in',
    password: hashedPassword,
    role: 'INSTRUCTOR',
    instructorId: 'INS001',
    phone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    isActive: true,
    isProfileComplete: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const instructor2 = await User.create({
    name: 'Dr. Sunita Verma',
    email: 'sunita@miet.ac.in',
    password: hashedPassword,
    role: 'INSTRUCTOR',
    instructorId: 'INS002',
    phone: '+91 98765 43211',
    department: 'Information Technology',
    isActive: true,
    isProfileComplete: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const instructor3 = await User.create({
    name: 'Prof. Amit Patel',
    email: 'amit@mit.ac.in',
    password: hashedPassword,
    role: 'INSTRUCTOR',
    instructorId: 'INS003',
    phone: '+91 98765 43212',
    department: 'Computer Science & Engineering',
    isActive: false,
    isProfileComplete: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Create Students
  const studentsData = [
    {
      name: 'Nikhil Kumar',
      email: 'nikhil@mit.ac.in',
      collegeRollNo: '22CS084',
      branch: 'CSE',
      section: 'A',
      graduationYear: '2026',
      leetcodeHandle: 'nikhil123',
      gfgHandle: 'nikhil_dsa',
      leetcodeStats: {
        totalSolved: 132,
        easySolved: 70,
        mediumSolved: 50,
        hardSolved: 12,
        ranking: 84210,
        contestRating: 1680,
        recentSubmissions: [
          { title: 'Two Sum', slug: 'two-sum', timestamp: new Date(Date.now() - 3600000 * 5) },
          { title: 'Missing Number', slug: 'missing-number', timestamp: new Date(Date.now() - 3600000 * 12) },
          { title: 'Maximum Subarray', slug: 'maximum-subarray', timestamp: new Date(Date.now() - 3600000 * 24) },
          { title: 'Binary Search', slug: 'binary-search', timestamp: new Date(Date.now() - 3600000 * 48) },
          { title: 'Merge Sorted Array', slug: 'merge-sorted-array', timestamp: new Date(Date.now() - 3600000 * 72) },
          { title: 'Reverse Linked List', slug: 'reverse-linked-list', timestamp: new Date(Date.now() - 3600000 * 96) },
        ],
      },
      gfgStats: {
        totalSolved: 185,
        easySolved: 95,
        mediumSolved: 70,
        hardSolved: 20,
        codingScore: 1240,
        recentSubmissions: [
          { title: 'Subarray with given sum', slug: 'subarray-with-given-sum', timestamp: new Date() },
          { title: 'Kadane Algorithm', slug: 'kadanes-algorithm', timestamp: new Date() },
        ],
      },
      isProfileComplete: true,
      isActive: true,
    },
    {
      name: 'Aman Gupta',
      email: 'aman@mit.ac.in',
      collegeRollNo: '22CS012',
      branch: 'CSE',
      section: 'A',
      graduationYear: '2026',
      leetcodeHandle: 'aman_g',
      gfgHandle: 'aman_dev',
      leetcodeStats: {
        totalSolved: 98,
        easySolved: 55,
        mediumSolved: 35,
        hardSolved: 8,
        ranking: 142000,
        contestRating: 1540,
        recentSubmissions: [
          { title: 'Two Sum', slug: 'two-sum', timestamp: new Date(Date.now() - 3600000 * 8) },
          { title: 'Missing Number', slug: 'missing-number', timestamp: new Date(Date.now() - 3600000 * 16) },
          { title: 'Binary Search', slug: 'binary-search', timestamp: new Date(Date.now() - 3600000 * 30) },
        ],
      },
      gfgStats: {
        totalSolved: 145,
        easySolved: 80,
        mediumSolved: 50,
        hardSolved: 15,
        codingScore: 920,
      },
      isProfileComplete: true,
      isActive: true,
    },
    {
      name: 'Priya Singh',
      email: 'priya@miet.ac.in',
      collegeRollNo: '22IT045',
      branch: 'IT',
      section: 'A',
      graduationYear: '2026',
      leetcodeHandle: 'priya_code',
      gfgHandle: 'priya_it',
      leetcodeStats: {
        totalSolved: 82,
        easySolved: 50,
        mediumSolved: 28,
        hardSolved: 4,
        ranking: 185000,
        contestRating: 1490,
      },
      gfgStats: {
        totalSolved: 110,
        easySolved: 65,
        mediumSolved: 35,
        hardSolved: 10,
        codingScore: 780,
      },
      isProfileComplete: true,
      isActive: true,
    },
    {
      name: 'Rohit Verma',
      email: 'rohit@mit.ac.in',
      collegeRollNo: '22CS102',
      branch: 'CSE',
      section: 'A',
      graduationYear: '2026',
      leetcodeHandle: 'rohit_v',
      gfgHandle: 'rohit_gfg',
      leetcodeStats: {
        totalSolved: 155,
        easySolved: 75,
        mediumSolved: 62,
        hardSolved: 18,
        ranking: 65000,
        contestRating: 1740,
      },
      gfgStats: {
        totalSolved: 210,
        easySolved: 100,
        mediumSolved: 85,
        hardSolved: 25,
        codingScore: 1420,
      },
      isProfileComplete: true,
      isActive: true,
    },
    {
      name: 'Sneha Roy',
      email: 'sneha@mit.ac.in',
      collegeRollNo: '22CS120',
      branch: 'CSE',
      section: 'A',
      graduationYear: '2026',
      leetcodeHandle: 'sneha_r',
      gfgHandle: 'sneha_dsa',
      leetcodeStats: {
        totalSolved: 65,
        easySolved: 45,
        mediumSolved: 18,
        hardSolved: 2,
        ranking: 230000,
        contestRating: 1420,
      },
      gfgStats: {
        totalSolved: 85,
        easySolved: 50,
        mediumSolved: 30,
        hardSolved: 5,
        codingScore: 540,
      },
      isProfileComplete: true,
      isActive: true,
    },
    {
      name: 'Tanmay Joshi',
      email: 'tanmay@mit.ac.in',
      collegeRollNo: '22CS144',
      branch: 'CSE',
      section: 'B',
      graduationYear: '2026',
      leetcodeHandle: 'tanmay_j',
      gfgHandle: 'tanmay_code',
      leetcodeStats: {
        totalSolved: 110,
        easySolved: 60,
        mediumSolved: 40,
        hardSolved: 10,
        ranking: 110000,
        contestRating: 1610,
      },
      gfgStats: {
        totalSolved: 130,
        easySolved: 70,
        mediumSolved: 45,
        hardSolved: 15,
        codingScore: 890,
      },
      isProfileComplete: true,
      isActive: true,
    },
    {
      name: 'Kavya Sharma',
      email: 'kavya@mit.ac.in',
      collegeRollNo: '',
      isProfileComplete: false,
      isActive: true,
    }
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const student = await User.create({
      ...s,
      role: 'STUDENT',
      googleId: `google_mock_${s.email.split('@')[0]}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdStudents.push(student);
  }

  // 4. Create Batches
  const batch1 = await Batch.create({
    name: 'CSE DSA 2026 - Sec A',
    code: 'DSA-CSE-A26',
    branch: 'CSE',
    section: 'A',
    academicYear: '2026',
    description: 'Data Structures and Algorithms core coursework for 3rd Year CSE Section A.',
    instructorId: instructor1._id,
    students: [
      createdStudents[0]._id, // Nikhil
      createdStudents[1]._id, // Aman
      createdStudents[3]._id, // Rohit
      createdStudents[4]._id, // Sneha
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const batch2 = await Batch.create({
    name: 'CSE DSA 2026 - Sec B',
    code: 'DSA-CSE-B26',
    branch: 'CSE',
    section: 'B',
    academicYear: '2026',
    description: 'Data Structures and Algorithms core coursework for 3rd Year CSE Section B.',
    instructorId: instructor1._id,
    students: [
      createdStudents[5]._id, // Tanmay
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const batch3 = await Batch.create({
    name: 'IT Data Structures 2026',
    code: 'DSA-IT-A26',
    branch: 'IT',
    section: 'A',
    academicYear: '2026',
    description: 'Advanced Data Structures & Competitive Programming Track for IT Section A.',
    instructorId: instructor2._id,
    students: [
      createdStudents[2]._id, // Priya
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 5. Create Join Requests
  await BatchJoinRequest.create({
    studentId: createdStudents[5]._id, // Tanmay
    batchId: batch1._id,
    status: 'PENDING',
    requestedAt: new Date(Date.now() - 3600000 * 14),
  });

  await BatchJoinRequest.create({
    studentId: createdStudents[2]._id, // Priya
    batchId: batch1._id,
    status: 'PENDING',
    requestedAt: new Date(Date.now() - 3600000 * 2),
  });

  // 6. Create Assignments
  const assign1 = await Assignment.create({
    title: 'Array Practice — Week 1',
    description: 'Core fundamental array patterns including Two Pointers, Prefix Sum, and Kadane algorithm.',
    batchId: batch1._id,
    instructorId: instructor1._id,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    questions: [
      { title: 'Two Sum', platform: 'LEETCODE', url: 'https://leetcode.com/problems/two-sum/', slug: 'two-sum', difficulty: 'Easy', topic: 'Array' },
      { title: 'Missing Number', platform: 'LEETCODE', url: 'https://leetcode.com/problems/missing-number/', slug: 'missing-number', difficulty: 'Easy', topic: 'Array' },
      { title: 'Best Time to Buy and Sell Stock', platform: 'LEETCODE', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', topic: 'Array' },
      { title: 'Maximum Subarray', platform: 'LEETCODE', url: 'https://leetcode.com/problems/maximum-subarray/', slug: 'maximum-subarray', difficulty: 'Medium', topic: 'Array' },
      { title: 'Binary Search', platform: 'LEETCODE', url: 'https://leetcode.com/problems/binary-search/', slug: 'binary-search', difficulty: 'Easy', topic: 'Binary Search' },
      { title: 'Merge Sorted Array', platform: 'LEETCODE', url: 'https://leetcode.com/problems/merge-sorted-array/', slug: 'merge-sorted-array', difficulty: 'Easy', topic: 'Array' },
      { title: 'Product of Array Except Self', platform: 'LEETCODE', url: 'https://leetcode.com/problems/product-of-array-except-self/', slug: 'product-of-array-except-self', difficulty: 'Medium', topic: 'Array' },
      { title: 'Rotate Array', platform: 'LEETCODE', url: 'https://leetcode.com/problems/rotate-array/', slug: 'rotate-array', difficulty: 'Medium', topic: 'Array' },
      { title: 'Majority Element', platform: 'LEETCODE', url: 'https://leetcode.com/problems/majority-element/', slug: 'majority-element', difficulty: 'Easy', topic: 'Array' },
      { title: 'Move Zeroes', platform: 'LEETCODE', url: 'https://leetcode.com/problems/move-zeroes/', slug: 'move-zeroes', difficulty: 'Easy', topic: 'Array' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const assign2 = await Assignment.create({
    title: 'Two Pointers & Linked Lists — Week 2',
    description: 'Master in-place pointer manipulation and fast/slow pointer algorithms.',
    batchId: batch1._id,
    instructorId: instructor1._id,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    questions: [
      { title: 'Reverse Linked List', platform: 'LEETCODE', url: 'https://leetcode.com/problems/reverse-linked-list/', slug: 'reverse-linked-list', difficulty: 'Easy', topic: 'Linked List' },
      { title: '3Sum', platform: 'LEETCODE', url: 'https://leetcode.com/problems/3sum/', slug: '3sum', difficulty: 'Medium', topic: 'Two Pointers' },
      { title: 'Container With Most Water', platform: 'LEETCODE', url: 'https://leetcode.com/problems/container-with-most-water/', slug: 'container-with-most-water', difficulty: 'Medium', topic: 'Two Pointers' },
      { title: 'Valid Parentheses', platform: 'LEETCODE', url: 'https://leetcode.com/problems/valid-parentheses/', slug: 'valid-parentheses', difficulty: 'Easy', topic: 'Stack' },
      { title: 'Detect Loop in linked list', platform: 'GFG', url: 'https://practice.geeksforgeeks.org/problems/detect-loop-in-linked-list/1', slug: 'detect-loop-in-linked-list', difficulty: 'Medium', topic: 'Linked List' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 7. Submissions for Nikhil (6 / 10)
  const nikhilCompletedSlugs = ['two-sum', 'missing-number', 'best-time-to-buy-and-sell-stock', 'maximum-subarray', 'binary-search', 'merge-sorted-array'];
  for (const q of assign1.questions) {
    const isCompleted = nikhilCompletedSlugs.includes(q.slug);
    await Submission.create({
      studentId: createdStudents[0]._id,
      assignmentId: assign1._id,
      questionSlug: q.slug,
      platform: q.platform,
      status: isCompleted ? 'COMPLETED' : 'PENDING',
      solvedAt: isCompleted ? new Date(Date.now() - 3600000 * 12) : null,
      lastCheckedAt: new Date(),
    });
  }

  // Rohit completed 10
  for (const q of assign1.questions) {
    await Submission.create({
      studentId: createdStudents[3]._id,
      assignmentId: assign1._id,
      questionSlug: q.slug,
      platform: q.platform,
      status: 'COMPLETED',
      solvedAt: new Date(Date.now() - 3600000 * 20),
      lastCheckedAt: new Date(),
    });
  }

  // Aman completed 8
  const amanCompletedSlugs = ['two-sum', 'missing-number', 'binary-search', 'merge-sorted-array', 'majority-element', 'move-zeroes', 'best-time-to-buy-and-sell-stock', 'maximum-subarray'];
  for (const q of assign1.questions) {
    const isCompleted = amanCompletedSlugs.includes(q.slug);
    await Submission.create({
      studentId: createdStudents[1]._id,
      assignmentId: assign1._id,
      questionSlug: q.slug,
      platform: q.platform,
      status: isCompleted ? 'COMPLETED' : 'PENDING',
      solvedAt: isCompleted ? new Date(Date.now() - 3600000 * 24) : null,
      lastCheckedAt: new Date(),
    });
  }

  // Sneha completed 4
  const snehaCompletedSlugs = ['two-sum', 'missing-number', 'move-zeroes', 'majority-element'];
  for (const q of assign1.questions) {
    const isCompleted = snehaCompletedSlugs.includes(q.slug);
    await Submission.create({
      studentId: createdStudents[4]._id,
      assignmentId: assign1._id,
      questionSlug: q.slug,
      platform: q.platform,
      status: isCompleted ? 'COMPLETED' : 'PENDING',
      solvedAt: isCompleted ? new Date(Date.now() - 3600000 * 30) : null,
      lastCheckedAt: new Date(),
    });
  }

  console.log('--- Seeding done successfully! ---');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
