'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BatchProgressRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/instructor/batches/${params.id}?tab=progress`);
  }, [router, params.id]);
  return null;
}
