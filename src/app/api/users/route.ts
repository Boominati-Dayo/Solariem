import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/lib/auth/user';

export const GET = requireAdmin(async (request: AuthenticatedRequest, context: any) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim() || '';
    const limit = Number(url.searchParams.get('limit') || 0);

    const allUsers = await UserService.getAllUsers();

    let users = allUsers;
    if (search) {
      const q = search.toLowerCase();
      users = allUsers.filter((u: any) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.firstName || '').toLowerCase().includes(q) ||
        (u.lastName || '').toLowerCase().includes(q) ||
        (u.userCode || '').toLowerCase().includes(q)
      );
    }

    if (limit > 0) users = users.slice(0, limit);

    const safeUsers = users.map((u: any) => {
      const { password: _p, emailVerificationToken: _ev, passwordResetToken: _pr, ...rest } = u;
      return rest;
    });

    return NextResponse.json({
      success: true,
      data: safeUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users'
      },
      { status: 500 }
    );
  }
});
