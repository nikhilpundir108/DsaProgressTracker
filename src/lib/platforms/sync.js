import dbConnect from '../db';
import User from '../models/User';
import Batch from '../models/Batch';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import { fetchLeetCodeData } from './leetcode';
import { fetchGFGData } from './gfg';

/**
 * Normalizes question title / slug for fuzzy comparison
 */
function normalizeSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Syncs a single student's LeetCode and GFG data with their assigned questions
 */
export async function syncStudentData(studentId) {
  await dbConnect();

  const student = await User.findById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new Error('Student not found');
  }

  const updates = {};
  const allSolvedSlugs = new Set();
  const solvedTimestampMap = new Map(); // slug -> Date

  // 1. Fetch LeetCode Data
  if (student.leetcodeHandle) {
    try {
      const lcData = await fetchLeetCodeData(student.leetcodeHandle);
      if (lcData && lcData.success) {
        updates.leetcodeStats = {
          totalSolved: lcData.totalSolved,
          easySolved: lcData.easySolved,
          mediumSolved: lcData.mediumSolved,
          hardSolved: lcData.hardSolved,
          ranking: lcData.ranking,
          contestRating: lcData.contestRating,
          recentSubmissions: lcData.recentSubmissions || [],
          lastFetched: new Date(),
        };

        // Collect solved slugs
        (lcData.recentSubmissions || []).forEach((sub) => {
          const norm = normalizeSlug(sub.slug || sub.title);
          allSolvedSlugs.add(norm);
          if (sub.timestamp) {
            solvedTimestampMap.set(norm, new Date(sub.timestamp));
          }
        });
      }
    } catch (e) {
      console.error(`Error syncing LeetCode for student ${student._id}:`, e.message);
    }
  }

  // 2. Fetch GFG Data
  if (student.gfgHandle) {
    try {
      const gfgData = await fetchGFGData(student.gfgHandle);
      if (gfgData && gfgData.success) {
        updates.gfgStats = {
          totalSolved: gfgData.totalSolved,
          easySolved: gfgData.easySolved,
          mediumSolved: gfgData.mediumSolved,
          hardSolved: gfgData.hardSolved,
          basicSolved: gfgData.basicSolved || 0,
          schoolSolved: gfgData.schoolSolved || 0,
          codingScore: gfgData.codingScore,
          totalActiveDays: gfgData.totalActiveDays || 0,
          totalContests: gfgData.totalContests || 0,
          currentRating: gfgData.currentRating || null,
          maxRating: gfgData.maxRating || null,
          rank: gfgData.rank || null,
          badgesCount: gfgData.badgesCount || 0,
          recentSubmissions: gfgData.recentSubmissions || [],
          lastFetched: new Date(),
        };

        (gfgData.recentSubmissions || []).forEach((sub) => {
          if (sub.slug) allSolvedSlugs.add(normalizeSlug(sub.slug));
          if (sub.title) allSolvedSlugs.add(normalizeSlug(sub.title));
          const norm = normalizeSlug(sub.slug || sub.title);
          if (sub.timestamp) {
            solvedTimestampMap.set(norm, new Date(sub.timestamp));
            if (sub.title) solvedTimestampMap.set(normalizeSlug(sub.title), new Date(sub.timestamp));
          }
        });
      }
    } catch (e) {
      console.error(`Error syncing GFG for student ${student._id}:`, e.message);
    }
  }

  // Update student stats in DB
  if (Object.keys(updates).length > 0) {
    await User.findByIdAndUpdate(studentId, { $set: updates });
  }

  // 3. Find all batches where student is enrolled
  const enrolledBatches = await Batch.find({ students: studentId });
  const batchIds = enrolledBatches.map((b) => b._id);

  if (batchIds.length === 0) {
    return {
      success: true,
      message: 'Student coding stats synced (No enrolled batches)',
      updatedCount: 0,
    };
  }

  // 4. Find all assignments for these batches
  const assignments = await Assignment.find({ batchId: { $in: batchIds } });

  let updatedSubmissionsCount = 0;

  for (const assignment of assignments) {
    const deadline = new Date(assignment.deadline);

    for (const question of assignment.questions) {
      const qNorm = normalizeSlug(question.slug || question.title);
      const isSolved = allSolvedSlugs.has(qNorm);

      let existingSub = await Submission.findOne({
        studentId: student._id,
        assignmentId: assignment._id,
        questionSlug: question.slug || question.title,
      });

      if (!existingSub) {
        // Create initial submission state
        let status = 'PENDING';
        let solvedAt = null;

        if (isSolved) {
          solvedAt = solvedTimestampMap.get(qNorm) || new Date();
          status = solvedAt > deadline ? 'LATE' : 'COMPLETED';
        }

        await Submission.create({
          studentId: student._id,
          assignmentId: assignment._id,
          questionSlug: question.slug || question.title,
          platform: question.platform,
          status,
          solvedAt,
          lastCheckedAt: new Date(),
        });
        updatedSubmissionsCount++;
      } else {
        // Update existing if newly solved
        if (existingSub.status === 'PENDING' && isSolved) {
          const solvedAt = solvedTimestampMap.get(qNorm) || new Date();
          existingSub.status = solvedAt > deadline ? 'LATE' : 'COMPLETED';
          existingSub.solvedAt = solvedAt;
          existingSub.lastCheckedAt = new Date();
          await existingSub.save();
          updatedSubmissionsCount++;
        } else {
          existingSub.lastCheckedAt = new Date();
          await existingSub.save();
        }
      }
    }
  }

  return {
    success: true,
    message: 'Progress successfully synchronized',
    updatedCount: updatedSubmissionsCount,
  };
}

/**
 * Syncs all students in a batch
 */
export async function syncBatchData(batchId) {
  await dbConnect();
  const batch = await Batch.findById(batchId);
  if (!batch) throw new Error('Batch not found');

  const results = [];
  for (const studentId of batch.students) {
    try {
      const res = await syncStudentData(studentId);
      results.push({ studentId, ...res });
    } catch (e) {
      results.push({ studentId, error: e.message });
    }
  }

  return results;
}
