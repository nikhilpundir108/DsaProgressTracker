import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
