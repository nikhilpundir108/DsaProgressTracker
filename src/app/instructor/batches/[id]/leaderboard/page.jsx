'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BatchLeaderboardRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/instructor/batches/${params.id}?tab=leaderboard`);
  }, [router, params.id]);
  return null;
}
