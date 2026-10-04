import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';
import { requireStaff } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  // Check if user is already authenticated as staff via session cookie
  const auth = await requireStaff(request);
  if (auth.authorized) {
    return NextResponse.json({
      success: true,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        name: auth.user.name,
        role: auth.user.role,
      },
    });
  }
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Check staff session first
    const auth = await requireStaff(request);
    if (auth.authorized) {
      return NextResponse.json({
        success: true,
        message: 'Authenticated via staff session',
        user: {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.name,
          role: auth.user.role,
        },
      });
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Incorrect admin password. Please check your credentials.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
    });
  } catch (error) {
    console.error('POST /api/admin/verify error:', error);
    return NextResponse.json(
      { error: 'Server authentication verification failed' },
      { status: 500 }
    );
  }
}
