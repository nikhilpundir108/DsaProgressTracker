'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BatchRequestsRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/instructor/batches/${params.id}?tab=requests`);
  }, [router, params.id]);
  return null;
}
