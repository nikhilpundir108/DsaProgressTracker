'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

async function postAuthRequest(path, payload, fallbackMessage) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Cannot reach the DSATrack server. Make sure npm run dev is running, then retry.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The DSATrack server returned an invalid response. Check its terminal for errors.');
  }

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return data.user;
        }
      }
      setUser(null);
      return null;
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (identifier, password, role) => {
    const data = await postAuthRequest('/api/auth/login', { identifier, password, role }, 'Login failed');

    setUser(data.user);

    if (data.user.role === 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
    } else if (data.user.role === 'INSTRUCTOR') {
      router.push('/instructor/dashboard');
    } else if (data.user.role === 'STUDENT') {
      if (!data.user.isProfileComplete) {
        router.push('/student/profile/setup');
      } else {
        router.push('/student/dashboard');
      }
    }
    return data;
  };

  const registerSuperAdmin = async ({ name, email, password, registrationKey }) => {
    const data = await postAuthRequest(
      '/api/auth/register-super-admin',
      { name, email, password, registrationKey },
      'Super Admin registration failed'
    );

    setUser(data.user);
    router.push('/admin/dashboard');
    return data;
  };

  const register = async ({ name, email, password }) => {
    const data = await postAuthRequest('/api/auth/register', { name, email, password }, 'Registration failed');

    if (data.user) {
      setUser(data.user);
      router.push(data.user.isProfileComplete ? '/student/dashboard' : '/student/profile/setup');
    }
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    return await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerSuperAdmin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
