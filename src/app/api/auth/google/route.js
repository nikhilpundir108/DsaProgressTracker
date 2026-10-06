import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { signToken, isAllowedStudentEmail } from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, name, googleId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required for Google login' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check college domain restriction
    if (!isAllowedStudentEmail(cleanEmail)) {
      return NextResponse.json(
        {
          error: 'Access Restricted. Please login using your official @mit.ac.in or @miet.ac.in Google account.',
          restrictedDomain: true,
        },
        { status: 403 }
      );
    }

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // First time Google student login - create student account
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'STUDENT',
        googleId: googleId || `google_${Date.now()}`,
        isActive: true,
        isProfileComplete: false,
      });
    } else {
      // If user exists, verify they are student or allow login
      if (user.role !== 'STUDENT') {
        return NextResponse.json(
          { error: 'This email is registered with an instructor or admin account. Please use ID/Password login.' },
          { status: 403 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Your student account has been deactivated. Please contact the administrator.' },
          { status: 403 }
        );
      }

      if (googleId && !user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    const userObj = user.toObject();
    delete userObj.password;

    const response = NextResponse.json({
      success: true,
      message: 'Google login successful',
      token,
      user: userObj,
    });

    response.cookies.set('dsatrack_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({ error: 'Server error during Google auth: ' + error.message }, { status: 500 });
  }
}
