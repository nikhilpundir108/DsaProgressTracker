import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { syncStudentData } from '@/lib/platforms/sync';

export const dynamic = 'force-dynamic';

// GET student profile
export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(currentUser._id).select('-password').lean();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update student profile
export async function PUT(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const user = await User.findById(currentUser._id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.name) user.name = body.name.trim();
    if (body.collegeRollNo !== undefined) user.collegeRollNo = body.collegeRollNo.trim().toUpperCase();
    if (body.branch !== undefined) user.branch = body.branch.trim().toUpperCase();
    if (body.section !== undefined) user.section = body.section.trim().toUpperCase();
    if (body.graduationYear !== undefined) user.graduationYear = String(body.graduationYear).trim();

    let handlesChanged = false;
    if (body.leetcodeHandle !== undefined) {
      const cleanLc = body.leetcodeHandle.trim();
      if (cleanLc !== user.leetcodeHandle) {
        user.leetcodeHandle = cleanLc;
        handlesChanged = true;
      }
    }

    if (body.gfgHandle !== undefined) {
      const cleanGfg = body.gfgHandle.trim();
      if (cleanGfg !== user.gfgHandle) {
        user.gfgHandle = cleanGfg;
        handlesChanged = true;
      }
    }

    // Check if profile is complete
    if (user.name && user.collegeRollNo && user.branch && user.section) {
      user.isProfileComplete = true;
    }

    await user.save();

    // If handles updated, trigger asynchronous sync in background
    if (handlesChanged && (user.leetcodeHandle || user.gfgHandle)) {
      syncStudentData(user._id).catch((err) => console.warn('Background sync error:', err.message));
    }

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userObj,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
