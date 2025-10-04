import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { verifyFirebaseToken } from '@/lib/auth';
import { UserProfile, UpdateProfileRequest } from '@/lib/types';
import { createDefaultProfile, validatePersonalInfo, updatePersonalInfo, sanitizeProfileForPublic } from '@/lib/profile';
import { rateLimit } from '@/lib/security';

const db = admin.firestore();

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || 'unknown';
    if (!rateLimit(clientIp, 'profile_get', 100)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile from Firestore
    const profileDoc = await db.collection('userProfiles').doc(user.uid).get();
    
    if (!profileDoc.exists) {
      // Create default profile for new users
      const defaultProfile = createDefaultProfile(user.uid, user.email || '', user.displayName);
      await db.collection('userProfiles').doc(user.uid).set(defaultProfile);
      return NextResponse.json({ profile: defaultProfile });
    }

    const profile = profileDoc.data() as UserProfile;
    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || 'unknown';
    if (!rateLimit(clientIp, 'profile_update', 20)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateProfileRequest = await request.json();
    
    // Validate personal info if provided
    if (body.personalInfo) {
      const errors = validatePersonalInfo(body.personalInfo);
      if (errors.length > 0) {
        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
      }
    }

    // Get current profile
    const profileDoc = await db.collection('userProfiles').doc(user.uid).get();
    let profile: UserProfile;
    
    if (!profileDoc.exists) {
      // Create new profile
      profile = createDefaultProfile(user.uid, user.email || '', user.displayName);
    } else {
      profile = profileDoc.data() as UserProfile;
    }

    // Update profile
    const updatedProfile: UserProfile = {
      ...profile,
      personalInfo: body.personalInfo ? updatePersonalInfo(profile.personalInfo, body.personalInfo) : profile.personalInfo,
      preferences: body.preferences ? { ...profile.preferences, ...body.preferences } : profile.preferences,
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    await db.collection('userProfiles').doc(user.uid).set(updatedProfile, { merge: true });

    // Update Firebase Auth profile if needed
    if (body.personalInfo?.displayName || body.personalInfo?.firstName || body.personalInfo?.lastName) {
      try {
        const displayName = body.personalInfo.displayName || 
          `${body.personalInfo.firstName || profile.personalInfo.firstName} ${body.personalInfo.lastName || profile.personalInfo.lastName}`.trim();
        
        await admin.auth().updateUser(user.uid, {
          displayName: displayName
        });
      } catch (authError) {
        console.warn('Failed to update Firebase Auth profile:', authError);
      }
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
