'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BatchStudentsRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.replace(`/instructor/batches/${params.id}?tab=students`);
  }, [router, params.id]);
  return null;
}
