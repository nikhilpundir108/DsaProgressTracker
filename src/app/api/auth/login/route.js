import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const { identifier, password, role } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please provide identifier/email and password' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();

    // Query user by email OR instructorId
    const query = {
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { instructorId: cleanIdentifier.toUpperCase() },
        { instructorId: cleanIdentifier },
      ],
    };

    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid password. Please try again.' }, { status: 401 });
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      instructorId: user.instructorId,
    });

    const userObj = user.toObject();
    delete userObj.password;

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('dsatrack_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error during login: ' + error.message }, { status: 500 });
  }
}
