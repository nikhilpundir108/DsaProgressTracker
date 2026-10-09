import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';

export async function ensureLegacyInstructorOwnership() {
  const legacyOwner = await User.findOne({ role: 'SUPER_ADMIN' })
    .sort({ createdAt: 1, _id: 1 })
    .select('_id')
    .lean();

  if (!legacyOwner) return;

  await User.updateMany(
    {
      role: 'INSTRUCTOR',
      $or: [{ ownerSuperAdminId: { $exists: false } }, { ownerSuperAdminId: null }],
    },
    { $set: { ownerSuperAdminId: legacyOwner._id } }
  );
}

export async function getOwnedInstructorIds(superAdminId) {
  await ensureLegacyInstructorOwnership();
  return User.distinct('_id', { role: 'INSTRUCTOR', ownerSuperAdminId: superAdminId });
}

export async function getOwnedBatchIds(superAdminId) {
  const instructorIds = await getOwnedInstructorIds(superAdminId);
  if (instructorIds.length === 0) return [];

  const batches = await Batch.find({
    isArchived: { $ne: true },
    $or: [{ instructorId: { $in: instructorIds } }, { instructorIds: { $in: instructorIds } }],
  })
    .select('_id')
    .lean();

  return batches.map((batch) => batch._id);
}

export async function isOwnedBatch(superAdminId, batchId) {
  const instructorIds = await getOwnedInstructorIds(superAdminId);
  if (instructorIds.length === 0) return false;

  return Boolean(
    await Batch.exists({
      _id: batchId,
      isArchived: { $ne: true },
      $or: [{ instructorId: { $in: instructorIds } }, { instructorIds: { $in: instructorIds } }],
    })
  );
}