import { NextResponse } from 'next/server';
import { fetchLeetCodeData } from '@/lib/platforms/leetcode';
import { fetchGFGData } from '@/lib/platforms/gfg';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { platform, handle } = await req.json();

    if (!platform || !handle) {
      return NextResponse.json({ error: 'Platform and handle are required' }, { status: 400 });
    }

    const cleanHandle = handle.trim();

    if (platform.toUpperCase() === 'LEETCODE') {
      const data = await fetchLeetCodeData(cleanHandle);
      return NextResponse.json({
        success: true,
        platform: 'LEETCODE',
        handle: cleanHandle,
        data,
      });
    } else if (platform.toUpperCase() === 'GFG') {
      const data = await fetchGFGData(cleanHandle);
      return NextResponse.json({
        success: true,
        platform: 'GFG',
        handle: cleanHandle,
        data,
      });
    } else {
      return NextResponse.json({ error: 'Platform must be LEETCODE or GFG' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verify handle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
