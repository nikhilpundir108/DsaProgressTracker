import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export function createAuthSessionResponse(user, message = 'Login successful') {
  const token = signToken({
    id: user._id,
    email: user.email,
    role: user.role,
    instructorId: user.instructorId,
  });
  const userData = user.toObject();
  delete userData.password;

  const response = NextResponse.json({
    success: true,
    message,
    user: userData,
  });

  response.cookies.set('dsatrack_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}