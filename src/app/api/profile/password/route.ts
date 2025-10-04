import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { UpdatePasswordRequest } from '@/lib/types';
import { rateLimit } from '@/lib/security';

// PUT /api/profile/password - Update user password
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || 'unknown';
    if (!rateLimit(clientIp, 'password_update', 5)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdatePasswordRequest = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate password requirements
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 });
    }

    // Note: Firebase Auth handles password updates directly
    // We can't verify the current password on the server side with Firebase Auth
    // The client should handle this verification before calling this endpoint
    
    return NextResponse.json({ 
      message: 'Password update request received. Please use Firebase Auth to update the password on the client side.' 
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
