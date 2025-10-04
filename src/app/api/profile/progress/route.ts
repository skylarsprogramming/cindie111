import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { verifyFirebaseToken } from '@/lib/auth';
import { LearningProgress, SkillsProgress } from '@/lib/types';
import { updateLearningProgress, calculateOverallProgress, determineLevel } from '@/lib/profile';
import { rateLimit } from '@/lib/security';

const db = admin.firestore();

// GET /api/profile/progress - Get user learning progress
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || 'unknown';
    if (!rateLimit(clientIp, 'progress_get', 50)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const profileDoc = await db.collection('userProfiles').doc(user.uid).get();
    
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileDoc.data();
    const progress = profile?.learningProgress;

    if (!progress) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    // Calculate additional metrics
    const overallProgress = calculateOverallProgress(progress.skillsProgress);
    const currentLevel = determineLevel(overallProgress);

    return NextResponse.json({
      progress: {
        ...progress,
        currentLevel,
        overallProgress
      }
    });

  } catch (error) {
    console.error('Error getting progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile/progress - Update user learning progress
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || 'unknown';
    if (!rateLimit(clientIp, 'progress_update', 100)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<LearningProgress> = await request.json();

    // Get current profile
    const profileDoc = await db.collection('userProfiles').doc(user.uid).get();
    
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileDoc.data();
    const currentProgress = profile?.learningProgress;

    if (!currentProgress) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    // Update progress
    const updatedProgress = updateLearningProgress(currentProgress, body);

    // Save to Firestore
    await db.collection('userProfiles').doc(user.uid).update({
      learningProgress: updatedProgress,
      updatedAt: new Date().toISOString()
    });

    // Calculate additional metrics
    const overallProgress = calculateOverallProgress(updatedProgress.skillsProgress);
    const currentLevel = determineLevel(overallProgress);

    return NextResponse.json({
      message: 'Progress updated successfully',
      progress: {
        ...updatedProgress,
        currentLevel,
        overallProgress
      }
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profile/progress/lesson-completed - Record lesson completion
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || 'unknown';
    if (!rateLimit(clientIp, 'lesson_complete', 200)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Verify authentication
    const user = await verifyFirebaseToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, courseId, timeSpent, skillsImproved } = body;

    if (!lessonId || !courseId) {
      return NextResponse.json({ error: 'Lesson ID and Course ID are required' }, { status: 400 });
    }

    // Get current profile
    const profileDoc = await db.collection('userProfiles').doc(user.uid).get();
    
    if (!profileDoc.exists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileDoc.data();
    const currentProgress = profile?.learningProgress;

    if (!currentProgress) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    // Update progress
    const updatedProgress = {
      ...currentProgress,
      totalLessonsCompleted: currentProgress.totalLessonsCompleted + 1,
      totalStudyTime: currentProgress.totalStudyTime + (timeSpent || 0),
      skillsProgress: skillsImproved ? {
        ...currentProgress.skillsProgress,
        ...skillsImproved
      } : currentProgress.skillsProgress,
      completedCourses: currentProgress.completedCourses.includes(courseId) 
        ? currentProgress.completedCourses 
        : [...currentProgress.completedCourses, courseId],
      lastActivityAt: new Date().toISOString()
    };

    // Calculate streak (simplified - consecutive days with activity)
    const today = new Date().toDateString();
    const lastActivity = new Date(currentProgress.lastActivityAt).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastActivity === yesterday) {
      updatedProgress.streak = currentProgress.streak + 1;
    } else if (lastActivity !== today) {
      updatedProgress.streak = 1;
    }

    const finalProgress = updateLearningProgress(currentProgress, updatedProgress);

    // Save to Firestore
    await db.collection('userProfiles').doc(user.uid).update({
      learningProgress: finalProgress,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Lesson completion recorded successfully',
      progress: finalProgress
    });

  } catch (error) {
    console.error('Error recording lesson completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
