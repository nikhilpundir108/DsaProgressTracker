export function normalizeObjectId(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const id = value._id ?? value.id;
    if (id && id !== value) return normalizeObjectId(id);
  }

  const normalized = value.toString();
  return normalized === '[object Object]' ? null : normalized;
}

export function isBatchInstructor(batch, userId) {
  if (!batch || !userId) return false;

  const normalizedUserId = normalizeObjectId(userId);
  if (!normalizedUserId) return false;

  const instructorIds = new Set();

  if (batch.instructorId) {
    const instructorId = normalizeObjectId(batch.instructorId);
    if (instructorId) instructorIds.add(instructorId);
  }

  if (Array.isArray(batch.instructorIds)) {
    batch.instructorIds.forEach((id) => {
      const normalizedId = normalizeObjectId(id);
      if (normalizedId) instructorIds.add(normalizedId);
    });
  }

  return instructorIds.has(normalizedUserId);
}

export function getInstructorBatchMatch(userId) {
  return {
    $or: [{ instructorId: userId }, { instructorIds: userId }],
  };
}
