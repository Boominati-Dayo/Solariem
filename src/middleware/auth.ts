import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { UserService } from '@/lib/auth/user';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: { id: string; email: string; isAdmin: boolean };
  error?: string;
}> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return { success: false, error: 'No authentication token provided' };
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // Get user from database to ensure they still exist and are active
    const user = await UserService.getUserById(payload.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated' };
    }

    return {
      success: true,
      user: {
        id: user._id!.toString(),
        email: user.email,
        isAdmin: user.isAdmin
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export function requireAuth(handler: (request: AuthenticatedRequest, context: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context: any) => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    (request as AuthenticatedRequest).user = authResult.user;

    return handler(request as AuthenticatedRequest, context);
  };
}

export function requireAdmin(handler: (request: AuthenticatedRequest, context: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context: any) => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    if (!authResult.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    (request as AuthenticatedRequest).user = authResult.user;

    return handler(request as AuthenticatedRequest, context);
  };
}
