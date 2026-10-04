import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, comparePassword, hashPassword } from '@/lib/auth';
import { getUserById, updateUser, updateUserPassword } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        country: user.country,
        avatar: user.avatar,
        status: user.status,
        email_verified_at: user.email_verified_at,
        created_at: user.created_at,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Auth me GET error:', err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, country, avatar, currentPassword, newPassword } = body;

    // Handle profile info update
    const updateData: { name?: string; country?: string; avatar?: string } = {};

    if (typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }
    if (typeof country === 'string' && country.trim().length > 0) {
      updateData.country = country.trim();
    }
    if (typeof avatar === 'string') {
      updateData.avatar = avatar.trim();
    }

    if (Object.keys(updateData).length > 0) {
      await updateUser(currentUser.id, updateData);
    }

    // Handle password change if requested
    if (newPassword) {
      if (String(newPassword).length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 400 }
        );
      }

      // Fetch fresh user record with password_hash
      const dbUser = await getUserById(currentUser.id);
      if (dbUser?.password_hash) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Current password is required to set a new password.' },
            { status: 400 }
          );
        }
        const matches = await comparePassword(String(currentPassword), dbUser.password_hash);
        if (!matches) {
          return NextResponse.json(
            { error: 'Current password does not match.' },
            { status: 400 }
          );
        }
      }

      const newHash = await hashPassword(String(newPassword));
      await updateUserPassword(currentUser.id, newHash);
    }

    const updatedUser = await getUserById(currentUser.id);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role,
        country: updatedUser?.country,
        avatar: updatedUser?.avatar,
        status: updatedUser?.status,
        email_verified_at: updatedUser?.email_verified_at,
        created_at: updatedUser?.created_at,
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Auth me PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
