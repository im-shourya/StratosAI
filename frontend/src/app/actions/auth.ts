'use server';

import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    // Forward to NestJS API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      return { success: false, error: 'Invalid credentials' };
    }

    const data = await res.json();
    
    // Store JWT in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('stratos_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return { success: true };
  } catch (err) {
    console.error('Login action failed:', err);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('stratos_token');
  return { success: true };
}
